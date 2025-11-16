import { Router } from 'express'
import { forumController } from '../controllers/forumController'
import { authenticate } from '../middleware/auth'

const router = Router()

// Public routes
router.get('/categories', forumController.getCategories.bind(forumController))
router.get('/posts', forumController.getPosts.bind(forumController))
router.get('/posts/:id', forumController.getPostById.bind(forumController))

// Protected routes
router.use(authenticate)

router.post('/posts', forumController.createPost.bind(forumController))
router.put('/posts/:id', forumController.updatePost.bind(forumController))
router.delete('/posts/:id', forumController.deletePost.bind(forumController))
router.post('/posts/:postId/comments', forumController.createComment.bind(forumController))
router.post('/posts/:id/upvote', forumController.upvotePost.bind(forumController))
router.post('/comments/:commentId/upvote', forumController.upvoteComment.bind(forumController))

export default router
