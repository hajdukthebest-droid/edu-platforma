import { Response, NextFunction } from 'express'
import { liveSessionService } from '../services/liveSessionService'
import { AuthRequest } from '../middleware/auth'

export class LiveSessionController {
  async createSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      // Only instructors can create sessions
      if (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN') {
        return res
          .status(403)
          .json({ status: 'error', message: 'Only instructors can create live sessions' })
      }

      const session = await liveSessionService.createSession(req.user.id, req.body)

      res.status(201).json({
        status: 'success',
        data: session,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const session = await liveSessionService.updateSession(
        req.params.id,
        req.user.id,
        req.body
      )

      res.json({
        status: 'success',
        data: session,
      })
    } catch (error) {
      next(error)
    }
  }

  async startSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const session = await liveSessionService.startSession(req.params.id, req.user.id)

      res.json({
        status: 'success',
        data: session,
      })
    } catch (error) {
      next(error)
    }
  }

  async endSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const session = await liveSessionService.endSession(
        req.params.id,
        req.user.id,
        req.body
      )

      res.json({
        status: 'success',
        data: session,
      })
    } catch (error) {
      next(error)
    }
  }

  async cancelSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const session = await liveSessionService.cancelSession(req.params.id, req.user.id)

      res.json({
        status: 'success',
        data: session,
      })
    } catch (error) {
      next(error)
    }
  }

  async getSessions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const instructorId = req.query.instructorId as string
      const courseId = req.query.courseId as string
      const status = req.query.status as any
      const upcoming = req.query.upcoming === 'true'
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20

      const result = await liveSessionService.getSessions(
        {
          instructorId,
          courseId,
          status,
          upcoming,
        },
        page,
        limit
      )

      res.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async getSessionById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      const session = await liveSessionService.getSessionById(req.params.id, userId)

      res.json({
        status: 'success',
        data: session,
      })
    } catch (error) {
      next(error)
    }
  }

  async joinSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const attendance = await liveSessionService.joinSession(req.params.id, req.user.id)

      res.json({
        status: 'success',
        data: attendance,
      })
    } catch (error) {
      next(error)
    }
  }

  async leaveSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const { watchTime } = req.body
      const attendance = await liveSessionService.leaveSession(
        req.params.id,
        req.user.id,
        watchTime || 0
      )

      res.json({
        status: 'success',
        data: attendance,
      })
    } catch (error) {
      next(error)
    }
  }

  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const message = await liveSessionService.sendMessage(
        req.params.id,
        req.user.id,
        req.body
      )

      res.status(201).json({
        status: 'success',
        data: message,
      })
    } catch (error) {
      next(error)
    }
  }

  async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const questionsOnly = req.query.questionsOnly === 'true'
      const limit = parseInt(req.query.limit as string) || 100

      const messages = await liveSessionService.getMessages(
        req.params.id,
        { questionsOnly },
        limit
      )

      res.json({
        status: 'success',
        data: messages,
      })
    } catch (error) {
      next(error)
    }
  }

  async pinMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const message = await liveSessionService.pinMessage(req.params.messageId, req.user.id)

      res.json({
        status: 'success',
        data: message,
      })
    } catch (error) {
      next(error)
    }
  }

  async markQuestionAnswered(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const message = await liveSessionService.markQuestionAnswered(
        req.params.messageId,
        req.user.id
      )

      res.json({
        status: 'success',
        data: message,
      })
    } catch (error) {
      next(error)
    }
  }

  async getAttendance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const attendance = await liveSessionService.getAttendance(req.params.id, req.user.id)

      res.json({
        status: 'success',
        data: attendance,
      })
    } catch (error) {
      next(error)
    }
  }

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const analytics = await liveSessionService.getSessionAnalytics(
        req.params.id,
        req.user.id
      )

      res.json({
        status: 'success',
        data: analytics,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const liveSessionController = new LiveSessionController()
