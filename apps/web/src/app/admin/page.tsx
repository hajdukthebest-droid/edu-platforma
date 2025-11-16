'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Activity,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminDashboard() {
  const router = useRouter()
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/dashboard')
        return response.data.data
      } catch (error: any) {
        if (error.response?.status === 403) {
          router.push('/')
        }
        throw error
      }
    },
    enabled: !!user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'),
  })

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Nemate pristup</h2>
            <p className="text-gray-600 mb-6">
              Ova stranica je dostupna samo administratorima.
            </p>
            <Button asChild>
              <Link href="/">Povratak na početnu</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = data?.stats || {}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Upravljanje platformom</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/admin/users">Korisnici</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/courses">Tečajevi</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/analytics">Analitika</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ukupno korisnika
              </CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers || 0}</div>
              <p className="text-xs text-gray-600 mt-1">
                {stats.activeUsers || 0} aktivnih
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ukupno tečajeva
              </CardTitle>
              <BookOpen className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCourses || 0}</div>
              <p className="text-xs text-gray-600 mt-1">
                {stats.publishedCourses || 0} objavljeno
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Upisi
              </CardTitle>
              <GraduationCap className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalEnrollments || 0}</div>
              <p className="text-xs text-gray-600 mt-1">
                Ukupno upisa na tečajeve
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Prihod
              </CardTitle>
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(stats.totalRevenue || 0)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Ukupni prihod
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Novi korisnici</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin/users">Svi korisnici →</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.recentUsers && data.recentUsers.length > 0 ? (
                  data.recentUsers.map((user: any) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0"
                    >
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {user.role}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nema novih korisnika
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Enrollments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Nedavni upisi</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin/courses">Svi tečajevi →</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.recentEnrollments && data.recentEnrollments.length > 0 ? (
                  data.recentEnrollments.map((enrollment: any) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {enrollment.course.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {enrollment.user.firstName} {enrollment.user.lastName}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 ml-4">
                        {formatDate(enrollment.enrolledAt)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nema nedavnih upisa
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
