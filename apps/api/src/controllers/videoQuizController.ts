import { Request, Response } from 'express'
import videoQuizService from '../services/videoQuizService'

class VideoQuizController {
  /**
   * Create a new video quiz
   * POST /api/video-quizzes
   */
  async createVideoQuiz(req: Request, res: Response) {
    try {
      const {
        lessonId,
        timestamp,
        question,
        options,
        correctAnswer,
        explanation,
        points,
        isRequired,
        pauseVideo,
      } = req.body

      // Validation
      if (!lessonId || timestamp === undefined || !question || !options || correctAnswer === undefined) {
        return res.status(400).json({
          message: 'Missing required fields: lessonId, timestamp, question, options, correctAnswer',
        })
      }

      const videoQuiz = await videoQuizService.createVideoQuiz({
        lessonId,
        timestamp,
        question,
        options,
        correctAnswer,
        explanation,
        points,
        isRequired,
        pauseVideo,
      })

      res.status(201).json({
        success: true,
        data: videoQuiz,
      })
    } catch (error: any) {
      console.error('Error creating video quiz:', error)
      if (error.message.includes('not found') || error.message.includes('can only be added')) {
        return res.status(404).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get all video quizzes for a lesson
   * GET /api/video-quizzes/lesson/:lessonId
   */
  async getVideoQuizzesByLesson(req: Request, res: Response) {
    try {
      const { lessonId } = req.params
      const userId = (req as any).user?.id

      let quizzes

      // If user is authenticated, get quizzes with their responses
      if (userId) {
        quizzes = await videoQuizService.getVideoQuizzesWithResponses(
          lessonId,
          userId
        )
      } else {
        quizzes = await videoQuizService.getVideoQuizzesByLesson(lessonId)
      }

      res.json({
        success: true,
        data: quizzes,
      })
    } catch (error) {
      console.error('Error getting video quizzes:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get a single video quiz by ID
   * GET /api/video-quizzes/:id
   */
  async getVideoQuizById(req: Request, res: Response) {
    try {
      const { id } = req.params

      const quiz = await videoQuizService.getVideoQuizById(id)

      res.json({
        success: true,
        data: quiz,
      })
    } catch (error: any) {
      console.error('Error getting video quiz:', error)
      if (error.message === 'Video quiz not found') {
        return res.status(404).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Update a video quiz
   * PUT /api/video-quizzes/:id
   */
  async updateVideoQuiz(req: Request, res: Response) {
    try {
      const { id } = req.params
      const updateData = req.body

      const videoQuiz = await videoQuizService.updateVideoQuiz(id, updateData)

      res.json({
        success: true,
        data: videoQuiz,
      })
    } catch (error: any) {
      console.error('Error updating video quiz:', error)
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Delete a video quiz
   * DELETE /api/video-quizzes/:id
   */
  async deleteVideoQuiz(req: Request, res: Response) {
    try {
      const { id } = req.params

      await videoQuizService.deleteVideoQuiz(id)

      res.json({
        success: true,
        message: 'Video quiz deleted successfully',
      })
    } catch (error: any) {
      console.error('Error deleting video quiz:', error)
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Submit an answer to a video quiz
   * POST /api/video-quizzes/:id/submit
   */
  async submitAnswer(req: Request, res: Response) {
    try {
      const { id: videoQuizId } = req.params
      const { answer, timeSpent } = req.body
      const userId = (req as any).user.id

      if (answer === undefined) {
        return res.status(400).json({
          message: 'Answer is required',
        })
      }

      const result = await videoQuizService.submitAnswer({
        userId,
        videoQuizId,
        answer,
        timeSpent,
      })

      res.json({
        success: true,
        data: result,
      })
    } catch (error: any) {
      console.error('Error submitting answer:', error)
      if (error.message.includes('not found') || error.message.includes('Invalid')) {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get user's response to a quiz
   * GET /api/video-quizzes/:id/response
   */
  async getUserResponse(req: Request, res: Response) {
    try {
      const { id: videoQuizId } = req.params
      const userId = (req as any).user.id

      const response = await videoQuizService.getUserResponse(userId, videoQuizId)

      res.json({
        success: true,
        data: response,
      })
    } catch (error) {
      console.error('Error getting user response:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get all user's responses for a lesson
   * GET /api/video-quizzes/lesson/:lessonId/responses
   */
  async getUserResponsesByLesson(req: Request, res: Response) {
    try {
      const { lessonId } = req.params
      const userId = (req as any).user.id

      const responses = await videoQuizService.getUserResponsesByLesson(
        userId,
        lessonId
      )

      res.json({
        success: true,
        data: responses,
      })
    } catch (error) {
      console.error('Error getting user responses:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get quiz statistics (for instructors)
   * GET /api/video-quizzes/:id/statistics
   */
  async getQuizStatistics(req: Request, res: Response) {
    try {
      const { id } = req.params

      const statistics = await videoQuizService.getQuizStatistics(id)

      res.json({
        success: true,
        data: statistics,
      })
    } catch (error: any) {
      console.error('Error getting quiz statistics:', error)
      if (error.message === 'Video quiz not found') {
        return res.status(404).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get lesson-wide quiz statistics (for instructors)
   * GET /api/video-quizzes/lesson/:lessonId/statistics
   */
  async getLessonQuizStatistics(req: Request, res: Response) {
    try {
      const { lessonId } = req.params

      const statistics = await videoQuizService.getLessonQuizStatistics(lessonId)

      res.json({
        success: true,
        data: statistics,
      })
    } catch (error) {
      console.error('Error getting lesson quiz statistics:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Check if user has completed all required quizzes
   * GET /api/video-quizzes/lesson/:lessonId/check-completion
   */
  async checkRequiredCompletion(req: Request, res: Response) {
    try {
      const { lessonId } = req.params
      const userId = (req as any).user.id

      const completed = await videoQuizService.hasCompletedRequiredQuizzes(
        userId,
        lessonId
      )

      res.json({
        success: true,
        data: {
          completed,
        },
      })
    } catch (error) {
      console.error('Error checking quiz completion:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new VideoQuizController()
