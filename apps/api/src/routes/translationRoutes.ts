import { Router } from 'express'
import translationController from '../controllers/translationController'
import { authenticate } from '../middleware/auth'

const router = Router()

// Public routes - anyone can view translated content
/**
 * @route   GET /api/translations/course/:courseId/:locale
 * @desc    Get course with translations applied
 * @access  Public
 */
router.get('/course/:courseId/:locale', translationController.getCourseWithTranslation)

/**
 * @route   GET /api/translations/status/:courseId
 * @desc    Get translation completion status for a course
 * @access  Public
 */
router.get('/status/:courseId', translationController.getTranslationStatus)

/**
 * @route   GET /api/translations/check/:type/:id/:locale
 * @desc    Check if translation exists
 * @access  Public
 */
router.get('/check/:type/:id/:locale', translationController.checkTranslationExists)

// Protected routes - require authentication (instructor/admin only)
router.use(authenticate)

/**
 * @route   POST /api/translations/course
 * @desc    Create or update course translation
 * @access  Private (Instructor/Admin)
 */
router.post('/course', translationController.upsertCourseTranslation)

/**
 * @route   POST /api/translations/module
 * @desc    Create or update module translation
 * @access  Private (Instructor/Admin)
 */
router.post('/module', translationController.upsertModuleTranslation)

/**
 * @route   POST /api/translations/lesson
 * @desc    Create or update lesson translation
 * @access  Private (Instructor/Admin)
 */
router.post('/lesson', translationController.upsertLessonTranslation)

/**
 * @route   DELETE /api/translations/course/:courseId/:locale
 * @desc    Delete course translation
 * @access  Private (Instructor/Admin)
 */
router.delete('/course/:courseId/:locale', translationController.deleteCourseTranslation)

/**
 * @route   DELETE /api/translations/module/:moduleId/:locale
 * @desc    Delete module translation
 * @access  Private (Instructor/Admin)
 */
router.delete('/module/:moduleId/:locale', translationController.deleteModuleTranslation)

/**
 * @route   DELETE /api/translations/lesson/:lessonId/:locale
 * @desc    Delete lesson translation
 * @access  Private (Instructor/Admin)
 */
router.delete('/lesson/:lessonId/:locale', translationController.deleteLessonTranslation)

export default router
