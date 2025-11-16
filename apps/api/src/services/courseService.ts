import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import { CourseLevel, CourseStatus, Prisma } from '@prisma/client'

interface CreateCourseData {
  title: string
  slug: string
  description?: string
  shortDescription?: string
  level?: CourseLevel
  price?: number
  categoryId?: string
  creatorId: string
}

interface GetCoursesQuery {
  page?: number
  limit?: number
  search?: string
  category?: string
  level?: CourseLevel
  status?: CourseStatus
  minPrice?: number
  maxPrice?: number
  minRating?: number
  language?: string
  minDuration?: number
  maxDuration?: number
  sortBy?: 'createdAt' | 'price' | 'enrollmentCount' | 'rating'
  sortOrder?: 'asc' | 'desc'
  isFree?: boolean
}

export class CourseService {
  async getFilterOptions() {
    const [categories, levels, languages, priceStats] = await Promise.all([
      prisma.courseCategory.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              courses: true,
            },
          },
        },
      }),
      prisma.course.groupBy({
        by: ['level'],
        _count: true,
      }),
      prisma.course.findMany({
        where: {
          language: { not: null },
        },
        select: {
          language: true,
        },
        distinct: ['language'],
      }),
      prisma.course.aggregate({
        _min: { price: true },
        _max: { price: true },
      }),
    ])

    const uniqueLanguages = Array.from(
      new Set(languages.map((l) => l.language).filter(Boolean))
    )

    return {
      categories,
      levels: levels.map((l) => ({
        value: l.level,
        count: l._count,
      })),
      languages: uniqueLanguages,
      priceRange: {
        min: priceStats._min.price ? Number(priceStats._min.price) : 0,
        max: priceStats._max.price ? Number(priceStats._max.price) : 0,
      },
    }
  }

  async createCourse(data: CreateCourseData) {
    const course = await prisma.course.create({
      data: {
        ...data,
        price: data.price ? new Prisma.Decimal(data.price) : new Prisma.Decimal(0),
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: true,
      },
    })

    return course
  }

  async getCourses(query: GetCoursesQuery = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      level,
      status,
      minPrice,
      maxPrice,
      minRating,
      language,
      minDuration,
      maxDuration,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isFree,
    } = query

    const where: Prisma.CourseWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category && { categoryId: category }),
      ...(level && { level }),
      ...(status && { status }),
      ...(language && { language }),
      ...(isFree !== undefined && {
        price: isFree ? 0 : { gt: 0 },
      }),
      ...(minPrice !== undefined && {
        price: { gte: minPrice },
      }),
      ...(maxPrice !== undefined && {
        price: { lte: maxPrice },
      }),
      ...(minDuration !== undefined && {
        durationHours: { gte: minDuration },
      }),
      ...(maxDuration !== undefined && {
        durationHours: { lte: maxDuration },
      }),
    }

    // Build orderBy clause
    let orderBy: any = { [sortBy]: sortOrder }
    if (sortBy === 'rating') {
      orderBy = { averageRating: sortOrder }
    }

    const [allCourses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          category: true,
          reviews: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              reviews: true,
            },
          },
        },
        orderBy,
      }),
      prisma.course.count({ where }),
    ])

    // Filter by rating if needed and calculate average rating
    let courses = allCourses.map((course) => {
      const totalRating = course.reviews.reduce((sum, review) => sum + review.rating, 0)
      const avgRating = course.reviews.length > 0 ? totalRating / course.reviews.length : 0

      return {
        ...course,
        averageRating: avgRating,
        reviews: undefined, // Remove reviews array from response
      }
    })

    if (minRating !== undefined) {
      courses = courses.filter((course) => course.averageRating >= minRating)
    }

    // Apply pagination after filtering
    const paginatedCourses = courses.slice((page - 1) * limit, page * limit)
    const filteredTotal = courses.length

    return {
      courses: paginatedCourses,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages: Math.ceil(filteredTotal / limit),
      },
    }
  }

  async getCourseById(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
          },
        },
        category: true,
        modules: {
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    })

    if (!course) {
      throw new AppError(404, 'Course not found')
    }

    return course
  }

  async getCourseBySlug(slug: string) {
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: true,
        modules: {
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!course) {
      throw new AppError(404, 'Course not found')
    }

    return course
  }

  async enrollInCourse(userId: string, courseId: string) {
    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    if (existingEnrollment) {
      throw new AppError(409, 'Already enrolled in this course')
    }

    // Get total lessons count
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    })

    if (!course) {
      throw new AppError(404, 'Course not found')
    }

    const totalLessons = course.modules.reduce(
      (acc, module) => acc + module.lessons.length,
      0
    )

    // Create enrollment and progress in transaction
    const [enrollment, progress] = await prisma.$transaction([
      prisma.enrollment.create({
        data: {
          userId,
          courseId,
        },
      }),
      prisma.courseProgress.create({
        data: {
          userId,
          courseId,
          totalLessons,
        },
      }),
    ])

    // Update enrollment count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        enrollmentCount: {
          increment: 1,
        },
      },
    })

    return { enrollment, progress }
  }

  async getCourseProgress(userId: string, courseId: string) {
    const progress = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    if (!progress) {
      throw new AppError(404, 'Progress not found. Please enroll in the course first.')
    }

    return progress
  }
}

export const courseService = new CourseService()
