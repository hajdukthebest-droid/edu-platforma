import { Request, Response } from 'express'
import challengeService from '../services/challengeService'

class ChallengeController {
  // ============================================
  // CHALLENGE MANAGEMENT
  // ============================================

  async createChallenge(req: Request, res: Response) {
    try {
      const createdById = (req as any).user.id
      const {
        title, description, shortDescription, thumbnail, type,
        startDate, endDate, goalType, goalTarget, goalConfig,
        pointsReward, badgeId, otherRewards, maxParticipants,
        minLevel, courseId, isPublic,
      } = req.body

      if (!title || !description || !type || !startDate || !endDate || !goalType || !goalTarget) {
        return res.status(400).json({
          message: 'title, description, type, startDate, endDate, goalType, and goalTarget are required',
        })
      }

      const challenge = await challengeService.createChallenge({
        title,
        description,
        shortDescription,
        thumbnail,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        goalType,
        goalTarget,
        goalConfig,
        pointsReward,
        badgeId,
        otherRewards,
        maxParticipants,
        minLevel,
        courseId,
        isPublic,
        createdById,
      })

      res.status(201).json({ success: true, data: challenge })
    } catch (error: any) {
      console.error('Error creating challenge:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async updateChallenge(req: Request, res: Response) {
    try {
      const { id } = req.params
      const challenge = await challengeService.updateChallenge(id, req.body)
      res.json({ success: true, data: challenge })
    } catch (error: any) {
      console.error('Error updating challenge:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async publishChallenge(req: Request, res: Response) {
    try {
      const { id } = req.params
      const challenge = await challengeService.publishChallenge(id)
      res.json({ success: true, data: challenge })
    } catch (error: any) {
      if (error.message === 'Challenge not found') {
        return res.status(404).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getChallenge(req: Request, res: Response) {
    try {
      const { id } = req.params
      const challenge = await challengeService.getChallenge(id)

      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' })
      }

      res.json({ success: true, data: challenge })
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getActiveChallenges(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      const { page, limit } = req.query

      const result = await challengeService.getActiveChallenges(
        userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getUpcomingChallenges(req: Request, res: Response) {
    try {
      const { page, limit } = req.query
      const result = await challengeService.getUpcomingChallenges(
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )
      res.json({ success: true, ...result })
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getChallengesByType(req: Request, res: Response) {
    try {
      const { type } = req.params
      const { page, limit } = req.query

      const result = await challengeService.getChallengesByType(
        type as any,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // PARTICIPATION
  // ============================================

  async joinChallenge(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      const participant = await challengeService.joinChallenge(id, userId)
      res.status(201).json({ success: true, data: participant })
    } catch (error: any) {
      if (error.message.includes('not found') || error.message.includes('not active') ||
          error.message.includes('full') || error.message.includes('level') ||
          error.message.includes('Already')) {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async leaveChallenge(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      await challengeService.leaveChallenge(id, userId)
      res.json({ success: true, message: 'Left challenge successfully' })
    } catch (error: any) {
      if (error.message.includes('Not participating')) {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getMyChallenges(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { status, page, limit } = req.query

      const result = await challengeService.getUserChallenges(
        userId,
        status as any,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async claimRewards(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      const result = await challengeService.claimRewards(id, userId)
      res.json({ success: true, data: result })
    } catch (error: any) {
      if (error.message.includes('not found') || error.message.includes('not completed') ||
          error.message.includes('already claimed')) {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getMyChallengeStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const stats = await challengeService.getUserChallengeStats(userId)
      res.json({ success: true, data: stats })
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // LEADERBOARDS
  // ============================================

  async getChallengeLeaderboard(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { limit } = req.query

      const leaderboard = await challengeService.getChallengeLeaderboard(
        id,
        limit ? Number(limit) : 50
      )

      res.json({ success: true, data: leaderboard })
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // TEAMS
  // ============================================

  async createTeam(req: Request, res: Response) {
    try {
      const captainId = (req as any).user.id
      const { name, description, avatar, isPublic, maxMembers } = req.body

      if (!name) {
        return res.status(400).json({ message: 'Team name is required' })
      }

      const team = await challengeService.createTeam({
        name,
        description,
        avatar,
        isPublic,
        maxMembers,
        captainId,
      })

      res.status(201).json({ success: true, data: team })
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getTeam(req: Request, res: Response) {
    try {
      const { id } = req.params
      const team = await challengeService.getTeam(id)

      if (!team) {
        return res.status(404).json({ message: 'Team not found' })
      }

      res.json({ success: true, data: team })
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getMyTeams(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const teams = await challengeService.getUserTeams(userId)
      res.json({ success: true, data: teams })
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async joinTeam(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      await challengeService.joinTeam(id, userId)
      res.json({ success: true, message: 'Joined team successfully' })
    } catch (error: any) {
      if (error.message.includes('not found') || error.message.includes('private') ||
          error.message.includes('full') || error.message.includes('Already')) {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async leaveTeam(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      await challengeService.leaveTeam(id, userId)
      res.json({ success: true, message: 'Left team successfully' })
    } catch (error: any) {
      if (error.message.includes('Not a member') || error.message.includes('Captain')) {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // TEAM COMPETITIONS
  // ============================================

  async createTeamCompetition(req: Request, res: Response) {
    try {
      const {
        title, description, startDate, endDate, goalType, goalDescription,
        firstPlaceReward, secondPlaceReward, thirdPlaceReward, participationReward,
        minTeamSize, maxTeamSize, maxTeams,
      } = req.body

      if (!title || !description || !startDate || !endDate || !goalType) {
        return res.status(400).json({
          message: 'title, description, startDate, endDate, and goalType are required',
        })
      }

      const competition = await challengeService.createTeamCompetition({
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        goalType,
        goalDescription,
        firstPlaceReward,
        secondPlaceReward,
        thirdPlaceReward,
        participationReward,
        minTeamSize,
        maxTeamSize,
        maxTeams,
      })

      res.status(201).json({ success: true, data: competition })
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getActiveTeamCompetitions(req: Request, res: Response) {
    try {
      const { page, limit } = req.query
      const result = await challengeService.getActiveTeamCompetitions(
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )
      res.json({ success: true, ...result })
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getTeamCompetitionLeaderboard(req: Request, res: Response) {
    try {
      const { id } = req.params
      const leaderboard = await challengeService.getTeamCompetitionLeaderboard(id)
      res.json({ success: true, data: leaderboard })
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async registerTeamForCompetition(req: Request, res: Response) {
    try {
      const { id: competitionId, teamId } = req.params
      const userId = (req as any).user.id

      await challengeService.registerTeamForCompetition(competitionId, teamId, userId)
      res.json({ success: true, message: 'Team registered successfully' })
    } catch (error: any) {
      if (error.message.includes('not found') || error.message.includes('captain') ||
          error.message.includes('members') || error.message.includes('full') ||
          error.message.includes('already registered')) {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // ADMIN
  // ============================================

  async getChallengeStats(req: Request, res: Response) {
    try {
      const stats = await challengeService.getChallengeStats()
      res.json({ success: true, data: stats })
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export const challengeController = new ChallengeController()
export default challengeController
