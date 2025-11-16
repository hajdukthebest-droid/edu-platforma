import { Router } from 'express'
import { instructorController } from '../controllers/instructorController'
import { authenticate, authorize } from '../middleware/auth'
import { UserRole } from '@prisma/client'

const router = Router()

// All routes require authentication and instructor role
router.use(authenticate)
router.use(authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN))

router.get('/dashboard', instructorController.getDashboard.bind(instructorController))
router.get(
  '/courses/:courseId/analytics',
  instructorController.getCourseAnalytics.bind(instructorController)
)
router.get(
  '/courses/:courseId/students/:studentId',
  instructorController.getStudentProgress.bind(instructorController)
)

export default router
