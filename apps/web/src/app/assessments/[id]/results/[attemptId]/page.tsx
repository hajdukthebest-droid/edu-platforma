'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'
import { CheckCircle, XCircle, Award, TrendingUp } from 'lucide-react'

export default function AssessmentResultsPage({
  params,
}: {
  params: { id: string; attemptId: string }
}) {
  const { data: attempt, isLoading } = useQuery({
    queryKey: ['attempt', params.attemptId],
    queryFn: async () => {
      const response = await api.get(`/assessments/attempts/${params.attemptId}`)
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

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Rezultati nisu pronađeni</p>
      </div>
    )
  }

  const passed = attempt.passed
  const scorePercentage = attempt.score

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Results Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center">
              {passed ? (
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              )}
              <h1 className="text-3xl font-bold mb-2">
                {passed ? 'Čestitamo! 🎉' : 'Niste prošli'}
              </h1>
              <p className="text-gray-600 mb-6">
                {passed
                  ? 'Uspješno ste završili assessment!'
                  : `Potrebno je ${attempt.assessment.passingScore}% za prolaz`}
              </p>

              <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {scorePercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Postotak</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {attempt.earnedPoints}/{attempt.totalPoints}
                  </div>
                  <div className="text-sm text-gray-600">Bodovi</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {attempt.assessment.questions?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Pitanja</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        {attempt.assessment.showResults && attempt.assessment.questions && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Detalji odgovora</h2>

            {attempt.assessment.questions.map((question: any, index: number) => {
              const userAnswer = attempt.answers[question.id]
              const isCorrect = checkAnswer(question, userAnswer)

              return (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">
                        Pitanje {index + 1}: {question.question}
                      </CardTitle>
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Vaš odgovor: </span>
                        <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {formatAnswer(userAnswer, question)}
                        </span>
                      </div>

                      {attempt.assessment.showCorrectAnswers && !isCorrect && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">
                            Točan odgovor:{' '}
                          </span>
                          <span className="text-green-600">
                            {formatAnswer(question.correctAnswers, question)}
                          </span>
                        </div>
                      )}

                      {attempt.assessment.showCorrectAnswers && question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm text-gray-700">
                            <strong>Objašnjenje:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/dashboard">Povratak na Dashboard</Link>
          </Button>
          {!passed && attempt.assessment.maxAttempts && (
            <Button asChild>
              <Link href={`/assessments/${params.id}/take`}>Pokušaj ponovno</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function checkAnswer(question: any, userAnswer: any): boolean {
  if (!userAnswer) return false

  switch (question.type) {
    case 'MULTIPLE_CHOICE':
      return userAnswer === question.correctAnswers
    case 'TRUE_FALSE':
      return userAnswer === question.correctAnswers
    case 'SHORT_ANSWER':
      const correctAnswers = Array.isArray(question.correctAnswers)
        ? question.correctAnswers
        : [question.correctAnswers]
      return correctAnswers.some(
        (correct: string) =>
          correct.toLowerCase().trim() === String(userAnswer).toLowerCase().trim()
      )
    default:
      return false
  }
}

function formatAnswer(answer: any, question: any): string {
  if (answer === null || answer === undefined) return 'Bez odgovora'

  switch (question.type) {
    case 'MULTIPLE_CHOICE':
      if (question.options && question.options[answer]) {
        return question.options[answer]
      }
      return String(answer)
    case 'TRUE_FALSE':
      return answer ? 'Točno' : 'Netočno'
    case 'SHORT_ANSWER':
      return String(answer)
    default:
      return String(answer)
  }
}
