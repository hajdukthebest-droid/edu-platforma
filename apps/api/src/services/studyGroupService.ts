import { PrismaClient, StudyGroupRole } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

interface CreateGroupData {
  name: string
  description?: string
  avatar?: string
  isPrivate?: boolean
  maxMembers?: number
  courseId?: string
  createdById: string
}

interface CreateMessageData {
  groupId: string
  userId: string
  content: string
  attachments?: string[]
  replyToId?: string
}

interface CreateResourceData {
  groupId: string
  userId: string
  title: string
  description?: string
  type: string
  url?: string
  content?: string
}

interface CreateSessionData {
  groupId: string
  createdById: string
  title: string
  description?: string
  scheduledAt: Date
  duration: number
  meetingUrl?: string
}

class StudyGroupService {
  /**
   * Create a new study group
   */
  async createGroup(data: CreateGroupData) {
    const group = await prisma.studyGroup.create({
      data: {
        name: data.name,
        description: data.description,
        avatar: data.avatar,
        isPrivate: data.isPrivate ?? true,
        maxMembers: data.maxMembers ?? 50,
        courseId: data.courseId,
        createdById: data.createdById,
        // Auto-add creator as admin
        members: {
          create: {
            userId: data.createdById,
            role: 'ADMIN',
          },
        },
      },
      include: {
        createdBy: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true },
            },
          },
        },
        _count: {
          select: { members: true, messages: true, resources: true },
        },
      },
    })

    return group
  }

  /**
   * Get all groups for a user
   */
  async getUserGroups(userId: string) {
    const memberships = await prisma.studyGroupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            createdBy: {
              select: { id: true, email: true, firstName: true, lastName: true },
            },
            _count: {
              select: { members: true, messages: true, resources: true },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    })

    return memberships.map((m) => ({
      ...m.group,
      role: m.role,
      joinedAt: m.joinedAt,
    }))
  }

  /**
   * Get group by ID
   */
  async getGroupById(groupId: string, userId?: string) {
    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: {
        createdBy: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        course: {
          select: { id: true, title: true, slug: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        _count: {
          select: { members: true, messages: true, resources: true, sessions: true },
        },
      },
    })

    if (!group) {
      throw new Error('Group not found')
    }

    // Check membership if userId provided
    let userRole = null
    if (userId) {
      const membership = group.members.find((m) => m.userId === userId)
      userRole = membership?.role || null
    }

    return { ...group, userRole }
  }

  /**
   * Update group
   */
  async updateGroup(groupId: string, userId: string, data: Partial<CreateGroupData>) {
    // Check if user is admin
    await this.checkPermission(groupId, userId, ['ADMIN'])

    const group = await prisma.studyGroup.update({
      where: { id: groupId },
      data: {
        name: data.name,
        description: data.description,
        avatar: data.avatar,
        isPrivate: data.isPrivate,
        maxMembers: data.maxMembers,
      },
    })

    return group
  }

  /**
   * Delete group
   */
  async deleteGroup(groupId: string, userId: string) {
    await this.checkPermission(groupId, userId, ['ADMIN'])

    await prisma.studyGroup.delete({
      where: { id: groupId },
    })

    return { success: true }
  }

  /**
   * Add member to group
   */
  async addMember(groupId: string, userId: string, role: StudyGroupRole = 'MEMBER') {
    // Check max members
    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: { _count: { select: { members: true } } },
    })

    if (!group) {
      throw new Error('Group not found')
    }

    if (group._count.members >= group.maxMembers) {
      throw new Error('Group has reached maximum members')
    }

    const member = await prisma.studyGroupMember.create({
      data: {
        groupId,
        userId,
        role,
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    })

    return member
  }

  /**
   * Remove member from group
   */
  async removeMember(groupId: string, memberId: string, requesterId: string) {
    // Check if requester has permission
    const requesterMembership = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId: requesterId } },
    })

    if (!requesterMembership || (requesterMembership.role !== 'ADMIN' && requesterMembership.role !== 'MODERATOR')) {
      // Users can remove themselves
      if (memberId !== requesterId) {
        throw new Error('No permission to remove members')
      }
    }

    // Prevent removing the last admin
    if (memberId === requesterId) {
      const adminCount = await prisma.studyGroupMember.count({
        where: { groupId, role: 'ADMIN' },
      })
      if (adminCount <= 1) {
        throw new Error('Cannot remove the last admin')
      }
    }

    await prisma.studyGroupMember.delete({
      where: { groupId_userId: { groupId, userId: memberId } },
    })

    return { success: true }
  }

  /**
   * Update member role
   */
  async updateMemberRole(groupId: string, memberId: string, role: StudyGroupRole, requesterId: string) {
    await this.checkPermission(groupId, requesterId, ['ADMIN'])

    const member = await prisma.studyGroupMember.update({
      where: { groupId_userId: { groupId, userId: memberId } },
      data: { role },
    })

    return member
  }

  /**
   * Create invite link
   */
  async createInvite(groupId: string, userId: string, email?: string, expiresInDays: number = 7) {
    await this.checkPermission(groupId, userId, ['ADMIN', 'MODERATOR'])

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    const invite = await prisma.studyGroupInvite.create({
      data: {
        groupId,
        invitedById: userId,
        email,
        token,
        expiresAt,
      },
    })

    return invite
  }

  /**
   * Accept invite
   */
  async acceptInvite(token: string, userId: string) {
    const invite = await prisma.studyGroupInvite.findUnique({
      where: { token },
      include: { group: true },
    })

    if (!invite) {
      throw new Error('Invalid invite')
    }

    if (invite.expiresAt < new Date()) {
      throw new Error('Invite has expired')
    }

    if (invite.usedAt) {
      throw new Error('Invite has already been used')
    }

    // Check if already a member
    const existingMembership = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId: invite.groupId, userId } },
    })

    if (existingMembership) {
      throw new Error('Already a member of this group')
    }

    // Add member and mark invite as used
    await prisma.$transaction([
      prisma.studyGroupMember.create({
        data: {
          groupId: invite.groupId,
          userId,
          role: 'MEMBER',
        },
      }),
      prisma.studyGroupInvite.update({
        where: { id: invite.id },
        data: {
          usedAt: new Date(),
          usedById: userId,
        },
      }),
    ])

    return invite.group
  }

  /**
   * Send message
   */
  async sendMessage(data: CreateMessageData) {
    // Check membership
    await this.checkMembership(data.groupId, data.userId)

    const message = await prisma.studyGroupMessage.create({
      data: {
        groupId: data.groupId,
        userId: data.userId,
        content: data.content,
        attachments: data.attachments || [],
        replyToId: data.replyToId,
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        replyTo: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    })

    return message
  }

  /**
   * Get messages
   */
  async getMessages(groupId: string, userId: string, limit: number = 50, before?: string) {
    await this.checkMembership(groupId, userId)

    const messages = await prisma.studyGroupMessage.findMany({
      where: {
        groupId,
        ...(before && { createdAt: { lt: new Date(before) } }),
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        replyTo: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return messages.reverse()
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string, userId: string) {
    const message = await prisma.studyGroupMessage.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      throw new Error('Message not found')
    }

    // Check if user is author or has permission
    if (message.userId !== userId) {
      await this.checkPermission(message.groupId, userId, ['ADMIN', 'MODERATOR'])
    }

    await prisma.studyGroupMessage.delete({
      where: { id: messageId },
    })

    return { success: true }
  }

  /**
   * Add resource
   */
  async addResource(data: CreateResourceData) {
    await this.checkMembership(data.groupId, data.userId)

    const resource = await prisma.studyGroupResource.create({
      data: {
        groupId: data.groupId,
        userId: data.userId,
        title: data.title,
        description: data.description,
        type: data.type,
        url: data.url,
        content: data.content,
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    })

    return resource
  }

  /**
   * Get resources
   */
  async getResources(groupId: string, userId: string) {
    await this.checkMembership(groupId, userId)

    const resources = await prisma.studyGroupResource.findMany({
      where: { groupId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return resources
  }

  /**
   * Delete resource
   */
  async deleteResource(resourceId: string, userId: string) {
    const resource = await prisma.studyGroupResource.findUnique({
      where: { id: resourceId },
    })

    if (!resource) {
      throw new Error('Resource not found')
    }

    if (resource.userId !== userId) {
      await this.checkPermission(resource.groupId, userId, ['ADMIN', 'MODERATOR'])
    }

    await prisma.studyGroupResource.delete({
      where: { id: resourceId },
    })

    return { success: true }
  }

  /**
   * Schedule study session
   */
  async scheduleSession(data: CreateSessionData) {
    await this.checkMembership(data.groupId, data.createdById)

    const session = await prisma.studySession.create({
      data: {
        groupId: data.groupId,
        createdById: data.createdById,
        title: data.title,
        description: data.description,
        scheduledAt: data.scheduledAt,
        duration: data.duration,
        meetingUrl: data.meetingUrl,
      },
      include: {
        createdBy: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    })

    return session
  }

  /**
   * Get upcoming sessions
   */
  async getSessions(groupId: string, userId: string) {
    await this.checkMembership(groupId, userId)

    const sessions = await prisma.studySession.findMany({
      where: { groupId },
      include: {
        createdBy: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    })

    return sessions
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string, userId: string) {
    const session = await prisma.studySession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new Error('Session not found')
    }

    if (session.createdById !== userId) {
      await this.checkPermission(session.groupId, userId, ['ADMIN', 'MODERATOR'])
    }

    await prisma.studySession.delete({
      where: { id: sessionId },
    })

    return { success: true }
  }

  /**
   * Check if user is a member
   */
  private async checkMembership(groupId: string, userId: string) {
    const membership = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    })

    if (!membership) {
      throw new Error('Not a member of this group')
    }

    return membership
  }

  /**
   * Check if user has required permission
   */
  private async checkPermission(groupId: string, userId: string, roles: StudyGroupRole[]) {
    const membership = await this.checkMembership(groupId, userId)

    if (!roles.includes(membership.role)) {
      throw new Error('Insufficient permissions')
    }

    return membership
  }
}

export default new StudyGroupService()
