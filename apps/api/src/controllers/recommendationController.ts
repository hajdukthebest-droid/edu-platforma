import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { recommendationService } from '../services/recommendationService'

export class RecommendationController {
  async getRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { limit } = req.query

      const recommendations = await recommendationService.getRecommendations(
        userId,
        limit ? parseInt(limit as string) : 10
      )

      res.json({
        success: true,
        data: recommendations,
      })
    } catch (error) {
      next(error)
    }
  }

  async getSimilarCourses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params
      const { limit } = req.query

      const similar = await recommendationService.getSimilarCourses(
        courseId,
        limit ? parseInt(limit as string) : 5
      )

      res.json({
        success: true,
        data: similar,
      })
    } catch (error) {
      next(error)
    }
  }

  async getTrendingCourses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { limit, days } = req.query

      const trending = await recommendationService.getTrendingCourses(
        limit ? parseInt(limit as string) : 10,
        days ? parseInt(days as string) : 7
      )

      res.json({
        success: true,
        data: trending,
      })
    } catch (error) {
      next(error)
    }
  }

  async getPopularByCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params
      const { limit } = req.query

      const popular = await recommendationService.getPopularByCategory(
        categoryId,
        limit ? parseInt(limit as string) : 10
      )

      res.json({
        success: true,
        data: popular,
      })
    } catch (error) {
      next(error)
    }
  }

  async getBecauseYouEnrolled(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { courseId } = req.params
      const { limit } = req.query

      const recommendations = await recommendationService.getBecauseYouEnrolled(
        userId,
        courseId,
        limit ? parseInt(limit as string) : 5
      )

      res.json({
        success: true,
        data: recommendations,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const recommendationController = new RecommendationController()
