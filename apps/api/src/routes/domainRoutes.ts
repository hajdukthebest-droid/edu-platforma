import { Router } from 'express'
import { domainController } from '../controllers/domainController'
import { authenticate } from '../middleware/auth'
import { cacheMiddleware } from '../middleware/cache'

const router = Router()

// Public routes
router.get(
  '/',
  cacheMiddleware({ ttl: 3600 }), // Cache for 1 hour
  domainController.getAllDomains
)

router.get(
  '/with-stats',
  cacheMiddleware({ ttl: 1800 }), // Cache for 30 minutes
  domainController.getDomainsWithStats
)

router.get(
  '/:slug',
  cacheMiddleware({ ttl: 1800 }), // Cache for 30 minutes
  domainController.getDomainBySlug
)

// Protected routes
router.get(
  '/recommended/for-me',
  authenticate,
  domainController.getRecommendedDomains
)

router.put(
  '/preferred',
  authenticate,
  domainController.updateUserPreferredDomains
)

export default router
