import { Router } from 'express'
import { certificateController } from '../controllers/certificateController'
import { authenticate } from '../middleware/auth'

const router = Router()

// Public route
router.get(
  '/verify/:certificateNumber',
  certificateController.verifyCertificate.bind(certificateController)
)

// Protected routes
router.use(authenticate)

router.post(
  '/course/:courseId/issue',
  certificateController.issueCertificate.bind(certificateController)
)
router.get('/', certificateController.getUserCertificates.bind(certificateController))
router.get('/:id', certificateController.getCertificate.bind(certificateController))
router.post(
  '/:id/generate-pdf',
  certificateController.generatePDF.bind(certificateController)
)
router.get('/:id/pdf', certificateController.downloadPDF.bind(certificateController))

export default router
