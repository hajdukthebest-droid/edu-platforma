import { Router } from 'express'
import timedExamController from '../controllers/timedExamController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All timed exam routes require authentication
router.use(authenticate)

// Student routes
router.post('/:assessmentId/start', timedExamController.startSession)
router.get('/:assessmentId/session', timedExamController.getActiveSession)
router.put('/sessions/:sessionId', timedExamController.updateSession)
router.post('/sessions/:sessionId/pause', timedExamController.pauseSession)
router.post('/sessions/:sessionId/resume', timedExamController.resumeSession)
router.post('/sessions/:sessionId/proctoring-event', timedExamController.recordProctoringEvent)
router.post('/sessions/:sessionId/complete', timedExamController.completeSession)
router.post('/sessions/:sessionId/abandon', timedExamController.abandonSession)

// Instructor routes
router.get('/:assessmentId/statistics', timedExamController.getSessionStatistics)

// System routes (should be protected by admin role in production)
router.post('/check-expired', timedExamController.checkExpiredSessions)

export default router
