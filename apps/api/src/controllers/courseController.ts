import { Request, Response, NextFunction } from 'express'
import { courseService } from '../services/courseService'
import { AuthRequest } from '../middleware/auth'

export class CourseController {
  async createCourse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const course = await courseService.createCourse({
        ...req.body,
        creatorId: req.user.id,
      })

      res.status(201).json({
        status: 'success',
        data: course,
      })
    } catch (error) {
      next(error)
    }
  }

  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await courseService.getCourses(req.query)

      res.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await courseService.getCourseById(req.params.id)

      res.json({
        status: 'success',
        data: course,
      })
    } catch (error) {
      next(error)
    }
  }

  async getCourseBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await courseService.getCourseBySlug(req.params.slug)

      res.json({
        status: 'success',
        data: course,
      })
    } catch (error) {
      next(error)
    }
  }

  async enrollInCourse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const result = await courseService.enrollInCourse(req.user.id, req.params.id)

      res.status(201).json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async getCourseProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const progress = await courseService.getCourseProgress(req.user.id, req.params.id)

      res.json({
        status: 'success',
        data: progress,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const courseController = new CourseController()
