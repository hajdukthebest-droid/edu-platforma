import { Router } from 'express'
import { studentDashboardController } from '../controllers/studentDashboardController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All dashboard routes require authentication
router.use(authenticate)

// Main dashboard
router.get('/', studentDashboardController.getDashboard)
router.get('/stats', studentDashboardController.getStats)

// Progress & Activity
router.get('/courses-in-progress', studentDashboardController.getCoursesInProgress)
router.get('/weekly-progress', studentDashboardController.getWeeklyProgress)
router.get('/activity-heatmap/:year', studentDashboardController.getActivityHeatmap)

// Deadlines & Achievements
router.get('/deadlines', studentDashboardController.getUpcomingDeadlines)
router.get('/achievements', studentDashboardController.getRecentAchievements)

// Insights & Recommendations
router.get('/insights', studentDashboardController.getLearningInsights)
router.get('/recommendations', studentDashboardController.getRecommendedCourses)

// Goals
router.put('/goals', studentDashboardController.updateGoals)

export default router
