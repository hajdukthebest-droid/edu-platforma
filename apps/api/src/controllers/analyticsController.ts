import { Request, Response } from 'express'
import advancedAnalyticsService from '../services/advancedAnalyticsService'
import reportingService from '../services/reportingService'

class AnalyticsController {
  /**
   * Get platform overview metrics
   */
  async getPlatformOverview(req: Request, res: Response) {
    try {
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined

      const metrics = await advancedAnalyticsService.getPlatformOverview({
        startDate,
        endDate,
      })

      res.json({
        success: true,
        data: metrics,
      })
    } catch (error) {
      console.error('Error getting platform overview:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get time-series data
   */
  async getTimeSeries(req: Request, res: Response) {
    try {
      const metric = req.params.metric as 'enrollments' | 'users' | 'revenue' | 'completions'
      const interval = (req.query.interval as 'day' | 'week' | 'month') || 'day'
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date()

      const data = await advancedAnalyticsService.getTimeSeries(
        metric,
        { startDate, endDate },
        interval
      )

      res.json({
        success: true,
        data,
      })
    } catch (error) {
      console.error('Error getting time series:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get cohort analysis
   */
  async getCohortAnalysis(req: Request, res: Response) {
    try {
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) // 6 months ago
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date()

      const data = await advancedAnalyticsService.getCohortAnalysis(startDate, endDate)

      res.json({
        success: true,
        data,
      })
    } catch (error) {
      console.error('Error getting cohort analysis:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get funnel analysis
   */
  async getFunnelAnalysis(req: Request, res: Response) {
    try {
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date()

      const data = await advancedAnalyticsService.getFunnelAnalysis({ startDate, endDate })

      res.json({
        success: true,
        data,
      })
    } catch (error) {
      console.error('Error getting funnel analysis:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get course performance
   */
  async getCoursePerformance(req: Request, res: Response) {
    try {
      const { courseId } = req.params

      const data = await advancedAnalyticsService.getCoursePerformance(
        courseId === 'all' ? undefined : courseId
      )

      res.json({
        success: true,
        data,
      })
    } catch (error) {
      console.error('Error getting course performance:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get user engagement
   */
  async getUserEngagement(req: Request, res: Response) {
    try {
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date()

      const data = await advancedAnalyticsService.getUserEngagement({ startDate, endDate })

      res.json({
        success: true,
        data,
      })
    } catch (error) {
      console.error('Error getting user engagement:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(req: Request, res: Response) {
    try {
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date()

      const data = await advancedAnalyticsService.getRevenueAnalytics({ startDate, endDate })

      res.json({
        success: true,
        data,
      })
    } catch (error) {
      console.error('Error getting revenue analytics:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get instructor analytics
   */
  async getInstructorAnalytics(req: Request, res: Response) {
    try {
      const { instructorId } = req.params
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined

      const data = await advancedAnalyticsService.getInstructorAnalytics(instructorId, {
        startDate,
        endDate,
      })

      res.json({
        success: true,
        data,
      })
    } catch (error) {
      console.error('Error getting instructor analytics:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ===== REPORTING ENDPOINTS =====

  /**
   * Generate enrollment report
   */
  async getEnrollmentReport(req: Request, res: Response) {
    try {
      const format = (req.query.format as 'json' | 'csv') || 'json'
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined

      const report = await reportingService.generateEnrollmentReport({
        format,
        startDate,
        endDate,
      })

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename=enrollment-report.csv')
        return res.send(report)
      }

      res.json({
        success: true,
        data: report,
      })
    } catch (error) {
      console.error('Error generating enrollment report:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Generate course performance report
   */
  async getCoursePerformanceReport(req: Request, res: Response) {
    try {
      const format = (req.query.format as 'json' | 'csv') || 'json'

      const report = await reportingService.generateCoursePerformanceReport({ format })

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=course-performance-report.csv'
        )
        return res.send(report)
      }

      res.json({
        success: true,
        data: report,
      })
    } catch (error) {
      console.error('Error generating course performance report:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Generate user activity report
   */
  async getUserActivityReport(req: Request, res: Response) {
    try {
      const format = (req.query.format as 'json' | 'csv') || 'json'
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined

      const report = await reportingService.generateUserActivityReport({
        format,
        startDate,
        endDate,
      })

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename=user-activity-report.csv')
        return res.send(report)
      }

      res.json({
        success: true,
        data: report,
      })
    } catch (error) {
      console.error('Error generating user activity report:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Generate revenue report
   */
  async getRevenueReport(req: Request, res: Response) {
    try {
      const format = (req.query.format as 'json' | 'csv') || 'json'
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined

      const report = await reportingService.generateRevenueReport({
        format,
        startDate,
        endDate,
      })

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename=revenue-report.csv')
        return res.send(report)
      }

      res.json({
        success: true,
        data: report,
      })
    } catch (error) {
      console.error('Error generating revenue report:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Generate instructor report
   */
  async getInstructorReport(req: Request, res: Response) {
    try {
      const format = (req.query.format as 'json' | 'csv') || 'json'

      const report = await reportingService.generateInstructorReport({ format })

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename=instructor-report.csv')
        return res.send(report)
      }

      res.json({
        success: true,
        data: report,
      })
    } catch (error) {
      console.error('Error generating instructor report:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Generate comprehensive platform report
   */
  async getPlatformReport(req: Request, res: Response) {
    try {
      const format = (req.query.format as 'json' | 'csv') || 'json'
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined

      const report = await reportingService.generatePlatformReport({
        format,
        startDate,
        endDate,
      })

      res.json({
        success: true,
        data: report,
      })
    } catch (error) {
      console.error('Error generating platform report:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new AnalyticsController()
