'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import {
  BookOpen,
  TrendingUp,
  Star,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  Target,
  Brain,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function RecommendationsPage() {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['personalized-recommendations'],
    queryFn: async () => {
      const response = await api.get('/ai/recommendations/personalized?limit=12')
      return response.data.data
    },
  })

  const { data: nextCourse } = useQuery({
    queryKey: ['predicted-next-course'],
    queryFn: async () => {
      const response = await api.get('/ai/recommendations/next-course')
      return response.data.data
    },
  })

  const { data: learningSummary } = useQuery({
    queryKey: ['user-learning-summary'],
    queryFn: async () => {
      const response = await api.get('/ai/summary/user/learning')
      return response.data.data
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Personalizirane preporuke</h1>
              <p className="text-blue-100 mt-1">
                Tečajevi prilagođeni tvojim interesima i ciljevima
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Learning Stats */}
          {learningSummary && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ukupno tečajeva
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {learningSummary.totalEnrollments}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {learningSummary.completedCourses} završenih
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Stopa završetka
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {learningSummary.completionRate}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${learningSummary.completionRate}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">U tijeku</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {learningSummary.inProgressCourses}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Aktivan učenik
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Next Recommended Course */}
        {nextCourse && (
          <Card className="mb-8 border-2 border-blue-500 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <CardTitle>Sljedeći korak u tvom učenju</CardTitle>
              </div>
              <CardDescription>
                Preporučamo ovaj tečaj na temelju tvojih završenih tečajeva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                {nextCourse.thumbnail && (
                  <img
                    src={nextCourse.thumbnail}
                    alt={nextCourse.title}
                    className="w-full md:w-48 h-32 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{nextCourse.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {nextCourse.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <Badge>{nextCourse.level}</Badge>
                    <Badge variant="outline">{nextCourse.category?.name}</Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span>{nextCourse.averageRating?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{nextCourse._count?.enrollments || 0} studenata</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button asChild>
                      <Link href={`/courses/${nextCourse.slug}`}>
                        Vidi tečaj
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    {nextCourse.price > 0 ? (
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(nextCourse.price)}
                      </span>
                    ) : (
                      <Badge variant="secondary" className="text-lg px-4 py-1">
                        Besplatno
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Recommendations */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Sve preporuke za tebe</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recommendations && recommendations.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((course: any) => (
              <Card
                key={course.id}
                className="hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <Link href={`/courses/${course.slug}`}>
                  {course.thumbnail && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {course.recommendationScore && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          {course.recommendationScore.toFixed(0)}% match
                        </div>
                      )}
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>

                    {course.recommendationReasons &&
                      course.recommendationReasons.length > 0 && (
                        <p className="text-sm text-blue-600 mb-3">
                          {course.recommendationReasons[0]}
                        </p>
                      )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {course.level}
                      </Badge>
                      {course.category && (
                        <Badge variant="outline" className="text-xs">
                          {course.category.name}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span>{course.averageRating?.toFixed(1) || 'N/A'}</span>
                        <span className="text-gray-400">
                          ({course._count?.reviews || 0})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="h-3 w-3" />
                        <span>{course._count?.enrollments || 0}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      {course.price > 0 ? (
                        <span className="text-lg font-bold text-blue-600">
                          {formatPrice(course.price)}
                        </span>
                      ) : (
                        <Badge variant="secondary">Besplatno</Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        Vidi više
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Još nema preporuka</h3>
              <p className="text-gray-600 mb-6">
                Upiši se na nekoliko tečajeva i ocijeni ih da bi dobio personalizirane
                preporuke
              </p>
              <Button asChild>
                <Link href="/courses">Pregledaj tečajeve</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
