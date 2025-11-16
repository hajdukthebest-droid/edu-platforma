import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { instructorAnalyticsService } from '../services/instructorAnalyticsService'
import { AppError } from '../middleware/errorHandler'

export class InstructorAnalyticsController {
  /**
   * Get instructor dashboard overview
   */
  async getOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized')
      }

      // Check if user is instructor or admin
      if (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN') {
        throw new AppError(403, 'Only instructors can access analytics')
      }

      const overview = await instructorAnalyticsService.getInstructorOverview(
        req.user.id
      )

      res.json({
        success: true,
        data: overview,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized')
      }

      if (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN') {
        throw new AppError(403, 'Only instructors can access analytics')
      }

      const months = parseInt(req.query.months as string) || 12

      const analytics = await instructorAnalyticsService.getRevenueAnalytics(
        req.user.id,
        months
      )

      res.json({
        success: true,
        data: analytics,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get enrollment trends
   */
  async getEnrollmentTrends(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized')
      }

      if (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN') {
        throw new AppError(403, 'Only instructors can access analytics')
      }

      const months = parseInt(req.query.months as string) || 12

      const trends = await instructorAnalyticsService.getEnrollmentTrends(
        req.user.id,
        months
      )

      res.json({
        success: true,
        data: trends,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get course performance
   */
  async getCoursePerformance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized')
      }

      if (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN') {
        throw new AppError(403, 'Only instructors can access analytics')
      }

      const performance = await instructorAnalyticsService.getCoursePerformance(
        req.user.id
      )

      res.json({
        success: true,
        data: performance,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get student engagement
   */
  async getStudentEngagement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized')
      }

      if (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN') {
        throw new AppError(403, 'Only instructors can access analytics')
      }

      const engagement = await instructorAnalyticsService.getStudentEngagement(
        req.user.id
      )

      res.json({
        success: true,
        data: engagement,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get review analytics
   */
  async getReviewAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized')
      }

      if (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN') {
        throw new AppError(403, 'Only instructors can access analytics')
      }

      const analytics = await instructorAnalyticsService.getReviewAnalytics(
        req.user.id
      )

      res.json({
        success: true,
        data: analytics,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get top courses
   */
  async getTopCourses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized')
      }

      if (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN') {
        throw new AppError(403, 'Only instructors can access analytics')
      }

      const limit = parseInt(req.query.limit as string) || 5

      const topCourses = await instructorAnalyticsService.getTopCourses(
        req.user.id,
        limit
      )

      res.json({
        success: true,
        data: topCourses,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get earnings summary
   */
  async getEarningsSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized')
      }

      if (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN') {
        throw new AppError(403, 'Only instructors can access analytics')
      }

      const earnings = await instructorAnalyticsService.getEarningsSummary(
        req.user.id
      )

      res.json({
        success: true,
        data: earnings,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const instructorAnalyticsController = new InstructorAnalyticsController()
