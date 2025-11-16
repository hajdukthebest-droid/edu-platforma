import { Router } from 'express'
import { searchController } from '../controllers/searchController'
import { cacheMiddleware } from '../middleware/cache'

const router = Router()

// Public search routes with caching
router.get(
  '/courses',
  cacheMiddleware({ ttl: 300 }), // Cache for 5 minutes
  searchController.searchCourses.bind(searchController)
)

router.get(
  '/users',
  cacheMiddleware({ ttl: 300 }),
  searchController.searchUsers.bind(searchController)
)

router.get(
  '/forum',
  cacheMiddleware({ ttl: 180 }), // Cache for 3 minutes
  searchController.searchForumPosts.bind(searchController)
)

router.get(
  '/global',
  cacheMiddleware({ ttl: 300 }),
  searchController.globalSearch.bind(searchController)
)

router.get(
  '/suggestions',
  cacheMiddleware({ ttl: 600 }), // Cache for 10 minutes
  searchController.getSuggestions.bind(searchController)
)

router.get(
  '/popular',
  cacheMiddleware({ ttl: 3600 }), // Cache for 1 hour
  searchController.getPopularSearches.bind(searchController)
)

router.get(
  '/facets',
  cacheMiddleware({ ttl: 600 }),
  searchController.getSearchFacets.bind(searchController)
)

export default router
