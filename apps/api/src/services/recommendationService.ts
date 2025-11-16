import { prisma } from '@edu-platforma/database'
import { CourseLevel } from '@prisma/client'

export class RecommendationService {
  /**
   * Get personalized course recommendations for a user
   */
  async getRecommendations(userId: string, limit = 10) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                category: true,
                level: true,
                tags: true,
              },
            },
          },
        },
        reviews: {
          select: {
            courseId: true,
            rating: true,
          },
        },
      },
    })

    if (!user) return []

    // Get user's enrolled course IDs
    const enrolledCourseIds = user.enrollments.map((e) => e.course.id)

    // Get categories and levels from enrolled courses
    const enrolledCategories = user.enrollments.map((e) => e.course.category)
    const enrolledLevels = user.enrollments.map((e) => e.course.level)

    // Extract tags from enrolled courses
    const enrolledTags = user.enrollments.flatMap((e) => e.course.tags || [])

    // Calculate weighted scores
    const categoryScores: { [key: string]: number } = {}
    enrolledCategories.forEach((cat) => {
      if (cat) {
        categoryScores[cat.id] = (categoryScores[cat.id] || 0) + 1
      }
    })

    const levelScores: { [key: string]: number } = {}
    enrolledLevels.forEach((level) => {
      levelScores[level] = (levelScores[level] || 0) + 1
    })

    // Get recommendations based on:
    // 1. Similar categories
    // 2. Similar difficulty levels
    // 3. Popular courses in same categories
    // 4. Highly rated courses

    const recommendations = await prisma.course.findMany({
      where: {
        AND: [
          { status: 'PUBLISHED' },
          { id: { notIn: enrolledCourseIds } },
          {
            OR: [
              // Similar categories
              ...(Object.keys(categoryScores).length > 0
                ? [{ categoryId: { in: Object.keys(categoryScores) } }]
                : []),
              // Highly rated
              { averageRating: { gte: 4.0 } },
              // Popular (many enrollments)
              { enrollmentCount: { gte: 10 } },
            ],
          },
        ],
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        creator: {
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
      take: limit * 2, // Get more to allow filtering
    })

    // Score each recommendation
    const scoredRecommendations = recommendations.map((course) => {
      let score = 0

      // Category match
      if (course.categoryId && categoryScores[course.categoryId]) {
        score += categoryScores[course.categoryId] * 10
      }

      // Level match
      if (levelScores[course.level]) {
        score += levelScores[course.level] * 5
      }

      // Average rating
      if (course.averageRating) {
        score += Number(course.averageRating) * 2
      }

      // Popularity
      score += Math.min(course.enrollmentCount / 10, 5)

      // Tag matching
      const courseTags = (course.tags as string[]) || []
      const matchingTags = courseTags.filter((tag) => enrolledTags.includes(tag))
      score += matchingTags.length * 3

      return {
        course,
        score,
      }
    })

    // Sort by score and return top recommendations
    return scoredRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => r.course)
  }

  /**
   * Get similar courses to a given course
   */
  async getSimilarCourses(courseId: string, limit = 5) {
    const targetCourse = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        categoryId: true,
        level: true,
        tags: true,
      },
    })

    if (!targetCourse) return []

    const similarCourses = await prisma.course.findMany({
      where: {
        AND: [
          { id: { not: courseId } },
          { status: 'PUBLISHED' },
          {
            OR: [
              { categoryId: targetCourse.categoryId },
              { level: targetCourse.level },
            ],
          },
        ],
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        creator: {
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
      take: limit * 2,
    })

    // Score similarity
    const targetTags = (targetCourse.tags as string[]) || []
    const scoredCourses = similarCourses.map((course) => {
      let score = 0

      // Same category
      if (course.categoryId === targetCourse.categoryId) {
        score += 10
      }

      // Same level
      if (course.level === targetCourse.level) {
        score += 5
      }

      // Tag matching
      const courseTags = (course.tags as string[]) || []
      const matchingTags = courseTags.filter((tag) => targetTags.includes(tag))
      score += matchingTags.length * 3

      // Rating
      if (course.averageRating) {
        score += Number(course.averageRating)
      }

      return { course, score }
    })

    return scoredCourses
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => r.course)
  }

  /**
   * Get trending courses
   */
  async getTrendingCourses(limit = 10, days = 7) {
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    // Get courses with most recent enrollments
    const recentEnrollments = await prisma.enrollment.groupBy({
      by: ['courseId'],
      where: {
        enrolledAt: {
          gte: dateFrom,
        },
      },
      _count: {
        courseId: true,
      },
      orderBy: {
        _count: {
          courseId: 'desc',
        },
      },
      take: limit,
    })

    const courseIds = recentEnrollments.map((e) => e.courseId)

    const courses = await prisma.course.findMany({
      where: {
        id: { in: courseIds },
        status: 'PUBLISHED',
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        creator: {
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

    // Sort by enrollment count in the original order
    return courseIds
      .map((id) => courses.find((c) => c.id === id))
      .filter((c) => c !== undefined)
  }

  /**
   * Get popular courses by category
   */
  async getPopularByCategory(categoryId: string, limit = 10) {
    return prisma.course.findMany({
      where: {
        categoryId,
        status: 'PUBLISHED',
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        creator: {
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
      orderBy: [
        { enrollmentCount: 'desc' },
        { averageRating: 'desc' },
      ],
      take: limit,
    })
  }

  /**
   * Get "because you enrolled in X" recommendations
   */
  async getBecauseYouEnrolled(userId: string, courseId: string, limit = 5) {
    // Get the reference course
    const refCourse = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        categoryId: true,
        level: true,
      },
    })

    if (!refCourse) return []

    // Get user's enrolled courses
    const enrolled = await prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true },
    })

    const enrolledIds = enrolled.map((e) => e.courseId)

    // Find courses that other users who enrolled in this course also enrolled in
    const otherEnrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        userId: { not: userId },
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    })

    const otherUserIds = otherEnrollments.map((e) => e.userId)

    // Get popular courses among those users
    const popularAmongSimilar = await prisma.enrollment.groupBy({
      by: ['courseId'],
      where: {
        userId: { in: otherUserIds },
        courseId: { notIn: [...enrolledIds, courseId] },
      },
      _count: {
        courseId: true,
      },
      orderBy: {
        _count: {
          courseId: 'desc',
        },
      },
      take: limit,
    })

    const courseIds = popularAmongSimilar.map((p) => p.courseId)

    return prisma.course.findMany({
      where: {
        id: { in: courseIds },
        status: 'PUBLISHED',
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        creator: {
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
  }
}

export const recommendationService = new RecommendationService()
