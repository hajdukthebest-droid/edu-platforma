import { Router } from 'express'
import aiController from '../controllers/aiController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All AI routes require authentication
router.use(authenticate)

// ===== RECOMMENDATIONS =====
router.get('/recommendations/personalized', aiController.getPersonalizedRecommendations)
router.get('/recommendations/courses/:courseId/similar', aiController.getSimilarCourses)
router.get('/recommendations/next-course', aiController.predictNextCourse)

// ===== SUMMARIZATION =====
router.get('/summary/course/:courseId', aiController.getCourseOverview)
router.get('/summary/module/:moduleId', aiController.getModuleSummary)
router.get('/summary/user/learning', aiController.getUserLearningSummary)

// ===== LEARNING ANALYTICS =====
router.get('/analytics/completion/:courseId', aiController.predictCompletionProbability)
router.get('/analytics/assessment/:quizId', aiController.predictAssessmentPerformance)
router.get('/analytics/patterns', aiController.getLearningPatterns)
router.get('/analytics/retention/:courseId', aiController.getRetentionScore)
router.get('/analytics/profile', aiController.getLearnerProfile)

// ===== ADAPTIVE LEARNING =====
router.get('/adaptive/path/:courseId', aiController.getAdaptivePath)
router.get('/adaptive/difficulty/:categoryId', aiController.suggestDifficultyLevel)
router.get('/adaptive/review-schedule/:courseId', aiController.getReviewSchedule)
router.get('/adaptive/pathway/:categoryId', aiController.getLearningPathway)

export default router
