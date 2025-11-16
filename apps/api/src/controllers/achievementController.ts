import { Request, Response, NextFunction } from 'express'
import { achievementService } from '../services/achievementService'
import { AuthRequest } from '../middleware/auth'

export class AchievementController {
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
}

export const achievementController = new AchievementController()
