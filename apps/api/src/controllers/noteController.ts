import { Request, Response, NextFunction } from 'express'
import { noteService } from '../services/noteService'
import { AuthRequest } from '../middleware/auth'

export class NoteController {
  async createNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const note = await noteService.createNote(userId, req.body)

      res.status(201).json({
        success: true,
        data: note,
      })
    } catch (error) {
      next(error)
    }
  }

  async getUserNotes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { lessonId, courseId, page, limit } = req.query

      const filters = {
        lessonId: lessonId as string | undefined,
        courseId: courseId as string | undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      }

      const result = await noteService.getUserNotes(userId, filters)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async getNoteById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { noteId } = req.params

      const note = await noteService.getNoteById(noteId, userId)

      res.json({
        success: true,
        data: note,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { noteId } = req.params

      const note = await noteService.updateNote(noteId, userId, req.body)

      res.json({
        success: true,
        data: note,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { noteId } = req.params

      await noteService.deleteNote(noteId, userId)

      res.json({
        success: true,
        message: 'Note deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  async getLessonNotes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { lessonId } = req.params

      const notes = await noteService.getLessonNotes(userId, lessonId)

      res.json({
        success: true,
        data: notes,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const noteController = new NoteController()
