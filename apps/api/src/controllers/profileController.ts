import { Request, Response, NextFunction } from 'express'
import { profileService } from '../services/profileService'
import { AuthRequest } from '../middleware/auth'

export class ProfileController {
  async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.params
      const profile = await profileService.getPublicProfile(username)

      res.json({
        success: true,
        data: profile,
      })
    } catch (error) {
      next(error)
    }
  }

  async getUserStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const stats = await profileService.getUserStats(userId)

      res.json({
        success: true,
        data: stats,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const user = await profileService.updateProfile(userId, req.body)

      res.json({
        success: true,
        data: user,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const profileController = new ProfileController()
