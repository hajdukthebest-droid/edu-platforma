import { Router } from 'express'
import { recommendationController } from '../controllers/recommendationController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Get personalized recommendations
router.get('/for-you', recommendationController.getRecommendations)

// Get trending courses
router.get('/trending', recommendationController.getTrendingCourses)

// Get similar courses
router.get('/similar/:courseId', recommendationController.getSimilarCourses)

// Get popular courses by category
router.get('/popular/category/:categoryId', recommendationController.getPopularByCategory)

// Get "because you enrolled" recommendations
router.get('/because-you-enrolled/:courseId', recommendationController.getBecauseYouEnrolled)

export default router
