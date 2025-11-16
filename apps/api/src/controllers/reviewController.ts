import { Request, Response, NextFunction } from 'express'
import { reviewService } from '../services/reviewService'
import { AuthRequest } from '../middleware/auth'

export class ReviewController {
  async createReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const review = await reviewService.createReview(
        req.user.id,
        req.params.courseId,
        req.body
      )

      res.status(201).json({
        status: 'success',
        data: review,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const review = await reviewService.updateReview(
        req.params.id,
        req.user.id,
        req.body
      )

      res.json({
        status: 'success',
        data: review,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      await reviewService.deleteReview(req.params.id, req.user.id)

      res.json({
        status: 'success',
        message: 'Review deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  async getCourseReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20

      const result = await reviewService.getCourseReviews(req.params.courseId, page, limit)

      res.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async getUserReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const review = await reviewService.getUserReview(req.user.id, req.params.courseId)

      res.json({
        status: 'success',
        data: review,
      })
    } catch (error) {
      next(error)
    }
  }

  async getCourseRatingStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await reviewService.getCourseRatingStats(req.params.courseId)

      res.json({
        status: 'success',
        data: stats,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const reviewController = new ReviewController()
