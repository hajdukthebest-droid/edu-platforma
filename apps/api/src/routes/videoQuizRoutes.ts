import { Router } from 'express'
import videoQuizController from '../controllers/videoQuizController'
import { authenticate } from '../middleware/auth'

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
// TODO: Add role-based middleware to restrict these to INSTRUCTOR/ADMIN only
router.post('/', authenticate, videoQuizController.createVideoQuiz)
router.get('/:id', authenticate, videoQuizController.getVideoQuizById)
router.put('/:id', authenticate, videoQuizController.updateVideoQuiz)
router.delete('/:id', authenticate, videoQuizController.deleteVideoQuiz)
router.get('/:id/statistics', authenticate, videoQuizController.getQuizStatistics)
router.get(
  '/lesson/:lessonId/statistics',
  authenticate,
  videoQuizController.getLessonQuizStatistics
)

export default router
