import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CreateVideoQuizData {
  lessonId: string
  timestamp: number
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  points?: number
  isRequired?: boolean
  pauseVideo?: boolean
}

interface SubmitAnswerData {
  userId: string
  videoQuizId: string
  answer: number
  timeSpent?: number
}

class VideoQuizService {
  /**
   * Create a new video quiz for a lesson
   */
  async createVideoQuiz(data: CreateVideoQuizData) {
    // Validate that lesson exists and is a video type
    const lesson = await prisma.lesson.findUnique({
      where: { id: data.lessonId },
    })

    if (!lesson) {
      throw new Error('Lesson not found')
    }

    if (lesson.type !== 'VIDEO') {
      throw new Error('Video quizzes can only be added to video lessons')
    }

    // Validate options and correctAnswer
    if (data.options.length < 2) {
      throw new Error('At least 2 options are required')
    }

    if (data.correctAnswer < 0 || data.correctAnswer >= data.options.length) {
      throw new Error('Invalid correct answer index')
    }

    // Create video quiz
    const videoQuiz = await prisma.videoQuiz.create({
      data: {
        lessonId: data.lessonId,
        timestamp: data.timestamp,
        question: data.question,
        options: data.options,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        points: data.points || 10,
        isRequired: data.isRequired ?? false,
        pauseVideo: data.pauseVideo ?? true,
      },
    })

    return videoQuiz
  }

  /**
   * Get all video quizzes for a lesson
   */
  async getVideoQuizzesByLesson(lessonId: string) {
    const quizzes = await prisma.videoQuiz.findMany({
      where: { lessonId },
      orderBy: { timestamp: 'asc' },
    })

    return quizzes
  }

  /**
   * Get video quizzes for a lesson with user's responses
   */
  async getVideoQuizzesWithResponses(lessonId: string, userId: string) {
    const quizzes = await prisma.videoQuiz.findMany({
      where: { lessonId },
      include: {
        responses: {
          where: { userId },
        },
      },
      orderBy: { timestamp: 'asc' },
    })

    // Transform to include user response status
    return quizzes.map((quiz) => ({
      id: quiz.id,
      timestamp: quiz.timestamp,
      question: quiz.question,
      options: quiz.options,
      points: quiz.points,
      isRequired: quiz.isRequired,
      pauseVideo: quiz.pauseVideo,
      // Don't send correctAnswer to client before answering
      isAnswered: quiz.responses.length > 0,
      userAnswer: quiz.responses[0]?.answer,
      isCorrect: quiz.responses[0]?.isCorrect,
      explanation: quiz.responses[0] ? quiz.explanation : undefined,
      correctAnswer: quiz.responses[0] ? quiz.correctAnswer : undefined,
    }))
  }

  /**
   * Get a single video quiz by ID
   */
  async getVideoQuizById(quizId: string) {
    const quiz = await prisma.videoQuiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    })

    if (!quiz) {
      throw new Error('Video quiz not found')
    }

    return quiz
  }

  /**
   * Update a video quiz
   */
  async updateVideoQuiz(quizId: string, data: Partial<CreateVideoQuizData>) {
    // Validate options and correctAnswer if provided
    if (data.options && data.options.length < 2) {
      throw new Error('At least 2 options are required')
    }

    if (
      data.correctAnswer !== undefined &&
      data.options &&
      (data.correctAnswer < 0 || data.correctAnswer >= data.options.length)
    ) {
      throw new Error('Invalid correct answer index')
    }

    const videoQuiz = await prisma.videoQuiz.update({
      where: { id: quizId },
      data: {
        timestamp: data.timestamp,
        question: data.question,
        options: data.options,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        points: data.points,
        isRequired: data.isRequired,
        pauseVideo: data.pauseVideo,
      },
    })

    return videoQuiz
  }

  /**
   * Delete a video quiz
   */
  async deleteVideoQuiz(quizId: string) {
    await prisma.videoQuiz.delete({
      where: { id: quizId },
    })

    return { success: true }
  }

  /**
   * Submit an answer to a video quiz
   */
  async submitAnswer(data: SubmitAnswerData) {
    // Get the quiz to check correct answer
    const quiz = await prisma.videoQuiz.findUnique({
      where: { id: data.videoQuizId },
    })

    if (!quiz) {
      throw new Error('Video quiz not found')
    }

    // Validate answer
    if (data.answer < 0 || data.answer >= quiz.options.length) {
      throw new Error('Invalid answer index')
    }

    // Check if correct
    const isCorrect = data.answer === quiz.correctAnswer

    // Create or update response
    const response = await prisma.videoQuizResponse.upsert({
      where: {
        userId_videoQuizId: {
          userId: data.userId,
          videoQuizId: data.videoQuizId,
        },
      },
      create: {
        userId: data.userId,
        videoQuizId: data.videoQuizId,
        answer: data.answer,
        isCorrect,
        timeSpent: data.timeSpent,
      },
      update: {
        answer: data.answer,
        isCorrect,
        timeSpent: data.timeSpent,
        answeredAt: new Date(),
      },
    })

    // Award points if correct (if using gamification)
    if (isCorrect) {
      // Optional: Award points to user
      // This could be integrated with your existing points system
      await this.awardPoints(data.userId, quiz.points)
    }

    return {
      ...response,
      correctAnswer: quiz.correctAnswer,
      explanation: quiz.explanation,
      pointsAwarded: isCorrect ? quiz.points : 0,
    }
  }

  /**
   * Get user's response to a specific quiz
   */
  async getUserResponse(userId: string, videoQuizId: string) {
    const response = await prisma.videoQuizResponse.findUnique({
      where: {
        userId_videoQuizId: {
          userId,
          videoQuizId,
        },
      },
      include: {
        videoQuiz: true,
      },
    })

    return response
  }

  /**
   * Get all responses for a user in a lesson
   */
  async getUserResponsesByLesson(userId: string, lessonId: string) {
    const responses = await prisma.videoQuizResponse.findMany({
      where: {
        userId,
        videoQuiz: {
          lessonId,
        },
      },
      include: {
        videoQuiz: true,
      },
    })

    return responses
  }

  /**
   * Get quiz statistics for instructors
   */
  async getQuizStatistics(quizId: string) {
    const quiz = await prisma.videoQuiz.findUnique({
      where: { id: quizId },
      include: {
        responses: true,
      },
    })

    if (!quiz) {
      throw new Error('Video quiz not found')
    }

    const totalResponses = quiz.responses.length
    const correctResponses = quiz.responses.filter((r) => r.isCorrect).length
    const incorrectResponses = totalResponses - correctResponses

    // Calculate average time spent
    const avgTimeSpent =
      quiz.responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0) /
        totalResponses || 0

    // Answer distribution
    const answerDistribution = quiz.options.map((_, index) => {
      const count = quiz.responses.filter((r) => r.answer === index).length
      return {
        option: index,
        count,
        percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0,
      }
    })

    return {
      quizId: quiz.id,
      question: quiz.question,
      totalResponses,
      correctResponses,
      incorrectResponses,
      successRate:
        totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0,
      avgTimeSpent: Math.round(avgTimeSpent),
      answerDistribution,
    }
  }

  /**
   * Get lesson-wide quiz statistics
   */
  async getLessonQuizStatistics(lessonId: string) {
    const quizzes = await prisma.videoQuiz.findMany({
      where: { lessonId },
      include: {
        responses: true,
      },
    })

    const totalQuizzes = quizzes.length
    const totalResponses = quizzes.reduce(
      (sum, q) => sum + q.responses.length,
      0
    )
    const totalCorrect = quizzes.reduce(
      (sum, q) => sum + q.responses.filter((r) => r.isCorrect).length,
      0
    )

    const quizStatistics = await Promise.all(
      quizzes.map((q) => this.getQuizStatistics(q.id))
    )

    return {
      lessonId,
      totalQuizzes,
      totalResponses,
      totalCorrect,
      overallSuccessRate:
        totalResponses > 0 ? (totalCorrect / totalResponses) * 100 : 0,
      quizzes: quizStatistics,
    }
  }

  /**
   * Award points to user (placeholder - integrate with your points system)
   */
  private async awardPoints(userId: string, points: number) {
    // This should integrate with your existing gamification/points system
    // For now, we'll just update the user's points if that field exists
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (user) {
        // Assuming you have a points field on User model
        // If not, you might want to add it or integrate with your existing system
        await prisma.user.update({
          where: { id: userId },
          data: {
            points: {
              increment: points,
            },
          },
        })
      }
    } catch (error) {
      // Points field might not exist, that's okay
      console.log('Could not award points:', error)
    }
  }

  /**
   * Check if user has completed all required quizzes in a lesson
   */
  async hasCompletedRequiredQuizzes(userId: string, lessonId: string) {
    const requiredQuizzes = await prisma.videoQuiz.findMany({
      where: {
        lessonId,
        isRequired: true,
      },
    })

    const userResponses = await prisma.videoQuizResponse.findMany({
      where: {
        userId,
        videoQuiz: {
          lessonId,
          isRequired: true,
        },
      },
    })

    return requiredQuizzes.length === userResponses.length
  }
}

export default new VideoQuizService()
