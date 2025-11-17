import { PrismaClient, ExamSessionStatus } from '@prisma/client'

const prisma = new PrismaClient()

interface StartExamData {
  assessmentId: string
  userId: string
}

interface UpdateSessionData {
  timeRemaining?: number
  timeElapsed?: number
  currentQuestion?: number
  answers?: any
}

interface ProctoringEvent {
  type: 'FULLSCREEN_EXIT' | 'TAB_SWITCH' | 'COPY_PASTE' | 'SUSPICIOUS'
  timestamp: Date
  details?: string
}

class TimedExamService {
  /**
   * Start a new timed exam session
   */
  async startExamSession(data: StartExamData) {
    // Get assessment details
    const assessment = await prisma.assessment.findUnique({
      where: { id: data.assessmentId },
    })

    if (!assessment) {
      throw new Error('Assessment not found')
    }

    if (!assessment.isTimedExam || !assessment.timeLimit) {
      throw new Error('This assessment is not a timed exam')
    }

    // Check if user has active session
    const existingSession = await prisma.examSession.findFirst({
      where: {
        assessmentId: data.assessmentId,
        userId: data.userId,
        status: {
          in: ['ACTIVE', 'PAUSED'],
        },
      },
    })

    if (existingSession) {
      throw new Error('You already have an active session for this exam')
    }

    // Check max attempts
    if (assessment.maxAttempts) {
      const attemptCount = await prisma.assessmentAttempt.count({
        where: {
          assessmentId: data.assessmentId,
          userId: data.userId,
        },
      })

      if (attemptCount >= assessment.maxAttempts) {
        throw new Error('Maximum attempts exceeded')
      }
    }

    // Calculate time limit in seconds
    const timeLimitSeconds = assessment.timeLimit * 60

    // Calculate expiration time
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + timeLimitSeconds)

    // Create exam session
    const session = await prisma.examSession.create({
      data: {
        assessmentId: data.assessmentId,
        userId: data.userId,
        timeLimit: timeLimitSeconds,
        timeRemaining: timeLimitSeconds,
        expiresAt,
      },
    })

    return session
  }

  /**
   * Get active exam session
   */
  async getActiveSession(userId: string, assessmentId: string) {
    const session = await prisma.examSession.findFirst({
      where: {
        userId,
        assessmentId,
        status: {
          in: ['ACTIVE', 'PAUSED'],
        },
      },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            timeLimit: true,
            isTimedExam: true,
            autoSubmit: true,
            showTimer: true,
            allowPause: true,
            proctorMode: true,
            requireFullscreen: true,
            preventCopyPaste: true,
            showOneQuestion: true,
            allowBackNavigation: true,
          },
        },
      },
    })

    return session
  }

  /**
   * Update exam session
   */
  async updateSession(sessionId: string, data: UpdateSessionData) {
    const session = await prisma.examSession.update({
      where: { id: sessionId },
      data: {
        timeRemaining: data.timeRemaining,
        timeElapsed: data.timeElapsed,
        currentQuestion: data.currentQuestion,
        answers: data.answers,
        lastActivity: new Date(),
      },
    })

    return session
  }

  /**
   * Pause exam session
   */
  async pauseSession(sessionId: string) {
    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        assessment: true,
      },
    })

    if (!session) {
      throw new Error('Session not found')
    }

    if (!session.assessment.allowPause) {
      throw new Error('This exam cannot be paused')
    }

    if (session.status !== 'ACTIVE') {
      throw new Error('Session is not active')
    }

    // Update session
    const updatedSession = await prisma.examSession.update({
      where: { id: sessionId },
      data: {
        status: 'PAUSED',
        pausedAt: new Date(),
      },
    })

    return updatedSession
  }

  /**
   * Resume exam session
   */
  async resumeSession(sessionId: string) {
    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new Error('Session not found')
    }

    if (session.status !== 'PAUSED') {
      throw new Error('Session is not paused')
    }

    // Check if session expired
    if (new Date() > session.expiresAt) {
      await this.expireSession(sessionId)
      throw new Error('Session has expired')
    }

    const updatedSession = await prisma.examSession.update({
      where: { id: sessionId },
      data: {
        status: 'ACTIVE',
        pausedAt: null,
      },
    })

    return updatedSession
  }

  /**
   * Record proctoring event
   */
  async recordProctoringEvent(sessionId: string, event: ProctoringEvent) {
    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new Error('Session not found')
    }

    // Update counters based on event type
    const updates: any = {
      lastActivity: new Date(),
    }

    if (event.type === 'FULLSCREEN_EXIT') {
      updates.fullscreenExits = session.fullscreenExits + 1
    } else if (event.type === 'TAB_SWITCH') {
      updates.tabSwitches = session.tabSwitches + 1
    }

    // Add to suspicious activity log
    const suspiciousActivity = (session.suspiciousActivity as any[]) || []
    suspiciousActivity.push({
      type: event.type,
      timestamp: event.timestamp,
      details: event.details,
    })
    updates.suspiciousActivity = suspiciousActivity

    const updatedSession = await prisma.examSession.update({
      where: { id: sessionId },
      data: updates,
    })

    return updatedSession
  }

  /**
   * Complete exam session
   */
  async completeSession(sessionId: string, answers: any) {
    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        assessment: {
          include: {
            questions: true,
          },
        },
      },
    })

    if (!session) {
      throw new Error('Session not found')
    }

    if (session.status === 'COMPLETED') {
      throw new Error('Session already completed')
    }

    // Calculate score
    let earnedPoints = 0
    let totalPoints = 0

    session.assessment.questions.forEach((question) => {
      totalPoints += question.points
      const userAnswer = answers[question.id]

      // Simple scoring logic (can be expanded)
      if (userAnswer !== undefined && userAnswer !== null) {
        const correctAnswers = question.correctAnswers as any[]
        if (JSON.stringify(userAnswer) === JSON.stringify(correctAnswers)) {
          earnedPoints += question.points
        }
      }
    })

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
    const passed = score >= session.assessment.passingScore

    // Create assessment attempt
    const attempt = await prisma.assessmentAttempt.create({
      data: {
        assessmentId: session.assessmentId,
        userId: session.userId,
        answers,
        score,
        totalPoints,
        earnedPoints,
        passed,
        timeSpent: session.timeElapsed,
        pauseCount: session.status === 'PAUSED' ? 1 : 0,
        warningsIssued: session.suspiciousActivity || [],
        completedAt: new Date(),
      },
    })

    // Update session
    const updatedSession = await prisma.examSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        attemptId: attempt.id,
        answers,
      },
    })

    return {
      session: updatedSession,
      attempt,
    }
  }

  /**
   * Auto-submit exam when time expires
   */
  async expireSession(sessionId: string) {
    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        assessment: true,
      },
    })

    if (!session) {
      throw new Error('Session not found')
    }

    // If autoSubmit is enabled, complete the exam
    if (session.assessment.autoSubmit) {
      const answers = session.answers || {}
      return await this.completeSession(sessionId, answers)
    } else {
      // Just mark as expired
      const updatedSession = await prisma.examSession.update({
        where: { id: sessionId },
        data: {
          status: 'EXPIRED',
          completedAt: new Date(),
        },
      })

      return { session: updatedSession }
    }
  }

  /**
   * Check and expire sessions that have passed their expiration time
   */
  async checkExpiredSessions() {
    const now = new Date()

    const expiredSessions = await prisma.examSession.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'PAUSED'],
        },
        expiresAt: {
          lte: now,
        },
      },
      include: {
        assessment: true,
      },
    })

    const results = []

    for (const session of expiredSessions) {
      try {
        const result = await this.expireSession(session.id)
        results.push(result)
      } catch (error) {
        console.error(`Error expiring session ${session.id}:`, error)
      }
    }

    return results
  }

  /**
   * Abandon session (user left without finishing)
   */
  async abandonSession(sessionId: string) {
    const updatedSession = await prisma.examSession.update({
      where: { id: sessionId },
      data: {
        status: 'ABANDONED',
        completedAt: new Date(),
      },
    })

    return updatedSession
  }

  /**
   * Get session statistics for instructor
   */
  async getSessionStatistics(assessmentId: string) {
    const sessions = await prisma.examSession.findMany({
      where: { assessmentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    const totalSessions = sessions.length
    const completed = sessions.filter((s) => s.status === 'COMPLETED').length
    const expired = sessions.filter((s) => s.status === 'EXPIRED').length
    const abandoned = sessions.filter((s) => s.status === 'ABANDONED').length
    const active = sessions.filter((s) =>
      ['ACTIVE', 'PAUSED'].includes(s.status)
    ).length

    // Calculate average time
    const completedSessions = sessions.filter((s) => s.status === 'COMPLETED')
    const avgTimeSpent =
      completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => sum + s.timeElapsed, 0) /
          completedSessions.length
        : 0

    // Proctoring statistics
    const totalFullscreenExits = sessions.reduce(
      (sum, s) => sum + s.fullscreenExits,
      0
    )
    const totalTabSwitches = sessions.reduce((sum, s) => sum + s.tabSwitches, 0)

    return {
      totalSessions,
      completed,
      expired,
      abandoned,
      active,
      avgTimeSpent: Math.round(avgTimeSpent),
      proctoring: {
        totalFullscreenExits,
        totalTabSwitches,
        sessionsWithWarnings: sessions.filter(
          (s) => s.fullscreenExits > 0 || s.tabSwitches > 0
        ).length,
      },
      sessions: sessions.map((s) => ({
        id: s.id,
        user: s.user,
        status: s.status,
        timeElapsed: s.timeElapsed,
        fullscreenExits: s.fullscreenExits,
        tabSwitches: s.tabSwitches,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
      })),
    }
  }
}

export default new TimedExamService()
