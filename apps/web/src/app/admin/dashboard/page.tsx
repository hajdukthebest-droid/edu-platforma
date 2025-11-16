'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  DollarSign,
  Activity,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import Link from 'next/link'
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
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export default function AdminDashboardPage() {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-platform-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics/platform-stats')
      return response.data.data
    },
  })

  const { data: userGrowth } = useQuery({
    queryKey: ['admin-user-growth'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics/user-growth')
      return response.data.data
    },
  })

  const { data: revenueTrends } = useQuery({
    queryKey: ['admin-revenue-trends'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics/revenue-trends')
      return response.data.data
    },
  })

  const { data: topCourses } = useQuery({
    queryKey: ['admin-top-courses'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics/top-courses?limit=5')
      return response.data.data
    },
  })

  const { data: topInstructors } = useQuery({
    queryKey: ['admin-top-instructors'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics/top-instructors?limit=5')
      return response.data.data
    },
  })

  const { data: domainStats } = useQuery({
    queryKey: ['admin-domain-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics/domain-stats')
      return response.data.data
    },
  })

  const { data: recentActivity } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics/recent-activity')
      return response.data.data
    },
  })

  if (loadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    )
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-blue-100">Platform overview i statistike</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ukupno Korisnika
              </CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.users?.total || 0}</div>
              <p className="text-sm text-gray-600 mt-1">
                {stats?.users?.active || 0} aktivnih ({stats?.users?.activePercentage}%)
              </p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <ArrowUpRight className="h-4 w-4" />
                +{stats?.users?.newThisMonth || 0} ovaj mjesec
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ukupno Tečajeva
              </CardTitle>
              <BookOpen className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.courses?.total || 0}</div>
              <p className="text-sm text-gray-600 mt-1">
                {stats?.courses?.published || 0} objavljeno ({stats?.courses?.publishRate}%)
              </p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <ArrowUpRight className="h-4 w-4" />
                +{stats?.courses?.newThisMonth || 0} ovaj mjesec
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ukupno Upisa
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.enrollments?.total || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Prosjek {stats?.enrollments?.averagePerCourse || 0} po tečaju
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ukupni Prihod
              </CardTitle>
              <DollarSign className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                €{(stats?.revenue?.total || 0).toLocaleString('hr-HR')}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {stats?.certificates || 0} izdanih certifikata
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Rast Korisnika (12 mjeseci)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Novi korisnici"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Prihodi (12 mjeseci)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10B981" name="Prihod (€)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Courses & Instructors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Courses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top 5 Tečajeva</CardTitle>
              <Link href="/admin/courses">
                <Button variant="outline" size="sm">
                  Svi tečajevi
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCourses?.map((course: any, index: number) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{course.title}</p>
                        <p className="text-sm text-gray-600">
                          {course.creator.firstName} {course.creator.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{course.enrollmentCount} upisa</p>
                      <p className="text-sm text-gray-600">
                        ⭐ {Number(course.averageRating || 0).toFixed(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Instructors */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top 5 Instruktora</CardTitle>
              <Link href="/admin/users?role=INSTRUCTOR">
                <Button variant="outline" size="sm">
                  Svi instruktori
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topInstructors?.map((instructor: any, index: number) => (
                  <div
                    key={instructor.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {instructor.firstName} {instructor.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{instructor.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {instructor.totalEnrollments} upisa
                      </p>
                      <p className="text-sm text-gray-600">
                        {instructor.totalCourses} tečajeva
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Domain Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Statistike po Domenima</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {domainStats?.slice(0, 10).map((domain: any) => (
                <div
                  key={domain.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  style={{ borderColor: domain.color + '40' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{domain.icon}</span>
                    <span className="font-semibold text-sm">{domain.name}</span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{domain.totalCourses} tečajeva</p>
                    <p>{domain.totalEnrollments} upisa</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Nedavna Aktivnost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Recent Users */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Novi korisnici
                </h3>
                <div className="space-y-2">
                  {recentActivity?.recentUsers?.map((user: any) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-sm text-gray-600">{user.email}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('hr-HR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Courses */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Novi tečajevi
                </h3>
                <div className="space-y-2">
                  {recentActivity?.recentCourses?.map((course: any) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="font-medium">{course.title}</span>
                      <span className="text-sm text-gray-600">
                        {course.creator.firstName} {course.creator.lastName}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          course.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
