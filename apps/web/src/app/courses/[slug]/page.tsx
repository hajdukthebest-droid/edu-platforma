'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Clock, Users, Award, BookOpen } from 'lucide-react'

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter()

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', params.slug],
    queryFn: async () => {
      const response = await api.get(`/courses/slug/${params.slug}`)
      return response.data.data
    },
  })

  const handleEnroll = async () => {
    try {
      await api.post(`/courses/${course.id}/enroll`)
      router.push('/dashboard')
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login')
      } else {
        alert(error.response?.data?.message || 'Greška prilikom upisa')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center">Tečaj nije pronađen</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-white/20 rounded text-sm">{course.level}</span>
              {course.category && (
                <span className="px-3 py-1 bg-white/20 rounded text-sm">
                  {course.category.name}
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-blue-100">{course.shortDescription}</p>

            <div className="flex items-center gap-6 mt-6">
              {course.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{Math.floor(course.duration / 60)}h {course.duration % 60}min</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{course._count?.enrollments || 0} polaznika</span>
              </div>
              {course.cpdPoints && (
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span>{course.cpdPoints} CPD bodova</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>O tečaju</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
              </CardContent>
            </Card>

            {course.learningObjectives && course.learningObjectives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Što ćete naučiti</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.learningObjectives.map((objective: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Curriculum */}
            {course.modules && course.modules.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Program tečaja</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {course.modules.map((module: any, index: number) => (
                      <div key={module.id} className="border-l-2 border-blue-600 pl-4">
                        <h3 className="font-semibold mb-2">
                          Modul {index + 1}: {module.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                        <div className="space-y-1">
                          {module.lessons.map((lesson: any) => (
                            <div key={lesson.id} className="flex items-center gap-2 text-sm">
                              <BookOpen className="h-4 w-4 text-gray-400" />
                              <span>{lesson.title}</span>
                              {lesson.duration && (
                                <span className="text-gray-500">({lesson.duration} min)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {course.price === '0' || parseFloat(course.price) === 0
                      ? 'Besplatno'
                      : formatCurrency(parseFloat(course.price))}
                  </div>
                  {course.price !== '0' && parseFloat(course.price) > 0 && (
                    <p className="text-sm text-gray-600">jednokratna uplata</p>
                  )}
                </div>

                <Button onClick={handleEnroll} className="w-full mb-4" size="lg">
                  Upiši se na tečaj
                </Button>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Razina:</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  {course.duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trajanje:</span>
                      <span className="font-medium">
                        {Math.floor(course.duration / 60)}h {course.duration % 60}min
                      </span>
                    </div>
                  )}
                  {course.language && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jezik:</span>
                      <span className="font-medium">Hrvatski</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Certifikat:</span>
                    <span className="font-medium">Da</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
