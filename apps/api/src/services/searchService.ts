import { prisma } from '@edu-platforma/database'
import { Prisma } from '@prisma/client'

export interface SearchFilters {
  query: string
  type?: 'courses' | 'users' | 'forum' | 'all'
  category?: string
  domain?: string
  level?: string
  priceRange?: { min: number; max: number }
  rating?: number
  page?: number
  limit?: number
  sortBy?: 'relevance' | 'rating' | 'popular' | 'newest' | 'price_low' | 'price_high'
}

export class SearchService {
  /**
   * Search courses using PostgreSQL full-text search
   */
  async searchCourses(filters: SearchFilters) {
    const {
      query,
      category,
      domain,
      level,
      priceRange,
      rating,
      page = 1,
      limit = 20,
      sortBy = 'relevance',
    } = filters

    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: 'PUBLISHED',
    }

    if (category) {
      where.categoryId = category
    }

    if (level) {
      where.level = level
    }

    if (priceRange) {
      where.price = {
        gte: priceRange.min,
        lte: priceRange.max,
      }
    }

    if (rating) {
      where.averageRating = {
        gte: rating,
      }
    }

    // If domain filter, add category relation
    if (domain) {
      where.category = {
        domainId: domain,
      }
    }

    // If we have a search query, use full-text search
    if (query && query.trim().length > 0) {
      const searchTerms = query.trim().split(' ').join(' & ')

      // Use raw SQL for full-text search
      const courses = await prisma.$queryRaw<any[]>`
        SELECT
          c.*,
          ts_rank(
            to_tsvector('english', COALESCE(c.title, '') || ' ' || COALESCE(c.description, '') || ' ' || COALESCE(c.short_description, '')),
            to_tsquery('english', ${searchTerms})
          ) as rank,
          json_build_object(
            'id', cat.id,
            'name', cat.name,
            'slug', cat.slug
          ) as category,
          json_build_object(
            'id', u.id,
            'firstName', u.first_name,
            'lastName', u.last_name,
            'email', u.email
          ) as creator
        FROM courses c
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN users u ON c.creator_id = u.id
        WHERE
          c.status = 'PUBLISHED'
          AND to_tsvector('english', COALESCE(c.title, '') || ' ' || COALESCE(c.description, '') || ' ' || COALESCE(c.short_description, ''))
          @@ to_tsquery('english', ${searchTerms})
          ${category ? Prisma.sql`AND c.category_id = ${category}` : Prisma.empty}
          ${level ? Prisma.sql`AND c.level = ${level}` : Prisma.empty}
          ${priceRange ? Prisma.sql`AND c.price >= ${priceRange.min} AND c.price <= ${priceRange.max}` : Prisma.empty}
          ${rating ? Prisma.sql`AND c.average_rating >= ${rating}` : Prisma.empty}
          ${domain ? Prisma.sql`AND cat.domain_id = ${domain}` : Prisma.empty}
        ORDER BY ${sortBy === 'relevance' ? Prisma.sql`rank DESC` : Prisma.empty}
                 ${sortBy === 'rating' ? Prisma.sql`c.average_rating DESC NULLS LAST` : Prisma.empty}
                 ${sortBy === 'popular' ? Prisma.sql`c.enrollment_count DESC` : Prisma.empty}
                 ${sortBy === 'newest' ? Prisma.sql`c.created_at DESC` : Prisma.empty}
                 ${sortBy === 'price_low' ? Prisma.sql`c.price ASC` : Prisma.empty}
                 ${sortBy === 'price_high' ? Prisma.sql`c.price DESC` : Prisma.empty}
        LIMIT ${limit}
        OFFSET ${offset}
      `

      const total = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM courses c
        LEFT JOIN categories cat ON c.category_id = cat.id
        WHERE
          c.status = 'PUBLISHED'
          AND to_tsvector('english', COALESCE(c.title, '') || ' ' || COALESCE(c.description, '') || ' ' || COALESCE(c.short_description, ''))
          @@ to_tsquery('english', ${searchTerms})
          ${category ? Prisma.sql`AND c.category_id = ${category}` : Prisma.empty}
          ${level ? Prisma.sql`AND c.level = ${level}` : Prisma.empty}
          ${priceRange ? Prisma.sql`AND c.price >= ${priceRange.min} AND c.price <= ${priceRange.max}` : Prisma.empty}
          ${rating ? Prisma.sql`AND c.average_rating >= ${rating}` : Prisma.empty}
          ${domain ? Prisma.sql`AND cat.domain_id = ${domain}` : Prisma.empty}
      `

      return {
        courses,
        pagination: {
          page,
          limit,
          total: Number(total[0].count),
          totalPages: Math.ceil(Number(total[0].count) / limit),
        },
      }
    }

    // No search query, just filter
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: this.getSortOrder(sortBy),
        skip: offset,
        take: limit,
      }),
      prisma.course.count({ where }),
    ])

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Search users
   */
  async searchUsers(query: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit

    if (!query || query.trim().length === 0) {
      return {
        users: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      }
    }

    const searchTerms = query.trim().split(' ').join(' & ')

    const users = await prisma.$queryRaw<any[]>`
      SELECT
        u.id,
        u.email,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.bio,
        u.profile_picture as "profilePicture",
        u.role,
        u.total_points as "totalPoints",
        ts_rank(
          to_tsvector('english', COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '') || ' ' || COALESCE(u.bio, '')),
          to_tsquery('english', ${searchTerms})
        ) as rank
      FROM users u
      WHERE
        u.is_active = true
        AND to_tsvector('english', COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '') || ' ' || COALESCE(u.bio, ''))
        @@ to_tsquery('english', ${searchTerms})
      ORDER BY rank DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    const total = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM users u
      WHERE
        u.is_active = true
        AND to_tsvector('english', COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '') || ' ' || COALESCE(u.bio, ''))
        @@ to_tsquery('english', ${searchTerms})
    `

    return {
      users,
      pagination: {
        page,
        limit,
        total: Number(total[0].count),
        totalPages: Math.ceil(Number(total[0].count) / limit),
      },
    }
  }

  /**
   * Search forum posts
   */
  async searchForumPosts(query: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit

    if (!query || query.trim().length === 0) {
      return {
        posts: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      }
    }

    const searchTerms = query.trim().split(' ').join(' & ')

    const posts = await prisma.$queryRaw<any[]>`
      SELECT
        fp.id,
        fp.title,
        fp.content,
        fp.created_at as "createdAt",
        fp.view_count as "viewCount",
        json_build_object(
          'id', u.id,
          'firstName', u.first_name,
          'lastName', u.last_name,
          'profilePicture', u.profile_picture
        ) as author,
        json_build_object(
          'id', fc.id,
          'name', fc.name,
          'slug', fc.slug
        ) as category,
        ts_rank(
          to_tsvector('english', COALESCE(fp.title, '') || ' ' || COALESCE(fp.content, '')),
          to_tsquery('english', ${searchTerms})
        ) as rank
      FROM forum_posts fp
      LEFT JOIN users u ON fp.author_id = u.id
      LEFT JOIN forum_categories fc ON fp.category_id = fc.id
      WHERE
        to_tsvector('english', COALESCE(fp.title, '') || ' ' || COALESCE(fp.content, ''))
        @@ to_tsquery('english', ${searchTerms})
      ORDER BY rank DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    const total = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM forum_posts fp
      WHERE
        to_tsvector('english', COALESCE(fp.title, '') || ' ' || COALESCE(fp.content, ''))
        @@ to_tsquery('english', ${searchTerms})
    `

    return {
      posts,
      pagination: {
        page,
        limit,
        total: Number(total[0].count),
        totalPages: Math.ceil(Number(total[0].count) / limit),
      },
    }
  }

  /**
   * Global search across all content types
   */
  async globalSearch(query: string, page = 1, limit = 10) {
    if (!query || query.trim().length === 0) {
      return {
        courses: [],
        users: [],
        posts: [],
      }
    }

    const [courses, users, posts] = await Promise.all([
      this.searchCourses({ query, page, limit: 5 }),
      this.searchUsers(query, page, 5),
      this.searchForumPosts(query, page, 5),
    ])

    return {
      courses: courses.courses,
      users: users.users,
      posts: posts.posts,
    }
  }

  /**
   * Get search suggestions for autocomplete
   */
  async getSuggestions(query: string, limit = 10) {
    if (!query || query.trim().length < 2) {
      return []
    }

    const searchPattern = `${query}%`

    // Get course suggestions
    const courseSuggestions = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        title: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
      },
      take: limit,
      orderBy: {
        enrollmentCount: 'desc',
      },
    })

    return courseSuggestions.map((course) => ({
      type: 'course',
      id: course.id,
      title: course.title,
      slug: course.slug,
      thumbnail: course.thumbnail,
      url: `/courses/${course.slug}`,
    }))
  }

  /**
   * Get popular searches
   */
  async getPopularSearches(limit = 10) {
    // This would typically come from a search_logs table
    // For now, return popular course categories
    const categories = await prisma.category.findMany({
      select: {
        name: true,
        slug: true,
        _count: {
          select: {
            courses: true,
          },
        },
      },
      orderBy: {
        courses: {
          _count: 'desc',
        },
      },
      take: limit,
    })

    return categories.map((cat) => cat.name)
  }

  /**
   * Get search filters/facets
   */
  async getSearchFacets(query: string, domain?: string) {
    const searchTerms = query.trim().split(' ').join(' & ')

    // Get available categories
    const categories = await prisma.$queryRaw<any[]>`
      SELECT
        cat.id,
        cat.name,
        cat.slug,
        COUNT(c.id) as count
      FROM categories cat
      LEFT JOIN courses c ON c.category_id = cat.id AND c.status = 'PUBLISHED'
      ${query && query.trim().length > 0 ? Prisma.sql`
        AND to_tsvector('english', COALESCE(c.title, '') || ' ' || COALESCE(c.description, '') || ' ' || COALESCE(c.short_description, ''))
        @@ to_tsquery('english', ${searchTerms})
      ` : Prisma.empty}
      ${domain ? Prisma.sql`WHERE cat.domain_id = ${domain}` : Prisma.empty}
      GROUP BY cat.id, cat.name, cat.slug
      HAVING COUNT(c.id) > 0
      ORDER BY count DESC
      LIMIT 20
    `

    // Get price ranges
    const priceRanges = [
      { label: 'Besplatno', min: 0, max: 0 },
      { label: 'Do €50', min: 0.01, max: 50 },
      { label: '€50 - €100', min: 50, max: 100 },
      { label: '€100 - €200', min: 100, max: 200 },
      { label: 'Više od €200', min: 200, max: 999999 },
    ]

    // Get levels
    const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']

    return {
      categories,
      priceRanges,
      levels,
    }
  }

  private getSortOrder(sortBy: string) {
    switch (sortBy) {
      case 'rating':
        return { averageRating: 'desc' as const }
      case 'popular':
        return { enrollmentCount: 'desc' as const }
      case 'newest':
        return { createdAt: 'desc' as const }
      case 'price_low':
        return { price: 'asc' as const }
      case 'price_high':
        return { price: 'desc' as const }
      default:
        return { createdAt: 'desc' as const }
    }
  }
}

export const searchService = new SearchService()
