import { Router } from 'express'
import { progressController } from '../controllers/progressController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticate)

router.post(
  '/lessons/:lessonId/complete',
  progressController.markLessonComplete.bind(progressController)
)
router.put(
  '/lessons/:lessonId',
  progressController.updateLessonProgress.bind(progressController)
)
router.get(
  '/lessons/:lessonId',
  progressController.getLessonProgress.bind(progressController)
)
router.get(
  '/courses/:courseId/detailed',
  progressController.getCourseProgressDetailed.bind(progressController)
)

export default router
