import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { bundleService } from '../services/bundleService'
import { promoCodeService } from '../services/promoCodeService'

class BundleController {
  // ========================
  // BUNDLE ENDPOINTS
  // ========================

  async createBundle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bundle = await bundleService.createBundle(req.body)
      res.status(201).json({ success: true, data: bundle })
    } catch (error) {
      next(error)
    }
  }

  async getBundles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { published, page, limit } = req.query
      const result = await bundleService.getBundles({
        published: published !== 'false',
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      })
      res.json({ success: true, data: result })
    } catch (error) {
      next(error)
    }
  }

  async getBundleById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const bundle = await bundleService.getBundleById(id)
      res.json({ success: true, data: bundle })
    } catch (error) {
      next(error)
    }
  }

  async getBundleBySlug(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params
      const bundle = await bundleService.getBundleBySlug(slug)
      res.json({ success: true, data: bundle })
    } catch (error) {
      next(error)
    }
  }

  async updateBundle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const bundle = await bundleService.updateBundle(id, req.body)
      res.json({ success: true, data: bundle })
    } catch (error) {
      next(error)
    }
  }

  async deleteBundle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const result = await bundleService.deleteBundle(id)
      res.json({ success: true, data: result })
    } catch (error) {
      next(error)
    }
  }

  async checkBundleOwnership(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const owns = await bundleService.checkUserOwnsBundle(req.user!.id, id)
      res.json({ success: true, data: { owns } })
    } catch (error) {
      next(error)
    }
  }

  // ========================
  // PROMO CODE ENDPOINTS
  // ========================

  async createPromoCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const promoCode = await promoCodeService.createPromoCode(req.body)
      res.status(201).json({ success: true, data: promoCode })
    } catch (error) {
      next(error)
    }
  }

  async getPromoCodes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query
      const result = await promoCodeService.getPromoCodes({
        status: status as any,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      })
      res.json({ success: true, data: result })
    } catch (error) {
      next(error)
    }
  }

  async getPromoCodeById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const promoCode = await promoCodeService.getPromoCodeById(id)
      res.json({ success: true, data: promoCode })
    } catch (error) {
      next(error)
    }
  }

  async updatePromoCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const promoCode = await promoCodeService.updatePromoCode(id, req.body)
      res.json({ success: true, data: promoCode })
    } catch (error) {
      next(error)
    }
  }

  async deletePromoCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const result = await promoCodeService.deletePromoCode(id)
      res.json({ success: true, data: result })
    } catch (error) {
      next(error)
    }
  }

  async validatePromoCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { code, amount, courseId, bundleId } = req.body
      const result = await promoCodeService.validatePromoCode(
        code,
        req.user!.id,
        amount,
        courseId,
        bundleId
      )
      res.json({ success: true, data: result })
    } catch (error) {
      next(error)
    }
  }

  async getPromoCodeAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const analytics = await promoCodeService.getPromoCodeAnalytics(id)
      res.json({ success: true, data: analytics })
    } catch (error) {
      next(error)
    }
  }

  async getUserPromoUsage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usages = await promoCodeService.getUserPromoUsage(req.user!.id)
      res.json({ success: true, data: usages })
    } catch (error) {
      next(error)
    }
  }
}

export const bundleController = new BundleController()
