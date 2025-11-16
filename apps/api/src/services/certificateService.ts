import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import crypto from 'crypto'
import { notificationService } from './notificationService'

export class CertificateService {
  async issueCertificate(userId: string, courseId: string) {
    // Check if course is completed
    const progress = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: true,
        user: true,
      },
    })

    if (!progress) {
      throw new AppError(404, 'Course progress not found')
    }

    if (progress.progressPercentage < 100) {
      throw new AppError(400, 'Course not completed yet')
    }

    // Check if certificate already exists
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        userId,
        courseId,
      },
    })

    if (existingCertificate) {
      return existingCertificate
    }

    // Generate unique certificate number
    const certificateNumber = this.generateCertificateNumber()

    // Calculate expiry date if course has CPD points
    let expiryDate = null
    if (progress.course.cpdPoints && progress.course.cpdPoints > 0) {
      expiryDate = new Date()
      expiryDate.setFullYear(expiryDate.getFullYear() + 3) // Valid for 3 years
    }

    // Create certificate
    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        certificateNumber,
        title: `Certificate of Completion - ${progress.course.title}`,
        description: `This is to certify that ${progress.user.firstName} ${progress.user.lastName} has successfully completed the course "${progress.course.title}".`,
        expiryDate,
        verificationUrl: `${process.env.FRONTEND_URL}/verify/${certificateNumber}`,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            cpdPoints: true,
            cmeCredits: true,
          },
        },
      },
    })

    // Send notification
    await notificationService.notifyCertificate(userId, progress.course.title, certificate.id)

    return certificate
  }

  async getCertificate(id: string, userId: string) {
    const certificate = await prisma.certificate.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            cpdPoints: true,
            cmeCredits: true,
          },
        },
      },
    })

    if (!certificate) {
      throw new AppError(404, 'Certificate not found')
    }

    return certificate
  }

  async getUserCertificates(userId: string) {
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            cpdPoints: true,
            cmeCredits: true,
          },
        },
      },
      orderBy: {
        issueDate: 'desc',
      },
    })

    return certificates
  }

  async verifyCertificate(certificateNumber: string) {
    const certificate = await prisma.certificate.findUnique({
      where: { certificateNumber },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!certificate) {
      throw new AppError(404, 'Certificate not found')
    }

    // Check if expired
    const isExpired = certificate.expiryDate && new Date() > certificate.expiryDate

    return {
      ...certificate,
      isValid: !isExpired,
      isExpired,
    }
  }

  private generateCertificateNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = crypto.randomBytes(4).toString('hex').toUpperCase()
    return `CERT-${timestamp}-${random}`
  }

  async generatePDF(certificateId: string, userId: string) {
    const certificate = await this.getCertificate(certificateId, userId)

    // TODO: Implement PDF generation using puppeteer or pdfkit
    // For now, return certificate data that can be used by frontend
    return {
      certificateNumber: certificate.certificateNumber,
      recipientName: `${certificate.user.firstName} ${certificate.user.lastName}`,
      courseName: certificate.course.title,
      issueDate: certificate.issueDate,
      expiryDate: certificate.expiryDate,
      cpdPoints: certificate.course.cpdPoints,
      verificationUrl: certificate.verificationUrl,
    }
  }
}

export const certificateService = new CertificateService()
