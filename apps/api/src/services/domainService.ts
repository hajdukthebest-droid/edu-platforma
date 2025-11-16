import { prisma } from '@edu-platforma/database'
import { cacheService } from './cacheService'

export class DomainService {
  /**
   * Get all active domains
   */
  async getAllDomains() {
    const cacheKey = 'domains:all:active'

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const domains = await prisma.domain.findMany({
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: {
                categories: true,
              },
            },
          },
        })
        return domains
      },
      3600 // Cache for 1 hour
    )
  }

  /**
   * Get domain by slug with categories
   */
  async getDomainBySlug(slug: string) {
    const cacheKey = `domain:${slug}:full`

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const domain = await prisma.domain.findUnique({
          where: { slug },
          include: {
            categories: {
              where: { domainId: { not: null } },
              orderBy: { name: 'asc' },
              include: {
                _count: {
                  select: {
                    courses: true,
                  },
                },
              },
            },
          },
        })
        return domain
      },
      1800 // Cache for 30 minutes
    )
  }

  /**
   * Get domains with statistics
   */
  async getDomainsWithStats() {
    const cacheKey = 'domains:with-stats'

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const domains = await prisma.domain.findMany({
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            categories: {
              select: {
                id: true,
                _count: {
                  select: {
                    courses: true,
                  },
                },
              },
            },
          },
        })

        // Calculate total courses per domain
        return domains.map((domain) => {
          const totalCourses = domain.categories.reduce(
            (sum, cat) => sum + cat._count.courses,
            0
          )

          return {
            ...domain,
            totalCourses,
            totalCategories: domain.categories.length,
          }
        })
      },
      1800 // Cache for 30 minutes
    )
  }

  /**
   * Get recommended domains for a user based on their activity
   */
  async getRecommendedDomains(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferredDomains: true,
        enrollments: {
          include: {
            course: {
              select: {
                category: {
                  select: {
                    domainId: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) return []

    // Get domains from user's enrolled courses
    const enrolledDomainIds = user.enrollments
      .map((e) => e.course.category?.domainId)
      .filter((id): id is string => id !== null && id !== undefined)

    // Count frequency
    const domainCounts: Record<string, number> = {}
    enrolledDomainIds.forEach((id) => {
      domainCounts[id] = (domainCounts[id] || 0) + 1
    })

    // Get all active domains
    const allDomains = await this.getAllDomains()

    // Sort by user activity
    const sortedDomains = allDomains.sort((a, b) => {
      const aCount = domainCounts[a.id] || 0
      const bCount = domainCounts[b.id] || 0
      return bCount - aCount
    })

    return sortedDomains.slice(0, 6) // Return top 6
  }

  /**
   * Update user's preferred domains
   */
  async updateUserPreferredDomains(userId: string, domainSlugs: string[]) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        preferredDomains: domainSlugs,
      },
    })

    // Invalidate user cache
    await cacheService.invalidateUser(userId)
  }
}

export const domainService = new DomainService()
