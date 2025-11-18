'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import api from '@/lib/api'
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Clock,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoQuiz {
  id: string
  timestamp: number
  question: string
  options: string[]
  points: number
  isRequired: boolean
  pauseVideo: boolean
  isAnswered?: boolean
  userAnswer?: number
  isCorrect?: boolean
  explanation?: string
  correctAnswer?: number
}

interface VideoQuizOverlayProps {
  lessonId: string
  currentTime: number
  onPauseVideo: () => void
  onResumeVideo: () => void
  isVideoPlaying: boolean
}

export function VideoQuizOverlay({
  lessonId,
  currentTime,
  onPauseVideo,
  onResumeVideo,
  isVideoPlaying,
}: VideoQuizOverlayProps) {
  const queryClient = useQueryClient()
  const [activeQuiz, setActiveQuiz] = useState<VideoQuiz | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [startTime, setStartTime] = useState<number>(0)
  const [triggeredQuizIds, setTriggeredQuizIds] = useState<Set<string>>(new Set())

  // Fetch quizzes for this lesson
  const { data: quizzes = [] } = useQuery<VideoQuiz[]>({
    queryKey: ['video-quizzes', lessonId],
    queryFn: async () => {
      const response = await api.get(`/video-quizzes/lesson/${lessonId}`)
      return response.data.data
    },
  })

  // Submit answer mutation
  const submitMutation = useMutation({
    mutationFn: async (data: { quizId: string; answer: number; timeSpent: number }) => {
      const response = await api.post(`/video-quizzes/${data.quizId}/submit`, {
        answer: data.answer,
        timeSpent: data.timeSpent,
      })
      return response.data.data
    },
    onSuccess: (data) => {
      setResult(data)
      setShowResult(true)
      queryClient.invalidateQueries({ queryKey: ['video-quizzes', lessonId] })
    },
  })

  // Check if we should show a quiz based on current video time
  useEffect(() => {
    if (!isVideoPlaying || activeQuiz) return

    const quiz = quizzes.find(q => {
      // Check if we've passed the timestamp and haven't shown this quiz yet
      const isAtTime = currentTime >= q.timestamp && currentTime < q.timestamp + 2
      const notTriggered = !triggeredQuizIds.has(q.id)
      const notAnswered = !q.isAnswered

      return isAtTime && notTriggered && notAnswered
    })

    if (quiz) {
      setTriggeredQuizIds(prev => new Set([...prev, quiz.id]))
      setActiveQuiz(quiz)
      setStartTime(Date.now())
      setSelectedAnswer(null)
      setShowResult(false)
      setResult(null)

      if (quiz.pauseVideo) {
        onPauseVideo()
      }
    }
  }, [currentTime, quizzes, isVideoPlaying, activeQuiz, triggeredQuizIds, onPauseVideo])

  const handleSubmit = () => {
    if (selectedAnswer === null || !activeQuiz) return

    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    submitMutation.mutate({
      quizId: activeQuiz.id,
      answer: selectedAnswer,
      timeSpent,
    })
  }

  const handleContinue = () => {
    setActiveQuiz(null)
    setShowResult(false)
    setResult(null)
    onResumeVideo()
  }

  // Count answered and total quizzes
  const totalQuizzes = quizzes.length
  const answeredQuizzes = quizzes.filter(q => q.isAnswered).length + (showResult ? 1 : 0)
  const progress = totalQuizzes > 0 ? (answeredQuizzes / totalQuizzes) * 100 : 0

  if (!activeQuiz) {
    // Show small indicator of quiz progress if there are quizzes
    if (totalQuizzes > 0) {
      return (
        <div className="absolute bottom-20 left-4 bg-black/60 backdrop-blur rounded px-3 py-1.5 text-white text-xs flex items-center gap-2">
          <HelpCircle className="h-3 w-3" />
          <span>Kvizovi: {answeredQuizzes}/{totalQuizzes}</span>
        </div>
      )
    }
    return null
  }

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-xl animate-in zoom-in-95 duration-200">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HelpCircle className="h-4 w-4" />
              <span>Pitanje {triggeredQuizIds.size} od {totalQuizzes}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4 text-yellow-500" />
              <span>{activeQuiz.points} bodova</span>
            </div>
          </div>
          <CardTitle className="text-xl">{activeQuiz.question}</CardTitle>
          {activeQuiz.isRequired && (
            <CardDescription className="flex items-center gap-1 text-amber-600">
              <AlertCircle className="h-3 w-3" />
              Ovo pitanje je obavezno za nastavak
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Options */}
          <div className="space-y-2">
            {activeQuiz.options.map((option, index) => {
              const isSelected = selectedAnswer === index
              const isCorrectAnswer = showResult && result?.correctAnswer === index
              const isWrongSelected = showResult && isSelected && !result?.isCorrect

              return (
                <button
                  key={index}
                  onClick={() => !showResult && setSelectedAnswer(index)}
                  disabled={showResult}
                  className={cn(
                    'w-full p-3 text-left rounded-lg border transition-all',
                    'hover:border-blue-300 hover:bg-blue-50',
                    isSelected && !showResult && 'border-blue-500 bg-blue-50',
                    isCorrectAnswer && 'border-green-500 bg-green-50',
                    isWrongSelected && 'border-red-500 bg-red-50',
                    showResult && !isCorrectAnswer && !isWrongSelected && 'opacity-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'w-6 h-6 rounded-full border flex items-center justify-center text-sm font-medium',
                      isSelected && !showResult && 'bg-blue-500 text-white border-blue-500',
                      isCorrectAnswer && 'bg-green-500 text-white border-green-500',
                      isWrongSelected && 'bg-red-500 text-white border-red-500'
                    )}>
                      {isCorrectAnswer ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isWrongSelected ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </span>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Result */}
          {showResult && result && (
            <div className={cn(
              'p-4 rounded-lg',
              result.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            )}>
              <div className="flex items-center gap-2 mb-2">
                {result.isCorrect ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Točno!</span>
                    <span className="text-green-700 text-sm">+{result.pointsAwarded} bodova</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-800">Netočno</span>
                  </>
                )}
              </div>
              {result.explanation && (
                <p className="text-sm text-gray-700">{result.explanation}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            {!showResult ? (
              <Button
                onClick={handleSubmit}
                disabled={selectedAnswer === null || submitMutation.isPending}
              >
                {submitMutation.isPending ? 'Provjera...' : 'Provjeri odgovor'}
              </Button>
            ) : (
              <Button onClick={handleContinue}>
                Nastavi gledanje
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>

          {/* Progress bar */}
          <div className="pt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Napredak kviza</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
