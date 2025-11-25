import { PrismaClient, StudySessionStatus, GoalStatus, GoalType } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================
// INTERFACES
// ============================================

interface CreateStudyPlanData {
  userId: string
  weeklyHoursGoal?: number
  preferredTimes?: Record<string, string[]>
  studyPace?: string
  breakDuration?: number
  sessionDuration?: number
  timezone?: string
}

interface CreateStudySessionData {
  userId: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  duration: number
  courseId?: string
  lessonId?: string
  topics?: string[]
  reminderMinutes?: number
}

interface CreateStudyGoalData {
  userId: string
  title: string
  description?: string
  type: GoalType
  targetValue: number
  deadline?: Date
  courseId?: string
  categoryId?: string
}

interface CreateStudyBlockData {
  userId: string
  title: string
  description?: string
  isRecurring: boolean
  recurrenceRule?: string
  startTime: Date
  endTime: Date
  daysOfWeek: number[]
}

// ============================================
// STUDY PLANNER SERVICE
// ============================================

class StudyPlannerService {
  // ============================================
  // STUDY PLAN MANAGEMENT
  // ============================================

  /**
   * Get or create user's study plan
   */
  async getStudyPlan(userId: string) {
    let plan = await prisma.studyPlan.findUnique({
      where: { userId },
      include: {
        sessions: {
          where: { startTime: { gte: new Date() } },
          orderBy: { startTime: 'asc' },
          take: 10,
        },
        goals: {
          where: { status: 'ACTIVE' },
          orderBy: { deadline: 'asc' },
        },
        blocks: true,
      },
    })

    if (!plan) {
      plan = await prisma.studyPlan.create({
        data: { userId },
        include: {
          sessions: true,
          goals: true,
          blocks: true,
        },
      })
    }

    return plan
  }

  /**
   * Update study plan
   */
  async updateStudyPlan(userId: string, data: Partial<CreateStudyPlanData>) {
    return prisma.studyPlan.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
        preferredTimes: data.preferredTimes ?? undefined,
      },
      update: {
        ...data,
        preferredTimes: data.preferredTimes ?? undefined,
      },
    })
  }

  // ============================================
  // STUDY SESSIONS
  // ============================================

  /**
   * Create study session
   */
  async createStudySession(data: CreateStudySessionData) {
    const plan = await this.getStudyPlan(data.userId)

    return prisma.studySession.create({
      data: {
        studyPlanId: plan.id,
        userId: data.userId,
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        courseId: data.courseId,
        lessonId: data.lessonId,
        topics: data.topics ?? [],
        reminderMinutes: data.reminderMinutes ?? 15,
      },
    })
  }

  /**
   * Get user's study sessions
   */
  async getUserSessions(userId: string, startDate?: Date, endDate?: Date, status?: StudySessionStatus) {
    const where: Record<string, unknown> = { userId }

    if (startDate || endDate) {
      where.startTime = {}
      if (startDate) (where.startTime as any).gte = startDate
      if (endDate) (where.startTime as any).lte = endDate
    }

    if (status) {
      where.status = status
    }

    return prisma.studySession.findMany({
      where,
      orderBy: { startTime: 'asc' },
    })
  }

  /**
   * Get single session
   */
  async getSession(sessionId: string) {
    return prisma.studySession.findUnique({
      where: { id: sessionId },
    })
  }

  /**
   * Update study session
   */
  async updateStudySession(sessionId: string, userId: string, data: Partial<CreateStudySessionData>) {
    const session = await prisma.studySession.findFirst({
      where: { id: sessionId, userId },
    })

    if (!session) {
      throw new Error('Session not found')
    }

    return prisma.studySession.update({
      where: { id: sessionId },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        courseId: data.courseId,
        lessonId: data.lessonId,
        topics: data.topics,
        reminderMinutes: data.reminderMinutes,
      },
    })
  }

  /**
   * Delete study session
   */
  async deleteStudySession(sessionId: string, userId: string) {
    await prisma.studySession.deleteMany({
      where: { id: sessionId, userId },
    })
    return { success: true }
  }

  /**
   * Start study session
   */
  async startSession(sessionId: string, userId: string) {
    const session = await prisma.studySession.findFirst({
      where: { id: sessionId, userId },
    })

    if (!session) {
      throw new Error('Session not found')
    }

    return prisma.studySession.update({
      where: { id: sessionId },
      data: {
        status: 'IN_PROGRESS',
        actualStartTime: new Date(),
      },
    })
  }

  /**
   * Complete study session
   */
  async completeSession(sessionId: string, userId: string, notes?: string, outcome?: string) {
    const session = await prisma.studySession.findFirst({
      where: { id: sessionId, userId },
    })

    if (!session) {
      throw new Error('Session not found')
    }

    const actualEndTime = new Date()
    const actualStartTime = session.actualStartTime ?? session.startTime
    const actualMinutes = Math.floor((actualEndTime.getTime() - actualStartTime.getTime()) / 60000)

    // Update session
    await prisma.studySession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        actualEndTime,
        notes,
        outcome,
      },
    })

    // Update plan statistics
    await prisma.studyPlan.update({
      where: { userId },
      data: {
        totalStudyHours: { increment: actualMinutes / 60 },
        completedSessions: { increment: 1 },
      },
    })

    // Update daily statistics
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.studyStatistics.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      create: {
        userId,
        date: today,
        minutesStudied: actualMinutes,
        sessionsCompleted: 1,
      },
      update: {
        minutesStudied: { increment: actualMinutes },
        sessionsCompleted: { increment: 1 },
      },
    })

    return { success: true, minutesStudied: actualMinutes }
  }

  /**
   * Mark session as missed
   */
  async markSessionMissed(sessionId: string, userId: string) {
    await prisma.studySession.update({
      where: { id: sessionId },
      data: { status: 'MISSED' },
    })

    await prisma.studyPlan.update({
      where: { userId },
      data: { missedSessions: { increment: 1 } },
    })

    return { success: true }
  }

  // ============================================
  // STUDY GOALS
  // ============================================

  /**
   * Create study goal
   */
  async createStudyGoal(data: CreateStudyGoalData) {
    const plan = await this.getStudyPlan(data.userId)

    return prisma.studyGoal.create({
      data: {
        studyPlanId: plan.id,
        userId: data.userId,
        title: data.title,
        description: data.description,
        type: data.type,
        targetValue: data.targetValue,
        deadline: data.deadline,
        courseId: data.courseId,
        categoryId: data.categoryId,
      },
    })
  }

  /**
   * Get user's goals
   */
  async getUserGoals(userId: string, status?: GoalStatus) {
    const where: Record<string, unknown> = { userId }

    if (status) {
      where.status = status
    }

    return prisma.studyGoal.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { deadline: 'asc' },
      ],
    })
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(goalId: string, userId: string, increment: number) {
    const goal = await prisma.studyGoal.findFirst({
      where: { id: goalId, userId },
    })

    if (!goal) {
      throw new Error('Goal not found')
    }

    const newValue = goal.currentValue + increment
    const isCompleted = newValue >= goal.targetValue

    // Update progress history
    const today = new Date().toISOString().split('T')[0]
    const progressHistory = (goal.progressHistory as Record<string, number>) ?? {}
    progressHistory[today] = newValue

    return prisma.studyGoal.update({
      where: { id: goalId },
      data: {
        currentValue: newValue,
        status: isCompleted ? 'COMPLETED' : goal.status,
        completedAt: isCompleted ? new Date() : null,
        progressHistory,
      },
    })
  }

  /**
   * Update goal
   */
  async updateStudyGoal(goalId: string, userId: string, data: Partial<CreateStudyGoalData>) {
    const goal = await prisma.studyGoal.findFirst({
      where: { id: goalId, userId },
    })

    if (!goal) {
      throw new Error('Goal not found')
    }

    return prisma.studyGoal.update({
      where: { id: goalId },
      data: {
        title: data.title,
        description: data.description,
        targetValue: data.targetValue,
        deadline: data.deadline,
      },
    })
  }

  /**
   * Delete goal
   */
  async deleteStudyGoal(goalId: string, userId: string) {
    await prisma.studyGoal.deleteMany({
      where: { id: goalId, userId },
    })
    return { success: true }
  }

  /**
   * Toggle goal status
   */
  async toggleGoalStatus(goalId: string, userId: string) {
    const goal = await prisma.studyGoal.findFirst({
      where: { id: goalId, userId },
    })

    if (!goal) {
      throw new Error('Goal not found')
    }

    const newStatus = goal.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'

    return prisma.studyGoal.update({
      where: { id: goalId },
      data: { status: newStatus },
    })
  }

  // ============================================
  // STUDY BLOCKS (RECURRING)
  // ============================================

  /**
   * Create study block
   */
  async createStudyBlock(data: CreateStudyBlockData) {
    const plan = await this.getStudyPlan(data.userId)

    return prisma.studyBlock.create({
      data: {
        studyPlanId: plan.id,
        userId: data.userId,
        title: data.title,
        description: data.description,
        isRecurring: data.isRecurring,
        recurrenceRule: data.recurrenceRule,
        startTime: data.startTime,
        endTime: data.endTime,
        daysOfWeek: data.daysOfWeek,
      },
    })
  }

  /**
   * Get user's study blocks
   */
  async getUserStudyBlocks(userId: string) {
    return prisma.studyBlock.findMany({
      where: { userId },
      orderBy: { startTime: 'asc' },
    })
  }

  /**
   * Update study block
   */
  async updateStudyBlock(blockId: string, userId: string, data: Partial<CreateStudyBlockData>) {
    const block = await prisma.studyBlock.findFirst({
      where: { id: blockId, userId },
    })

    if (!block) {
      throw new Error('Study block not found')
    }

    return prisma.studyBlock.update({
      where: { id: blockId },
      data: {
        title: data.title,
        description: data.description,
        recurrenceRule: data.recurrenceRule,
        startTime: data.startTime,
        endTime: data.endTime,
        daysOfWeek: data.daysOfWeek,
      },
    })
  }

  /**
   * Delete study block
   */
  async deleteStudyBlock(blockId: string, userId: string) {
    await prisma.studyBlock.deleteMany({
      where: { id: blockId, userId },
    })
    return { success: true }
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get study statistics for a date range
   */
  async getStudyStatistics(userId: string, startDate: Date, endDate: Date) {
    return prisma.studyStatistics.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    })
  }

  /**
   * Get study summary
   */
  async getStudySummary(userId: string) {
    const plan = await prisma.studyPlan.findUnique({
      where: { userId },
    })

    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [weekStats, activeGoals, upcomingSessions] = await Promise.all([
      prisma.studyStatistics.findMany({
        where: {
          userId,
          date: { gte: weekAgo },
        },
      }),
      prisma.studyGoal.count({
        where: { userId, status: 'ACTIVE' },
      }),
      prisma.studySession.count({
        where: {
          userId,
          status: 'PLANNED',
          startTime: { gte: today },
        },
      }),
    ])

    const weeklyMinutes = weekStats.reduce((sum, day) => sum + day.minutesStudied, 0)
    const weeklyHours = weeklyMinutes / 60

    return {
      totalStudyHours: plan?.totalStudyHours ?? 0,
      completedSessions: plan?.completedSessions ?? 0,
      missedSessions: plan?.missedSessions ?? 0,
      weeklyHours,
      weeklyHoursGoal: plan?.weeklyHoursGoal,
      activeGoals,
      upcomingSessions,
      weekStats,
    }
  }

  /**
   * Get upcoming sessions for reminders
   */
  async getUpcomingSessionsForReminders(minutesAhead: number) {
    const now = new Date()
    const future = new Date(now.getTime() + minutesAhead * 60000)

    return prisma.studySession.findMany({
      where: {
        status: 'PLANNED',
        reminderSent: false,
        startTime: {
          gte: now,
          lte: future,
        },
      },
      include: {
        studyPlan: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true },
            },
          },
        },
      },
    })
  }

  /**
   * Mark reminder as sent
   */
  async markReminderSent(sessionId: string) {
    return prisma.studySession.update({
      where: { id: sessionId },
      data: { reminderSent: true },
    })
  }

  // ============================================
  // SESSION TEMPLATES
  // ============================================

  /**
   * Create session template
   */
  async createSessionTemplate(userId: string, data: {
    name: string
    description?: string
    duration: number
    topics: string[]
    notes?: string
    daysOfWeek?: number[]
    preferredTime?: string
  }) {
    return prisma.studySessionTemplate.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        duration: data.duration,
        topics: data.topics,
        notes: data.notes,
        daysOfWeek: data.daysOfWeek ?? [],
        preferredTime: data.preferredTime,
      },
    })
  }

  /**
   * Get user's templates
   */
  async getUserTemplates(userId: string) {
    return prisma.studySessionTemplate.findMany({
      where: { userId },
      orderBy: { usageCount: 'desc' },
    })
  }

  /**
   * Use template to create session
   */
  async createSessionFromTemplate(userId: string, templateId: string, startTime: Date) {
    const template = await prisma.studySessionTemplate.findFirst({
      where: { id: templateId, userId },
    })

    if (!template) {
      throw new Error('Template not found')
    }

    const endTime = new Date(startTime.getTime() + template.duration * 60000)

    const session = await this.createStudySession({
      userId,
      title: template.name,
      description: template.description ?? undefined,
      startTime,
      endTime,
      duration: template.duration,
      topics: template.topics,
    })

    // Increment usage count
    await prisma.studySessionTemplate.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } },
    })

    return session
  }

  /**
   * Delete template
   */
  async deleteSessionTemplate(templateId: string, userId: string) {
    await prisma.studySessionTemplate.deleteMany({
      where: { id: templateId, userId },
    })
    return { success: true }
  }

  // ============================================
  // CALENDAR INTEGRATION
  // ============================================

  /**
   * Get calendar integration
   */
  async getCalendarIntegration(userId: string, provider: string) {
    return prisma.calendarIntegration.findUnique({
      where: {
        userId_provider: { userId, provider },
      },
    })
  }

  /**
   * Create or update calendar integration
   */
  async upsertCalendarIntegration(
    userId: string,
    provider: string,
    data: {
      accessToken?: string
      refreshToken?: string
      expiresAt?: Date
      calendarId?: string
      calendarName?: string
      syncEnabled?: boolean
    }
  ) {
    return prisma.calendarIntegration.upsert({
      where: {
        userId_provider: { userId, provider },
      },
      create: {
        userId,
        provider,
        ...data,
      },
      update: data,
    })
  }

  /**
   * Delete calendar integration
   */
  async deleteCalendarIntegration(userId: string, provider: string) {
    await prisma.calendarIntegration.delete({
      where: {
        userId_provider: { userId, provider },
      },
    })
    return { success: true }
  }
}

export const studyPlannerService = new StudyPlannerService()
export default studyPlannerService
