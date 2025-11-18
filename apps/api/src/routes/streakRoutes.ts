import { Router } from 'express'
import streakController from '../controllers/streakController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All streak routes require authentication
router.use(authenticate)

// User streak data
router.get('/', streakController.getStreak)
router.post('/activity', streakController.recordActivity)
router.post('/freeze', streakController.useFreeze)
router.put('/goals', streakController.updateGoals)

// Statistics and insights
router.get('/statistics', streakController.getStatistics)
router.get('/calendar/:year/:month', streakController.getCalendar)
router.get('/at-risk', streakController.checkAtRisk)

// Leaderboard
router.get('/leaderboard', streakController.getLeaderboard)

export default router
