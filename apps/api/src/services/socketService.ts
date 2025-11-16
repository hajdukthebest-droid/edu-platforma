import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { prisma } from '@edu-platforma/database'

export interface AuthenticatedSocket extends Socket {
  userId?: string
}

export class SocketService {
  private io: Server | null = null
  private userSockets: Map<string, Set<string>> = new Map() // userId -> socketIds

  initialize(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: env.CORS_ORIGIN,
        credentials: true,
      },
      path: '/socket.io',
    })

    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token
        if (!token) {
          return next(new Error('Authentication required'))
        }

        const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string }
        socket.userId = decoded.userId

        // Verify user exists
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        })

        if (!user) {
          return next(new Error('User not found'))
        }

        next()
      } catch (error) {
        next(new Error('Invalid token'))
      }
    })

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket)
    })

    console.log('✅ Socket.IO initialized')
  }

  private handleConnection(socket: AuthenticatedSocket) {
    const userId = socket.userId!
    console.log(`🔌 User connected: ${userId} (${socket.id})`)

    // Track user socket
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set())
    }
    this.userSockets.get(userId)!.add(socket.id)

    // Join user's personal room
    socket.join(`user:${userId}`)

    // Join all conversation rooms for this user
    this.joinUserConversations(socket, userId)

    // Handle messaging events
    socket.on('message:send', (data) => this.handleMessageSend(socket, data))
    socket.on('message:typing', (data) => this.handleTyping(socket, data))
    socket.on('conversation:join', (data) => this.handleJoinConversation(socket, data))
    socket.on('conversation:read', (data) => this.handleMarkAsRead(socket, data))

    // Handle notifications
    socket.on('notification:read', (data) => this.handleNotificationRead(socket, data))
    socket.on('notification:read-all', () => this.handleNotificationReadAll(socket))

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${userId} (${socket.id})`)
      const userSocketSet = this.userSockets.get(userId)
      if (userSocketSet) {
        userSocketSet.delete(socket.id)
        if (userSocketSet.size === 0) {
          this.userSockets.delete(userId)
        }
      }
    })
  }

  private async joinUserConversations(socket: AuthenticatedSocket, userId: string) {
    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { participant1Id: userId },
            { participant2Id: userId },
          ],
        },
        select: { id: true },
      })

      conversations.forEach((conv) => {
        socket.join(`conversation:${conv.id}`)
      })
    } catch (error) {
      console.error('Error joining user conversations:', error)
    }
  }

  private async handleMessageSend(socket: AuthenticatedSocket, data: any) {
    const userId = socket.userId!
    const { conversationId, content } = data

    try {
      // Verify user is participant
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { participant1Id: userId },
            { participant2Id: userId },
          ],
        },
        include: {
          participant1: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          participant2: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      })

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found or access denied' })
        return
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          content,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      })

      // Update conversation
      const otherUserId =
        conversation.participant1Id === userId
          ? conversation.participant2Id
          : conversation.participant1Id

      const unreadField =
        conversation.participant1Id === otherUserId
          ? 'participant1Unread'
          : 'participant2Unread'

      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          lastMessageText: content,
          [unreadField]: { increment: 1 },
        },
      })

      // Emit to conversation room
      this.io!.to(`conversation:${conversationId}`).emit('message:new', message)

      // Send notification to other user
      const otherUser =
        conversation.participant1Id === otherUserId
          ? conversation.participant1
          : conversation.participant2

      this.io!.to(`user:${otherUserId}`).emit('notification:new', {
        type: 'NEW_MESSAGE',
        message: `Novi poruka od ${message.sender.firstName} ${message.sender.lastName}`,
        data: {
          conversationId,
          message,
        },
      })
    } catch (error) {
      console.error('Error sending message:', error)
      socket.emit('error', { message: 'Failed to send message' })
    }
  }

  private async handleTyping(socket: AuthenticatedSocket, data: any) {
    const userId = socket.userId!
    const { conversationId, isTyping } = data

    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { participant1Id: userId },
            { participant2Id: userId },
          ],
        },
      })

      if (!conversation) return

      const otherUserId =
        conversation.participant1Id === userId
          ? conversation.participant2Id
          : conversation.participant1Id

      // Emit typing status to other user
      this.io!.to(`user:${otherUserId}`).emit('message:typing', {
        conversationId,
        userId,
        isTyping,
      })
    } catch (error) {
      console.error('Error handling typing:', error)
    }
  }

  private async handleJoinConversation(socket: AuthenticatedSocket, data: any) {
    const userId = socket.userId!
    const { conversationId } = data

    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { participant1Id: userId },
            { participant2Id: userId },
          ],
        },
      })

      if (conversation) {
        socket.join(`conversation:${conversationId}`)
      }
    } catch (error) {
      console.error('Error joining conversation:', error)
    }
  }

  private async handleMarkAsRead(socket: AuthenticatedSocket, data: any) {
    const userId = socket.userId!
    const { conversationId } = data

    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { participant1Id: userId },
            { participant2Id: userId },
          ],
        },
      })

      if (!conversation) return

      const unreadField =
        conversation.participant1Id === userId
          ? 'participant1Unread'
          : 'participant2Unread'

      // Update conversation
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          [unreadField]: 0,
        },
      })

      // Mark all messages as read
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
          isRead: false,
        },
        data: {
          isRead: true,
        },
      })

      // Notify the conversation room
      this.io!.to(`conversation:${conversationId}`).emit('conversation:read', {
        conversationId,
        userId,
      })
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  private async handleNotificationRead(socket: AuthenticatedSocket, data: any) {
    const userId = socket.userId!
    const { notificationId } = data

    try {
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })

      socket.emit('notification:updated', { notificationId })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  private async handleNotificationReadAll(socket: AuthenticatedSocket) {
    const userId = socket.userId!

    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })

      socket.emit('notification:all-read')
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Public methods to emit events from services
  emitToUser(userId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data)
    }
  }

  emitToConversation(conversationId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`conversation:${conversationId}`).emit(event, data)
    }
  }

  getIO() {
    return this.io
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0
  }

  getUserSocketCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0
  }
}

export const socketService = new SocketService()
