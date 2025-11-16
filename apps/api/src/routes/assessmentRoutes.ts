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

router.put(
  '/:id',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assessmentController.updateAssessment.bind(assessmentController)
)

router.delete(
  '/:id',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assessmentController.deleteAssessment.bind(assessmentController)
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

// NEW ROUTES
router.get(
  '/course/:courseId',
  assessmentController.getCourseAssessments.bind(assessmentController)
)

router.get(
  '/instructor/my-assessments',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assessmentController.getInstructorAssessments.bind(assessmentController)
)

router.get(
  '/:id/all-attempts',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assessmentController.getAssessmentAttempts.bind(assessmentController)
)

router.post(
  '/attempts/:attemptId/grade',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assessmentController.gradeAttempt.bind(assessmentController)
)

router.get(
  '/:id/analytics',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assessmentController.getAssessmentAnalytics.bind(assessmentController)
)

router.get(
  '/:id/question-analytics',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assessmentController.getQuestionAnalytics.bind(assessmentController)
)

router.post(
  '/:id/reorder',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assessmentController.reorderQuestions.bind(assessmentController)
)

router.post(
  '/:id/duplicate',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assessmentController.duplicateAssessment.bind(assessmentController)
)

export default router
