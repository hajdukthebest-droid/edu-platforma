import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

class LearningAnalyticsService {
  /**
   * Predict course completion probability for a user
   * Based on current progress and historical patterns
   */
  async predictCompletionProbability(
    userId: string,
    courseId: string
  ): Promise<{
    probability: number
    estimatedDaysToComplete: number | null
    riskLevel: 'low' | 'medium' | 'high'
    recommendations: string[]
  }> {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    if (!enrollment) {
      return {
        probability: 0,
        estimatedDaysToComplete: null,
        riskLevel: 'high',
        recommendations: ['Enroll in the course first'],
      }
    }

    // Calculate days since started
    const daysSinceStart = Math.floor(
      (Date.now() - enrollment.startedAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    const currentProgress = enrollment.progress

    // Calculate user's historical completion rate
    const userHistory = await prisma.enrollment.findMany({
      where: {
        userId,
        startedAt: {
          lt: enrollment.startedAt,
        },
      },
    })

    const historicalCompletionRate =
      userHistory.length > 0
        ? userHistory.filter((e) => e.progress === 100).length / userHistory.length
        : 0.5

    // Calculate progress velocity (progress per day)
    const progressVelocity =
      daysSinceStart > 0 ? currentProgress / daysSinceStart : 0

    // Calculate last activity recency
    const lastActivity = enrollment.lastAccessedAt || enrollment.startedAt
    const daysSinceLastActivity = Math.floor(
      (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Prediction algorithm
    let probability = 0

    // Factor 1: Current progress (40%)
    probability += (currentProgress / 100) * 0.4

    // Factor 2: Historical completion rate (25%)
    probability += historicalCompletionRate * 0.25

    // Factor 3: Activity recency (20%)
    const activityScore = Math.max(0, 1 - daysSinceLastActivity / 30)
    probability += activityScore * 0.2

    // Factor 4: Progress velocity (15%)
    const velocityScore = Math.min(1, progressVelocity / 2) // Normalize to max 2% per day
    probability += velocityScore * 0.15

    probability = Math.max(0, Math.min(1, probability)) // Clamp to [0, 1]

    // Estimate days to complete
    let estimatedDaysToComplete: number | null = null
    if (progressVelocity > 0 && currentProgress < 100) {
      const remainingProgress = 100 - currentProgress
      estimatedDaysToComplete = Math.ceil(remainingProgress / progressVelocity)
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    if (probability < 0.3) riskLevel = 'high'
    else if (probability < 0.6) riskLevel = 'medium'

    // Generate recommendations
    const recommendations: string[] = []
    if (daysSinceLastActivity > 7) {
      recommendations.push('Resume your learning - it has been a while!')
    }
    if (progressVelocity < 0.5) {
      recommendations.push('Try to dedicate more time each day to improve progress')
    }
    if (currentProgress < 20 && daysSinceStart > 14) {
      recommendations.push('Set a study schedule to build momentum')
    }
    if (probability < 0.5) {
      recommendations.push('Join study groups or forum discussions for motivation')
    }

    return {
      probability: Math.round(probability * 100) / 100,
      estimatedDaysToComplete,
      riskLevel,
      recommendations,
    }
  }

  /**
   * Predict user's quiz/assessment performance
   */
  async predictAssessmentPerformance(userId: string, quizId: string): Promise<{
    predictedScore: number
    confidence: number
    suggestedPreparation: string[]
  }> {
    // Get user's historical quiz performance
    const userAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        completedAt: { not: null },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 10,
    })

    if (userAttempts.length === 0) {
      return {
        predictedScore: 70, // Default expectation
        confidence: 0.3,
        suggestedPreparation: [
          'Review course materials thoroughly',
          'Take practice quizzes if available',
          'Focus on key concepts',
        ],
      }
    }

    // Calculate average historical performance
    const avgScore =
      userAttempts.reduce((sum, a) => sum + a.score, 0) / userAttempts.length

    // Calculate trend (improving or declining)
    const recent3Avg =
      userAttempts.length >= 3
        ? userAttempts
            .slice(0, 3)
            .reduce((sum, a) => sum + a.score, 0) / 3
        : avgScore

    const older3Avg =
      userAttempts.length >= 6
        ? userAttempts
            .slice(3, 6)
            .reduce((sum, a) => sum + a.score, 0) / 3
        : avgScore

    const trend = recent3Avg - older3Avg

    // Predict score (historical avg + trend adjustment)
    let predictedScore = avgScore + trend * 0.5
    predictedScore = Math.max(0, Math.min(100, predictedScore))

    // Confidence based on data consistency
    const scores = userAttempts.map((a) => a.score)
    const variance = this.calculateVariance(scores)
    const confidence = Math.max(0.3, 1 - variance / 1000) // Normalize variance

    const suggestedPreparation: string[] = []

    if (predictedScore < 60) {
      suggestedPreparation.push(
        'Spend extra time reviewing fundamental concepts'
      )
      suggestedPreparation.push('Consider re-watching lecture videos')
    } else if (predictedScore < 80) {
      suggestedPreparation.push('Review key topics and practice problems')
    }

    if (trend < -5) {
      suggestedPreparation.push('Your performance is declining - take a break or adjust study methods')
    }

    if (userAttempts.length < 3) {
      suggestedPreparation.push('More practice needed to improve consistency')
    }

    return {
      predictedScore: Math.round(predictedScore),
      confidence: Math.round(confidence * 100) / 100,
      suggestedPreparation,
    }
  }

  /**
   * Analyze learning patterns and suggest optimal study times
   */
  async analyzeLearningPatterns(userId: string): Promise<{
    optimalStudyHours: number[]
    optimalStudyDays: string[]
    averageSessionDuration: number
    studyStreak: number
    insights: string[]
  }> {
    // Get user's lesson progress history
    const progressHistory = await prisma.lessonProgress.findMany({
      where: { userId },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 100,
    })

    if (progressHistory.length === 0) {
      return {
        optimalStudyHours: [],
        optimalStudyDays: [],
        averageSessionDuration: 0,
        studyStreak: 0,
        insights: ['Start learning to build your study pattern'],
      }
    }

    // Analyze study hours
    const hourActivity = new Map<number, number>()
    const dayActivity = new Map<string, number>()

    for (const progress of progressHistory) {
      const hour = progress.updatedAt.getHours()
      const day = progress.updatedAt.toLocaleDateString('en-US', { weekday: 'long' })

      hourActivity.set(hour, (hourActivity.get(hour) || 0) + 1)
      dayActivity.set(day, (dayActivity.get(day) || 0) + 1)
    }

    // Find top 3 hours
    const optimalStudyHours = Array.from(hourActivity.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0])

    // Find top 3 days
    const optimalStudyDays = Array.from(dayActivity.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0])

    // Calculate average session duration (simplified - based on time between activities)
    let totalSessionMinutes = 0
    let sessionCount = 0

    for (let i = 1; i < progressHistory.length; i++) {
      const timeDiff =
        progressHistory[i - 1].updatedAt.getTime() -
        progressHistory[i].updatedAt.getTime()
      const minutesDiff = timeDiff / (1000 * 60)

      // If activities within 2 hours, consider it same session
      if (minutesDiff < 120) {
        totalSessionMinutes += minutesDiff
        sessionCount++
      }
    }

    const averageSessionDuration =
      sessionCount > 0 ? Math.round(totalSessionMinutes / sessionCount) : 0

    // Calculate study streak (consecutive days)
    const studyStreak = this.calculateStudyStreak(progressHistory)

    // Generate insights
    const insights: string[] = []

    if (optimalStudyHours.length > 0) {
      insights.push(
        `You're most productive around ${optimalStudyHours[0]}:00 - ${optimalStudyHours[0]}:59`
      )
    }

    if (averageSessionDuration < 15) {
      insights.push(
        'Try longer study sessions (30-45 min) for better retention'
      )
    } else if (averageSessionDuration > 90) {
      insights.push('Consider taking short breaks during long study sessions')
    }

    if (studyStreak >= 7) {
      insights.push(`Great job! You're on a ${studyStreak}-day study streak!`)
    } else if (studyStreak === 0) {
      insights.push('Build a study habit by learning a little each day')
    }

    return {
      optimalStudyHours,
      optimalStudyDays,
      averageSessionDuration,
      studyStreak,
      insights,
    }
  }

  /**
   * Calculate knowledge retention score
   */
  async calculateRetentionScore(userId: string, courseId: string): Promise<{
    retentionScore: number
    retentionTrend: 'improving' | 'stable' | 'declining'
    reviewRecommendations: string[]
  }> {
    // Get quiz attempts for this course
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
                  where: {
                    type: 'QUIZ',
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!enrollment) {
      return {
        retentionScore: 0,
        retentionTrend: 'stable',
        reviewRecommendations: [],
      }
    }

    // Get all quiz attempts for course quizzes
    const quizIds = enrollment.course.modules
      .flatMap((m) => m.lessons)
      .map((l) => l.id)

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        quiz: {
          lessonId: {
            in: quizIds,
          },
        },
        completedAt: { not: null },
      },
      orderBy: {
        completedAt: 'asc',
      },
    })

    if (attempts.length === 0) {
      return {
        retentionScore: 50,
        retentionTrend: 'stable',
        reviewRecommendations: ['Complete quizzes to track retention'],
      }
    }

    // Calculate retention based on quiz scores over time
    const retentionScore =
      attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length

    // Determine trend
    const recent = attempts.slice(-3)
    const older = attempts.slice(0, -3)

    let retentionTrend: 'improving' | 'stable' | 'declining' = 'stable'

    if (older.length > 0 && recent.length > 0) {
      const recentAvg = recent.reduce((sum, a) => sum + a.score, 0) / recent.length
      const olderAvg = older.reduce((sum, a) => sum + a.score, 0) / older.length

      if (recentAvg > olderAvg + 5) retentionTrend = 'improving'
      else if (recentAvg < olderAvg - 5) retentionTrend = 'declining'
    }

    const reviewRecommendations: string[] = []

    if (retentionScore < 70) {
      reviewRecommendations.push('Review course materials regularly')
      reviewRecommendations.push('Take notes and create summaries')
    }

    if (retentionTrend === 'declining') {
      reviewRecommendations.push(
        'Revisit earlier lessons to refresh your memory'
      )
      reviewRecommendations.push('Use spaced repetition techniques')
    }

    // Check for old attempts that need review
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const oldAttempts = attempts.filter(
      (a) => a.completedAt && a.completedAt < thirtyDaysAgo
    )

    if (oldAttempts.length > 0) {
      reviewRecommendations.push('Retake older quizzes to reinforce learning')
    }

    return {
      retentionScore: Math.round(retentionScore),
      retentionTrend,
      reviewRecommendations,
    }
  }

  /**
   * Helper: Calculate variance
   */
  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0

    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length
    const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2))
    return squaredDiffs.reduce((sum, d) => sum + d, 0) / numbers.length
  }

  /**
   * Helper: Calculate study streak (consecutive days with activity)
   */
  private calculateStudyStreak(progressHistory: any[]): number {
    if (progressHistory.length === 0) return 0

    const uniqueDays = new Set(
      progressHistory.map((p) =>
        p.updatedAt.toISOString().split('T')[0]
      )
    )

    const sortedDays = Array.from(uniqueDays).sort().reverse()

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const day of sortedDays) {
      const dayDate = new Date(day)
      dayDate.setHours(0, 0, 0, 0)

      const dayDiff = Math.floor(
        (currentDate.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (dayDiff === streak) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  /**
   * Generate comprehensive learner profile
   */
  async generateLearnerProfile(userId: string): Promise<any> {
    const [completionStats, patterns, enrollments] = await Promise.all([
      this.getUserCompletionStats(userId),
      this.analyzeLearningPatterns(userId),
      prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            select: {
              level: true,
              category: {
                select: { name: true },
              },
            },
          },
        },
      }),
    ])

    // Determine learning style based on activity patterns
    let learningStyle = 'balanced'
    if (patterns.averageSessionDuration > 60) learningStyle = 'marathon'
    else if (patterns.averageSessionDuration < 30) learningStyle = 'sprint'

    // Determine skill level progression
    const levelProgression = enrollments.reduce((acc, e) => {
      const level = e.course.level
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {} as any)

    return {
      userId,
      learningStyle,
      studyPatterns: patterns,
      completionStats,
      skillLevelDistribution: levelProgression,
      totalCoursesEnrolled: enrollments.length,
    }
  }

  /**
   * Helper: Get user completion stats
   */
  private async getUserCompletionStats(userId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
    })

    const completed = enrollments.filter((e) => e.progress === 100)

    return {
      totalEnrollments: enrollments.length,
      completedCourses: completed.length,
      completionRate:
        enrollments.length > 0
          ? Math.round((completed.length / enrollments.length) * 100)
          : 0,
    }
  }
}

export default new LearningAnalyticsService()
