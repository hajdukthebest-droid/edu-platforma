'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
} from 'recharts'
import {
  Users,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowLeft,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

const STATUS_COLORS = {
  ACTIVE: '#3b82f6',
  COMPLETED: '#10b981',
  DROPPED: '#ef4444',
}

const RATING_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']

export default function CourseAnalyticsPage() {
  const params = useParams()
  const courseId = params.courseId as string

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['course-analytics', courseId],
    queryFn: async () => {
      const response = await api.get(`/instructor/courses/${courseId}/analytics`)
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

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Podaci nisu dostupni</h2>
            <Button asChild>
              <Link href="/instructor/dashboard">Natrag na dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { course, stats, enrollments, progressData, reviews } = analyticsData

  // Prepare enrollment trend data
  const enrollmentsByDate = enrollments.reduce((acc: any, enrollment: any) => {
    const date = new Date(enrollment.startedAt).toLocaleDateString('hr-HR')
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  const enrollmentTrendData = Object.entries(enrollmentsByDate)
    .map(([date, count]) => ({ date, upisi: count }))
    .slice(-30)

  // Prepare status distribution data
  const statusData = [
    { name: 'Aktivni', value: stats.active, color: STATUS_COLORS.ACTIVE },
    { name: 'Završeni', value: stats.completed, color: STATUS_COLORS.COMPLETED },
    { name: 'Napušteni', value: stats.dropped, color: STATUS_COLORS.DROPPED },
  ]

  // Prepare progress distribution data
  const progressRanges = [
    { range: '0-20%', count: 0 },
    { range: '21-40%', count: 0 },
    { range: '41-60%', count: 0 },
    { range: '61-80%', count: 0 },
    { range: '81-100%', count: 0 },
  ]

  progressData.forEach((progress: any) => {
    const percentage = progress.progressPercentage
    if (percentage <= 20) progressRanges[0].count++
    else if (percentage <= 40) progressRanges[1].count++
    else if (percentage <= 60) progressRanges[2].count++
    else if (percentage <= 80) progressRanges[3].count++
    else progressRanges[4].count++
  })

  // Prepare rating distribution data
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating: `${rating} ⭐`,
    count: reviews.filter((r: any) => r.rating === rating).length,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/instructor/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Natrag
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-gray-600 mt-1">Detaljne analitike kursa</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.totalEnrolled}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Ukupno upisanih</div>
                </div>
                <Users className="h-12 w-12 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {stats.completed}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Završilo</div>
                </div>
                <CheckCircle className="h-12 w-12 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.averageProgress.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Prosječan napredak</div>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-yellow-600">
                    {stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Prosječna ocjena ({reviews.length} recenzija)
                  </div>
                </div>
                <Star className="h-12 w-12 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Enrollment Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Trend upisa (zadnjih 30 dana)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={enrollmentTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    fontSize={12}
                    tickFormatter={(value) => {
                      const [day, month] = value.split('.')
                      return `${day}.${month}`
                    }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="upisi"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Broj upisa"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribucija statusa studenata</CardTitle>
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
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Progress Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribucija napretka</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progressRanges}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8b5cf6" name="Broj studenata" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribucija ocjena</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Broj recenzija">
                    {ratingDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={RATING_COLORS[index]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Students */}
        <Card>
          <CardHeader>
            <CardTitle>Nedavni studenti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Student</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Napredak</th>
                    <th className="text-left py-3 px-4">Datum upisa</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.slice(0, 10).map((enrollment: any) => (
                    <tr key={enrollment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {enrollment.user.firstName} {enrollment.user.lastName}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {enrollment.user.email}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            enrollment.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : enrollment.status === 'ACTIVE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {progressData.find((p: any) => p.userId === enrollment.userId)
                          ?.progressPercentage.toFixed(0) || 0}
                        %
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(enrollment.startedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
