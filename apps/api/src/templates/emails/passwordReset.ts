import { baseEmailTemplate, emailButton, emailInfoBox } from './base'

interface PasswordResetEmailProps {
  firstName: string
  resetUrl: string
}

export const passwordResetEmail = ({ firstName, resetUrl }: PasswordResetEmailProps): string => {
  const content = `
<h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">
  Resetiranje lozinke 🔒
</h2>

<p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
  Pozdrav ${firstName},
</p>

<p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
  Primili smo zahtjev za resetiranje lozinke za vaš Edu Platforma račun. Kliknite na gumb ispod da kreirate novu lozinku.
</p>

${emailButton('Resetiraj Lozinku', resetUrl, '#DC2626')}

${emailInfoBox('⏱️ Ovaj link će isteći za 1 sat iz sigurnosnih razloga.', 'warning')}

<p style="margin: 20px 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
  Ako niste zatražili resetiranje lozinke, možete sigurno zanemariti ovaj email. Vaša lozinka neće biti promijenjena.
</p>

<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; background-color: #FEF3C7; border-radius: 8px; padding: 16px; border-left: 4px solid #F59E0B;">
  <tr>
    <td>
      <p style="margin: 0 0 8px; color: #92400E; font-size: 14px; font-weight: 600;">
        🛡️ Sigurnosni savjeti:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #92400E; font-size: 14px; line-height: 1.6;">
        <li>Nemojte dijeliti ovaj link s drugima</li>
        <li>Koristite snažnu, jedinstvenu lozinku</li>
        <li>Razmislite o korištenju managera lozinki</li>
      </ul>
    </td>
  </tr>
</table>

<p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
  Ako imate problema s resetiranjem lozinke, kontaktirajte našu podršku.
</p>
  `

  return baseEmailTemplate({
    preheader: 'Resetirajte vašu Edu Platforma lozinku',
    content,
  })
}
