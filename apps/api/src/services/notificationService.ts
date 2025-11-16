import { prisma } from '@edu-platforma/database'
import { NotificationType } from '@prisma/client'
import { AppError } from '../middleware/errorHandler'

interface CreateNotificationData {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}

export class NotificationService {
  async createNotification(data: CreateNotificationData) {
    const notification = await prisma.notification.create({
      data,
    })

    return notification
  }

  async createBulkNotifications(notifications: CreateNotificationData[]) {
    const result = await prisma.notification.createMany({
      data: notifications,
    })

    return result
  }

  async getUserNotifications(userId: string, page = 1, limit = 20, unreadOnly = false) {
    const where = {
      userId,
      ...(unreadOnly && { isRead: false }),
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ])

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    })

    return count
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      throw new AppError(404, 'Notification not found')
    }

    if (notification.userId !== userId) {
      throw new AppError(403, 'Not authorized to modify this notification')
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return updated
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      throw new AppError(404, 'Notification not found')
    }

    if (notification.userId !== userId) {
      throw new AppError(403, 'Not authorized to delete this notification')
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    })
  }

  // Helper methods to create specific notification types
  async notifyAchievement(userId: string, achievementTitle: string, achievementId: string) {
    return this.createNotification({
      userId,
      type: NotificationType.ACHIEVEMENT,
      title: 'Novo postignuće!',
      message: `Čestitamo! Otključali ste postignuće: ${achievementTitle}`,
      link: `/profile/achievements`,
    })
  }

  async notifyBadge(userId: string, badgeTitle: string, badgeId: string) {
    return this.createNotification({
      userId,
      type: NotificationType.BADGE,
      title: 'Nova bedž!',
      message: `Osvojili ste novu bedž: ${badgeTitle}`,
      link: `/profile/badges`,
    })
  }

  async notifyCertificate(userId: string, courseTitle: string, certificateId: string) {
    return this.createNotification({
      userId,
      type: NotificationType.CERTIFICATE,
      title: 'Nova certifikat!',
      message: `Uspješno ste završili tečaj "${courseTitle}" i dobili certifikat`,
      link: `/certificates/${certificateId}/view`,
    })
  }

  async notifyCourseUpdate(userIds: string[], courseTitle: string, courseSlug: string) {
    const notifications = userIds.map((userId) => ({
      userId,
      type: NotificationType.COURSE_UPDATE,
      title: 'Ažuriranje tečaja',
      message: `Tečaj "${courseTitle}" je ažuriran s novim sadržajem`,
      link: `/courses/${courseSlug}`,
    }))

    return this.createBulkNotifications(notifications)
  }

  async notifyNewContent(userIds: string[], courseTitle: string, courseSlug: string) {
    const notifications = userIds.map((userId) => ({
      userId,
      type: NotificationType.NEW_CONTENT,
      title: 'Novi sadržaj dostupan',
      message: `Novi sadržaj je dodan u tečaj "${courseTitle}"`,
      link: `/courses/${courseSlug}`,
    }))

    return this.createBulkNotifications(notifications)
  }

  async notifyForumReply(userId: string, postTitle: string, postId: string, replierName: string) {
    return this.createNotification({
      userId,
      type: NotificationType.SOCIAL,
      title: 'Novi komentar na forum',
      message: `${replierName} je komentirao vašu temu: "${postTitle}"`,
      link: `/forum/posts/${postId}`,
    })
  }
}

export const notificationService = new NotificationService()
