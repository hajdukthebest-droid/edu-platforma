import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'

interface CreateReviewData {
  rating: number
  comment?: string
}

export class ReviewService {
  async createReview(userId: string, courseId: string, data: CreateReviewData) {
    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new AppError(400, 'Rating must be between 1 and 5')
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    if (!enrollment) {
      throw new AppError(403, 'You must be enrolled in the course to leave a review')
    }

    // Check if user already reviewed this course
    const existingReview = await prisma.review.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
    })

    if (existingReview) {
      throw new AppError(409, 'You have already reviewed this course')
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        courseId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    // Update course average rating
    await this.updateCourseAverageRating(courseId)

    return review
  }

  async updateReview(reviewId: string, userId: string, data: CreateReviewData) {
    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new AppError(400, 'Rating must be between 1 and 5')
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      throw new AppError(404, 'Review not found')
    }

    if (review.userId !== userId) {
      throw new AppError(403, 'Not authorized to update this review')
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    // Update course average rating
    await this.updateCourseAverageRating(review.courseId)

    return updatedReview
  }

  async deleteReview(reviewId: string, userId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      throw new AppError(404, 'Review not found')
    }

    if (review.userId !== userId) {
      throw new AppError(403, 'Not authorized to delete this review')
    }

    await prisma.review.delete({
      where: { id: reviewId },
    })

    // Update course average rating
    await this.updateCourseAverageRating(review.courseId)
  }

  async getCourseReviews(courseId: string, page = 1, limit = 20) {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { courseId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { courseId } }),
    ])

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getUserReview(userId: string, courseId: string) {
    const review = await prisma.review.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    return review
  }

  async getCourseRatingStats(courseId: string) {
    const reviews = await prisma.review.findMany({
      where: { courseId },
      select: { rating: true },
    })

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      }
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length

    const ratingDistribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    }

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
    }
  }

  private async updateCourseAverageRating(courseId: string) {
    const stats = await this.getCourseRatingStats(courseId)

    await prisma.course.update({
      where: { id: courseId },
      data: {
        averageRating: stats.averageRating,
      },
    })
  }
}

export const reviewService = new ReviewService()
