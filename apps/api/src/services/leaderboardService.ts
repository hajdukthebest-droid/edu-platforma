import { prisma } from '@edu-platforma/database'

export class LeaderboardService {
  async getGlobalLeaderboard(limit = 50, offset = 0) {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        totalPoints: true,
        level: true,
        currentStreak: true,
        _count: {
          select: {
            enrollments: true,
            certificates: true,
            badges: true,
          },
        },
      },
      orderBy: {
        totalPoints: 'desc',
      },
      skip: offset,
      take: limit,
    })

    // Add rank
    const usersWithRank = users.map((user, index) => ({
      ...user,
      rank: offset + index + 1,
    }))

    return usersWithRank
  }

  async getUserRank(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalPoints: true,
      },
    })

    if (!user) {
      return null
    }

    // Count users with more points
    const rank = await prisma.user.count({
      where: {
        totalPoints: {
          gt: user.totalPoints,
        },
        isActive: true,
      },
    })

    return rank + 1
  }

  async getLeaderboardByPeriod(period: 'daily' | 'weekly' | 'monthly', limit = 50) {
    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'weekly':
        startDate.setDate(now.getDate() - 7)
        break
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1)
        break
    }

    // Get analytics events for points earned in period
    // This is a simplified version - in production, you'd track point changes in a separate table
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        lastActivityDate: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        totalPoints: true,
        level: true,
        currentStreak: true,
      },
      orderBy: {
        totalPoints: 'desc',
      },
      take: limit,
    })

    return users.map((user, index) => ({
      ...user,
      rank: index + 1,
    }))
  }

  async getTopPerformers(courseId?: string, limit = 10) {
    if (courseId) {
      // Course-specific leaderboard
      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId,
          status: 'COMPLETED',
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        take: limit,
      })

      return enrollments.map((enrollment, index) => ({
        rank: index + 1,
        user: enrollment.user,
        completedAt: enrollment.completedAt,
      }))
    }

    // Global top performers
    return this.getGlobalLeaderboard(limit, 0)
  }

  async getStreakLeaderboard(limit = 50) {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        currentStreak: {
          gt: 0,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        currentStreak: true,
        longestStreak: true,
        totalPoints: true,
        level: true,
      },
      orderBy: {
        currentStreak: 'desc',
      },
      take: limit,
    })

    return users.map((user, index) => ({
      ...user,
      rank: index + 1,
    }))
  }
}

export const leaderboardService = new LeaderboardService()
