import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { MobileFormatter } from '../utils/mobileFormatter'

const prisma = new PrismaClient()

class MobileController {
  /**
   * Get optimized course list for mobile
   */
  async getCoursesOptimized(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const offset = (page - 1) * limit

      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          where: { status: 'PUBLISHED' },
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        prisma.course.count({ where: { status: 'PUBLISHED' } }),
      ])

      const optimizedCourses = courses.map((course) =>
        MobileFormatter.optimizeCourseForList(course)
      )

      res.json(
        MobileFormatter.paginatedResponse(optimizedCourses, {
          page,
          limit,
          total,
        })
      )
    } catch (error) {
      console.error('Error getting optimized courses:', error)
      res.status(500).json(MobileFormatter.errorResponse('Internal server error', 500))
    }
  }

  /**
   * Get optimized course detail for mobile
   */
  async getCourseDetailOptimized(req: Request, res: Response) {
    try {
      const { slug } = req.params

      const course = await prisma.course.findUnique({
        where: { slug },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              bio: true,
              profilePicture: true,
            },
          },
          category: true,
          modules: {
            include: {
              lessons: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  type: true,
                  duration: true,
                  orderIndex: true,
                  isPreview: true,
                  videoDuration: true,
                },
                orderBy: { orderIndex: 'asc' },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
      })

      if (!course) {
        return res.status(404).json(MobileFormatter.errorResponse('Course not found', 404))
      }

      const optimized = MobileFormatter.optimizeCourseForDetail(course)

      res.json(MobileFormatter.singleResponse(optimized))
    } catch (error) {
      console.error('Error getting course detail:', error)
      res.status(500).json(MobileFormatter.errorResponse('Internal server error', 500))
    }
  }

  /**
   * Get user's enrolled courses (optimized for mobile)
   */
  async getMyCoursesOptimized(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json(MobileFormatter.errorResponse('Unauthorized', 401))
      }

      const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              creator: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { startedAt: 'desc' },
      })

      const optimizedCourses = enrollments.map((enrollment) => ({
        ...MobileFormatter.optimizeCourseForList(enrollment.course),
        progress: enrollment.progress,
        startedAt: enrollment.startedAt,
        lastAccessedAt: enrollment.lastAccessedAt,
        completedAt: enrollment.completedAt,
      }))

      res.json(MobileFormatter.singleResponse(optimizedCourses))
    } catch (error) {
      console.error('Error getting user courses:', error)
      res.status(500).json(MobileFormatter.errorResponse('Internal server error', 500))
    }
  }

  /**
   * Batch API for mobile to reduce round trips
   */
  async batchRequest(req: Request, res: Response) {
    try {
      const { requests } = req.body

      if (!Array.isArray(requests)) {
        return res
          .status(400)
          .json(MobileFormatter.errorResponse('Requests must be an array', 400))
      }

      // Limit batch size
      if (requests.length > 10) {
        return res
          .status(400)
          .json(MobileFormatter.errorResponse('Maximum 10 requests per batch', 400))
      }

      const results = await Promise.all(
        requests.map(async (request: { endpoint: string; method?: string; params?: any }) => {
          try {
            // Handle different endpoints
            let data
            switch (request.endpoint) {
              case 'courses':
                const courses = await prisma.course.findMany({
                  where: { status: 'PUBLISHED' },
                  take: 10,
                  include: {
                    creator: { select: { id: true, firstName: true, lastName: true } },
                    category: { select: { id: true, name: true, slug: true } },
                  },
                })
                data = courses.map((c) => MobileFormatter.optimizeCourseForList(c))
                break

              case 'categories':
                data = await prisma.category.findMany({
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    icon: true,
                  },
                })
                break

              case 'notifications':
                if (!req.user?.id) {
                  throw new Error('Unauthorized')
                }
                data = await prisma.notification.findMany({
                  where: { userId: req.user.id },
                  orderBy: { createdAt: 'desc' },
                  take: 20,
                })
                break

              default:
                throw new Error('Unknown endpoint')
            }

            return {
              endpoint: request.endpoint,
              data,
            }
          } catch (error: any) {
            return {
              endpoint: request.endpoint,
              data: null,
              error: error.message,
            }
          }
        })
      )

      res.json(MobileFormatter.batchResponse(results))
    } catch (error) {
      console.error('Error processing batch request:', error)
      res.status(500).json(MobileFormatter.errorResponse('Internal server error', 500))
    }
  }

  /**
   * Sync endpoint for offline-first mobile apps
   */
  async sync(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json(MobileFormatter.errorResponse('Unauthorized', 401))
      }

      const { lastSync, entities } = req.body

      const lastSyncDate = lastSync ? new Date(lastSync) : new Date(0)
      const updated: any = {}
      const deleted: string[] = []

      // Sync enrollments
      if (!entities || entities.includes('enrollments')) {
        updated.enrollments = await prisma.enrollment.findMany({
          where: {
            userId,
            updatedAt: { gt: lastSyncDate },
          },
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
        })
      }

      // Sync progress
      if (!entities || entities.includes('progress')) {
        updated.progress = await prisma.lessonProgress.findMany({
          where: {
            userId,
            updatedAt: { gt: lastSyncDate },
          },
        })
      }

      // Sync notifications
      if (!entities || entities.includes('notifications')) {
        updated.notifications = await prisma.notification.findMany({
          where: {
            userId,
            createdAt: { gt: lastSyncDate },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        })
      }

      res.json(
        MobileFormatter.syncResponse({
          updated,
          deleted,
          lastSyncTimestamp: Date.now(),
        })
      )
    } catch (error) {
      console.error('Error syncing data:', error)
      res.status(500).json(MobileFormatter.errorResponse('Internal server error', 500))
    }
  }

  /**
   * Get app configuration for mobile
   */
  async getAppConfig(req: Request, res: Response) {
    try {
      const config = {
        apiVersion: 'v1',
        minAppVersion: '1.0.0',
        features: {
          offlineMode: true,
          pushNotifications: true,
          darkMode: true,
          videoDownload: true,
        },
        endpoints: {
          baseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
          socketUrl: process.env.SOCKET_URL || 'ws://localhost:4000',
        },
        limits: {
          maxBatchSize: 10,
          maxUploadSize: 10 * 1024 * 1024, // 10MB
          requestTimeout: 30000, // 30s
        },
        caching: {
          courseListTTL: 3600, // 1 hour
          courseDetailTTL: 1800, // 30 min
          userDataTTL: 300, // 5 min
        },
      }

      res.json(MobileFormatter.singleResponse(config))
    } catch (error) {
      console.error('Error getting app config:', error)
      res.status(500).json(MobileFormatter.errorResponse('Internal server error', 500))
    }
  }
}

export default new MobileController()
