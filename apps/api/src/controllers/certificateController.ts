import { Request, Response, NextFunction } from 'express'
import { certificateService } from '../services/certificateService'
import { AuthRequest } from '../middleware/auth'

export class CertificateController {
  async issueCertificate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const certificate = await certificateService.issueCertificate(
        req.user.id,
        req.params.courseId
      )

      res.status(201).json({
        status: 'success',
        data: certificate,
      })
    } catch (error) {
      next(error)
    }
  }

  async getCertificate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const certificate = await certificateService.getCertificate(
        req.params.id,
        req.user.id
      )

      res.json({
        status: 'success',
        data: certificate,
      })
    } catch (error) {
      next(error)
    }
  }

  async getUserCertificates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const certificates = await certificateService.getUserCertificates(req.user.id)

      res.json({
        status: 'success',
        data: certificates,
      })
    } catch (error) {
      next(error)
    }
  }

  async verifyCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const certificate = await certificateService.verifyCertificate(
        req.params.certificateNumber
      )

      res.json({
        status: 'success',
        data: certificate,
      })
    } catch (error) {
      next(error)
    }
  }

  async downloadPDF(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const pdfData = await certificateService.generatePDF(req.params.id, req.user.id)

      res.json({
        status: 'success',
        data: pdfData,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const certificateController = new CertificateController()
