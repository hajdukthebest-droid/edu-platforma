import { Router } from 'express'
import { bundleController } from '../controllers/bundleController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// ========================
// PUBLIC BUNDLE ROUTES
// ========================
router.get('/bundles', bundleController.getBundles)
router.get('/bundles/:id', bundleController.getBundleById)
router.get('/bundles/slug/:slug', bundleController.getBundleBySlug)

// ========================
// AUTHENTICATED ROUTES
// ========================
router.use(authenticate)

// User routes
router.get('/bundles/:id/ownership', bundleController.checkBundleOwnership)
router.post('/promo-codes/validate', bundleController.validatePromoCode)
router.get('/promo-codes/my-usage', bundleController.getUserPromoUsage)

// ========================
// ADMIN ROUTES
// ========================

// Bundle management
router.post(
  '/bundles',
  authorize('ADMIN', 'SUPER_ADMIN'),
  bundleController.createBundle
)
router.put(
  '/bundles/:id',
  authorize('ADMIN', 'SUPER_ADMIN'),
  bundleController.updateBundle
)
router.delete(
  '/bundles/:id',
  authorize('ADMIN', 'SUPER_ADMIN'),
  bundleController.deleteBundle
)

// Promo code management
router.post(
  '/promo-codes',
  authorize('ADMIN', 'SUPER_ADMIN'),
  bundleController.createPromoCode
)
router.get(
  '/promo-codes',
  authorize('ADMIN', 'SUPER_ADMIN'),
  bundleController.getPromoCodes
)
router.get(
  '/promo-codes/:id',
  authorize('ADMIN', 'SUPER_ADMIN'),
  bundleController.getPromoCodeById
)
router.put(
  '/promo-codes/:id',
  authorize('ADMIN', 'SUPER_ADMIN'),
  bundleController.updatePromoCode
)
router.delete(
  '/promo-codes/:id',
  authorize('ADMIN', 'SUPER_ADMIN'),
  bundleController.deletePromoCode
)
router.get(
  '/promo-codes/:id/analytics',
  authorize('ADMIN', 'SUPER_ADMIN'),
  bundleController.getPromoCodeAnalytics
)

export default router
