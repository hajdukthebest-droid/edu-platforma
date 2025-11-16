import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'

export class InstructorService {
  async getInstructorDashboard(userId: string) {
    // Get instructor's courses
    const courses = await prisma.course.findMany({
      where: { creatorId: userId },
      include: {
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate total stats
    const totalStudents = courses.reduce((acc, course) => acc + course._count.enrollments, 0)
    const totalReviews = courses.reduce((acc, course) => acc + course._count.reviews, 0)
    const averageRating =
      courses.reduce((acc, course) => acc + (course.averageRating || 0), 0) / courses.length || 0

    // Get recent enrollments
    const recentEnrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          creatorId: userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 10,
    })

    // Get course completion stats
    const completionStats = await Promise.all(
      courses.map(async course => {
        const enrollments = await prisma.enrollment.count({
          where: { courseId: course.id },
        })

        const completions = await prisma.enrollment.count({
          where: {
            courseId: course.id,
            status: 'COMPLETED',
          },
        })

        return {
          courseId: course.id,
          courseTitle: course.title,
          enrollments,
          completions,
          completionRate: enrollments > 0 ? (completions / enrollments) * 100 : 0,
        }
      })
    )

    return {
      overview: {
        totalCourses: courses.length,
        totalStudents,
        totalReviews,
        averageRating: parseFloat(averageRating.toFixed(1)),
      },
      courses,
      recentEnrollments,
      completionStats,
    }
  }

  async getCourseAnalytics(courseId: string, userId: string) {
    // Verify instructor owns this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        creatorId: userId,
      },
    })

    if (!course) {
      throw new AppError(404, 'Course not found or unauthorized')
    }

    // Get detailed enrollment data
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    // Get progress data
    const progressData = await prisma.courseProgress.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Get completion statistics
    const totalEnrolled = enrollments.length
    const completed = enrollments.filter(e => e.status === 'COMPLETED').length
    const active = enrollments.filter(e => e.status === 'ACTIVE').length
    const dropped = enrollments.filter(e => e.status === 'DROPPED').length

    // Average progress
    const averageProgress =
      progressData.reduce((acc, p) => acc + p.progressPercentage, 0) / progressData.length || 0

    // Reviews
    const reviews = await prisma.review.findMany({
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
    })

    // Enrollment over time (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const enrollmentTrend = await prisma.enrollment.groupBy({
      by: ['startedAt'],
      where: {
        courseId,
        startedAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
    })

    return {
      course,
      statistics: {
        totalEnrolled,
        completed,
        active,
        dropped,
        completionRate: totalEnrolled > 0 ? (completed / totalEnrolled) * 100 : 0,
        averageProgress: parseFloat(averageProgress.toFixed(1)),
        averageRating: course.averageRating,
        totalReviews: reviews.length,
      },
      enrollments: enrollments.map(e => ({
        ...e,
        progress: progressData.find(p => p.userId === e.userId),
      })),
      reviews,
      enrollmentTrend,
    }
  }

  async getStudentProgress(courseId: string, userId: string, studentId: string) {
    // Verify instructor owns this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        creatorId: userId,
      },
    })

    if (!course) {
      throw new AppError(404, 'Course not found or unauthorized')
    }

    // Get student progress
    const progress = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    if (!progress) {
      throw new AppError(404, 'Student progress not found')
    }

    // Get lesson progress
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        userId: studentId,
        lesson: {
          module: {
            courseId,
          },
        },
      },
      include: {
        lesson: {
          include: {
            module: true,
          },
        },
      },
    })

    // Get assessment attempts
    const assessmentAttempts = await prisma.assessmentAttempt.findMany({
      where: {
        userId: studentId,
        assessment: {
          courseId,
        },
      },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            passingScore: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    })

    return {
      progress,
      lessonProgress,
      assessmentAttempts,
    }
  }
}

export const instructorService = new InstructorService()
