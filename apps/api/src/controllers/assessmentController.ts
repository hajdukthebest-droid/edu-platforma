import { Response, NextFunction } from 'express'
import { assessmentService } from '../services/assessmentService'
import { AuthRequest } from '../middleware/auth'

export class AssessmentController {
  async createAssessment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const assessment = await assessmentService.createAssessment(req.body)

      res.status(201).json({
        status: 'success',
        data: assessment,
      })
    } catch (error) {
      next(error)
    }
  }

  async getAssessment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const assessment = await assessmentService.getAssessmentById(req.params.id)

      res.json({
        status: 'success',
        data: assessment,
      })
    } catch (error) {
      next(error)
    }
  }

  async addQuestion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const question = await assessmentService.addQuestion(req.params.id, req.body)

      res.status(201).json({
        status: 'success',
        data: question,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateQuestion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const question = await assessmentService.updateQuestion(
        req.params.questionId,
        req.body
      )

      res.json({
        status: 'success',
        data: question,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteQuestion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      await assessmentService.deleteQuestion(req.params.questionId)

      res.json({
        status: 'success',
        message: 'Question deleted',
      })
    } catch (error) {
      next(error)
    }
  }

  async startAssessment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const assessment = await assessmentService.startAssessment(
        req.params.id,
        req.user.id
      )

      res.json({
        status: 'success',
        data: assessment,
      })
    } catch (error) {
      next(error)
    }
  }

  async submitAssessment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const results = await assessmentService.submitAssessment(
        req.params.id,
        req.user.id,
        req.body
      )

      res.json({
        status: 'success',
        data: results,
      })
    } catch (error) {
      next(error)
    }
  }

  async getUserAttempts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const attempts = await assessmentService.getUserAttempts(
        req.params.id,
        req.user.id
      )

      res.json({
        status: 'success',
        data: attempts,
      })
    } catch (error) {
      next(error)
    }
  }

  async getAttempt(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const attempt = await assessmentService.getAttemptById(
        req.params.attemptId,
        req.user.id
      )

      res.json({
        status: 'success',
        data: attempt,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const assessmentController = new AssessmentController()
