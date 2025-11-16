'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'
import { Clock, AlertCircle } from 'lucide-react'

interface Question {
  id: string
  type: string
  question: string
  points: number
  options?: any[]
}

interface Assessment {
  id: string
  title: string
  description: string
  type: string
  timeLimit: number | null
  questions: Question[]
}

export default function TakeAssessmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const { data: assessment, isLoading } = useQuery({
    queryKey: ['assessment', params.id],
    queryFn: async () => {
      const response = await api.get(`/assessments/${params.id}/start`)
      return response.data.data as Assessment
    },
  })

  const submitMutation = useMutation({
    mutationFn: async (answers: Record<string, any>) => {
      const response = await api.post(`/assessments/${params.id}/submit`, { answers })
      return response.data.data
    },
    onSuccess: data => {
      router.push(`/assessments/${params.id}/results/${data.attemptId}`)
    },
  })

  // Timer
  useEffect(() => {
    if (assessment?.timeLimit) {
      setTimeLeft(assessment.timeLimit * 60) // Convert minutes to seconds

      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer)
            // Auto-submit when time runs out
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [assessment])

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmit = () => {
    if (window.confirm('Jeste li sigurni da želite predati odgovore?')) {
      submitMutation.mutate(answers)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Assessment nije pronađen</p>
        </div>
      </div>
    )
  }

  const currentQuestion = assessment.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{assessment.title}</CardTitle>
                {assessment.description && (
                  <CardDescription className="mt-2">{assessment.description}</CardDescription>
                )}
              </div>
              {timeLeft !== null && (
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Clock className="h-5 w-5" />
                  <span className={timeLeft < 60 ? 'text-red-600' : ''}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              Pitanje {currentQuestionIndex + 1} od {assessment.questions.length}
            </span>
            <span>{Math.round(progress)}% završeno</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              {currentQuestion.question}
              <span className="text-sm text-gray-500 ml-2">({currentQuestion.points} bodova)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderQuestion(currentQuestion, answers[currentQuestion.id], questionId =>
              handleAnswerChange(currentQuestion.id, questionId)
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Prethodno pitanje
          </Button>

          {currentQuestionIndex === assessment.questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
              {submitMutation.isPending ? 'Predavanje...' : 'Predaj odgovore'}
            </Button>
          ) : (
            <Button
              onClick={() =>
                setCurrentQuestionIndex(prev =>
                  Math.min(assessment.questions.length - 1, prev + 1)
                )
              }
            >
              Sljedeće pitanje
            </Button>
          )}
        </div>

        {/* Question Grid */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Pregled pitanja</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {assessment.questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`
                    aspect-square rounded-md flex items-center justify-center text-sm font-medium
                    ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : answers[q.id]
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function renderQuestion(question: Question, answer: any, onChange: (value: any) => void) {
  switch (question.type) {
    case 'MULTIPLE_CHOICE':
      return (
        <RadioGroup value={answer} onValueChange={onChange}>
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      )

    case 'TRUE_FALSE':
      return (
        <RadioGroup value={answer?.toString()} onValueChange={v => onChange(v === 'true')}>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" />
              <Label htmlFor="true" className="cursor-pointer">
                Točno
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" />
              <Label htmlFor="false" className="cursor-pointer">
                Netočno
              </Label>
            </div>
          </div>
        </RadioGroup>
      )

    case 'SHORT_ANSWER':
      return (
        <Input
          type="text"
          value={answer || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="Unesite svoj odgovor..."
          className="max-w-md"
        />
      )

    default:
      return <p className="text-gray-500">Tip pitanja nije podržan</p>
  }
}
