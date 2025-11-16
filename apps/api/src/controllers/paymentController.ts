import { Response, NextFunction, Request } from 'express'
import { AuthRequest } from '../middleware/auth'
import { paymentService } from '../services/paymentService'
import { AppError } from '../middleware/errorHandler'

export class PaymentController {
  async createCheckoutSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { courseId } = req.body

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      const result = await paymentService.createCheckoutSession({
        courseId,
        userId,
        successUrl: `${baseUrl}/payment/success`,
        cancelUrl: `${baseUrl}/payment/cancelled`,
      })

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['stripe-signature'] as string

      if (!signature) {
        throw new AppError(400, 'Missing stripe-signature header')
      }

      // Verify webhook signature
      const event = paymentService.verifyWebhookSignature(req.body, signature)

      // Handle the event
      await paymentService.handleWebhook(event)

      res.json({ received: true })
    } catch (error) {
      next(error)
    }
  }

  async getUserPayments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { page, limit } = req.query

      const result = await paymentService.getUserPayments(
        userId,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 20
      )

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async getPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { paymentId } = req.params

      const payment = await paymentService.getPayment(paymentId, userId)

      res.json({
        success: true,
        data: payment,
      })
    } catch (error) {
      next(error)
    }
  }

  async refundPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { paymentId } = req.params

      // Only admins can refund (would need to add role check)
      await paymentService.refundPayment(paymentId)

      res.json({
        success: true,
        message: 'Payment refunded successfully',
      })
    } catch (error) {
      next(error)
    }
  }
}

export const paymentController = new PaymentController()
