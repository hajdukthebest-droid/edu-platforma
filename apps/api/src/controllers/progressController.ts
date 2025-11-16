import { Response, NextFunction } from 'express'
import { progressService } from '../services/progressService'
import { AuthRequest } from '../middleware/auth'

export class ProgressController {
  async markLessonComplete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const progress = await progressService.markLessonComplete(
        req.user.id,
        req.params.lessonId
      )

      res.json({
        status: 'success',
        data: progress,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateLessonProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const progress = await progressService.updateLessonProgress(
        req.user.id,
        req.params.lessonId,
        req.body
      )

      res.json({
        status: 'success',
        data: progress,
      })
    } catch (error) {
      next(error)
    }
  }

  async getLessonProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const progress = await progressService.getLessonProgress(
        req.user.id,
        req.params.lessonId
      )

      res.json({
        status: 'success',
        data: progress,
      })
    } catch (error) {
      next(error)
    }
  }

  async getCourseProgressDetailed(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const progress = await progressService.getCourseProgressWithLessons(
        req.user.id,
        req.params.courseId
      )

      res.json({
        status: 'success',
        data: progress,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const progressController = new ProgressController()
