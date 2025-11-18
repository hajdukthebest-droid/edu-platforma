import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import { Prisma, LiveSessionStatus } from '@prisma/client'
import { notificationService } from './notificationService'
import { scheduleSessionReminder, cancelSessionReminders } from './notificationScheduler'

interface CreateSessionData {
  courseId?: string
  title: string
  description?: string
  scheduledStartTime: Date
  scheduledEndTime: Date
  youtubeVideoId?: string
  maxAttendees?: number
  isRecorded?: boolean
  allowQuestions?: boolean
  chatEnabled?: boolean
}

interface UpdateSessionData {
  title?: string
  description?: string
  scheduledStartTime?: Date
  scheduledEndTime?: Date
  youtubeVideoId?: string
  maxAttendees?: number
  isRecorded?: boolean
  allowQuestions?: boolean
  chatEnabled?: boolean
}

export class LiveSessionService {
  // Create a new live session
  async createSession(instructorId: string, data: CreateSessionData) {
    const session = await prisma.liveSession.create({
      data: {
        ...data,
        instructorId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    // Schedule notification reminders (1 hour and 15 minutes before)
    await scheduleSessionReminder(session.id, data.scheduledStartTime)

    return session
  }

  // Update session details
  async updateSession(sessionId: string, instructorId: string, data: UpdateSessionData) {
    const session = await prisma.liveSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new AppError(404, 'Session not found')
    }

    if (session.instructorId !== instructorId) {
      throw new AppError(403, 'Only the instructor can update this session')
    }

    if (session.status === 'LIVE') {
      throw new AppError(400, 'Cannot update a live session')
    }

    const updated = await prisma.liveSession.update({
      where: { id: sessionId },
      data,
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    return updated
  }

  // Start a live session
  async startSession(sessionId: string, instructorId: string) {
    const session = await prisma.liveSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new AppError(404, 'Session not found')
    }

    if (session.instructorId !== instructorId) {
      throw new AppError(403, 'Only the instructor can start this session')
    }

    if (session.status === 'LIVE') {
      throw new AppError(400, 'Session is already live')
    }

    if (session.status === 'ENDED') {
      throw new AppError(400, 'Session has already ended')
    }

    const updated = await prisma.liveSession.update({
      where: { id: sessionId },
      data: {
        status: 'LIVE',
        actualStartTime: new Date(),
      },
    })

    // Notify all enrolled students (if courseId exists)
    if (session.courseId) {
      // Get all enrolled users
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId: session.courseId },
        select: { userId: true },
      })

      // Send notifications
      for (const enrollment of enrollments) {
        await notificationService.create({
          userId: enrollment.userId,
          type: 'SYSTEM',
          title: 'Live Session Started!',
          message: `${session.title} is now live!`,
          link: `/live/${sessionId}`,
        })
      }
    }

    return updated
  }

  // End a live session
  async endSession(
    sessionId: string,
    instructorId: string,
    data?: { recordingUrl?: string }
  ) {
    const session = await prisma.liveSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new AppError(404, 'Session not found')
    }

    if (session.instructorId !== instructorId) {
      throw new AppError(403, 'Only the instructor can end this session')
    }

    if (session.status !== 'LIVE') {
      throw new AppError(400, 'Only live sessions can be ended')
    }

    const updated = await prisma.liveSession.update({
      where: { id: sessionId },
      data: {
        status: 'ENDED',
        actualEndTime: new Date(),
        ...(data?.recordingUrl && { recordingUrl: data.recordingUrl }),
      },
    })

    return updated
  }

  // Cancel a session
  async cancelSession(sessionId: string, instructorId: string) {
    const session = await prisma.liveSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new AppError(404, 'Session not found')
    }

    if (session.instructorId !== instructorId) {
      throw new AppError(403, 'Only the instructor can cancel this session')
    }

    if (session.status === 'LIVE') {
      throw new AppError(400, 'Cannot cancel a live session. End it instead.')
    }

    if (session.status === 'ENDED') {
      throw new AppError(400, 'Cannot cancel an ended session')
    }

    const updated = await prisma.liveSession.update({
      where: { id: sessionId },
      data: {
        status: 'CANCELLED',
      },
    })

    // Cancel scheduled reminders
    await cancelSessionReminders(sessionId)

    return updated
  }

  // Get sessions with filters
  async getSessions(
    filters?: {
      instructorId?: string
      courseId?: string
      status?: LiveSessionStatus
      upcoming?: boolean
    },
    page = 1,
    limit = 20
  ) {
    const where: Prisma.LiveSessionWhereInput = {
      ...(filters?.instructorId && { instructorId: filters.instructorId }),
      ...(filters?.courseId && { courseId: filters.courseId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.upcoming && {
        scheduledStartTime: {
          gte: new Date(),
        },
        status: {
          in: ['SCHEDULED'],
        },
      }),
    }

    const [sessions, total] = await Promise.all([
      prisma.liveSession.findMany({
        where,
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              attendance: true,
              messages: true,
            },
          },
        },
        orderBy: { scheduledStartTime: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.liveSession.count({ where }),
    ])

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // Get session by ID
  async getSessionById(sessionId: string, userId?: string) {
    const session = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            attendance: true,
            messages: true,
          },
        },
      },
    })

    if (!session) {
      throw new AppError(404, 'Session not found')
    }

    // Check if user is attending
    let isAttending = false
    if (userId) {
      const attendance = await prisma.liveSessionAttendance.findUnique({
        where: {
          sessionId_userId: {
            sessionId,
            userId,
          },
        },
      })
      isAttending = !!attendance && !attendance.leftAt
    }

    return {
      ...session,
      isAttending,
    }
  }

  // Join a session (create attendance record)
  async joinSession(sessionId: string, userId: string) {
    const session = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        _count: {
          select: {
            attendance: {
              where: {
                leftAt: null, // Currently attending
              },
            },
          },
        },
      },
    })

    if (!session) {
      throw new AppError(404, 'Session not found')
    }

    if (session.status !== 'LIVE') {
      throw new AppError(400, 'Session is not live')
    }

    // Check max attendees
    if (session.maxAttendees && session._count.attendance >= session.maxAttendees) {
      throw new AppError(400, 'Session is full')
    }

    // Check if already joined
    const existing = await prisma.liveSessionAttendance.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    })

    if (existing && !existing.leftAt) {
      // Already attending
      return existing
    }

    // Create or update attendance
    const attendance = await prisma.liveSessionAttendance.upsert({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
      create: {
        sessionId,
        userId,
      },
      update: {
        joinedAt: new Date(),
        leftAt: null,
      },
    })

    return attendance
  }

  // Leave a session
  async leaveSession(sessionId: string, userId: string, watchTime: number) {
    const attendance = await prisma.liveSessionAttendance.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    })

    if (!attendance) {
      throw new AppError(404, 'Attendance record not found')
    }

    const updated = await prisma.liveSessionAttendance.update({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
      data: {
        leftAt: new Date(),
        watchTime,
      },
    })

    return updated
  }

  // Send a message in chat
  async sendMessage(
    sessionId: string,
    userId: string,
    data: { message: string; isQuestion?: boolean }
  ) {
    const session = await prisma.liveSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new AppError(404, 'Session not found')
    }

    if (session.status !== 'LIVE') {
      throw new AppError(400, 'Can only send messages during live session')
    }

    if (!session.chatEnabled) {
      throw new AppError(400, 'Chat is disabled for this session')
    }

    const message = await prisma.liveSessionMessage.create({
      data: {
        sessionId,
        userId,
        message: data.message,
        isQuestion: data.isQuestion || false,
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
    })

    return message
  }

  // Get messages
  async getMessages(
    sessionId: string,
    filters?: { questionsOnly?: boolean },
    limit = 100
  ) {
    const messages = await prisma.liveSessionMessage.findMany({
      where: {
        sessionId,
        ...(filters?.questionsOnly && { isQuestion: true }),
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
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'asc' }],
      take: limit,
    })

    return messages
  }

  // Pin a message (instructor only)
  async pinMessage(messageId: string, instructorId: string) {
    const message = await prisma.liveSessionMessage.findUnique({
      where: { id: messageId },
      include: {
        session: true,
      },
    })

    if (!message) {
      throw new AppError(404, 'Message not found')
    }

    if (message.session.instructorId !== instructorId) {
      throw new AppError(403, 'Only the instructor can pin messages')
    }

    const updated = await prisma.liveSessionMessage.update({
      where: { id: messageId },
      data: {
        isPinned: !message.isPinned,
      },
    })

    return updated
  }

  // Mark question as answered
  async markQuestionAnswered(messageId: string, instructorId: string) {
    const message = await prisma.liveSessionMessage.findUnique({
      where: { id: messageId },
      include: {
        session: true,
      },
    })

    if (!message) {
      throw new AppError(404, 'Message not found')
    }

    if (message.session.instructorId !== instructorId) {
      throw new AppError(403, 'Only the instructor can mark questions as answered')
    }

    if (!message.isQuestion) {
      throw new AppError(400, 'This message is not a question')
    }

    const updated = await prisma.liveSessionMessage.update({
      where: { id: messageId },
      data: {
        isAnswered: true,
      },
    })

    return updated
  }

  // Get attendance for a session
  async getAttendance(sessionId: string, instructorId: string) {
    const session = await prisma.liveSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new AppError(404, 'Session not found')
    }

    if (session.instructorId !== instructorId) {
      throw new AppError(403, 'Only the instructor can view attendance')
    }

    const attendance = await prisma.liveSessionAttendance.findMany({
      where: { sessionId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    })

    return attendance
  }

  // Get session analytics
  async getSessionAnalytics(sessionId: string, instructorId: string) {
    const session = await prisma.liveSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new AppError(404, 'Session not found')
    }

    if (session.instructorId !== instructorId) {
      throw new AppError(403, 'Only the instructor can view analytics')
    }

    const [attendance, messages, questions] = await Promise.all([
      prisma.liveSessionAttendance.findMany({
        where: { sessionId },
      }),
      prisma.liveSessionMessage.count({
        where: { sessionId },
      }),
      prisma.liveSessionMessage.count({
        where: { sessionId, isQuestion: true },
      }),
    ])

    const totalAttendees = attendance.length
    const currentlyWatching = attendance.filter((a) => !a.leftAt).length
    const averageWatchTime =
      attendance.reduce((sum, a) => sum + a.watchTime, 0) / totalAttendees || 0
    const answeredQuestions = await prisma.liveSessionMessage.count({
      where: { sessionId, isQuestion: true, isAnswered: true },
    })

    return {
      totalAttendees,
      currentlyWatching,
      averageWatchTime,
      totalMessages: messages,
      totalQuestions: questions,
      answeredQuestions,
      answerRate: questions > 0 ? (answeredQuestions / questions) * 100 : 0,
    }
  }
}

export const liveSessionService = new LiveSessionService()
