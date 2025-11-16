'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import RevenueChart from '@/components/instructor/RevenueChart'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Users, Star, BookOpen, Target, Activity } from 'lucide-react'

interface OverviewData {
  totalCourses: number
  totalStudents: number
  totalRevenue: number
  averageRating: number
  recentEnrollments: number
}

interface EarningsSummary {
  thisMonth: number
  lastMonth: number
  allTime: number
  pending: number
  growthRate: number
}

interface CoursePerformance {
  id: string
  title: string
  thumbnail: string | null
  price: number
  enrollmentCount: number
  averageRating: number
  revenue: number
  completionRate: number
  _count: {
    enrollments: number
    reviews: number
  }
}

interface StudentEngagement {
  averageProgress: number
  activeStudents: number
  completedStudents: number
  averageTimeSpent: number
}

export default function InstructorAnalyticsPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState(12) // months

  // Fetch overview
  const { data: overview } = useQuery<OverviewData>({
    queryKey: ['instructor-analytics-overview'],
    queryFn: async () => {
      const response = await api.get('/instructor/analytics/overview')
      return response.data.data
    },
    enabled: !!user,
  })

  // Fetch revenue analytics
  const { data: revenueData } = useQuery({
    queryKey: ['instructor-revenue', timeRange],
    queryFn: async () => {
      const response = await api.get(
        `/instructor/analytics/revenue?months=${timeRange}`
      )
      return response.data.data
    },
    enabled: !!user,
  })

  // Fetch earnings summary
  const { data: earnings } = useQuery<EarningsSummary>({
    queryKey: ['instructor-earnings'],
    queryFn: async () => {
      const response = await api.get('/instructor/analytics/earnings')
      return response.data.data
    },
    enabled: !!user,
  })

  // Fetch course performance
  const { data: coursePerformance } = useQuery<CoursePerformance[]>({
    queryKey: ['instructor-course-performance'],
    queryFn: async () => {
      const response = await api.get('/instructor/analytics/courses')
      return response.data.data
    },
    enabled: !!user,
  })

  // Fetch student engagement
  const { data: engagement } = useQuery<StudentEngagement>({
    queryKey: ['instructor-engagement'],
    queryFn: async () => {
      const response = await api.get('/instructor/analytics/engagement')
      return response.data.data
    },
    enabled: !!user,
  })

  if (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="mb-4 text-2xl font-bold">Nedostupno</h2>
            <p className="mb-6 text-gray-600">
              Samo instruktori mogu pristupiti analytics dashboard-u.
            </p>
            <Button asChild>
              <Link href="/">Povratak na početnu</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button asChild variant="ghost" size="sm" className="mb-2">
              <Link href="/instructor/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Natrag na Dashboard
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              📊 Instructor Analytics
            </h1>
            <p className="text-gray-600">
              Detaljni uvid u performanse vaših tečajeva
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            {[3, 6, 12].map((months) => (
              <button
                key={months}
                onClick={() => setTimeRange(months)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  timeRange === months
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {months}M
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Ukupni Prihodi
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    €{(overview?.totalRevenue || 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Ukupno Studenata
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {overview?.totalStudents || 0}
                  </p>
                </div>
                <Users className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Prosječna Ocjena
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {(overview?.averageRating || 0).toFixed(1)}
                  </p>
                </div>
                <Star className="h-12 w-12 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Tečajevi
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {overview?.totalCourses || 0}
                  </p>
                </div>
                <BookOpen className="h-12 w-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Summary */}
        {earnings && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ovaj mjesec</p>
                    <p className="text-2xl font-bold text-gray-900">
                      €{earnings.thisMonth.toLocaleString()}
                    </p>
                  </div>
                  {earnings.growthRate >= 0 ? (
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  )}
                </div>
                <div className={`mt-2 text-sm ${
                  earnings.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {earnings.growthRate >= 0 ? '+' : ''}
                  {earnings.growthRate.toFixed(1)}% od prošlog mjeseca
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600">Prošli mjesec</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{earnings.lastMonth.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600">Sveukupno</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{earnings.allTime.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600">Na čekanju</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{earnings.pending.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Revenue Chart */}
        {revenueData && <RevenueChart data={revenueData} />}

        {/* Student Engagement */}
        {engagement && (
          <Card className="my-8">
            <CardContent className="p-6">
              <h3 className="mb-6 text-lg font-semibold">Angažman Studenata</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-100 p-3">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prosječni napredak</p>
                    <p className="text-2xl font-bold">
                      {engagement.averageProgress.toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Aktivni studenti</p>
                    <p className="text-2xl font-bold">
                      {engagement.activeStudents}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-purple-100 p-3">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Završili</p>
                    <p className="text-2xl font-bold">
                      {engagement.completedStudents}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-orange-100 p-3">
                    <Activity className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prosječno vrijeme</p>
                    <p className="text-2xl font-bold">
                      {Math.round(engagement.averageTimeSpent / 60)}min
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course Performance Table */}
        {coursePerformance && coursePerformance.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-6 text-lg font-semibold">
                Performanse Tečajeva
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Tečaj
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        Studenti
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        Ocjena
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        Završenost
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        Prihod
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {coursePerformance.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {course.title}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {course.enrollmentCount}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-gray-900">
                              {course.averageRating.toFixed(1)}
                            </span>
                            <span className="text-gray-500">
                              ({course._count.reviews})
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium text-gray-900">
                            {course.completionRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">
                          €{course.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
