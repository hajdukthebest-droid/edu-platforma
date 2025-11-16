import { Router } from 'express'
import { noteController } from '../controllers/noteController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Note routes
router.post('/notes', noteController.createNote)
router.get('/notes', noteController.getUserNotes)
router.get('/notes/:noteId', noteController.getNoteById)
router.put('/notes/:noteId', noteController.updateNote)
router.delete('/notes/:noteId', noteController.deleteNote)

// Lesson notes
router.get('/lessons/:lessonId/notes', noteController.getLessonNotes)

export default router
