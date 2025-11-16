import { Router } from 'express'
import { paymentController } from '../controllers/paymentController'
import { authenticate, authorize } from '../middleware/auth'
import { UserRole } from '@prisma/client'
import express from 'express'

const router = Router()

// Webhook endpoint (no auth, raw body needed for signature verification)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
)

// All other routes require authentication
router.use(authenticate)

// Create checkout session
router.post('/checkout', paymentController.createCheckoutSession)

// Get user's payment history
router.get('/my-payments', paymentController.getUserPayments)

// Get specific payment
router.get('/:paymentId', paymentController.getPayment)

// Refund payment (admin only)
router.post(
  '/:paymentId/refund',
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  paymentController.refundPayment
)

export default router
