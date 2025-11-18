import { Router } from 'express'
import videoQuizController from '../controllers/videoQuizController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// Public routes (with optional authentication for personalized data)
router.get('/lesson/:lessonId', videoQuizController.getVideoQuizzesByLesson)

// Authenticated routes - Students
router.post('/:id/submit', authenticate, videoQuizController.submitAnswer)
router.get('/:id/response', authenticate, videoQuizController.getUserResponse)
router.get(
  '/lesson/:lessonId/responses',
  authenticate,
  videoQuizController.getUserResponsesByLesson
)
router.get(
  '/lesson/:lessonId/check-completion',
  authenticate,
  videoQuizController.checkRequiredCompletion
)

// Authenticated routes - Instructors/Admins
router.post('/', authenticate, authorize('INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'), videoQuizController.createVideoQuiz)
router.get('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'), videoQuizController.getVideoQuizById)
router.put('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'), videoQuizController.updateVideoQuiz)
router.delete('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'), videoQuizController.deleteVideoQuiz)
router.get('/:id/statistics', authenticate, authorize('INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'), videoQuizController.getQuizStatistics)
router.get(
  '/lesson/:lessonId/statistics',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'),
  videoQuizController.getLessonQuizStatistics
)

export default router
