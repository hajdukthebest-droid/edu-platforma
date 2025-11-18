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

      const pdfPath = await certificateService.downloadCertificatePDF(
        req.params.id,
        req.user.id
      )

      // Send PDF file as download
      res.download(pdfPath, `certificate-${req.params.id}.pdf`, (err) => {
        if (err) {
          next(err)
        }
      })
    } catch (error) {
      next(error)
    }
  }

  async generatePDF(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      await certificateService.generatePDF(req.params.id, req.user.id)

      res.json({
        status: 'success',
        message: 'Certificate PDF generated successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  async getPublicCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const certificate = await certificateService.getPublicCertificate(
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

  async getShareUrls(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const shareUrls = await certificateService.generateShareUrls(
        req.params.id,
        req.user.id
      )

      res.json({
        status: 'success',
        data: shareUrls,
      })
    } catch (error) {
      next(error)
    }
  }

  async trackShare(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { platform } = req.body

      await certificateService.trackShare(req.params.id, platform)

      res.json({
        status: 'success',
        message: 'Share tracked',
      })
    } catch (error) {
      next(error)
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const stats = await certificateService.getCertificateStats(req.user.id)

      res.json({
        status: 'success',
        data: stats,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const certificateController = new CertificateController()
