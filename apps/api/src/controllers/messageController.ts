import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { messageService } from '../services/messageService'

export class MessageController {
  async getConversations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const conversations = await messageService.getUserConversations(userId)

      res.json({
        success: true,
        data: conversations,
      })
    } catch (error) {
      next(error)
    }
  }

  async getOrCreateConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { otherUserId } = req.body

      const conversation = await messageService.getOrCreateConversation(userId, otherUserId)

      res.json({
        success: true,
        data: conversation,
      })
    } catch (error) {
      next(error)
    }
  }

  async getConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { conversationId } = req.params

      const conversation = await messageService.getConversation(conversationId, userId)

      res.json({
        success: true,
        data: conversation,
      })
    } catch (error) {
      next(error)
    }
  }

  async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { conversationId } = req.params
      const { page, limit } = req.query

      const result = await messageService.getMessages(
        conversationId,
        userId,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 50
      )

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { conversationId } = req.params
      const { content } = req.body

      const message = await messageService.sendMessage(conversationId, userId, content)

      res.status(201).json({
        success: true,
        data: message,
      })
    } catch (error) {
      next(error)
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { conversationId } = req.params

      await messageService.markAsRead(conversationId, userId)

      res.json({
        success: true,
        message: 'Messages marked as read',
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { conversationId } = req.params

      await messageService.deleteConversation(conversationId, userId)

      res.json({
        success: true,
        message: 'Conversation deleted',
      })
    } catch (error) {
      next(error)
    }
  }
}

export const messageController = new MessageController()
