import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import { UserRole } from '@prisma/client'
import { cacheService } from './cacheService'

interface GetUsersQuery {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  isActive?: boolean
  sortBy?: 'createdAt' | 'lastLoginAt' | 'totalPoints'
  sortOrder?: 'asc' | 'desc'
}

export class AdminUserService {
  /**
   * Get all users with filtering and pagination
   */
  async getUsers(query: GetUsersQuery = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role) {
      where.role = role
    }

    if (isActive !== undefined) {
      where.isActive = isActive
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          isActive: true,
          isVerified: true,
          totalPoints: true,
          level: true,
          createdAt: true,
          lastLoginAt: true,
          profession: true,
          organization: true,
          _count: {
            select: {
              enrollments: true,
              certificates: true,
              createdCourses: true,
              forumPosts: true,
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

  /**
   * Get single user details
   */
  async getUserDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                thumbnail: true,
              },
            },
          },
          take: 5,
          orderBy: { enrolledAt: 'desc' },
        },
        certificates: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          take: 5,
          orderBy: { issuedAt: 'desc' },
        },
        createdCourses: {
          select: {
            id: true,
            title: true,
            status: true,
            enrollmentCount: true,
            createdAt: true,
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            course: {
              select: {
                title: true,
              },
            },
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        badges: {
          include: {
            badge: true,
          },
          take: 10,
        },
      },
    })

    if (!user) {
      throw new AppError(404, 'User not found')
    }

    return user
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: UserRole) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    })

    // Invalidate cache
    await cacheService.invalidateUser(userId)

    return user
  }

  /**
   * Suspend/activate user
   */
  async toggleUserStatus(userId: string, isActive: boolean) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    })

    // Invalidate cache
    await cacheService.invalidateUser(userId)

    return user
  }

  /**
   * Verify user
   */
  async verifyUser(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        emailVerified: new Date(),
      },
    })

    await cacheService.invalidateUser(userId)

    return user
  }

  /**
   * Delete user (soft delete - deactivate)
   */
  async deleteUser(userId: string) {
    // Check if user is super admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (user?.role === UserRole.SUPER_ADMIN) {
      throw new AppError(403, 'Cannot delete super admin')
    }

    // Soft delete - just deactivate
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
      },
    })

    await cacheService.invalidateUser(userId)
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    const [
      enrollmentsCount,
      completedCount,
      certificatesCount,
      totalPoints,
      forumPostsCount,
      achievementsCount,
    ] = await Promise.all([
      prisma.enrollment.count({ where: { userId } }),
      prisma.enrollment.count({
        where: {
          userId,
          status: 'COMPLETED',
        },
      }),
      prisma.certificate.count({ where: { userId } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { totalPoints: true },
      }),
      prisma.forumPost.count({ where: { authorId: userId } }),
      prisma.userAchievement.count({ where: { userId } }),
    ])

    return {
      enrollments: enrollmentsCount,
      completed: completedCount,
      completionRate:
        enrollmentsCount > 0
          ? ((completedCount / enrollmentsCount) * 100).toFixed(1)
          : 0,
      certificates: certificatesCount,
      totalPoints: totalPoints?.totalPoints || 0,
      forumPosts: forumPostsCount,
      achievements: achievementsCount,
    }
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(
    userIds: string[],
    updates: {
      role?: UserRole
      isActive?: boolean
      isVerified?: boolean
    }
  ) {
    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: updates,
    })

    // Invalidate cache for all users
    for (const userId of userIds) {
      await cacheService.invalidateUser(userId)
    }

    return result
  }
}

export const adminUserService = new AdminUserService()
