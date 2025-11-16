import { Router } from 'express'
import { courseBuilderController } from '../controllers/courseBuilderController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Templates
router.get('/templates', courseBuilderController.getTemplates.bind(courseBuilderController))
router.get('/templates/:id', courseBuilderController.getTemplateById.bind(courseBuilderController))
router.post('/templates', courseBuilderController.createTemplate.bind(courseBuilderController))
router.delete('/templates/:id', courseBuilderController.deleteTemplate.bind(courseBuilderController))

// Module operations
router.post('/modules/reorder', courseBuilderController.reorderModules.bind(courseBuilderController))
router.post('/modules/:id/duplicate', courseBuilderController.duplicateModule.bind(courseBuilderController))
router.post('/modules/:id/move', courseBuilderController.moveModule.bind(courseBuilderController))

// Lesson operations
router.post('/lessons/reorder', courseBuilderController.reorderLessons.bind(courseBuilderController))
router.post('/lessons/:id/duplicate', courseBuilderController.duplicateLesson.bind(courseBuilderController))
router.post('/lessons/:id/move', courseBuilderController.moveLesson.bind(courseBuilderController))
router.post('/lessons/from-template', courseBuilderController.createLessonFromTemplate.bind(courseBuilderController))

// Bulk operations
router.get('/courses/:id/export', courseBuilderController.exportCourse.bind(courseBuilderController))

export default router
