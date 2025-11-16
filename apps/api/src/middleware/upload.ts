import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { Request } from 'express'
import { AppError } from './errorHandler'

// Ensure upload directories exist
const uploadDirs = {
  avatars: path.join(__dirname, '../../uploads/avatars'),
  courses: path.join(__dirname, '../../uploads/courses'),
  lessons: path.join(__dirname, '../../uploads/lessons'),
  certificates: path.join(__dirname, '../../uploads/certificates'),
}

Object.values(uploadDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

// Storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const uploadType = (req as any).uploadType || 'avatars'
    cb(null, uploadDirs[uploadType as keyof typeof uploadDirs])
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  },
})

// File filter for images
const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new AppError(400, 'Only image files are allowed (JPEG, PNG, GIF, WebP)'))
  }
}

// File filter for documents
const documentFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ]

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new AppError(400, 'Only document files are allowed (PDF, DOC, DOCX, PPT, PPTX, TXT)'))
  }
}

// Upload configurations
export const uploadAvatar = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single('avatar')

export const uploadCourseThumbnail = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
}).single('thumbnail')

export const uploadLessonAttachment = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
}).single('attachment')

export const uploadMultipleImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10, // Maximum 10 files
  },
}).array('images', 10)

// Middleware to set upload type
export const setUploadType = (type: keyof typeof uploadDirs) => {
  return (req: Request, res: any, next: any) => {
    (req as any).uploadType = type
    next()
  }
}

// Helper to delete file
export const deleteFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}
