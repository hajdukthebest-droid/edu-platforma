'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import api from '@/lib/api'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import {
  BookOpen,
  Award,
  Star,
  TrendingUp,
  Clock,
  Target,
  ArrowLeft,
  Flame,
  Calendar,
  CheckCircle,
  Trophy,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

// Activity Heatmap Component
function ActivityHeatmap({ data }: { data: any[] }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
  const days = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned']

  // Create a map of dates to activity
  const activityMap = new Map(
    data.map((item) => [item.date, item])
  )

  // Generate all days for the year
  const year = new Date().getFullYear()
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)
  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  // Adjust start to Monday
  const firstDay = startDate.getDay()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1
  for (let i = 0; i < startOffset; i++) {
    currentWeek.push(new Date(0)) // placeholder
  }

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    currentWeek.push(new Date(d))
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  const getColor = (date: Date) => {
    if (date.getTime() === 0) return 'transparent'
    const dateStr = date.toISOString().split('T')[0]
    const activity = activityMap.get(dateStr)
    if (!activity) return '#ebedf0'
    if (activity.count === 0) return '#ebedf0'
    const minutes = activity.minutesLearned || 0
    if (minutes >= 60) return '#216e39'
    if (minutes >= 30) return '#30a14e'
    if (minutes >= 15) return '#40c463'
    return '#9be9a8'
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Month labels */}
        <div className="flex mb-2 ml-8">
          {months.map((month, i) => (
            <div key={month} className="flex-1 text-xs text-gray-500">
              {month}
            </div>
          ))}
        </div>
        {/* Grid */}
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1">
            {days.map((day, i) => (
              <div
                key={day}
                className="h-3 text-xs text-gray-500 flex items-center"
                style={{ visibility: i % 2 === 0 ? 'visible' : 'hidden' }}
              >
                {day}
              </div>
            ))}
          </div>
          {/* Weeks */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: getColor(day) }}
                  title={
                    day.getTime() !== 0
                      ? `${day.toLocaleDateString('hr-HR')}: ${
                          activityMap.get(day.toISOString().split('T')[0])?.minutesLearned || 0
                        } min`
                      : ''
                  }
                />
              ))}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-2 text-xs text-gray-500">
          <span>Manje</span>
          <div className="w-3 h-3 rounded-sm bg-[#ebedf0]" />
          <div className="w-3 h-3 rounded-sm bg-[#9be9a8]" />
          <div className="w-3 h-3 rounded-sm bg-[#40c463]" />
          <div className="w-3 h-3 rounded-sm bg-[#30a14e]" />
          <div className="w-3 h-3 rounded-sm bg-[#216e39]" />
          <span>Više</span>
        </div>
      </div>
    </div>
  )
}

export default function PersonalAnalyticsPage() {
  const { user } = useAuth()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await api.get('/my-stats')
      return response.data.data
    },
    enabled: !!user,
  })

  const { data: enrollmentsData } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: async () => {
      const response = await api.get('/progress/my-enrollments')
      return response.data.data
    },
    enabled: !!user,
  })

  // Streak data
  const { data: streakData } = useQuery({
    queryKey: ['user-streak'],
    queryFn: async () => {
      const response = await api.get('/streaks')
      return response.data.data
    },
    enabled: !!user,
  })

  // Activity heatmap data
  const { data: heatmapData } = useQuery({
    queryKey: ['activity-heatmap', selectedYear],
    queryFn: async () => {
      const response = await api.get(`/dashboard/activity-heatmap/${selectedYear}`)
      return response.data.data
    },
    enabled: !!user,
  })

  // Weekly progress
  const { data: weeklyProgressData } = useQuery({
    queryKey: ['weekly-progress'],
    queryFn: async () => {
      const response = await api.get('/dashboard/weekly-progress?weeks=12')
      return response.data.data
    },
    enabled: !!user,
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Potrebna prijava</h2>
            <p className="text-gray-600 mb-6">
              Morate biti prijavljeni da biste vidjeli svoju analitiku.
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

  const stats = statsData?.stats || {}
  const achievements = statsData?.achievements || []
  const badges = statsData?.badges || []
  const enrollments = enrollmentsData?.enrollments || []

  // Prepare course progress data
  const progressData = enrollments
    .map((enrollment: any) => ({
      course: enrollment.course.title.length > 20
        ? enrollment.course.title.substring(0, 20) + '...'
        : enrollment.course.title,
      napredak: enrollment.progress?.progressPercentage || 0,
    }))
    .slice(0, 8)

  // Prepare course status distribution
  const statusCounts = enrollments.reduce(
    (acc: any, enrollment: any) => {
      const status = enrollment.status
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {}
  )

  const statusData = [
    { name: 'Aktivni', value: statusCounts.ACTIVE || 0 },
    { name: 'Završeni', value: statusCounts.COMPLETED || 0 },
    { name: 'Napušteni', value: statusCounts.DROPPED || 0 },
  ].filter(item => item.value > 0)

  // Prepare achievements over time (last 10)
  const achievementsOverTime = achievements
    .slice(0, 10)
    .reverse()
    .map((achievement: any, index: number) => ({
      name: achievement.achievement.name.length > 15
        ? achievement.achievement.name.substring(0, 15) + '...'
        : achievement.achievement.name,
      bodovi: achievement.achievement.points,
      datum: new Date(achievement.completedAt).toLocaleDateString('hr-HR', {
        month: 'short',
        day: 'numeric',
      }),
    }))

  // Calculate learning hours per category
  const learningByCategory = enrollments.reduce((acc: any, enrollment: any) => {
    const category = enrollment.course.category
    if (!acc[category]) {
      acc[category] = 0
    }
    // Estimate hours based on progress
    const estimatedHours = (enrollment.progress?.progressPercentage || 0) / 100 *
      (enrollment.course.estimatedDuration || 10)
    acc[category] += estimatedHours
    return acc
  }, {})

  const categoryData = Object.entries(learningByCategory)
    .map(([category, hours]) => ({
      category,
      sati: Number((hours as number).toFixed(1)),
    }))
    .sort((a, b) => b.sati - a.sati)
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Natrag
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold mb-4">Moja analitika učenja</h1>
            <p className="text-xl text-blue-100">
              Detaljan pregled vašeg napretka i postignuća
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Streak Stats */}
          {streakData && (
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-orange-600">
                        {streakData.currentStreak || 0}
                      </div>
                      <div className="text-sm text-orange-700 mt-1">Trenutni niz</div>
                    </div>
                    <Flame className="h-12 w-12 text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-purple-600">
                        {streakData.longestStreak || 0}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Najduži niz</div>
                    </div>
                    <Trophy className="h-12 w-12 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">
                        {streakData.totalDaysActive || 0}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Aktivnih dana</div>
                    </div>
                    <Calendar className="h-12 w-12 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        {streakData.totalLessonsCompleted || 0}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Završenih lekcija</div>
                    </div>
                    <CheckCircle className="h-12 w-12 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Activity Heatmap */}
          {heatmapData && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Aktivnost učenja
                    </CardTitle>
                    <CardDescription>Vaša dnevna aktivnost kroz godinu</CardDescription>
                  </div>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(v) => setSelectedYear(parseInt(v))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={(new Date().getFullYear()).toString()}>
                        {new Date().getFullYear()}
                      </SelectItem>
                      <SelectItem value={(new Date().getFullYear() - 1).toString()}>
                        {new Date().getFullYear() - 1}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ActivityHeatmap data={heatmapData} />
              </CardContent>
            </Card>
          )}

          {/* Weekly Progress Chart */}
          {weeklyProgressData && weeklyProgressData.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Tjedni napredak</CardTitle>
                <CardDescription>Pregled učenja po tjednima</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="week"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString('hr-HR', { month: 'short', day: 'numeric' })
                      }
                      fontSize={11}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) =>
                        `Tjedan: ${new Date(value).toLocaleDateString('hr-HR')}`
                      }
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="minutesLearned"
                      name="Minute"
                      stroke="#3b82f6"
                      fill="#93c5fd"
                    />
                    <Area
                      type="monotone"
                      dataKey="lessonsCompleted"
                      name="Lekcije"
                      stroke="#10b981"
                      fill="#6ee7b7"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.totalEnrollments || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Ukupno upisa</div>
                  </div>
                  <BookOpen className="h-12 w-12 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-600">
                      {stats.completedCourses || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Završeno kurseva</div>
                  </div>
                  <Award className="h-12 w-12 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-purple-600">
                      {stats.totalPoints || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Ukupno bodova</div>
                  </div>
                  <Star className="h-12 w-12 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-orange-600">
                      {stats.totalLearningHours || 0}h
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Sati učenja</div>
                  </div>
                  <Clock className="h-12 w-12 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Course Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Napredak po kursevima</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={progressData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="course" type="category" width={150} fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="napredak" fill="#3b82f6" name="Napredak (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status kurseva</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Achievements Timeline */}
            {achievementsOverTime.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Nedavna postignuća</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={achievementsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="datum" fontSize={11} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="bodovi" fill="#f59e0b" name="Bodovi" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Learning by Category */}
            {categoryData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sati učenja po kategorijama</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" fontSize={12} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sati" fill="#10b981" name="Sati" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Progress Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Detaljan pregled napretka</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <Target className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-blue-700">
                        {stats.inProgressCourses || 0}
                      </div>
                      <div className="text-sm text-blue-600">Kurseva u tijeku</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold text-purple-700">
                        Level {stats.level || 1}
                      </div>
                      <div className="text-sm text-purple-600">Trenutni nivo</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <Award className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-green-700">
                        {stats.certificates || 0}
                      </div>
                      <div className="text-sm text-green-600">Certifikati</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                    <Star className="h-8 w-8 text-orange-600" />
                    <div>
                      <div className="text-2xl font-bold text-orange-700">
                        {achievements.length}
                      </div>
                      <div className="text-sm text-orange-600">Postignuća</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
