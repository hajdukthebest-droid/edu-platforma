'use client'

interface AchievementStatsProps {
  totalAchievements: number
  completedAchievements: number
  totalPoints: number
  earnedPoints: number
  level?: number
  currentStreak?: number
  longestStreak?: number
}

export default function AchievementStats({
  totalAchievements,
  completedAchievements,
  totalPoints,
  earnedPoints,
  level = 1,
  currentStreak = 0,
  longestStreak = 0,
}: AchievementStatsProps) {
  const completionRate =
    totalAchievements > 0
      ? Math.round((completedAchievements / totalAchievements) * 100)
      : 0

  const stats = [
    {
      label: 'Ukupno Postignuća',
      value: `${completedAchievements}/${totalAchievements}`,
      icon: '🏆',
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Ukupno Bodova',
      value: earnedPoints.toLocaleString(),
      subValue: `od ${totalPoints.toLocaleString()}`,
      icon: '⭐',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Postotak Završetka',
      value: `${completionRate}%`,
      icon: '📊',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Nivo',
      value: level,
      icon: '🎯',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ]

  if (currentStreak > 0 || longestStreak > 0) {
    stats.push({
      label: 'Trenutni Niz',
      value: `${currentStreak} dana`,
      subValue: `Najduži: ${longestStreak}`,
      icon: '🔥',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    })
  }

  return (
    <div className="mb-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Vaša Statistika</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`rounded-xl ${stat.bgColor} border-2 border-transparent p-6 transition-all duration-300 hover:scale-105 hover:border-${stat.color} hover:shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="mb-1 text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
                {stat.subValue && (
                  <p className="mt-1 text-xs text-gray-500">{stat.subValue}</p>
                )}
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>

            {/* Progress bar for completion rate */}
            {stat.label === 'Postotak Završetka' && (
              <div className="mt-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full ${stat.color} transition-all duration-500`}
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
