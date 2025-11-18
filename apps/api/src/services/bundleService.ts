import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import { Prisma } from '@prisma/client'

interface CreateBundleData {
  name: string
  slug: string
  description?: string
  thumbnail?: string
  courseIds: string[]
  discountedPrice: number
  isLimited?: boolean
  startDate?: Date
  endDate?: Date
  maxPurchases?: number
}

interface UpdateBundleData {
  name?: string
  description?: string
  thumbnail?: string
  courseIds?: string[]
  discountedPrice?: number
  isPublished?: boolean
  isLimited?: boolean
  startDate?: Date
  endDate?: Date
  maxPurchases?: number
}

export class BundleService {
  // Create a new bundle
  async createBundle(data: CreateBundleData) {
    // Get courses to calculate original price
    const courses = await prisma.course.findMany({
      where: { id: { in: data.courseIds } },
      select: { id: true, price: true, title: true },
    })

    if (courses.length !== data.courseIds.length) {
      throw new AppError(400, 'One or more courses not found')
    }

    // Calculate original price (sum of all course prices)
    const originalPrice = courses.reduce(
      (sum, course) => sum + Number(course.price),
      0
    )

    if (data.discountedPrice >= originalPrice) {
      throw new AppError(400, 'Bundle price must be less than total course prices')
    }

    // Calculate savings percentage
    const savingsPercent = ((originalPrice - data.discountedPrice) / originalPrice) * 100

    const bundle = await prisma.courseBundle.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        thumbnail: data.thumbnail,
        originalPrice,
        discountedPrice: data.discountedPrice,
        savingsPercent,
        isLimited: data.isLimited || false,
        startDate: data.startDate,
        endDate: data.endDate,
        maxPurchases: data.maxPurchases,
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
                price: true,
                level: true,
                duration: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    return bundle
  }

  // Get all bundles
  async getBundles(filters?: {
    published?: boolean
    page?: number
    limit?: number
  }) {
    const { published = true, page = 1, limit = 20 } = filters || {}

    const where: Prisma.CourseBundleWhereInput = {}

    if (published) {
      where.isPublished = true
      // Also check if bundle is currently active (for limited offers)
      where.OR = [
        { isLimited: false },
        {
          isLimited: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      ]
    }

    const [bundles, total] = await Promise.all([
      prisma.courseBundle.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
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
          _count: {
            select: { payments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.courseBundle.count({ where }),
    ])

    return {
      bundles,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  // Get bundle by ID
  async getBundleById(id: string) {
    const bundle = await prisma.courseBundle.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                shortDescription: true,
                thumbnail: true,
                price: true,
                level: true,
                duration: true,
                averageRating: true,
                enrollmentCount: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: { payments: true },
        },
      },
    })

    if (!bundle) {
      throw new AppError(404, 'Bundle not found')
    }

    return bundle
  }

  // Get bundle by slug
  async getBundleBySlug(slug: string) {
    const bundle = await prisma.courseBundle.findUnique({
      where: { slug },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                shortDescription: true,
                thumbnail: true,
                price: true,
                level: true,
                duration: true,
                averageRating: true,
                enrollmentCount: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: { payments: true },
        },
      },
    })

    if (!bundle) {
      throw new AppError(404, 'Bundle not found')
    }

    return bundle
  }

  // Update bundle
  async updateBundle(id: string, data: UpdateBundleData) {
    const bundle = await prisma.courseBundle.findUnique({
      where: { id },
    })

    if (!bundle) {
      throw new AppError(404, 'Bundle not found')
    }

    // If courses are being updated, recalculate prices
    let updateData: any = { ...data }

    if (data.courseIds) {
      const courses = await prisma.course.findMany({
        where: { id: { in: data.courseIds } },
        select: { id: true, price: true },
      })

      const originalPrice = courses.reduce(
        (sum, course) => sum + Number(course.price),
        0
      )

      const discountedPrice = data.discountedPrice || Number(bundle.discountedPrice)
      const savingsPercent = ((originalPrice - discountedPrice) / originalPrice) * 100

      // Delete existing courses and create new ones
      await prisma.bundleCourse.deleteMany({
        where: { bundleId: id },
      })

      await prisma.bundleCourse.createMany({
        data: data.courseIds.map((courseId, index) => ({
          bundleId: id,
          courseId,
          orderIndex: index,
        })),
      })

      updateData = {
        ...updateData,
        originalPrice,
        savingsPercent,
      }
      delete updateData.courseIds
    } else if (data.discountedPrice) {
      // Just update savings percent
      const savingsPercent = ((Number(bundle.originalPrice) - data.discountedPrice) / Number(bundle.originalPrice)) * 100
      updateData.savingsPercent = savingsPercent
    }

    const updated = await prisma.courseBundle.update({
      where: { id },
      data: updateData,
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnail: true,
                price: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    return updated
  }

  // Delete bundle
  async deleteBundle(id: string) {
    const bundle = await prisma.courseBundle.findUnique({
      where: { id },
      include: { _count: { select: { payments: true } } },
    })

    if (!bundle) {
      throw new AppError(404, 'Bundle not found')
    }

    if (bundle._count.payments > 0) {
      throw new AppError(400, 'Cannot delete bundle with existing purchases')
    }

    await prisma.courseBundle.delete({ where: { id } })

    return { message: 'Bundle deleted successfully' }
  }

  // Check if user owns all courses in bundle
  async checkUserOwnsBundle(userId: string, bundleId: string): Promise<boolean> {
    const bundle = await prisma.courseBundle.findUnique({
      where: { id: bundleId },
      include: { courses: true },
    })

    if (!bundle) return false

    const courseIds = bundle.courses.map((bc) => bc.courseId)

    const enrollments = await prisma.enrollment.count({
      where: {
        userId,
        courseId: { in: courseIds },
      },
    })

    return enrollments === courseIds.length
  }

  // Purchase bundle - enroll user in all courses
  async purchaseBundle(userId: string, bundleId: string, paymentId: string) {
    const bundle = await prisma.courseBundle.findUnique({
      where: { id: bundleId },
      include: { courses: true },
    })

    if (!bundle) {
      throw new AppError(404, 'Bundle not found')
    }

    // Check availability for limited bundles
    if (bundle.isLimited) {
      if (bundle.endDate && new Date() > bundle.endDate) {
        throw new AppError(400, 'This bundle offer has expired')
      }
      if (bundle.maxPurchases && bundle.purchaseCount >= bundle.maxPurchases) {
        throw new AppError(400, 'This bundle is sold out')
      }
    }

    // Enroll user in all courses
    const courseIds = bundle.courses.map((bc) => bc.courseId)

    for (const courseId of courseIds) {
      // Check if already enrolled
      const existing = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId },
        },
      })

      if (!existing) {
        await prisma.enrollment.create({
          data: { userId, courseId },
        })

        // Update course enrollment count
        await prisma.course.update({
          where: { id: courseId },
          data: { enrollmentCount: { increment: 1 } },
        })
      }
    }

    // Increment bundle purchase count
    await prisma.courseBundle.update({
      where: { id: bundleId },
      data: { purchaseCount: { increment: 1 } },
    })

    return { message: 'Bundle purchased successfully', courseCount: courseIds.length }
  }
}

export const bundleService = new BundleService()
