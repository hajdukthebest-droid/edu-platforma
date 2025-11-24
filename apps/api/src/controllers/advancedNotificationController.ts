import { Request, Response } from 'express'
import advancedNotificationService from '../services/advancedNotificationService'

class AdvancedNotificationController {
  // ============================================
  // PREFERENCES
  // ============================================

  async getPreferences(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const prefs = await advancedNotificationService.getPreferences(userId)
      res.json({ success: true, data: prefs })
    } catch (error: any) {
      console.error('Error getting preferences:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async updatePreferences(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const prefs = await advancedNotificationService.updatePreferences(userId, req.body)
      res.json({ success: true, data: prefs })
    } catch (error: any) {
      console.error('Error updating preferences:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // PUSH SUBSCRIPTIONS
  // ============================================

  async registerPushSubscription(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { endpoint, p256dh, auth, deviceType, deviceName, userAgent } = req.body

      if (!endpoint || !p256dh || !auth) {
        return res.status(400).json({ message: 'endpoint, p256dh, and auth are required' })
      }

      const subscription = await advancedNotificationService.registerPushSubscription({
        userId,
        endpoint,
        p256dh,
        auth,
        deviceType,
        deviceName,
        userAgent,
      })

      res.status(201).json({ success: true, data: subscription })
    } catch (error: any) {
      console.error('Error registering push subscription:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async removePushSubscription(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { endpoint } = req.body

      if (!endpoint) {
        return res.status(400).json({ message: 'endpoint is required' })
      }

      await advancedNotificationService.removePushSubscription(userId, endpoint)
      res.json({ success: true, message: 'Subscription removed' })
    } catch (error: any) {
      console.error('Error removing push subscription:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getPushSubscriptions(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const subscriptions = await advancedNotificationService.getUserPushSubscriptions(userId)
      res.json({ success: true, data: subscriptions })
    } catch (error: any) {
      console.error('Error getting push subscriptions:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // SCHEDULED REMINDERS
  // ============================================

  async createReminder(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { title, message, type, frequency, scheduledTime, scheduledDays, courseId, lessonId, channels, maxRuns } = req.body

      if (!title || !message || !scheduledTime) {
        return res.status(400).json({ message: 'title, message, and scheduledTime are required' })
      }

      const reminder = await advancedNotificationService.createReminder({
        userId,
        title,
        message,
        type: type ?? 'custom',
        frequency: frequency ?? 'ONCE',
        scheduledTime,
        scheduledDays,
        courseId,
        lessonId,
        channels: channels ?? ['IN_APP', 'PUSH'],
        maxRuns,
      })

      res.status(201).json({ success: true, data: reminder })
    } catch (error: any) {
      console.error('Error creating reminder:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getReminders(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const reminders = await advancedNotificationService.getUserReminders(userId)
      res.json({ success: true, data: reminders })
    } catch (error: any) {
      console.error('Error getting reminders:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async updateReminder(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { id } = req.params

      const reminder = await advancedNotificationService.updateReminder(id, userId, req.body)
      res.json({ success: true, data: reminder })
    } catch (error: any) {
      if (error.message === 'Reminder not found') {
        return res.status(404).json({ message: error.message })
      }
      console.error('Error updating reminder:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async deleteReminder(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { id } = req.params

      await advancedNotificationService.deleteReminder(id, userId)
      res.json({ success: true, message: 'Reminder deleted' })
    } catch (error: any) {
      console.error('Error deleting reminder:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async toggleReminder(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { id } = req.params

      const reminder = await advancedNotificationService.toggleReminder(id, userId)
      res.json({ success: true, data: reminder })
    } catch (error: any) {
      if (error.message === 'Reminder not found') {
        return res.status(404).json({ message: error.message })
      }
      console.error('Error toggling reminder:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // NOTIFICATION HISTORY
  // ============================================

  async getHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { page, limit } = req.query

      const result = await advancedNotificationService.getNotificationHistory(
        userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 50
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      console.error('Error getting history:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async markClicked(req: Request, res: Response) {
    try {
      const { id } = req.params
      await advancedNotificationService.markNotificationClicked(id)
      res.json({ success: true })
    } catch (error: any) {
      console.error('Error marking clicked:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // STATISTICS
  // ============================================

  async getMyStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const stats = await advancedNotificationService.getStats(userId)
      res.json({ success: true, data: stats })
    } catch (error: any) {
      console.error('Error getting stats:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getPlatformStats(req: Request, res: Response) {
    try {
      const stats = await advancedNotificationService.getStats()
      res.json({ success: true, data: stats })
    } catch (error: any) {
      console.error('Error getting platform stats:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // ADMIN
  // ============================================

  async sendBulkNotification(req: Request, res: Response) {
    try {
      const { userIds, category, channel, title, body, actionUrl } = req.body

      if (!userIds || !category || !channel || !title || !body) {
        return res.status(400).json({
          message: 'userIds, category, channel, title, and body are required',
        })
      }

      const result = await advancedNotificationService.sendBulkNotification(
        userIds,
        category,
        channel,
        title,
        body,
        actionUrl
      )

      res.json({ success: true, data: result })
    } catch (error: any) {
      console.error('Error sending bulk notification:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async processReminders(req: Request, res: Response) {
    try {
      const dueReminders = await advancedNotificationService.getDueReminders()

      for (const reminder of dueReminders) {
        // Send notifications for each channel
        for (const channel of reminder.channels) {
          await advancedNotificationService.sendNotification({
            userId: reminder.userId,
            category: 'REMINDER',
            channel,
            title: reminder.title,
            body: reminder.message,
            metadata: {
              reminderId: reminder.id,
              type: reminder.type,
            },
          })
        }

        // Process the reminder (update next run time)
        await advancedNotificationService.processReminder(reminder.id)
      }

      res.json({
        success: true,
        data: { processed: dueReminders.length },
      })
    } catch (error: any) {
      console.error('Error processing reminders:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async processDigests(req: Request, res: Response) {
    try {
      const pendingDigests = await advancedNotificationService.getPendingDigests()

      for (const digest of pendingDigests) {
        // In real implementation, send email with digest items
        // For now, just mark as sent
        await advancedNotificationService.markDigestProcessed(digest.id, 'sent')
      }

      res.json({
        success: true,
        data: { processed: pendingDigests.length },
      })
    } catch (error: any) {
      console.error('Error processing digests:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export const advancedNotificationController = new AdvancedNotificationController()
export default advancedNotificationController
