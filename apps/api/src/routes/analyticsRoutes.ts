import { Router } from 'express'
import analyticsController from '../controllers/analyticsController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All analytics routes require authentication
router.use(authenticate)

// ===== ANALYTICS ENDPOINTS =====
router.get('/overview', analyticsController.getPlatformOverview)
router.get('/time-series/:metric', analyticsController.getTimeSeries)
router.get('/cohort', analyticsController.getCohortAnalysis)
router.get('/funnel', analyticsController.getFunnelAnalysis)
router.get('/courses/:courseId/performance', analyticsController.getCoursePerformance)
router.get('/engagement', analyticsController.getUserEngagement)
router.get('/revenue', analyticsController.getRevenueAnalytics)
router.get('/instructors/:instructorId', analyticsController.getInstructorAnalytics)

// ===== REPORTING ENDPOINTS =====
router.get('/reports/enrollments', analyticsController.getEnrollmentReport)
router.get('/reports/courses', analyticsController.getCoursePerformanceReport)
router.get('/reports/users', analyticsController.getUserActivityReport)
router.get('/reports/revenue', analyticsController.getRevenueReport)
router.get('/reports/instructors', analyticsController.getInstructorReport)
router.get('/reports/platform', analyticsController.getPlatformReport)

export default router
