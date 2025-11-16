'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, CheckCircle2 } from 'lucide-react'

export default function TakeQuizPage() {
  const params = useParams()
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number>(Date.now())

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz-start', params.id],
    queryFn: async () => {
      const response = await api.get(`/assessments/${params.id}/start`)
      return response.data.data
    },
  })

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/assessments/${params.id}/submit`, data)
      return response.data.data
    },
    onSuccess: (results) => {
      router.push(`/quiz/${params.id}/results/${results.attemptId}`)
    },
  })

  useEffect(() => {
    if (quiz?.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60)
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer)
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [quiz])

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    submitMutation.mutate({ answers, timeSpent })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
          <p className="text-gray-600">Učitavanje quiza...</p>
        </div>
      </div>
    )
  }

  if (!quiz) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{quiz.title}</h1>
                {quiz.description && (
                  <p className="text-gray-600 mt-1">{quiz.description}</p>
                )}
              </div>
              {timeLeft !== null && (
                <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
                  <Clock className="h-5 w-5" />
                  {formatTime(timeLeft)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        {quiz.questions?.map((question: any, idx: number) => (
          <Card key={question.id} className="mb-6">
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold">
                    Pitanje {idx + 1} od {quiz.questions.length}
                  </h3>
                  <span className="text-sm text-gray-600">
                    {question.points} {question.points === 1 ? 'bod' : 'bodova'}
                  </span>
                </div>
                <p className="text-gray-900">{question.question}</p>
              </div>

              {/* Multiple Choice */}
              {question.type === 'MULTIPLE_CHOICE' && (
                <div className="space-y-2">
                  {question.options?.map((option: string, optIdx: number) => (
                    <label
                      key={optIdx}
                      className="flex items-start gap-3 rounded-lg border border-gray-300 p-4 cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={answers[question.id]?.includes(optIdx)}
                        onChange={(e) => {
                          const current = answers[question.id] || []
                          setAnswers({
                            ...answers,
                            [question.id]: e.target.checked
                              ? [...current, optIdx]
                              : current.filter((i: number) => i !== optIdx),
                          })
                        }}
                        className="mt-1"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* True/False */}
              {question.type === 'TRUE_FALSE' && (
                <div className="space-y-2">
                  {['Točno', 'Netočno'].map((option, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-3 rounded-lg border border-gray-300 p-4 cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        checked={answers[question.id] === (idx === 0)}
                        onChange={() =>
                          setAnswers({
                            ...answers,
                            [question.id]: idx === 0,
                          })
                        }
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Short Answer */}
              {question.type === 'SHORT_ANSWER' && (
                <input
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [question.id]: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  placeholder="Unesite odgovor..."
                />
              )}

              {/* Essay */}
              {question.type === 'ESSAY' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [question.id]: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  rows={6}
                  placeholder="Unesite svoj odgovor..."
                />
              )}
            </CardContent>
          </Card>
        ))}

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            size="lg"
            className="px-8"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {submitMutation.isPending ? 'Spremanje...' : 'Predaj Quiz'}
          </Button>
        </div>
      </div>
    </div>
  )
}
