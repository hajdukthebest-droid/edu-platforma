import { Request, Response } from 'express'
import activityFeedService from '../services/activityFeedService'

class SocialController {
  // ============================================
  // FEED
  // ============================================

  async getMyFeed(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { page, limit } = req.query

      const result = await activityFeedService.getFollowingFeed(
        userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      console.error('Error getting feed:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getDiscoverFeed(req: Request, res: Response) {
    try {
      const { page, limit } = req.query

      const result = await activityFeedService.getDiscoverFeed(
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      console.error('Error getting discover feed:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getActivity(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user?.id

      const activity = await activityFeedService.getActivity(id, userId)

      if (!activity) {
        return res.status(404).json({ message: 'Activity not found' })
      }

      res.json({ success: true, data: activity })
    } catch (error: any) {
      console.error('Error getting activity:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // USER ACTIVITIES
  // ============================================

  async getMyActivities(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { page, limit } = req.query

      const result = await activityFeedService.getUserActivities(
        userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      console.error('Error getting activities:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getUserActivities(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const { page, limit } = req.query

      const result = await activityFeedService.getUserActivities(
        userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      console.error('Error getting user activities:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // LIKES & COMMENTS
  // ============================================

  async likeActivity(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      await activityFeedService.likeActivity(id, userId)
      res.json({ success: true, message: 'Activity liked' })
    } catch (error: any) {
      if (error.message === 'Already liked') {
        return res.status(400).json({ message: error.message })
      }
      console.error('Error liking activity:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async unlikeActivity(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      await activityFeedService.unlikeActivity(id, userId)
      res.json({ success: true, message: 'Activity unliked' })
    } catch (error: any) {
      if (error.message === 'Not liked') {
        return res.status(400).json({ message: error.message })
      }
      console.error('Error unliking activity:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async commentOnActivity(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id
      const { content, parentId } = req.body

      if (!content) {
        return res.status(400).json({ message: 'Content is required' })
      }

      const comment = await activityFeedService.commentOnActivity(id, userId, content, parentId)
      res.status(201).json({ success: true, data: comment })
    } catch (error: any) {
      console.error('Error commenting:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async deleteComment(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      await activityFeedService.deleteComment(id, userId)
      res.json({ success: true, message: 'Comment deleted' })
    } catch (error: any) {
      if (error.message === 'Not authorized') {
        return res.status(403).json({ message: error.message })
      }
      console.error('Error deleting comment:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // FOLLOWING
  // ============================================

  async followUser(req: Request, res: Response) {
    try {
      const { userId: followingId } = req.params
      const followerId = (req as any).user.id

      await activityFeedService.followUser(followerId, followingId)
      res.json({ success: true, message: 'Now following user' })
    } catch (error: any) {
      if (error.message.includes('Cannot follow') || error.message.includes('Already') ||
          error.message.includes('does not allow')) {
        return res.status(400).json({ message: error.message })
      }
      console.error('Error following user:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async unfollowUser(req: Request, res: Response) {
    try {
      const { userId: followingId } = req.params
      const followerId = (req as any).user.id

      await activityFeedService.unfollowUser(followerId, followingId)
      res.json({ success: true, message: 'Unfollowed user' })
    } catch (error: any) {
      if (error.message === 'Not following') {
        return res.status(400).json({ message: error.message })
      }
      console.error('Error unfollowing user:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async checkIsFollowing(req: Request, res: Response) {
    try {
      const { userId: followingId } = req.params
      const followerId = (req as any).user.id

      const isFollowing = await activityFeedService.isFollowing(followerId, followingId)
      res.json({ success: true, data: { isFollowing } })
    } catch (error: any) {
      console.error('Error checking follow status:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getMyFollowers(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { page, limit } = req.query

      const result = await activityFeedService.getFollowers(
        userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      console.error('Error getting followers:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getMyFollowing(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { page, limit } = req.query

      const result = await activityFeedService.getFollowing(
        userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      console.error('Error getting following:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getUserFollowers(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const { page, limit } = req.query

      const result = await activityFeedService.getFollowers(
        userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      console.error('Error getting user followers:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getUserFollowing(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const { page, limit } = req.query

      const result = await activityFeedService.getFollowing(
        userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      )

      res.json({ success: true, ...result })
    } catch (error: any) {
      console.error('Error getting user following:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // PROFILE
  // ============================================

  async getMySocialProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const result = await activityFeedService.getSocialProfile(userId)
      res.json({ success: true, data: result })
    } catch (error: any) {
      console.error('Error getting profile:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getUserProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const viewerId = (req as any).user?.id

      const result = await activityFeedService.getSocialProfile(userId, viewerId)
      res.json({ success: true, data: result })
    } catch (error: any) {
      console.error('Error getting user profile:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async updateMySocialProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { coverImage, socialLinks, interests } = req.body

      const profile = await activityFeedService.updateSocialProfile(userId, {
        coverImage,
        socialLinks,
        interests,
      })

      res.json({ success: true, data: profile })
    } catch (error: any) {
      console.error('Error updating profile:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async updatePrivacySettings(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { showActivity, showProgress, showBadges, allowFollow } = req.body

      const profile = await activityFeedService.updatePrivacySettings(userId, {
        showActivity,
        showProgress,
        showBadges,
        allowFollow,
      })

      res.json({ success: true, data: profile })
    } catch (error: any) {
      console.error('Error updating privacy:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // ============================================
  // SUGGESTIONS
  // ============================================

  async getSuggestedUsers(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { limit } = req.query

      const users = await activityFeedService.getSuggestedUsers(
        userId,
        limit ? Number(limit) : 10
      )

      res.json({ success: true, data: users })
    } catch (error: any) {
      console.error('Error getting suggestions:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export const socialController = new SocialController()
export default socialController
