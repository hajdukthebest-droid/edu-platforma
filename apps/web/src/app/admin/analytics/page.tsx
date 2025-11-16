'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  Star,
} from 'lucide-react'

export default function AdminAnalyticsPage() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics')
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
              <Link href="/admin">Natrag na dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { userGrowth, enrollmentGrowth, revenueByMonth, topCourses, topInstructors } =
    analyticsData

  // Process user growth data
  const userGrowthByMonth = userGrowth.reduce((acc: any, item: any) => {
    const month = new Date(item.createdAt).toLocaleDateString('hr-HR', {
      year: 'numeric',
      month: 'short',
    })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  const userGrowthData = Object.entries(userGrowthByMonth)
    .map(([month, count]) => ({ month, korisnici: count }))
    .slice(-12)

  // Process enrollment growth data
  const enrollmentByMonth = enrollmentGrowth.reduce((acc: any, item: any) => {
    const month = new Date(item.enrolledAt).toLocaleDateString('hr-HR', {
      year: 'numeric',
      month: 'short',
    })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  const enrollmentData = Object.entries(enrollmentByMonth)
    .map(([month, count]) => ({ month, upisi: count }))
    .slice(-12)

  // Process revenue data
  const revenueByMonthData = revenueByMonth
    .reduce((acc: any, item: any) => {
      const month = new Date(item.createdAt).toLocaleDateString('hr-HR', {
        year: 'numeric',
        month: 'short',
      })
      const existingMonth = acc.find((m: any) => m.month === month)
      if (existingMonth) {
        existingMonth.prihod += Number(item._sum.amount || 0)
      } else {
        acc.push({ month, prihod: Number(item._sum.amount || 0) })
      }
      return acc
    }, [])
    .slice(-12)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Natrag
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Analitika platforme</h1>
          <p className="text-gray-600 mt-1">Detaljan pregled performansi platforme</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Growth Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* User Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Rast korisnika (zadnjih 12 mjeseci)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="korisnici"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Novi korisnici"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Enrollment Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Rast upisa (zadnjih 12 mjeseci)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="upisi"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Novi upisi"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Trend */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Trend prihoda (zadnjih 12 mjeseci)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByMonthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => `${value.toFixed(2)} €`}
                  />
                  <Legend />
                  <Bar dataKey="prihod" fill="#f59e0b" name="Prihod (€)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Najpopularniji kursevi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCourses.map((course: any, index: number) => (
                  <div key={course.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate mb-1">{course.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.enrollmentCount} upisa
                        </span>
                        {course.averageRating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {course.averageRating.toFixed(1)}
                          </span>
                        )}
                        <span className="text-xs">
                          {course._count.reviews} recenzija
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Instructors */}
          <Card>
            <CardHeader>
              <CardTitle>Najaktivniji instruktori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topInstructors.map((instructor: any, index: number) => (
                  <div key={instructor.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold mb-1">
                        {instructor.firstName} {instructor.lastName}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {instructor._count.coursesCreated} kurseva
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {instructor.totalPoints} bodova
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
