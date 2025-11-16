import { Request, Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { domainService } from '../services/domainService'

export class DomainController {
  async getAllDomains(req: Request, res: Response, next: NextFunction) {
    try {
      const domains = await domainService.getAllDomains()

      res.json({
        success: true,
        data: domains,
      })
    } catch (error) {
      next(error)
    }
  }

  async getDomainsWithStats(req: Request, res: Response, next: NextFunction) {
    try {
      const domains = await domainService.getDomainsWithStats()

      res.json({
        success: true,
        data: domains,
      })
    } catch (error) {
      next(error)
    }
  }

  async getDomainBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params

      const domain = await domainService.getDomainBySlug(slug)

      if (!domain) {
        return res.status(404).json({
          success: false,
          message: 'Domain not found',
        })
      }

      res.json({
        success: true,
        data: domain,
      })
    } catch (error) {
      next(error)
    }
  }

  async getRecommendedDomains(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id

      const domains = await domainService.getRecommendedDomains(userId)

      res.json({
        success: true,
        data: domains,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateUserPreferredDomains(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { domainSlugs } = req.body

      if (!Array.isArray(domainSlugs)) {
        return res.status(400).json({
          success: false,
          message: 'domainSlugs must be an array',
        })
      }

      await domainService.updateUserPreferredDomains(userId, domainSlugs)

      res.json({
        success: true,
        message: 'Preferred domains updated successfully',
      })
    } catch (error) {
      next(error)
    }
  }
}

export const domainController = new DomainController()
