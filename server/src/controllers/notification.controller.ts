import { Response } from 'express'
import { AuthenticatedRequest } from '../middleware/auth.middleware'
import { sendSuccess, sendError } from '../lib/response'
import { NotificationService } from '../services/notification.service'
import { notificationPaginationSchema, notificationIdSchema } from '../lib/validators'

export async function getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id
    const validation = notificationPaginationSchema.safeParse(req.query)
    
    if (!validation.success) {
      sendError(res, 'Invalid pagination parameters', 400, validation.error.flatten().fieldErrors)
      return
    }

    const { page, limit } = validation.data
    const result = await NotificationService.getUserNotifications(userId, page, limit)

    sendSuccess(res, 'Notifications retrieved successfully.', result)
  } catch (error) {
    console.error('Get notifications error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function getUnreadCount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id
    const unreadCount = await NotificationService.getUnreadCount(userId)
    sendSuccess(res, 'Unread count retrieved successfully.', { unreadCount })
  } catch (error) {
    console.error('Get unread count error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id
    const validation = notificationIdSchema.safeParse(req.params)

    if (!validation.success) {
      sendError(res, 'Invalid notification ID', 400, validation.error.flatten().fieldErrors)
      return
    }

    const { id } = validation.data
    
    try {
      const notification = await NotificationService.markAsRead(userId, id)
      if (!notification) {
        sendError(res, 'Notification not found.', 404)
        return
      }
      sendSuccess(res, 'Notification marked as read.', { notification })
    } catch (e: any) {
      if (e.message === 'Forbidden') {
        sendError(res, 'Forbidden. This notification belongs to another user.', 403)
      } else {
        throw e
      }
    }
  } catch (error) {
    console.error('Mark as read error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id
    await NotificationService.markAllAsRead(userId)
    sendSuccess(res, 'All notifications marked as read.')
  } catch (error) {
    console.error('Mark all as read error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}
