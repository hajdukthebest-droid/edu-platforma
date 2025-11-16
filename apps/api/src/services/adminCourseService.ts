import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import { CourseStatus } from '@prisma/client'
import { cacheService } from './cacheService'
import { emailService } from './emailService'
import { env } from '../config/env'

interface GetCoursesQuery {
  page?: number
  limit?: number
  search?: string
  status?: CourseStatus
  domainId?: string
  sortBy?: 'createdAt' | 'enrollmentCount' | 'averageRating'
  sortOrder?: 'asc' | 'desc'
}

export class AdminCourseService {
  /**
   * Get all courses with filtering
   */
  async getCourses(query: GetCoursesQuery = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      domainId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (domainId) {
      where.category = {
        domainId,
      }
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              domain: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                  color: true,
                },
              },
            },
          },
          _count: {
            select: {
              enrollments: true,
              reviews: true,
            },
          },
        },
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
   * Approve course
   */
  async approveCourse(courseId: string, adminId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        status: true,
        creatorId: true,
        creator: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!course) {
      throw new AppError(404, 'Course not found')
    }

    if (course.status === CourseStatus.PUBLISHED) {
      throw new AppError(400, 'Course is already published')
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: CourseStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    })

    // Create notification for instructor
    await prisma.notification.create({
      data: {
        userId: course.creatorId,
        type: 'COURSE_APPROVED',
        title: 'Tečaj odobren',
        message: `Vaš tečaj "${updatedCourse.title}" je odobren i objavljen!`,
        link: `/courses/${updatedCourse.slug}`,
      },
    })

    // Send email notification to instructor
    try {
      const instructorName = `${course.creator.firstName} ${course.creator.lastName}`
      const courseUrl = `${env.WEB_URL}/courses/${updatedCourse.slug}`

      await emailService.sendCourseApprovedEmail(
        course.creator.email,
        instructorName,
        updatedCourse.title,
        courseUrl
      )
    } catch (error) {
      console.error('Failed to send course approval email:', error)
      // Don't fail the approval process if email fails
    }

    // Invalidate cache
    await cacheService.invalidateCourse(courseId)
    await cacheService.invalidateRecommendations()

    return updatedCourse
  }

  /**
   * Reject course
   */
  async rejectCourse(courseId: string, adminId: string, reason: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        title: true,
        slug: true,
        creatorId: true,
        creator: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!course) {
      throw new AppError(404, 'Course not found')
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: CourseStatus.DRAFT,
      },
    })

    // Create notification for instructor
    await prisma.notification.create({
      data: {
        userId: course.creatorId,
        type: 'COURSE_REJECTED',
        title: 'Tečaj odbijen',
        message: `Vaš tečaj "${course.title}" je odbijen. Razlog: ${reason}`,
      },
    })

    // Send email notification to instructor
    try {
      const instructorName = `${course.creator.firstName} ${course.creator.lastName}`
      const dashboardUrl = `${env.WEB_URL}/instructor/courses/${course.slug}/edit`

      await emailService.sendCourseRejectedEmail(
        course.creator.email,
        instructorName,
        course.title,
        reason,
        dashboardUrl
      )
    } catch (error) {
      console.error('Failed to send course rejection email:', error)
      // Don't fail the rejection process if email fails
    }

    await cacheService.invalidateCourse(courseId)

    return updatedCourse
  }

  /**
   * Archive course
   */
  async archiveCourse(courseId: string) {
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: CourseStatus.ARCHIVED,
      },
    })

    await cacheService.invalidateCourse(courseId)
    await cacheService.invalidateRecommendations()

    return updatedCourse
  }

  /**
   * Feature course (mark as featured/recommended)
   */
  async toggleFeaturedCourse(courseId: string, isFeatured: boolean) {
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        isFeatured,
      },
    })

    await cacheService.invalidateCourse(courseId)
    await cacheService.invalidateRecommendations()

    return updatedCourse
  }

  /**
   * Delete course (permanent)
   */
  async deleteCourse(courseId: string) {
    // Check if course has enrollments
    const enrollmentCount = await prisma.enrollment.count({
      where: { courseId },
    })

    if (enrollmentCount > 0) {
      throw new AppError(
        400,
        'Cannot delete course with active enrollments. Archive it instead.'
      )
    }

    await prisma.course.delete({
      where: { id: courseId },
    })

    await cacheService.invalidateCourse(courseId)
    await cacheService.invalidateRecommendations()
  }

  /**
   * Get pending courses (waiting for approval)
   */
  async getPendingCourses() {
    const courses = await prisma.course.findMany({
      where: { status: CourseStatus.DRAFT },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: {
          select: {
            name: true,
            domain: {
              select: {
                name: true,
                icon: true,
              },
            },
          },
        },
      },
    })

    return courses
  }

  /**
   * Get course statistics
   */
  async getCourseStats(courseId: string) {
    const [course, enrollmentStats, reviewStats, progressStats] =
      await Promise.all([
        prisma.course.findUnique({
          where: { id: courseId },
          select: {
            enrollmentCount: true,
            averageRating: true,
          },
        }),

        prisma.enrollment.groupBy({
          by: ['status'],
          where: { courseId },
          _count: true,
        }),

        prisma.review.aggregate({
          where: { courseId },
          _count: true,
          _avg: { rating: true },
        }),

        prisma.courseProgress.aggregate({
          where: { courseId },
          _avg: { progressPercentage: true },
        }),
      ])

    return {
      enrollments: {
        total: course?.enrollmentCount || 0,
        byStatus: enrollmentStats,
      },
      reviews: {
        total: reviewStats._count,
        averageRating: reviewStats._avg.rating || 0,
      },
      progress: {
        averageCompletion: progressStats._avg.progressPercentage || 0,
      },
    }
  }

  /**
   * Bulk update courses
   */
  async bulkUpdateCourses(
    courseIds: string[],
    updates: {
      status?: CourseStatus
      isFeatured?: boolean
    }
  ) {
    const result = await prisma.course.updateMany({
      where: {
        id: { in: courseIds },
      },
      data: updates,
    })

    // Invalidate cache
    for (const courseId of courseIds) {
      await cacheService.invalidateCourse(courseId)
    }
    await cacheService.invalidateRecommendations()

    return result
  }
}

export const adminCourseService = new AdminCourseService()
