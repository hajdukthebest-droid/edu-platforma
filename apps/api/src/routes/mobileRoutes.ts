import { Router } from 'express'
import mobileController from '../controllers/mobileController'
import { authenticate, optionalAuth } from '../middleware/auth'
import { detectMobile } from '../middleware/apiVersion'

const router = Router()

// Apply mobile detection middleware
router.use(detectMobile)

// Public endpoints (no auth required)
router.get('/courses', mobileController.getCoursesOptimized)
router.get('/courses/:slug', mobileController.getCourseDetailOptimized)
router.get('/config', mobileController.getAppConfig)

// Protected endpoints (auth required)
router.get('/my-courses', authenticate, mobileController.getMyCoursesOptimized)
router.post('/batch', authenticate, mobileController.batchRequest)
router.post('/sync', authenticate, mobileController.sync)

export default router
