import { Router } from 'express'
import { liveSessionController } from '../controllers/liveSessionController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Session management
router.post('/', liveSessionController.createSession.bind(liveSessionController))
router.get('/', liveSessionController.getSessions.bind(liveSessionController))
router.get('/:id', liveSessionController.getSessionById.bind(liveSessionController))
router.put('/:id', liveSessionController.updateSession.bind(liveSessionController))

// Session control
router.post('/:id/start', liveSessionController.startSession.bind(liveSessionController))
router.post('/:id/end', liveSessionController.endSession.bind(liveSessionController))
router.post('/:id/cancel', liveSessionController.cancelSession.bind(liveSessionController))

// Attendance
router.post('/:id/join', liveSessionController.joinSession.bind(liveSessionController))
router.post('/:id/leave', liveSessionController.leaveSession.bind(liveSessionController))
router.get('/:id/attendance', liveSessionController.getAttendance.bind(liveSessionController))

// Chat & Q/A
router.post('/:id/messages', liveSessionController.sendMessage.bind(liveSessionController))
router.get('/:id/messages', liveSessionController.getMessages.bind(liveSessionController))
router.post('/messages/:messageId/pin', liveSessionController.pinMessage.bind(liveSessionController))
router.post('/messages/:messageId/answer', liveSessionController.markQuestionAnswered.bind(liveSessionController))

// Analytics
router.get('/:id/analytics', liveSessionController.getAnalytics.bind(liveSessionController))

export default router
