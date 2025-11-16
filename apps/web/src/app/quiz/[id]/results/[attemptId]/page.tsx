'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, XCircle, Award, Clock, Home } from 'lucide-react'
import Link from 'next/link'

export default function QuizResultsPage() {
  const params = useParams()
  const router = useRouter()

  const { data: attempt, isLoading } = useQuery({
    queryKey: ['quiz-attempt', params.attemptId],
    queryFn: async () => {
      const response = await api.get(`/assessments/attempts/${params.attemptId}`)
      return response.data.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
          <p className="text-gray-600">Učitavanje rezultata...</p>
        </div>
      </div>
    )
  }

  if (!attempt) return null

  const isPending = attempt.gradingStatus === 'PENDING'
  const scorePercentage = attempt.score || 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Results Header */}
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            {isPending ? (
              <>
                <Clock className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                <h1 className="text-3xl font-bold mb-2">Čeka ocjenjivanje</h1>
                <p className="text-gray-600">
                  Vaš quiz sadrži pitanja koja zahtijevaju ručno ocjenjivanje.
                  Rezultati će biti dostupni nakon što instruktor pregleda vaše odgovore.
                </p>
              </>
            ) : attempt.passed ? (
              <>
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h1 className="text-3xl font-bold mb-2 text-green-600">
                  Čestitamo! Prošli ste!
                </h1>
                <p className="text-gray-600 mb-4">
                  Postigli ste {scorePercentage.toFixed(1)}%
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold">
                    +{attempt.assessment?.pointsReward || 0} bodova
                  </span>
                </div>
              </>
            ) : (
              <>
                <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                <h1 className="text-3xl font-bold mb-2 text-red-600">
                  Niste prošli
                </h1>
                <p className="text-gray-600">
                  Postigli ste {scorePercentage.toFixed(1)}%. Potrebno je{' '}
                  {attempt.assessment?.passingScore || 70}% za prolaz.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        {!isPending && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Pregled rezultata</h2>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {scorePercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Postotak</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {attempt.earnedPoints}/{attempt.totalPoints}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Bodova</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {attempt.timeSpent ? Math.floor(attempt.timeSpent / 60) : 0}min
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Vrijeme</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    attempt.passed ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructor Feedback */}
        {attempt.feedback && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Povratna informacija</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{attempt.feedback}</p>
            </CardContent>
          </Card>
        )}

        {/* Question Breakdown */}
        {attempt.assessment?.showResults && attempt.questionAttempts && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Detalji po pitanjima</h2>

              <div className="space-y-4">
                {attempt.questionAttempts.map((qa: any, idx: number) => (
                  <div
                    key={qa.id}
                    className={`rounded-lg border-2 p-4 ${
                      qa.isCorrect === true
                        ? 'border-green-200 bg-green-50'
                        : qa.isCorrect === false
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">Pitanje {idx + 1}</h3>
                      {qa.isCorrect !== null && (
                        <div className="flex items-center gap-2">
                          {qa.isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className="text-sm font-medium">
                            {qa.pointsEarned} bodova
                          </span>
                        </div>
                      )}
                    </div>

                    {qa.instructorFeedback && (
                      <div className="mt-2 rounded bg-white p-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Komentar instruktora:
                        </p>
                        <p className="text-sm text-gray-600">{qa.instructorFeedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Natrag na Dashboard
            </Link>
          </Button>

          {!attempt.passed && (
            <Button
              onClick={() => router.push(`/quiz/${params.id}`)}
              className="flex-1"
            >
              Pokušaj ponovno
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
