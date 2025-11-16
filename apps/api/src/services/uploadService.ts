import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { AppError } from '../middleware/errorHandler'

export class UploadService {
  private uploadBaseUrl: string

  constructor() {
    this.uploadBaseUrl = process.env.UPLOAD_BASE_URL || 'http://localhost:3001'
  }

  /**
   * Process and optimize avatar image
   */
  async processAvatar(filePath: string): Promise<string> {
    const outputPath = filePath.replace(
      path.extname(filePath),
      '-processed' + path.extname(filePath)
    )

    try {
      await sharp(filePath)
        .resize(400, 400, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 90 })
        .toFile(outputPath)

      // Delete original file
      fs.unlinkSync(filePath)

      return this.getPublicUrl(outputPath)
    } catch (error) {
      // If processing fails, still return original file
      return this.getPublicUrl(filePath)
    }
  }

  /**
   * Process and optimize course thumbnail
   */
  async processThumbnail(filePath: string): Promise<string> {
    const outputPath = filePath.replace(
      path.extname(filePath),
      '-processed' + path.extname(filePath)
    )

    try {
      await sharp(filePath)
        .resize(1200, 675, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath)

      // Delete original file
      fs.unlinkSync(filePath)

      return this.getPublicUrl(outputPath)
    } catch (error) {
      return this.getPublicUrl(filePath)
    }
  }

  /**
   * Process multiple images
   */
  async processImages(filePaths: string[]): Promise<string[]> {
    const processedUrls: string[] = []

    for (const filePath of filePaths) {
      const outputPath = filePath.replace(
        path.extname(filePath),
        '-processed' + path.extname(filePath)
      )

      try {
        await sharp(filePath)
          .resize(800, 600, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85 })
          .toFile(outputPath)

        fs.unlinkSync(filePath)
        processedUrls.push(this.getPublicUrl(outputPath))
      } catch (error) {
        processedUrls.push(this.getPublicUrl(filePath))
      }
    }

    return processedUrls
  }

  /**
   * Get public URL for file
   */
  getPublicUrl(filePath: string): string {
    const relativePath = filePath.replace(
      path.join(__dirname, '../../uploads'),
      ''
    )
    return `${this.uploadBaseUrl}/uploads${relativePath}`
  }

  /**
   * Delete file by URL
   */
  deleteFileByUrl(fileUrl: string): void {
    const filePath = fileUrl.replace(
      this.uploadBaseUrl,
      path.join(__dirname, '../..')
    )

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }

  /**
   * Validate file size
   */
  validateFileSize(size: number, maxSizeMB: number): void {
    const maxBytes = maxSizeMB * 1024 * 1024
    if (size > maxBytes) {
      throw new AppError(400, `File size exceeds ${maxSizeMB}MB limit`)
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(filePath: string): Promise<{
    size: number
    mimeType: string
    dimensions?: { width: number; height: number }
  }> {
    const stats = fs.statSync(filePath)
    const mimeType = this.getMimeType(filePath)

    let dimensions
    if (mimeType.startsWith('image/')) {
      try {
        const metadata = await sharp(filePath).metadata()
        dimensions = {
          width: metadata.width || 0,
          height: metadata.height || 0,
        }
      } catch (error) {
        // Ignore metadata errors
      }
    }

    return {
      size: stats.size,
      mimeType,
      dimensions,
    }
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase()
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
    }
    return mimeTypes[ext] || 'application/octet-stream'
  }
}

export const uploadService = new UploadService()
