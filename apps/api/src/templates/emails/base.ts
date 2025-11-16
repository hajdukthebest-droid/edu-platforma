/**
 * Base email template with responsive design and inline CSS
 * Compatible with all major email clients
 */

interface BaseEmailProps {
  preheader?: string
  content: string
}

export const baseEmailTemplate = ({ preheader, content }: BaseEmailProps): string => {
  return `
<!DOCTYPE html>
<html lang="hr" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Edu Platforma</title>

  <style>
    /* Reset styles */
    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table, td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }

    /* Client-specific styles */
    #MessageViewBody a {
      color: inherit;
      text-decoration: none;
    }

    #MessageWebViewDiv a {
      color: inherit;
      text-decoration: none;
    }

    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }
  </style>
</head>

<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

  <!-- Preheader text -->
  ${preheader ? `
  <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader}
  </div>
  ` : ''}

  <!-- Email wrapper -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Email container -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">
                EDU PLATFORMA
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Vaša putanja do znanja
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-bottom: 20px;">
                    <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
                      © ${new Date().getFullYear()} Edu Platforma. Sva prava pridržana.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-bottom: 10px;">
                    <a href="${process.env.FRONTEND_URL}" style="color: #3B82F6; text-decoration: none; font-size: 13px; margin: 0 10px;">Početna</a>
                    <span style="color: #d1d5db;">|</span>
                    <a href="${process.env.FRONTEND_URL}/courses" style="color: #3B82F6; text-decoration: none; font-size: 13px; margin: 0 10px;">Tečajevi</a>
                    <span style="color: #d1d5db;">|</span>
                    <a href="${process.env.FRONTEND_URL}/help" style="color: #3B82F6; text-decoration: none; font-size: 13px; margin: 0 10px;">Pomoć</a>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                      Primili ste ovaj email jer ste registrirani na Edu Platformi.<br>
                      Ako ne želite primati ove emailove, možete se <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #6b7280; text-decoration: underline;">odjaviti</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim()
}

/**
 * Button component for emails
 */
export const emailButton = (text: string, url: string, color: string = '#3B82F6'): string => {
  return `
<table border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
  <tr>
    <td align="center" style="border-radius: 6px; background-color: ${color};">
      <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 6px;">
        ${text}
      </a>
    </td>
  </tr>
</table>
  `.trim()
}

/**
 * Info box component
 */
export const emailInfoBox = (content: string, type: 'info' | 'success' | 'warning' = 'info'): string => {
  const colors = {
    info: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF' },
    success: { bg: '#F0FDF4', border: '#22C55E', text: '#166534' },
    warning: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
  }

  const color = colors[type]

  return `
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
  <tr>
    <td style="background-color: ${color.bg}; border-left: 4px solid ${color.border}; padding: 16px; border-radius: 6px;">
      <p style="margin: 0; color: ${color.text}; font-size: 14px; line-height: 1.6;">
        ${content}
      </p>
    </td>
  </tr>
</table>
  `.trim()
}

/**
 * Divider component
 */
export const emailDivider = (): string => {
  return `
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
  <tr>
    <td style="border-top: 1px solid #e5e7eb;"></td>
  </tr>
</table>
  `.trim()
}
