'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { BookOpen, Check, CheckCircle2, Clock, GraduationCap, PlayCircle, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LearningPathDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: learningPath, isLoading } = useQuery({
    queryKey: ['learning-path', params.slug],
    queryFn: async () => {
      const response = await api.get(`/learning-paths/slug/${params.slug}`)
      return response.data.data
    },
  })

  const { data: userProgress } = useQuery({
    queryKey: ['learning-path-progress', learningPath?.id],
    queryFn: async () => {
      if (!user || !learningPath) return null
      try {
        const response = await api.get(`/learning-paths/${learningPath.id}/progress`)
        return response.data.data
      } catch (error) {
        return null
      }
    },
    enabled: !!user && !!learningPath,
  })

  const enrollMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/learning-paths/${learningPath.id}/enroll`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-path-progress', learningPath.id] })
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        router.push('/login')
      } else {
        alert(error.response?.data?.message || 'Greška prilikom upisa')
      }
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!learningPath) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Putanja učenja nije pronađena
      </div>
    )
  }

  const isEnrolled = !!userProgress
  const totalCourses = learningPath.courses.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              {learningPath.level && (
                <span className="px-3 py-1 bg-white/20 rounded text-sm">
                  {learningPath.level === 'BEGINNER' && 'Početnik'}
                  {learningPath.level === 'INTERMEDIATE' && 'Srednji'}
                  {learningPath.level === 'ADVANCED' && 'Napredni'}
                </span>
              )}
              <span className="px-3 py-1 bg-white/20 rounded text-sm">
                {totalCourses} {totalCourses === 1 ? 'tečaj' : 'tečajeva'}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4">{learningPath.title}</h1>
            <p className="text-xl text-purple-100 mb-6">{learningPath.description}</p>

            <div className="flex items-center gap-6">
              {learningPath.estimatedHours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>~{learningPath.estimatedHours}h</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{learningPath._count.userPaths} polaznika</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card (if enrolled) */}
            {isEnrolled && userProgress && (
              <Card>
                <CardHeader>
                  <CardTitle>Vaš napredak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>
                          {userProgress.completedCourses} od {totalCourses} tečajeva završeno
                        </span>
                        <span className="font-medium">
                          {userProgress.progressPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-purple-600 h-3 rounded-full transition-all"
                          style={{ width: `${userProgress.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                    {userProgress.isCompleted && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">Čestitamo! Završili ste ovu putanju učenja!</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Courses */}
            <Card>
              <CardHeader>
                <CardTitle>Tečajevi u putanji</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningPath.courses.map((pathCourse: any, index: number) => (
                    <div
                      key={pathCourse.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">{pathCourse.course.title}</h3>
                        {pathCourse.course.shortDescription && (
                          <p className="text-sm text-gray-600 mb-2">
                            {pathCourse.course.shortDescription}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {pathCourse.course.level && (
                            <span>
                              {pathCourse.course.level === 'BEGINNER' && 'Početnik'}
                              {pathCourse.course.level === 'INTERMEDIATE' && 'Srednji'}
                              {pathCourse.course.level === 'ADVANCED' && 'Napredni'}
                            </span>
                          )}
                          {pathCourse.course.duration && (
                            <span>
                              {Math.floor(pathCourse.course.duration / 60)}h{' '}
                              {pathCourse.course.duration % 60}min
                            </span>
                          )}
                          {pathCourse.course.averageRating > 0 && (
                            <span>⭐ {pathCourse.course.averageRating.toFixed(1)}</span>
                          )}
                        </div>
                      </div>
                      <Link href={`/courses/${pathCourse.course.slug}`}>
                        <Button variant="outline" size="sm">
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Otvori
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6">
                {!isEnrolled ? (
                  <>
                    <div className="text-center mb-6">
                      <GraduationCap className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                      <h3 className="font-bold text-lg mb-2">Započni putanju učenja</h3>
                      <p className="text-sm text-gray-600">
                        Upiši se na ovu putanju učenja i pristupaj svim tečajevima
                      </p>
                    </div>

                    <Button
                      onClick={() => enrollMutation.mutate()}
                      disabled={enrollMutation.isPending}
                      className="w-full mb-4"
                      size="lg"
                    >
                      Upiši se na putanju
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Upisani ste!</h3>
                      <p className="text-sm text-gray-600">
                        Nastavite s učenjem i završite sve tečajeve
                      </p>
                    </div>

                    <Link href="/dashboard">
                      <Button className="w-full" size="lg">
                        Nastavi učenje
                      </Button>
                    </Link>
                  </>
                )}

                <div className="mt-6 pt-6 border-t space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tečajevi:</span>
                    <span className="font-medium">{totalCourses}</span>
                  </div>
                  {learningPath.estimatedHours && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ukupno:</span>
                      <span className="font-medium">~{learningPath.estimatedHours}h</span>
                    </div>
                  )}
                  {learningPath.level && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Razina:</span>
                      <span className="font-medium">
                        {learningPath.level === 'BEGINNER' && 'Početnik'}
                        {learningPath.level === 'INTERMEDIATE' && 'Srednji'}
                        {learningPath.level === 'ADVANCED' && 'Napredni'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Polaznika:</span>
                    <span className="font-medium">{learningPath._count.userPaths}</span>
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
