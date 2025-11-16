import { baseEmailTemplate, emailButton, emailInfoBox } from './base'

interface CourseRejectedEmailProps {
  instructorName: string
  courseTitle: string
  reason: string
  dashboardUrl: string
}

export const courseRejectedEmail = ({
  instructorName,
  courseTitle,
  reason,
  dashboardUrl,
}: CourseRejectedEmailProps): string => {
  const content = `
<h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">
  Zdravo ${instructorName},
</h2>

<p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
  Nažalost, vaš tečaj trenutno ne može biti objavljen na platformi.
</p>

${emailInfoBox(`📚 <strong>${courseTitle}</strong>`, 'warning')}

<h3 style="margin: 30px 0 16px; color: #111827; font-size: 18px; font-weight: 600;">
  Razlog odbijanja:
</h3>

<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px; background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 4px; padding: 16px;">
  <tr>
    <td>
      <p style="margin: 0; color: #92400E; font-size: 15px; line-height: 1.6;">
        ${reason}
      </p>
    </td>
  </tr>
</table>

<h3 style="margin: 30px 0 16px; color: #111827; font-size: 18px; font-weight: 600;">
  Što dalje?
</h3>

<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="padding: 8px 0;">
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
        ✏️ <strong>Uredite sadržaj</strong> - Ispravite navedene nedostatke
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 8px 0;">
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
        📋 <strong>Provjerite smjernice</strong> - Osigurajte da tečaj zadovoljava sve standarde
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 8px 0;">
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
        🔄 <strong>Ponovo podnesite</strong> - Nakon izmjena, pošaljite tečaj na pregled
      </p>
    </td>
  </tr>
</table>

${emailButton('Uredi Tečaj', dashboardUrl, '#F59E0B')}

<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0; background-color: #EFF6FF; border-radius: 8px; padding: 16px;">
  <tr>
    <td>
      <p style="margin: 0 0 8px; color: #1E40AF; font-size: 14px; font-weight: 600;">
        💡 Savjet:
      </p>
      <p style="margin: 0; color: #1E40AF; font-size: 14px; line-height: 1.6;">
        Pregledajte naše smjernice za kreiranje kvalitetnih tečajeva i provjerite da li su svi materijali jasni, profesionalni i relevantni.
      </p>
    </td>
  </tr>
</table>

<p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
  Radujemo se vašem poboljšanom tečaju. Ako imate dodatnih pitanja, slobodno nas kontaktirajte!
</p>
  `

  return baseEmailTemplate({
    preheader: `Vaš tečaj "${courseTitle}" zahtijeva izmjene`,
    content,
  })
}
