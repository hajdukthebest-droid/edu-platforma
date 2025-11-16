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

      const result = await forumService.getPosts(categoryId, search, page, limit)

      res.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await forumService.getPostById(req.params.id)

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

  async upvotePost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      await forumService.upvotePost(req.params.id, req.user.id)

      res.json({
        status: 'success',
        message: 'Post upvoted',
      })
    } catch (error) {
      next(error)
    }
  }

  async upvoteComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      await forumService.upvoteComment(req.params.commentId, req.user.id)

      res.json({
        status: 'success',
        message: 'Comment upvoted',
      })
    } catch (error) {
      next(error)
    }
  }
}

export const forumController = new ForumController()
