import { baseEmailTemplate, emailButton, emailInfoBox } from './base'

interface CertificateEmailProps {
  firstName: string
  courseTitle: string
  certificateUrl: string
  cpdPoints?: number
  cmeCredits?: number
}

export const certificateEmail = ({
  firstName,
  courseTitle,
  certificateUrl,
  cpdPoints,
  cmeCredits,
}: CertificateEmailProps): string => {
  const content = `
<h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">
  Čestitamo, ${firstName}! 🎉
</h2>

<p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
  Uspješno ste završili tečaj i zaradili certifikat!
</p>

${emailInfoBox(`🎓 <strong>${courseTitle}</strong>`, 'success')}

<p style="margin: 20px 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
  Vaš certifikat je spreman za preuzimanje. Možete ga koristiti za:
</p>

<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="padding: 8px 0;">
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
        ✓ Dodavanje u svoj CV ili LinkedIn profil
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 8px 0;">
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
        ✓ Dokazivanje stručnog razvoja poslodavcu
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 8px 0;">
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
        ✓ Ispunjavanje CPD/CME zahtjeva (ako primjenjivo)
      </p>
    </td>
  </tr>
</table>

${cpdPoints || cmeCredits ? `
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; background-color: #F0FDF4; border-radius: 8px; padding: 16px;">
  <tr>
    <td>
      <p style="margin: 0 0 8px; color: #166534; font-size: 14px; font-weight: 600;">
        Profesionalni krediti:
      </p>
      ${cpdPoints ? `<p style="margin: 0; color: #166534; font-size: 14px;">🏅 ${cpdPoints} CPD bodova</p>` : ''}
      ${cmeCredits ? `<p style="margin: 0; color: #166534; font-size: 14px;">⭐ ${cmeCredits} CME kredita</p>` : ''}
    </td>
  </tr>
</table>
` : ''}

${emailButton('Preuzmi Certifikat', certificateUrl)}

<p style="margin: 30px 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
  Želite naučiti još? Pogledajte naše preporuke za sljedeće tečajeve koji bi vas mogli zanimati.
</p>

${emailButton('Pogledaj Tečajeve', `${process.env.FRONTEND_URL}/courses`, '#8B5CF6')}

<p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
  Ponosni smo na vaše postignuće i nadamo se da ćete nastaviti svoje putovanje učenja s nama!
</p>
  `

  return baseEmailTemplate({
    preheader: `Čestitamo! Zaradili ste certifikat za ${courseTitle}`,
    content,
  })
}
