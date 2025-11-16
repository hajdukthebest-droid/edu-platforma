'use client'

import Image from 'next/image'

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatar?: string | null
  totalPoints: number
  level: number
  achievementsCount: number
  badgesCount?: number
  certificatesCount?: number
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return '🥇'
    case 2:
      return '🥈'
    case 3:
      return '🥉'
    default:
      return `#${rank}`
  }
}

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 2:
      return 'bg-gray-100 text-gray-800 border-gray-300'
    case 3:
      return 'bg-orange-100 text-orange-800 border-orange-300'
    default:
      return 'bg-white text-gray-800 border-gray-200'
  }
}

export default function Leaderboard({
  entries,
  currentUserId,
}: LeaderboardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          🏆 Ljestvica Najboljih
        </h2>
        <span className="text-sm text-gray-500">
          Top {entries.length} korisnika
        </span>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => {
          const isCurrentUser = entry.userId === currentUserId
          const rankColor = getRankColor(entry.rank)

          return (
            <div
              key={entry.userId}
              className={`flex items-center gap-4 rounded-lg border-2 p-4 transition-all duration-300 hover:scale-102 hover:shadow-md ${
                isCurrentUser
                  ? 'border-blue-500 bg-blue-50'
                  : rankColor
              }`}
            >
              {/* Rank */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center">
                <span className="text-2xl font-bold">
                  {getRankIcon(entry.rank)}
                </span>
              </div>

              {/* Avatar */}
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                {entry.avatar ? (
                  <Image
                    src={entry.avatar}
                    alt={entry.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
                    {entry.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">
                    {entry.name}
                  </h3>
                  {isCurrentUser && (
                    <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
                      Vi
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Nivo {entry.level}
                  </span>
                  <span>🏆 {entry.achievementsCount} postignuća</span>
                  {entry.certificatesCount !== undefined && (
                    <span>📜 {entry.certificatesCount} certifikata</span>
                  )}
                </div>
              </div>

              {/* Points */}
              <div className="flex-shrink-0 text-right">
                <div className="text-2xl font-bold text-yellow-600">
                  {entry.totalPoints.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">bodova</div>
              </div>
            </div>
          )
        })}
      </div>

      {entries.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          <div className="mb-4 text-6xl">🏆</div>
          <p className="text-lg font-medium">Nema rezultata</p>
          <p className="text-sm">Budite prvi na ljestvici!</p>
        </div>
      )}
    </div>
  )
}
