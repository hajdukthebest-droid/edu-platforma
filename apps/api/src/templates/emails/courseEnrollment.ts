import { baseEmailTemplate, emailButton, emailInfoBox } from './base'

interface CourseEnrollmentEmailProps {
  firstName: string
  courseTitle: string
  courseUrl: string
  instructorName: string
  thumbnail?: string
}

export const courseEnrollmentEmail = ({
  firstName,
  courseTitle,
  courseUrl,
  instructorName,
  thumbnail,
}: CourseEnrollmentEmailProps): string => {
  const content = `
<h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">
  Uspješna upis, ${firstName}! 🚀
</h2>

<p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
  Uspješno ste se upisali na tečaj i spremni ste za početak učenja!
</p>

${thumbnail ? `
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
  <tr>
    <td align="center">
      <img src="${thumbnail}" alt="${courseTitle}" style="max-width: 100%; height: auto; border-radius: 8px; display: block;" />
    </td>
  </tr>
</table>
` : ''}

${emailInfoBox(`<strong>${courseTitle}</strong><br><small>Instruktor: ${instructorName}</small>`, 'success')}

<h3 style="margin: 30px 0 16px; color: #111827; font-size: 18px; font-weight: 600;">
  Sljedeći koraci:
</h3>

<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="padding: 12px 0;">
      <table border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width: 32px; vertical-align: top;">
            <div style="width: 28px; height: 28px; background-color: #3B82F6; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; text-align: center; line-height: 28px;">
              1
            </div>
          </td>
          <td style="padding-left: 12px;">
            <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
              <strong>Započnite s prvom lekcijom</strong><br>
              <span style="color: #6b7280; font-size: 14px;">Pristupite tečaju i pogledajte uvod</span>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 12px 0;">
      <table border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width: 32px; vertical-align: top;">
            <div style="width: 28px; height: 28px; background-color: #3B82F6; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; text-align: center; line-height: 28px;">
              2
            </div>
          </td>
          <td style="padding-left: 12px;">
            <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
              <strong>Učite u svom tempu</strong><br>
              <span style="color: #6b7280; font-size: 14px;">Dostupno 24/7, bez vremenskih ograničenja</span>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 12px 0;">
      <table border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width: 32px; vertical-align: top;">
            <div style="width: 28px; height: 28px; background-color: #3B82F6; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; text-align: center; line-height: 28px;">
              3
            </div>
          </td>
          <td style="padding-left: 12px;">
            <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
              <strong>Zaradite certifikat</strong><br>
              <span style="color: #6b7280; font-size: 14px;">Završite sve lekcije i dobijte službeni certifikat</span>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

${emailButton('Počni Učiti', courseUrl)}

<p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
  💡 <strong>Savjet:</strong> Vaš napredak se automatski sprema, tako da možete nastaviti tamo gdje ste stali u bilo kojem trenutku!
</p>
  `

  return baseEmailTemplate({
    preheader: `Započnite s tečajem: ${courseTitle}`,
    content,
  })
}
