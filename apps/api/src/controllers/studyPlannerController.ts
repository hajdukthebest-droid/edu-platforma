import { Request, Response } from 'express'
import studyPlannerService from '../services/studyPlannerService'

class StudyPlannerController {
  // ============================================
  // STUDY PLAN
  // ============================================

  async getStudyPlan(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const plan = await studyPlannerService.getStudyPlan(userId)
      res.json({ success: true, data: plan })
    } catch (error: any) {
      console.error('Error getting study plan:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async updateStudyPlan(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const plan = await studyPlannerService.updateStudyPlan(userId, req.body)
      res.json({ success: true, data: plan })
    } catch (error: any) {
      console.error('Error updating study plan:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getStudySummary(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const summary = await studyPlannerService.getStudySummary(userId)
      res.json({ success: true, data: summary })
    } catch (error: any) {
      console.error('Error getting summary:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // STUDY SESSIONS
  // ============================================

  async createSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { title, description, startTime, endTime, duration, courseId, lessonId, topics, reminderMinutes } = req.body

      if (!title || !startTime || !endTime || !duration) {
        return res.status(400).json({ message: 'title, startTime, endTime, and duration are required' })
      }

      const session = await studyPlannerService.createStudySession({
        userId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration,
        courseId,
        lessonId,
        topics,
        reminderMinutes,
      })

      res.status(201).json({ success: true, data: session })
    } catch (error: any) {
      console.error('Error creating session:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getSessions(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { startDate, endDate, status } = req.query

      const sessions = await studyPlannerService.getUserSessions(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        status as any
      )

      res.json({ success: true, data: sessions })
    } catch (error: any) {
      console.error('Error getting sessions:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getSession(req: Request, res: Response) {
    try {
      const { id } = req.params
      const session = await studyPlannerService.getSession(id)

      if (!session) {
        return res.status(404).json({ message: 'Session not found' })
      }

      res.json({ success: true, data: session })
    } catch (error: any) {
      console.error('Error getting session:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async updateSession(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      const session = await studyPlannerService.updateStudySession(id, userId, req.body)
      res.json({ success: true, data: session })
    } catch (error: any) {
      if (error.message === 'Session not found') {
        return res.status(404).json({ message: error.message })
      }
      console.error('Error updating session:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async deleteSession(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      await studyPlannerService.deleteStudySession(id, userId)
      res.json({ success: true, message: 'Session deleted' })
    } catch (error: any) {
      console.error('Error deleting session:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async startSession(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      const session = await studyPlannerService.startSession(id, userId)
      res.json({ success: true, data: session })
    } catch (error: any) {
      if (error.message === 'Session not found') {
        return res.status(404).json({ message: error.message })
      }
      console.error('Error starting session:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async completeSession(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id
      const { notes, outcome } = req.body

      const result = await studyPlannerService.completeSession(id, userId, notes, outcome)
      res.json({ success: true, data: result })
    } catch (error: any) {
      if (error.message === 'Session not found') {
        return res.status(404).json({ message: error.message })
      }
      console.error('Error completing session:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async markSessionMissed(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      await studyPlannerService.markSessionMissed(id, userId)
      res.json({ success: true, message: 'Session marked as missed' })
    } catch (error: any) {
      console.error('Error marking session as missed:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // STUDY GOALS
  // ============================================

  async createGoal(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { title, description, type, targetValue, deadline, courseId, categoryId } = req.body

      if (!title || !type || !targetValue) {
        return res.status(400).json({ message: 'title, type, and targetValue are required' })
      }

      const goal = await studyPlannerService.createStudyGoal({
        userId,
        title,
        description,
        type,
        targetValue,
        deadline: deadline ? new Date(deadline) : undefined,
        courseId,
        categoryId,
      })

      res.status(201).json({ success: true, data: goal })
    } catch (error: any) {
      console.error('Error creating goal:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getGoals(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { status } = req.query

      const goals = await studyPlannerService.getUserGoals(userId, status as any)
      res.json({ success: true, data: goals })
    } catch (error: any) {
      console.error('Error getting goals:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async updateGoal(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      const goal = await studyPlannerService.updateStudyGoal(id, userId, req.body)
      res.json({ success: true, data: goal })
    } catch (error: any) {
      if (error.message === 'Goal not found') {
        return res.status(404).json({ message: error.message })
      }
      console.error('Error updating goal:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async deleteGoal(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      await studyPlannerService.deleteStudyGoal(id, userId)
      res.json({ success: true, message: 'Goal deleted' })
    } catch (error: any) {
      console.error('Error deleting goal:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async updateGoalProgress(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id
      const { increment } = req.body

      if (!increment) {
        return res.status(400).json({ message: 'increment is required' })
      }

      const goal = await studyPlannerService.updateGoalProgress(id, userId, increment)
      res.json({ success: true, data: goal })
    } catch (error: any) {
      if (error.message === 'Goal not found') {
        return res.status(404).json({ message: error.message })
      }
      console.error('Error updating goal progress:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async toggleGoalStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      const goal = await studyPlannerService.toggleGoalStatus(id, userId)
      res.json({ success: true, data: goal })
    } catch (error: any) {
      if (error.message === 'Goal not found') {
        return res.status(404).json({ message: error.message })
      }
      console.error('Error toggling goal status:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // STUDY BLOCKS
  // ============================================

  async createStudyBlock(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { title, description, isRecurring, recurrenceRule, startTime, endTime, daysOfWeek } = req.body

      if (!title || !startTime || !endTime) {
        return res.status(400).json({ message: 'title, startTime, and endTime are required' })
      }

      const block = await studyPlannerService.createStudyBlock({
        userId,
        title,
        description,
        isRecurring: isRecurring ?? false,
        recurrenceRule,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        daysOfWeek: daysOfWeek ?? [],
      })

      res.status(201).json({ success: true, data: block })
    } catch (error: any) {
      console.error('Error creating study block:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getStudyBlocks(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const blocks = await studyPlannerService.getUserStudyBlocks(userId)
      res.json({ success: true, data: blocks })
    } catch (error: any) {
      console.error('Error getting study blocks:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async updateStudyBlock(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      const block = await studyPlannerService.updateStudyBlock(id, userId, req.body)
      res.json({ success: true, data: block })
    } catch (error: any) {
      if (error.message === 'Study block not found') {
        return res.status(404).json({ message: error.message })
      }
      console.error('Error updating study block:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async deleteStudyBlock(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      await studyPlannerService.deleteStudyBlock(id, userId)
      res.json({ success: true, message: 'Study block deleted' })
    } catch (error: any) {
      console.error('Error deleting study block:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // SESSION TEMPLATES
  // ============================================

  async createTemplate(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { name, description, duration, topics, notes, daysOfWeek, preferredTime } = req.body

      if (!name || !duration) {
        return res.status(400).json({ message: 'name and duration are required' })
      }

      const template = await studyPlannerService.createSessionTemplate(userId, {
        name,
        description,
        duration,
        topics: topics ?? [],
        notes,
        daysOfWeek,
        preferredTime,
      })

      res.status(201).json({ success: true, data: template })
    } catch (error: any) {
      console.error('Error creating template:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getTemplates(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const templates = await studyPlannerService.getUserTemplates(userId)
      res.json({ success: true, data: templates })
    } catch (error: any) {
      console.error('Error getting templates:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async useTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id
      const { startTime } = req.body

      if (!startTime) {
        return res.status(400).json({ message: 'startTime is required' })
      }

      const session = await studyPlannerService.createSessionFromTemplate(
        userId,
        id,
        new Date(startTime)
      )

      res.status(201).json({ success: true, data: session })
    } catch (error: any) {
      if (error.message === 'Template not found') {
        return res.status(404).json({ message: error.message })
      }
      console.error('Error using template:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async deleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      await studyPlannerService.deleteSessionTemplate(id, userId)
      res.json({ success: true, message: 'Template deleted' })
    } catch (error: any) {
      console.error('Error deleting template:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // STATISTICS
  // ============================================

  async getStatistics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { startDate, endDate } = req.query

      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'startDate and endDate are required' })
      }

      const stats = await studyPlannerService.getStudyStatistics(
        userId,
        new Date(startDate as string),
        new Date(endDate as string)
      )

      res.json({ success: true, data: stats })
    } catch (error: any) {
      console.error('Error getting statistics:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // CALENDAR INTEGRATION
  // ============================================

  async getCalendarIntegration(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { provider } = req.params

      const integration = await studyPlannerService.getCalendarIntegration(userId, provider)
      res.json({ success: true, data: integration })
    } catch (error: any) {
      console.error('Error getting calendar integration:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async setupCalendarIntegration(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { provider } = req.params

      const integration = await studyPlannerService.upsertCalendarIntegration(
        userId,
        provider,
        req.body
      )

      res.json({ success: true, data: integration })
    } catch (error: any) {
      console.error('Error setting up calendar integration:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async deleteCalendarIntegration(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { provider } = req.params

      await studyPlannerService.deleteCalendarIntegration(userId, provider)
      res.json({ success: true, message: 'Calendar integration deleted' })
    } catch (error: any) {
      console.error('Error deleting calendar integration:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export const studyPlannerController = new StudyPlannerController()
export default studyPlannerController
