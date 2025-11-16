import { getRedisClient } from '../config/redis'
import { createHash } from 'crypto'

export class CacheService {
  private redis = getRedisClient()
  private defaultTTL = 300 // 5 minutes in seconds

  /**
   * Check if caching is available
   */
  isAvailable(): boolean {
    return this.redis !== null
  }

  /**
   * Generate a cache key from parts
   */
  generateKey(...parts: (string | number)[]): string {
    return parts.join(':')
  }

  /**
   * Generate a hash-based key for complex objects
   */
  generateHashKey(prefix: string, data: any): string {
    const hash = createHash('md5').update(JSON.stringify(data)).digest('hex')
    return `${prefix}:${hash}`
  }

  /**
   * Get a value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.redis) return null

    try {
      const value = await this.redis.get(key)
      if (!value) return null

      return JSON.parse(value) as T
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error)
      return null
    }
  }

  /**
   * Set a value in cache
   */
  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<boolean> {
    if (!this.redis) return false

    try {
      const serialized = JSON.stringify(value)
      await this.redis.setex(key, ttl, serialized)
      return true
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error)
      return false
    }
  }

  /**
   * Delete a key from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.redis) return false

    try {
      await this.redis.del(key)
      return true
    } catch (error) {
      console.error(`Cache DELETE error for key ${key}:`, error)
      return false
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!this.redis) return 0

    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length === 0) return 0

      await this.redis.del(...keys)
      return keys.length
    } catch (error) {
      console.error(`Cache DELETE PATTERN error for pattern ${pattern}:`, error)
      return 0
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.redis) return false

    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      console.error(`Cache EXISTS error for key ${key}:`, error)
      return false
    }
  }

  /**
   * Get or set a value using a function
   */
  async getOrSet<T = any>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Fetch fresh data
    const fresh = await fetchFn()

    // Store in cache (don't await to avoid blocking)
    this.set(key, fresh, ttl).catch((error) => {
      console.error('Failed to cache data:', error)
    })

    return fresh
  }

  /**
   * Increment a counter
   */
  async increment(key: string, amount: number = 1): Promise<number | null> {
    if (!this.redis) return null

    try {
      const result = await this.redis.incrby(key, amount)
      return result
    } catch (error) {
      console.error(`Cache INCREMENT error for key ${key}:`, error)
      return null
    }
  }

  /**
   * Set expiry on a key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.redis) return false

    try {
      await this.redis.expire(key, ttl)
      return true
    } catch (error) {
      console.error(`Cache EXPIRE error for key ${key}:`, error)
      return false
    }
  }

  /**
   * Get time to live for a key
   */
  async ttl(key: string): Promise<number | null> {
    if (!this.redis) return null

    try {
      const result = await this.redis.ttl(key)
      return result
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error)
      return null
    }
  }

  /**
   * Cache invalidation helpers
   */
  async invalidateCourse(courseId: string): Promise<void> {
    await this.deletePattern(`course:${courseId}:*`)
    await this.deletePattern(`courses:*`)
  }

  async invalidateUser(userId: string): Promise<void> {
    await this.deletePattern(`user:${userId}:*`)
    await this.delete(`user:${userId}`)
  }

  async invalidateRecommendations(userId?: string): Promise<void> {
    if (userId) {
      await this.deletePattern(`recommendations:${userId}:*`)
    } else {
      await this.deletePattern(`recommendations:*`)
    }
  }

  async invalidateEnrollment(courseId: string, userId: string): Promise<void> {
    await this.delete(`enrollment:${userId}:${courseId}`)
    await this.invalidateCourse(courseId)
    await this.invalidateUser(userId)
  }

  /**
   * Clear all cache
   */
  async flush(): Promise<boolean> {
    if (!this.redis) return false

    try {
      await this.redis.flushdb()
      console.log('✅ Cache flushed')
      return true
    } catch (error) {
      console.error('Cache FLUSH error:', error)
      return false
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    if (!this.redis) {
      return { available: false }
    }

    try {
      const info = await this.redis.info('stats')
      const dbsize = await this.redis.dbsize()

      return {
        available: true,
        dbsize,
        info,
      }
    } catch (error) {
      console.error('Cache STATS error:', error)
      return { available: false, error: error.message }
    }
  }
}

export const cacheService = new CacheService()
