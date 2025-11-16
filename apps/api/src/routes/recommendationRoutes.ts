import { Router } from 'express'
import { recommendationController } from '../controllers/recommendationController'
import { authenticate } from '../middleware/auth'
import { cacheMiddleware, keyGenerators } from '../middleware/cache'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Get personalized recommendations (cache for 10 minutes)
router.get(
  '/for-you',
  cacheMiddleware({ ttl: 600, key: keyGenerators.recommendations }),
  recommendationController.getRecommendations
)

// Get trending courses (cache for 15 minutes, same for all users)
router.get(
  '/trending',
  cacheMiddleware({
    ttl: 900,
    key: (req) => `trending:${req.query.limit || 10}:${req.query.days || 7}`,
  }),
  recommendationController.getTrendingCourses
)

// Get similar courses (cache for 30 minutes)
router.get(
  '/similar/:courseId',
  cacheMiddleware({
    ttl: 1800,
    key: (req) => `similar:${req.params.courseId}:${req.query.limit || 5}`,
  }),
  recommendationController.getSimilarCourses
)

// Get popular courses by category (cache for 20 minutes)
router.get(
  '/popular/category/:categoryId',
  cacheMiddleware({
    ttl: 1200,
    key: (req) => `popular:${req.params.categoryId}:${req.query.limit || 10}`,
  }),
  recommendationController.getPopularByCategory
)

// Get "because you enrolled" recommendations (cache for 15 minutes)
router.get(
  '/because-you-enrolled/:courseId',
  cacheMiddleware({ ttl: 900, key: keyGenerators.recommendations }),
  recommendationController.getBecauseYouEnrolled
)

export default router
