import { prisma } from '@edu-platforma/database'
import { BadgeType } from '@prisma/client'
import { notificationService } from './notificationService'

export class AchievementService {
  async getUserAchievements(userId: string) {
    const achievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { earnedAt: 'desc' },
    })

    return achievements
  }

  async getUserBadges(userId: string) {
    const badges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: 'desc' },
    })

    return badges
  }

  async checkAndAwardAchievements(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            enrollments: true,
            certificates: true,
            forumPosts: true,
            forumComments: true,
            reviews: true,
          },
        },
      },
    })

    if (!user) return

    const achievements = await prisma.achievement.findMany()

    for (const achievement of achievements) {
      const criteria = achievement.criteria as any

      // Check if user already has this achievement
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
      })

      if (existing) continue

      let shouldAward = false

      // Check different criteria types
      if (criteria.type === 'courses_completed' && user._count.certificates >= criteria.count) {
        shouldAward = true
      } else if (criteria.type === 'courses_enrolled' && user._count.enrollments >= criteria.count) {
        shouldAward = true
      } else if (criteria.type === 'points_earned' && user.totalPoints >= criteria.count) {
        shouldAward = true
      } else if (criteria.type === 'streak_days' && user.longestStreak >= criteria.count) {
        shouldAward = true
      } else if (criteria.type === 'forum_posts' && user._count.forumPosts >= criteria.count) {
        shouldAward = true
      } else if (criteria.type === 'reviews_written' && user._count.reviews >= criteria.count) {
        shouldAward = true
      }

      if (shouldAward) {
        await this.awardAchievement(userId, achievement.id)
      }
    }
  }

  async awardAchievement(userId: string, achievementId: string) {
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    })

    if (!achievement) return

    // Create user achievement
    const userAchievement = await prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
      },
      include: {
        achievement: true,
      },
    })

    // Award points
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: {
          increment: achievement.points,
        },
      },
    })

    // Send notification
    await notificationService.notifyAchievement(userId, achievement.name, achievement.id)

    return userAchievement
  }

  async checkAndAwardBadges(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            enrollments: true,
            certificates: true,
            forumPosts: true,
            forumComments: true,
            reviews: true,
          },
        },
        userAchievements: true,
        userBadges: true,
      },
    })

    if (!user) return

    const badges = await prisma.badge.findMany()

    for (const badge of badges) {
      // Check if user already has this badge
      const existing = user.userBadges.find((ub) => ub.badgeId === badge.id)
      if (existing) continue

      const criteria = badge.criteria as any
      let shouldAward = false

      // Badge-specific criteria
      if (badge.type === 'COMPLETION') {
        if (criteria.type === 'complete_courses' && user._count.certificates >= criteria.count) {
          shouldAward = true
        } else if (criteria.type === 'complete_learning_path') {
          const completedPaths = await prisma.userLearningPath.count({
            where: {
              userId,
              isCompleted: true,
            },
          })
          if (completedPaths >= criteria.count) {
            shouldAward = true
          }
        }
      } else if (badge.type === 'STREAK') {
        if (user.currentStreak >= criteria.days || user.longestStreak >= criteria.days) {
          shouldAward = true
        }
      } else if (badge.type === 'SOCIAL') {
        const totalSocial = user._count.forumPosts + user._count.forumComments + user._count.reviews
        if (totalSocial >= criteria.count) {
          shouldAward = true
        }
      } else if (badge.type === 'SKILL') {
        // Check for specific category completion
        if (criteria.categoryId) {
          const categoryCompletion = await prisma.certificate.count({
            where: {
              userId,
              course: {
                categoryId: criteria.categoryId,
              },
            },
          })
          if (categoryCompletion >= criteria.count) {
            shouldAward = true
          }
        }
      }

      if (shouldAward) {
        await this.awardBadge(userId, badge.id)
      }
    }
  }

  async awardBadge(userId: string, badgeId: string) {
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
    })

    if (!badge) return

    const userBadge = await prisma.userBadge.create({
      data: {
        userId,
        badgeId,
      },
      include: {
        badge: true,
      },
    })

    // Award points
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: {
          increment: badge.pointsValue,
        },
      },
    })

    // Send notification
    await notificationService.notifyBadge(userId, badge.name, badge.id)

    return userBadge
  }

  async getAllAchievements() {
    const achievements = await prisma.achievement.findMany({
      include: {
        _count: {
          select: {
            userAchievements: true,
          },
        },
      },
      orderBy: { points: 'desc' },
    })

    return achievements
  }

  async getAllBadges() {
    const badges = await prisma.badge.findMany({
      include: {
        _count: {
          select: {
            userBadges: true,
          },
        },
      },
      orderBy: { pointsValue: 'desc' },
    })

    return badges
  }

  async getUserStats(userId: string) {
    const [achievements, badges, user] = await Promise.all([
      this.getUserAchievements(userId),
      this.getUserBadges(userId),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          totalPoints: true,
          level: true,
          currentStreak: true,
          longestStreak: true,
          _count: {
            select: {
              certificates: true,
              enrollments: true,
              forumPosts: true,
              reviews: true,
            },
          },
        },
      }),
    ])

    return {
      achievements,
      badges,
      stats: user,
    }
  }
}

export const achievementService = new AchievementService()
