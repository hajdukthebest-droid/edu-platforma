import nodemailer from 'nodemailer'
import { env } from '../config/env'

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
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Dobrodošli u Edu Platforma!</h1>
        <p>Zdravo ${name},</p>
        <p>Dobrodošli u našu platformu za online učenje. Zahvaljujemo što ste se pridružili!</p>
        <p>Sada možete:</p>
        <ul>
          <li>Pregledati dostupne kurseve</li>
          <li>Upisati se na kurseve koji vas zanimaju</li>
          <li>Pratiti svoj napredak</li>
          <li>Osvajati bedževe i postignuća</li>
        </ul>
        <a href="${env.WEB_URL}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Započni učenje
        </a>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Hvala,<br>
          Tim Edu Platforme
        </p>
      </div>
    `

    await this.sendEmail({
      to: email,
      subject: 'Dobrodošli u Edu Platforma!',
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
    certificateUrl: string
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">🎉 Čestitamo! Osvojili ste certifikat!</h1>
        <p>Zdravo ${name},</p>
        <p>Čestitamo na uspješnom završetku kursa:</p>
        <h2 style="color: #2563eb;">${courseTitle}</h2>
        <p>Vaš certifikat je spreman i možete ga preuzeti klikom na dugme ispod:</p>
        <a href="${certificateUrl}" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Preuzmi certifikat
        </a>
        <p>Certifikat možete koristiti za:</p>
        <ul>
          <li>Dijeljenje na društvenim mrežama</li>
          <li>Dodavanje u CV</li>
          <li>Prikazivanje poslodavcima</li>
        </ul>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Hvala,<br>
          Tim Edu Platforme
        </p>
      </div>
    `

    await this.sendEmail({
      to: email,
      subject: `Certifikat za kurs: ${courseTitle}`,
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
    points: number
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f59e0b;">🏆 Novo postignuće otključano!</h1>
        <p>Zdravo ${name},</p>
        <p>Čestitamo! Otključali ste novo postignuće:</p>
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #f59e0b; margin: 0 0 10px 0;">${achievementName}</h2>
          <p style="margin: 0 0 10px 0;">${achievementDescription}</p>
          <p style="margin: 0; font-weight: bold; color: #f59e0b;">+${points} bodova</p>
        </div>
        <a href="${env.WEB_URL}/achievements" style="display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Pogledaj sva postignuća
        </a>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Hvala,<br>
          Tim Edu Platforme
        </p>
      </div>
    `

    await this.sendEmail({
      to: email,
      subject: `Novo postignuće: ${achievementName}`,
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
    courseUrl: string
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">✅ Uspješno ste se upisali!</h1>
        <p>Zdravo ${name},</p>
        <p>Uspješno ste se upisali na kurs:</p>
        <h2 style="color: #2563eb;">${courseTitle}</h2>
        <a href="${courseUrl}" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Započni kurs
        </a>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Hvala,<br>
          Tim Edu Platforme
        </p>
      </div>
    `

    await this.sendEmail({
      to: email,
      subject: `Upis na kurs: ${courseTitle}`,
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

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">🔒 Resetiranje lozinke</h1>
        <p>Zdravo ${name},</p>
        <p>Primili smo zahtjev za resetiranje vaše lozinke. Kliknite na dugme ispod da postavite novu lozinku:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Resetiraj lozinku
        </a>
        <p style="color: #6b7280; font-size: 14px;">
          Ovaj link je valjan 1 sat.<br>
          Ako niste zatražili resetiranje lozinke, ignorirajte ovaj email.
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Hvala,<br>
          Tim Edu Platforme
        </p>
      </div>
    `

    await this.sendEmail({
      to: email,
      subject: 'Resetiranje lozinke - Edu Platforma',
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
