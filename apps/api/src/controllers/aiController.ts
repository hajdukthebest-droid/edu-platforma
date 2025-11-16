import { Request, Response } from 'express'
import aiRecommendationService from '../services/aiRecommendationService'
import contentSummarizationService from '../services/contentSummarizationService'
import learningAnalyticsService from '../services/learningAnalyticsService'
import adaptiveLearningService from '../services/adaptiveLearningService'

class AIController {
  // ===== RECOMMENDATIONS =====

  async getPersonalizedRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const limit = parseInt(req.query.limit as string) || 10

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const recommendations =
        await aiRecommendationService.getPersonalizedRecommendations(userId, limit)

      res.json({
        success: true,
        data: recommendations,
      })
    } catch (error) {
      console.error('Error getting personalized recommendations:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getSimilarCourses(req: Request, res: Response) {
    try {
      const { courseId } = req.params
      const limit = parseInt(req.query.limit as string) || 6

      const similarCourses = await aiRecommendationService.getSimilarCourses(
        courseId,
        limit
      )

      res.json({
        success: true,
        data: similarCourses,
      })
    } catch (error) {
      console.error('Error getting similar courses:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async predictNextCourse(req: Request, res: Response) {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const nextCourse = await aiRecommendationService.predictNextCourse(userId)

      res.json({
        success: true,
        data: nextCourse,
      })
    } catch (error) {
      console.error('Error predicting next course:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ===== SUMMARIZATION =====

  async getCourseOverview(req: Request, res: Response) {
    try {
      const { courseId } = req.params

      const overview = await contentSummarizationService.generateCourseOverview(
        courseId
      )

      if (!overview) {
        return res.status(404).json({ message: 'Course not found' })
      }

      res.json({
        success: true,
        data: overview,
      })
    } catch (error) {
      console.error('Error generating course overview:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getModuleSummary(req: Request, res: Response) {
    try {
      const { moduleId } = req.params

      const summary = await contentSummarizationService.generateModuleSummary(
        moduleId
      )

      if (!summary) {
        return res.status(404).json({ message: 'Module not found' })
      }

      res.json({
        success: true,
        data: summary,
      })
    } catch (error) {
      console.error('Error generating module summary:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getUserLearningSummary(req: Request, res: Response) {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const summary =
        await contentSummarizationService.generateUserLearningSummary(userId)

      res.json({
        success: true,
        data: summary,
      })
    } catch (error) {
      console.error('Error generating user learning summary:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ===== LEARNING ANALYTICS =====

  async predictCompletionProbability(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { courseId } = req.params

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const prediction =
        await learningAnalyticsService.predictCompletionProbability(
          userId,
          courseId
        )

      res.json({
        success: true,
        data: prediction,
      })
    } catch (error) {
      console.error('Error predicting completion probability:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async predictAssessmentPerformance(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { quizId } = req.params

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const prediction =
        await learningAnalyticsService.predictAssessmentPerformance(userId, quizId)

      res.json({
        success: true,
        data: prediction,
      })
    } catch (error) {
      console.error('Error predicting assessment performance:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getLearningPatterns(req: Request, res: Response) {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const patterns = await learningAnalyticsService.analyzeLearningPatterns(
        userId
      )

      res.json({
        success: true,
        data: patterns,
      })
    } catch (error) {
      console.error('Error analyzing learning patterns:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getRetentionScore(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { courseId } = req.params

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const retention = await learningAnalyticsService.calculateRetentionScore(
        userId,
        courseId
      )

      res.json({
        success: true,
        data: retention,
      })
    } catch (error) {
      console.error('Error calculating retention score:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getLearnerProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const profile = await learningAnalyticsService.generateLearnerProfile(userId)

      res.json({
        success: true,
        data: profile,
      })
    } catch (error) {
      console.error('Error generating learner profile:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ===== ADAPTIVE LEARNING =====

  async getAdaptivePath(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { courseId } = req.params

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const path = await adaptiveLearningService.generateAdaptivePath(
        userId,
        courseId
      )

      res.json({
        success: true,
        data: path,
      })
    } catch (error) {
      console.error('Error generating adaptive path:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async suggestDifficultyLevel(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { categoryId } = req.params

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const level = await adaptiveLearningService.suggestDifficultyLevel(
        userId,
        categoryId
      )

      res.json({
        success: true,
        data: { suggestedLevel: level },
      })
    } catch (error) {
      console.error('Error suggesting difficulty level:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getReviewSchedule(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { courseId } = req.params

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const schedule = await adaptiveLearningService.generateReviewSchedule(
        userId,
        courseId
      )

      res.json({
        success: true,
        data: schedule,
      })
    } catch (error) {
      console.error('Error generating review schedule:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getLearningPathway(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { categoryId } = req.params

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const pathway = await adaptiveLearningService.suggestLearningPathway(
        userId,
        categoryId
      )

      res.json({
        success: true,
        data: pathway,
      })
    } catch (error) {
      console.error('Error suggesting learning pathway:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new AIController()
