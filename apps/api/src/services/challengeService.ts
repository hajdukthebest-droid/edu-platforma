import { PrismaClient, ChallengeType, ChallengeStatus, ChallengeGoalType } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================
// INTERFACES
// ============================================

interface CreateChallengeData {
  title: string
  description: string
  shortDescription?: string
  thumbnail?: string
  type: ChallengeType
  startDate: Date
  endDate: Date
  goalType: ChallengeGoalType
  goalTarget: number
  goalConfig?: Record<string, unknown>
  pointsReward?: number
  badgeId?: string
  otherRewards?: Record<string, unknown>
  maxParticipants?: number
  minLevel?: number
  courseId?: string
  isPublic?: boolean
  createdById: string
}

interface UpdateChallengeData {
  title?: string
  description?: string
  shortDescription?: string
  thumbnail?: string
  status?: ChallengeStatus
  startDate?: Date
  endDate?: Date
  goalTarget?: number
  pointsReward?: number
  badgeId?: string
  otherRewards?: Record<string, unknown>
  maxParticipants?: number
  minLevel?: number
  isPublic?: boolean
}

interface CreateTeamData {
  name: string
  description?: string
  avatar?: string
  isPublic?: boolean
  maxMembers?: number
  captainId: string
}

interface CreateTeamCompetitionData {
  title: string
  description: string
  startDate: Date
  endDate: Date
  goalType: ChallengeGoalType
  goalDescription?: string
  firstPlaceReward?: Record<string, unknown>
  secondPlaceReward?: Record<string, unknown>
  thirdPlaceReward?: Record<string, unknown>
  participationReward?: Record<string, unknown>
  minTeamSize?: number
  maxTeamSize?: number
  maxTeams?: number
}

// ============================================
// CHALLENGE SERVICE
// ============================================

class ChallengeService {
  // ============================================
  // CHALLENGE MANAGEMENT
  // ============================================

  /**
   * Create a new challenge
   */
  async createChallenge(data: CreateChallengeData) {
    const challenge = await prisma.challenge.create({
      data: {
        title: data.title,
        description: data.description,
        shortDescription: data.shortDescription,
        thumbnail: data.thumbnail,
        type: data.type,
        status: 'DRAFT',
        startDate: data.startDate,
        endDate: data.endDate,
        goalType: data.goalType,
        goalTarget: data.goalTarget,
        goalConfig: data.goalConfig ?? null,
        pointsReward: data.pointsReward ?? 100,
        badgeId: data.badgeId,
        otherRewards: data.otherRewards ?? null,
        maxParticipants: data.maxParticipants,
        minLevel: data.minLevel,
        courseId: data.courseId,
        isPublic: data.isPublic ?? true,
        createdById: data.createdById,
      },
    })

    return challenge
  }

  /**
   * Update a challenge
   */
  async updateChallenge(challengeId: string, data: UpdateChallengeData) {
    return prisma.challenge.update({
      where: { id: challengeId },
      data: {
        title: data.title,
        description: data.description,
        shortDescription: data.shortDescription,
        thumbnail: data.thumbnail,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        goalTarget: data.goalTarget,
        pointsReward: data.pointsReward,
        badgeId: data.badgeId,
        otherRewards: data.otherRewards ?? undefined,
        maxParticipants: data.maxParticipants,
        minLevel: data.minLevel,
        isPublic: data.isPublic,
      },
    })
  }

  /**
   * Get challenge by ID
   */
  async getChallenge(challengeId: string) {
    return prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        _count: {
          select: { participants: true },
        },
      },
    })
  }

  /**
   * Get active challenges
   */
  async getActiveChallenges(userId?: string, page = 1, limit = 20) {
    const now = new Date()

    const where = {
      status: 'ACTIVE' as ChallengeStatus,
      isPublic: true,
      startDate: { lte: now },
      endDate: { gte: now },
    }

    const [challenges, total] = await Promise.all([
      prisma.challenge.findMany({
        where,
        include: {
          _count: {
            select: { participants: true },
          },
          ...(userId && {
            participants: {
              where: { userId },
              select: { id: true, currentProgress: true, isCompleted: true },
            },
          }),
        },
        orderBy: [
          { type: 'asc' },
          { endDate: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.challenge.count({ where }),
    ])

    return {
      challenges,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  /**
   * Get upcoming challenges
   */
  async getUpcomingChallenges(page = 1, limit = 20) {
    const now = new Date()

    const where = {
      status: { in: ['UPCOMING', 'DRAFT'] as ChallengeStatus[] },
      isPublic: true,
      startDate: { gt: now },
    }

    const [challenges, total] = await Promise.all([
      prisma.challenge.findMany({
        where,
        orderBy: { startDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.challenge.count({ where }),
    ])

    return {
      challenges,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  /**
   * Get challenges by type
   */
  async getChallengesByType(type: ChallengeType, page = 1, limit = 20) {
    const where = {
      type,
      status: 'ACTIVE' as ChallengeStatus,
      isPublic: true,
    }

    const [challenges, total] = await Promise.all([
      prisma.challenge.findMany({
        where,
        include: {
          _count: { select: { participants: true } },
        },
        orderBy: { endDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.challenge.count({ where }),
    ])

    return {
      challenges,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  /**
   * Publish a challenge (change status to ACTIVE or UPCOMING)
   */
  async publishChallenge(challengeId: string) {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    })

    if (!challenge) {
      throw new Error('Challenge not found')
    }

    const now = new Date()
    const newStatus: ChallengeStatus = challenge.startDate <= now ? 'ACTIVE' : 'UPCOMING'

    return prisma.challenge.update({
      where: { id: challengeId },
      data: { status: newStatus },
    })
  }

  // ============================================
  // PARTICIPATION
  // ============================================

  /**
   * Join a challenge
   */
  async joinChallenge(challengeId: string, userId: string) {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        _count: { select: { participants: true } },
      },
    })

    if (!challenge) {
      throw new Error('Challenge not found')
    }

    if (challenge.status !== 'ACTIVE') {
      throw new Error('Challenge is not active')
    }

    if (challenge.maxParticipants && challenge._count.participants >= challenge.maxParticipants) {
      throw new Error('Challenge is full')
    }

    // Check if user meets minimum level requirement
    if (challenge.minLevel) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      })

      if (!user || user.level < challenge.minLevel) {
        throw new Error(`Minimum level ${challenge.minLevel} required`)
      }
    }

    // Check if already participating
    const existing = await prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: { challengeId, userId },
      },
    })

    if (existing) {
      throw new Error('Already participating in this challenge')
    }

    const participant = await prisma.challengeParticipant.create({
      data: {
        challengeId,
        userId,
        currentProgress: 0,
      },
    })

    // Update participant count
    await prisma.challenge.update({
      where: { id: challengeId },
      data: { participantCount: { increment: 1 } },
    })

    return participant
  }

  /**
   * Leave a challenge
   */
  async leaveChallenge(challengeId: string, userId: string) {
    const participant = await prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: { challengeId, userId },
      },
    })

    if (!participant) {
      throw new Error('Not participating in this challenge')
    }

    await prisma.challengeParticipant.delete({
      where: { id: participant.id },
    })

    await prisma.challenge.update({
      where: { id: challengeId },
      data: { participantCount: { decrement: 1 } },
    })

    return { success: true }
  }

  /**
   * Get user's challenge participation
   */
  async getUserChallenges(userId: string, status?: 'active' | 'completed', page = 1, limit = 20) {
    const where: Record<string, unknown> = { userId }

    if (status === 'completed') {
      where.isCompleted = true
    } else if (status === 'active') {
      where.isCompleted = false
    }

    const [participations, total] = await Promise.all([
      prisma.challengeParticipant.findMany({
        where,
        include: {
          challenge: true,
        },
        orderBy: { joinedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.challengeParticipant.count({ where }),
    ])

    return {
      participations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  /**
   * Update user's progress in a challenge
   */
  async updateProgress(challengeId: string, userId: string, progressIncrement: number) {
    const participant = await prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: { challengeId, userId },
      },
      include: { challenge: true },
    })

    if (!participant) {
      throw new Error('Not participating in this challenge')
    }

    if (participant.isCompleted) {
      return participant // Already completed
    }

    const newProgress = participant.currentProgress + progressIncrement
    const isCompleted = newProgress >= participant.challenge.goalTarget

    const updated = await prisma.challengeParticipant.update({
      where: { id: participant.id },
      data: {
        currentProgress: Math.min(newProgress, participant.challenge.goalTarget),
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        lastActivityAt: new Date(),
        progressHistory: {
          ...(participant.progressHistory as Record<string, unknown> ?? {}),
          [new Date().toISOString().split('T')[0]]: newProgress,
        },
      },
    })

    // Update completion count if completed
    if (isCompleted && !participant.isCompleted) {
      await prisma.challenge.update({
        where: { id: challengeId },
        data: { completionCount: { increment: 1 } },
      })

      // Award points to user
      await prisma.user.update({
        where: { id: userId },
        data: { totalPoints: { increment: participant.challenge.pointsReward } },
      })
    }

    return updated
  }

  /**
   * Claim rewards for completed challenge
   */
  async claimRewards(challengeId: string, userId: string) {
    const participant = await prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: { challengeId, userId },
      },
      include: { challenge: true },
    })

    if (!participant) {
      throw new Error('Not participating in this challenge')
    }

    if (!participant.isCompleted) {
      throw new Error('Challenge not completed')
    }

    if (participant.rewardsClaimed) {
      throw new Error('Rewards already claimed')
    }

    await prisma.challengeParticipant.update({
      where: { id: participant.id },
      data: {
        rewardsClaimed: true,
        claimedAt: new Date(),
      },
    })

    // Award badge if specified
    if (participant.challenge.badgeId) {
      await prisma.userBadge.upsert({
        where: {
          userId_badgeId: {
            userId,
            badgeId: participant.challenge.badgeId,
          },
        },
        create: {
          userId,
          badgeId: participant.challenge.badgeId,
        },
        update: {},
      })
    }

    return { success: true, rewards: participant.challenge.otherRewards }
  }

  // ============================================
  // LEADERBOARDS
  // ============================================

  /**
   * Get challenge leaderboard
   */
  async getChallengeLeaderboard(challengeId: string, limit = 50) {
    const participants = await prisma.challengeParticipant.findMany({
      where: { challengeId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true, level: true },
        },
      },
      orderBy: [
        { isCompleted: 'desc' },
        { currentProgress: 'desc' },
        { completedAt: 'asc' }, // Earlier completion = higher rank
      ],
      take: limit,
    })

    return participants.map((p, index) => ({
      rank: index + 1,
      user: p.user,
      progress: p.currentProgress,
      isCompleted: p.isCompleted,
      completedAt: p.completedAt,
    }))
  }

  /**
   * Update leaderboard snapshot
   */
  async updateLeaderboardSnapshot(challengeId: string) {
    const leaderboard = await this.getChallengeLeaderboard(challengeId, 100)

    // Clear existing leaderboard
    await prisma.challengeLeaderboard.deleteMany({
      where: { challengeId },
    })

    // Insert new rankings
    await prisma.challengeLeaderboard.createMany({
      data: leaderboard.map((entry) => ({
        challengeId,
        userId: entry.user.id,
        rank: entry.rank,
        score: entry.progress,
        completionTime: entry.completedAt
          ? Math.floor((entry.completedAt.getTime() - Date.now()) / 1000)
          : null,
      })),
    })

    return leaderboard
  }

  // ============================================
  // TEAMS
  // ============================================

  /**
   * Create a team
   */
  async createTeam(data: CreateTeamData) {
    const team = await prisma.team.create({
      data: {
        name: data.name,
        description: data.description,
        avatar: data.avatar,
        isPublic: data.isPublic ?? true,
        maxMembers: data.maxMembers ?? 10,
        captainId: data.captainId,
        memberCount: 1,
        members: {
          create: {
            userId: data.captainId,
            role: 'captain',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
        },
      },
    })

    return team
  }

  /**
   * Join a team
   */
  async joinTeam(teamId: string, userId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    })

    if (!team) {
      throw new Error('Team not found')
    }

    if (!team.isPublic) {
      throw new Error('Team is private')
    }

    if (team.memberCount >= team.maxMembers) {
      throw new Error('Team is full')
    }

    const existing = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: { teamId, userId },
      },
    })

    if (existing) {
      throw new Error('Already a member of this team')
    }

    await prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role: 'member',
      },
    })

    await prisma.team.update({
      where: { id: teamId },
      data: { memberCount: { increment: 1 } },
    })

    return { success: true }
  }

  /**
   * Leave a team
   */
  async leaveTeam(teamId: string, userId: string) {
    const member = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: { teamId, userId },
      },
    })

    if (!member) {
      throw new Error('Not a member of this team')
    }

    if (member.role === 'captain') {
      throw new Error('Captain cannot leave. Transfer ownership first.')
    }

    await prisma.teamMember.delete({
      where: { id: member.id },
    })

    await prisma.team.update({
      where: { id: teamId },
      data: { memberCount: { decrement: 1 } },
    })

    return { success: true }
  }

  /**
   * Get team details
   */
  async getTeam(teamId: string) {
    return prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true, level: true },
            },
          },
          orderBy: [
            { role: 'asc' },
            { contributedPoints: 'desc' },
          ],
        },
        _count: {
          select: { competitions: true },
        },
      },
    })
  }

  /**
   * Get user's teams
   */
  async getUserTeams(userId: string) {
    return prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
    })
  }

  // ============================================
  // TEAM COMPETITIONS
  // ============================================

  /**
   * Create team competition
   */
  async createTeamCompetition(data: CreateTeamCompetitionData) {
    return prisma.teamCompetition.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'DRAFT',
        goalType: data.goalType,
        goalDescription: data.goalDescription,
        firstPlaceReward: data.firstPlaceReward ?? null,
        secondPlaceReward: data.secondPlaceReward ?? null,
        thirdPlaceReward: data.thirdPlaceReward ?? null,
        participationReward: data.participationReward ?? null,
        minTeamSize: data.minTeamSize ?? 2,
        maxTeamSize: data.maxTeamSize ?? 10,
        maxTeams: data.maxTeams,
      },
    })
  }

  /**
   * Register team for competition
   */
  async registerTeamForCompetition(competitionId: string, teamId: string, userId: string) {
    const [competition, team, member] = await Promise.all([
      prisma.teamCompetition.findUnique({ where: { id: competitionId } }),
      prisma.team.findUnique({ where: { id: teamId } }),
      prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId } },
      }),
    ])

    if (!competition) {
      throw new Error('Competition not found')
    }

    if (!team) {
      throw new Error('Team not found')
    }

    if (!member || member.role !== 'captain') {
      throw new Error('Only team captain can register')
    }

    if (team.memberCount < competition.minTeamSize) {
      throw new Error(`Team needs at least ${competition.minTeamSize} members`)
    }

    if (team.memberCount > competition.maxTeamSize) {
      throw new Error(`Team exceeds maximum size of ${competition.maxTeamSize}`)
    }

    if (competition.maxTeams && competition.teamCount >= competition.maxTeams) {
      throw new Error('Competition is full')
    }

    const existing = await prisma.teamCompetitionParticipant.findUnique({
      where: {
        competitionId_teamId: { competitionId, teamId },
      },
    })

    if (existing) {
      throw new Error('Team already registered')
    }

    await prisma.teamCompetitionParticipant.create({
      data: {
        competitionId,
        teamId,
      },
    })

    await prisma.teamCompetition.update({
      where: { id: competitionId },
      data: { teamCount: { increment: 1 } },
    })

    return { success: true }
  }

  /**
   * Get active team competitions
   */
  async getActiveTeamCompetitions(page = 1, limit = 20) {
    const where = {
      status: 'ACTIVE' as ChallengeStatus,
    }

    const [competitions, total] = await Promise.all([
      prisma.teamCompetition.findMany({
        where,
        include: {
          _count: { select: { participants: true } },
        },
        orderBy: { endDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.teamCompetition.count({ where }),
    ])

    return {
      competitions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  /**
   * Get team competition leaderboard
   */
  async getTeamCompetitionLeaderboard(competitionId: string) {
    return prisma.teamCompetitionParticipant.findMany({
      where: { competitionId },
      include: {
        team: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { totalScore: 'desc' },
    })
  }

  // ============================================
  // AUTO-PROGRESS TRACKING
  // ============================================

  /**
   * Track progress for all active challenges based on user action
   */
  async trackUserAction(userId: string, actionType: ChallengeGoalType, count = 1, metadata?: Record<string, unknown>) {
    // Find all active challenges the user is participating in with matching goal type
    const participations = await prisma.challengeParticipant.findMany({
      where: {
        userId,
        isCompleted: false,
        challenge: {
          status: 'ACTIVE',
          goalType: actionType,
          endDate: { gte: new Date() },
        },
      },
      include: { challenge: true },
    })

    const updates = []

    for (const participation of participations) {
      // Check if goal config matches (e.g., specific course)
      const goalConfig = participation.challenge.goalConfig as Record<string, unknown> | null

      if (goalConfig) {
        if (goalConfig.courseId && metadata?.courseId !== goalConfig.courseId) {
          continue
        }
        if (goalConfig.categoryId && metadata?.categoryId !== goalConfig.categoryId) {
          continue
        }
      }

      updates.push(this.updateProgress(participation.challengeId, userId, count))
    }

    return Promise.all(updates)
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get challenge statistics
   */
  async getChallengeStats() {
    const [totalChallenges, activeChallenges, totalParticipations, completions] = await Promise.all([
      prisma.challenge.count(),
      prisma.challenge.count({ where: { status: 'ACTIVE' } }),
      prisma.challengeParticipant.count(),
      prisma.challengeParticipant.count({ where: { isCompleted: true } }),
    ])

    return {
      totalChallenges,
      activeChallenges,
      totalParticipations,
      totalCompletions: completions,
      completionRate: totalParticipations > 0 ? (completions / totalParticipations) * 100 : 0,
    }
  }

  /**
   * Get user's challenge statistics
   */
  async getUserChallengeStats(userId: string) {
    const [joined, completed, totalPoints] = await Promise.all([
      prisma.challengeParticipant.count({ where: { userId } }),
      prisma.challengeParticipant.count({ where: { userId, isCompleted: true } }),
      prisma.challengeParticipant.findMany({
        where: { userId, isCompleted: true },
        include: { challenge: { select: { pointsReward: true } } },
      }),
    ])

    const pointsFromChallenges = totalPoints.reduce((sum, p) => sum + p.challenge.pointsReward, 0)

    return {
      challengesJoined: joined,
      challengesCompleted: completed,
      completionRate: joined > 0 ? (completed / joined) * 100 : 0,
      pointsFromChallenges,
    }
  }
}

export const challengeService = new ChallengeService()
export default challengeService
