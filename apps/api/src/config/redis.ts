import Redis from 'ioredis'
import { env } from './env'

let redis: Redis | null = null

export function getRedisClient(): Redis | null {
  if (!env.REDIS_URL) {
    console.log('⚠️  Redis URL not configured. Caching will be disabled.')
    return null
  }

  if (!redis) {
    try {
      redis = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000)
          return delay
        },
        reconnectOnError(err) {
          const targetError = 'READONLY'
          if (err.message.includes(targetError)) {
            // Only reconnect when the error contains "READONLY"
            return true
          }
          return false
        },
      })

      redis.on('connect', () => {
        console.log('✅ Redis connected')
      })

      redis.on('error', (error) => {
        console.error('❌ Redis error:', error.message)
      })

      redis.on('close', () => {
        console.log('⚠️  Redis connection closed')
      })
    } catch (error) {
      console.error('❌ Failed to create Redis client:', error)
      return null
    }
  }

  return redis
}

export async function closeRedisConnection() {
  if (redis) {
    await redis.quit()
    redis = null
    console.log('✅ Redis connection closed')
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await closeRedisConnection()
})

process.on('SIGINT', async () => {
  await closeRedisConnection()
})
