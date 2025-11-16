import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import { UserRole, UserStatus } from '@prisma/client'

export class AdminService {
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalRevenue,
      recentUsers,
      recentEnrollments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.course.count(),
      prisma.course.count({ where: { status: 'PUBLISHED' } }),
      prisma.enrollment.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.enrollment.findMany({
        take: 10,
        orderBy: { enrolledAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
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
      stats: {
        totalUsers,
        activeUsers,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        totalRevenue: totalRevenue._sum.amount
          ? Number(totalRevenue._sum.amount)
          : 0,
      },
      recentUsers,
      recentEnrollments,
    }
  }

  async getUsers(page = 1, limit = 20, filters?: {
    search?: string
    role?: UserRole
    status?: UserStatus
  }) {
    const where: any = {}

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters?.role) {
      where.role = filters.role
    }

    if (filters?.status) {
      where.status = filters.status
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              enrollments: true,
              reviews: true,
              certificates: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async updateUserRole(userId: string, role: UserRole) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new AppError(404, 'User not found')
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    })

    return updatedUser
  }

  async updateUserStatus(userId: string, status: UserStatus) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new AppError(404, 'User not found')
    }

    const isActive = status === UserStatus.ACTIVE

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status,
        isActive,
      },
    })

    return updatedUser
  }

  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new AppError(404, 'User not found')
    }

    await prisma.user.delete({
      where: { id: userId },
    })
  }

  async getAllCourses(page = 1, limit = 20, filters?: {
    search?: string
    status?: string
    categoryId?: string
  }) {
    const where: any = {}

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
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
      }),
      prisma.course.count({ where }),
    ])

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async updateCourseStatus(courseId: string, status: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      throw new AppError(404, 'Course not found')
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { status },
    })

    return updatedCourse
  }

  async deleteCourse(courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      throw new AppError(404, 'Course not found')
    }

    await prisma.course.delete({
      where: { id: courseId },
    })
  }

  async getAnalytics(startDate?: Date, endDate?: Date) {
    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.createdAt = {
        gte: startDate,
        lte: endDate,
      }
    }

    const [
      userGrowth,
      enrollmentGrowth,
      revenueByMonth,
      topCourses,
      topInstructors,
    ] = await Promise.all([
      prisma.user.groupBy({
        by: ['createdAt'],
        _count: true,
      }),
      prisma.enrollment.groupBy({
        by: ['enrolledAt'],
        _count: true,
      }),
      prisma.payment.groupBy({
        by: ['createdAt'],
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
      prisma.course.findMany({
        take: 10,
        orderBy: { enrollmentCount: 'desc' },
        select: {
          id: true,
          title: true,
          enrollmentCount: true,
          averageRating: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      prisma.user.findMany({
        where: { role: { in: ['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'] } },
        take: 10,
        orderBy: { totalPoints: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          totalPoints: true,
          _count: {
            select: {
              coursesCreated: true,
            },
          },
        },
      }),
    ])

    return {
      userGrowth,
      enrollmentGrowth,
      revenueByMonth,
      topCourses,
      topInstructors,
    }
  }

  async getSystemHealth() {
    const [
      databaseSize,
      activeConnections,
      errorLogs,
      systemMetrics,
    ] = await Promise.all([
      // Get approximate database size
      prisma.$queryRaw`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `,
      // Get active sessions
      prisma.$queryRaw`
        SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active'
      `,
      // Get recent error count (mock - would integrate with logging system)
      Promise.resolve([{ count: 0 }]),
      // Get system metrics
      Promise.resolve({
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      }),
    ])

    return {
      database: {
        size: databaseSize,
        activeConnections,
      },
      errors: errorLogs,
      system: systemMetrics,
    }
  }
}

export const adminService = new AdminService()
