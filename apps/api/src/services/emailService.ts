import nodemailer from 'nodemailer'
import { env } from '../config/env'
import { welcomeEmail } from '../templates/emails/welcome'
import { certificateEmail } from '../templates/emails/certificate'
import { courseEnrollmentEmail } from '../templates/emails/courseEnrollment'
import { passwordResetEmail } from '../templates/emails/passwordReset'
import { courseApprovedEmail } from '../templates/emails/courseApproved'
import { courseRejectedEmail } from '../templates/emails/courseRejected'
import { achievementEmail } from '../templates/emails/achievement'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  /**
   * Send email
   */
  async sendEmail({ to, subject, html, text }: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Edu Platforma" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text: text || this.htmlToText(html),
      })
    } catch (error) {
      console.error('Email send error:', error)
      // Don't throw error - log it but don't fail the operation
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string, verificationUrl?: string): Promise<void> {
    const html = welcomeEmail({
      firstName: name,
      verificationUrl,
    })

    await this.sendEmail({
      to: email,
      subject: 'Dobrodošli na Edu Platformu!',
      html,
    })
  }

  /**
   * Send certificate notification
   */
  async sendCertificateEmail(
    email: string,
    name: string,
    courseTitle: string,
    certificateUrl: string,
    cpdPoints?: number,
    cmeCredits?: number
  ): Promise<void> {
    const html = certificateEmail({
      firstName: name,
      courseTitle,
      certificateUrl,
      cpdPoints,
      cmeCredits,
    })

    await this.sendEmail({
      to: email,
      subject: 'Čestitamo! Zaradili ste certifikat 🎉',
      html,
    })
  }

  /**
   * Send achievement notification
   */
  async sendAchievementEmail(
    email: string,
    name: string,
    achievementName: string,
    achievementDescription: string,
    points: number,
    achievementIcon: string = '🏆',
    rarity?: string,
    category?: string
  ): Promise<void> {
    const html = achievementEmail({
      firstName: name,
      achievementName,
      achievementDescription,
      achievementIcon,
      points,
      rarity,
      category,
    })

    await this.sendEmail({
      to: email,
      subject: `Novo postignuće: ${achievementName} 🎉`,
      html,
    })
  }

  /**
   * Send forum reply notification
   */
  async sendForumReplyEmail(
    email: string,
    name: string,
    postTitle: string,
    replierName: string,
    postUrl: string
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">💬 Novi komentar na vašu temu</h1>
        <p>Zdravo ${name},</p>
        <p>${replierName} je komentirao vašu forum temu:</p>
        <h3 style="color: #1f2937;">${postTitle}</h3>
        <a href="${postUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Pogledaj komentar
        </a>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Hvala,<br>
          Tim Edu Platforme
        </p>
      </div>
    `

    await this.sendEmail({
      to: email,
      subject: `Novi komentar: ${postTitle}`,
      html,
    })
  }

  /**
   * Send course enrollment confirmation
   */
  async sendEnrollmentEmail(
    email: string,
    name: string,
    courseTitle: string,
    courseUrl: string,
    instructorName?: string,
    thumbnail?: string
  ): Promise<void> {
    const html = courseEnrollmentEmail({
      firstName: name,
      courseTitle,
      courseUrl,
      instructorName,
      thumbnail,
    })

    await this.sendEmail({
      to: email,
      subject: `Uspješan upis na tečaj: ${courseTitle} 🚀`,
      html,
    })
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string
  ): Promise<void> {
    const resetUrl = `${env.WEB_URL}/reset-password?token=${resetToken}`

    const html = passwordResetEmail({
      firstName: name,
      resetUrl,
    })

    await this.sendEmail({
      to: email,
      subject: 'Resetiranje lozinke 🔒',
      html,
    })
  }

  /**
   * Send course approved notification (for instructors)
   */
  async sendCourseApprovedEmail(
    email: string,
    instructorName: string,
    courseTitle: string,
    courseUrl: string
  ): Promise<void> {
    const html = courseApprovedEmail({
      instructorName,
      courseTitle,
      courseUrl,
    })

    await this.sendEmail({
      to: email,
      subject: `Vaš tečaj "${courseTitle}" je odobren! 🎉`,
      html,
    })
  }

  /**
   * Send course rejected notification (for instructors)
   */
  async sendCourseRejectedEmail(
    email: string,
    instructorName: string,
    courseTitle: string,
    reason: string,
    dashboardUrl: string
  ): Promise<void> {
    const html = courseRejectedEmail({
      instructorName,
      courseTitle,
      reason,
      dashboardUrl,
    })

    await this.sendEmail({
      to: email,
      subject: `Tečaj "${courseTitle}" zahtijeva izmjene`,
      html,
    })
  }

  /**
   * Convert HTML to plain text (basic implementation)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*<\/style>/gm, '')
      .replace(/<script[^>]*>.*<\/script>/gm, '')
      .replace(/<[^>]+>/gm, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
}

export const emailService = new EmailService()
