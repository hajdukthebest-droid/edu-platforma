import { Request, Response } from 'express'
import translationService from '../services/translationService'
import { SupportedLocale } from '@prisma/client'

class TranslationController {
  /**
   * Get course with translations applied
   * @route GET /api/translations/course/:courseId/:locale
   */
  async getCourseWithTranslation(req: Request, res: Response) {
    try {
      const { courseId, locale } = req.params

      if (!courseId || !locale) {
        return res.status(400).json({
          success: false,
          message: 'Course ID and locale are required',
        })
      }

      // Validate locale
      if (!['HR', 'EN'].includes(locale.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid locale. Supported locales: HR, EN',
        })
      }

      const course = await translationService.getCourseWithTranslation(
        courseId,
        locale.toUpperCase() as SupportedLocale
      )

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        })
      }

      return res.status(200).json({
        success: true,
        data: course,
      })
    } catch (error: any) {
      console.error('Error getting course with translation:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to get course translation',
        error: error.message,
      })
    }
  }

  /**
   * Get translation completion status
   * @route GET /api/translations/status/:courseId
   */
  async getTranslationStatus(req: Request, res: Response) {
    try {
      const { courseId } = req.params

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required',
        })
      }

      const status = await translationService.getCourseTranslationStatus(courseId)

      if (!status) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        })
      }

      return res.status(200).json({
        success: true,
        data: status,
      })
    } catch (error: any) {
      console.error('Error getting translation status:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to get translation status',
        error: error.message,
      })
    }
  }

  /**
   * Check if translation exists
   * @route GET /api/translations/check/:type/:id/:locale
   */
  async checkTranslationExists(req: Request, res: Response) {
    try {
      const { type, id, locale } = req.params

      if (!type || !id || !locale) {
        return res.status(400).json({
          success: false,
          message: 'Type, ID, and locale are required',
        })
      }

      if (!['course', 'module', 'lesson'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid type. Must be: course, module, or lesson',
        })
      }

      if (!['HR', 'EN'].includes(locale.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid locale. Supported locales: HR, EN',
        })
      }

      const exists = await translationService.translationExists(
        type as 'course' | 'module' | 'lesson',
        id,
        locale.toUpperCase() as SupportedLocale
      )

      return res.status(200).json({
        success: true,
        data: { exists },
      })
    } catch (error: any) {
      console.error('Error checking translation:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to check translation',
        error: error.message,
      })
    }
  }

  /**
   * Create or update course translation
   * @route POST /api/translations/course
   */
  async upsertCourseTranslation(req: Request, res: Response) {
    try {
      const {
        courseId,
        locale,
        title,
        description,
        shortDescription,
        learningObjectives,
        requirements,
        targetAudience,
      } = req.body

      if (!courseId || !locale || !title) {
        return res.status(400).json({
          success: false,
          message: 'Course ID, locale, and title are required',
        })
      }

      if (!['HR', 'EN'].includes(locale.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid locale. Supported locales: HR, EN',
        })
      }

      const translation = await translationService.upsertCourseTranslation(
        courseId,
        locale.toUpperCase() as SupportedLocale,
        {
          title,
          description,
          shortDescription,
          learningObjectives,
          requirements,
          targetAudience,
        }
      )

      return res.status(200).json({
        success: true,
        data: translation,
        message: 'Course translation saved successfully',
      })
    } catch (error: any) {
      console.error('Error upserting course translation:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to save course translation',
        error: error.message,
      })
    }
  }

  /**
   * Create or update module translation
   * @route POST /api/translations/module
   */
  async upsertModuleTranslation(req: Request, res: Response) {
    try {
      const { moduleId, locale, title, description } = req.body

      if (!moduleId || !locale || !title) {
        return res.status(400).json({
          success: false,
          message: 'Module ID, locale, and title are required',
        })
      }

      if (!['HR', 'EN'].includes(locale.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid locale. Supported locales: HR, EN',
        })
      }

      const translation = await translationService.upsertModuleTranslation(
        moduleId,
        locale.toUpperCase() as SupportedLocale,
        {
          title,
          description,
        }
      )

      return res.status(200).json({
        success: true,
        data: translation,
        message: 'Module translation saved successfully',
      })
    } catch (error: any) {
      console.error('Error upserting module translation:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to save module translation',
        error: error.message,
      })
    }
  }

  /**
   * Create or update lesson translation
   * @route POST /api/translations/lesson
   */
  async upsertLessonTranslation(req: Request, res: Response) {
    try {
      const { lessonId, locale, title, description, content } = req.body

      if (!lessonId || !locale || !title) {
        return res.status(400).json({
          success: false,
          message: 'Lesson ID, locale, and title are required',
        })
      }

      if (!['HR', 'EN'].includes(locale.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid locale. Supported locales: HR, EN',
        })
      }

      const translation = await translationService.upsertLessonTranslation(
        lessonId,
        locale.toUpperCase() as SupportedLocale,
        {
          title,
          description,
          content,
        }
      )

      return res.status(200).json({
        success: true,
        data: translation,
        message: 'Lesson translation saved successfully',
      })
    } catch (error: any) {
      console.error('Error upserting lesson translation:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to save lesson translation',
        error: error.message,
      })
    }
  }

  /**
   * Delete course translation
   * @route DELETE /api/translations/course/:courseId/:locale
   */
  async deleteCourseTranslation(req: Request, res: Response) {
    try {
      const { courseId, locale } = req.params

      if (!courseId || !locale) {
        return res.status(400).json({
          success: false,
          message: 'Course ID and locale are required',
        })
      }

      if (!['HR', 'EN'].includes(locale.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid locale. Supported locales: HR, EN',
        })
      }

      await translationService.deleteCourseTranslation(
        courseId,
        locale.toUpperCase() as SupportedLocale
      )

      return res.status(200).json({
        success: true,
        message: 'Course translation deleted successfully',
      })
    } catch (error: any) {
      console.error('Error deleting course translation:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to delete course translation',
        error: error.message,
      })
    }
  }

  /**
   * Delete module translation
   * @route DELETE /api/translations/module/:moduleId/:locale
   */
  async deleteModuleTranslation(req: Request, res: Response) {
    try {
      const { moduleId, locale } = req.params

      if (!moduleId || !locale) {
        return res.status(400).json({
          success: false,
          message: 'Module ID and locale are required',
        })
      }

      if (!['HR', 'EN'].includes(locale.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid locale. Supported locales: HR, EN',
        })
      }

      await translationService.deleteModuleTranslation(
        moduleId,
        locale.toUpperCase() as SupportedLocale
      )

      return res.status(200).json({
        success: true,
        message: 'Module translation deleted successfully',
      })
    } catch (error: any) {
      console.error('Error deleting module translation:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to delete module translation',
        error: error.message,
      })
    }
  }

  /**
   * Delete lesson translation
   * @route DELETE /api/translations/lesson/:lessonId/:locale
   */
  async deleteLessonTranslation(req: Request, res: Response) {
    try {
      const { lessonId, locale } = req.params

      if (!lessonId || !locale) {
        return res.status(400).json({
          success: false,
          message: 'Lesson ID and locale are required',
        })
      }

      if (!['HR', 'EN'].includes(locale.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid locale. Supported locales: HR, EN',
        })
      }

      await translationService.deleteLessonTranslation(
        lessonId,
        locale.toUpperCase() as SupportedLocale
      )

      return res.status(200).json({
        success: true,
        message: 'Lesson translation deleted successfully',
      })
    } catch (error: any) {
      console.error('Error deleting lesson translation:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to delete lesson translation',
        error: error.message,
      })
    }
  }
}

export default new TranslationController()
