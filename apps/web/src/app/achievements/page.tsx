'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/lib/api'
import { Award, Trophy, Star, TrendingUp, Lock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

export default function AchievementsPage() {
  const { user } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await api.get('/my-stats')
      return response.data.data
    },
    enabled: !!user,
  })

  const { data: allAchievements } = useQuery({
    queryKey: ['all-achievements'],
    queryFn: async () => {
      const response = await api.get('/achievements')
      return response.data.data
    },
  })

  const { data: allBadges } = useQuery({
    queryKey: ['all-badges'],
    queryFn: async () => {
      const response = await api.get('/badges')
      return response.data.data
    },
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Potrebna prijava</h2>
            <p className="text-gray-600 mb-6">
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const userAchievements = stats?.achievements || []
  const userBadges = stats?.badges || []
  const userStats = stats?.stats || {}

  const achievementIds = new Set(userAchievements.map((ua: any) => ua.achievementId))
  const badgeIds = new Set(userBadges.map((ub: any) => ub.badgeId))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold mb-4">Postignuća i bedževi</h1>
            <p className="text-xl text-yellow-100">
              Pratite svoj napredak i osvajajte nova postignuća
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 -mt-8 mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-yellow-600">
                    {userStats.totalPoints || 0}
                  </div>
                  <div className="text-sm text-gray-600">Ukupno bodova</div>
                </div>
                <Star className="h-12 w-12 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    Level {userStats.level || 1}
                  </div>
                  <div className="text-sm text-gray-600">Trenutni nivo</div>
                </div>
                <TrendingUp className="h-12 w-12 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-600">
                    {userAchievements.length}
                  </div>
                  <div className="text-sm text-gray-600">Postignuća</div>
                </div>
                <Award className="h-12 w-12 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-orange-600">
                    {userBadges.length}
                  </div>
                  <div className="text-sm text-gray-600">Bedževi</div>
                </div>
                <Trophy className="h-12 w-12 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-8">
        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="achievements">Postignuća</TabsTrigger>
            <TabsTrigger value="badges">Bedževi</TabsTrigger>
          </TabsList>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allAchievements?.map((achievement: any) => {
                const isUnlocked = achievementIds.has(achievement.id)
                const userAchievement = userAchievements.find(
                  (ua: any) => ua.achievementId === achievement.id
                )

                return (
                  <Card
                    key={achievement.id}
                    className={`${
                      isUnlocked
                        ? 'border-yellow-400 border-2 bg-gradient-to-br from-yellow-50 to-white'
                        : 'opacity-60'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-4xl">{achievement.icon || '🏆'}</div>
                        {!isUnlocked && <Lock className="h-5 w-5 text-gray-400" />}
                      </div>
                      <CardTitle className="flex items-center gap-2">
                        {achievement.name}
                        {isUnlocked && <Award className="h-5 w-5 text-yellow-600" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-yellow-600">
                          +{achievement.points} bodova
                        </span>
                        {isUnlocked && userAchievement && (
                          <span className="text-gray-500">
                            {formatDate(userAchievement.earnedAt)}
                          </span>
                        )}
                      </div>
                      {!isUnlocked && (
                        <div className="mt-3 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {achievement._count.userAchievements} korisnika otključalo
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allBadges?.map((badge: any) => {
                const isUnlocked = badgeIds.has(badge.id)
                const userBadge = userBadges.find((ub: any) => ub.badgeId === badge.id)

                return (
                  <Card
                    key={badge.id}
                    className={`${
                      isUnlocked
                        ? 'border-orange-400 border-2 bg-gradient-to-br from-orange-50 to-white'
                        : 'opacity-60'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-4xl">{badge.icon || '🎖️'}</div>
                        {!isUnlocked && <Lock className="h-5 w-5 text-gray-400" />}
                      </div>
                      <CardTitle className="flex items-center gap-2">
                        {badge.name}
                        {isUnlocked && <Trophy className="h-5 w-5 text-orange-600" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                      <div className="mb-4 text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded inline-block">
                        {badge.type}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-orange-600">
                          +{badge.pointsValue} bodova
                        </span>
                        {isUnlocked && userBadge && (
                          <span className="text-gray-500">{formatDate(userBadge.earnedAt)}</span>
                        )}
                      </div>
                      {!isUnlocked && (
                        <div className="mt-3 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {badge._count.userBadges} korisnika osvojilo
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
