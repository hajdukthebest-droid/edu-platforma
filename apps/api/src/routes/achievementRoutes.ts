import { Router } from 'express'
import { achievementController } from '../controllers/achievementController'
import { authenticate } from '../middleware/auth'

const router = Router()

// Public routes
router.get('/achievements', achievementController.getAllAchievements.bind(achievementController))
router.get('/badges', achievementController.getAllBadges.bind(achievementController))

// Protected routes
router.use(authenticate)

router.get('/my-achievements', achievementController.getUserAchievements.bind(achievementController))
router.get('/my-badges', achievementController.getUserBadges.bind(achievementController))
router.get('/my-stats', achievementController.getUserStats.bind(achievementController))

export default router
