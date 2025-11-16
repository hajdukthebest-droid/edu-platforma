import { Router } from 'express'
import { messageController } from '../controllers/messageController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Get all user's conversations
router.get('/conversations', messageController.getConversations)

// Get or create conversation with another user
router.post('/conversations', messageController.getOrCreateConversation)

// Get specific conversation
router.get('/conversations/:conversationId', messageController.getConversation)

// Get messages in conversation
router.get('/conversations/:conversationId/messages', messageController.getMessages)

// Send message
router.post('/conversations/:conversationId/messages', messageController.sendMessage)

// Mark conversation messages as read
router.post('/conversations/:conversationId/read', messageController.markAsRead)

// Delete conversation
router.delete('/conversations/:conversationId', messageController.deleteConversation)

export default router
