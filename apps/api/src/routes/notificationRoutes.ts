import { Router } from 'express'
import { notificationController } from '../controllers/notificationController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticate)

router.get('/', notificationController.getUserNotifications.bind(notificationController))
router.get('/unread-count', notificationController.getUnreadCount.bind(notificationController))
router.post('/mark-all-read', notificationController.markAllAsRead.bind(notificationController))
router.post('/:id/read', notificationController.markAsRead.bind(notificationController))
router.delete('/:id', notificationController.deleteNotification.bind(notificationController))

export default router
