import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

class AdaptiveLearningService {
  /**
   * Generate adaptive learning path based on user performance
   */
  async generateAdaptivePath(userId: string, courseId: string): Promise<{
    recommendedLessons: any[]
    skillGaps: string[]
    difficultyAdjustment: 'increase' | 'decrease' | 'maintain'
    personalizedTips: string[]
  }> {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: {
                    progress: {
                      where: {
                        userId,
                      },
                    },
                    quiz: true,
                  },
                  orderBy: {
                    orderIndex: 'asc',
                  },
                },
              },
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
        },
      },
    })

    if (!enrollment) {
      return {
        recommendedLessons: [],
        skillGaps: [],
        difficultyAdjustment: 'maintain',
        personalizedTips: [],
      }
    }

    // Analyze user's quiz performance
    const quizPerformance = await this.analyzeQuizPerformance(userId, courseId)

    // Identify skill gaps
    const skillGaps = this.identifySkillGaps(quizPerformance)

    // Get all lessons
    const allLessons = enrollment.course.modules.flatMap((m) => m.lessons)

    // Separate completed and pending lessons
    const completedLessons = allLessons.filter(
      (l) => l.progress.length > 0 && l.progress[0].completed
    )
    const pendingLessons = allLessons.filter(
      (l) => l.progress.length === 0 || !l.progress[0].completed
    )

    // Calculate user's average performance
    const avgQuizScore =
      quizPerformance.length > 0
        ? quizPerformance.reduce((sum, q) => sum + q.score, 0) /
          quizPerformance.length
        : 75

    // Determine difficulty adjustment
    let difficultyAdjustment: 'increase' | 'decrease' | 'maintain' = 'maintain'

    if (avgQuizScore >= 85 && quizPerformance.length >= 3) {
      difficultyAdjustment = 'increase'
    } else if (avgQuizScore < 60 && quizPerformance.length >= 2) {
      difficultyAdjustment = 'decrease'
    }

    // Recommend lessons based on performance
    const recommendedLessons = this.selectRecommendedLessons(
      pendingLessons,
      completedLessons,
      skillGaps,
      difficultyAdjustment,
      avgQuizScore
    )

    // Generate personalized tips
    const personalizedTips = this.generatePersonalizedTips(
      avgQuizScore,
      skillGaps,
      completedLessons.length,
      allLessons.length
    )

    return {
      recommendedLessons,
      skillGaps,
      difficultyAdjustment,
      personalizedTips,
    }
  }

  /**
   * Analyze quiz performance to identify weak areas
   */
  private async analyzeQuizPerformance(
    userId: string,
    courseId: string
  ): Promise<any[]> {
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        quiz: {
          lesson: {
            module: {
              courseId,
            },
          },
        },
        completedAt: { not: null },
      },
      include: {
        quiz: {
          select: {
            lessonId: true,
            lesson: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    })

    return quizAttempts.map((attempt) => ({
      lessonId: attempt.quiz.lessonId,
      lessonTitle: attempt.quiz.lesson.title,
      score: attempt.score,
      attemptedAt: attempt.completedAt,
    }))
  }

  /**
   * Identify skill gaps based on quiz performance
   */
  private identifySkillGaps(quizPerformance: any[]): string[] {
    const gaps: string[] = []

    // Group by lesson and find low-performing areas
    const performanceByLesson = new Map<string, number[]>()

    for (const perf of quizPerformance) {
      if (!performanceByLesson.has(perf.lessonId)) {
        performanceByLesson.set(perf.lessonId, [])
      }
      performanceByLesson.get(perf.lessonId)!.push(perf.score)
    }

    // Identify lessons with consistently low scores
    for (const [lessonId, scores] of performanceByLesson.entries()) {
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length

      if (avgScore < 70) {
        const lesson = quizPerformance.find((p) => p.lessonId === lessonId)
        if (lesson) {
          gaps.push(lesson.lessonTitle)
        }
      }
    }

    return gaps
  }

  /**
   * Select recommended lessons adaptively
   */
  private selectRecommendedLessons(
    pendingLessons: any[],
    completedLessons: any[],
    skillGaps: string[],
    difficultyAdjustment: 'increase' | 'decrease' | 'maintain',
    avgQuizScore: number
  ): any[] {
    const recommended: any[] = []

    // Rule 1: If user has skill gaps, recommend review lessons
    if (skillGaps.length > 0 && avgQuizScore < 70) {
      const reviewLessons = completedLessons
        .filter((l) => skillGaps.includes(l.title))
        .slice(0, 2)
        .map((l) => ({
          ...l,
          reason: 'Review recommended - strengthen weak areas',
          priority: 'high',
        }))

      recommended.push(...reviewLessons)
    }

    // Rule 2: If user is performing well, suggest advanced content
    if (difficultyAdjustment === 'increase') {
      const advancedLessons = pendingLessons
        .filter((l) => l.type === 'ASSIGNMENT' || l.type === 'INTERACTIVE')
        .slice(0, 2)
        .map((l) => ({
          ...l,
          reason: 'Challenge yourself with advanced content',
          priority: 'medium',
        }))

      recommended.push(...advancedLessons)
    }

    // Rule 3: If user is struggling, suggest foundational content
    if (difficultyAdjustment === 'decrease') {
      const foundationalLessons = pendingLessons
        .filter((l) => l.type === 'ARTICLE' || l.type === 'VIDEO')
        .slice(0, 3)
        .map((l) => ({
          ...l,
          reason: 'Build foundation with core concepts',
          priority: 'high',
        }))

      recommended.push(...foundationalLessons)
    }

    // Rule 4: Regular progression - next lessons in order
    if (recommended.length < 3) {
      const nextLessons = pendingLessons.slice(0, 5 - recommended.length).map((l) => ({
        ...l,
        reason: 'Continue your learning journey',
        priority: 'normal',
      }))

      recommended.push(...nextLessons)
    }

    // Sort by priority and return top 5
    const priorityOrder = { high: 3, medium: 2, normal: 1 }
    return recommended
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 5)
  }

  /**
   * Generate personalized learning tips
   */
  private generatePersonalizedTips(
    avgQuizScore: number,
    skillGaps: string[],
    completedCount: number,
    totalCount: number
  ): string[] {
    const tips: string[] = []

    // Performance-based tips
    if (avgQuizScore >= 90) {
      tips.push("Excellent performance! You're mastering the material.")
      tips.push('Consider exploring advanced topics or related courses.')
    } else if (avgQuizScore >= 75) {
      tips.push("Good progress! You're on the right track.")
      tips.push('Review challenging topics to boost your understanding.')
    } else if (avgQuizScore >= 60) {
      tips.push('Take time to review lessons before moving forward.')
      tips.push('Consider taking notes and creating summaries.')
    } else {
      tips.push('Revisit earlier lessons to strengthen your foundation.')
      tips.push('Reach out to instructors or join study groups for help.')
    }

    // Progress-based tips
    const progressPercent = (completedCount / totalCount) * 100

    if (progressPercent < 25) {
      tips.push('Set aside regular study time to build momentum.')
    } else if (progressPercent >= 75) {
      tips.push("You're almost there! Keep up the great work.")
    }

    // Skill gap tips
    if (skillGaps.length > 0) {
      tips.push(`Focus on: ${skillGaps.slice(0, 2).join(', ')}`)
    }

    return tips.slice(0, 4) // Max 4 tips
  }

  /**
   * Adjust lesson difficulty dynamically
   */
  async suggestDifficultyLevel(
    userId: string,
    categoryId: string
  ): Promise<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'> {
    // Get user's completed courses in this category
    const completedCourses = await prisma.enrollment.findMany({
      where: {
        userId,
        progress: 100,
        course: {
          categoryId,
        },
      },
      include: {
        course: {
          select: {
            level: true,
          },
        },
      },
    })

    if (completedCourses.length === 0) {
      return 'BEGINNER'
    }

    // Get quiz performance in this category
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        completedAt: { not: null },
        quiz: {
          lesson: {
            module: {
              course: {
                categoryId,
              },
            },
          },
        },
      },
    })

    const avgScore =
      quizAttempts.length > 0
        ? quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length
        : 70

    // Determine highest level completed
    const levels = completedCourses.map((e) => e.course.level)
    const hasCompleted = {
      BEGINNER: levels.includes('BEGINNER'),
      INTERMEDIATE: levels.includes('INTERMEDIATE'),
      ADVANCED: levels.includes('ADVANCED'),
      EXPERT: levels.includes('EXPERT'),
    }

    // Suggest next level based on performance
    if (hasCompleted.ADVANCED && avgScore >= 80) {
      return 'EXPERT'
    } else if (hasCompleted.INTERMEDIATE && avgScore >= 75) {
      return 'ADVANCED'
    } else if (hasCompleted.BEGINNER && avgScore >= 70) {
      return 'INTERMEDIATE'
    } else if (completedCourses.length > 0 && avgScore >= 65) {
      // Stay at current level or move up slightly
      return hasCompleted.BEGINNER ? 'INTERMEDIATE' : 'BEGINNER'
    }

    return 'BEGINNER'
  }

  /**
   * Generate spaced repetition schedule for lessons
   */
  async generateReviewSchedule(userId: string, courseId: string): Promise<{
    todayReviews: any[]
    upcomingReviews: any[]
    reviewIntervals: { [lessonId: string]: number }
  }> {
    const completedLessons = await prisma.lessonProgress.findMany({
      where: {
        userId,
        completed: true,
        lesson: {
          module: {
            courseId,
          },
        },
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      orderBy: {
        completedAt: 'asc',
      },
    })

    const todayReviews: any[] = []
    const upcomingReviews: any[] = []
    const reviewIntervals: { [lessonId: string]: number } = {}

    const now = new Date()

    for (const progress of completedLessons) {
      if (!progress.completedAt) continue

      const daysSinceCompletion = Math.floor(
        (now.getTime() - progress.completedAt.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Spaced repetition intervals: 1, 3, 7, 14, 30 days
      const intervals = [1, 3, 7, 14, 30]
      let nextReviewIn = 0

      for (const interval of intervals) {
        if (daysSinceCompletion >= interval) {
          nextReviewIn = interval
        } else {
          break
        }
      }

      reviewIntervals[progress.lessonId] = nextReviewIn

      // Calculate next review date
      const nextReviewDate = new Date(progress.completedAt)
      nextReviewDate.setDate(nextReviewDate.getDate() + nextReviewIn)

      const daysUntilReview = Math.floor(
        (nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysUntilReview <= 0) {
        todayReviews.push({
          lesson: progress.lesson,
          completedAt: progress.completedAt,
          daysSinceCompletion,
        })
      } else if (daysUntilReview <= 7) {
        upcomingReviews.push({
          lesson: progress.lesson,
          completedAt: progress.completedAt,
          daysUntilReview,
        })
      }
    }

    return {
      todayReviews,
      upcomingReviews: upcomingReviews.sort((a, b) => a.daysUntilReview - b.daysUntilReview),
      reviewIntervals,
    }
  }

  /**
   * Suggest optimal learning path across multiple courses
   */
  async suggestLearningPathway(userId: string, goalCategoryId: string): Promise<{
    courses: any[]
    estimatedDuration: number
    milestones: string[]
  }> {
    // Get user's current skill level in this category
    const suggestedLevel = await this.suggestDifficultyLevel(userId, goalCategoryId)

    // Find courses that match progression
    const courses = await prisma.course.findMany({
      where: {
        categoryId: goalCategoryId,
        status: 'PUBLISHED',
        enrollments: {
          none: {
            userId,
          },
        },
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    })

    // Order courses by level progression
    const levelOrder = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']
    const suggestedLevelIndex = levelOrder.indexOf(suggestedLevel)

    const orderedCourses = courses
      .filter((c) => {
        const courseLevel = levelOrder.indexOf(c.level)
        return courseLevel >= suggestedLevelIndex
      })
      .sort((a, b) => {
        const levelDiff = levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
        if (levelDiff !== 0) return levelDiff

        // Secondary sort by rating
        const avgRatingA =
          a.reviews.length > 0
            ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length
            : 0
        const avgRatingB =
          b.reviews.length > 0
            ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
            : 0

        return avgRatingB - avgRatingA
      })
      .slice(0, 5)

    // Estimate total duration (rough estimate: 20 hours per course)
    const estimatedDuration = orderedCourses.length * 20

    // Generate milestones
    const milestones = orderedCourses.map(
      (c, idx) => `${idx + 1}. Complete ${c.title} (${c.level})`
    )

    return {
      courses: orderedCourses,
      estimatedDuration,
      milestones,
    }
  }
}

export default new AdaptiveLearningService()
