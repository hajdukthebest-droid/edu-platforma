import { Request, Response } from 'express'
import streakService from '../services/streakService'

class StreakController {
  /**
   * Get user's streak data
   * GET /api/streaks
   */
  async getStreak(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const streak = await streakService.getOrCreateStreak(userId)

      res.json({
        success: true,
        data: streak,
      })
    } catch (error) {
      console.error('Error getting streak:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Record learning activity
   * POST /api/streaks/activity
   */
  async recordActivity(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { minutesLearned, lessonsCompleted, quizzesCompleted, pointsEarned, courseId } = req.body

      const streak = await streakService.recordActivity({
        userId,
        minutesLearned,
        lessonsCompleted,
        quizzesCompleted,
        pointsEarned,
        courseId,
      })

      res.json({
        success: true,
        data: streak,
      })
    } catch (error) {
      console.error('Error recording activity:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Use a freeze day
   * POST /api/streaks/freeze
   */
  async useFreeze(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const streak = await streakService.useFreeze(userId)

      res.json({
        success: true,
        data: streak,
        message: 'Freeze day used successfully',
      })
    } catch (error: any) {
      console.error('Error using freeze:', error)
      if (error.message === 'No freeze days available') {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Update daily goals
   * PUT /api/streaks/goals
   */
  async updateGoals(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { dailyGoalMinutes, dailyGoalLessons } = req.body

      const streak = await streakService.updateGoals(userId, {
        dailyGoalMinutes,
        dailyGoalLessons,
      })

      res.json({
        success: true,
        data: streak,
      })
    } catch (error) {
      console.error('Error updating goals:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get streak statistics
   * GET /api/streaks/statistics
   */
  async getStatistics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const statistics = await streakService.getStatistics(userId)

      res.json({
        success: true,
        data: statistics,
      })
    } catch (error) {
      console.error('Error getting statistics:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get activity calendar
   * GET /api/streaks/calendar/:year/:month
   */
  async getCalendar(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { year, month } = req.params

      const calendar = await streakService.getActivityCalendar(
        userId,
        parseInt(year),
        parseInt(month)
      )

      res.json({
        success: true,
        data: calendar,
      })
    } catch (error) {
      console.error('Error getting calendar:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get streak leaderboard
   * GET /api/streaks/leaderboard
   */
  async getLeaderboard(req: Request, res: Response) {
    try {
      const { limit } = req.query
      const leaderboard = await streakService.getLeaderboard(
        limit ? parseInt(limit as string) : 10
      )

      res.json({
        success: true,
        data: leaderboard,
      })
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Check if streak is at risk
   * GET /api/streaks/at-risk
   */
  async checkAtRisk(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const riskStatus = await streakService.checkStreakAtRisk(userId)

      res.json({
        success: true,
        data: riskStatus,
      })
    } catch (error) {
      console.error('Error checking streak risk:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new StreakController()
