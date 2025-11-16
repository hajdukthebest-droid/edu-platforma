'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/lib/api'
import {
  User,
  Award,
  Trophy,
  Star,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Calendar,
  Briefcase,
  Building,
  Flame,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function PublicProfilePage() {
  const params = useParams()
  const username = params.username as string

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['public-profile', username],
    queryFn: async () => {
      const response = await api.get(`/profile/${username}`)
      return response.data.data
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Korisnik nije pronađen</h2>
            <p className="text-gray-600 mb-6">
              Korisnik s korisničkim imenom &quot;{username}&quot; ne postoji.
            </p>
            <Button asChild>
              <Link href="/">Natrag na početnu</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { user, achievements, badges, completedCourses, recentForumPosts, stats } =
    profileData

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-blue-500 flex items-center justify-center">
                    <User className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{user.fullName}</h1>
                <p className="text-blue-100 mb-3">@{user.username}</p>

                {user.bio && <p className="text-white/90 mb-4">{user.bio}</p>}

                <div className="flex flex-wrap gap-4 text-sm">
                  {user.profession && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <span>{user.profession}</span>
                    </div>
                  )}
                  {user.organization && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>{user.organization}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Pridružio se {formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 -mt-8 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {user.totalPoints}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                    <Star className="h-4 w-4" />
                    Bodova
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    Level {user.level}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4" />
                    Nivo
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.totalCertificates}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                    <Award className="h-4 w-4" />
                    Certifikati
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {user.currentStreak}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                    <Flame className="h-4 w-4" />
                    Niz dana
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Pregled</TabsTrigger>
              <TabsTrigger value="achievements">Postignuća</TabsTrigger>
              <TabsTrigger value="badges">Bedževi</TabsTrigger>
              <TabsTrigger value="activity">Aktivnost</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Completed Courses */}
              <Card>
                <CardHeader>
                  <CardTitle>Završeni kursevi ({stats.totalCertificates})</CardTitle>
                </CardHeader>
                <CardContent>
                  {completedCourses.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Korisnik još nije završio nijedan kurs
                    </p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {completedCourses.map((cert: any) => (
                        <Link
                          key={cert.id}
                          href={`/courses/${cert.course.slug}`}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex gap-3">
                            {cert.course.thumbnailUrl && (
                              <img
                                src={cert.course.thumbnailUrl}
                                alt={cert.course.title}
                                className="w-16 h-16 rounded object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold mb-1 truncate">
                                {cert.course.title}
                              </h4>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                  {cert.course.category}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                  {cert.course.level}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                {formatDate(cert.issuedAt)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistika</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
                        <div className="text-sm text-gray-600">Ukupno upisa</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-8 w-8 text-green-600" />
                      <div>
                        <div className="text-2xl font-bold">{stats.totalForumPosts}</div>
                        <div className="text-sm text-gray-600">Forum objava</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="h-8 w-8 text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold">{stats.totalAchievements}</div>
                        <div className="text-sm text-gray-600">Postignuća</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Trophy className="h-8 w-8 text-orange-600" />
                      <div>
                        <div className="text-2xl font-bold">{stats.totalBadges}</div>
                        <div className="text-sm text-gray-600">Bedževa</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle>Postignuća ({stats.totalAchievements})</CardTitle>
                </CardHeader>
                <CardContent>
                  {achievements.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Korisnik još nije osvojio nijedna postignuća
                    </p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {achievements.map((ua: any) => (
                        <div
                          key={ua.id}
                          className="border rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-white"
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-3xl">{ua.achievement.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">
                                {ua.achievement.name}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {ua.achievement.description}
                              </p>
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-yellow-600">
                                  +{ua.achievement.points} bodova
                                </span>
                                <span className="text-gray-500">
                                  {formatDate(ua.completedAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Badges Tab */}
            <TabsContent value="badges">
              <Card>
                <CardHeader>
                  <CardTitle>Bedževi ({stats.totalBadges})</CardTitle>
                </CardHeader>
                <CardContent>
                  {badges.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Korisnik još nije osvojio nijedan bedž
                    </p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {badges.map((ub: any) => (
                        <div
                          key={ub.id}
                          className="border rounded-lg p-4 bg-gradient-to-br from-orange-50 to-white"
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-3xl">{ub.badge.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{ub.badge.name}</h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {ub.badge.description}
                              </p>
                              <div className="mb-2">
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                  {ub.badge.type}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-orange-600">
                                  +{ub.badge.pointsValue} bodova
                                </span>
                                <span className="text-gray-500">
                                  {formatDate(ub.earnedAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Nedavna aktivnost na forumu</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentForumPosts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Korisnik još nema objava na forumu
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recentForumPosts.map((post: any) => (
                        <Link
                          key={post.id}
                          href={`/forum/posts/${post.id}`}
                          className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <h4 className="font-semibold mb-2">{post.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              {post.upvotes} glasova
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {post._count.comments} komentara
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(post.createdAt)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
