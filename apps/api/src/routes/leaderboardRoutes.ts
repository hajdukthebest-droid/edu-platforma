import { Router } from 'express'
import { leaderboardController } from '../controllers/leaderboardController'
import { authenticate } from '../middleware/auth'

const router = Router()

// Public leaderboard routes
router.get('/', leaderboardController.getGlobalLeaderboard.bind(leaderboardController))
router.get(
  '/period/:period',
  leaderboardController.getPeriodLeaderboard.bind(leaderboardController)
)
router.get('/streak', leaderboardController.getStreakLeaderboard.bind(leaderboardController))

// Protected routes
router.get('/my-rank', authenticate, leaderboardController.getUserRank.bind(leaderboardController))

export default router
