import { Router } from 'express'
import advancedNotificationController from '../controllers/advancedNotificationController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticate)

// ============================================
// PREFERENCES
// ============================================

// Get my notification preferences
router.get('/preferences', advancedNotificationController.getPreferences)

// Update my notification preferences
router.put('/preferences', advancedNotificationController.updatePreferences)

// ============================================
// PUSH SUBSCRIPTIONS
// ============================================

// Register push subscription
router.post('/push/subscribe', advancedNotificationController.registerPushSubscription)

// Remove push subscription
router.delete('/push/subscribe', advancedNotificationController.removePushSubscription)

// Get my push subscriptions
router.get('/push/subscriptions', advancedNotificationController.getPushSubscriptions)

// ============================================
// SCHEDULED REMINDERS
// ============================================

// Create reminder
router.post('/reminders', advancedNotificationController.createReminder)

// Get my reminders
router.get('/reminders', advancedNotificationController.getReminders)

// Update reminder
router.put('/reminders/:id', advancedNotificationController.updateReminder)

// Delete reminder
router.delete('/reminders/:id', advancedNotificationController.deleteReminder)

// Toggle reminder
router.post('/reminders/:id/toggle', advancedNotificationController.toggleReminder)

// ============================================
// NOTIFICATION HISTORY
// ============================================

// Get notification history
router.get('/history', advancedNotificationController.getHistory)

// Mark notification as clicked
router.post('/history/:id/click', advancedNotificationController.markClicked)

// ============================================
// STATISTICS
// ============================================

// Get my notification stats
router.get('/stats', advancedNotificationController.getMyStats)

// ============================================
// ADMIN ROUTES
// ============================================

// Send bulk notification
router.post('/admin/send-bulk', authorize('ADMIN', 'SUPER_ADMIN'), advancedNotificationController.sendBulkNotification)

// Get platform stats
router.get('/admin/stats', authorize('ADMIN', 'SUPER_ADMIN'), advancedNotificationController.getPlatformStats)

// Process pending reminders (for cron job)
router.post('/admin/process-reminders', authorize('ADMIN', 'SUPER_ADMIN'), advancedNotificationController.processReminders)

// Process pending digests (for cron job)
router.post('/admin/process-digests', authorize('ADMIN', 'SUPER_ADMIN'), advancedNotificationController.processDigests)

export default router
