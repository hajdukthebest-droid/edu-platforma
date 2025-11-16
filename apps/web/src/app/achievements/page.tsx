'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import AchievementCard from '@/components/achievements/AchievementCard'
import AchievementStats from '@/components/achievements/AchievementStats'
import Leaderboard from '@/components/achievements/Leaderboard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  criteria: any
  definition?: {
    key: string
    name: string
    description: string
    icon: string
    points: number
    category: string
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  }
  userProgress?: {
    progress: number
    isCompleted: boolean
    completedAt: string | null
  }
}

interface UserStats {
  stats: {
    totalPoints: number
    level: number
    currentStreak: number
    longestStreak: number
  }
}

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatar: string | null
  totalPoints: number
  level: number
  achievementsCount: number
  badgesCount: number
  certificatesCount: number
}

const categories = [
  { value: 'all', label: 'Sve', icon: '🌟' },
  { value: 'learning', label: 'Učenje', icon: '📚' },
  { value: 'engagement', label: 'Angažman', icon: '💬' },
  { value: 'streak', label: 'Nizovi', icon: '🔥' },
  { value: 'certificate', label: 'Certifikati', icon: '📜' },
  { value: 'instructor', label: 'Instruktor', icon: '🎓' },
  { value: 'special', label: 'Posebno', icon: '✨' },
]

const rarities = [
  { value: 'all', label: 'Sve Rijetkosti' },
  { value: 'common', label: 'Uobičajeno' },
  { value: 'uncommon', label: 'Neuobičajeno' },
  { value: 'rare', label: 'Rijetko' },
  { value: 'epic', label: 'Epsko' },
  { value: 'legendary', label: 'Legendarno' },
]

export default function AchievementsPage() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRarity, setSelectedRarity] = useState('all')
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false)
  const [activeTab, setActiveTab] = useState<'achievements' | 'leaderboard'>(
    'achievements'
  )

  // Fetch user's achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ['my-achievements'],
    queryFn: async () => {
      const response = await api.get('/achievements/my-achievements')
      return response.data.data
    },
    enabled: !!user,
  })

  // Fetch user stats
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['achievement-stats'],
    queryFn: async () => {
      const response = await api.get('/achievements/my-stats')
      return response.data.data
    },
    enabled: !!user,
  })

  // Fetch leaderboard
  const { data: leaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await api.get('/achievements/leaderboard?limit=10')
      return response.data.data
    },
  })

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="mb-4 text-2xl font-bold">Potrebna prijava</h2>
            <p className="mb-6 text-gray-600">
              Morate biti prijavljeni da biste vidjeli svoja postignuća.
            </p>
            <Button asChild>
              <Link href="/login">Prijava</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Filter achievements
  const filteredAchievements = achievements?.filter((achievement) => {
    const definition = achievement.definition
    if (!definition) return false

    if (selectedCategory !== 'all' && definition.category !== selectedCategory) {
      return false
    }

    if (selectedRarity !== 'all' && definition.rarity !== selectedRarity) {
      return false
    }

    if (showOnlyCompleted && !achievement.userProgress?.isCompleted) {
      return false
    }

    return true
  })

  // Calculate stats
  const totalAchievements = achievements?.length || 0
  const completedAchievements =
    achievements?.filter((a) => a.userProgress?.isCompleted).length || 0
  const totalPoints = achievements?.reduce((sum, a) => sum + a.points, 0) || 0
  const earnedPoints =
    achievements
      ?.filter((a) => a.userProgress?.isCompleted)
      .reduce((sum, a) => sum + a.points, 0) || 0

  if (achievementsLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-gray-600">Učitavanje postignuća...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            🏆 Postignuća & Nagrade
          </h1>
          <p className="text-lg text-gray-600">
            Pratite svoj napredak i otključajte nova postignuća
          </p>
        </div>

        {/* Stats */}
        <AchievementStats
          totalAchievements={totalAchievements}
          completedAchievements={completedAchievements}
          totalPoints={totalPoints}
          earnedPoints={earnedPoints}
          level={userStats?.stats?.level}
          currentStreak={userStats?.stats?.currentStreak}
          longestStreak={userStats?.stats?.longestStreak}
        />

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'achievements'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Postignuća
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'leaderboard'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ljestvica
          </button>
        </div>

        {activeTab === 'achievements' ? (
          <>
            {/* Filters */}
            <div className="mb-6 rounded-xl bg-white p-6 shadow-md">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Category Filter */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Kategorija
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                          selectedCategory === cat.value
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rarity Filter */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Rijetkost
                  </label>
                  <select
                    value={selectedRarity}
                    onChange={(e) => setSelectedRarity(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {rarities.map((rarity) => (
                      <option key={rarity.value} value={rarity.value}>
                        {rarity.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show Only Completed */}
                <div className="flex items-end">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showOnlyCompleted}
                      onChange={(e) => setShowOnlyCompleted(e.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Prikaži samo otključana
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAchievements?.map((achievement) => {
                const definition = achievement.definition
                if (!definition) return null

                return (
                  <AchievementCard
                    key={achievement.id}
                    name={definition.name}
                    description={definition.description}
                    icon={definition.icon}
                    points={definition.points}
                    rarity={definition.rarity}
                    category={definition.category}
                    progress={achievement.userProgress?.progress}
                    isCompleted={achievement.userProgress?.isCompleted}
                    completedAt={achievement.userProgress?.completedAt}
                  />
                )
              })}
            </div>

            {/* Empty State */}
            {filteredAchievements?.length === 0 && (
              <div className="rounded-xl bg-white p-12 text-center shadow-md">
                <div className="mb-4 text-6xl">🎯</div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  Nema postignuća
                </h3>
                <p className="text-gray-600">
                  Pokušajte promijeniti filtere ili nastavite učiti da
                  otključate nova postignuća!
                </p>
              </div>
            )}
          </>
        ) : (
          <Leaderboard entries={leaderboard || []} currentUserId={user.id} />
        )}
      </div>
    </div>
  )
}
