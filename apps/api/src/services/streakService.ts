import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Milestone thresholds and rewards
const MILESTONES = [
  { days: 7, rewardType: 'points', rewardValue: '100', label: '1 Week' },
  { days: 14, rewardType: 'freeze_day', rewardValue: '1', label: '2 Weeks' },
  { days: 30, rewardType: 'points', rewardValue: '500', label: '1 Month' },
  { days: 60, rewardType: 'freeze_day', rewardValue: '2', label: '2 Months' },
  { days: 100, rewardType: 'badge', rewardValue: 'streak_100', label: '100 Days' },
  { days: 180, rewardType: 'points', rewardValue: '1000', label: '6 Months' },
  { days: 365, rewardType: 'badge', rewardValue: 'streak_365', label: '1 Year' },
]

interface RecordActivityData {
  userId: string
  minutesLearned?: number
  lessonsCompleted?: number
  quizzesCompleted?: number
  pointsEarned?: number
  courseId?: string
}

interface UpdateGoalsData {
  dailyGoalMinutes?: number
  dailyGoalLessons?: number
}

class StreakService {
  /**
   * Get or create learning streak for user
   */
  async getOrCreateStreak(userId: string) {
    let streak = await prisma.learningStreak.findUnique({
      where: { userId },
      include: {
        dailyActivities: {
          orderBy: { date: 'desc' },
          take: 30, // Last 30 days
        },
      },
    })

    if (!streak) {
      streak = await prisma.learningStreak.create({
        data: { userId },
        include: {
          dailyActivities: {
            orderBy: { date: 'desc' },
            take: 30,
          },
        },
      })
    }

    return streak
  }

  /**
   * Record learning activity and update streak
   */
  async recordActivity(data: RecordActivityData) {
    const streak = await this.getOrCreateStreak(data.userId)
    const today = this.getDateOnly(new Date())

    // Find or create today's activity
    let activity = await prisma.dailyActivity.findUnique({
      where: {
        streakId_date: {
          streakId: streak.id,
          date: today,
        },
      },
    })

    if (!activity) {
      activity = await prisma.dailyActivity.create({
        data: {
          streakId: streak.id,
          date: today,
          minutesLearned: 0,
          lessonsCompleted: 0,
          quizzesCompleted: 0,
          pointsEarned: 0,
        },
      })
    }

    // Update activity metrics
    const updatedActivity = await prisma.dailyActivity.update({
      where: { id: activity.id },
      data: {
        minutesLearned: activity.minutesLearned + (data.minutesLearned || 0),
        lessonsCompleted: activity.lessonsCompleted + (data.lessonsCompleted || 0),
        quizzesCompleted: activity.quizzesCompleted + (data.quizzesCompleted || 0),
        pointsEarned: activity.pointsEarned + (data.pointsEarned || 0),
        // Update course breakdown
        courseActivities: data.courseId
          ? this.updateCourseActivities(
              activity.courseActivities as any,
              data.courseId,
              data.minutesLearned || 0,
              data.lessonsCompleted || 0
            )
          : activity.courseActivities,
      },
    })

    // Check if daily goal is met
    const goalMet =
      updatedActivity.minutesLearned >= streak.dailyGoalMinutes ||
      updatedActivity.lessonsCompleted >= streak.dailyGoalLessons

    if (goalMet && !activity.goalMet) {
      await prisma.dailyActivity.update({
        where: { id: activity.id },
        data: { goalMet: true },
      })

      // Update streak
      await this.updateStreak(streak.id, data.userId)
    }

    return this.getOrCreateStreak(data.userId)
  }

  /**
   * Update streak count based on activity
   */
  private async updateStreak(streakId: string, userId: string) {
    const streak = await prisma.learningStreak.findUnique({
      where: { id: streakId },
    })

    if (!streak) return

    const today = this.getDateOnly(new Date())
    const yesterday = this.getDateOnly(new Date(Date.now() - 86400000))

    // Check if this is continuing a streak or starting new
    let newStreakCount = 1

    if (streak.lastActivityDate) {
      const lastDate = this.getDateOnly(streak.lastActivityDate)

      if (lastDate.getTime() === yesterday.getTime()) {
        // Continuing streak
        newStreakCount = streak.currentStreak + 1
      } else if (lastDate.getTime() === today.getTime()) {
        // Already counted today
        newStreakCount = streak.currentStreak
      }
      // Else streak is broken, start at 1
    }

    // Update streak
    const updatedStreak = await prisma.learningStreak.update({
      where: { id: streakId },
      data: {
        currentStreak: newStreakCount,
        longestStreak: Math.max(streak.longestStreak, newStreakCount),
        lastActivityDate: today,
        totalDaysActive: streak.totalDaysActive + (streak.lastActivityDate?.getTime() === today.getTime() ? 0 : 1),
      },
    })

    // Check for milestone achievements
    await this.checkMilestones(userId, newStreakCount)

    return updatedStreak
  }

  /**
   * Check and award milestone achievements
   */
  private async checkMilestones(userId: string, currentStreak: number) {
    for (const milestone of MILESTONES) {
      if (currentStreak >= milestone.days) {
        // Check if already awarded
        const existing = await prisma.streakReward.findUnique({
          where: {
            userId_milestone: {
              userId,
              milestone: milestone.days,
            },
          },
        })

        if (!existing) {
          // Award the milestone
          await prisma.streakReward.create({
            data: {
              userId,
              milestone: milestone.days,
              rewardType: milestone.rewardType,
              rewardValue: milestone.rewardValue,
            },
          })

          // Add to streak milestones
          await prisma.learningStreak.update({
            where: { userId },
            data: {
              streakMilestones: {
                push: milestone.days,
              },
              // Add freeze days if reward type is freeze_day
              ...(milestone.rewardType === 'freeze_day' && {
                freezeDaysAvailable: {
                  increment: parseInt(milestone.rewardValue),
                },
              }),
            },
          })

          // Add points if reward type is points
          if (milestone.rewardType === 'points') {
            await prisma.user.update({
              where: { id: userId },
              data: {
                totalPoints: {
                  increment: parseInt(milestone.rewardValue),
                },
              },
            })
          }
        }
      }
    }
  }

  /**
   * Use a freeze day to protect streak
   */
  async useFreeze(userId: string) {
    const streak = await this.getOrCreateStreak(userId)

    if (streak.freezeDaysAvailable <= 0) {
      throw new Error('No freeze days available')
    }

    const yesterday = this.getDateOnly(new Date(Date.now() - 86400000))

    // Create activity for yesterday as frozen
    await prisma.dailyActivity.upsert({
      where: {
        streakId_date: {
          streakId: streak.id,
          date: yesterday,
        },
      },
      create: {
        streakId: streak.id,
        date: yesterday,
        usedFreeze: true,
        goalMet: true,
      },
      update: {
        usedFreeze: true,
        goalMet: true,
      },
    })

    // Update streak
    const updatedStreak = await prisma.learningStreak.update({
      where: { userId },
      data: {
        freezeDaysAvailable: { decrement: 1 },
        freezeDaysUsed: { increment: 1 },
        lastActivityDate: yesterday,
      },
    })

    return updatedStreak
  }

  /**
   * Update daily goals
   */
  async updateGoals(userId: string, data: UpdateGoalsData) {
    const streak = await prisma.learningStreak.update({
      where: { userId },
      data: {
        ...(data.dailyGoalMinutes !== undefined && { dailyGoalMinutes: data.dailyGoalMinutes }),
        ...(data.dailyGoalLessons !== undefined && { dailyGoalLessons: data.dailyGoalLessons }),
      },
      include: {
        dailyActivities: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    })

    return streak
  }

  /**
   * Get streak statistics
   */
  async getStatistics(userId: string) {
    const streak = await this.getOrCreateStreak(userId)

    // Get weekly stats
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const weeklyActivities = await prisma.dailyActivity.findMany({
      where: {
        streakId: streak.id,
        date: { gte: this.getDateOnly(weekAgo) },
      },
      orderBy: { date: 'asc' },
    })

    // Get monthly stats
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)

    const monthlyActivities = await prisma.dailyActivity.findMany({
      where: {
        streakId: streak.id,
        date: { gte: this.getDateOnly(monthAgo) },
      },
      orderBy: { date: 'asc' },
    })

    // Calculate stats
    const weeklyStats = this.calculatePeriodStats(weeklyActivities)
    const monthlyStats = this.calculatePeriodStats(monthlyActivities)

    // Get available rewards
    const rewards = await prisma.streakReward.findMany({
      where: { userId },
      orderBy: { milestone: 'asc' },
    })

    // Get upcoming milestones
    const upcomingMilestones = MILESTONES.filter(
      (m) => m.days > streak.currentStreak
    ).slice(0, 3)

    return {
      streak,
      weeklyStats,
      monthlyStats,
      rewards,
      upcomingMilestones: upcomingMilestones.map((m) => ({
        ...m,
        daysRemaining: m.days - streak.currentStreak,
      })),
    }
  }

  /**
   * Get activity calendar
   */
  async getActivityCalendar(userId: string, year: number, month: number) {
    const streak = await this.getOrCreateStreak(userId)

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const activities = await prisma.dailyActivity.findMany({
      where: {
        streakId: streak.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    })

    // Create calendar map
    const calendar: Record<string, any> = {}
    activities.forEach((activity) => {
      const dateKey = activity.date.toISOString().split('T')[0]
      calendar[dateKey] = {
        goalMet: activity.goalMet,
        minutesLearned: activity.minutesLearned,
        lessonsCompleted: activity.lessonsCompleted,
        usedFreeze: activity.usedFreeze,
      }
    })

    return calendar
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 10) {
    const streaks = await prisma.learningStreak.findMany({
      orderBy: { currentStreak: 'desc' },
      take: limit,
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
    })

    return streaks.map((streak, index) => ({
      rank: index + 1,
      userId: streak.userId,
      user: streak.user,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalDaysActive: streak.totalDaysActive,
    }))
  }

  /**
   * Check if streak is at risk (no activity today, had activity yesterday)
   */
  async checkStreakAtRisk(userId: string) {
    const streak = await this.getOrCreateStreak(userId)

    if (!streak.lastActivityDate || streak.currentStreak === 0) {
      return { atRisk: false }
    }

    const today = this.getDateOnly(new Date())
    const lastDate = this.getDateOnly(streak.lastActivityDate)

    // Check if last activity was yesterday and no activity today
    const yesterday = this.getDateOnly(new Date(Date.now() - 86400000))
    const atRisk = lastDate.getTime() === yesterday.getTime()

    // Check today's activity
    const todayActivity = await prisma.dailyActivity.findUnique({
      where: {
        streakId_date: {
          streakId: streak.id,
          date: today,
        },
      },
    })

    return {
      atRisk: atRisk && (!todayActivity || !todayActivity.goalMet),
      currentStreak: streak.currentStreak,
      freezeDaysAvailable: streak.freezeDaysAvailable,
      minutesToGoal: streak.dailyGoalMinutes - (todayActivity?.minutesLearned || 0),
      lessonsToGoal: streak.dailyGoalLessons - (todayActivity?.lessonsCompleted || 0),
    }
  }

  // Helper methods
  private getDateOnly(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  }

  private updateCourseActivities(
    existing: Record<string, any> | null,
    courseId: string,
    minutes: number,
    lessons: number
  ) {
    const activities = existing || {}
    if (!activities[courseId]) {
      activities[courseId] = { minutes: 0, lessons: 0 }
    }
    activities[courseId].minutes += minutes
    activities[courseId].lessons += lessons
    return activities
  }

  private calculatePeriodStats(activities: any[]) {
    return {
      totalMinutes: activities.reduce((sum, a) => sum + a.minutesLearned, 0),
      totalLessons: activities.reduce((sum, a) => sum + a.lessonsCompleted, 0),
      totalQuizzes: activities.reduce((sum, a) => sum + a.quizzesCompleted, 0),
      totalPoints: activities.reduce((sum, a) => sum + a.pointsEarned, 0),
      daysActive: activities.filter((a) => a.goalMet).length,
      averageMinutes: activities.length
        ? Math.round(activities.reduce((sum, a) => sum + a.minutesLearned, 0) / activities.length)
        : 0,
    }
  }
}

export default new StreakService()
