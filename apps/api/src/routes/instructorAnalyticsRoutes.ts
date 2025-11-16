import { Router } from 'express'
import { instructorAnalyticsController } from '../controllers/instructorAnalyticsController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Dashboard overview
router.get(
  '/overview',
  instructorAnalyticsController.getOverview.bind(instructorAnalyticsController)
)

// Revenue analytics
router.get(
  '/revenue',
  instructorAnalyticsController.getRevenueAnalytics.bind(
    instructorAnalyticsController
  )
)

// Enrollment trends
router.get(
  '/enrollments',
  instructorAnalyticsController.getEnrollmentTrends.bind(
    instructorAnalyticsController
  )
)

// Course performance
router.get(
  '/courses',
  instructorAnalyticsController.getCoursePerformance.bind(
    instructorAnalyticsController
  )
)

// Student engagement
router.get(
  '/engagement',
  instructorAnalyticsController.getStudentEngagement.bind(
    instructorAnalyticsController
  )
)

// Review analytics
router.get(
  '/reviews',
  instructorAnalyticsController.getReviewAnalytics.bind(
    instructorAnalyticsController
  )
)

// Top courses
router.get(
  '/top-courses',
  instructorAnalyticsController.getTopCourses.bind(instructorAnalyticsController)
)

// Earnings summary
router.get(
  '/earnings',
  instructorAnalyticsController.getEarningsSummary.bind(
    instructorAnalyticsController
  )
)

export default router
