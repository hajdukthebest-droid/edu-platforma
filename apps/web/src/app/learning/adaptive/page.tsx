'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import api from '@/lib/api'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Calendar,
  BookOpen,
  Award,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Zap,
} from 'lucide-react'

export default function AdaptiveLearningPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')

  // Get user's enrolled courses
  const { data: enrollments } = useQuery({
    queryKey: ['user-enrollments'],
    queryFn: async () => {
      const response = await api.get('/progress/enrollments')
      return response.data.data
    },
  })

  // Get adaptive learning path for selected course
  const { data: adaptivePath } = useQuery({
    queryKey: ['adaptive-path', selectedCourseId],
    queryFn: async () => {
      const response = await api.get(`/ai/adaptive/path/${selectedCourseId}`)
      return response.data.data
    },
    enabled: !!selectedCourseId,
  })

  // Get completion prediction
  const { data: completionPrediction } = useQuery({
    queryKey: ['completion-prediction', selectedCourseId],
    queryFn: async () => {
      const response = await api.get(`/ai/analytics/completion/${selectedCourseId}`)
      return response.data.data
    },
    enabled: !!selectedCourseId,
  })

  // Get review schedule
  const { data: reviewSchedule } = useQuery({
    queryKey: ['review-schedule', selectedCourseId],
    queryFn: async () => {
      const response = await api.get(`/ai/adaptive/review-schedule/${selectedCourseId}`)
      return response.data.data
    },
    enabled: !!selectedCourseId,
  })

  // Get learning patterns
  const { data: learningPatterns } = useQuery({
    queryKey: ['learning-patterns'],
    queryFn: async () => {
      const response = await api.get('/ai/analytics/patterns')
      return response.data.data
    },
  })

  // Get learner profile
  const { data: learnerProfile } = useQuery({
    queryKey: ['learner-profile'],
    queryFn: async () => {
      const response = await api.get('/ai/analytics/profile')
      return response.data.data
    },
  })

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getDifficultyIcon = (adjustment: string) => {
    switch (adjustment) {
      case 'increase':
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case 'decrease':
        return <TrendingDown className="h-5 w-5 text-orange-600" />
      default:
        return <Target className="h-5 w-5 text-blue-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Adaptivno učenje</h1>
              <p className="text-blue-100 mt-1">
                Personaliziran put učenja prilagođen tvojim potrebama
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Learner Profile Summary */}
        {learnerProfile && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Stil učenja</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {learnerProfile.learningStyle}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {learnerProfile.learningStyle === 'marathon'
                    ? 'Duže sesije učenja'
                    : learnerProfile.learningStyle === 'sprint'
                    ? 'Kratke, intenzivne sesije'
                    : 'Uravnotežen pristup'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Stopa završetka
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {learnerProfile.completionStats?.completionRate || 0}%
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {learnerProfile.completionStats?.completedCourses || 0} od{' '}
                  {learnerProfile.completionStats?.totalEnrollments || 0} tečajeva
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Prosječna sesija</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {learningPatterns?.averageSessionDuration || 0} min
                </div>
                <p className="text-xs text-gray-600 mt-1">Dnevno učenje</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Zap className="h-6 w-6 text-yellow-500" />
                  {learningPatterns?.studyStreak || 0} dana
                </div>
                <p className="text-xs text-gray-600 mt-1">Nastavi tako!</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Course Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Odaberi tečaj</CardTitle>
            <CardDescription>
              Prikaži adaptivni put učenja za odabrani tečaj
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Odaberi tečaj u tijeku" />
              </SelectTrigger>
              <SelectContent>
                {enrollments
                  ?.filter((e: any) => e.progress < 100)
                  .map((enrollment: any) => (
                    <SelectItem key={enrollment.courseId} value={enrollment.courseId}>
                      {enrollment.course.title} - {enrollment.progress}% završeno
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedCourseId && (
          <>
            {/* Completion Prediction */}
            {completionPrediction && (
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Predviđanje završetka
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Vjerojatnost završetka
                          </span>
                          <span className="text-2xl font-bold">
                            {(completionPrediction.probability * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              completionPrediction.probability > 0.7
                                ? 'bg-green-600'
                                : completionPrediction.probability > 0.4
                                ? 'bg-yellow-600'
                                : 'bg-red-600'
                            }`}
                            style={{
                              width: `${completionPrediction.probability * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div
                        className={`border rounded-lg p-3 ${getRiskColor(
                          completionPrediction.riskLevel
                        )}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {completionPrediction.riskLevel === 'low' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                          <span className="font-semibold">
                            {completionPrediction.riskLevel === 'low'
                              ? 'Nizak rizik'
                              : completionPrediction.riskLevel === 'medium'
                              ? 'Srednji rizik'
                              : 'Visok rizik'}
                          </span>
                        </div>
                        {completionPrediction.estimatedDaysToComplete && (
                          <p className="text-sm">
                            Procjena: ~{completionPrediction.estimatedDaysToComplete}{' '}
                            dana do završetka
                          </p>
                        )}
                      </div>

                      {completionPrediction.recommendations?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Preporuke:
                          </h4>
                          <ul className="space-y-1">
                            {completionPrediction.recommendations.map(
                              (rec: string, idx: number) => (
                                <li key={idx} className="text-sm text-gray-700 flex gap-2">
                                  <span>•</span>
                                  <span>{rec}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Insights */}
                {learningPatterns && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {learningPatterns.optimalStudyHours?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Najbolje vrijeme za učenje:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {learningPatterns.optimalStudyHours.map((hour: number) => (
                                <Badge key={hour} variant="outline">
                                  {hour}:00 - {hour + 1}:00
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {learningPatterns.optimalStudyDays?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Produktivni dani:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {learningPatterns.optimalStudyDays.map((day: string) => (
                                <Badge key={day}>{day}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {learningPatterns.insights?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Savjeti:</h4>
                            <ul className="space-y-2">
                              {learningPatterns.insights.map((insight: string, idx: number) => (
                                <li
                                  key={idx}
                                  className="text-sm text-gray-700 flex gap-2 items-start"
                                >
                                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                                  <span>{insight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Adaptive Path */}
            {adaptivePath && (
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Tvoj adaptivni put
                      </CardTitle>
                      <CardDescription>
                        Personalizirane lekcije prilagođene tvojim potrebama
                      </CardDescription>
                    </div>
                    {adaptivePath.difficultyAdjustment && (
                      <div className="flex items-center gap-2 text-sm">
                        {getDifficultyIcon(adaptivePath.difficultyAdjustment)}
                        <span className="font-medium">
                          {adaptivePath.difficultyAdjustment === 'increase'
                            ? 'Povećaj težinu'
                            : adaptivePath.difficultyAdjustment === 'decrease'
                            ? 'Smanji težinu'
                            : 'Održi tempo'}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {adaptivePath.skillGaps?.length > 0 && (
                    <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-orange-800">
                        <AlertTriangle className="h-4 w-4" />
                        Potrebno poboljšanje:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {adaptivePath.skillGaps.map((gap: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-orange-700">
                            {gap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {adaptivePath.recommendedLessons?.length > 0 ? (
                      adaptivePath.recommendedLessons.map((lesson: any, idx: number) => (
                        <div
                          key={lesson.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                                  {idx + 1}
                                </div>
                                <div>
                                  <h4 className="font-semibold">{lesson.title}</h4>
                                  {lesson.reason && (
                                    <p className="text-sm text-blue-600">{lesson.reason}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-11">
                                <Badge variant="outline" className="text-xs">
                                  {lesson.type}
                                </Badge>
                                {lesson.priority && (
                                  <Badge
                                    className={
                                      lesson.priority === 'high'
                                        ? 'bg-red-100 text-red-700'
                                        : lesson.priority === 'medium'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }
                                  >
                                    {lesson.priority} prioritet
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/lessons/${lesson.id}`}>
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-600 py-8">
                        Nema preporučenih lekcija trenutno
                      </p>
                    )}
                  </div>

                  {adaptivePath.personalizedTips?.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-blue-800">
                        <Lightbulb className="h-4 w-4" />
                        Personalizirani savjeti:
                      </h4>
                      <ul className="space-y-2">
                        {adaptivePath.personalizedTips.map((tip: string, idx: number) => (
                          <li key={idx} className="text-sm text-blue-900 flex gap-2">
                            <span>•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Review Schedule */}
            {reviewSchedule && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Raspored ponavljanja
                  </CardTitle>
                  <CardDescription>
                    Spaced repetition za dugoročno zadržavanje znanja
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {reviewSchedule.todayReviews?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
                          <Clock className="h-4 w-4" />
                          Za danas ({reviewSchedule.todayReviews.length})
                        </h4>
                        <div className="space-y-2">
                          {reviewSchedule.todayReviews.map((review: any) => (
                            <div
                              key={review.lesson.id}
                              className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{review.lesson.title}</p>
                                <p className="text-sm text-gray-600">
                                  Zadnji put prije {review.daysSinceCompletion} dana
                                </p>
                              </div>
                              <Button size="sm" asChild>
                                <Link href={`/lessons/${review.lesson.id}`}>
                                  Ponovi
                                </Link>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {reviewSchedule.upcomingReviews?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-600">
                          <Calendar className="h-4 w-4" />
                          Nadolazeće ({reviewSchedule.upcomingReviews.length})
                        </h4>
                        <div className="space-y-2">
                          {reviewSchedule.upcomingReviews.map((review: any) => (
                            <div
                              key={review.lesson.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{review.lesson.title}</p>
                                <p className="text-sm text-gray-600">
                                  Za {review.daysUntilReview} dana
                                </p>
                              </div>
                              <Badge variant="outline">
                                {review.lesson.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!reviewSchedule.todayReviews?.length &&
                      !reviewSchedule.upcomingReviews?.length && (
                        <p className="text-center text-gray-600 py-8">
                          Nema planiranih ponavljanja
                        </p>
                      )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!selectedCourseId && enrollments && enrollments.length > 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Odaberi tečaj</h3>
              <p className="text-gray-600">
                Odaberi tečaj gore da vidiš svoj personalizirani put učenja
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
