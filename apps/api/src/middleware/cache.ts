import { Request, Response, NextFunction } from 'express'
import { cacheService } from '../services/cacheService'

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  key?: (req: Request) => string // Custom key generator
  condition?: (req: Request) => boolean // Conditional caching
}

/**
 * Middleware to cache GET responses
 */
export function cacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = 300, // 5 minutes default
    key: keyFn = defaultKeyGenerator,
    condition = () => true,
  } = options

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next()
    }

    // Check condition
    if (!condition(req)) {
      return next()
    }

    // Check if caching is available
    if (!cacheService.isAvailable()) {
      return next()
    }

    // Generate cache key
    const cacheKey = keyFn(req)

    try {
      // Try to get from cache
      const cached = await cacheService.get(cacheKey)

      if (cached !== null) {
        // Return cached response
        res.set('X-Cache', 'HIT')
        return res.json(cached)
      }

      // Cache miss - capture the response
      res.set('X-Cache', 'MISS')

      // Override res.json to cache the response
      const originalJson = res.json.bind(res)
      res.json = function (data: any) {
        // Cache the response (don't await to avoid blocking)
        cacheService.set(cacheKey, data, ttl).catch((error) => {
          console.error('Failed to cache response:', error)
        })

        return originalJson(data)
      }

      next()
    } catch (error) {
      console.error('Cache middleware error:', error)
      next()
    }
  }
}

/**
 * Default cache key generator
 */
function defaultKeyGenerator(req: Request): string {
  const userId = (req as any).user?.id || 'anonymous'
  const path = req.path
  const query = req.query ? JSON.stringify(req.query) : ''

  return cacheService.generateKey('route', path, query, userId)
}

/**
 * Create a custom key generator based on params
 */
export function createKeyGenerator(...parts: ((req: Request) => string | number)[]) {
  return (req: Request): string => {
    const values = parts.map((fn) => fn(req))
    return cacheService.generateKey(...values)
  }
}

/**
 * Predefined key generators
 */
export const keyGenerators = {
  /**
   * Key for course by ID
   */
  courseById: createKeyGenerator(
    () => 'course',
    (req) => req.params.courseId || req.params.id,
    (req) => (req as any).user?.id || 'anonymous'
  ),

  /**
   * Key for user-specific data
   */
  userSpecific: (prefix: string) =>
    createKeyGenerator(
      () => prefix,
      (req) => (req as any).user?.id || 'anonymous'
    ),

  /**
   * Key for list endpoints with pagination
   */
  list: (prefix: string) =>
    createKeyGenerator(
      () => prefix,
      (req) => req.query.page || '1',
      (req) => req.query.limit || '10',
      (req) => JSON.stringify(req.query)
    ),

  /**
   * Key for recommendations
   */
  recommendations: createKeyGenerator(
    () => 'recommendations',
    (req) => (req as any).user?.id || 'anonymous',
    (req) => req.path,
    (req) => JSON.stringify(req.query)
  ),
}

/**
 * Helper to invalidate cache based on patterns
 */
export async function invalidateCache(pattern: string): Promise<void> {
  await cacheService.deletePattern(pattern)
}
