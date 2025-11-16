import { Router } from 'express'
import { assessmentController } from '../controllers/assessmentController'
import { authenticate, authorize } from '../middleware/auth'
import { UserRole } from '@prisma/client'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Learner routes
router.get('/:id/start', assessmentController.startAssessment.bind(assessmentController))
router.post('/:id/submit', assessmentController.submitAssessment.bind(assessmentController))
router.get('/:id/attempts', assessmentController.getUserAttempts.bind(assessmentController))
router.get(
  '/attempts/:attemptId',
  assessmentController.getAttempt.bind(assessmentController)
)

// Instructor/Admin routes
router.post(
  '/',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assessmentController.createAssessment.bind(assessmentController)
)
router.get('/:id', assessmentController.getAssessment.bind(assessmentController))
router.post(
  '/:id/questions',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assessmentController.addQuestion.bind(assessmentController)
)
router.put(
  '/questions/:questionId',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assessmentController.updateQuestion.bind(assessmentController)
)
router.delete(
  '/questions/:questionId',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assessmentController.deleteQuestion.bind(assessmentController)
)

export default router
