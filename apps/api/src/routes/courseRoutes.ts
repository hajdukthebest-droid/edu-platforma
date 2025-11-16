import { Router } from 'express'
import { courseController } from '../controllers/courseController'
import { authenticate, authorize } from '../middleware/auth'
import { UserRole } from '@prisma/client'

const router = Router()

// Public routes
router.get('/', courseController.getCourses.bind(courseController))
router.get('/:id', courseController.getCourseById.bind(courseController))
router.get('/slug/:slug', courseController.getCourseBySlug.bind(courseController))

// Protected routes
router.use(authenticate)

router.post(
  '/',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  courseController.createCourse.bind(courseController)
)
router.post('/:id/enroll', courseController.enrollInCourse.bind(courseController))
router.get('/:id/progress', courseController.getCourseProgress.bind(courseController))

export default router
