'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { Trophy, Medal, Award, TrendingUp, Flame } from 'lucide-react'

type LeaderboardType = 'global' | 'daily' | 'weekly' | 'monthly' | 'streak'

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('global')

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', activeTab],
    queryFn: async () => {
      let url = '/leaderboard'
      if (activeTab === 'streak') {
        url = '/leaderboard/streak'
      } else if (activeTab !== 'global') {
        url = `/leaderboard/period/${activeTab}`
      }
      const response = await api.get(url)
      return response.data.data
    },
  })

  const { data: myRank } = useQuery({
    queryKey: ['my-rank'],
    queryFn: async () => {
      try {
        const response = await api.get('/leaderboard/my-rank')
        return response.data.data.rank
      } catch {
        return null
      }
    },
  })

  const tabs: { value: LeaderboardType; label: string; icon: any }[] = [
    { value: 'global', label: 'Svi vremena', icon: Trophy },
    { value: 'weekly', label: 'Ovaj tjedan', icon: TrendingUp },
    { value: 'monthly', label: 'Ovaj mjesec', icon: Award },
    { value: 'streak', label: 'Streak', icon: Flame },
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-700" />
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>
    }
  }

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200'
      default:
        return 'bg-white'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
            <p className="text-blue-100 text-lg">
              Natjecajte se s najboljima i pratite svoj napredak
            </p>
            {myRank && (
              <div className="mt-6 inline-block bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                <p className="text-sm">Vaša pozicija</p>
                <p className="text-2xl font-bold">#{myRank}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.value}
                variant={activeTab === tab.value ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.value)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            )
          })}
        </div>

        {/* Leaderboard */}
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : !leaderboard || leaderboard.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Trenutno nema podataka za ovaj leaderboard</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((user: any, index: number) => (
                <Card
                  key={user.id}
                  className={`transition-all hover:shadow-md ${getRankBgColor(user.rank)}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex-shrink-0 w-12 text-center">
                        {getRankIcon(user.rank)}
                      </div>

                      {/* Avatar & Name */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">Level {user.level}</p>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-6 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {activeTab === 'streak' ? user.currentStreak : user.totalPoints}
                          </p>
                          <p className="text-xs text-gray-600">
                            {activeTab === 'streak' ? 'Dana' : 'Bodova'}
                          </p>
                        </div>

                        {user._count && (
                          <>
                            <div className="border-l pl-6">
                              <p className="text-lg font-semibold">
                                {user._count.certificates || 0}
                              </p>
                              <p className="text-xs text-gray-600">Certifikata</p>
                            </div>
                            <div className="border-l pl-6">
                              <p className="text-lg font-semibold">
                                {user._count.badges || 0}
                              </p>
                              <p className="text-xs text-gray-600">Badges</p>
                            </div>
                          </>
                        )}

                        {activeTab === 'streak' && user.longestStreak && (
                          <div className="border-l pl-6">
                            <p className="text-lg font-semibold">{user.longestStreak}</p>
                            <p className="text-xs text-gray-600">Najbolji</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More */}
          {leaderboard && leaderboard.length >= 50 && (
            <div className="text-center mt-6">
              <Button variant="outline">Učitaj više</Button>
            </div>
          )}
        </div>

        {/* Info Card */}
        <Card className="mt-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">Kako funkcionira Leaderboard?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Zarađivanje bodova</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Završetak tečaja: 100 bodova</li>
                  <li>• Završetak lekcije: 20 bodova</li>
                  <li>• Položen quiz: 50 bodova</li>
                  <li>• Savršen rezultat: +100 bodova</li>
                  <li>• Dnevni streak: 10 bodova/dan</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Razine</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Level 1: 0-100 bodova</li>
                  <li>• Level 2: 100-250 bodova</li>
                  <li>• Level 3: 250-500 bodova</li>
                  <li>• Level 4: 500-1000 bodova</li>
                  <li>• Level 5+: 1000+ bodova</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
