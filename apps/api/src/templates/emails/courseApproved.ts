import { baseEmailTemplate, emailButton, emailInfoBox } from './base'

interface CourseApprovedEmailProps {
  instructorName: string
  courseTitle: string
  courseUrl: string
}

export const courseApprovedEmail = ({
  instructorName,
  courseTitle,
  courseUrl,
}: CourseApprovedEmailProps): string => {
  const content = `
<h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">
  Čestitamo, ${instructorName}! 🎉
</h2>

<p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
  Vaš tečaj je uspješno odobren i objavljen na Edu Platformi!
</p>

${emailInfoBox(`✅ <strong>${courseTitle}</strong> je sada dostupan svim polaznicima!`, 'success')}

<p style="margin: 20px 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
  Vaš tečaj je prošao našu provjeru kvalitete i ispunjava sve standarde. Sada je vidljiv tisućama potencijalnih polaznika.
</p>

<h3 style="margin: 30px 0 16px; color: #111827; font-size: 18px; font-weight: 600;">
  Što dalje?
</h3>

<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="padding: 8px 0;">
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
        📊 <strong>Pratite statistike</strong> - Provjerite koliko polaznika se upisalo
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 8px 0;">
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
        💬 <strong>Odgovarajte na pitanja</strong> - Budite aktivni u diskusijama
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 8px 0;">
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
        📈 <strong>Unaprijedite sadržaj</strong> - Dodajte nove lekcije i materijale
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 8px 0;">
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
        ⭐ <strong>Prikupite recenzije</strong> - Potaknite polaznike na feedback
      </p>
    </td>
  </tr>
</table>

${emailButton('Pogledaj Tečaj', courseUrl)}

<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0; background-color: #EFF6FF; border-radius: 8px; padding: 16px;">
  <tr>
    <td>
      <p style="margin: 0 0 8px; color: #1E40AF; font-size: 14px; font-weight: 600;">
        💡 Savjet za promociju:
      </p>
      <p style="margin: 0; color: #1E40AF; font-size: 14px; line-height: 1.6;">
        Podijelite link na svoje društvene mreže kako biste privukli više polaznika. Što više polaznika, to veća zarada!
      </p>
    </td>
  </tr>
</table>

<p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
  Hvala što doprinosite Edu Platforma zajednici. Radujemo se vašim budućim tečajevima!
</p>
  `

  return baseEmailTemplate({
    preheader: `Vaš tečaj "${courseTitle}" je odobren!`,
    content,
  })
}
