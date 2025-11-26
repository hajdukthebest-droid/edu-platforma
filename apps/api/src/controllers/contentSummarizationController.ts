import { Request, Response } from 'express'
import contentSummarizationService from '../services/contentSummarizationService'

class ContentSummarizationController {
  /**
   * Generate summary from provided text
   * @route POST /api/summarize/text
   */
  async summarizeText(req: Request, res: Response) {
    try {
      const { text, maxSentences } = req.body

      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Text is required and must be a string',
        })
      }

      if (text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Text cannot be empty',
        })
      }

      const summary = contentSummarizationService.generateSummary(
        text,
        maxSentences || 3
      )

      return res.status(200).json({
        success: true,
        data: {
          originalLength: text.length,
          summaryLength: summary.length,
          compressionRatio: ((summary.length / text.length) * 100).toFixed(1) + '%',
          summary,
        },
      })
    } catch (error: any) {
      console.error('Error generating summary:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to generate summary',
        error: error.message,
      })
    }
  }

  /**
   * Extract keywords from provided text
   * @route POST /api/summarize/keywords
   */
  async extractKeywords(req: Request, res: Response) {
    try {
      const { text, maxKeywords } = req.body

      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Text is required and must be a string',
        })
      }

      if (text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Text cannot be empty',
        })
      }

      const keywords = contentSummarizationService.extractKeywords(
        text,
        maxKeywords || 10
      )

      return res.status(200).json({
        success: true,
        data: {
          keywordCount: keywords.length,
          keywords,
          tags: keywords.slice(0, 5), // Top 5 as tags
        },
      })
    } catch (error: any) {
      console.error('Error extracting keywords:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to extract keywords',
        error: error.message,
      })
    }
  }

  /**
   * Generate comprehensive course overview summary
   * @route GET /api/summarize/course/:courseId
   */
  async getCourseOverview(req: Request, res: Response) {
    try {
      const { courseId } = req.params

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required',
        })
      }

      const overview = await contentSummarizationService.generateCourseOverview(
        courseId
      )

      if (!overview) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        })
      }

      return res.status(200).json({
        success: true,
        data: overview,
      })
    } catch (error: any) {
      console.error('Error generating course overview:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to generate course overview',
        error: error.message,
      })
    }
  }

  /**
   * Generate module summary with lesson breakdown
   * @route GET /api/summarize/module/:moduleId
   */
  async getModuleSummary(req: Request, res: Response) {
    try {
      const { moduleId } = req.params

      if (!moduleId) {
        return res.status(400).json({
          success: false,
          message: 'Module ID is required',
        })
      }

      const summary = await contentSummarizationService.generateModuleSummary(
        moduleId
      )

      if (!summary) {
        return res.status(404).json({
          success: false,
          message: 'Module not found',
        })
      }

      return res.status(200).json({
        success: true,
        data: summary,
      })
    } catch (error: any) {
      console.error('Error generating module summary:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to generate module summary',
        error: error.message,
      })
    }
  }

  /**
   * Generate user's learning progress summary
   * @route GET /api/summarize/user-learning
   */
  async getUserLearningSummary(req: Request, res: Response) {
    try {
      const userId = req.user?.userId

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        })
      }

      const summary = await contentSummarizationService.generateUserLearningSummary(
        userId
      )

      return res.status(200).json({
        success: true,
        data: summary,
      })
    } catch (error: any) {
      console.error('Error generating user learning summary:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to generate user learning summary',
        error: error.message,
      })
    }
  }
}

export default new ContentSummarizationController()
