import { Request, Response } from 'express'
import tutoringService from '../services/tutoringService'

class TutoringController {
  // ============================================
  // TUTOR PROFILE MANAGEMENT
  // ============================================

  async createTutorProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { headline, bio, hourlyRate, currency, subjects, courseIds, languages, availableHours, timezone, maxSessionsPerWeek, qualifications, experience } = req.body

      if (!subjects || subjects.length === 0) {
        return res.status(400).json({ message: 'At least one subject is required' })
      }

      const profile = await tutoringService.createTutorProfile({
        userId,
        headline,
        bio,
        hourlyRate,
        currency,
        subjects,
        courseIds,
        languages,
        availableHours,
        timezone,
        maxSessionsPerWeek,
        qualifications,
        experience,
      })

      res.status(201).json({ success: true, data: profile })
    } catch (error: any) {
      if (error.message === 'User already has a tutor profile') {
        return res.status(400).json({ message: error.message })
      }
      console.error('Error creating tutor profile:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async updateTutorProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const profile = await tutoringService.updateTutorProfile(userId, req.body)
      res.json({ success: true, data: profile })
    } catch (error: any) {
      console.error('Error updating tutor profile:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getMyTutorProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const profile = await tutoringService.getTutorProfile(userId)

      if (!profile) {
        return res.status(404).json({ message: 'Tutor profile not found' })
      }

      res.json({ success: true, data: profile })
    } catch (error: any) {
      console.error('Error getting tutor profile:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getTutorProfile(req: Request, res: Response) {
    try {
      const { id } = req.params
      const profile = await tutoringService.getTutorProfileById(id)

      if (!profile) {
        return res.status(404).json({ message: 'Tutor not found' })
      }

      res.json({ success: true, data: profile })
    } catch (error: any) {
      console.error('Error getting tutor profile:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async searchTutors(req: Request, res: Response) {
    try {
      const { subject, courseId, language, minRating, maxRate, isAvailable, page, limit } = req.query

      const result = await tutoringService.searchTutors(
        {
          subject: subject as string,
          courseId: courseId as string,
          language: language as string,
          minRating: minRating ? Number(minRating) : undefined,
          maxRate: maxRate ? Number(maxRate) : undefined,
          isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined,
        },
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      console.error('Error searching tutors:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getTutorStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const profile = await tutoringService.getTutorProfile(userId)

      if (!profile) {
        return res.status(404).json({ message: 'Tutor profile not found' })
      }

      const stats = await tutoringService.getTutorStats(profile.id)
      res.json({ success: true, data: stats })
    } catch (error: any) {
      console.error('Error getting tutor stats:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getTutorSessions(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { status, page, limit } = req.query

      const profile = await tutoringService.getTutorProfile(userId)
      if (!profile) {
        return res.status(404).json({ message: 'Tutor profile not found' })
      }

      const result = await tutoringService.getTutorSessions(
        profile.id,
        status as any,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      console.error('Error getting tutor sessions:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // TUTORING REQUESTS
  // ============================================

  async createTutoringRequest(req: Request, res: Response) {
    try {
      const studentId = (req as any).user.id
      const { title, description, subject, courseId, lessonId, preferredLanguage, urgency, budgetMin, budgetMax, preferredSchedule, expiresAt } = req.body

      if (!title || !description || !subject) {
        return res.status(400).json({ message: 'Title, description, and subject are required' })
      }

      const request = await tutoringService.createTutoringRequest({
        studentId,
        title,
        description,
        subject,
        courseId,
        lessonId,
        preferredLanguage,
        urgency,
        budgetMin,
        budgetMax,
        preferredSchedule,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      })

      res.status(201).json({ success: true, data: request })
    } catch (error: any) {
      console.error('Error creating tutoring request:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getMyTutoringRequests(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { page, limit } = req.query

      const result = await tutoringService.getUserTutoringRequests(
        userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      console.error('Error getting tutoring requests:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getOpenTutoringRequests(req: Request, res: Response) {
    try {
      const { subject, courseId, page, limit } = req.query

      const result = await tutoringService.getOpenTutoringRequests(
        { subject: subject as string, courseId: courseId as string },
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      console.error('Error getting open requests:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getTutoringRequest(req: Request, res: Response) {
    try {
      const { id } = req.params
      // This would need a method to get single request
      res.json({ success: true, message: 'Not implemented yet' })
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async updateTutoringRequestStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id
      const { status } = req.body

      const request = await tutoringService.updateTutoringRequestStatus(id, status, userId)
      res.json({ success: true, data: request })
    } catch (error: any) {
      if (error.message.includes('Not authorized') || error.message.includes('not found')) {
        return res.status(403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getMatchingTutors(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { limit } = req.query

      const tutors = await tutoringService.findMatchingTutors(id, limit ? Number(limit) : 10)
      res.json({ success: true, data: tutors })
    } catch (error: any) {
      if (error.message === 'Request not found') {
        return res.status(404).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getRequestApplications(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      const applications = await tutoringService.getRequestApplications(id, userId)
      res.json({ success: true, data: applications })
    } catch (error: any) {
      if (error.message.includes('Not authorized')) {
        return res.status(403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // TUTOR APPLICATIONS
  // ============================================

  async applyToRequest(req: Request, res: Response) {
    try {
      const { id: requestId } = req.params
      const userId = (req as any).user.id
      const { message, proposedRate, proposedSchedule } = req.body

      if (!message) {
        return res.status(400).json({ message: 'Message is required' })
      }

      // Get tutor profile
      const tutorProfile = await tutoringService.getTutorProfile(userId)
      if (!tutorProfile) {
        return res.status(400).json({ message: 'You must have a tutor profile to apply' })
      }

      const application = await tutoringService.applyToRequest({
        requestId,
        tutorId: tutorProfile.id,
        message,
        proposedRate,
        proposedSchedule,
      })

      res.status(201).json({ success: true, data: application })
    } catch (error: any) {
      if (error.message.includes('Already applied') || error.message.includes('must be approved')) {
        return res.status(400).json({ message: error.message })
      }
      console.error('Error applying to request:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async acceptApplication(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      const request = await tutoringService.acceptApplication(id, userId)
      res.json({ success: true, data: request })
    } catch (error: any) {
      if (error.message === 'Not authorized') {
        return res.status(403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // TUTORING SESSIONS
  // ============================================

  async createSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { studentId, requestId, title, description, subject, scheduledAt, duration, meetingUrl, meetingProvider, rate } = req.body

      // Get tutor profile
      const tutorProfile = await tutoringService.getTutorProfile(userId)
      if (!tutorProfile) {
        return res.status(400).json({ message: 'You must have a tutor profile to create sessions' })
      }

      if (!title || !subject || !scheduledAt || !duration || !studentId) {
        return res.status(400).json({ message: 'Title, subject, studentId, scheduledAt, and duration are required' })
      }

      const session = await tutoringService.createSession({
        tutorId: tutorProfile.id,
        studentId,
        requestId,
        title,
        description,
        subject,
        scheduledAt: new Date(scheduledAt),
        duration,
        meetingUrl,
        meetingProvider,
        rate,
      })

      res.status(201).json({ success: true, data: session })
    } catch (error: any) {
      console.error('Error creating session:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getMySessions(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { status, page, limit } = req.query

      const result = await tutoringService.getStudentSessions(
        userId,
        status as any,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      console.error('Error getting sessions:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getSession(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      const session = await tutoringService.getSession(id)

      if (!session) {
        return res.status(404).json({ message: 'Session not found' })
      }

      // Check authorization
      if (session.studentId !== userId && session.tutor.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized' })
      }

      res.json({ success: true, data: session })
    } catch (error: any) {
      console.error('Error getting session:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async updateSessionStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id
      const { status, cancelReason, tutorNotes, sessionNotes, homework } = req.body

      const session = await tutoringService.updateSessionStatus(id, status, userId, {
        cancelReason,
        tutorNotes,
        sessionNotes,
        homework,
      })

      res.json({ success: true, data: session })
    } catch (error: any) {
      if (error.message.includes('Not authorized') || error.message.includes('not found')) {
        return res.status(403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async sendSessionMessage(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id
      const { content, attachments } = req.body

      if (!content) {
        return res.status(400).json({ message: 'Content is required' })
      }

      const message = await tutoringService.sendSessionMessage(id, userId, content, attachments)
      res.status(201).json({ success: true, data: message })
    } catch (error: any) {
      console.error('Error sending message:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getSessionMessages(req: Request, res: Response) {
    try {
      const { id } = req.params
      const session = await tutoringService.getSession(id)

      if (!session) {
        return res.status(404).json({ message: 'Session not found' })
      }

      res.json({ success: true, data: session.messages })
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // REVIEWS
  // ============================================

  async createReview(req: Request, res: Response) {
    try {
      const { id: sessionId } = req.params
      const studentId = (req as any).user.id
      const { overallRating, knowledgeRating, communicationRating, punctualityRating, helpfulnessRating, comment } = req.body

      if (!overallRating || overallRating < 1 || overallRating > 5) {
        return res.status(400).json({ message: 'Overall rating (1-5) is required' })
      }

      const session = await tutoringService.getSession(sessionId)
      if (!session) {
        return res.status(404).json({ message: 'Session not found' })
      }

      const review = await tutoringService.createReview({
        sessionId,
        tutorId: session.tutorId,
        studentId,
        overallRating,
        knowledgeRating,
        communicationRating,
        punctualityRating,
        helpfulnessRating,
        comment,
      })

      res.status(201).json({ success: true, data: review })
    } catch (error: any) {
      if (error.message.includes('Only the student') || error.message.includes('already has') || error.message.includes('completed')) {
        return res.status(400).json({ message: error.message })
      }
      console.error('Error creating review:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getTutorReviews(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { page, limit } = req.query

      const result = await tutoringService.getTutorReviews(
        id,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      console.error('Error getting reviews:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async respondToReview(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id
      const { response } = req.body

      if (!response) {
        return res.status(400).json({ message: 'Response is required' })
      }

      const review = await tutoringService.respondToReview(id, userId, response)
      res.json({ success: true, data: review })
    } catch (error: any) {
      if (error.message === 'Not authorized') {
        return res.status(403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // ADMIN
  // ============================================

  async getPendingApplications(req: Request, res: Response) {
    try {
      const { page, limit } = req.query

      const result = await tutoringService.getPendingTutorApplications(
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      console.error('Error getting applications:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async updateTutorStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const adminId = (req as any).user.id
      const { status } = req.body

      if (!['APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' })
      }

      const profile = await tutoringService.updateTutorStatus(id, status, adminId)
      res.json({ success: true, data: profile })
    } catch (error: any) {
      console.error('Error updating status:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getPlatformStats(req: Request, res: Response) {
    try {
      const stats = await tutoringService.getPlatformStats()
      res.json({ success: true, data: stats })
    } catch (error: any) {
      console.error('Error getting stats:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export const tutoringController = new TutoringController()
export default tutoringController
