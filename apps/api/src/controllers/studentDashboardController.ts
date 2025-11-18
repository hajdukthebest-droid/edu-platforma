import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { studentDashboardService } from '../services/studentDashboardService'

class StudentDashboardController {
  /**
   * Get complete dashboard data
   */
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const dashboard = await studentDashboardService.getDashboard(req.user.id)

      res.json({
        status: 'success',
        data: dashboard,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get dashboard statistics only
   */
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const stats = await studentDashboardService.getDashboardStats(req.user.id)

      res.json({
        status: 'success',
        data: stats,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get courses in progress
   */
  async getCoursesInProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5
      const courses = await studentDashboardService.getCoursesInProgress(
        req.user.id,
        limit
      )

      res.json({
        status: 'success',
        data: courses,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get upcoming deadlines
   */
  async getUpcomingDeadlines(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5
      const deadlines = await studentDashboardService.getUpcomingDeadlines(
        req.user.id,
        limit
      )

      res.json({
        status: 'success',
        data: deadlines,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get recent achievements
   */
  async getRecentAchievements(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5
      const achievements = await studentDashboardService.getRecentAchievements(
        req.user.id,
        limit
      )

      res.json({
        status: 'success',
        data: achievements,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get weekly progress
   */
  async getWeeklyProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const weeks = req.query.weeks ? parseInt(req.query.weeks as string) : 8
      const progress = await studentDashboardService.getWeeklyProgress(
        req.user.id,
        weeks
      )

      res.json({
        status: 'success',
        data: progress,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get activity heatmap
   */
  async getActivityHeatmap(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const year = parseInt(req.params.year) || new Date().getFullYear()
      const heatmap = await studentDashboardService.getActivityHeatmap(
        req.user.id,
        year
      )

      res.json({
        status: 'success',
        data: heatmap,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get learning insights
   */
  async getLearningInsights(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const insights = await studentDashboardService.getLearningInsights(req.user.id)

      res.json({
        status: 'success',
        data: insights,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Update learning goals
   */
  async updateGoals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const { dailyGoalMinutes, dailyGoalLessons } = req.body
      const streak = await studentDashboardService.updateGoals(req.user.id, {
        dailyGoalMinutes,
        dailyGoalLessons,
      })

      res.json({
        status: 'success',
        data: streak,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get recommended courses
   */
  async getRecommendedCourses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3
      const courses = await studentDashboardService.getRecommendedCourses(
        req.user.id,
        limit
      )

      res.json({
        status: 'success',
        data: courses,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const studentDashboardController = new StudentDashboardController()
