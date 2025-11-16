import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import { certificateService } from './certificateService'
import { achievementService } from './achievementService'

export class ProgressService {
  async markLessonComplete(userId: string, lessonId: string) {
    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    })

    if (!lesson) {
      throw new AppError(404, 'Lesson not found')
    }

    const courseId = lesson.module.courseId

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    if (!enrollment) {
      throw new AppError(403, 'Not enrolled in this course')
    }

    // Create or update lesson progress
    const lessonProgress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      create: {
        userId,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
    })

    // Update course progress
    await this.updateCourseProgress(userId, courseId)

    // Award points
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: {
          increment: lesson.pointsReward,
        },
      },
    })

    // Check achievements (don't await - run in background)
    achievementService.checkAndAwardAchievements(userId).catch(err =>
      console.error('Achievement check failed:', err)
    )

    return lessonProgress
  }

  async updateLessonProgress(
    userId: string,
    lessonId: string,
    data: {
      timeSpent?: number
      lastPosition?: number
    }
  ) {
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      create: {
        userId,
        lessonId,
        ...data,
      },
      update: data,
    })

    return progress
  }

  async getLessonProgress(userId: string, lessonId: string) {
    const progress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    })

    return progress
  }

  private async updateCourseProgress(userId: string, courseId: string) {
    // Get all lessons for the course
    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        lessons: true,
      },
    })

    const totalLessons = modules.reduce((acc, mod) => acc + mod.lessons.length, 0)

    // Get completed lessons count
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId,
        lesson: {
          module: {
            courseId,
          },
        },
        isCompleted: true,
      },
    })

    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

    // Update course progress
    await prisma.courseProgress.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      create: {
        userId,
        courseId,
        totalLessons,
        completedLessons,
        progressPercentage,
      },
      update: {
        completedLessons,
        progressPercentage,
        lastAccessedAt: new Date(),
      },
    })

    // Check if course is completed
    if (progressPercentage >= 100) {
      await this.handleCourseCompletion(userId, courseId)
    }

    return { completedLessons, totalLessons, progressPercentage }
  }

  private async handleCourseCompletion(userId: string, courseId: string) {
    // Mark enrollment as completed
    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })

    // Update course completion count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        completionCount: {
          increment: 1,
        },
      },
    })

    // Award course completion points
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (course) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints: {
            increment: course.pointsReward,
          },
        },
      })
    }

    // Automatically issue certificate
    try {
      await certificateService.issueCertificate(userId, courseId)
    } catch (error) {
      // Log error but don't fail the completion process
      console.error('Failed to issue certificate:', error)
    }

    // Check achievements and badges (don't await - run in background)
    achievementService.checkAndAwardAchievements(userId).catch(err =>
      console.error('Achievement check failed:', err)
    )
    achievementService.checkAndAwardBadges(userId).catch(err =>
      console.error('Badge check failed:', err)
    )
  }

  async getCourseProgressWithLessons(userId: string, courseId: string) {
    const progress = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lesson: {
          module: {
            courseId,
          },
        },
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            moduleId: true,
          },
        },
      },
    })

    return {
      courseProgress: progress,
      lessonProgress,
    }
  }
}

export const progressService = new ProgressService()
