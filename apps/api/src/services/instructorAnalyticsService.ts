import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export class InstructorAnalyticsService {
  /**
   * Get instructor's dashboard overview
   */
  async getInstructorOverview(instructorId: string) {
    const [courses, totalStudents, totalRevenue, avgRating, recentEnrollments] =
      await Promise.all([
        // Total courses
        prisma.course.count({
          where: {
            creatorId: instructorId,
            status: 'PUBLISHED',
          },
        }),

        // Total students (unique enrollments)
        prisma.enrollment.count({
          where: {
            course: {
              creatorId: instructorId,
            },
          },
        }),

        // Total revenue
        prisma.payment.aggregate({
          where: {
            course: {
              creatorId: instructorId,
            },
            status: 'COMPLETED',
          },
          _sum: {
            amount: true,
          },
        }),

        // Average rating across all courses
        prisma.review.aggregate({
          where: {
            course: {
              creatorId: instructorId,
            },
          },
          _avg: {
            rating: true,
          },
        }),

        // Recent enrollments (last 30 days)
        prisma.enrollment.count({
          where: {
            course: {
              creatorId: instructorId,
            },
            createdAt: {
              gte: subMonths(new Date(), 1),
            },
          },
        }),
      ])

    return {
      totalCourses: courses,
      totalStudents,
      totalRevenue: totalRevenue._sum.amount || 0,
      averageRating: avgRating._avg.rating || 0,
      recentEnrollments,
    }
  }

  /**
   * Get revenue analytics over time
   */
  async getRevenueAnalytics(instructorId: string, months: number = 12) {
    const monthlyRevenue = []

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i))
      const monthEnd = endOfMonth(subMonths(new Date(), i))

      const revenue = await prisma.payment.aggregate({
        where: {
          course: {
            creatorId: instructorId,
          },
          status: 'COMPLETED',
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      })

      monthlyRevenue.push({
        month: format(monthStart, 'MMM yyyy'),
        revenue: revenue._sum.amount || 0,
        transactions: revenue._count,
      })
    }

    return monthlyRevenue
  }

  /**
   * Get enrollment trends
   */
  async getEnrollmentTrends(instructorId: string, months: number = 12) {
    const monthlyEnrollments = []

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i))
      const monthEnd = endOfMonth(subMonths(new Date(), i))

      const enrollments = await prisma.enrollment.count({
        where: {
          course: {
            creatorId: instructorId,
          },
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      })

      monthlyEnrollments.push({
        month: format(monthStart, 'MMM yyyy'),
        enrollments,
      })
    }

    return monthlyEnrollments
  }

  /**
   * Get course performance metrics
   */
  async getCoursePerformance(instructorId: string) {
    const courses = await prisma.course.findMany({
      where: {
        creatorId: instructorId,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        price: true,
        enrollmentCount: true,
        averageRating: true,
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        enrollmentCount: 'desc',
      },
      take: 10,
    })

    // Get revenue per course
    const coursesWithRevenue = await Promise.all(
      courses.map(async (course) => {
        const revenue = await prisma.payment.aggregate({
          where: {
            courseId: course.id,
            status: 'COMPLETED',
          },
          _sum: {
            amount: true,
          },
        })

        const completionRate = await this.getCourseCompletionRate(course.id)

        return {
          ...course,
          revenue: revenue._sum.amount || 0,
          completionRate,
        }
      })
    )

    return coursesWithRevenue
  }

  /**
   * Get course completion rate
   */
  private async getCourseCompletionRate(courseId: string): Promise<number> {
    const [totalEnrollments, completedEnrollments] = await Promise.all([
      prisma.enrollment.count({
        where: { courseId },
      }),

      prisma.enrollment.count({
        where: {
          courseId,
          status: 'COMPLETED',
        },
      }),
    ])

    if (totalEnrollments === 0) return 0
    return Math.round((completedEnrollments / totalEnrollments) * 100)
  }

  /**
   * Get student engagement metrics
   */
  async getStudentEngagement(instructorId: string) {
    const courses = await prisma.course.findMany({
      where: {
        creatorId: instructorId,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
      },
    })

    const courseIds = courses.map((c) => c.id)

    const [avgProgress, activeStudents, completedStudents, avgTimeSpent] =
      await Promise.all([
        // Average progress across all students
        prisma.courseProgress.aggregate({
          where: {
            courseId: { in: courseIds },
          },
          _avg: {
            progressPercentage: true,
          },
        }),

        // Active students (accessed in last 7 days)
        prisma.courseProgress.count({
          where: {
            courseId: { in: courseIds },
            lastAccessedAt: {
              gte: subMonths(new Date(), 0.25), // ~7 days
            },
          },
        }),

        // Completed students
        prisma.courseProgress.count({
          where: {
            courseId: { in: courseIds },
            progressPercentage: 100,
          },
        }),

        // Average time spent
        prisma.lessonProgress.aggregate({
          where: {
            lesson: {
              module: {
                courseId: { in: courseIds },
              },
            },
          },
          _avg: {
            timeSpent: true,
          },
        }),
      ])

    return {
      averageProgress: avgProgress._avg.progressPercentage || 0,
      activeStudents,
      completedStudents,
      averageTimeSpent: avgTimeSpent._avg.timeSpent || 0,
    }
  }

  /**
   * Get review analytics
   */
  async getReviewAnalytics(instructorId: string) {
    const courses = await prisma.course.findMany({
      where: {
        creatorId: instructorId,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
      },
    })

    const courseIds = courses.map((c) => c.id)

    const [totalReviews, avgRating, ratingDistribution, recentReviews] =
      await Promise.all([
        // Total reviews
        prisma.review.count({
          where: {
            courseId: { in: courseIds },
          },
        }),

        // Average rating
        prisma.review.aggregate({
          where: {
            courseId: { in: courseIds },
          },
          _avg: {
            rating: true,
          },
        }),

        // Rating distribution
        prisma.review.groupBy({
          by: ['rating'],
          where: {
            courseId: { in: courseIds },
          },
          _count: true,
          orderBy: {
            rating: 'desc',
          },
        }),

        // Recent reviews
        prisma.review.findMany({
          where: {
            courseId: { in: courseIds },
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            course: {
              select: {
                title: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        }),
      ])

    // Format rating distribution
    const distribution = [1, 2, 3, 4, 5].map((rating) => {
      const found = ratingDistribution.find((r) => r.rating === rating)
      return {
        rating,
        count: found?._count || 0,
      }
    })

    return {
      totalReviews,
      averageRating: avgRating._avg.rating || 0,
      ratingDistribution: distribution,
      recentReviews,
    }
  }

  /**
   * Get top performing courses
   */
  async getTopCourses(instructorId: string, limit: number = 5) {
    const courses = await prisma.course.findMany({
      where: {
        creatorId: instructorId,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        enrollmentCount: true,
        averageRating: true,
        price: true,
      },
      orderBy: [
        { enrollmentCount: 'desc' },
        { averageRating: 'desc' },
      ],
      take: limit,
    })

    // Get revenue for each course
    const coursesWithMetrics = await Promise.all(
      courses.map(async (course) => {
        const [revenue, completionRate] = await Promise.all([
          prisma.payment.aggregate({
            where: {
              courseId: course.id,
              status: 'COMPLETED',
            },
            _sum: {
              amount: true,
            },
          }),
          this.getCourseCompletionRate(course.id),
        ])

        return {
          ...course,
          revenue: revenue._sum.amount || 0,
          completionRate,
        }
      })
    )

    return coursesWithMetrics
  }

  /**
   * Get earnings summary
   */
  async getEarningsSummary(instructorId: string) {
    const [thisMonth, lastMonth, allTime, pendingPayouts] = await Promise.all([
      // This month earnings
      prisma.payment.aggregate({
        where: {
          course: {
            creatorId: instructorId,
          },
          status: 'COMPLETED',
          createdAt: {
            gte: startOfMonth(new Date()),
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // Last month earnings
      prisma.payment.aggregate({
        where: {
          course: {
            creatorId: instructorId,
          },
          status: 'COMPLETED',
          createdAt: {
            gte: startOfMonth(subMonths(new Date(), 1)),
            lt: startOfMonth(new Date()),
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // All time earnings
      prisma.payment.aggregate({
        where: {
          course: {
            creatorId: instructorId,
          },
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      }),

      // Pending payouts (if you have a payout system)
      prisma.payment.aggregate({
        where: {
          course: {
            creatorId: instructorId,
          },
          status: 'PENDING',
        },
        _sum: {
          amount: true,
        },
      }),
    ])

    const thisMonthEarnings = thisMonth._sum.amount || 0
    const lastMonthEarnings = lastMonth._sum.amount || 0
    const growthRate =
      lastMonthEarnings > 0
        ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
        : 0

    return {
      thisMonth: thisMonthEarnings,
      lastMonth: lastMonthEarnings,
      allTime: allTime._sum.amount || 0,
      pending: pendingPayouts._sum.amount || 0,
      growthRate: Math.round(growthRate * 10) / 10,
    }
  }
}

export const instructorAnalyticsService = new InstructorAnalyticsService()
