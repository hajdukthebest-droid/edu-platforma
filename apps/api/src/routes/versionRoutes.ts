import { Router } from 'express'
import versionController from '../controllers/versionController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All versioning endpoints require authentication
router.use(authenticate)

// Course version endpoints
router.get('/courses/:courseId/history', versionController.getCourseVersionHistory)
router.get('/courses/:courseId/versions/:version', versionController.getCourseVersion)
router.post('/courses/:courseId/versions', versionController.createCourseVersion)
router.post('/courses/:courseId/rollback/:version', versionController.rollbackCourse)
router.get('/courses/:courseId/compare', versionController.compareCourseVersions)

// Module version endpoints
router.get('/modules/:moduleId/history', versionController.getModuleVersionHistory)
router.get('/modules/:moduleId/versions/:version', versionController.getModuleVersion)
router.post('/modules/:moduleId/versions', versionController.createModuleVersion)
router.post('/modules/:moduleId/rollback/:version', versionController.rollbackModule)
router.get('/modules/:moduleId/compare', versionController.compareModuleVersions)

// Lesson version endpoints
router.get('/lessons/:lessonId/history', versionController.getLessonVersionHistory)
router.get('/lessons/:lessonId/versions/:version', versionController.getLessonVersion)
router.post('/lessons/:lessonId/versions', versionController.createLessonVersion)
router.post('/lessons/:lessonId/rollback/:version', versionController.rollbackLesson)
router.get('/lessons/:lessonId/compare', versionController.compareLessonVersions)

// Cleanup endpoint
router.delete('/cleanup/:entityType/:entityId', versionController.cleanupOldVersions)

export default router
