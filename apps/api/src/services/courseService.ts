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
}

export class CourseService {
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
    const { page = 1, limit = 20, search, category, level, status } = query

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
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
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
          _count: {
            select: {
              enrollments: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
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
