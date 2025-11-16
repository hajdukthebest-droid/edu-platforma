import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

class ContentSummarizationService {
  /**
   * Generate extractive summary from text content
   * Uses TF-IDF and sentence scoring (no AI API needed)
   */
  generateSummary(text: string, maxSentences: number = 3): string {
    if (!text || text.trim().length === 0) {
      return ''
    }

    // Split into sentences
    const sentences = this.splitIntoSentences(text)

    if (sentences.length <= maxSentences) {
      return text
    }

    // Score sentences
    const scoredSentences = this.scoreSentences(sentences)

    // Get top N sentences and maintain original order
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSentences)
      .sort((a, b) => a.index - b.index)
      .map((s) => s.sentence)

    return topSentences.join(' ')
  }

  /**
   * Extract keywords from text using TF-IDF
   */
  extractKeywords(text: string, maxKeywords: number = 10): string[] {
    if (!text || text.trim().length === 0) {
      return []
    }

    // Tokenize and filter
    const words = this.tokenize(text)
    const filteredWords = words.filter(
      (word) => word.length > 3 && !this.isStopWord(word)
    )

    // Calculate word frequency
    const wordFreq = new Map<string, number>()
    for (const word of filteredWords) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
    }

    // Sort by frequency and get top keywords
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map((entry) => entry[0])
  }

  /**
   * Generate course overview summary
   */
  async generateCourseOverview(courseId: string): Promise<any> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                type: true,
                content: true,
                videoDuration: true,
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        category: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    })

    if (!course) {
      return null
    }

    // Calculate course statistics
    const totalLessons = course.modules.reduce(
      (sum, m) => sum + m.lessons.length,
      0
    )

    const totalDuration = course.modules.reduce(
      (sum, m) =>
        sum +
        m.lessons.reduce((lessonSum, l) => lessonSum + (l.videoDuration || 0), 0),
      0
    )

    const lessonTypeBreakdown = course.modules.reduce((acc, m) => {
      m.lessons.forEach((l) => {
        acc[l.type] = (acc[l.type] || 0) + 1
      })
      return acc
    }, {} as { [key: string]: number })

    // Extract content for analysis
    const allContent = course.modules
      .flatMap((m) => m.lessons)
      .filter((l) => l.content)
      .map((l) => l.content)
      .join(' ')

    const summary =
      allContent.length > 0
        ? this.generateSummary(allContent, 5)
        : course.description || ''

    const keywords = this.extractKeywords(
      `${course.title} ${course.description || ''} ${allContent}`,
      15
    )

    return {
      courseId: course.id,
      title: course.title,
      summary,
      keywords,
      statistics: {
        totalModules: course.modules.length,
        totalLessons,
        totalDurationMinutes: Math.round(totalDuration / 60),
        lessonTypes: lessonTypeBreakdown,
        enrollmentCount: course._count.enrollments,
        reviewCount: course._count.reviews,
      },
      learningObjectives: this.extractLearningObjectives(
        course.description || ''
      ),
    }
  }

  /**
   * Generate module summary
   */
  async generateModuleSummary(moduleId: string): Promise<any> {
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            type: true,
            content: true,
            videoDuration: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    })

    if (!module) {
      return null
    }

    const allContent = module.lessons
      .filter((l) => l.content)
      .map((l) => l.content)
      .join(' ')

    const summary =
      allContent.length > 0
        ? this.generateSummary(allContent, 3)
        : module.description || ''

    const totalDuration = module.lessons.reduce(
      (sum, l) => sum + (l.videoDuration || 0),
      0
    )

    return {
      moduleId: module.id,
      title: module.title,
      summary,
      lessonCount: module.lessons.length,
      estimatedMinutes: Math.round(totalDuration / 60),
      lessonTitles: module.lessons.map((l) => l.title),
    }
  }

  /**
   * Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    // Simple sentence splitter
    return text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10)
  }

  /**
   * Score sentences based on word importance and position
   */
  private scoreSentences(
    sentences: string[]
  ): { sentence: string; score: number; index: number }[] {
    // Calculate word frequencies across all sentences
    const allWords = sentences.flatMap((s) => this.tokenize(s))
    const wordFreq = new Map<string, number>()

    for (const word of allWords) {
      if (!this.isStopWord(word) && word.length > 2) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
      }
    }

    // Score each sentence
    return sentences.map((sentence, index) => {
      const words = this.tokenize(sentence)
      let score = 0

      // TF-IDF style scoring
      for (const word of words) {
        if (!this.isStopWord(word) && wordFreq.has(word)) {
          score += wordFreq.get(word)! / allWords.length
        }
      }

      // Boost first and last sentences slightly
      if (index === 0) score *= 1.2
      if (index === sentences.length - 1) score *= 1.1

      // Boost longer sentences (more informative)
      if (words.length > 15) score *= 1.1

      return { sentence, score, index }
    })
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 0)
  }

  /**
   * Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      // English stop words
      'a',
      'an',
      'and',
      'are',
      'as',
      'at',
      'be',
      'by',
      'for',
      'from',
      'has',
      'he',
      'in',
      'is',
      'it',
      'its',
      'of',
      'on',
      'that',
      'the',
      'to',
      'was',
      'will',
      'with',
      // Croatian stop words
      'i',
      'u',
      'na',
      'da',
      'je',
      'su',
      'se',
      'za',
      'od',
      's',
      'sa',
      'o',
      'kao',
      'ali',
      'ili',
      'iz',
      'po',
      'do',
    ])

    return stopWords.has(word.toLowerCase())
  }

  /**
   * Extract learning objectives from course description
   */
  private extractLearningObjectives(description: string): string[] {
    const objectives: string[] = []

    // Look for common patterns like "you will learn", "learn to", etc.
    const patterns = [
      /you will learn (to )?([^.!?]+)/gi,
      /learn (to |how to )?([^.!?]+)/gi,
      /understand ([^.!?]+)/gi,
      /master ([^.!?]+)/gi,
      /- ([^-\n]+)/g, // Bullet points
    ]

    for (const pattern of patterns) {
      const matches = description.matchAll(pattern)
      for (const match of matches) {
        const objective = match[match.length - 1]?.trim()
        if (objective && objective.length > 10 && objective.length < 200) {
          objectives.push(objective)
        }
      }
    }

    return objectives.slice(0, 10) // Max 10 objectives
  }

  /**
   * Generate personalized learning summary for a user
   */
  async generateUserLearningSummary(userId: string): Promise<any> {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            level: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    const completed = enrollments.filter((e) => e.progress === 100)
    const inProgress = enrollments.filter(
      (e) => e.progress > 0 && e.progress < 100
    )

    // Calculate learning velocity (courses per month)
    const completedWithDates = completed.filter((e) => e.completedAt)
    let avgCompletionDays = 0

    if (completedWithDates.length > 0) {
      const totalDays = completedWithDates.reduce((sum, e) => {
        const days = Math.floor(
          (e.completedAt!.getTime() - e.startedAt.getTime()) / (1000 * 60 * 60 * 24)
        )
        return sum + days
      }, 0)
      avgCompletionDays = Math.round(totalDays / completedWithDates.length)
    }

    // Category breakdown
    const categoryBreakdown = new Map<string, number>()
    enrollments.forEach((e) => {
      const category = e.course.category?.name || 'Other'
      categoryBreakdown.set(category, (categoryBreakdown.get(category) || 0) + 1)
    })

    return {
      userId,
      totalEnrollments: enrollments.length,
      completedCourses: completed.length,
      inProgressCourses: inProgress.length,
      completionRate:
        enrollments.length > 0
          ? Math.round((completed.length / enrollments.length) * 100)
          : 0,
      averageCompletionDays: avgCompletionDays,
      categoryBreakdown: Object.fromEntries(categoryBreakdown),
      recentActivity: {
        lastEnrollment: enrollments[enrollments.length - 1]?.startedAt,
        lastCompletion: completed[completed.length - 1]?.completedAt,
      },
    }
  }
}

export default new ContentSummarizationService()
