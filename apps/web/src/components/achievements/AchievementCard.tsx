'use client'

interface AchievementCardProps {
  name: string
  nameEn?: string
  description: string
  icon: string
  points: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  category: string
  progress?: number
  isCompleted?: boolean
  completedAt?: string | null
}

const rarityColors = {
  common: {
    border: 'border-gray-400',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    badge: 'bg-gray-400',
    glow: 'shadow-gray-200',
  },
  uncommon: {
    border: 'border-green-500',
    bg: 'bg-green-50',
    text: 'text-green-700',
    badge: 'bg-green-500',
    glow: 'shadow-green-200',
  },
  rare: {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'bg-blue-500',
    glow: 'shadow-blue-200',
  },
  epic: {
    border: 'border-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    badge: 'bg-purple-500',
    glow: 'shadow-purple-200',
  },
  legendary: {
    border: 'border-yellow-500',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    badge: 'bg-yellow-500',
    glow: 'shadow-yellow-200',
  },
}

const rarityLabels = {
  common: 'Uobičajeno',
  uncommon: 'Neuobičajeno',
  rare: 'Rijetko',
  epic: 'Epsko',
  legendary: 'Legendarno',
}

export default function AchievementCard({
  name,
  description,
  icon,
  points,
  rarity,
  category,
  progress = 0,
  isCompleted = false,
  completedAt,
}: AchievementCardProps) {
  const colors = rarityColors[rarity]
  const rarityLabel = rarityLabels[rarity]

  return (
    <div
      className={`relative rounded-xl border-2 ${colors.border} ${
        isCompleted ? colors.bg : 'bg-white'
      } p-6 transition-all duration-300 hover:scale-105 ${
        isCompleted ? `${colors.glow} shadow-lg` : 'shadow-md hover:shadow-xl'
      } ${!isCompleted && 'opacity-75 grayscale'}`}
    >
      {/* Completed Badge */}
      {isCompleted && (
        <div className="absolute -right-2 -top-2 rounded-full bg-green-500 p-2 text-white shadow-lg">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      {/* Icon */}
      <div className="mb-4 flex items-center justify-center">
        <div
          className={`text-6xl ${
            !isCompleted && 'filter grayscale'
          } transition-all duration-300`}
        >
          {icon}
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-2 text-center text-xl font-bold text-gray-900">
        {name}
      </h3>

      {/* Description */}
      <p className="mb-4 text-center text-sm text-gray-600">{description}</p>

      {/* Progress Bar (if not completed) */}
      {!isCompleted && progress > 0 && (
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
            <span>Napredak</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full ${colors.badge} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Completed Date */}
      {isCompleted && completedAt && (
        <div className="mb-4 text-center text-xs text-gray-500">
          Otključano{' '}
          {new Date(completedAt).toLocaleDateString('hr-HR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      )}

      {/* Footer: Rarity & Points */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-full ${colors.badge} px-3 py-1 text-xs font-semibold text-white`}
        >
          {rarityLabel}
        </span>
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
          <svg
            className="mr-1 h-4 w-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {points} bodova
        </span>
      </div>

      {/* Locked Overlay */}
      {!isCompleted && progress === 0 && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gray-900 bg-opacity-10">
          <svg
            className="h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
