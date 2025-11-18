import { Router } from 'express'
import { peerReviewController } from '../controllers/peerReviewController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// Public routes (for viewing published assignments)
router.get('/assignments', peerReviewController.getAssignments)
router.get('/assignments/:id', peerReviewController.getAssignmentById)

// Authenticated routes
router.use(authenticate)

// Student routes
router.get('/my-submissions', peerReviewController.getMySubmissions)
router.get('/my-pending-reviews', peerReviewController.getMyPendingReviews)
router.post('/assignments/:id/submit', peerReviewController.submitAssignment)
router.get('/submissions/:id', peerReviewController.getSubmission)
router.get('/reviews/:id', peerReviewController.getReviewToComplete)
router.post('/reviews/:id/submit', peerReviewController.submitReview)
router.post('/reviews/:id/rate', peerReviewController.rateReviewHelpfulness)

// Instructor routes
router.post(
  '/assignments',
  authorize('INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'),
  peerReviewController.createAssignment
)
router.put(
  '/assignments/:id',
  authorize('INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'),
  peerReviewController.updateAssignment
)
router.post(
  '/assignments/:id/publish',
  authorize('INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'),
  peerReviewController.publishAssignment
)
router.get(
  '/assignments/:id/submissions',
  authorize('INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'),
  peerReviewController.getAssignmentSubmissions
)
router.post(
  '/submissions/:id/grade',
  authorize('INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'),
  peerReviewController.gradeSubmission
)

export default router
