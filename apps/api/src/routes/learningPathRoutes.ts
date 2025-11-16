import { Router } from 'express'
import { learningPathController } from '../controllers/learningPathController'
import { authenticate, authorize } from '../middleware/auth'
import { UserRole } from '@prisma/client'

const router = Router()

// Public routes
router.get('/', learningPathController.getLearningPaths.bind(learningPathController))
router.get('/:id', learningPathController.getLearningPathById.bind(learningPathController))
router.get('/slug/:slug', learningPathController.getLearningPathBySlug.bind(learningPathController))

// Protected routes
router.use(authenticate)

router.post(
  '/',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  learningPathController.createLearningPath.bind(learningPathController)
)
router.put(
  '/:id',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  learningPathController.updateLearningPath.bind(learningPathController)
)
router.post('/:id/enroll', learningPathController.enrollInLearningPath.bind(learningPathController))
router.get('/:id/progress', learningPathController.getUserProgress.bind(learningPathController))
router.get('/user/my-paths', learningPathController.getUserLearningPaths.bind(learningPathController))

export default router
