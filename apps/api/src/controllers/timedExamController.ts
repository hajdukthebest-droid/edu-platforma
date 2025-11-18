import { Request, Response } from 'express'
import timedExamService from '../services/timedExamService'

class TimedExamController {
  /**
   * Start a new timed exam session
   * POST /api/timed-exams/:assessmentId/start
   */
  async startSession(req: Request, res: Response) {
    try {
      const { assessmentId } = req.params
      const userId = (req as any).user.id

      const session = await timedExamService.startExamSession({
        assessmentId,
        userId,
      })

      res.status(201).json({
        success: true,
        data: session,
      })
    } catch (error: any) {
      console.error('Error starting exam session:', error)
      if (
        error.message.includes('not found') ||
        error.message.includes('not a timed') ||
        error.message.includes('already have') ||
        error.message.includes('Maximum attempts')
      ) {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get active exam session
   * GET /api/timed-exams/:assessmentId/session
   */
  async getActiveSession(req: Request, res: Response) {
    try {
      const { assessmentId } = req.params
      const userId = (req as any).user.id

      const session = await timedExamService.getActiveSession(userId, assessmentId)

      if (!session) {
        return res.status(404).json({ message: 'No active session found' })
      }

      res.json({
        success: true,
        data: session,
      })
    } catch (error) {
      console.error('Error getting active session:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Update exam session (save progress)
   * PUT /api/timed-exams/sessions/:sessionId
   */
  async updateSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params
      const { timeRemaining, timeElapsed, currentQuestion, answers } = req.body

      const session = await timedExamService.updateSession(sessionId, {
        timeRemaining,
        timeElapsed,
        currentQuestion,
        answers,
      })

      res.json({
        success: true,
        data: session,
      })
    } catch (error) {
      console.error('Error updating session:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Pause exam session
   * POST /api/timed-exams/sessions/:sessionId/pause
   */
  async pauseSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params

      const session = await timedExamService.pauseSession(sessionId)

      res.json({
        success: true,
        data: session,
        message: 'Exam paused successfully',
      })
    } catch (error: any) {
      console.error('Error pausing session:', error)
      if (
        error.message.includes('not found') ||
        error.message.includes('cannot be paused') ||
        error.message.includes('not active')
      ) {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Resume exam session
   * POST /api/timed-exams/sessions/:sessionId/resume
   */
  async resumeSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params

      const session = await timedExamService.resumeSession(sessionId)

      res.json({
        success: true,
        data: session,
        message: 'Exam resumed successfully',
      })
    } catch (error: any) {
      console.error('Error resuming session:', error)
      if (
        error.message.includes('not found') ||
        error.message.includes('not paused') ||
        error.message.includes('expired')
      ) {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Record proctoring event
   * POST /api/timed-exams/sessions/:sessionId/proctoring-event
   */
  async recordProctoringEvent(req: Request, res: Response) {
    try {
      const { sessionId } = req.params
      const { type, details } = req.body

      if (!type) {
        return res.status(400).json({ message: 'Event type is required' })
      }

      const session = await timedExamService.recordProctoringEvent(sessionId, {
        type,
        timestamp: new Date(),
        details,
      })

      res.json({
        success: true,
        data: {
          fullscreenExits: session.fullscreenExits,
          tabSwitches: session.tabSwitches,
        },
      })
    } catch (error: any) {
      console.error('Error recording proctoring event:', error)
      if (error.message === 'Session not found') {
        return res.status(404).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Complete/submit exam
   * POST /api/timed-exams/sessions/:sessionId/complete
   */
  async completeSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params
      const { answers } = req.body

      if (!answers) {
        return res.status(400).json({ message: 'Answers are required' })
      }

      const result = await timedExamService.completeSession(sessionId, answers)

      res.json({
        success: true,
        data: result,
        message: 'Exam submitted successfully',
      })
    } catch (error: any) {
      console.error('Error completing session:', error)
      if (
        error.message.includes('not found') ||
        error.message.includes('already completed')
      ) {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Abandon exam session
   * POST /api/timed-exams/sessions/:sessionId/abandon
   */
  async abandonSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params

      const session = await timedExamService.abandonSession(sessionId)

      res.json({
        success: true,
        data: session,
        message: 'Exam abandoned',
      })
    } catch (error) {
      console.error('Error abandoning session:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get session statistics (for instructors)
   * GET /api/timed-exams/:assessmentId/statistics
   */
  async getSessionStatistics(req: Request, res: Response) {
    try {
      const { assessmentId } = req.params

      const statistics = await timedExamService.getSessionStatistics(assessmentId)

      res.json({
        success: true,
        data: statistics,
      })
    } catch (error) {
      console.error('Error getting session statistics:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Check and expire old sessions (cron job endpoint)
   * POST /api/timed-exams/check-expired
   */
  async checkExpiredSessions(req: Request, res: Response) {
    try {
      const results = await timedExamService.checkExpiredSessions()

      res.json({
        success: true,
        data: {
          expiredCount: results.length,
        },
        message: `Expired ${results.length} sessions`,
      })
    } catch (error) {
      console.error('Error checking expired sessions:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new TimedExamController()
