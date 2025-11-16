import { Request, Response } from 'express'
import versioningService from '../services/versioningService'

class VersionController {
  /**
   * Get course version history
   */
  async getCourseVersionHistory(req: Request, res: Response) {
    try {
      const { courseId } = req.params

      const versions = await versioningService.getCourseVersionHistory(courseId)

      res.json({
        success: true,
        data: versions,
      })
    } catch (error) {
      console.error('Error getting course version history:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get module version history
   */
  async getModuleVersionHistory(req: Request, res: Response) {
    try {
      const { moduleId } = req.params

      const versions = await versioningService.getModuleVersionHistory(moduleId)

      res.json({
        success: true,
        data: versions,
      })
    } catch (error) {
      console.error('Error getting module version history:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get lesson version history
   */
  async getLessonVersionHistory(req: Request, res: Response) {
    try {
      const { lessonId } = req.params

      const versions = await versioningService.getLessonVersionHistory(lessonId)

      res.json({
        success: true,
        data: versions,
      })
    } catch (error) {
      console.error('Error getting lesson version history:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get specific course version
   */
  async getCourseVersion(req: Request, res: Response) {
    try {
      const { courseId, version } = req.params

      const courseVersion = await versioningService.getCourseVersion(
        courseId,
        parseInt(version)
      )

      res.json({
        success: true,
        data: courseVersion,
      })
    } catch (error: any) {
      console.error('Error getting course version:', error)
      if (error.message === 'Version not found') {
        return res.status(404).json({ message: 'Version not found' })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get specific module version
   */
  async getModuleVersion(req: Request, res: Response) {
    try {
      const { moduleId, version } = req.params

      const moduleVersion = await versioningService.getModuleVersion(
        moduleId,
        parseInt(version)
      )

      res.json({
        success: true,
        data: moduleVersion,
      })
    } catch (error: any) {
      console.error('Error getting module version:', error)
      if (error.message === 'Version not found') {
        return res.status(404).json({ message: 'Version not found' })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get specific lesson version
   */
  async getLessonVersion(req: Request, res: Response) {
    try {
      const { lessonId, version } = req.params

      const lessonVersion = await versioningService.getLessonVersion(
        lessonId,
        parseInt(version)
      )

      res.json({
        success: true,
        data: lessonVersion,
      })
    } catch (error: any) {
      console.error('Error getting lesson version:', error)
      if (error.message === 'Version not found') {
        return res.status(404).json({ message: 'Version not found' })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Create course version snapshot
   */
  async createCourseVersion(req: Request, res: Response) {
    try {
      const { courseId } = req.params
      const { changeDescription } = req.body
      const userId = (req as any).user.id

      const version = await versioningService.createCourseVersion(
        courseId,
        userId,
        changeDescription
      )

      res.json({
        success: true,
        data: version,
      })
    } catch (error: any) {
      console.error('Error creating course version:', error)
      if (error.message === 'Course not found') {
        return res.status(404).json({ message: 'Course not found' })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Create module version snapshot
   */
  async createModuleVersion(req: Request, res: Response) {
    try {
      const { moduleId } = req.params
      const { changeDescription } = req.body
      const userId = (req as any).user.id

      const version = await versioningService.createModuleVersion(
        moduleId,
        userId,
        changeDescription
      )

      res.json({
        success: true,
        data: version,
      })
    } catch (error: any) {
      console.error('Error creating module version:', error)
      if (error.message === 'Module not found') {
        return res.status(404).json({ message: 'Module not found' })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Create lesson version snapshot
   */
  async createLessonVersion(req: Request, res: Response) {
    try {
      const { lessonId } = req.params
      const { changeDescription } = req.body
      const userId = (req as any).user.id

      const version = await versioningService.createLessonVersion(
        lessonId,
        userId,
        changeDescription
      )

      res.json({
        success: true,
        data: version,
      })
    } catch (error: any) {
      console.error('Error creating lesson version:', error)
      if (error.message === 'Lesson not found') {
        return res.status(404).json({ message: 'Lesson not found' })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Rollback course to specific version
   */
  async rollbackCourse(req: Request, res: Response) {
    try {
      const { courseId, version } = req.params
      const userId = (req as any).user.id

      const updatedCourse = await versioningService.rollbackCourse(
        courseId,
        parseInt(version),
        userId
      )

      res.json({
        success: true,
        data: updatedCourse,
        message: `Course rolled back to version ${version}`,
      })
    } catch (error: any) {
      console.error('Error rolling back course:', error)
      if (error.message === 'Version not found') {
        return res.status(404).json({ message: 'Version not found' })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Rollback module to specific version
   */
  async rollbackModule(req: Request, res: Response) {
    try {
      const { moduleId, version } = req.params
      const userId = (req as any).user.id

      const updatedModule = await versioningService.rollbackModule(
        moduleId,
        parseInt(version),
        userId
      )

      res.json({
        success: true,
        data: updatedModule,
        message: `Module rolled back to version ${version}`,
      })
    } catch (error: any) {
      console.error('Error rolling back module:', error)
      if (error.message === 'Version not found') {
        return res.status(404).json({ message: 'Version not found' })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Rollback lesson to specific version
   */
  async rollbackLesson(req: Request, res: Response) {
    try {
      const { lessonId, version } = req.params
      const userId = (req as any).user.id

      const updatedLesson = await versioningService.rollbackLesson(
        lessonId,
        parseInt(version),
        userId
      )

      res.json({
        success: true,
        data: updatedLesson,
        message: `Lesson rolled back to version ${version}`,
      })
    } catch (error: any) {
      console.error('Error rolling back lesson:', error)
      if (error.message === 'Version not found') {
        return res.status(404).json({ message: 'Version not found' })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Compare two course versions
   */
  async compareCourseVersions(req: Request, res: Response) {
    try {
      const { courseId } = req.params
      const { version1, version2 } = req.query

      if (!version1 || !version2) {
        return res.status(400).json({
          message: 'Both version1 and version2 query parameters are required',
        })
      }

      const diffs = await versioningService.compareCourseVersions(
        courseId,
        parseInt(version1 as string),
        parseInt(version2 as string)
      )

      res.json({
        success: true,
        data: {
          version1: parseInt(version1 as string),
          version2: parseInt(version2 as string),
          differences: diffs,
        },
      })
    } catch (error: any) {
      console.error('Error comparing course versions:', error)
      if (error.message === 'Version not found') {
        return res.status(404).json({ message: 'One or both versions not found' })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Compare two module versions
   */
  async compareModuleVersions(req: Request, res: Response) {
    try {
      const { moduleId } = req.params
      const { version1, version2 } = req.query

      if (!version1 || !version2) {
        return res.status(400).json({
          message: 'Both version1 and version2 query parameters are required',
        })
      }

      const diffs = await versioningService.compareModuleVersions(
        moduleId,
        parseInt(version1 as string),
        parseInt(version2 as string)
      )

      res.json({
        success: true,
        data: {
          version1: parseInt(version1 as string),
          version2: parseInt(version2 as string),
          differences: diffs,
        },
      })
    } catch (error: any) {
      console.error('Error comparing module versions:', error)
      if (error.message === 'Version not found') {
        return res.status(404).json({ message: 'One or both versions not found' })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Compare two lesson versions
   */
  async compareLessonVersions(req: Request, res: Response) {
    try {
      const { lessonId } = req.params
      const { version1, version2 } = req.query

      if (!version1 || !version2) {
        return res.status(400).json({
          message: 'Both version1 and version2 query parameters are required',
        })
      }

      const diffs = await versioningService.compareLessonVersions(
        lessonId,
        parseInt(version1 as string),
        parseInt(version2 as string)
      )

      res.json({
        success: true,
        data: {
          version1: parseInt(version1 as string),
          version2: parseInt(version2 as string),
          differences: diffs,
        },
      })
    } catch (error: any) {
      console.error('Error comparing lesson versions:', error)
      if (error.message === 'Version not found') {
        return res.status(404).json({ message: 'One or both versions not found' })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Cleanup old versions
   */
  async cleanupOldVersions(req: Request, res: Response) {
    try {
      const { entityType, entityId } = req.params
      const { keepLastN = 10 } = req.query

      if (!['course', 'module', 'lesson'].includes(entityType)) {
        return res.status(400).json({
          message: 'entityType must be one of: course, module, lesson',
        })
      }

      const result = await versioningService.cleanupOldVersions(
        entityType as 'course' | 'module' | 'lesson',
        entityId,
        parseInt(keepLastN as string)
      )

      res.json({
        success: true,
        data: result,
        message: `Deleted ${result.deleted} old versions`,
      })
    } catch (error) {
      console.error('Error cleaning up old versions:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new VersionController()
