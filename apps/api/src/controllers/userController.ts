import { Response, NextFunction } from 'express'
import { prisma } from '@edu-platforma/database'
import { AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

export class UserController {
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const { firstName, lastName, bio, profession, organization } = req.body

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          firstName,
          lastName,
          bio,
          profession,
          organization,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          bio: true,
          profession: true,
          organization: true,
          avatar: true,
          role: true,
          totalPoints: true,
          level: true,
          currentStreak: true,
          createdAt: true,
        },
      })

      res.json({
        status: 'success',
        data: user,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const userController = new UserController()
