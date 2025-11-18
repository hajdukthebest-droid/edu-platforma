import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import { DiscountType, PromoCodeStatus, Prisma } from '@prisma/client'

interface CreatePromoCodeData {
  code: string
  description?: string
  discountType?: DiscountType
  discountValue: number
  minPurchase?: number
  maxDiscount?: number
  startDate?: Date
  endDate?: Date
  usageLimit?: number
  perUserLimit?: number
  courseIds?: string[]
  bundleIds?: string[]
  userIds?: string[]
  newUsersOnly?: boolean
}

interface UpdatePromoCodeData {
  description?: string
  discountType?: DiscountType
  discountValue?: number
  minPurchase?: number
  maxDiscount?: number
  status?: PromoCodeStatus
  startDate?: Date
  endDate?: Date
  usageLimit?: number
  perUserLimit?: number
  courseIds?: string[]
  bundleIds?: string[]
  userIds?: string[]
  newUsersOnly?: boolean
}

interface ValidatePromoResult {
  valid: boolean
  promoCode?: any
  discountAmount?: number
  finalPrice?: number
  message?: string
}

export class PromoCodeService {
  // Create a new promo code
  async createPromoCode(data: CreatePromoCodeData) {
    // Check if code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code: data.code.toUpperCase() },
    })

    if (existing) {
      throw new AppError(409, 'Promo code already exists')
    }

    // Validate discount value
    if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
      throw new AppError(400, 'Percentage discount cannot exceed 100%')
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        discountType: data.discountType || 'PERCENTAGE',
        discountValue: data.discountValue,
        minPurchase: data.minPurchase,
        maxDiscount: data.maxDiscount,
        startDate: data.startDate || new Date(),
        endDate: data.endDate,
        usageLimit: data.usageLimit,
        perUserLimit: data.perUserLimit || 1,
        courseIds: data.courseIds || [],
        bundleIds: data.bundleIds || [],
        userIds: data.userIds || [],
        newUsersOnly: data.newUsersOnly || false,
      },
    })

    return promoCode
  }

  // Get all promo codes (admin)
  async getPromoCodes(filters?: {
    status?: PromoCodeStatus
    page?: number
    limit?: number
  }) {
    const { status, page = 1, limit = 20 } = filters || {}

    const where: Prisma.PromoCodeWhereInput = {}
    if (status) where.status = status

    const [promoCodes, total] = await Promise.all([
      prisma.promoCode.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { usages: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.promoCode.count({ where }),
    ])

    return {
      promoCodes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  // Get promo code by ID
  async getPromoCodeById(id: string) {
    const promoCode = await prisma.promoCode.findUnique({
      where: { id },
      include: {
        _count: { select: { usages: true } },
        usages: {
          take: 10,
          orderBy: { usedAt: 'desc' },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
    })

    if (!promoCode) {
      throw new AppError(404, 'Promo code not found')
    }

    return promoCode
  }

  // Update promo code
  async updatePromoCode(id: string, data: UpdatePromoCodeData) {
    const promoCode = await prisma.promoCode.findUnique({ where: { id } })

    if (!promoCode) {
      throw new AppError(404, 'Promo code not found')
    }

    const updated = await prisma.promoCode.update({
      where: { id },
      data,
    })

    return updated
  }

  // Delete promo code
  async deletePromoCode(id: string) {
    const promoCode = await prisma.promoCode.findUnique({
      where: { id },
      include: { _count: { select: { usages: true } } },
    })

    if (!promoCode) {
      throw new AppError(404, 'Promo code not found')
    }

    if (promoCode._count.usages > 0) {
      // Instead of deleting, disable it
      await prisma.promoCode.update({
        where: { id },
        data: { status: 'DISABLED' },
      })
      return { message: 'Promo code disabled (has usage history)' }
    }

    await prisma.promoCode.delete({ where: { id } })
    return { message: 'Promo code deleted successfully' }
  }

  // Validate promo code for a purchase
  async validatePromoCode(
    code: string,
    userId: string,
    purchaseAmount: number,
    courseId?: string,
    bundleId?: string
  ): Promise<ValidatePromoResult> {
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!promoCode) {
      return { valid: false, message: 'Promo kod nije pronađen' }
    }

    // Check status
    if (promoCode.status !== 'ACTIVE') {
      return { valid: false, message: 'Promo kod nije aktivan' }
    }

    // Check dates
    const now = new Date()
    if (promoCode.startDate > now) {
      return { valid: false, message: 'Promo kod još nije aktivan' }
    }
    if (promoCode.endDate && promoCode.endDate < now) {
      return { valid: false, message: 'Promo kod je istekao' }
    }

    // Check usage limit
    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      return { valid: false, message: 'Promo kod je iskorišten' }
    }

    // Check per-user limit
    const userUsageCount = await prisma.promoCodeUsage.count({
      where: {
        promoCodeId: promoCode.id,
        userId,
      },
    })

    if (userUsageCount >= promoCode.perUserLimit) {
      return { valid: false, message: 'Već ste iskoristili ovaj promo kod' }
    }

    // Check minimum purchase
    if (promoCode.minPurchase && purchaseAmount < Number(promoCode.minPurchase)) {
      return {
        valid: false,
        message: `Minimalni iznos kupnje je ${promoCode.minPurchase} EUR`,
      }
    }

    // Check user restrictions
    if (promoCode.userIds.length > 0 && !promoCode.userIds.includes(userId)) {
      return { valid: false, message: 'Promo kod nije dostupan za vaš račun' }
    }

    // Check new users only
    if (promoCode.newUsersOnly) {
      const hasPayments = await prisma.payment.count({
        where: { userId, status: 'COMPLETED' },
      })
      if (hasPayments > 0) {
        return { valid: false, message: 'Promo kod je samo za nove korisnike' }
      }
    }

    // Check course/bundle restrictions
    if (courseId && promoCode.courseIds.length > 0) {
      if (!promoCode.courseIds.includes(courseId)) {
        return { valid: false, message: 'Promo kod nije primjenjiv na ovaj tečaj' }
      }
    }

    if (bundleId && promoCode.bundleIds.length > 0) {
      if (!promoCode.bundleIds.includes(bundleId)) {
        return { valid: false, message: 'Promo kod nije primjenjiv na ovaj paket' }
      }
    }

    // Calculate discount
    let discountAmount: number

    if (promoCode.discountType === 'PERCENTAGE') {
      discountAmount = (purchaseAmount * Number(promoCode.discountValue)) / 100

      // Apply max discount cap
      if (promoCode.maxDiscount) {
        discountAmount = Math.min(discountAmount, Number(promoCode.maxDiscount))
      }
    } else {
      // Fixed amount
      discountAmount = Math.min(Number(promoCode.discountValue), purchaseAmount)
    }

    const finalPrice = Math.max(0, purchaseAmount - discountAmount)

    return {
      valid: true,
      promoCode,
      discountAmount,
      finalPrice,
    }
  }

  // Apply promo code (record usage)
  async applyPromoCode(
    promoCodeId: string,
    userId: string,
    paymentId: string,
    originalAmount: number,
    discountAmount: number,
    finalAmount: number
  ) {
    // Create usage record
    const usage = await prisma.promoCodeUsage.create({
      data: {
        promoCodeId,
        userId,
        paymentId,
        originalAmount,
        discountAmount,
        finalAmount,
      },
    })

    // Increment usage count
    await prisma.promoCode.update({
      where: { id: promoCodeId },
      data: { usageCount: { increment: 1 } },
    })

    return usage
  }

  // Get user's promo code usage history
  async getUserPromoUsage(userId: string) {
    const usages = await prisma.promoCodeUsage.findMany({
      where: { userId },
      include: {
        promoCode: {
          select: {
            code: true,
            discountType: true,
            discountValue: true,
          },
        },
      },
      orderBy: { usedAt: 'desc' },
    })

    return usages
  }

  // Get promo code analytics
  async getPromoCodeAnalytics(id: string) {
    const promoCode = await prisma.promoCode.findUnique({
      where: { id },
      include: {
        usages: {
          select: {
            discountAmount: true,
            originalAmount: true,
            finalAmount: true,
            usedAt: true,
          },
        },
      },
    })

    if (!promoCode) {
      throw new AppError(404, 'Promo code not found')
    }

    const totalUsages = promoCode.usages.length
    const totalDiscountGiven = promoCode.usages.reduce(
      (sum, u) => sum + Number(u.discountAmount),
      0
    )
    const totalRevenue = promoCode.usages.reduce(
      (sum, u) => sum + Number(u.finalAmount),
      0
    )

    // Usage by date
    const usageByDate = promoCode.usages.reduce((acc: any, usage) => {
      const date = usage.usedAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    return {
      totalUsages,
      totalDiscountGiven,
      totalRevenue,
      usageByDate,
      remainingUses: promoCode.usageLimit
        ? promoCode.usageLimit - promoCode.usageCount
        : null,
    }
  }
}

export const promoCodeService = new PromoCodeService()
