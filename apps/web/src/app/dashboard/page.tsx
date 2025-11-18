'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  GraduationCap,
  Award,
  TrendingUp,
  BookOpen,
  Flame,
  Clock,
  Calendar,
  Target,
  Trophy,
  ChevronRight,
  Play,
  FileText,
  Video,
  Settings,
  Lightbulb,
} from 'lucide-react'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [goalDialogOpen, setGoalDialogOpen] = useState(false)
  const [goalMinutes, setGoalMinutes] = useState(15)
  const [goalLessons, setGoalLessons] = useState(1)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard')
      return response.data.data
    },
  })

  const { data: streak } = useQuery({
    queryKey: ['user-streak'],
    queryFn: async () => {
      const response = await api.get('/streaks')
      return response.data.data
    },
  })

  const { data: insights } = useQuery({
    queryKey: ['learning-insights'],
    queryFn: async () => {
      const response = await api.get('/dashboard/insights')
      return response.data.data
    },
  })

  const updateGoalsMutation = useMutation({
    mutationFn: async (goals: { dailyGoalMinutes: number; dailyGoalLessons: number }) => {
      const response = await api.put('/dashboard/goals', goals)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-streak'] })
      setGoalDialogOpen(false)
      toast.success('Ciljevi su ažurirani')
    },
  })

  const handleUpdateGoals = () => {
    updateGoalsMutation.mutate({
      dailyGoalMinutes: goalMinutes,
      dailyGoalLessons: goalLessons,
    })
  }

  useEffect(() => {
    if (streak) {
      setGoalMinutes(streak.dailyGoalMinutes || 15)
      setGoalLessons(streak.dailyGoalLessons || 1)
    }
  }, [streak])

  const user =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || '{}')
      : {}

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = dashboard?.stats || {}
  const coursesInProgress = dashboard?.coursesInProgress || []
  const upcomingDeadlines = dashboard?.upcomingDeadlines || []
  const recentAchievements = dashboard?.recentAchievements || []
  const recommendedCourses = dashboard?.recommendedCourses || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Streak */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Dobrodošli natrag, {user.firstName || 'Korisniku'}!
              </h1>
              <p className="text-gray-600 mt-2">Nastavite tamo gdje ste stali</p>
            </div>
            {/* Streak Display */}
            {streak && (
              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-lg">
                  <Flame className="h-5 w-5" />
                  <span className="font-bold">{streak.currentStreak || 0}</span>
                  <span className="text-sm">dana</span>
                </div>
                <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Target className="h-4 w-4 mr-2" />
                      Ciljevi
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dnevni ciljevi učenja</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Minuta dnevno</Label>
                        <Input
                          type="number"
                          value={goalMinutes}
                          onChange={(e) => setGoalMinutes(parseInt(e.target.value) || 15)}
                          min={5}
                          max={480}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Lekcija dnevno</Label>
                        <Input
                          type="number"
                          value={goalLessons}
                          onChange={(e) => setGoalLessons(parseInt(e.target.value) || 1)}
                          min={1}
                          max={20}
                        />
                      </div>
                      <Button
                        onClick={handleUpdateGoals}
                        className="w-full"
                        disabled={updateGoalsMutation.isPending}
                      >
                        {updateGoalsMutation.isPending ? 'Spremanje...' : 'Spremi ciljeve'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupno tečajeva</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.inProgressCourses || 0} u tijeku
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Završeno</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedCourses || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.certificatesEarned || 0} certifikata
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bodovi</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPoints || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalLessonsCompleted || 0} lekcija
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vrijeme učenja</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((stats.totalMinutesLearned || 0) / 60)}h
              </div>
              <p className="text-xs text-muted-foreground">
                Najduži niz: {stats.longestStreak || 0} dana
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Courses in Progress */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tečajevi u tijeku</CardTitle>
                  <Link href="/my-courses" className="text-sm text-blue-600 hover:underline">
                    Vidi sve
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {coursesInProgress.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Niste upisani ni na jedan tečaj
                    </p>
                    <Button asChild>
                      <Link href="/courses">Pregledaj tečajeve</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {coursesInProgress.map((course: any) => (
                      <div
                        key={course.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 bg-cover bg-center"
                          style={{
                            backgroundImage: course.thumbnail
                              ? `url(${course.thumbnail})`
                              : undefined,
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{course.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={course.progress} className="flex-1 h-2" />
                            <span className="text-sm text-gray-600">{course.progress}%</span>
                          </div>
                          {course.nextLesson && (
                            <p className="text-sm text-gray-500 mt-1 truncate">
                              Sljedeće: {course.nextLesson.title}
                            </p>
                          )}
                        </div>
                        <Button asChild size="sm">
                          <Link href={`/courses/${course.id}/learn`}>
                            <Play className="h-4 w-4 mr-1" />
                            Nastavi
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Insights */}
            {insights && (insights.insights?.length > 0 || insights.suggestions?.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Uvidi i prijedlozi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.insights?.map((insight: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <p className="text-sm">{insight.message}</p>
                      </div>
                    ))}
                    {insights.suggestions?.map((suggestion: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                      >
                        <Target className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{suggestion.message}</p>
                          <p className="text-xs text-gray-600">{suggestion.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommended Courses */}
            {recommendedCourses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Preporučeni tečajevi</CardTitle>
                  <CardDescription>Na temelju vaših interesa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {recommendedCourses.map((course: any) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div
                          className="h-24 bg-gray-200 bg-cover bg-center"
                          style={{
                            backgroundImage: course.thumbnail
                              ? `url(${course.thumbnail})`
                              : undefined,
                          }}
                        />
                        <div className="p-3">
                          <h5 className="font-medium text-sm truncate">{course.title}</h5>
                          <p className="text-xs text-gray-500 truncate">{course.instructor}</p>
                          <div className="flex items-center justify-between mt-2">
                            {course.rating && (
                              <span className="text-xs text-yellow-600">
                                ★ {course.rating.toFixed(1)}
                              </span>
                            )}
                            <span className="text-xs font-semibold">
                              {course.price > 0 ? `€${course.price}` : 'Besplatno'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Right column */}
          <div className="space-y-8">
            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Nadolazeći rokovi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nema nadolazećih rokova
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingDeadlines.map((deadline: any) => (
                      <div
                        key={deadline.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        {deadline.type === 'assignment' && (
                          <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        )}
                        {deadline.type === 'exam' && (
                          <Award className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        )}
                        {deadline.type === 'session' && (
                          <Video className="h-5 w-5 text-green-600 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{deadline.title}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {deadline.courseTitle}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {formatDate(deadline.dueDate)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Postignuća
                  </CardTitle>
                  <Link
                    href="/achievements"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Sva
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentAchievements.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Još nema otključanih postignuća
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentAchievements.map((achievement: any) => (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg"
                      >
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{achievement.title}</p>
                          <p className="text-xs text-gray-600">+{achievement.points} bodova</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Brze akcije</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/certificates">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Moji certifikati
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/flashcards">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Kartice za učenje
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/study-groups">
                      <Award className="h-4 w-4 mr-2" />
                      Grupe za učenje
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Postavke
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
