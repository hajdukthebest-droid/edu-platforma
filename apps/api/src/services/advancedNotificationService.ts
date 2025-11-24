import { PrismaClient, NotificationChannel, NotificationCategory, ReminderFrequency } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================
// INTERFACES
// ============================================

interface NotificationPreferencesUpdate {
  enabled?: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
  timezone?: string
  emailEnabled?: boolean
  pushEnabled?: boolean
  smsEnabled?: boolean
  categorySettings?: Record<string, Record<string, boolean>>
  emailDigestEnabled?: boolean
  emailDigestFrequency?: string
  emailDigestDay?: number
  emailDigestTime?: string
}

interface CreateReminderData {
  userId: string
  title: string
  message: string
  type: string
  frequency: ReminderFrequency
  scheduledTime: string
  scheduledDays?: number[]
  courseId?: string
  lessonId?: string
  channels: NotificationChannel[]
  maxRuns?: number
}

interface SendNotificationData {
  userId: string
  category: NotificationCategory
  channel: NotificationChannel
  title: string
  body: string
  actionUrl?: string
  metadata?: Record<string, unknown>
  templateId?: string
}

interface PushSubscriptionData {
  userId: string
  endpoint: string
  p256dh: string
  auth: string
  deviceType?: string
  deviceName?: string
  userAgent?: string
}

// ============================================
// NOTIFICATION SERVICE
// ============================================

class AdvancedNotificationService {
  // ============================================
  // PREFERENCES MANAGEMENT
  // ============================================

  /**
   * Get user's notification preferences
   */
  async getPreferences(userId: string) {
    let prefs = await prisma.notificationPreferences.findUnique({
      where: { userId },
    })

    if (!prefs) {
      // Create default preferences
      prefs = await prisma.notificationPreferences.create({
        data: {
          userId,
          categorySettings: {
            learning: { inApp: true, email: true, push: true },
            social: { inApp: true, email: false, push: true },
            achievement: { inApp: true, email: true, push: true },
            reminder: { inApp: true, email: true, push: true },
            system: { inApp: true, email: true, push: false },
            marketing: { inApp: false, email: false, push: false },
          },
        },
      })
    }

    return prefs
  }

  /**
   * Update user's notification preferences
   */
  async updatePreferences(userId: string, data: NotificationPreferencesUpdate) {
    return prisma.notificationPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
        categorySettings: data.categorySettings ?? undefined,
      },
      update: {
        ...data,
        categorySettings: data.categorySettings ?? undefined,
      },
    })
  }

  /**
   * Check if user should receive notification
   */
  async shouldSendNotification(userId: string, category: NotificationCategory, channel: NotificationChannel): Promise<boolean> {
    const prefs = await this.getPreferences(userId)

    if (!prefs.enabled) return false

    // Check channel-level settings
    if (channel === 'EMAIL' && !prefs.emailEnabled) return false
    if (channel === 'PUSH' && !prefs.pushEnabled) return false
    if (channel === 'SMS' && !prefs.smsEnabled) return false

    // Check category settings
    const categorySettings = prefs.categorySettings as Record<string, Record<string, boolean>> | null
    if (categorySettings) {
      const catKey = category.toLowerCase()
      const channelKey = channel === 'IN_APP' ? 'inApp' : channel.toLowerCase()

      if (categorySettings[catKey] && categorySettings[catKey][channelKey] === false) {
        return false
      }
    }

    // Check quiet hours
    if (prefs.quietHoursStart && prefs.quietHoursEnd && channel !== 'EMAIL') {
      const now = new Date()
      const currentTime = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        timeZone: prefs.timezone
      })

      const isInQuietHours = this.isTimeInRange(currentTime, prefs.quietHoursStart, prefs.quietHoursEnd)
      if (isInQuietHours) return false
    }

    return true
  }

  private isTimeInRange(time: string, start: string, end: string): boolean {
    if (start <= end) {
      return time >= start && time <= end
    } else {
      // Quiet hours span midnight
      return time >= start || time <= end
    }
  }

  // ============================================
  // PUSH SUBSCRIPTIONS
  // ============================================

  /**
   * Register a push subscription
   */
  async registerPushSubscription(data: PushSubscriptionData) {
    return prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: data.userId,
          endpoint: data.endpoint,
        },
      },
      create: {
        userId: data.userId,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        deviceType: data.deviceType,
        deviceName: data.deviceName,
        userAgent: data.userAgent,
        isActive: true,
      },
      update: {
        p256dh: data.p256dh,
        auth: data.auth,
        deviceType: data.deviceType,
        deviceName: data.deviceName,
        userAgent: data.userAgent,
        isActive: true,
        failureCount: 0,
      },
    })
  }

  /**
   * Remove a push subscription
   */
  async removePushSubscription(userId: string, endpoint: string) {
    await prisma.pushSubscription.deleteMany({
      where: { userId, endpoint },
    })
    return { success: true }
  }

  /**
   * Get user's push subscriptions
   */
  async getUserPushSubscriptions(userId: string) {
    return prisma.pushSubscription.findMany({
      where: { userId, isActive: true },
    })
  }

  /**
   * Mark subscription as failed
   */
  async markSubscriptionFailed(subscriptionId: string) {
    const sub = await prisma.pushSubscription.update({
      where: { id: subscriptionId },
      data: {
        failureCount: { increment: 1 },
      },
    })

    // Deactivate after 3 failures
    if (sub.failureCount >= 3) {
      await prisma.pushSubscription.update({
        where: { id: subscriptionId },
        data: { isActive: false },
      })
    }
  }

  // ============================================
  // SCHEDULED REMINDERS
  // ============================================

  /**
   * Create a scheduled reminder
   */
  async createReminder(data: CreateReminderData) {
    const nextRunAt = this.calculateNextRunTime(data.scheduledTime, data.frequency, data.scheduledDays)

    return prisma.scheduledReminder.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        frequency: data.frequency,
        scheduledTime: data.scheduledTime,
        scheduledDays: data.scheduledDays ?? [],
        nextRunAt,
        courseId: data.courseId,
        lessonId: data.lessonId,
        channels: data.channels,
        maxRuns: data.maxRuns,
      },
    })
  }

  /**
   * Update a reminder
   */
  async updateReminder(reminderId: string, userId: string, data: Partial<CreateReminderData>) {
    const reminder = await prisma.scheduledReminder.findFirst({
      where: { id: reminderId, userId },
    })

    if (!reminder) {
      throw new Error('Reminder not found')
    }

    const nextRunAt = data.scheduledTime || data.frequency || data.scheduledDays
      ? this.calculateNextRunTime(
          data.scheduledTime ?? reminder.scheduledTime,
          data.frequency ?? reminder.frequency,
          data.scheduledDays ?? reminder.scheduledDays
        )
      : undefined

    return prisma.scheduledReminder.update({
      where: { id: reminderId },
      data: {
        title: data.title,
        message: data.message,
        type: data.type,
        frequency: data.frequency,
        scheduledTime: data.scheduledTime,
        scheduledDays: data.scheduledDays,
        nextRunAt,
        courseId: data.courseId,
        lessonId: data.lessonId,
        channels: data.channels,
        maxRuns: data.maxRuns,
      },
    })
  }

  /**
   * Delete a reminder
   */
  async deleteReminder(reminderId: string, userId: string) {
    await prisma.scheduledReminder.deleteMany({
      where: { id: reminderId, userId },
    })
    return { success: true }
  }

  /**
   * Get user's reminders
   */
  async getUserReminders(userId: string) {
    return prisma.scheduledReminder.findMany({
      where: { userId, isActive: true },
      orderBy: { nextRunAt: 'asc' },
    })
  }

  /**
   * Toggle reminder active status
   */
  async toggleReminder(reminderId: string, userId: string) {
    const reminder = await prisma.scheduledReminder.findFirst({
      where: { id: reminderId, userId },
    })

    if (!reminder) {
      throw new Error('Reminder not found')
    }

    return prisma.scheduledReminder.update({
      where: { id: reminderId },
      data: { isActive: !reminder.isActive },
    })
  }

  /**
   * Get due reminders
   */
  async getDueReminders() {
    return prisma.scheduledReminder.findMany({
      where: {
        isActive: true,
        nextRunAt: { lte: new Date() },
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true },
        },
      },
    })
  }

  /**
   * Process a reminder (after sending)
   */
  async processReminder(reminderId: string) {
    const reminder = await prisma.scheduledReminder.findUnique({
      where: { id: reminderId },
    })

    if (!reminder) return

    const newRunCount = reminder.runCount + 1

    // Check if max runs reached
    if (reminder.maxRuns && newRunCount >= reminder.maxRuns) {
      await prisma.scheduledReminder.update({
        where: { id: reminderId },
        data: {
          isActive: false,
          runCount: newRunCount,
          lastRunAt: new Date(),
        },
      })
      return
    }

    // Calculate next run time
    if (reminder.frequency === 'ONCE') {
      await prisma.scheduledReminder.update({
        where: { id: reminderId },
        data: {
          isActive: false,
          runCount: newRunCount,
          lastRunAt: new Date(),
        },
      })
    } else {
      const nextRunAt = this.calculateNextRunTime(
        reminder.scheduledTime,
        reminder.frequency,
        reminder.scheduledDays
      )

      await prisma.scheduledReminder.update({
        where: { id: reminderId },
        data: {
          nextRunAt,
          runCount: newRunCount,
          lastRunAt: new Date(),
        },
      })
    }
  }

  private calculateNextRunTime(time: string, frequency: ReminderFrequency, days?: number[]): Date {
    const [hours, minutes] = time.split(':').map(Number)
    const now = new Date()
    let next = new Date()
    next.setHours(hours, minutes, 0, 0)

    if (next <= now) {
      next.setDate(next.getDate() + 1)
    }

    if (frequency === 'WEEKLY' && days && days.length > 0) {
      // Find next matching day
      while (!days.includes(next.getDay())) {
        next.setDate(next.getDate() + 1)
      }
    }

    return next
  }

  // ============================================
  // NOTIFICATION SENDING
  // ============================================

  /**
   * Send a notification
   */
  async sendNotification(data: SendNotificationData) {
    // Check preferences
    const shouldSend = await this.shouldSendNotification(data.userId, data.category, data.channel)

    if (!shouldSend) {
      return { sent: false, reason: 'User preferences' }
    }

    // Log the notification
    const log = await prisma.notificationLog.create({
      data: {
        userId: data.userId,
        category: data.category,
        channel: data.channel,
        templateId: data.templateId,
        title: data.title,
        body: data.body,
        actionUrl: data.actionUrl,
        metadata: data.metadata ?? null,
        status: 'pending',
      },
    })

    // In a real implementation, this would dispatch to actual notification services
    // For now, we'll mark as sent
    await prisma.notificationLog.update({
      where: { id: log.id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    })

    return { sent: true, logId: log.id }
  }

  /**
   * Send notification to multiple users
   */
  async sendBulkNotification(
    userIds: string[],
    category: NotificationCategory,
    channel: NotificationChannel,
    title: string,
    body: string,
    actionUrl?: string
  ) {
    const results = await Promise.all(
      userIds.map(userId =>
        this.sendNotification({
          userId,
          category,
          channel,
          title,
          body,
          actionUrl,
        })
      )
    )

    return {
      total: userIds.length,
      sent: results.filter(r => r.sent).length,
      skipped: results.filter(r => !r.sent).length,
    }
  }

  /**
   * Mark notification as clicked
   */
  async markNotificationClicked(logId: string) {
    return prisma.notificationLog.update({
      where: { id: logId },
      data: {
        status: 'clicked',
        clickedAt: new Date(),
      },
    })
  }

  /**
   * Get user's notification history
   */
  async getNotificationHistory(userId: string, page = 1, limit = 50) {
    const [logs, total] = await Promise.all([
      prisma.notificationLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notificationLog.count({ where: { userId } }),
    ])

    return {
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  // ============================================
  // EMAIL DIGESTS
  // ============================================

  /**
   * Add item to digest queue
   */
  async addToDigestQueue(userId: string, item: Record<string, unknown>) {
    const prefs = await this.getPreferences(userId)

    if (!prefs.emailDigestEnabled) return

    const scheduledFor = this.getNextDigestTime(
      prefs.emailDigestFrequency,
      prefs.emailDigestTime,
      prefs.emailDigestDay ?? undefined
    )

    // Find or create queue entry
    const existingQueue = await prisma.emailDigestQueue.findFirst({
      where: {
        userId,
        status: 'pending',
        scheduledFor: { gte: new Date() },
      },
    })

    if (existingQueue) {
      const items = existingQueue.items as unknown[]
      await prisma.emailDigestQueue.update({
        where: { id: existingQueue.id },
        data: {
          items: [...items, item],
          itemCount: { increment: 1 },
        },
      })
    } else {
      await prisma.emailDigestQueue.create({
        data: {
          userId,
          items: [item],
          itemCount: 1,
          scheduledFor,
        },
      })
    }
  }

  /**
   * Get pending digests to send
   */
  async getPendingDigests() {
    return prisma.emailDigestQueue.findMany({
      where: {
        status: 'pending',
        scheduledFor: { lte: new Date() },
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true },
        },
      },
    })
  }

  /**
   * Mark digest as processed
   */
  async markDigestProcessed(digestId: string, status: 'sent' | 'failed') {
    return prisma.emailDigestQueue.update({
      where: { id: digestId },
      data: {
        status,
        processedAt: new Date(),
      },
    })
  }

  private getNextDigestTime(frequency: string, time: string, day?: number): Date {
    const [hours, minutes] = time.split(':').map(Number)
    const next = new Date()
    next.setHours(hours, minutes, 0, 0)

    if (next <= new Date()) {
      if (frequency === 'daily') {
        next.setDate(next.getDate() + 1)
      } else if (frequency === 'weekly' && day !== undefined) {
        next.setDate(next.getDate() + 1)
        while (next.getDay() !== day) {
          next.setDate(next.getDate() + 1)
        }
      }
    }

    return next
  }

  // ============================================
  // NOTIFICATION TEMPLATES
  // ============================================

  /**
   * Get notification template
   */
  async getTemplate(name: string) {
    return prisma.notificationTemplate.findUnique({
      where: { name },
    })
  }

  /**
   * Render template with variables
   */
  renderTemplate(template: string, variables: Record<string, string>): string {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }
    return result
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get notification statistics
   */
  async getStats(userId?: string) {
    const where = userId ? { userId } : {}

    const [total, sent, clicked, byCategory] = await Promise.all([
      prisma.notificationLog.count({ where }),
      prisma.notificationLog.count({ where: { ...where, status: 'sent' } }),
      prisma.notificationLog.count({ where: { ...where, status: 'clicked' } }),
      prisma.notificationLog.groupBy({
        by: ['category'],
        where,
        _count: true,
      }),
    ])

    return {
      total,
      sent,
      clicked,
      clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = item._count
        return acc
      }, {} as Record<string, number>),
    }
  }
}

export const advancedNotificationService = new AdvancedNotificationService()
export default advancedNotificationService
