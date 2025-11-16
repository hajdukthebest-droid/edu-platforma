import { Request, Response, NextFunction } from 'express'
import { forumService } from '../services/forumService'
import { AuthRequest } from '../middleware/auth'

export class ForumController {
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await forumService.getCategories()

      res.json({
        status: 'success',
        data: categories,
      })
    } catch (error) {
      next(error)
    }
  }

  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = req.query.category as string
      const search = req.query.search as string
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20

      // New query parameters
      const courseId = req.query.courseId as string
      const lessonId = req.query.lessonId as string
      const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined
      const isSolved = req.query.isSolved
        ? req.query.isSolved === 'true'
        : undefined
      const sortBy = req.query.sortBy as 'recent' | 'popular' | 'unanswered'

      const result = await forumService.getPosts(categoryId, search, page, limit, {
        courseId,
        lessonId,
        tags,
        isSolved,
        sortBy,
      })

      res.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async getPostById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Pass userId if authenticated (for vote tracking)
      const userId = req.user?.id
      const post = await forumService.getPostById(req.params.id, userId)

      res.json({
        status: 'success',
        data: post,
      })
    } catch (error) {
      next(error)
    }
  }

  async createPost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const post = await forumService.createPost(req.user.id, req.body)

      res.status(201).json({
        status: 'success',
        data: post,
      })
    } catch (error) {
      next(error)
    }
  }

  async updatePost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const post = await forumService.updatePost(req.params.id, req.user.id, req.body)

      res.json({
        status: 'success',
        data: post,
      })
    } catch (error) {
      next(error)
    }
  }

  async deletePost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN'
      await forumService.deletePost(req.params.id, req.user.id, isAdmin)

      res.json({
        status: 'success',
        message: 'Post deleted',
      })
    } catch (error) {
      next(error)
    }
  }

  async createComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const comment = await forumService.createComment(req.params.postId, req.user.id, req.body)

      res.status(201).json({
        status: 'success',
        data: comment,
      })
    } catch (error) {
      next(error)
    }
  }

  // NEW: Toggle vote (upvote/downvote with duplicate prevention)
  async vote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const { voteType, postId, commentId } = req.body

      if (!voteType || (voteType !== 'UP' && voteType !== 'DOWN')) {
        return res.status(400).json({
          status: 'error',
          message: 'voteType must be UP or DOWN',
        })
      }

      const result = await forumService.toggleVote(req.user.id, voteType, {
        postId,
        commentId,
      })

      res.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  // Mark comment as best answer
  async markBestAnswer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const { postId, commentId } = req.body

      await forumService.markBestAnswer(postId, commentId, req.user.id)

      res.json({
        status: 'success',
        message: 'Comment marked as best answer',
      })
    } catch (error) {
      next(error)
    }
  }

  // Get popular tags
  async getPopularTags(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 20
      const tags = await forumService.getPopularTags(limit)

      res.json({
        status: 'success',
        data: tags,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const forumController = new ForumController()
