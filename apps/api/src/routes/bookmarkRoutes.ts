import { Router } from 'express'
import { bookmarkController } from '../controllers/bookmarkController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Bookmark routes
router.post('/bookmarks', bookmarkController.createBookmark)
router.get('/bookmarks', bookmarkController.getUserBookmarks)
router.get('/bookmarks/:bookmarkId', bookmarkController.getBookmarkById)
router.put('/bookmarks/:bookmarkId', bookmarkController.updateBookmark)
router.delete('/bookmarks/:bookmarkId', bookmarkController.deleteBookmark)

// Check if lesson is bookmarked
router.get('/lessons/:lessonId/bookmark', bookmarkController.checkBookmark)

export default router
