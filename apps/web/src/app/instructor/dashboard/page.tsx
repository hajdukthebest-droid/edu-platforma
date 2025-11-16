'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { Users, BookOpen, Star, TrendingUp, Eye, Plus, Wrench } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function InstructorDashboardPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['instructor-dashboard'],
    queryFn: async () => {
      const response = await api.get('/instructor/dashboard')
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

  if (!dashboard) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
              <p className="text-gray-600 mt-1">Upravljajte svojim tečajevima i studentima</p>
            </div>
            <Button asChild>
              <Link href="/instructor/courses/new">
                <Plus className="h-4 w-4 mr-2" />
                Novi tečaj
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupno tečajeva</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.overview.totalCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupno studenata</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.overview.totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prosječna ocjena</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.overview.averageRating}</div>
              <p className="text-xs text-muted-foreground">
                {dashboard.overview.totalReviews} recenzija
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Završenost</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboard.completionStats.reduce((acc: number, stat: any) => {
                  return acc + stat.completionRate
                }, 0) / dashboard.completionStats.length || 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">Prosječna stopa završetka</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Moji tečajevi</CardTitle>
              <CardDescription>Pregled svih vaših tečajeva</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.courses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nemate još nijedan tečaj</p>
                    <Button asChild className="mt-4" size="sm">
                      <Link href="/instructor/courses/new">Kreiraj prvi tečaj</Link>
                    </Button>
                  </div>
                ) : (
                  dashboard.courses.slice(0, 5).map((course: any) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{course.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course._count.enrollments} studenata
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {course.averageRating || 'N/A'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            course.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {course.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/instructor/courses/${course.id}/builder`}>
                            <Wrench className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/instructor/courses/${course.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {dashboard.courses.length > 5 && (
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link href="/instructor/courses">Vidi sve tečajeve</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Recent Enrollments */}
          <Card>
            <CardHeader>
              <CardTitle>Nedavne upisane</CardTitle>
              <CardDescription>Najnovije upise na vaše tečajeve</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.recentEnrollments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nema nedavnih upisa</p>
                  </div>
                ) : (
                  dashboard.recentEnrollments.map((enrollment: any) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {enrollment.user.firstName} {enrollment.user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{enrollment.course.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(enrollment.startedAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completion Stats */}
        {dashboard.completionStats.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Statistika završetka</CardTitle>
              <CardDescription>Stopa završetka po tečajevima</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.completionStats.map((stat: any) => (
                  <div key={stat.courseId}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{stat.courseTitle}</span>
                      <span className="text-sm text-gray-600">
                        {stat.completions}/{stat.enrollments} ({stat.completionRate.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${stat.completionRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
