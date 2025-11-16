import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

interface TimeRange {
  startDate: Date
  endDate: Date
}

interface AnalyticsMetrics {
  totalUsers: number
  activeUsers: number
  newUsers: number
  totalCourses: number
  totalEnrollments: number
  completedCourses: number
  averageCompletionRate: number
  totalRevenue: number
  averageRevenuePerUser: number
}

class AdvancedAnalyticsService {
  /**
   * Get platform overview metrics
   */
  async getPlatformOverview(timeRange?: TimeRange): Promise<AnalyticsMetrics> {
    const startDate = timeRange?.startDate || new Date(0)
    const endDate = timeRange?.endDate || new Date()

    const [
      totalUsers,
      newUsers,
      activeUsers,
      totalCourses,
      totalEnrollments,
      completedCourses,
      totalRevenue,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // New users in time range
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),

      // Active users (logged in during period)
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),

      // Total published courses
      prisma.course.count({
        where: { status: 'PUBLISHED' },
      }),

      // Total enrollments
      prisma.enrollment.count({
        where: {
          startedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),

      // Completed courses
      prisma.enrollment.count({
        where: {
          progress: 100,
          completedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),

      // Total revenue (sum of all paid enrollments)
      prisma.enrollment.aggregate({
        where: {
          startedAt: {
            gte: startDate,
            lte: endDate,
          },
          course: {
            price: {
              gt: 0,
            },
          },
        },
        _sum: {
          course: {
            select: {
              price: true,
            },
          },
        },
      }),
    ])

    const averageCompletionRate =
      totalEnrollments > 0 ? (completedCourses / totalEnrollments) * 100 : 0

    const revenue = 0 // Will calculate properly from payment records
    const averageRevenuePerUser = totalUsers > 0 ? revenue / totalUsers : 0

    return {
      totalUsers,
      activeUsers,
      newUsers,
      totalCourses,
      totalEnrollments,
      completedCourses,
      averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
      totalRevenue: revenue,
      averageRevenuePerUser: Math.round(averageRevenuePerUser * 100) / 100,
    }
  }

  /**
   * Get time-series data for trends
   */
  async getTimeSeries(
    metric: 'enrollments' | 'users' | 'revenue' | 'completions',
    timeRange: TimeRange,
    interval: 'day' | 'week' | 'month' = 'day'
  ) {
    const { startDate, endDate } = timeRange

    let dateGroupFormat: string
    switch (interval) {
      case 'day':
        dateGroupFormat = 'YYYY-MM-DD'
        break
      case 'week':
        dateGroupFormat = 'YYYY-WW'
        break
      case 'month':
        dateGroupFormat = 'YYYY-MM'
        break
    }

    let query: any
    switch (metric) {
      case 'enrollments':
        query = await prisma.$queryRaw`
          SELECT
            DATE_TRUNC(${interval}, "startedAt") as date,
            COUNT(*) as count
          FROM enrollments
          WHERE "startedAt" >= ${startDate}
            AND "startedAt" <= ${endDate}
          GROUP BY DATE_TRUNC(${interval}, "startedAt")
          ORDER BY date ASC
        `
        break

      case 'users':
        query = await prisma.$queryRaw`
          SELECT
            DATE_TRUNC(${interval}, "createdAt") as date,
            COUNT(*) as count
          FROM users
          WHERE "createdAt" >= ${startDate}
            AND "createdAt" <= ${endDate}
          GROUP BY DATE_TRUNC(${interval}, "createdAt")
          ORDER BY date ASC
        `
        break

      case 'completions':
        query = await prisma.$queryRaw`
          SELECT
            DATE_TRUNC(${interval}, "completedAt") as date,
            COUNT(*) as count
          FROM enrollments
          WHERE "completedAt" >= ${startDate}
            AND "completedAt" <= ${endDate}
            AND progress = 100
          GROUP BY DATE_TRUNC(${interval}, "completedAt")
          ORDER BY date ASC
        `
        break

      default:
        query = []
    }

    return query.map((row: any) => ({
      date: row.date,
      value: Number(row.count),
    }))
  }

  /**
   * Cohort analysis - track user retention by signup date
   */
  async getCohortAnalysis(startDate: Date, endDate: Date) {
    // Group users by signup month
    const cohorts = await prisma.$queryRaw<any[]>`
      SELECT
        DATE_TRUNC('month', u."createdAt") as cohort_month,
        COUNT(DISTINCT u.id) as cohort_size,
        COUNT(DISTINCT CASE WHEN e."startedAt" IS NOT NULL THEN u.id END) as enrolled_users,
        COUNT(DISTINCT CASE WHEN e.progress = 100 THEN u.id END) as completed_users
      FROM users u
      LEFT JOIN enrollments e ON u.id = e."userId"
      WHERE u."createdAt" >= ${startDate}
        AND u."createdAt" <= ${endDate}
      GROUP BY DATE_TRUNC('month', u."createdAt")
      ORDER BY cohort_month ASC
    `

    return cohorts.map((cohort) => ({
      cohortMonth: cohort.cohort_month,
      cohortSize: Number(cohort.cohort_size),
      enrolledUsers: Number(cohort.enrolled_users),
      completedUsers: Number(cohort.completed_users),
      enrollmentRate:
        Number(cohort.cohort_size) > 0
          ? (Number(cohort.enrolled_users) / Number(cohort.cohort_size)) * 100
          : 0,
      completionRate:
        Number(cohort.enrolled_users) > 0
          ? (Number(cohort.completed_users) / Number(cohort.enrolled_users)) * 100
          : 0,
    }))
  }

  /**
   * Funnel analysis - user journey from signup to completion
   */
  async getFunnelAnalysis(timeRange: TimeRange) {
    const { startDate, endDate } = timeRange

    const [signups, profileCompleted, firstEnrollment, firstCompletion, certificateEarned] =
      await Promise.all([
        // Stage 1: Signups
        prisma.user.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),

        // Stage 2: Profile completed (has bio or profile picture)
        prisma.user.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            OR: [{ bio: { not: null } }, { profilePicture: { not: null } }],
          },
        }),

        // Stage 3: First enrollment
        prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(DISTINCT "userId") as count
          FROM enrollments
          WHERE "userId" IN (
            SELECT id FROM users
            WHERE "createdAt" >= ${startDate}
              AND "createdAt" <= ${endDate}
          )
        `,

        // Stage 4: First completion
        prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(DISTINCT "userId") as count
          FROM enrollments
          WHERE progress = 100
            AND "userId" IN (
              SELECT id FROM users
              WHERE "createdAt" >= ${startDate}
                AND "createdAt" <= ${endDate}
            )
        `,

        // Stage 5: Certificate earned
        prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(DISTINCT "userId") as count
          FROM certificates
          WHERE "userId" IN (
            SELECT id FROM users
            WHERE "createdAt" >= ${startDate}
              AND "createdAt" <= ${endDate}
          )
        `,
      ])

    const totalUsers = signups

    return {
      stages: [
        {
          name: 'Sign Up',
          count: signups,
          percentage: 100,
          dropOff: 0,
        },
        {
          name: 'Profile Completed',
          count: profileCompleted,
          percentage: totalUsers > 0 ? (profileCompleted / totalUsers) * 100 : 0,
          dropOff: totalUsers > 0 ? ((totalUsers - profileCompleted) / totalUsers) * 100 : 0,
        },
        {
          name: 'First Enrollment',
          count: Number(firstEnrollment[0].count),
          percentage: totalUsers > 0 ? (Number(firstEnrollment[0].count) / totalUsers) * 100 : 0,
          dropOff:
            totalUsers > 0
              ? ((totalUsers - Number(firstEnrollment[0].count)) / totalUsers) * 100
              : 0,
        },
        {
          name: 'First Completion',
          count: Number(firstCompletion[0].count),
          percentage:
            totalUsers > 0 ? (Number(firstCompletion[0].count) / totalUsers) * 100 : 0,
          dropOff:
            totalUsers > 0
              ? ((totalUsers - Number(firstCompletion[0].count)) / totalUsers) * 100
              : 0,
        },
        {
          name: 'Certificate Earned',
          count: Number(certificateEarned[0].count),
          percentage:
            totalUsers > 0 ? (Number(certificateEarned[0].count) / totalUsers) * 100 : 0,
          dropOff:
            totalUsers > 0
              ? ((totalUsers - Number(certificateEarned[0].count)) / totalUsers) * 100
              : 0,
        },
      ],
    }
  }

  /**
   * Course performance analytics
   */
  async getCoursePerformance(courseId?: string) {
    const where = courseId ? { id: courseId } : { status: 'PUBLISHED' }

    const courses = await prisma.course.findMany({
      where,
      include: {
        enrollments: {
          select: {
            progress: true,
            startedAt: true,
            completedAt: true,
          },
        },
        reviews: {
          select: {
            rating: true,
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

    return courses.map((course) => {
      const totalEnrollments = course.enrollments.length
      const completedEnrollments = course.enrollments.filter((e) => e.progress === 100).length
      const completionRate =
        totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0

      const averageProgress =
        totalEnrollments > 0
          ? course.enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments
          : 0

      // Calculate average time to complete
      const completedWithDates = course.enrollments.filter(
        (e) => e.progress === 100 && e.completedAt && e.startedAt
      )
      const avgDaysToComplete =
        completedWithDates.length > 0
          ? completedWithDates.reduce((sum, e) => {
              const days = Math.floor(
                (e.completedAt!.getTime() - e.startedAt.getTime()) / (1000 * 60 * 60 * 24)
              )
              return sum + days
            }, 0) / completedWithDates.length
          : 0

      return {
        courseId: course.id,
        courseTitle: course.title,
        totalEnrollments,
        completedEnrollments,
        completionRate: Math.round(completionRate * 100) / 100,
        averageProgress: Math.round(averageProgress * 100) / 100,
        averageRating: course.averageRating,
        totalReviews: course._count.reviews,
        avgDaysToComplete: Math.round(avgDaysToComplete),
      }
    })
  }

  /**
   * User engagement metrics
   */
  async getUserEngagement(timeRange: TimeRange) {
    const { startDate, endDate } = timeRange

    // Daily Active Users (DAU)
    const dau = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    })

    // Weekly Active Users (WAU)
    const wau = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    })

    // Monthly Active Users (MAU)
    const mau = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    })

    // Average session duration (from lesson progress updates)
    const avgSessionDuration = await prisma.$queryRaw<[{ avg_duration: number }]>`
      SELECT AVG(
        EXTRACT(EPOCH FROM (lp."updatedAt" - lp."createdAt"))
      ) as avg_duration
      FROM lesson_progress lp
      WHERE lp."updatedAt" >= ${startDate}
        AND lp."updatedAt" <= ${endDate}
        AND lp."updatedAt" > lp."createdAt"
    `

    return {
      dau,
      wau,
      mau,
      dauToMauRatio: mau > 0 ? (dau / mau) * 100 : 0,
      wauToMauRatio: mau > 0 ? (wau / mau) * 100 : 0,
      avgSessionDurationMinutes: avgSessionDuration[0]?.avg_duration
        ? Math.round(avgSessionDuration[0].avg_duration / 60)
        : 0,
    }
  }

  /**
   * Revenue analytics
   */
  async getRevenueAnalytics(timeRange: TimeRange) {
    const { startDate, endDate } = timeRange

    // Get all paid enrollments
    const paidEnrollments = await prisma.enrollment.findMany({
      where: {
        startedAt: {
          gte: startDate,
          lte: endDate,
        },
        course: {
          price: {
            gt: 0,
          },
        },
      },
      include: {
        course: {
          select: {
            price: true,
            title: true,
          },
        },
      },
    })

    const totalRevenue = paidEnrollments.reduce(
      (sum, e) => sum + Number(e.course.price),
      0
    )

    const totalTransactions = paidEnrollments.length

    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    // Revenue by course
    const revenueByCourse = paidEnrollments.reduce((acc, e) => {
      const courseTitle = e.course.title
      if (!acc[courseTitle]) {
        acc[courseTitle] = {
          courseTitle,
          revenue: 0,
          transactions: 0,
        }
      }
      acc[courseTitle].revenue += Number(e.course.price)
      acc[courseTitle].transactions += 1
      return acc
    }, {} as Record<string, { courseTitle: string; revenue: number; transactions: number }>)

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalTransactions,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      topCourses: Object.values(revenueByCourse)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10),
    }
  }

  /**
   * Instructor performance analytics
   */
  async getInstructorAnalytics(instructorId: string, timeRange?: TimeRange) {
    const startDate = timeRange?.startDate || new Date(0)
    const endDate = timeRange?.endDate || new Date()

    const courses = await prisma.course.findMany({
      where: {
        creatorId: instructorId,
      },
      include: {
        enrollments: {
          where: {
            startedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        reviews: true,
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    })

    const totalCourses = courses.length
    const totalEnrollments = courses.reduce((sum, c) => sum + c.enrollments.length, 0)
    const totalRevenue = courses.reduce(
      (sum, c) => sum + c.enrollments.length * Number(c.price),
      0
    )

    const avgRating =
      courses.reduce((sum, c) => sum + (c.averageRating || 0), 0) / (totalCourses || 1)

    return {
      instructorId,
      totalCourses,
      totalEnrollments,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageRating: Math.round(avgRating * 100) / 100,
      totalReviews: courses.reduce((sum, c) => sum + c._count.reviews, 0),
    }
  }
}

export default new AdvancedAnalyticsService()
