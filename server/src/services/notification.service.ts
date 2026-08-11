import { prisma } from '../lib/prisma'
import { NotificationType, NotificationPriority } from '@prisma/client'

export interface CreateNotificationDTO {
  userId: string
  type: NotificationType
  title: string
  message: string
  entityType?: string
  entityId?: string
  eventKey?: string
  priority?: NotificationPriority
}

export class NotificationService {
  /**
   * Creates a notification, silently catching errors to prevent breaking core workflows.
   */
  static async createNotification(data: CreateNotificationDTO): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          entityType: data.entityType,
          entityId: data.entityId,
          eventKey: data.eventKey,
          priority: data.priority || 'NORMAL'
        }
      })
    } catch (error: any) {
      // Check for unique constraint violation (duplicate notification)
      if (error.code === 'P2002') {
        console.log(`Duplicate notification prevented for eventKey: ${data.eventKey}, user: ${data.userId}`)
      } else {
        console.error('Failed to create notification:', error)
      }
      // Do NOT throw error; we don't want to break the business operation.
    }
  }

  static async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where: { userId } })
    ])

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false }
    })
  }

  static async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification) {
      return null
    }

    if (notification.userId !== userId) {
      throw new Error('Forbidden')
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() }
    })
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() }
    })
  }
}
