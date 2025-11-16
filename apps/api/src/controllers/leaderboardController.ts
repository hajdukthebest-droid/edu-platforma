import { Request, Response, NextFunction } from 'express'
import { leaderboardService } from '../services/leaderboardService'
import { AuthRequest } from '../middleware/auth'

export class LeaderboardController {
  async getGlobalLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50
      const offset = parseInt(req.query.offset as string) || 0

      const leaderboard = await leaderboardService.getGlobalLeaderboard(limit, offset)

      res.json({
        status: 'success',
        data: leaderboard,
      })
    } catch (error) {
      next(error)
    }
  }

  async getUserRank(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const rank = await leaderboardService.getUserRank(req.user.id)

      res.json({
        status: 'success',
        data: { rank },
      })
    } catch (error) {
      next(error)
    }
  }

  async getPeriodLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const period = req.params.period as 'daily' | 'weekly' | 'monthly'
      const limit = parseInt(req.query.limit as string) || 50

      const leaderboard = await leaderboardService.getLeaderboardByPeriod(period, limit)

      res.json({
        status: 'success',
        data: leaderboard,
      })
    } catch (error) {
      next(error)
    }
  }

  async getStreakLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50

      const leaderboard = await leaderboardService.getStreakLeaderboard(limit)

      res.json({
        status: 'success',
        data: leaderboard,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const leaderboardController = new LeaderboardController()
