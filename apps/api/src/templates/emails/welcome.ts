import { baseEmailTemplate, emailButton, emailInfoBox } from './base'

interface WelcomeEmailProps {
  firstName: string
  verificationUrl?: string
}

export const welcomeEmail = ({ firstName, verificationUrl }: WelcomeEmailProps): string => {
  const content = `
<h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">
  Dobrodošli, ${firstName}! 👋
</h2>

<p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
  Drago nam je što ste se pridružili Edu Platformi - vašem novom partneru na putu učenja i razvoja!
</p>

<p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
  Edu Platforma nudi pristup tisućama kvalitetnih tečajeva u različitim područjima - od tehnologije, zdravstva, poslovanja do kreativnosti i osobnog razvoja.
</p>

${verificationUrl ? emailButton('Verificiraj Email', verificationUrl, '#22C55E') : ''}

${emailInfoBox('💡 Savjet: Započnite s odabirom svoje domene interesa kako bismo vam mogli preporučiti relevantne tečajeve!', 'info')}

<h3 style="margin: 30px 0 16px; color: #111827; font-size: 18px; font-weight: 600;">
  Što možete raditi na platformi:
</h3>

<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="padding: 12px 0;">
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
        📚 <strong>Pregledajte tečajeve</strong> - Pronađite savršeni tečaj za vaše ciljeve
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 12px 0;">
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
        🎓 <strong>Učite u svom tempu</strong> - Video lekcije dostupne 24/7
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 12px 0;">
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
        🏆 <strong>Zaradite certifikate</strong> - Profesionalni certifikati nakon završetka
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 12px 0;">
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
        💬 <strong>Razgovarajte s drugima</strong> - Forum zajednica za pomoć i diskusiju
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 12px 0;">
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
        📊 <strong>Pratite napredak</strong> - Detaljni insights o vašem učenju
      </p>
    </td>
  </tr>
</table>

${emailButton('Počni Istraživati', `${process.env.FRONTEND_URL}/domains`)}

<p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
  Ako imate bilo kakvih pitanja, slobodno nas kontaktirajte. Tu smo da vam pomognemo!
</p>
  `

  return baseEmailTemplate({
    preheader: `Dobrodošli na Edu Platformu, ${firstName}!`,
    content,
  })
}
