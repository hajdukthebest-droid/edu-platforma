import { Request, Response, NextFunction } from 'express'
import { notificationService } from '../services/notificationService'
import { AuthRequest } from '../middleware/auth'

export class NotificationController {
  async getUserNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const unreadOnly = req.query.unreadOnly === 'true'

      const result = await notificationService.getUserNotifications(
        req.user.id,
        page,
        limit,
        unreadOnly
      )

      res.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const count = await notificationService.getUnreadCount(req.user.id)

      res.json({
        status: 'success',
        data: { count },
      })
    } catch (error) {
      next(error)
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      await notificationService.markAsRead(req.params.id, req.user.id)

      res.json({
        status: 'success',
        message: 'Notification marked as read',
      })
    } catch (error) {
      next(error)
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      await notificationService.markAllAsRead(req.user.id)

      res.json({
        status: 'success',
        message: 'All notifications marked as read',
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      await notificationService.deleteNotification(req.params.id, req.user.id)

      res.json({
        status: 'success',
        message: 'Notification deleted',
      })
    } catch (error) {
      next(error)
    }
  }
}

export const notificationController = new NotificationController()
