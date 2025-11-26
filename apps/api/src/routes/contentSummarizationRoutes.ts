import { Router } from 'express'
import contentSummarizationController from '../controllers/contentSummarizationController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticate)

/**
 * @route   POST /api/summarize/text
 * @desc    Generate summary from provided text
 * @access  Private
 */
router.post('/text', contentSummarizationController.summarizeText)

/**
 * @route   POST /api/summarize/keywords
 * @desc    Extract keywords from provided text
 * @access  Private
 */
router.post('/keywords', contentSummarizationController.extractKeywords)

/**
 * @route   GET /api/summarize/course/:courseId
 * @desc    Generate comprehensive course overview summary
 * @access  Private
 */
router.get('/course/:courseId', contentSummarizationController.getCourseOverview)

/**
 * @route   GET /api/summarize/module/:moduleId
 * @desc    Generate module summary with lesson breakdown
 * @access  Private
 */
router.get('/module/:moduleId', contentSummarizationController.getModuleSummary)

/**
 * @route   GET /api/summarize/user-learning
 * @desc    Generate user's learning progress summary
 * @access  Private
 */
router.get('/user-learning', contentSummarizationController.getUserLearningSummary)

export default router
