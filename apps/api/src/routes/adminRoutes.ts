import { Router } from 'express'
import { adminController } from '../controllers/adminController'
import { authenticate, authorize } from '../middleware/auth'
import { UserRole } from '@prisma/client'
import { cacheMiddleware } from '../middleware/cache'

const router = Router()

// All routes require authentication and admin/super_admin role
router.use(authenticate)
router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN))

// ============================================
// ANALYTICS
// ============================================

router.get(
  '/analytics/platform-stats',
  cacheMiddleware({ ttl: 300 }),
  adminController.getPlatformStats
)

router.get(
  '/analytics/user-growth',
  cacheMiddleware({ ttl: 600 }),
  adminController.getUserGrowth
)

router.get(
  '/analytics/enrollment-growth',
  cacheMiddleware({ ttl: 600 }),
  adminController.getEnrollmentGrowth
)

router.get(
  '/analytics/revenue-trends',
  cacheMiddleware({ ttl: 600 }),
  adminController.getRevenueTrends
)

router.get(
  '/analytics/top-courses',
  cacheMiddleware({ ttl: 600 }),
  adminController.getTopCourses
)

router.get(
  '/analytics/top-instructors',
  cacheMiddleware({ ttl: 600 }),
  adminController.getTopInstructors
)

router.get(
  '/analytics/domain-stats',
  cacheMiddleware({ ttl: 600 }),
  adminController.getDomainStats
)

router.get(
  '/analytics/recent-activity',
  adminController.getRecentActivity
)

// ============================================
// USER MANAGEMENT
// ============================================

router.get('/users', adminController.getUsers)
router.get('/users/:userId', adminController.getUserDetails)
router.get('/users/:userId/stats', adminController.getUserStats)
router.put('/users/:userId/role', adminController.updateUserRole)
router.put('/users/:userId/status', adminController.toggleUserStatus)
router.put('/users/:userId/verify', adminController.verifyUser)
router.delete('/users/:userId', adminController.deleteUser)
router.post('/users/bulk-update', adminController.bulkUpdateUsers)

// ============================================
// COURSE MANAGEMENT & MODERATION
// ============================================

router.get('/courses', adminController.getCourses)
router.get('/courses/pending', adminController.getPendingCourses)
router.get('/courses/:courseId/stats', adminController.getCourseStats)
router.post('/courses/:courseId/approve', adminController.approveCourse)
router.post('/courses/:courseId/reject', adminController.rejectCourse)
router.post('/courses/:courseId/archive', adminController.archiveCourse)
router.put('/courses/:courseId/featured', adminController.toggleFeaturedCourse)
router.delete('/courses/:courseId', adminController.deleteCourse)
router.post('/courses/bulk-update', adminController.bulkUpdateCourses)

export default router
