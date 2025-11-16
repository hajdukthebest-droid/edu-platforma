import { Request, Response, NextFunction } from 'express'
import { achievementService } from '../services/achievementService'
import { AuthRequest } from '../middleware/auth'
import { ACHIEVEMENT_DEFINITIONS } from '../config/achievementDefinitions'

export class AchievementController {
  /**
   * Get all achievement definitions
   */
  async getAllDefinitions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: ACHIEVEMENT_DEFINITIONS,
      })
    } catch (error) {
      next(error)
    }
  }

  async getUserAchievements(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const achievements = await achievementService.getUserAchievements(req.user.id)

      res.json({
        status: 'success',
        data: achievements,
      })
    } catch (error) {
      next(error)
    }
  }

  async getUserBadges(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const badges = await achievementService.getUserBadges(req.user.id)

      res.json({
        status: 'success',
        data: badges,
      })
    } catch (error) {
      next(error)
    }
  }

  async getUserStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const stats = await achievementService.getUserStats(req.user.id)

      res.json({
        status: 'success',
        data: stats,
      })
    } catch (error) {
      next(error)
    }
  }

  async getAllAchievements(req: Request, res: Response, next: NextFunction) {
    try {
      const achievements = await achievementService.getAllAchievements()

      res.json({
        status: 'success',
        data: achievements,
      })
    } catch (error) {
      next(error)
    }
  }

  async getAllBadges(req: Request, res: Response, next: NextFunction) {
    try {
      const badges = await achievementService.getAllBadges()

      res.json({
        status: 'success',
        data: badges,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Trigger achievement check for current user
   */
  async checkAchievements(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      await achievementService.checkAndAwardAchievements(req.user.id)
      await achievementService.checkAndAwardBadges(req.user.id)

      const achievements = await achievementService.getUserAchievements(req.user.id)
      res.json({
        status: 'success',
        message: 'Achievement check completed',
        data: achievements,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get achievements leaderboard
   */
  async getLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10

      // Use existing user stats to create leaderboard
      const topUsers = await achievementService.getTopUsersByPoints(limit)

      res.json({
        status: 'success',
        data: topUsers,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const achievementController = new AchievementController()
