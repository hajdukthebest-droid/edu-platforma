import { baseEmailTemplate, emailButton, emailInfoBox } from './base'

interface AchievementEmailProps {
  firstName: string
  achievementName: string
  achievementDescription: string
  achievementIcon: string
  points: number
  rarity?: string
  category?: string
}

export const achievementEmail = ({
  firstName,
  achievementName,
  achievementDescription,
  achievementIcon,
  points,
  rarity = 'common',
  category = 'general',
}: AchievementEmailProps): string => {
  // Rarity colors
  const rarityColors: Record<string, string> = {
    common: '#9CA3AF',
    uncommon: '#22C55E',
    rare: '#3B82F6',
    epic: '#A855F7',
    legendary: '#F59E0B',
  }

  const rarityLabels: Record<string, string> = {
    common: 'Uobičajeno',
    uncommon: 'Neuobičajeno',
    rare: 'Rijetko',
    epic: 'Epsko',
    legendary: 'Legendarno',
  }

  const rarityColor = rarityColors[rarity] || rarityColors.common
  const rarityLabel = rarityLabels[rarity] || rarityLabels.common

  const content = `
<h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">
  Čestitamo, ${firstName}! 🎉
</h2>

<p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
  Upravo ste otključali novo postignuće!
</p>

<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 30px; background: linear-gradient(135deg, ${rarityColor}20 0%, ${rarityColor}10 100%); border: 2px solid ${rarityColor}; border-radius: 12px; padding: 24px;">
  <tr>
    <td align="center">
      <div style="font-size: 64px; line-height: 1; margin-bottom: 16px;">
        ${achievementIcon}
      </div>
      <h3 style="margin: 0 0 8px; color: #111827; font-size: 22px; font-weight: 700;">
        ${achievementName}
      </h3>
      <p style="margin: 0 0 16px; color: #6B7280; font-size: 15px; line-height: 1.6;">
        ${achievementDescription}
      </p>
      <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
        <tr>
          <td style="padding: 0 8px;">
            <div style="display: inline-block; padding: 6px 12px; background-color: ${rarityColor}; color: #ffffff; border-radius: 6px; font-size: 13px; font-weight: 600;">
              ${rarityLabel}
            </div>
          </td>
          <td style="padding: 0 8px;">
            <div style="display: inline-block; padding: 6px 12px; background-color: #F59E0B; color: #ffffff; border-radius: 6px; font-size: 13px; font-weight: 600;">
              +${points} bodova
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

${emailButton('Pogledaj Sva Postignuća', `${process.env.FRONTEND_URL}/achievements`, '#A855F7')}

<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0; background-color: #F3F4F6; border-radius: 8px; padding: 16px;">
  <tr>
    <td>
      <p style="margin: 0 0 8px; color: #111827; font-size: 14px; font-weight: 600;">
        💡 Savjet:
      </p>
      <p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
        Nastavite učiti i osvajati nove tečajeve da otključate još postignuća i zaradite više bodova!
      </p>
    </td>
  </tr>
</table>

<p style="margin: 20px 0 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
  Možete vidjeti sva vaša postignuća i pratiti svoj napredak na vašem profilu.
</p>
  `

  return baseEmailTemplate({
    preheader: `Otključali ste novo postignuće: ${achievementName}!`,
    content,
  })
}
