import { Request, Response, NextFunction } from 'express'
import { bookmarkService } from '../services/bookmarkService'
import { AuthRequest } from '../middleware/auth'

export class BookmarkController {
  async createBookmark(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const bookmark = await bookmarkService.createBookmark(userId, req.body)

      res.status(201).json({
        success: true,
        data: bookmark,
      })
    } catch (error) {
      next(error)
    }
  }

  async getUserBookmarks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { courseId, page, limit } = req.query

      const filters = {
        courseId: courseId as string | undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      }

      const result = await bookmarkService.getUserBookmarks(userId, filters)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async getBookmarkById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { bookmarkId } = req.params

      const bookmark = await bookmarkService.getBookmarkById(bookmarkId, userId)

      res.json({
        success: true,
        data: bookmark,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateBookmark(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { bookmarkId } = req.params
      const { note } = req.body

      const bookmark = await bookmarkService.updateBookmark(bookmarkId, userId, note)

      res.json({
        success: true,
        data: bookmark,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteBookmark(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { bookmarkId } = req.params

      await bookmarkService.deleteBookmark(bookmarkId, userId)

      res.json({
        success: true,
        message: 'Bookmark deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  async checkBookmark(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { lessonId } = req.params

      const result = await bookmarkService.checkBookmark(userId, lessonId)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const bookmarkController = new BookmarkController()
