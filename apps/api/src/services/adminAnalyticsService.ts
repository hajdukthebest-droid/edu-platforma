import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import { cacheService } from './cacheService'
import { CourseStatus, UserRole } from '@prisma/client'

export class AdminAnalyticsService {
  /**
   * Get comprehensive platform statistics
   */
  async getPlatformStats() {
    const cacheKey = 'admin:platform-stats'

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const [
          totalUsers,
          activeUsers,
          totalCourses,
          publishedCourses,
          totalEnrollments,
          totalRevenue,
          totalCertificates,
          totalForumPosts,
          newUsersThisMonth,
          newCoursesThisMonth,
        ] = await Promise.all([
          // Total users
          prisma.user.count(),

          // Active users (logged in last 30 days)
          prisma.user.count({
            where: {
              lastLoginAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          }),

          // Total courses
          prisma.course.count(),

          // Published courses
          prisma.course.count({
            where: { status: CourseStatus.PUBLISHED },
          }),

          // Total enrollments
          prisma.enrollment.count(),

          // Total revenue
          prisma.payment.aggregate({
            where: { status: 'COMPLETED' },
            _sum: { amount: true },
          }),

          // Total certificates issued
          prisma.certificate.count(),

          // Total forum posts
          prisma.forumPost.count(),

          // New users this month
          prisma.user.count({
            where: {
              createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              },
            },
          }),

          // New courses this month
          prisma.course.count({
            where: {
              createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              },
            },
          }),
        ])

        return {
          users: {
            total: totalUsers,
            active: activeUsers,
            newThisMonth: newUsersThisMonth,
            activePercentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0,
          },
          courses: {
            total: totalCourses,
            published: publishedCourses,
            newThisMonth: newCoursesThisMonth,
            publishRate: totalCourses > 0 ? ((publishedCourses / totalCourses) * 100).toFixed(1) : 0,
          },
          enrollments: {
            total: totalEnrollments,
            averagePerCourse: publishedCourses > 0 ? (totalEnrollments / publishedCourses).toFixed(1) : 0,
          },
          revenue: {
            total: Number(totalRevenue._sum.amount || 0),
            thisMonth: 0, // Will calculate separately
          },
          certificates: totalCertificates,
          forumActivity: {
            totalPosts: totalForumPosts,
          },
        }
      },
      300 // Cache for 5 minutes
    )
  }

  /**
   * Get user growth over time (last 12 months)
   */
  async getUserGrowth() {
    const cacheKey = 'admin:user-growth'

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const months = []
        const now = new Date()

        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

          const count = await prisma.user.count({
            where: {
              createdAt: {
                gte: date,
                lt: nextMonth,
              },
            },
          })

          months.push({
            month: date.toLocaleDateString('hr-HR', { month: 'short', year: 'numeric' }),
            count,
          })
        }

        return months
      },
      600 // Cache for 10 minutes
    )
  }

  /**
   * Get enrollment growth over time
   */
  async getEnrollmentGrowth() {
    const cacheKey = 'admin:enrollment-growth'

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const months = []
        const now = new Date()

        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

          const count = await prisma.enrollment.count({
            where: {
              enrolledAt: {
                gte: date,
                lt: nextMonth,
              },
            },
          })

          months.push({
            month: date.toLocaleDateString('hr-HR', { month: 'short', year: 'numeric' }),
            count,
          })
        }

        return months
      },
      600
    )
  }

  /**
   * Get revenue trends
   */
  async getRevenueTrends() {
    const cacheKey = 'admin:revenue-trends'

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const months = []
        const now = new Date()

        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

          const result = await prisma.payment.aggregate({
            where: {
              status: 'COMPLETED',
              createdAt: {
                gte: date,
                lt: nextMonth,
              },
            },
            _sum: { amount: true },
          })

          months.push({
            month: date.toLocaleDateString('hr-HR', { month: 'short', year: 'numeric' }),
            revenue: Number(result._sum.amount || 0),
          })
        }

        return months
      },
      600
    )
  }

  /**
   * Get top performing courses
   */
  async getTopCourses(limit = 10) {
    const cacheKey = `admin:top-courses:${limit}`

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const courses = await prisma.course.findMany({
          where: { status: CourseStatus.PUBLISHED },
          take: limit,
          orderBy: { enrollmentCount: 'desc' },
          select: {
            id: true,
            title: true,
            enrollmentCount: true,
            averageRating: true,
            creator: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            category: {
              select: {
                name: true,
                domain: {
                  select: {
                    name: true,
                    icon: true,
                  },
                },
              },
            },
          },
        })

        return courses
      },
      600
    )
  }

  /**
   * Get top instructors
   */
  async getTopInstructors(limit = 10) {
    const cacheKey = `admin:top-instructors:${limit}`

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const instructors = await prisma.user.findMany({
          where: { role: UserRole.INSTRUCTOR },
          take: limit,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
            _count: {
              select: {
                createdCourses: true,
              },
            },
            createdCourses: {
              where: { status: CourseStatus.PUBLISHED },
              select: {
                enrollmentCount: true,
              },
            },
          },
        })

        // Calculate total enrollments
        const instructorsWithStats = instructors.map((instructor) => ({
          ...instructor,
          totalEnrollments: instructor.createdCourses.reduce(
            (sum, course) => sum + course.enrollmentCount,
            0
          ),
          totalCourses: instructor._count.createdCourses,
        }))

        // Sort by total enrollments
        instructorsWithStats.sort((a, b) => b.totalEnrollments - a.totalEnrollments)

        return instructorsWithStats.slice(0, limit)
      },
      600
    )
  }

  /**
   * Get domain statistics
   */
  async getDomainStats() {
    const cacheKey = 'admin:domain-stats'

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const domains = await prisma.domain.findMany({
          where: { isActive: true },
          include: {
            categories: {
              include: {
                courses: {
                  where: { status: CourseStatus.PUBLISHED },
                  select: {
                    enrollmentCount: true,
                  },
                },
              },
            },
          },
        })

        return domains.map((domain) => ({
          id: domain.id,
          name: domain.name,
          icon: domain.icon,
          color: domain.color,
          totalCategories: domain.categories.length,
          totalCourses: domain.categories.reduce(
            (sum, cat) => sum + cat.courses.length,
            0
          ),
          totalEnrollments: domain.categories.reduce(
            (sum, cat) =>
              sum +
              cat.courses.reduce((s, course) => s + course.enrollmentCount, 0),
            0
          ),
        }))
      },
      600
    )
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit = 20) {
    const [recentUsers, recentCourses, recentEnrollments] = await Promise.all([
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          role: true,
        },
      }),

      prisma.course.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          creator: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),

      prisma.enrollment.findMany({
        take: 10,
        orderBy: { enrolledAt: 'desc' },
        select: {
          id: true,
          enrolledAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          course: {
            select: {
              title: true,
            },
          },
        },
      }),
    ])

    return {
      recentUsers,
      recentCourses,
      recentEnrollments,
    }
  }
}

export const adminAnalyticsService = new AdminAnalyticsService()
