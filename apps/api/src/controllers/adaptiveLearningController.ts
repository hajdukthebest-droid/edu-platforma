import { Request, Response } from 'express'
import adaptiveLearningService from '../services/adaptiveLearningService'

class AdaptiveLearningController {
  /**
   * Get adaptive learning path for a course
   * @route GET /api/adaptive/path/:courseId
   */
  async getAdaptivePath(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      const { courseId } = req.params

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        })
      }

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required',
        })
      }

      const adaptivePath = await adaptiveLearningService.generateAdaptivePath(
        userId,
        courseId
      )

      return res.status(200).json({
        success: true,
        data: adaptivePath,
      })
    } catch (error: any) {
      console.error('Error getting adaptive path:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to generate adaptive learning path',
        error: error.message,
      })
    }
  }

  /**
   * Get suggested difficulty level for a category
   * @route GET /api/adaptive/difficulty/:categoryId
   */
  async getSuggestedDifficulty(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      const { categoryId } = req.params

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        })
      }

      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Category ID is required',
        })
      }

      const suggestedLevel = await adaptiveLearningService.suggestDifficultyLevel(
        userId,
        categoryId
      )

      return res.status(200).json({
        success: true,
        data: {
          suggestedLevel,
          description: this.getDifficultyDescription(suggestedLevel),
        },
      })
    } catch (error: any) {
      console.error('Error getting suggested difficulty:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to suggest difficulty level',
        error: error.message,
      })
    }
  }

  /**
   * Get spaced repetition review schedule
   * @route GET /api/adaptive/review-schedule/:courseId
   */
  async getReviewSchedule(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      const { courseId } = req.params

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        })
      }

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required',
        })
      }

      const schedule = await adaptiveLearningService.generateReviewSchedule(
        userId,
        courseId
      )

      return res.status(200).json({
        success: true,
        data: schedule,
      })
    } catch (error: any) {
      console.error('Error getting review schedule:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to generate review schedule',
        error: error.message,
      })
    }
  }

  /**
   * Get suggested learning pathway across multiple courses
   * @route GET /api/adaptive/learning-pathway/:categoryId
   */
  async getLearningPathway(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      const { categoryId } = req.params

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        })
      }

      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Category ID is required',
        })
      }

      const pathway = await adaptiveLearningService.suggestLearningPathway(
        userId,
        categoryId
      )

      return res.status(200).json({
        success: true,
        data: pathway,
      })
    } catch (error: any) {
      console.error('Error getting learning pathway:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to generate learning pathway',
        error: error.message,
      })
    }
  }

  /**
   * Get comprehensive learning insights combining all adaptive features
   * @route GET /api/adaptive/insights/:courseId
   */
  async getLearningInsights(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      const { courseId } = req.params

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        })
      }

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required',
        })
      }

      // Get all insights in parallel
      const [adaptivePath, reviewSchedule] = await Promise.all([
        adaptiveLearningService.generateAdaptivePath(userId, courseId),
        adaptiveLearningService.generateReviewSchedule(userId, courseId),
      ])

      return res.status(200).json({
        success: true,
        data: {
          adaptivePath: {
            recommendedLessons: adaptivePath.recommendedLessons,
            skillGaps: adaptivePath.skillGaps,
            difficultyAdjustment: adaptivePath.difficultyAdjustment,
            personalizedTips: adaptivePath.personalizedTips,
          },
          reviewSchedule: {
            todayReviews: reviewSchedule.todayReviews,
            upcomingReviews: reviewSchedule.upcomingReviews,
            totalReviewsNeeded: reviewSchedule.todayReviews.length,
          },
          summary: {
            skillGapsCount: adaptivePath.skillGaps.length,
            reviewsToday: reviewSchedule.todayReviews.length,
            reviewsUpcoming: reviewSchedule.upcomingReviews.length,
            difficultyStatus: adaptivePath.difficultyAdjustment,
            performanceIndicator: this.getPerformanceIndicator(
              adaptivePath.difficultyAdjustment,
              adaptivePath.skillGaps.length
            ),
          },
        },
      })
    } catch (error: any) {
      console.error('Error getting learning insights:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to generate learning insights',
        error: error.message,
      })
    }
  }

  /**
   * Helper: Get difficulty description
   */
  private getDifficultyDescription(level: string): string {
    const descriptions = {
      BEGINNER: 'Start with foundational courses to build your knowledge base',
      INTERMEDIATE: 'You\'re ready for intermediate courses that expand on basics',
      ADVANCED: 'Challenge yourself with advanced topics and specialized content',
      EXPERT: 'Explore expert-level courses for mastery and specialization',
    }

    return descriptions[level] || 'Start your learning journey'
  }

  /**
   * Helper: Get performance indicator
   */
  private getPerformanceIndicator(
    difficultyAdjustment: string,
    skillGapsCount: number
  ): {
    status: 'excellent' | 'good' | 'needs-improvement' | 'struggling'
    message: string
  } {
    if (difficultyAdjustment === 'increase' && skillGapsCount === 0) {
      return {
        status: 'excellent',
        message: 'Excellent performance! You\'re mastering the material.',
      }
    } else if (difficultyAdjustment === 'maintain' && skillGapsCount <= 1) {
      return {
        status: 'good',
        message: 'Good progress! Keep up the consistent learning.',
      }
    } else if (skillGapsCount <= 3) {
      return {
        status: 'needs-improvement',
        message: 'Focus on addressing skill gaps to improve understanding.',
      }
    } else {
      return {
        status: 'struggling',
        message: 'Consider reviewing earlier lessons and seeking additional help.',
      }
    }
  }
}

export default new AdaptiveLearningController()
