import { Response, NextFunction } from 'express'
import { instructorService } from '../services/instructorService'
import { AuthRequest } from '../middleware/auth'

export class InstructorController {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const dashboard = await instructorService.getInstructorDashboard(req.user.id)

      res.json({
        status: 'success',
        data: dashboard,
      })
    } catch (error) {
      next(error)
    }
  }

  async getCourseAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const analytics = await instructorService.getCourseAnalytics(
        req.params.courseId,
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

  async getStudentProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const progress = await instructorService.getStudentProgress(
        req.params.courseId,
        req.user.id,
        req.params.studentId
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

export const instructorController = new InstructorController()
