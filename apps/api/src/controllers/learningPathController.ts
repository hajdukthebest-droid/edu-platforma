import { Request, Response, NextFunction } from 'express'
import { learningPathService } from '../services/learningPathService'
import { AuthRequest } from '../middleware/auth'

export class LearningPathController {
  async createLearningPath(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const learningPath = await learningPathService.createLearningPath(
        req.user.id,
        req.body
      )

      res.status(201).json({
        status: 'success',
        data: learningPath,
      })
    } catch (error) {
      next(error)
    }
  }

  async getLearningPaths(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        level: req.query.level as any,
        published: req.query.published === 'false' ? false : true,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      }

      const result = await learningPathService.getLearningPaths(filters)

      res.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async getLearningPathById(req: Request, res: Response, next: NextFunction) {
    try {
      const learningPath = await learningPathService.getLearningPathById(req.params.id)

      res.json({
        status: 'success',
        data: learningPath,
      })
    } catch (error) {
      next(error)
    }
  }

  async getLearningPathBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const learningPath = await learningPathService.getLearningPathBySlug(req.params.slug)

      res.json({
        status: 'success',
        data: learningPath,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateLearningPath(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const learningPath = await learningPathService.updateLearningPath(
        req.params.id,
        req.user.id,
        req.body
      )

      res.json({
        status: 'success',
        data: learningPath,
      })
    } catch (error) {
      next(error)
    }
  }

  async enrollInLearningPath(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const enrollment = await learningPathService.enrollInLearningPath(
        req.user.id,
        req.params.id
      )

      res.status(201).json({
        status: 'success',
        data: enrollment,
      })
    } catch (error) {
      next(error)
    }
  }

  async getUserProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const progress = await learningPathService.getUserProgress(
        req.user.id,
        req.params.id
      )

      res.json({
        status: 'success',
        data: progress,
      })
    } catch (error) {
      next(error)
    }
  }

  async getUserLearningPaths(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const userPaths = await learningPathService.getUserLearningPaths(req.user.id)

      res.json({
        status: 'success',
        data: userPaths,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const learningPathController = new LearningPathController()
