import { Router } from 'express'
import { uploadController } from '../controllers/uploadController'
import { authenticate, authorize } from '../middleware/auth'
import {
  uploadAvatar,
  uploadCourseThumbnail,
  uploadLessonAttachment,
  setUploadType,
} from '../middleware/upload'
import { UserRole } from '@prisma/client'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Avatar upload (any authenticated user)
router.post(
  '/avatar',
  setUploadType('avatars'),
  uploadAvatar,
  uploadController.uploadAvatar
)

// Course thumbnail upload (instructors only)
router.post(
  '/course-thumbnail',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  setUploadType('courses'),
  uploadCourseThumbnail,
  uploadController.uploadCourseThumbnail
)

// Lesson attachment upload (instructors only)
router.post(
  '/lesson-attachment',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  setUploadType('lessons'),
  uploadLessonAttachment,
  uploadController.uploadLessonAttachment
)

// Delete file
router.delete('/file', uploadController.deleteFile)

export default router
