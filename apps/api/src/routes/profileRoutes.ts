import { Router } from 'express'
import { profileController } from '../controllers/profileController'
import { authenticate } from '../middleware/auth'

const router = Router()

// Public profile (no auth required)
router.get('/profile/:username', profileController.getPublicProfile)

// Private routes (require auth)
router.get('/my-stats', authenticate, profileController.getUserStats)
router.put('/profile', authenticate, profileController.updateProfile)

export default router
