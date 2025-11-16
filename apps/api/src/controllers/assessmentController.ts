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

  // ============================================
  // NEW CONTROLLER METHODS
  // ============================================

  async updateAssessment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const assessment = await assessmentService.updateAssessment(req.params.id, req.body)

      res.json({
        status: 'success',
        data: assessment,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteAssessment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      await assessmentService.deleteAssessment(req.params.id)

      res.json({
        status: 'success',
        message: 'Assessment deleted',
      })
    } catch (error) {
      next(error)
    }
  }

  async getCourseAssessments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const assessments = await assessmentService.getCourseAssessments(req.params.courseId)

      res.json({
        status: 'success',
        data: assessments,
      })
    } catch (error) {
      next(error)
    }
  }

  async getInstructorAssessments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const assessments = await assessmentService.getInstructorAssessments(req.user.id)

      res.json({
        status: 'success',
        data: assessments,
      })
    } catch (error) {
      next(error)
    }
  }

  async getAssessmentAttempts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20

      const result = await assessmentService.getAssessmentAttempts(
        req.params.id,
        page,
        limit
      )

      res.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async gradeAttempt(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      // Verify instructor role
      if (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Only instructors can grade assessments',
        })
      }

      const attempt = await assessmentService.gradeAttempt(
        req.params.attemptId,
        req.user.id,
        req.body
      )

      res.json({
        status: 'success',
        data: attempt,
      })
    } catch (error) {
      next(error)
    }
  }

  async getAssessmentAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const analytics = await assessmentService.getAssessmentAnalytics(req.params.id)

      res.json({
        status: 'success',
        data: analytics,
      })
    } catch (error) {
      next(error)
    }
  }

  async getQuestionAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const questionStats = await assessmentService.getQuestionAnalytics(req.params.id)

      res.json({
        status: 'success',
        data: questionStats,
      })
    } catch (error) {
      next(error)
    }
  }

  async reorderQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const { questionIds } = req.body

      const assessment = await assessmentService.reorderQuestions(
        req.params.id,
        questionIds
      )

      res.json({
        status: 'success',
        data: assessment,
      })
    } catch (error) {
      next(error)
    }
  }

  async duplicateAssessment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const { title } = req.body

      const duplicated = await assessmentService.duplicateAssessment(req.params.id, title)

      res.json({
        status: 'success',
        data: duplicated,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const assessmentController = new AssessmentController()
