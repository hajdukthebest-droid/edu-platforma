import { Router } from 'express'
import { adminController } from '../controllers/adminController'
import { authenticate, authorize } from '../middleware/auth'
import { UserRole } from '@prisma/client'

const router = Router()

// All routes require authentication and admin/super_admin role
router.use(authenticate)
router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN))

// Dashboard
router.get('/dashboard', adminController.getDashboardStats.bind(adminController))

// Users
router.get('/users', adminController.getUsers.bind(adminController))
router.put('/users/:userId/role', adminController.updateUserRole.bind(adminController))
router.put('/users/:userId/status', adminController.updateUserStatus.bind(adminController))
router.delete('/users/:userId', adminController.deleteUser.bind(adminController))

// Courses
router.get('/courses', adminController.getAllCourses.bind(adminController))
router.put('/courses/:courseId/status', adminController.updateCourseStatus.bind(adminController))
router.delete('/courses/:courseId', adminController.deleteCourse.bind(adminController))

// Analytics
router.get('/analytics', adminController.getAnalytics.bind(adminController))
router.get('/system-health', adminController.getSystemHealth.bind(adminController))

export default router
