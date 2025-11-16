import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import crypto from 'crypto'
import { notificationService } from './notificationService'
import { emailService } from './emailService'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

export class CertificateService {
  private uploadDir = path.join(__dirname, '../../uploads/certificates')

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

    // Send email notification (don't await to not block response)
    const certificateUrl = `${process.env.FRONTEND_URL}/certificates/${certificate.id}`
    emailService.sendCertificateEmail(
      certificate.user.email,
      certificate.user.firstName || 'Korisniče',
      certificate.course.title,
      certificateUrl,
      certificate.course.cpdPoints || undefined,
      certificate.course.cmeCredits || undefined
    ).catch(err => console.error('Failed to send certificate email:', err))

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

  async generatePDF(certificateId: string, userId: string): Promise<string> {
    const certificate = await this.getCertificate(certificateId, userId)

    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }

    const fileName = `certificate-${certificate.certificateNumber}.pdf`
    const filePath = path.join(this.uploadDir, fileName)

    // If PDF already exists, return it
    if (fs.existsSync(filePath)) {
      return filePath
    }

    // Generate PDF
    await this.createPDFDocument(certificate, filePath)

    // Update certificate with PDF URL
    await prisma.certificate.update({
      where: { id: certificateId },
      data: {
        pdfUrl: `/uploads/certificates/${fileName}`,
      },
    })

    return filePath
  }

  private async createPDFDocument(certificate: any, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create PDF document in A4 landscape format
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        })

        // Pipe to file
        const stream = fs.createWriteStream(filePath)
        doc.pipe(stream)

        // Page dimensions (A4 landscape)
        const pageWidth = 842
        const pageHeight = 595

        // Colors
        const primaryColor = '#3B82F6' // Blue
        const goldColor = '#F59E0B' // Gold
        const textColor = '#1F2937' // Dark gray

        // ==================== BORDER & DECORATIVE ELEMENTS ====================

        // Outer border (gold)
        doc
          .rect(20, 20, pageWidth - 40, pageHeight - 40)
          .lineWidth(3)
          .stroke(goldColor)

        // Inner border (blue)
        doc
          .rect(30, 30, pageWidth - 60, pageHeight - 60)
          .lineWidth(1)
          .stroke(primaryColor)

        // Decorative corners
        // Top-left corner
        doc
          .moveTo(40, 60)
          .lineTo(40, 40)
          .lineTo(60, 40)
          .lineWidth(2)
          .stroke(goldColor)

        // Top-right corner
        doc
          .moveTo(pageWidth - 60, 40)
          .lineTo(pageWidth - 40, 40)
          .lineTo(pageWidth - 40, 60)
          .lineWidth(2)
          .stroke(goldColor)

        // Bottom-left corner
        doc
          .moveTo(40, pageHeight - 60)
          .lineTo(40, pageHeight - 40)
          .lineTo(60, pageHeight - 40)
          .lineWidth(2)
          .stroke(goldColor)

        // Bottom-right corner
        doc
          .moveTo(pageWidth - 60, pageHeight - 40)
          .lineTo(pageWidth - 40, pageHeight - 40)
          .lineTo(pageWidth - 40, pageHeight - 60)
          .lineWidth(2)
          .stroke(goldColor)

        // ==================== HEADER ====================

        // Platform logo/name
        doc
          .fontSize(28)
          .font('Helvetica-Bold')
          .fillColor(primaryColor)
          .text('EDU PLATFORMA', 0, 70, {
            align: 'center',
            width: pageWidth,
          })

        // Decorative line under header
        doc
          .moveTo(pageWidth / 2 - 100, 110)
          .lineTo(pageWidth / 2 + 100, 110)
          .lineWidth(2)
          .stroke(goldColor)

        // ==================== CERTIFICATE TITLE ====================

        doc
          .fontSize(48)
          .font('Helvetica-Bold')
          .fillColor(textColor)
          .text('CERTIFIKAT', 0, 140, {
            align: 'center',
            width: pageWidth,
          })

        doc
          .fontSize(16)
          .font('Helvetica')
          .fillColor('#6B7280')
          .text('O ZAVRŠETKU TEČAJA', 0, 195, {
            align: 'center',
            width: pageWidth,
          })

        // ==================== RECIPIENT SECTION ====================

        doc
          .fontSize(14)
          .font('Helvetica')
          .fillColor('#6B7280')
          .text('Ovo je da potvrdi da je', 0, 240, {
            align: 'center',
            width: pageWidth,
          })

        // Student name (highlighted)
        const studentName = `${certificate.user.firstName} ${certificate.user.lastName}`
        doc
          .fontSize(32)
          .font('Helvetica-Bold')
          .fillColor(primaryColor)
          .text(studentName, 0, 270, {
            align: 'center',
            width: pageWidth,
          })

        // Decorative line under name
        const nameWidth = doc.widthOfString(studentName)
        const nameX = (pageWidth - nameWidth) / 2
        doc
          .moveTo(nameX, 315)
          .lineTo(nameX + nameWidth, 315)
          .lineWidth(2)
          .stroke(goldColor)

        doc
          .fontSize(14)
          .font('Helvetica')
          .fillColor('#6B7280')
          .text('uspješno završio/la tečaj', 0, 330, {
            align: 'center',
            width: pageWidth,
          })

        // Course title (highlighted)
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .fillColor(textColor)
          .text(certificate.course.title, 80, 365, {
            align: 'center',
            width: pageWidth - 160,
          })

        // ==================== DETAILS SECTION ====================

        const detailsY = 430

        // Certificate number
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#6B7280')
          .text('Broj certifikata:', 100, detailsY)

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor(textColor)
          .text(certificate.certificateNumber, 100, detailsY + 15)

        // Issue date
        const issueDate = new Date(certificate.issueDate).toLocaleDateString('hr-HR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#6B7280')
          .text('Datum izdavanja:', pageWidth / 2 - 80, detailsY, {
            align: 'center',
            width: 160,
          })

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor(textColor)
          .text(issueDate, pageWidth / 2 - 80, detailsY + 15, {
            align: 'center',
            width: 160,
          })

        // CPD Points or CME Credits (if available)
        if (certificate.course.cpdPoints && certificate.course.cpdPoints > 0) {
          doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .fillColor('#6B7280')
            .text('CPD Bodovi:', pageWidth - 200, detailsY)

          doc
            .fontSize(10)
            .font('Helvetica')
            .fillColor(textColor)
            .text(`${certificate.course.cpdPoints} bodova`, pageWidth - 200, detailsY + 15)
        } else if (certificate.course.cmeCredits && certificate.course.cmeCredits > 0) {
          doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .fillColor('#6B7280')
            .text('CME Krediti:', pageWidth - 200, detailsY)

          doc
            .fontSize(10)
            .font('Helvetica')
            .fillColor(textColor)
            .text(`${certificate.course.cmeCredits} kredita`, pageWidth - 200, detailsY + 15)
        }

        // ==================== SIGNATURE SECTION ====================

        const signatureY = 500

        // Platform signature
        doc
          .fontSize(9)
          .font('Helvetica-Bold')
          .fillColor(textColor)
          .text('Edu Platforma', 100, signatureY)

        doc.moveTo(100, signatureY - 5).lineTo(250, signatureY - 5).lineWidth(1).stroke('#D1D5DB')

        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#6B7280')
          .text('Ovlašteni predstavnik', 100, signatureY + 12)

        // Verification checkmark
        doc
          .circle(pageWidth / 2, signatureY + 5, 15)
          .lineWidth(1)
          .stroke(goldColor)

        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor(goldColor)
          .text('✓', pageWidth / 2 - 5, signatureY - 1)

        // Expiry date (if applicable)
        if (certificate.expiryDate) {
          const expiryDate = new Date(certificate.expiryDate).toLocaleDateString('hr-HR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })

          doc
            .fontSize(9)
            .font('Helvetica')
            .fillColor(textColor)
            .text(`Vrijedi do: ${expiryDate}`, pageWidth - 250, signatureY)

          doc
            .moveTo(pageWidth - 250, signatureY - 5)
            .lineTo(pageWidth - 100, signatureY - 5)
            .lineWidth(1)
            .stroke('#D1D5DB')

          doc
            .fontSize(8)
            .font('Helvetica')
            .fillColor('#6B7280')
            .text('Datum isteka', pageWidth - 250, signatureY + 12)
        }

        // ==================== FOOTER ====================

        // Verification link
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#9CA3AF')
          .text(
            `Verifikacija: ${certificate.verificationUrl || `www.edu-platforma.hr/verify/${certificate.certificateNumber}`}`,
            0,
            pageHeight - 35,
            {
              align: 'center',
              width: pageWidth,
            }
          )

        // Finalize PDF
        doc.end()

        stream.on('finish', () => {
          resolve()
        })

        stream.on('error', (err) => {
          reject(err)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Download certificate PDF
   */
  async downloadCertificatePDF(certificateId: string, userId: string): Promise<string> {
    const certificate = await this.getCertificate(certificateId, userId)

    // If PDF exists, return path
    if (certificate.pdfUrl) {
      const fileName = path.basename(certificate.pdfUrl)
      const filePath = path.join(this.uploadDir, fileName)

      if (fs.existsSync(filePath)) {
        return filePath
      }
    }

    // Generate PDF if it doesn't exist
    return await this.generatePDF(certificateId, userId)
  }
}

export const certificateService = new CertificateService()
