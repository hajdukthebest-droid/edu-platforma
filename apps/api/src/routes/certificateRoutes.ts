import { Router } from 'express'
import { certificateController } from '../controllers/certificateController'
import { authenticate } from '../middleware/auth'

const router = Router()

// Public routes
router.get(
  '/verify/:certificateNumber',
  certificateController.verifyCertificate.bind(certificateController)
)
router.get(
  '/public/:certificateNumber',
  certificateController.getPublicCertificate.bind(certificateController)
)

// Protected routes
router.use(authenticate)

router.post(
  '/course/:courseId/issue',
  certificateController.issueCertificate.bind(certificateController)
)
router.get('/stats', certificateController.getStats.bind(certificateController))
router.get('/', certificateController.getUserCertificates.bind(certificateController))
router.get('/:id', certificateController.getCertificate.bind(certificateController))
router.post(
  '/:id/generate-pdf',
  certificateController.generatePDF.bind(certificateController)
)
router.get('/:id/pdf', certificateController.downloadPDF.bind(certificateController))
router.get('/:id/share-urls', certificateController.getShareUrls.bind(certificateController))
router.post('/:id/track-share', certificateController.trackShare.bind(certificateController))

export default router
