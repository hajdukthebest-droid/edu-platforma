import { Response, NextFunction } from 'express'
import { courseBuilderService } from '../services/courseBuilderService'
import { AuthRequest } from '../middleware/auth'

export class CourseBuilderController {
  // ============================================
  // TEMPLATES
  // ============================================

  async getTemplates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as any
      const lessonType = req.query.lessonType as any

      const templates = await courseBuilderService.getTemplates({
        category,
        lessonType,
      })

      res.json({
        status: 'success',
        data: templates,
      })
    } catch (error) {
      next(error)
    }
  }

  async getTemplateById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = await courseBuilderService.getTemplateById(req.params.id)

      res.json({
        status: 'success',
        data: template,
      })
    } catch (error) {
      next(error)
    }
  }

  async createTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      // Only admins can create public templates
      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res
          .status(403)
          .json({ status: 'error', message: 'Only admins can create templates' })
      }

      const template = await courseBuilderService.createTemplate(req.body, req.user.id)

      res.status(201).json({
        status: 'success',
        data: template,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res
          .status(403)
          .json({ status: 'error', message: 'Only admins can delete templates' })
      }

      await courseBuilderService.deleteTemplate(req.params.id)

      res.json({
        status: 'success',
        message: 'Template deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  // ============================================
  // MODULE OPERATIONS
  // ============================================

  async reorderModules(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const { courseId, moduleOrders } = req.body

      const result = await courseBuilderService.reorderModules(courseId, moduleOrders)

      res.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async duplicateModule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const module = await courseBuilderService.duplicateModule(req.params.id, req.user.id)

      res.status(201).json({
        status: 'success',
        data: module,
      })
    } catch (error) {
      next(error)
    }
  }

  async moveModule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const { newOrderIndex } = req.body

      const result = await courseBuilderService.moveModule(
        req.params.id,
        newOrderIndex,
        req.user.id
      )

      res.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  // ============================================
  // LESSON OPERATIONS
  // ============================================

  async reorderLessons(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const { moduleId, lessonOrders } = req.body

      const result = await courseBuilderService.reorderLessons(moduleId, lessonOrders)

      res.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async duplicateLesson(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const lesson = await courseBuilderService.duplicateLesson(req.params.id, req.user.id)

      res.status(201).json({
        status: 'success',
        data: lesson,
      })
    } catch (error) {
      next(error)
    }
  }

  async createLessonFromTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const { moduleId, templateId, title, description } = req.body

      const lesson = await courseBuilderService.createLessonFromTemplate(
        moduleId,
        templateId,
        { title, description }
      )

      res.status(201).json({
        status: 'success',
        data: lesson,
      })
    } catch (error) {
      next(error)
    }
  }

  async moveLesson(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const { targetModuleId, newOrderIndex } = req.body

      const result = await courseBuilderService.moveLesson(
        req.params.id,
        targetModuleId,
        newOrderIndex,
        req.user.id
      )

      res.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  async exportCourse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
      }

      const exportData = await courseBuilderService.exportCourse(req.params.id, req.user.id)

      res.json({
        status: 'success',
        data: exportData,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const courseBuilderController = new CourseBuilderController()
