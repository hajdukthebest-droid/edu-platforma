import { Router } from 'express'
import adaptiveLearningController from '../controllers/adaptiveLearningController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

/**
 * @route   GET /api/adaptive/path/:courseId
 * @desc    Get adaptive learning path for a course
 * @access  Private (Learner)
 */
router.get('/path/:courseId', adaptiveLearningController.getAdaptivePath)

/**
 * @route   GET /api/adaptive/difficulty/:categoryId
 * @desc    Get suggested difficulty level for a category
 * @access  Private (Learner)
 */
router.get('/difficulty/:categoryId', adaptiveLearningController.getSuggestedDifficulty)

/**
 * @route   GET /api/adaptive/review-schedule/:courseId
 * @desc    Get spaced repetition review schedule
 * @access  Private (Learner)
 */
router.get('/review-schedule/:courseId', adaptiveLearningController.getReviewSchedule)

/**
 * @route   GET /api/adaptive/learning-pathway/:categoryId
 * @desc    Get suggested learning pathway across multiple courses
 * @access  Private (Learner)
 */
router.get('/learning-pathway/:categoryId', adaptiveLearningController.getLearningPathway)

/**
 * @route   GET /api/adaptive/insights/:courseId
 * @desc    Get comprehensive learning insights for a course
 * @access  Private (Learner)
 */
router.get('/insights/:courseId', adaptiveLearningController.getLearningInsights)

export default router
