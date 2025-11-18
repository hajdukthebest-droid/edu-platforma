import { Request, Response } from 'express'
import studyGroupService from '../services/studyGroupService'

class StudyGroupController {
  // Group management
  async createGroup(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { name, description, avatar, isPrivate, maxMembers, courseId } = req.body

      if (!name) {
        return res.status(400).json({ message: 'Name is required' })
      }

      const group = await studyGroupService.createGroup({
        name, description, avatar, isPrivate, maxMembers, courseId, createdById: userId,
      })

      res.status(201).json({ success: true, data: group })
    } catch (error: any) {
      console.error('Error creating group:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getUserGroups(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const groups = await studyGroupService.getUserGroups(userId)
      res.json({ success: true, data: groups })
    } catch (error) {
      console.error('Error getting groups:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getGroup(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user?.id
      const group = await studyGroupService.getGroupById(id, userId)
      res.json({ success: true, data: group })
    } catch (error: any) {
      if (error.message === 'Group not found') {
        return res.status(404).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async updateGroup(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id
      const group = await studyGroupService.updateGroup(id, userId, req.body)
      res.json({ success: true, data: group })
    } catch (error: any) {
      if (error.message.includes('permission') || error.message === 'Not a member') {
        return res.status(403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async deleteGroup(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id
      await studyGroupService.deleteGroup(id, userId)
      res.json({ success: true, message: 'Group deleted' })
    } catch (error: any) {
      if (error.message.includes('permission')) {
        return res.status(403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Members
  async removeMember(req: Request, res: Response) {
    try {
      const { id: groupId, memberId } = req.params
      const userId = (req as any).user.id
      await studyGroupService.removeMember(groupId, memberId, userId)
      res.json({ success: true, message: 'Member removed' })
    } catch (error: any) {
      if (error.message.includes('permission') || error.message.includes('last admin')) {
        return res.status(403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async updateMemberRole(req: Request, res: Response) {
    try {
      const { id: groupId, memberId } = req.params
      const { role } = req.body
      const userId = (req as any).user.id
      const member = await studyGroupService.updateMemberRole(groupId, memberId, role, userId)
      res.json({ success: true, data: member })
    } catch (error: any) {
      if (error.message.includes('permission')) {
        return res.status(403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Invites
  async createInvite(req: Request, res: Response) {
    try {
      const { id: groupId } = req.params
      const { email, expiresInDays } = req.body
      const userId = (req as any).user.id
      const invite = await studyGroupService.createInvite(groupId, userId, email, expiresInDays)
      res.status(201).json({ success: true, data: invite })
    } catch (error: any) {
      if (error.message.includes('permission')) {
        return res.status(403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async acceptInvite(req: Request, res: Response) {
    try {
      const { token } = req.params
      const userId = (req as any).user.id
      const group = await studyGroupService.acceptInvite(token, userId)
      res.json({ success: true, data: group, message: 'Joined group successfully' })
    } catch (error: any) {
      if (error.message.includes('Invalid') || error.message.includes('expired') || error.message.includes('already')) {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Messages
  async sendMessage(req: Request, res: Response) {
    try {
      const { id: groupId } = req.params
      const { content, attachments, replyToId } = req.body
      const userId = (req as any).user.id

      if (!content) {
        return res.status(400).json({ message: 'Content is required' })
      }

      const message = await studyGroupService.sendMessage({
        groupId, userId, content, attachments, replyToId,
      })
      res.status(201).json({ success: true, data: message })
    } catch (error: any) {
      if (error.message === 'Not a member of this group') {
        return res.status(403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getMessages(req: Request, res: Response) {
    try {
      const { id: groupId } = req.params
      const { limit, before } = req.query
      const userId = (req as any).user.id
      const messages = await studyGroupService.getMessages(
        groupId, userId, limit ? parseInt(limit as string) : 50, before as string
      )
      res.json({ success: true, data: messages })
    } catch (error: any) {
      if (error.message === 'Not a member of this group') {
        return res.status(403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async deleteMessage(req: Request, res: Response) {
    try {
      const { messageId } = req.params
      const userId = (req as any).user.id
      await studyGroupService.deleteMessage(messageId, userId)
      res.json({ success: true, message: 'Message deleted' })
    } catch (error: any) {
      if (error.message.includes('permission') || error.message === 'Message not found') {
        return res.status(error.message === 'Message not found' ? 404 : 403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Resources
  async addResource(req: Request, res: Response) {
    try {
      const { id: groupId } = req.params
      const { title, description, type, url, content } = req.body
      const userId = (req as any).user.id

      if (!title || !type) {
        return res.status(400).json({ message: 'Title and type are required' })
      }

      const resource = await studyGroupService.addResource({
        groupId, userId, title, description, type, url, content,
      })
      res.status(201).json({ success: true, data: resource })
    } catch (error: any) {
      if (error.message === 'Not a member of this group') {
        return res.status(403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getResources(req: Request, res: Response) {
    try {
      const { id: groupId } = req.params
      const userId = (req as any).user.id
      const resources = await studyGroupService.getResources(groupId, userId)
      res.json({ success: true, data: resources })
    } catch (error: any) {
      if (error.message === 'Not a member of this group') {
        return res.status(403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async deleteResource(req: Request, res: Response) {
    try {
      const { resourceId } = req.params
      const userId = (req as any).user.id
      await studyGroupService.deleteResource(resourceId, userId)
      res.json({ success: true, message: 'Resource deleted' })
    } catch (error: any) {
      if (error.message.includes('permission') || error.message === 'Resource not found') {
        return res.status(error.message === 'Resource not found' ? 404 : 403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Sessions
  async scheduleSession(req: Request, res: Response) {
    try {
      const { id: groupId } = req.params
      const { title, description, scheduledAt, duration, meetingUrl } = req.body
      const userId = (req as any).user.id

      if (!title || !scheduledAt || !duration) {
        return res.status(400).json({ message: 'Title, scheduledAt, and duration are required' })
      }

      const session = await studyGroupService.scheduleSession({
        groupId, createdById: userId, title, description,
        scheduledAt: new Date(scheduledAt), duration, meetingUrl,
      })
      res.status(201).json({ success: true, data: session })
    } catch (error: any) {
      if (error.message === 'Not a member of this group') {
        return res.status(403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getSessions(req: Request, res: Response) {
    try {
      const { id: groupId } = req.params
      const userId = (req as any).user.id
      const sessions = await studyGroupService.getSessions(groupId, userId)
      res.json({ success: true, data: sessions })
    } catch (error: any) {
      if (error.message === 'Not a member of this group') {
        return res.status(403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async deleteSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params
      const userId = (req as any).user.id
      await studyGroupService.deleteSession(sessionId, userId)
      res.json({ success: true, message: 'Session deleted' })
    } catch (error: any) {
      if (error.message.includes('permission') || error.message === 'Session not found') {
        return res.status(error.message === 'Session not found' ? 404 : 403).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new StudyGroupController()
