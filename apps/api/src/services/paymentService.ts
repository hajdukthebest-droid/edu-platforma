import Stripe from 'stripe'
import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import { PaymentStatus } from '@prisma/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

interface CreateCheckoutSessionData {
  courseId: string
  userId: string
  successUrl: string
  cancelUrl: string
}

export class PaymentService {
  /**
   * Create Stripe checkout session for course purchase
   */
  async createCheckoutSession(data: CreateCheckoutSessionData) {
    const { courseId, userId, successUrl, cancelUrl } = data

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        price: true,
        thumbnailUrl: true,
      },
    })

    if (!course) {
      throw new AppError(404, 'Course not found')
    }

    if (!course.price || course.price <= 0) {
      throw new AppError(400, 'This course is free')
    }

    // Check if user already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    if (existingEnrollment) {
      throw new AppError(400, 'Already enrolled in this course')
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        courseId,
        amount: course.price,
        currency: 'EUR',
        status: PaymentStatus.PENDING,
      },
    })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: course.title,
              images: course.thumbnailUrl ? [course.thumbnailUrl] : [],
            },
            unit_amount: Math.round(Number(course.price) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      client_reference_id: payment.id,
      metadata: {
        paymentId: payment.id,
        userId,
        courseId,
      },
    })

    // Update payment with Stripe session ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        stripePaymentId: session.id,
      },
    })

    return {
      sessionId: session.id,
      sessionUrl: session.url,
      payment,
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'checkout.session.expired':
        await this.handleCheckoutExpired(event.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  }

  /**
   * Handle successful checkout
   */
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const paymentId = session.client_reference_id

    if (!paymentId) return

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
          },
        },
      },
    })

    if (!payment || !payment.courseId) return

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.COMPLETED,
        paymentMethod: session.payment_method_types?.[0] || 'card',
      },
    })

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: payment.userId,
        courseId: payment.courseId,
        status: 'ACTIVE',
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    // Create course progress
    await prisma.courseProgress.create({
      data: {
        userId: payment.userId,
        courseId: payment.courseId,
        progressPercentage: 0,
      },
    })

    // Send enrollment email
    const { emailService } = await import('./emailService')
    const courseUrl = `${process.env.FRONTEND_URL}/courses/${enrollment.course.slug}`
    emailService
      .sendEnrollmentEmail(
        payment.user.email,
        payment.user.firstName || 'Korisniče',
        enrollment.course.title,
        courseUrl
      )
      .catch((err) => console.error('Failed to send enrollment email:', err))
  }

  /**
   * Handle expired checkout
   */
  private async handleCheckoutExpired(session: Stripe.Checkout.Session) {
    const paymentId = session.client_reference_id

    if (!paymentId) return

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.CANCELLED,
      },
    })
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    // Additional handling if needed
    console.log('Payment succeeded:', paymentIntent.id)
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    // Additional handling if needed
    console.log('Payment failed:', paymentIntent.id)
  }

  /**
   * Get user's payment history
   */
  async getUserPayments(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnailUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where: { userId } }),
    ])

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string, userId: string) {
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
          },
        },
      },
    })

    if (!payment) {
      throw new AppError(404, 'Payment not found')
    }

    return payment
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

    try {
      return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (err: any) {
      throw new AppError(400, `Webhook signature verification failed: ${err.message}`)
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    })

    if (!payment) {
      throw new AppError(404, 'Payment not found')
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new AppError(400, 'Can only refund completed payments')
    }

    if (!payment.stripePaymentId) {
      throw new AppError(400, 'No Stripe payment ID found')
    }

    // Create refund in Stripe
    const session = await stripe.checkout.sessions.retrieve(payment.stripePaymentId)

    if (session.payment_intent && typeof session.payment_intent === 'string') {
      await stripe.refunds.create({
        payment_intent: session.payment_intent,
      })
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
      },
    })

    // Remove enrollment if exists
    if (payment.courseId) {
      await prisma.enrollment.deleteMany({
        where: {
          userId: payment.userId,
          courseId: payment.courseId,
        },
      })
    }
  }
}

export const paymentService = new PaymentService()
