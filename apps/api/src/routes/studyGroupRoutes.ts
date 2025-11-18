import { Router } from 'express'
import studyGroupController from '../controllers/studyGroupController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All study group routes require authentication
router.use(authenticate)

// Group management
router.post('/', studyGroupController.createGroup)
router.get('/', studyGroupController.getUserGroups)
router.get('/:id', studyGroupController.getGroup)
router.put('/:id', studyGroupController.updateGroup)
router.delete('/:id', studyGroupController.deleteGroup)

// Members
router.delete('/:id/members/:memberId', studyGroupController.removeMember)
router.put('/:id/members/:memberId/role', studyGroupController.updateMemberRole)

// Invites
router.post('/:id/invites', studyGroupController.createInvite)
router.post('/invites/:token/accept', studyGroupController.acceptInvite)

// Messages
router.post('/:id/messages', studyGroupController.sendMessage)
router.get('/:id/messages', studyGroupController.getMessages)
router.delete('/messages/:messageId', studyGroupController.deleteMessage)

// Resources
router.post('/:id/resources', studyGroupController.addResource)
router.get('/:id/resources', studyGroupController.getResources)
router.delete('/resources/:resourceId', studyGroupController.deleteResource)

// Sessions
router.post('/:id/sessions', studyGroupController.scheduleSession)
router.get('/:id/sessions', studyGroupController.getSessions)
router.delete('/sessions/:sessionId', studyGroupController.deleteSession)

export default router
