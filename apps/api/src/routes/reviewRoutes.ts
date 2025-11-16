import { Router } from 'express'
import { reviewController } from '../controllers/reviewController'
import { authenticate } from '../middleware/auth'

const router = Router()

// Public routes
router.get('/courses/:courseId/reviews', reviewController.getCourseReviews.bind(reviewController))
router.get('/courses/:courseId/rating-stats', reviewController.getCourseRatingStats.bind(reviewController))

// Protected routes
router.use(authenticate)

router.post('/courses/:courseId/reviews', reviewController.createReview.bind(reviewController))
router.get('/courses/:courseId/my-review', reviewController.getUserReview.bind(reviewController))
router.put('/reviews/:id', reviewController.updateReview.bind(reviewController))
router.delete('/reviews/:id', reviewController.deleteReview.bind(reviewController))

export default router
