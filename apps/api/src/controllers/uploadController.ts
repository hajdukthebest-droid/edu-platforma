import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { uploadService } from '../services/uploadService'
import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'

export class UploadController {
  async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const file = req.file

      if (!file) {
        throw new AppError(400, 'No file uploaded')
      }

      // Process and optimize avatar
      const avatarUrl = await uploadService.processAvatar(file.path)

      // Update user avatar in database
      const user = await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl },
        select: {
          id: true,
          avatar: true,
        },
      })

      res.json({
        success: true,
        data: {
          url: avatarUrl,
          user,
        },
      })
    } catch (error) {
      next(error)
    }
  }

  async uploadCourseThumbnail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const file = req.file
      const { courseId } = req.body

      if (!file) {
        throw new AppError(400, 'No file uploaded')
      }

      // Verify user owns the course
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          creatorId: userId,
        },
      })

      if (!course) {
        throw new AppError(404, 'Course not found or unauthorized')
      }

      // Process and optimize thumbnail
      const thumbnailUrl = await uploadService.processThumbnail(file.path)

      // Update course thumbnail in database
      const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: { thumbnailUrl },
        select: {
          id: true,
          thumbnailUrl: true,
        },
      })

      res.json({
        success: true,
        data: {
          url: thumbnailUrl,
          course: updatedCourse,
        },
      })
    } catch (error) {
      next(error)
    }
  }

  async uploadLessonAttachment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const file = req.file
      const { lessonId } = req.body

      if (!file) {
        throw new AppError(400, 'No file uploaded')
      }

      // Verify user owns the course that contains this lesson
      const lesson = await prisma.lesson.findFirst({
        where: { id: lessonId },
        include: {
          module: {
            include: {
              course: true,
            },
          },
        },
      })

      if (!lesson || lesson.module.course.creatorId !== userId) {
        throw new AppError(404, 'Lesson not found or unauthorized')
      }

      const attachmentUrl = uploadService.getPublicUrl(file.path)
      const fileInfo = await uploadService.getFileInfo(file.path)

      // Update lesson with attachment
      const updatedLesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: {
          attachments: {
            push: {
              url: attachmentUrl,
              name: file.originalname,
              size: fileInfo.size,
              mimeType: fileInfo.mimeType,
              uploadedAt: new Date(),
            },
          },
        },
        select: {
          id: true,
          attachments: true,
        },
      })

      res.json({
        success: true,
        data: {
          url: attachmentUrl,
          fileInfo,
          lesson: updatedLesson,
        },
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { fileUrl } = req.body

      if (!fileUrl) {
        throw new AppError(400, 'File URL is required')
      }

      uploadService.deleteFileByUrl(fileUrl)

      res.json({
        success: true,
        message: 'File deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  }
}

export const uploadController = new UploadController()
