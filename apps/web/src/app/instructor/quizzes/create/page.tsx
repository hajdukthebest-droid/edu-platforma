'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2, GripVertical, Save } from 'lucide-react'
import Link from 'next/link'

interface Question {
  id?: string
  type: string
  question: string
  explanation?: string
  points: number
  options?: string[]
  correctAnswers?: any
}

export default function CreateQuizPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    type: 'QUIZ',
    timeLimit: 60,
    passingScore: 70,
    maxAttempts: 3,
    shuffleQuestions: false,
    shuffleAnswers: false,
    showResults: true,
    showCorrectAnswers: true,
    pointsReward: 50,
    isPublished: false,
  })

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    type: 'MULTIPLE_CHOICE',
    question: '',
    explanation: '',
    points: 1,
    options: ['', '', '', ''],
    correctAnswers: [],
  })

  // Create assessment mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/assessments', data)
      return response.data.data
    },
    onSuccess: async (assessment) => {
      // Add questions
      for (const question of questions) {
        await api.post(`/assessments/${assessment.id}/questions`, question)
      }

      queryClient.invalidateQueries({ queryKey: ['instructor-assessments'] })
      router.push(`/instructor/quizzes/${assessment.id}`)
    },
  })

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      alert('Unesite pitanje')
      return
    }

    setQuestions([...questions, { ...currentQuestion }])
    setCurrentQuestion({
      type: 'MULTIPLE_CHOICE',
      question: '',
      explanation: '',
      points: 1,
      options: ['', '', '', ''],
      correctAnswers: [],
    })
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!quizData.title.trim()) {
      alert('Unesite naziv quiza')
      return
    }

    if (questions.length === 0) {
      alert('Dodajte barem jedno pitanje')
      return
    }

    createMutation.mutate(quizData)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/instructor/quizzes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Natrag
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Kreiraj Novi Quiz</h1>
          <p className="text-gray-600 mt-2">
            Definiraj postavke quiza i dodaj pitanja
          </p>
        </div>

        {/* Quiz Settings */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">Postavke Quiza</h2>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Naziv Quiza *
                </label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) =>
                    setQuizData({ ...quizData, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  placeholder="Npr. Farmakologija - Modul 1 Test"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Opis
                </label>
                <textarea
                  value={quizData.description}
                  onChange={(e) =>
                    setQuizData({ ...quizData, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  rows={3}
                  placeholder="Opis quiza..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Vremensko ograničenje (min)
                  </label>
                  <input
                    type="number"
                    value={quizData.timeLimit}
                    onChange={(e) =>
                      setQuizData({
                        ...quizData,
                        timeLimit: parseInt(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Prolazni prag (%)
                  </label>
                  <input
                    type="number"
                    value={quizData.passingScore}
                    onChange={(e) =>
                      setQuizData({
                        ...quizData,
                        passingScore: parseInt(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Maks. pokušaja
                  </label>
                  <input
                    type="number"
                    value={quizData.maxAttempts}
                    onChange={(e) =>
                      setQuizData({
                        ...quizData,
                        maxAttempts: parseInt(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bodovi nagrade
                  </label>
                  <input
                    type="number"
                    value={quizData.pointsReward}
                    onChange={(e) =>
                      setQuizData({
                        ...quizData,
                        pointsReward: parseInt(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={quizData.shuffleQuestions}
                    onChange={(e) =>
                      setQuizData({
                        ...quizData,
                        shuffleQuestions: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Nasumično poredaj pitanja</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={quizData.shuffleAnswers}
                    onChange={(e) =>
                      setQuizData({
                        ...quizData,
                        shuffleAnswers: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Nasumično poredaj odgovore</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={quizData.showResults}
                    onChange={(e) =>
                      setQuizData({
                        ...quizData,
                        showResults: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Prikaži rezultate nakon završetka</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={quizData.showCorrectAnswers}
                    onChange={(e) =>
                      setQuizData({
                        ...quizData,
                        showCorrectAnswers: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Prikaži točne odgovore</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Builder */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">Dodaj Pitanje</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tip pitanja
                </label>
                <select
                  value={currentQuestion.type}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      type: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                >
                  <option value="MULTIPLE_CHOICE">Višestruki izbor</option>
                  <option value="TRUE_FALSE">Točno/Netočno</option>
                  <option value="SHORT_ANSWER">Kratak odgovor</option>
                  <option value="ESSAY">Esej</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Pitanje *
                </label>
                <textarea
                  value={currentQuestion.question}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      question: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  rows={3}
                  placeholder="Unesite pitanje..."
                />
              </div>

              {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Odgovori
                  </label>
                  {currentQuestion.options?.map((option, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={currentQuestion.correctAnswers?.includes(idx)}
                        onChange={(e) => {
                          const correctAnswers = e.target.checked
                            ? [...(currentQuestion.correctAnswers || []), idx]
                            : currentQuestion.correctAnswers?.filter(
                                (i: number) => i !== idx
                              )
                          setCurrentQuestion({
                            ...currentQuestion,
                            correctAnswers,
                          })
                        }}
                        className="mt-3"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(currentQuestion.options || [])]
                          newOptions[idx] = e.target.value
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: newOptions,
                          })
                        }}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
                        placeholder={`Odgovor ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'TRUE_FALSE' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Točan odgovor
                  </label>
                  <select
                    value={currentQuestion.correctAnswers || 'true'}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        correctAnswers: e.target.value === 'true',
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  >
                    <option value="true">Točno</option>
                    <option value="false">Netočno</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bodovi
                  </label>
                  <input
                    type="number"
                    value={currentQuestion.points}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        points: parseInt(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Objašnjenje (opcionalno)
                </label>
                <textarea
                  value={currentQuestion.explanation}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      explanation: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  rows={2}
                  placeholder="Objašnjenje za točan odgovor..."
                />
              </div>

              <Button onClick={addQuestion} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Dodaj Pitanje
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        {questions.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                Pitanja ({questions.length})
              </h2>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 rounded-lg border border-gray-200 p-4"
                  >
                    <GripVertical className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                              {q.type}
                            </span>
                            <span className="text-sm text-gray-600">
                              {q.points} bodova
                            </span>
                          </div>
                          <p className="font-medium">{q.question}</p>
                        </div>
                        <button
                          onClick={() => removeQuestion(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            {createMutation.isPending ? 'Spremanje...' : 'Spremi Quiz'}
          </Button>
        </div>
      </div>
    </div>
  )
}
