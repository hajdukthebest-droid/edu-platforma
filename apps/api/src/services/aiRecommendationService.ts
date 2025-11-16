import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface RecommendationScore {
  courseId: string
  score: number
  reason: string
}

class AIRecommendationService {
  /**
   * Get personalized course recommendations for a user
   * Uses collaborative filtering + content-based filtering
   */
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<any[]> {
    // Get user's enrollments and progress
    const userEnrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            category: true,
            reviews: true,
          },
        },
      },
    })

    // Get user's reviews
    const userReviews = await prisma.review.findMany({
      where: { userId },
      include: { course: true },
    })

    const enrolledCourseIds = userEnrollments.map((e) => e.courseId)
    const recommendations: RecommendationScore[] = []

    // 1. Collaborative Filtering - Find similar users
    const collaborativeRecs = await this.getCollaborativeRecommendations(
      userId,
      enrolledCourseIds
    )
    recommendations.push(...collaborativeRecs)

    // 2. Content-Based Filtering - Similar courses
    const contentBasedRecs = await this.getContentBasedRecommendations(
      userEnrollments,
      userReviews,
      enrolledCourseIds
    )
    recommendations.push(...contentBasedRecs)

    // 3. Trending courses
    const trendingRecs = await this.getTrendingRecommendations(enrolledCourseIds)
    recommendations.push(...trendingRecs)

    // Aggregate and deduplicate scores
    const scoreMap = new Map<string, { score: number; reasons: string[] }>()

    for (const rec of recommendations) {
      const existing = scoreMap.get(rec.courseId)
      if (existing) {
        existing.score += rec.score
        existing.reasons.push(rec.reason)
      } else {
        scoreMap.set(rec.courseId, {
          score: rec.score,
          reasons: [rec.reason],
        })
      }
    }

    // Sort by score and get top N
    const sortedCourseIds = Array.from(scoreMap.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit)
      .map((entry) => entry[0])

    // Fetch full course data
    const courses = await prisma.course.findMany({
      where: {
        id: { in: sortedCourseIds },
        status: 'PUBLISHED',
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: true,
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    })

    // Add recommendation metadata
    return courses.map((course) => {
      const metadata = scoreMap.get(course.id)
      return {
        ...course,
        recommendationScore: metadata?.score || 0,
        recommendationReasons: metadata?.reasons || [],
      }
    })
  }

  /**
   * Collaborative filtering - find courses that similar users liked
   */
  private async getCollaborativeRecommendations(
    userId: string,
    excludeCourseIds: string[]
  ): Promise<RecommendationScore[]> {
    // Find users with similar course enrollments
    const similarUsers = await prisma.$queryRaw<{ userId: string; similarity: number }[]>`
      SELECT
        e2."userId",
        COUNT(*)::float / (
          SELECT COUNT(*) FROM "enrollments" WHERE "userId" = ${userId}
        ) as similarity
      FROM "enrollments" e1
      JOIN "enrollments" e2 ON e1."courseId" = e2."courseId"
        AND e1."userId" = ${userId}
        AND e2."userId" != ${userId}
      GROUP BY e2."userId"
      HAVING COUNT(*) >= 2
      ORDER BY similarity DESC
      LIMIT 20
    `

    if (similarUsers.length === 0) {
      return []
    }

    const similarUserIds = similarUsers.map((u) => u.userId)

    // Get courses these similar users enrolled in (but not the current user)
    const recommendations = await prisma.enrollment.groupBy({
      by: ['courseId'],
      where: {
        userId: { in: similarUserIds },
        courseId: { notIn: excludeCourseIds },
        course: { status: 'PUBLISHED' },
      },
      _count: {
        courseId: true,
      },
      orderBy: {
        _count: {
          courseId: 'desc',
        },
      },
      take: 20,
    })

    return recommendations.map((rec) => ({
      courseId: rec.courseId,
      score: rec._count.courseId * 2, // Weight collaborative filtering higher
      reason: 'Similar users also took this',
    }))
  }

  /**
   * Content-based filtering - find courses similar to what user liked
   */
  private async getContentBasedRecommendations(
    userEnrollments: any[],
    userReviews: any[],
    excludeCourseIds: string[]
  ): Promise<RecommendationScore[]> {
    // Find categories user is interested in
    const categoryPreferences = new Map<string, number>()
    const levelPreferences = new Map<string, number>()

    // Weight by ratings
    for (const review of userReviews) {
      const categoryId = review.course.categoryId
      const level = review.course.level
      const rating = review.rating

      if (categoryId) {
        categoryPreferences.set(
          categoryId,
          (categoryPreferences.get(categoryId) || 0) + rating
        )
      }
      if (level) {
        levelPreferences.set(level, (levelPreferences.get(level) || 0) + rating)
      }
    }

    // Add enrollments (lower weight)
    for (const enrollment of userEnrollments) {
      const categoryId = enrollment.course.categoryId
      const level = enrollment.course.level

      if (categoryId) {
        categoryPreferences.set(
          categoryId,
          (categoryPreferences.get(categoryId) || 0) + 1
        )
      }
      if (level) {
        levelPreferences.set(level, (levelPreferences.get(level) || 0) + 1)
      }
    }

    const topCategories = Array.from(categoryPreferences.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0])

    const topLevels = Array.from(levelPreferences.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map((entry) => entry[0])

    if (topCategories.length === 0) {
      return []
    }

    // Find courses in preferred categories and levels
    const courses = await prisma.course.findMany({
      where: {
        id: { notIn: excludeCourseIds },
        status: 'PUBLISHED',
        OR: [
          { categoryId: { in: topCategories } },
          { level: { in: topLevels as any[] } },
        ],
      },
      include: {
        reviews: {
          select: { rating: true },
        },
      },
      take: 30,
    })

    return courses.map((course) => {
      let score = 0
      let reason = ''

      if (course.categoryId && topCategories.includes(course.categoryId)) {
        score += 3
        reason = 'Based on your interests'
      }

      if (course.level && topLevels.includes(course.level)) {
        score += 2
        reason = reason || 'Matches your skill level'
      }

      // Boost by average rating
      if (course.reviews.length > 0) {
        const avgRating =
          course.reviews.reduce((sum, r) => sum + r.rating, 0) /
          course.reviews.length
        score += avgRating * 0.5
      }

      return {
        courseId: course.id,
        score,
        reason: reason || 'Recommended for you',
      }
    })
  }

  /**
   * Get trending courses based on recent enrollments and ratings
   */
  private async getTrendingRecommendations(
    excludeCourseIds: string[]
  ): Promise<RecommendationScore[]> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get courses with recent activity
    const trendingCourses = await prisma.course.findMany({
      where: {
        id: { notIn: excludeCourseIds },
        status: 'PUBLISHED',
        enrollments: {
          some: {
            startedAt: {
              gte: thirtyDaysAgo,
            },
          },
        },
      },
      include: {
        enrollments: {
          where: {
            startedAt: {
              gte: thirtyDaysAgo,
            },
          },
        },
        reviews: {
          where: {
            createdAt: {
              gte: thirtyDaysAgo,
            },
          },
          select: { rating: true },
        },
      },
      take: 20,
    })

    return trendingCourses.map((course) => {
      const enrollmentCount = course.enrollments.length
      const avgRating =
        course.reviews.length > 0
          ? course.reviews.reduce((sum, r) => sum + r.rating, 0) /
            course.reviews.length
          : 3

      // Trending score based on recent activity and ratings
      const score = enrollmentCount * 0.5 + avgRating * 0.3

      return {
        courseId: course.id,
        score,
        reason: 'Trending now',
      }
    })
  }

  /**
   * Get course recommendations based on a specific course (similar courses)
   */
  async getSimilarCourses(courseId: string, limit: number = 6): Promise<any[]> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { category: true },
    })

    if (!course) {
      return []
    }

    // Find similar courses by category, level, and tags
    const similarCourses = await prisma.course.findMany({
      where: {
        id: { not: courseId },
        status: 'PUBLISHED',
        OR: [
          { categoryId: course.categoryId },
          { level: course.level },
        ],
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        category: true,
        reviews: {
          select: { rating: true },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
      take: limit * 2,
    })

    // Score by similarity
    const scoredCourses = similarCourses.map((c) => {
      let score = 0

      if (c.categoryId === course.categoryId) score += 5
      if (c.level === course.level) score += 3
      if (c.instructorId === course.instructorId) score += 2

      // Boost by rating
      if (c.reviews.length > 0) {
        const avgRating =
          c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length
        score += avgRating * 0.5
      }

      return { ...c, similarityScore: score }
    })

    return scoredCourses
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit)
  }

  /**
   * Predict user's next best course based on learning path
   */
  async predictNextCourse(userId: string): Promise<any | null> {
    const completedEnrollments = await prisma.enrollment.findMany({
      where: {
        userId,
        progress: 100,
      },
      include: {
        course: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 5,
    })

    if (completedEnrollments.length === 0) {
      return null
    }

    const lastCourse = completedEnrollments[0].course

    // Find next level course in same category
    const nextCourse = await prisma.course.findFirst({
      where: {
        categoryId: lastCourse.categoryId,
        level: this.getNextLevel(lastCourse.level),
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
        category: true,
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    })

    return nextCourse
  }

  private getNextLevel(currentLevel: string): string {
    const levelProgression: { [key: string]: string } = {
      BEGINNER: 'INTERMEDIATE',
      INTERMEDIATE: 'ADVANCED',
      ADVANCED: 'EXPERT',
    }

    return levelProgression[currentLevel] || currentLevel
  }
}

export default new AIRecommendationService()
