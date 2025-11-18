import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { peerReviewService } from '../services/peerReviewService'

class PeerReviewController {
  // ========================
  // ASSIGNMENT ENDPOINTS
  // ========================

  async createAssignment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const assignment = await peerReviewService.createAssignment(req.user!.id, req.body)
      res.status(201).json({
        success: true,
        data: assignment,
      })
    } catch (error) {
      next(error)
    }
  }

  async getAssignments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { courseId, instructorId, status, page, limit } = req.query
      const result = await peerReviewService.getAssignments({
        courseId: courseId as string,
        instructorId: instructorId as string,
        status: status as any,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      })
      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async getAssignmentById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userId = req.user?.id
      const assignment = await peerReviewService.getAssignmentById(id, userId)
      res.json({
        success: true,
        data: assignment,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateAssignment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const assignment = await peerReviewService.updateAssignment(id, req.user!.id, req.body)
      res.json({
        success: true,
        data: assignment,
      })
    } catch (error) {
      next(error)
    }
  }

  async publishAssignment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const assignment = await peerReviewService.publishAssignment(id, req.user!.id)
      res.json({
        success: true,
        data: assignment,
      })
    } catch (error) {
      next(error)
    }
  }

  // ========================
  // SUBMISSION ENDPOINTS
  // ========================

  async submitAssignment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const submission = await peerReviewService.submitAssignment(id, req.user!.id, req.body)
      res.status(201).json({
        success: true,
        data: submission,
      })
    } catch (error) {
      next(error)
    }
  }

  async getSubmission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const submission = await peerReviewService.getSubmission(id, req.user!.id)
      res.json({
        success: true,
        data: submission,
      })
    } catch (error) {
      next(error)
    }
  }

  async getMySubmissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const submissions = await peerReviewService.getMySubmissions(req.user!.id)
      res.json({
        success: true,
        data: submissions,
      })
    } catch (error) {
      next(error)
    }
  }

  async getAssignmentSubmissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const submissions = await peerReviewService.getAssignmentSubmissions(id, req.user!.id)
      res.json({
        success: true,
        data: submissions,
      })
    } catch (error) {
      next(error)
    }
  }

  // ========================
  // PEER REVIEW ENDPOINTS
  // ========================

  async getMyPendingReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reviews = await peerReviewService.getMyPendingReviews(req.user!.id)
      res.json({
        success: true,
        data: reviews,
      })
    } catch (error) {
      next(error)
    }
  }

  async getReviewToComplete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const review = await peerReviewService.getReviewToComplete(id, req.user!.id)
      res.json({
        success: true,
        data: review,
      })
    } catch (error) {
      next(error)
    }
  }

  async submitReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const review = await peerReviewService.submitReview(id, req.user!.id, req.body)
      res.json({
        success: true,
        data: review,
      })
    } catch (error) {
      next(error)
    }
  }

  async rateReviewHelpfulness(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const { rating } = req.body
      const review = await peerReviewService.rateReviewHelpfulness(id, req.user!.id, rating)
      res.json({
        success: true,
        data: review,
      })
    } catch (error) {
      next(error)
    }
  }

  // ========================
  // GRADING ENDPOINTS
  // ========================

  async gradeSubmission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const submission = await peerReviewService.gradeSubmission(id, req.user!.id, req.body)
      res.json({
        success: true,
        data: submission,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const peerReviewController = new PeerReviewController()
