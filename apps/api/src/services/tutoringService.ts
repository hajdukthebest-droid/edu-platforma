import { PrismaClient, TutorStatus, TutoringSessionStatus, TutoringRequestStatus } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================
// INTERFACES
// ============================================

interface CreateTutorProfileData {
  userId: string
  headline?: string
  bio?: string
  hourlyRate?: number
  currency?: string
  subjects: string[]
  courseIds?: string[]
  languages?: string[]
  availableHours?: Record<string, { start: string; end: string }[]>
  timezone?: string
  maxSessionsPerWeek?: number
  qualifications?: string[]
  experience?: string
}

interface UpdateTutorProfileData {
  headline?: string
  bio?: string
  hourlyRate?: number
  currency?: string
  subjects?: string[]
  courseIds?: string[]
  languages?: string[]
  availableHours?: Record<string, { start: string; end: string }[]>
  timezone?: string
  maxSessionsPerWeek?: number
  qualifications?: string[]
  experience?: string
  isAvailable?: boolean
}

interface CreateTutoringRequestData {
  studentId: string
  title: string
  description: string
  subject: string
  courseId?: string
  lessonId?: string
  preferredLanguage?: string
  urgency?: string
  budgetMin?: number
  budgetMax?: number
  preferredSchedule?: Record<string, unknown>
  expiresAt?: Date
}

interface CreateTutoringSessionData {
  tutorId: string
  studentId: string
  requestId?: string
  title: string
  description?: string
  subject: string
  scheduledAt: Date
  duration: number
  meetingUrl?: string
  meetingProvider?: string
  rate?: number
}

interface CreateTutorApplicationData {
  requestId: string
  tutorId: string
  message: string
  proposedRate?: number
  proposedSchedule?: Record<string, unknown>
}

interface CreateTutoringReviewData {
  sessionId: string
  tutorId: string
  studentId: string
  overallRating: number
  knowledgeRating?: number
  communicationRating?: number
  punctualityRating?: number
  helpfulnessRating?: number
  comment?: string
}

interface TutorSearchFilters {
  subject?: string
  courseId?: string
  language?: string
  minRating?: number
  maxRate?: number
  isAvailable?: boolean
}

// ============================================
// TUTOR PROFILE MANAGEMENT
// ============================================

class TutoringService {
  /**
   * Create a tutor profile (apply to become a tutor)
   */
  async createTutorProfile(data: CreateTutorProfileData) {
    const existingProfile = await prisma.tutorProfile.findUnique({
      where: { userId: data.userId },
    })

    if (existingProfile) {
      throw new Error('User already has a tutor profile')
    }

    const profile = await prisma.tutorProfile.create({
      data: {
        userId: data.userId,
        headline: data.headline,
        bio: data.bio,
        hourlyRate: data.hourlyRate,
        currency: data.currency ?? 'EUR',
        subjects: data.subjects,
        courseIds: data.courseIds ?? [],
        languages: data.languages ?? ['hr'],
        availableHours: data.availableHours ?? null,
        timezone: data.timezone ?? 'Europe/Zagreb',
        maxSessionsPerWeek: data.maxSessionsPerWeek,
        qualifications: data.qualifications ?? [],
        experience: data.experience,
        status: 'PENDING',
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
        },
      },
    })

    return profile
  }

  /**
   * Update tutor profile
   */
  async updateTutorProfile(userId: string, data: UpdateTutorProfileData) {
    const profile = await prisma.tutorProfile.update({
      where: { userId },
      data: {
        headline: data.headline,
        bio: data.bio,
        hourlyRate: data.hourlyRate,
        currency: data.currency,
        subjects: data.subjects,
        courseIds: data.courseIds,
        languages: data.languages,
        availableHours: data.availableHours ?? undefined,
        timezone: data.timezone,
        maxSessionsPerWeek: data.maxSessionsPerWeek,
        qualifications: data.qualifications,
        experience: data.experience,
        isAvailable: data.isAvailable,
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
        },
      },
    })

    return profile
  }

  /**
   * Get tutor profile by user ID
   */
  async getTutorProfile(userId: string) {
    const profile = await prisma.tutorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, avatar: true, bio: true },
        },
        reviews: {
          where: { isPublic: true },
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { sessions: true, reviews: true },
        },
      },
    })

    return profile
  }

  /**
   * Get tutor profile by profile ID
   */
  async getTutorProfileById(profileId: string) {
    const profile = await prisma.tutorProfile.findUnique({
      where: { id: profileId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, avatar: true, bio: true },
        },
        reviews: {
          where: { isPublic: true },
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { sessions: true, reviews: true },
        },
      },
    })

    return profile
  }

  /**
   * Search for tutors with filters
   */
  async searchTutors(filters: TutorSearchFilters, page = 1, limit = 20) {
    const where: Record<string, unknown> = {
      status: 'APPROVED',
    }

    if (filters.isAvailable !== undefined) {
      where.isAvailable = filters.isAvailable
    }

    if (filters.subject) {
      where.subjects = { has: filters.subject }
    }

    if (filters.courseId) {
      where.courseIds = { has: filters.courseId }
    }

    if (filters.language) {
      where.languages = { has: filters.language }
    }

    if (filters.minRating) {
      where.averageRating = { gte: filters.minRating }
    }

    if (filters.maxRate) {
      where.hourlyRate = { lte: filters.maxRate }
    }

    const [tutors, total] = await Promise.all([
      prisma.tutorProfile.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
          },
          _count: {
            select: { sessions: true, reviews: true },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { averageRating: 'desc' },
          { totalSessions: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tutorProfile.count({ where }),
    ])

    return {
      tutors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Admin: Approve/reject tutor application
   */
  async updateTutorStatus(tutorId: string, status: TutorStatus, adminId: string) {
    const profile = await prisma.tutorProfile.update({
      where: { id: tutorId },
      data: {
        status,
        verifiedAt: status === 'APPROVED' ? new Date() : null,
        verifiedBy: status === 'APPROVED' ? adminId : null,
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    })

    return profile
  }

  /**
   * Get pending tutor applications (admin)
   */
  async getPendingTutorApplications(page = 1, limit = 20) {
    const [applications, total] = await Promise.all([
      prisma.tutorProfile.findMany({
        where: { status: 'PENDING' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tutorProfile.count({ where: { status: 'PENDING' } }),
    ])

    return {
      applications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  // ============================================
  // TUTORING REQUESTS
  // ============================================

  /**
   * Create a tutoring request (student seeking help)
   */
  async createTutoringRequest(data: CreateTutoringRequestData) {
    const request = await prisma.tutoringRequest.create({
      data: {
        studentId: data.studentId,
        title: data.title,
        description: data.description,
        subject: data.subject,
        courseId: data.courseId,
        lessonId: data.lessonId,
        preferredLanguage: data.preferredLanguage,
        urgency: data.urgency ?? 'normal',
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        preferredSchedule: data.preferredSchedule ?? null,
        expiresAt: data.expiresAt,
        status: 'OPEN',
      },
      include: {
        student: {
          select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
        },
      },
    })

    return request
  }

  /**
   * Get open tutoring requests (for tutors to browse)
   */
  async getOpenTutoringRequests(filters: { subject?: string; courseId?: string }, page = 1, limit = 20) {
    const where: Record<string, unknown> = {
      status: 'OPEN',
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    }

    if (filters.subject) {
      where.subject = filters.subject
    }

    if (filters.courseId) {
      where.courseId = filters.courseId
    }

    const [requests, total] = await Promise.all([
      prisma.tutoringRequest.findMany({
        where,
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          _count: {
            select: { applications: true },
          },
        },
        orderBy: [
          { urgency: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tutoringRequest.count({ where }),
    ])

    return {
      requests,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  /**
   * Get user's tutoring requests (as student)
   */
  async getUserTutoringRequests(userId: string, page = 1, limit = 20) {
    const [requests, total] = await Promise.all([
      prisma.tutoringRequest.findMany({
        where: { studentId: userId },
        include: {
          matchedTutor: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, avatar: true },
              },
            },
          },
          _count: {
            select: { applications: true, sessions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tutoringRequest.count({ where: { studentId: userId } }),
    ])

    return {
      requests,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  /**
   * Update tutoring request status
   */
  async updateTutoringRequestStatus(requestId: string, status: TutoringRequestStatus, userId: string) {
    const request = await prisma.tutoringRequest.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      throw new Error('Tutoring request not found')
    }

    if (request.studentId !== userId) {
      throw new Error('Not authorized to update this request')
    }

    return prisma.tutoringRequest.update({
      where: { id: requestId },
      data: { status },
    })
  }

  // ============================================
  // TUTOR APPLICATIONS
  // ============================================

  /**
   * Apply to a tutoring request
   */
  async applyToRequest(data: CreateTutorApplicationData) {
    // Check if tutor is approved
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { id: data.tutorId },
    })

    if (!tutorProfile || tutorProfile.status !== 'APPROVED') {
      throw new Error('Tutor must be approved to apply')
    }

    // Check if already applied
    const existingApplication = await prisma.tutorApplication.findUnique({
      where: {
        requestId_tutorId: {
          requestId: data.requestId,
          tutorId: data.tutorId,
        },
      },
    })

    if (existingApplication) {
      throw new Error('Already applied to this request')
    }

    const application = await prisma.tutorApplication.create({
      data: {
        requestId: data.requestId,
        tutorId: data.tutorId,
        message: data.message,
        proposedRate: data.proposedRate,
        proposedSchedule: data.proposedSchedule ?? null,
        status: 'pending',
      },
      include: {
        tutor: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
        },
      },
    })

    return application
  }

  /**
   * Get applications for a request (student view)
   */
  async getRequestApplications(requestId: string, userId: string) {
    const request = await prisma.tutoringRequest.findUnique({
      where: { id: requestId },
    })

    if (!request || request.studentId !== userId) {
      throw new Error('Not authorized to view applications')
    }

    return prisma.tutorApplication.findMany({
      where: { requestId },
      include: {
        tutor: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
  }

  /**
   * Accept a tutor application
   */
  async acceptApplication(applicationId: string, userId: string) {
    const application = await prisma.tutorApplication.findUnique({
      where: { id: applicationId },
      include: { request: true },
    })

    if (!application || application.request.studentId !== userId) {
      throw new Error('Not authorized')
    }

    // Update application status
    await prisma.tutorApplication.update({
      where: { id: applicationId },
      data: { status: 'accepted' },
    })

    // Reject other applications
    await prisma.tutorApplication.updateMany({
      where: {
        requestId: application.requestId,
        id: { not: applicationId },
      },
      data: { status: 'rejected' },
    })

    // Update request with matched tutor
    const updatedRequest = await prisma.tutoringRequest.update({
      where: { id: application.requestId },
      data: {
        status: 'MATCHED',
        matchedTutorId: application.tutorId,
        matchedAt: new Date(),
      },
    })

    return updatedRequest
  }

  // ============================================
  // TUTORING SESSIONS
  // ============================================

  /**
   * Create a tutoring session
   */
  async createSession(data: CreateTutoringSessionData) {
    const totalCost = data.rate && data.duration
      ? (data.rate * data.duration) / 60
      : null

    const session = await prisma.tutoringSession.create({
      data: {
        tutorId: data.tutorId,
        studentId: data.studentId,
        requestId: data.requestId,
        title: data.title,
        description: data.description,
        subject: data.subject,
        scheduledAt: data.scheduledAt,
        duration: data.duration,
        meetingUrl: data.meetingUrl,
        meetingProvider: data.meetingProvider,
        rate: data.rate,
        totalCost,
        status: 'SCHEDULED',
      },
      include: {
        tutor: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
        },
        student: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    })

    return session
  }

  /**
   * Get sessions for a tutor
   */
  async getTutorSessions(tutorProfileId: string, status?: TutoringSessionStatus, page = 1, limit = 20) {
    const where: Record<string, unknown> = { tutorId: tutorProfileId }

    if (status) {
      where.status = status
    }

    const [sessions, total] = await Promise.all([
      prisma.tutoringSession.findMany({
        where,
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          review: true,
        },
        orderBy: { scheduledAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tutoringSession.count({ where }),
    ])

    return {
      sessions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  /**
   * Get sessions for a student
   */
  async getStudentSessions(userId: string, status?: TutoringSessionStatus, page = 1, limit = 20) {
    const where: Record<string, unknown> = { studentId: userId }

    if (status) {
      where.status = status
    }

    const [sessions, total] = await Promise.all([
      prisma.tutoringSession.findMany({
        where,
        include: {
          tutor: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, avatar: true },
              },
            },
          },
          review: true,
        },
        orderBy: { scheduledAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tutoringSession.count({ where }),
    ])

    return {
      sessions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string) {
    return prisma.tutoringSession.findUnique({
      where: { id: sessionId },
      include: {
        tutor: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true, email: true },
            },
          },
        },
        student: {
          select: { id: true, firstName: true, lastName: true, avatar: true, email: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        review: true,
      },
    })
  }

  /**
   * Update session status
   */
  async updateSessionStatus(
    sessionId: string,
    status: TutoringSessionStatus,
    userId: string,
    additionalData?: { cancelReason?: string; tutorNotes?: string; sessionNotes?: string; homework?: string }
  ) {
    const session = await prisma.tutoringSession.findUnique({
      where: { id: sessionId },
      include: { tutor: true },
    })

    if (!session) {
      throw new Error('Session not found')
    }

    // Check authorization
    const isTutor = session.tutor.userId === userId
    const isStudent = session.studentId === userId

    if (!isTutor && !isStudent) {
      throw new Error('Not authorized')
    }

    const updateData: Record<string, unknown> = { status }

    if (status === 'CANCELLED') {
      updateData.cancelReason = additionalData?.cancelReason
      updateData.cancelledBy = userId
    }

    if (status === 'IN_PROGRESS') {
      updateData.actualStartTime = new Date()
    }

    if (status === 'COMPLETED') {
      updateData.actualEndTime = new Date()
      if (additionalData?.tutorNotes) updateData.tutorNotes = additionalData.tutorNotes
      if (additionalData?.sessionNotes) updateData.sessionNotes = additionalData.sessionNotes
      if (additionalData?.homework) updateData.homework = additionalData.homework

      // Update tutor stats
      await prisma.tutorProfile.update({
        where: { id: session.tutorId },
        data: {
          totalSessions: { increment: 1 },
          totalHours: { increment: session.duration / 60 },
        },
      })
    }

    return prisma.tutoringSession.update({
      where: { id: sessionId },
      data: updateData,
    })
  }

  /**
   * Send message in session
   */
  async sendSessionMessage(sessionId: string, senderId: string, content: string, attachments?: string[]) {
    return prisma.tutoringMessage.create({
      data: {
        sessionId,
        senderId,
        content,
        attachments: attachments ?? [],
      },
    })
  }

  // ============================================
  // REVIEWS
  // ============================================

  /**
   * Create a review for a tutoring session
   */
  async createReview(data: CreateTutoringReviewData) {
    // Check session exists and is completed
    const session = await prisma.tutoringSession.findUnique({
      where: { id: data.sessionId },
      include: { review: true },
    })

    if (!session) {
      throw new Error('Session not found')
    }

    if (session.status !== 'COMPLETED') {
      throw new Error('Can only review completed sessions')
    }

    if (session.review) {
      throw new Error('Session already has a review')
    }

    if (session.studentId !== data.studentId) {
      throw new Error('Only the student can review the session')
    }

    const review = await prisma.tutoringReview.create({
      data: {
        sessionId: data.sessionId,
        tutorId: data.tutorId,
        studentId: data.studentId,
        overallRating: data.overallRating,
        knowledgeRating: data.knowledgeRating,
        communicationRating: data.communicationRating,
        punctualityRating: data.punctualityRating,
        helpfulnessRating: data.helpfulnessRating,
        comment: data.comment,
      },
    })

    // Update tutor's average rating
    const allReviews = await prisma.tutoringReview.findMany({
      where: { tutorId: data.tutorId },
      select: { overallRating: true },
    })

    const avgRating = allReviews.reduce((sum, r) => sum + r.overallRating, 0) / allReviews.length

    await prisma.tutorProfile.update({
      where: { id: data.tutorId },
      data: {
        averageRating: avgRating,
        totalReviews: allReviews.length,
      },
    })

    return review
  }

  /**
   * Get reviews for a tutor
   */
  async getTutorReviews(tutorId: string, page = 1, limit = 20) {
    const [reviews, total] = await Promise.all([
      prisma.tutoringReview.findMany({
        where: { tutorId, isPublic: true },
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          session: {
            select: { id: true, title: true, subject: true, scheduledAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tutoringReview.count({ where: { tutorId, isPublic: true } }),
    ])

    return {
      reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  /**
   * Add tutor response to review
   */
  async respondToReview(reviewId: string, tutorUserId: string, response: string) {
    const review = await prisma.tutoringReview.findUnique({
      where: { id: reviewId },
      include: { tutor: true },
    })

    if (!review || review.tutor.userId !== tutorUserId) {
      throw new Error('Not authorized')
    }

    return prisma.tutoringReview.update({
      where: { id: reviewId },
      data: {
        tutorResponse: response,
        tutorRespondedAt: new Date(),
      },
    })
  }

  // ============================================
  // MATCHING ALGORITHM
  // ============================================

  /**
   * Find matching tutors for a request
   */
  async findMatchingTutors(requestId: string, limit = 10) {
    const request = await prisma.tutoringRequest.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      throw new Error('Request not found')
    }

    // Find tutors that match the subject
    const tutors = await prisma.tutorProfile.findMany({
      where: {
        status: 'APPROVED',
        isAvailable: true,
        subjects: { has: request.subject },
        ...(request.courseId && { courseIds: { has: request.courseId } }),
        ...(request.preferredLanguage && { languages: { has: request.preferredLanguage } }),
        ...(request.budgetMax && { hourlyRate: { lte: request.budgetMax } }),
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
      orderBy: [
        { averageRating: 'desc' },
        { totalSessions: 'desc' },
        { responseRate: 'desc' },
      ],
      take: limit,
    })

    // Calculate match scores
    const scoredTutors = tutors.map(tutor => {
      let score = 0

      // Rating score (0-25)
      if (tutor.averageRating) {
        score += (tutor.averageRating / 5) * 25
      }

      // Experience score (0-25)
      const sessionScore = Math.min(tutor.totalSessions / 100, 1) * 25
      score += sessionScore

      // Response rate score (0-25)
      if (tutor.responseRate) {
        score += (tutor.responseRate / 100) * 25
      }

      // Budget fit score (0-25)
      if (request.budgetMax && tutor.hourlyRate) {
        const budgetFit = 1 - (Number(tutor.hourlyRate) / Number(request.budgetMax))
        score += Math.max(0, budgetFit * 25)
      } else {
        score += 12.5 // Neutral if no budget specified
      }

      return { ...tutor, matchScore: Math.round(score) }
    })

    // Sort by match score
    scoredTutors.sort((a, b) => b.matchScore - a.matchScore)

    return scoredTutors
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get tutor statistics
   */
  async getTutorStats(tutorId: string) {
    const profile = await prisma.tutorProfile.findUnique({
      where: { id: tutorId },
    })

    if (!profile) {
      throw new Error('Tutor not found')
    }

    const [totalEarnings, upcomingSessions, recentReviews] = await Promise.all([
      prisma.tutoringSession.aggregate({
        where: { tutorId, status: 'COMPLETED', isPaid: true },
        _sum: { totalCost: true },
      }),
      prisma.tutoringSession.count({
        where: {
          tutorId,
          status: { in: ['SCHEDULED', 'ACCEPTED'] },
          scheduledAt: { gte: new Date() },
        },
      }),
      prisma.tutoringReview.findMany({
        where: { tutorId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          student: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
    ])

    return {
      totalSessions: profile.totalSessions,
      totalHours: profile.totalHours,
      averageRating: profile.averageRating,
      totalReviews: profile.totalReviews,
      totalEarnings: totalEarnings._sum.totalCost ?? 0,
      upcomingSessions,
      recentReviews,
    }
  }

  /**
   * Get platform-wide tutoring statistics (admin)
   */
  async getPlatformStats() {
    const [totalTutors, activeTutors, pendingApplications, totalSessions, completedSessions] = await Promise.all([
      prisma.tutorProfile.count(),
      prisma.tutorProfile.count({ where: { status: 'APPROVED', isAvailable: true } }),
      prisma.tutorProfile.count({ where: { status: 'PENDING' } }),
      prisma.tutoringSession.count(),
      prisma.tutoringSession.count({ where: { status: 'COMPLETED' } }),
    ])

    return {
      totalTutors,
      activeTutors,
      pendingApplications,
      totalSessions,
      completedSessions,
      completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
    }
  }
}

export const tutoringService = new TutoringService()
export default tutoringService
