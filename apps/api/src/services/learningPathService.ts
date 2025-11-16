import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import { CourseLevel } from '@prisma/client'

interface CreateLearningPathData {
  title: string
  slug: string
  description?: string
  thumbnail?: string
  level?: CourseLevel
  estimatedHours?: number
  courseIds: string[]
}

interface UpdateLearningPathData {
  title?: string
  description?: string
  thumbnail?: string
  level?: CourseLevel
  estimatedHours?: number
  courseIds?: string[]
  isPublished?: boolean
}

export class LearningPathService {
  async createLearningPath(creatorId: string, data: CreateLearningPathData) {
    // Create learning path with courses
    const learningPath = await prisma.learningPath.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        thumbnail: data.thumbnail,
        level: data.level,
        estimatedHours: data.estimatedHours,
        creatorId,
        courses: {
          create: data.courseIds.map((courseId, index) => ({
            courseId,
            orderIndex: index,
          })),
        },
      },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnail: true,
                level: true,
                duration: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    return learningPath
  }

  async getLearningPaths(filters?: {
    level?: CourseLevel
    published?: boolean
    page?: number
    limit?: number
  }) {
    const { level, published = true, page = 1, limit = 20 } = filters || {}

    const where: any = {}
    if (level) where.level = level
    if (published !== undefined) where.isPublished = published

    const [learningPaths, total] = await Promise.all([
      prisma.learningPath.findMany({
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
          courses: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  thumbnail: true,
                  level: true,
                  duration: true,
                },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
          _count: {
            select: {
              userPaths: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.learningPath.count({ where }),
    ])

    return {
      learningPaths,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getLearningPathById(id: string) {
    const learningPath = await prisma.learningPath.findUnique({
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
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                shortDescription: true,
                thumbnail: true,
                level: true,
                duration: true,
                enrollmentCount: true,
                averageRating: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: {
            userPaths: true,
          },
        },
      },
    })

    if (!learningPath) {
      throw new AppError(404, 'Learning path not found')
    }

    return learningPath
  }

  async getLearningPathBySlug(slug: string) {
    const learningPath = await prisma.learningPath.findUnique({
      where: { slug },
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
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                shortDescription: true,
                thumbnail: true,
                level: true,
                duration: true,
                enrollmentCount: true,
                averageRating: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: {
            userPaths: true,
          },
        },
      },
    })

    if (!learningPath) {
      throw new AppError(404, 'Learning path not found')
    }

    return learningPath
  }

  async updateLearningPath(id: string, creatorId: string, data: UpdateLearningPathData) {
    const learningPath = await prisma.learningPath.findUnique({
      where: { id },
    })

    if (!learningPath) {
      throw new AppError(404, 'Learning path not found')
    }

    if (learningPath.creatorId !== creatorId) {
      throw new AppError(403, 'Not authorized to update this learning path')
    }

    // If courseIds are provided, update the courses
    if (data.courseIds) {
      // Delete existing course associations
      await prisma.learningPathCourse.deleteMany({
        where: { learningPathId: id },
      })

      // Create new associations
      await prisma.learningPathCourse.createMany({
        data: data.courseIds.map((courseId, index) => ({
          learningPathId: id,
          courseId,
          orderIndex: index,
        })),
      })
    }

    const updated = await prisma.learningPath.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        level: data.level,
        estimatedHours: data.estimatedHours,
        isPublished: data.isPublished,
      },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnail: true,
                level: true,
                duration: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    return updated
  }

  async enrollInLearningPath(userId: string, learningPathId: string) {
    // Check if already enrolled
    const existing = await prisma.userLearningPath.findUnique({
      where: {
        userId_learningPathId: {
          userId,
          learningPathId,
        },
      },
    })

    if (existing) {
      throw new AppError(409, 'Already enrolled in this learning path')
    }

    const enrollment = await prisma.userLearningPath.create({
      data: {
        userId,
        learningPathId,
      },
      include: {
        learningPath: {
          include: {
            courses: {
              include: {
                course: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    })

    return enrollment
  }

  async getUserProgress(userId: string, learningPathId: string) {
    const progress = await prisma.userLearningPath.findUnique({
      where: {
        userId_learningPathId: {
          userId,
          learningPathId,
        },
      },
      include: {
        learningPath: {
          include: {
            courses: {
              include: {
                course: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    thumbnail: true,
                  },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    })

    if (!progress) {
      throw new AppError(404, 'Not enrolled in this learning path')
    }

    return progress
  }

  async updateProgress(userId: string, learningPathId: string) {
    // Get user's progress
    const userPath = await prisma.userLearningPath.findUnique({
      where: {
        userId_learningPathId: {
          userId,
          learningPathId,
        },
      },
      include: {
        learningPath: {
          include: {
            courses: true,
          },
        },
      },
    })

    if (!userPath) {
      return
    }

    const totalCourses = userPath.learningPath.courses.length

    // Count completed courses
    const courseIds = userPath.learningPath.courses.map((lpc) => lpc.courseId)
    const completedCourses = await prisma.courseProgress.count({
      where: {
        userId,
        courseId: { in: courseIds },
        isCompleted: true,
      },
    })

    const progressPercentage = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0
    const isCompleted = completedCourses === totalCourses && totalCourses > 0

    await prisma.userLearningPath.update({
      where: {
        userId_learningPathId: {
          userId,
          learningPathId,
        },
      },
      data: {
        completedCourses,
        progressPercentage,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    })
  }

  async getUserLearningPaths(userId: string) {
    const userPaths = await prisma.userLearningPath.findMany({
      where: { userId },
      include: {
        learningPath: {
          include: {
            courses: {
              include: {
                course: {
                  select: {
                    id: true,
                    title: true,
                    thumbnail: true,
                  },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
            creator: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    })

    return userPaths
  }
}

export const learningPathService = new LearningPathService()
