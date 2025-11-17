'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, XCircle, Play, Pause } from 'lucide-react'

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

interface VideoPlayerWithQuizProps {
  videoUrl: string
  lessonId: string
  quizzes: VideoQuiz[]
  onQuizAnswer?: (quizId: string, answer: number, isCorrect: boolean) => void
  onAllQuizzesCompleted?: () => void
}

export default function VideoPlayerWithQuiz({
  videoUrl,
  lessonId,
  quizzes,
  onQuizAnswer,
  onAllQuizzesCompleted,
}: VideoPlayerWithQuizProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState<VideoQuiz | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [quizResult, setQuizResult] = useState<{
    isCorrect: boolean
    explanation?: string
    correctAnswer?: number
  } | null>(null)
  const [answeredQuizzes, setAnsweredQuizzes] = useState<Set<string>>(new Set())
  const [showQuizOverlay, setShowQuizOverlay] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize answered quizzes from props
  useEffect(() => {
    const answered = new Set<string>()
    quizzes.forEach((quiz) => {
      if (quiz.isAnswered) {
        answered.add(quiz.id)
      }
    })
    setAnsweredQuizzes(answered)
  }, [quizzes])

  // Update current time
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [])

  // Check for quizzes at current timestamp
  useEffect(() => {
    const video = videoRef.current
    if (!video || showQuizOverlay) return

    // Find quiz that should appear at current time
    const quiz = quizzes.find(
      (q) =>
        !answeredQuizzes.has(q.id) &&
        currentTime >= q.timestamp &&
        currentTime < q.timestamp + 1 // 1 second window
    )

    if (quiz) {
      setCurrentQuiz(quiz)
      setShowQuizOverlay(true)
      setSelectedAnswer(null)
      setQuizResult(null)

      // Pause video if required
      if (quiz.pauseVideo && !video.paused) {
        video.pause()
      }
    }
  }, [currentTime, quizzes, answeredQuizzes, showQuizOverlay])

  const handleTogglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (quizResult) return // Already answered
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || !currentQuiz) return

    setIsSubmitting(true)

    try {
      // Call API to submit answer
      const response = await fetch(`/api/video-quizzes/${currentQuiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: selectedAnswer,
        }),
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        const { isCorrect, explanation, correctAnswer } = data.data

        setQuizResult({
          isCorrect,
          explanation,
          correctAnswer,
        })

        // Mark as answered
        setAnsweredQuizzes((prev) => new Set(prev).add(currentQuiz.id))

        // Callback
        if (onQuizAnswer) {
          onQuizAnswer(currentQuiz.id, selectedAnswer, isCorrect)
        }

        // Check if all required quizzes are completed
        const requiredQuizzes = quizzes.filter((q) => q.isRequired)
        const allCompleted = requiredQuizzes.every(
          (q) => answeredQuizzes.has(q.id) || q.id === currentQuiz.id
        )

        if (allCompleted && onAllQuizzesCompleted) {
          onAllQuizzesCompleted()
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinue = () => {
    setShowQuizOverlay(false)
    setCurrentQuiz(null)
    setSelectedAnswer(null)
    setQuizResult(null)

    // Resume video
    const video = videoRef.current
    if (video && video.paused) {
      video.play()
    }
  }

  const handleSkip = () => {
    if (!currentQuiz || currentQuiz.isRequired) return
    handleContinue()
  }

  // Check if can skip (not required and not answered yet)
  const canSkip = currentQuiz && !currentQuiz.isRequired && !quizResult

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {/* Video Player */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full"
        controls
        controlsList="nodownload"
      />

      {/* Quiz Overlay */}
      {showQuizOverlay && currentQuiz && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-10">
          <Card className="w-full max-w-2xl p-6 space-y-6">
            {/* Quiz Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Quiz Question</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{currentQuiz.points} points</span>
                  {currentQuiz.isRequired && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                      Required
                    </span>
                  )}
                </div>
              </div>
              <p className="text-lg">{currentQuiz.question}</p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuiz.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrectAnswer =
                  quizResult && quizResult.correctAnswer === index
                const isWrongAnswer =
                  quizResult && selectedAnswer === index && !quizResult.isCorrect

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={!!quizResult || isSubmitting}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      isSelected && !quizResult
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${
                      isCorrectAnswer
                        ? 'border-green-500 bg-green-50'
                        : ''
                    } ${
                      isWrongAnswer ? 'border-red-500 bg-red-50' : ''
                    } ${
                      quizResult ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {isCorrectAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                      {isWrongAnswer && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Result Message */}
            {quizResult && (
              <div
                className={`p-4 rounded-lg ${
                  quizResult.isCorrect
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {quizResult.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p
                      className={`font-medium ${
                        quizResult.isCorrect ? 'text-green-900' : 'text-red-900'
                      }`}
                    >
                      {quizResult.isCorrect ? 'Correct!' : 'Incorrect'}
                    </p>
                    {quizResult.explanation && (
                      <p className="mt-1 text-sm text-gray-700">
                        {quizResult.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              {canSkip && (
                <Button variant="ghost" onClick={handleSkip}>
                  Skip
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                {!quizResult ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                  </Button>
                ) : (
                  <Button onClick={handleContinue}>Continue Video</Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quiz Progress Indicator */}
      <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-2 rounded-lg text-sm z-20">
        Quizzes: {answeredQuizzes.size} / {quizzes.length}
      </div>
    </div>
  )
}
