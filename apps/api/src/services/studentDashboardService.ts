import prisma from '@repo/database'
import { AppError } from '../utils/AppError'

interface DashboardStats {
  totalCourses: number
  completedCourses: number
  inProgressCourses: number
  totalLessonsCompleted: number
  totalMinutesLearned: number
  currentStreak: number
  longestStreak: number
  totalPoints: number
  certificatesEarned: number
}

interface CourseProgress {
  id: string
  title: string
  thumbnail: string | null
  progress: number
  lastAccessedAt: Date | null
  nextLesson: {
    id: string
    title: string
  } | null
}

interface UpcomingDeadline {
  id: string
  title: string
  type: 'assignment' | 'exam' | 'session'
  dueDate: Date
  courseTitle: string
  courseId: string
}

interface RecentAchievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: Date
  points: number
}

interface ActivityHeatmapData {
  date: string
  count: number
  minutesLearned: number
  lessonsCompleted: number
}

interface WeeklyProgress {
  week: string
  lessonsCompleted: number
  minutesLearned: number
  pointsEarned: number
}

class StudentDashboardService {
  /**
   * Get comprehensive dashboard data for a student
   */
  async getDashboard(userId: string) {
    const [
      stats,
      coursesInProgress,
      upcomingDeadlines,
      recentAchievements,
      weeklyProgress,
      recommendedCourses,
    ] = await Promise.all([
      this.getDashboardStats(userId),
      this.getCoursesInProgress(userId),
      this.getUpcomingDeadlines(userId),
      this.getRecentAchievements(userId),
      this.getWeeklyProgress(userId),
      this.getRecommendedCourses(userId),
    ])

    return {
      stats,
      coursesInProgress,
      upcomingDeadlines,
      recentAchievements,
      weeklyProgress,
      recommendedCourses,
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    // Get enrollments and progress
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            _count: {
              select: { lessons: true },
            },
          },
        },
      },
    })

    // Get completed lessons count
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId,
        completed: true,
      },
    })

    // Get streak data
    const streak = await prisma.learningStreak.findUnique({
      where: { userId },
    })

    // Get leaderboard entry for points
    const leaderboard = await prisma.leaderboardEntry.findFirst({
      where: {
        userId,
        type: 'OVERALL',
      },
    })

    // Get certificates count
    const certificatesCount = await prisma.certificate.count({
      where: { userId },
    })

    const totalCourses = enrollments.length
    const completedCourses = enrollments.filter((e) => e.completedAt !== null).length
    const inProgressCourses = totalCourses - completedCourses

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalLessonsCompleted: completedLessons,
      totalMinutesLearned: streak?.totalMinutesLearned || 0,
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      totalPoints: leaderboard?.points || 0,
      certificatesEarned: certificatesCount,
    }
  }

  /**
   * Get courses in progress with next lesson
   */
  async getCoursesInProgress(userId: string, limit = 5): Promise<CourseProgress[]> {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId,
        completedAt: null,
      },
      include: {
        course: {
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                title: true,
                orderIndex: true,
              },
            },
            _count: {
              select: { lessons: true },
            },
          },
        },
      },
      orderBy: { lastAccessedAt: 'desc' },
      take: limit,
    })

    const result: CourseProgress[] = []

    for (const enrollment of enrollments) {
      // Get completed lessons for this course
      const completedLessonIds = await prisma.lessonProgress.findMany({
        where: {
          userId,
          completed: true,
          lesson: {
            courseId: enrollment.courseId,
          },
        },
        select: { lessonId: true },
      })

      const completedSet = new Set(completedLessonIds.map((l) => l.lessonId))

      // Find next lesson (first uncompleted)
      const nextLesson = enrollment.course.lessons.find(
        (lesson) => !completedSet.has(lesson.id)
      )

      const totalLessons = enrollment.course._count.lessons
      const completedCount = completedSet.size
      const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

      result.push({
        id: enrollment.course.id,
        title: enrollment.course.title,
        thumbnail: enrollment.course.thumbnail,
        progress,
        lastAccessedAt: enrollment.lastAccessedAt,
        nextLesson: nextLesson
          ? { id: nextLesson.id, title: nextLesson.title }
          : null,
      })
    }

    return result
  }

  /**
   * Get upcoming deadlines (assignments, exams, sessions)
   */
  async getUpcomingDeadlines(userId: string, limit = 5): Promise<UpcomingDeadline[]> {
    const now = new Date()
    const deadlines: UpcomingDeadline[] = []

    // Get enrolled course IDs
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true },
    })
    const courseIds = enrollments.map((e) => e.courseId)

    // Get upcoming assignments
    const assignments = await prisma.assignment.findMany({
      where: {
        courseId: { in: courseIds },
        dueDate: { gte: now },
        status: 'PUBLISHED',
      },
      include: {
        course: { select: { title: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: limit,
    })

    for (const assignment of assignments) {
      deadlines.push({
        id: assignment.id,
        title: assignment.title,
        type: 'assignment',
        dueDate: assignment.dueDate,
        courseTitle: assignment.course.title,
        courseId: assignment.courseId,
      })
    }

    // Get upcoming timed exams
    const exams = await prisma.timedExam.findMany({
      where: {
        courseId: { in: courseIds },
        availableUntil: { gte: now },
        isPublished: true,
      },
      include: {
        course: { select: { title: true } },
      },
      orderBy: { availableUntil: 'asc' },
      take: limit,
    })

    for (const exam of exams) {
      if (exam.availableUntil) {
        deadlines.push({
          id: exam.id,
          title: exam.title,
          type: 'exam',
          dueDate: exam.availableUntil,
          courseTitle: exam.course.title,
          courseId: exam.courseId,
        })
      }
    }

    // Get upcoming live sessions
    const sessions = await prisma.liveSession.findMany({
      where: {
        courseId: { in: courseIds },
        scheduledAt: { gte: now },
        status: { not: 'CANCELLED' },
      },
      include: {
        course: { select: { title: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
    })

    for (const session of sessions) {
      deadlines.push({
        id: session.id,
        title: session.title,
        type: 'session',
        dueDate: session.scheduledAt,
        courseTitle: session.course.title,
        courseId: session.courseId,
      })
    }

    // Sort all deadlines by date and return top N
    return deadlines
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, limit)
  }

  /**
   * Get recent achievements
   */
  async getRecentAchievements(userId: string, limit = 5): Promise<RecentAchievement[]> {
    const achievements = await prisma.userAchievement.findMany({
      where: {
        userId,
        isCompleted: true,
      },
      include: {
        achievement: true,
      },
      orderBy: { completedAt: 'desc' },
      take: limit,
    })

    return achievements.map((ua) => ({
      id: ua.achievement.id,
      title: ua.achievement.title,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      unlockedAt: ua.completedAt!,
      points: ua.achievement.points,
    }))
  }

  /**
   * Get weekly progress for the last 8 weeks
   */
  async getWeeklyProgress(userId: string, weeks = 8): Promise<WeeklyProgress[]> {
    const streak = await prisma.learningStreak.findUnique({
      where: { userId },
    })

    if (!streak) {
      return []
    }

    // Get daily activities for the last N weeks
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - weeks * 7)

    const activities = await prisma.dailyActivity.findMany({
      where: {
        streakId: streak.id,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    })

    // Group by week
    const weeklyData: Map<string, WeeklyProgress> = new Map()

    for (const activity of activities) {
      const weekStart = this.getWeekStart(activity.date)
      const weekKey = weekStart.toISOString().split('T')[0]

      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, {
          week: weekKey,
          lessonsCompleted: 0,
          minutesLearned: 0,
          pointsEarned: 0,
        })
      }

      const week = weeklyData.get(weekKey)!
      week.lessonsCompleted += activity.lessonsCompleted
      week.minutesLearned += activity.minutesLearned
      week.pointsEarned += activity.pointsEarned
    }

    return Array.from(weeklyData.values()).sort(
      (a, b) => new Date(a.week).getTime() - new Date(b.week).getTime()
    )
  }

  /**
   * Get activity heatmap data for calendar view
   */
  async getActivityHeatmap(userId: string, year: number): Promise<ActivityHeatmapData[]> {
    const streak = await prisma.learningStreak.findUnique({
      where: { userId },
    })

    if (!streak) {
      return []
    }

    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)

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

    return activities.map((activity) => ({
      date: activity.date.toISOString().split('T')[0],
      count: activity.goalMet ? 1 : 0,
      minutesLearned: activity.minutesLearned,
      lessonsCompleted: activity.lessonsCompleted,
    }))
  }

  /**
   * Get recommended courses based on user activity
   */
  async getRecommendedCourses(userId: string, limit = 3) {
    // Get user's enrolled courses to exclude
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true },
    })
    const enrolledIds = enrollments.map((e) => e.courseId)

    // Get user's completed courses for domain preference
    const completedEnrollments = await prisma.enrollment.findMany({
      where: {
        userId,
        completedAt: { not: null },
      },
      include: {
        course: {
          select: { domainId: true },
        },
      },
    })

    const preferredDomains = [
      ...new Set(completedEnrollments.map((e) => e.course.domainId)),
    ]

    // Find courses in preferred domains that user hasn't enrolled in
    const recommendedCourses = await prisma.course.findMany({
      where: {
        id: { notIn: enrolledIds },
        isPublished: true,
        ...(preferredDomains.length > 0 && {
          domainId: { in: preferredDomains },
        }),
      },
      include: {
        instructor: {
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
      },
      orderBy: [
        { enrollments: { _count: 'desc' } },
        { averageRating: 'desc' },
      ],
      take: limit,
    })

    return recommendedCourses.map((course) => ({
      id: course.id,
      title: course.title,
      thumbnail: course.thumbnail,
      instructor: `${course.instructor.firstName} ${course.instructor.lastName}`,
      rating: course.averageRating,
      enrollmentCount: course._count.enrollments,
      price: course.price,
    }))
  }

  /**
   * Update user's daily learning goals
   */
  async updateGoals(
    userId: string,
    goals: { dailyGoalMinutes?: number; dailyGoalLessons?: number }
  ) {
    const streak = await prisma.learningStreak.findUnique({
      where: { userId },
    })

    if (!streak) {
      // Create streak with goals
      return prisma.learningStreak.create({
        data: {
          userId,
          dailyGoalMinutes: goals.dailyGoalMinutes || 15,
          dailyGoalLessons: goals.dailyGoalLessons || 1,
        },
      })
    }

    return prisma.learningStreak.update({
      where: { userId },
      data: {
        ...(goals.dailyGoalMinutes !== undefined && {
          dailyGoalMinutes: goals.dailyGoalMinutes,
        }),
        ...(goals.dailyGoalLessons !== undefined && {
          dailyGoalLessons: goals.dailyGoalLessons,
        }),
      },
    })
  }

  /**
   * Get learning insights and suggestions
   */
  async getLearningInsights(userId: string) {
    const streak = await prisma.learningStreak.findUnique({
      where: { userId },
      include: {
        dailyActivities: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    })

    if (!streak || streak.dailyActivities.length === 0) {
      return {
        insights: [],
        suggestions: [
          {
            type: 'start',
            message: 'Započnite svoje putovanje učenja danas!',
            action: 'Upišite se na svoj prvi tečaj',
          },
        ],
      }
    }

    const insights: { type: string; message: string; value?: number }[] = []
    const suggestions: { type: string; message: string; action: string }[] = []

    // Calculate average daily learning time
    const activeDays = streak.dailyActivities.filter((a) => a.minutesLearned > 0)
    const avgMinutes =
      activeDays.length > 0
        ? Math.round(
            activeDays.reduce((sum, a) => sum + a.minutesLearned, 0) / activeDays.length
          )
        : 0

    if (avgMinutes > 0) {
      insights.push({
        type: 'average_time',
        message: `Prosječno učite ${avgMinutes} minuta dnevno`,
        value: avgMinutes,
      })
    }

    // Best learning day
    const bestDay = activeDays.reduce(
      (best, current) =>
        current.minutesLearned > (best?.minutesLearned || 0) ? current : best,
      null as (typeof activeDays)[0] | null
    )

    if (bestDay && bestDay.minutesLearned > avgMinutes * 1.5) {
      insights.push({
        type: 'best_day',
        message: `Vaš najbolji dan: ${bestDay.minutesLearned} minuta učenja`,
        value: bestDay.minutesLearned,
      })
    }

    // Streak milestones
    if (streak.currentStreak >= 7 && !streak.streakMilestones.includes(7)) {
      suggestions.push({
        type: 'milestone',
        message: 'Blizu ste 7-dnevnog niza!',
        action: 'Nastavite učiti da otključate nagradu',
      })
    }

    // Goal completion rate
    const goalMetDays = streak.dailyActivities.filter((a) => a.goalMet).length
    const completionRate =
      streak.dailyActivities.length > 0
        ? Math.round((goalMetDays / streak.dailyActivities.length) * 100)
        : 0

    insights.push({
      type: 'goal_completion',
      message: `Ispunili ste dnevni cilj ${completionRate}% dana`,
      value: completionRate,
    })

    // Suggestions based on performance
    if (completionRate < 50) {
      suggestions.push({
        type: 'lower_goal',
        message: 'Razmislite o smanjenju dnevnog cilja',
        action: 'Postavite realniji cilj za bolju konzistentnost',
      })
    }

    if (streak.currentStreak === 0 && streak.longestStreak > 0) {
      suggestions.push({
        type: 'restart_streak',
        message: 'Vaš niz je prekinut',
        action: 'Započnite novi niz danas',
      })
    }

    return { insights, suggestions }
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
  }
}

export const studentDashboardService = new StudentDashboardService()
