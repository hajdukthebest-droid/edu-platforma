import { PrismaClient } from '@prisma/client'
import { Parser } from 'json2csv'

const prisma = new PrismaClient()

interface ReportOptions {
  format?: 'json' | 'csv'
  startDate?: Date
  endDate?: Date
}

class ReportingService {
  /**
   * Generate enrollment report
   */
  async generateEnrollmentReport(options: ReportOptions = {}) {
    const { startDate, endDate, format = 'json' } = options

    const where: any = {}
    if (startDate || endDate) {
      where.startedAt = {}
      if (startDate) where.startedAt.gte = startDate
      if (endDate) where.startedAt.lte = endDate
    }

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    })

    const data = enrollments.map((e) => ({
      enrollmentId: e.id,
      userId: e.userId,
      userEmail: e.user.email,
      userName: `${e.user.firstName} ${e.user.lastName}`,
      courseId: e.courseId,
      courseTitle: e.course.title,
      coursePrice: Number(e.course.price),
      progress: e.progress,
      startedAt: e.startedAt,
      lastAccessedAt: e.lastAccessedAt,
      completedAt: e.completedAt,
      status: e.progress === 100 ? 'Completed' : e.progress > 0 ? 'In Progress' : 'Not Started',
    }))

    if (format === 'csv') {
      return this.convertToCSV(data)
    }

    return data
  }

  /**
   * Generate course performance report
   */
  async generateCoursePerformanceReport(options: ReportOptions = {}) {
    const { format = 'json' } = options

    const courses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        creator: {
          select: {
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
        enrollments: {
          select: {
            progress: true,
            startedAt: true,
            completedAt: true,
          },
        },
      },
    })

    const data = courses.map((course) => {
      const totalEnrollments = course._count.enrollments
      const completedEnrollments = course.enrollments.filter((e) => e.progress === 100).length
      const completionRate =
        totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0

      const avgProgress =
        totalEnrollments > 0
          ? course.enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments
          : 0

      return {
        courseId: course.id,
        courseTitle: course.title,
        instructor: `${course.creator.firstName} ${course.creator.lastName}`,
        level: course.level,
        price: Number(course.price),
        totalEnrollments,
        completedEnrollments,
        completionRate: Math.round(completionRate * 10) / 10,
        averageProgress: Math.round(avgProgress * 10) / 10,
        averageRating: course.averageRating || 0,
        totalReviews: course._count.reviews,
        revenue: totalEnrollments * Number(course.price),
      }
    })

    if (format === 'csv') {
      return this.convertToCSV(data)
    }

    return data
  }

  /**
   * Generate user activity report
   */
  async generateUserActivityReport(options: ReportOptions = {}) {
    const { startDate, endDate, format = 'json' } = options

    const where: any = {}
    if (startDate || endDate) {
      where.lastLoginAt = {}
      if (startDate) where.lastLoginAt.gte = startDate
      if (endDate) where.lastLoginAt.lte = endDate
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            enrollments: true,
            lessonProgress: true,
            forumPosts: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        lastLoginAt: 'desc',
      },
    })

    const data = await Promise.all(
      users.map(async (user) => {
        const completedCourses = await prisma.enrollment.count({
          where: {
            userId: user.id,
            progress: 100,
          },
        })

        return {
          userId: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          totalPoints: user.totalPoints,
          enrollments: user._count.enrollments,
          completedCourses,
          lessonsCompleted: user._count.lessonProgress,
          forumPosts: user._count.forumPosts,
          reviews: user._count.reviews,
          lastLogin: user.lastLoginAt,
          createdAt: user.createdAt,
        }
      })
    )

    if (format === 'csv') {
      return this.convertToCSV(data)
    }

    return data
  }

  /**
   * Generate revenue report
   */
  async generateRevenueReport(options: ReportOptions = {}) {
    const { startDate, endDate, format = 'json' } = options

    const where: any = {
      course: {
        price: {
          gt: 0,
        },
      },
    }

    if (startDate || endDate) {
      where.startedAt = {}
      if (startDate) where.startedAt.gte = startDate
      if (endDate) where.startedAt.lte = endDate
    }

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        course: {
          select: {
            title: true,
            price: true,
            creator: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    })

    const data = enrollments.map((e) => ({
      transactionDate: e.startedAt,
      courseTitle: e.course.title,
      instructor: `${e.course.creator.firstName} ${e.course.creator.lastName}`,
      studentEmail: e.user.email,
      studentName: `${e.user.firstName} ${e.user.lastName}`,
      amount: Number(e.course.price),
      currency: 'EUR',
      status: 'Completed',
    }))

    // Calculate summary
    const summary = {
      totalRevenue: data.reduce((sum, item) => sum + item.amount, 0),
      totalTransactions: data.length,
      averageTransactionValue:
        data.length > 0 ? data.reduce((sum, item) => sum + item.amount, 0) / data.length : 0,
    }

    if (format === 'csv') {
      return this.convertToCSV(data)
    }

    return {
      summary,
      transactions: data,
    }
  }

  /**
   * Generate instructor performance report
   */
  async generateInstructorReport(options: ReportOptions = {}) {
    const { format = 'json' } = options

    const instructors = await prisma.user.findMany({
      where: {
        role: {
          in: ['INSTRUCTOR', 'ADMIN'],
        },
      },
      include: {
        coursesCreated: {
          include: {
            _count: {
              select: {
                enrollments: true,
                reviews: true,
              },
            },
            enrollments: true,
          },
        },
      },
    })

    const data = instructors.map((instructor) => {
      const totalCourses = instructor.coursesCreated.length
      const totalEnrollments = instructor.coursesCreated.reduce(
        (sum, c) => sum + c._count.enrollments,
        0
      )
      const totalRevenue = instructor.coursesCreated.reduce(
        (sum, c) => sum + c._count.enrollments * Number(c.price),
        0
      )
      const avgRating =
        totalCourses > 0
          ? instructor.coursesCreated.reduce((sum, c) => sum + (c.averageRating || 0), 0) /
            totalCourses
          : 0

      return {
        instructorId: instructor.id,
        name: `${instructor.firstName} ${instructor.lastName}`,
        email: instructor.email,
        totalCourses,
        totalEnrollments,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageRating: Math.round(avgRating * 100) / 100,
        totalReviews: instructor.coursesCreated.reduce(
          (sum, c) => sum + c._count.reviews,
          0
        ),
      }
    })

    if (format === 'csv') {
      return this.convertToCSV(data)
    }

    return data
  }

  /**
   * Generate completion rate report
   */
  async generateCompletionRateReport(options: ReportOptions = {}) {
    const { format = 'json' } = options

    const courses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        enrollments: {
          select: {
            progress: true,
            startedAt: true,
            completedAt: true,
          },
        },
      },
    })

    const data = courses.map((course) => {
      const totalEnrollments = course.enrollments.length
      const completedEnrollments = course.enrollments.filter((e) => e.progress === 100).length

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
        completionRate:
          totalEnrollments > 0
            ? Math.round((completedEnrollments / totalEnrollments) * 100 * 10) / 10
            : 0,
        avgDaysToComplete: Math.round(avgDaysToComplete),
      }
    })

    if (format === 'csv') {
      return this.convertToCSV(data)
    }

    return data
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) {
      return ''
    }

    try {
      const parser = new Parser()
      return parser.parse(data)
    } catch (error) {
      console.error('Error converting to CSV:', error)
      throw new Error('Failed to convert data to CSV')
    }
  }

  /**
   * Generate comprehensive platform report
   */
  async generatePlatformReport(options: ReportOptions = {}) {
    const [
      enrollmentReport,
      courseReport,
      userReport,
      revenueReport,
      instructorReport,
      completionReport,
    ] = await Promise.all([
      this.generateEnrollmentReport(options),
      this.generateCoursePerformanceReport(options),
      this.generateUserActivityReport(options),
      this.generateRevenueReport(options),
      this.generateInstructorReport(options),
      this.generateCompletionRateReport(options),
    ])

    return {
      generatedAt: new Date(),
      timeRange: {
        startDate: options.startDate,
        endDate: options.endDate,
      },
      reports: {
        enrollments: enrollmentReport,
        courses: courseReport,
        users: userReport,
        revenue: revenueReport,
        instructors: instructorReport,
        completionRates: completionReport,
      },
    }
  }
}

export default new ReportingService()
