import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'

export class MessageService {
  /**
   * Get or create conversation between two users
   */
  async getOrCreateConversation(user1Id: string, user2Id: string) {
    // Ensure consistent ordering for participant IDs
    const [participant1Id, participant2Id] = [user1Id, user2Id].sort()

    // Try to find existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1Id, participant2Id },
          { participant1Id: participant2Id, participant2Id: participant1Id },
        ],
      },
      include: {
        participant1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            username: true,
          },
        },
        participant2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            username: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    })

    // Create if doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id,
          participant2Id,
        },
        include: {
          participant1: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              username: true,
            },
          },
          participant2: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              username: true,
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
      })
    }

    return conversation
  }

  /**
   * Get user's conversations
   */
  async getUserConversations(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: {
        participant1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            username: true,
          },
        },
        participant2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            username: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            isRead: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    })

    // Add unread count and other participant info
    const conversationsWithDetails = conversations.map((conv) => {
      const isParticipant1 = conv.participant1Id === userId
      const otherParticipant = isParticipant1 ? conv.participant2 : conv.participant1
      const unreadCount = isParticipant1 ? conv.participant1Unread : conv.participant2Unread
      const lastMessage = conv.messages[0] || null

      return {
        ...conv,
        otherParticipant,
        unreadCount,
        lastMessage,
      }
    })

    return conversationsWithDetails
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string, userId: string) {
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
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            username: true,
          },
        },
        participant2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            username: true,
          },
        },
      },
    })

    if (!conversation) {
      throw new AppError(404, 'Conversation not found')
    }

    return conversation
  }

  /**
   * Send message
   */
  async sendMessage(conversationId: string, senderId: string, content: string) {
    // Verify user is participant
    const conversation = await this.getConversation(conversationId, senderId)

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            username: true,
          },
        },
      },
    })

    // Update conversation
    const isParticipant1 = conversation.participant1Id === senderId
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessageText: content.substring(0, 100),
        ...(isParticipant1
          ? { participant2Unread: { increment: 1 } }
          : { participant1Unread: { increment: 1 } }),
      },
    })

    return message
  }

  /**
   * Get conversation messages
   */
  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    // Verify user is participant
    await this.getConversation(conversationId, userId)

    const skip = (page - 1) * limit

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.message.count({
        where: { conversationId },
      }),
    ])

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string, userId: string) {
    const conversation = await this.getConversation(conversationId, userId)

    // Mark all unread messages from other participant as read
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

    // Reset unread count
    const isParticipant1 = conversation.participant1Id === userId
    await prisma.conversation.update({
      where: { id: conversationId },
      data: isParticipant1
        ? { participant1Unread: 0 }
        : { participant2Unread: 0 },
    })
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: string, userId: string) {
    // Verify user is participant
    await this.getConversation(conversationId, userId)

    await prisma.conversation.delete({
      where: { id: conversationId },
    })
  }
}

export const messageService = new MessageService()
