'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  AlertTriangle,
  Clock,
  Pause,
  Play,
  Send,
  ChevronLeft,
  ChevronRight,
  Maximize,
  AlertCircle,
} from 'lucide-react'

interface Question {
  id: string
  type: string
  question: string
  options?: any[]
  points: number
}

interface Assessment {
  id: string
  title: string
  timeLimit: number
  showTimer: boolean
  allowPause: boolean
  proctorMode: boolean
  requireFullscreen: boolean
  preventCopyPaste: boolean
  showOneQuestion: boolean
  allowBackNavigation: boolean
  questions: Question[]
}

interface TimedExamProps {
  assessment: Assessment
  sessionId: string
  initialTimeRemaining: number
  initialAnswers?: Record<string, any>
  onComplete?: (result: any) => void
}

export default function TimedExam({
  assessment,
  sessionId,
  initialTimeRemaining,
  initialAnswers = {},
  onComplete,
}: TimedExamProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTimeRemaining)
  const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [proctorWarnings, setProctorWarnings] = useState(0)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const saveRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Format time as MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Get timer color based on remaining time
  const getTimerColor = () => {
    const percentage = (timeRemaining / (assessment.timeLimit * 60)) * 100
    if (percentage <= 10) return 'text-red-600'
    if (percentage <= 25) return 'text-orange-500'
    return 'text-gray-900'
  }

  // Save progress to server
  const saveProgress = useCallback(async () => {
    try {
      await fetch(`/api/timed-exams/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          timeRemaining,
          timeElapsed: (assessment.timeLimit * 60) - timeRemaining,
          currentQuestion: currentQuestionIndex,
          answers,
        }),
      })
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }, [sessionId, timeRemaining, currentQuestionIndex, answers, assessment.timeLimit])

  // Record proctoring event
  const recordProctoringEvent = async (type: string, details?: string) => {
    try {
      await fetch(`/api/timed-exams/sessions/${sessionId}/proctoring-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type, details }),
      })
      setProctorWarnings(prev => prev + 1)
    } catch (error) {
      console.error('Error recording proctoring event:', error)
    }
  }

  // Timer effect
  useEffect(() => {
    if (isPaused || timeRemaining <= 0) return

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - auto submit
          handleSubmit()
          return 0
        }

        // Show warning at 5 minutes
        if (prev === 300) {
          setWarningMessage('5 minutes remaining!')
          setShowWarning(true)
          setTimeout(() => setShowWarning(false), 5000)
        }

        // Show warning at 1 minute
        if (prev === 60) {
          setWarningMessage('1 minute remaining!')
          setShowWarning(true)
          setTimeout(() => setShowWarning(false), 5000)
        }

        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, timeRemaining])

  // Auto-save effect
  useEffect(() => {
    saveRef.current = setInterval(() => {
      if (!isPaused) {
        saveProgress()
      }
    }, 30000) // Save every 30 seconds

    return () => {
      if (saveRef.current) clearInterval(saveRef.current)
    }
  }, [isPaused, saveProgress])

  // Fullscreen detection
  useEffect(() => {
    if (!assessment.requireFullscreen) return

    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement
      setIsFullscreen(isNowFullscreen)

      if (!isNowFullscreen && assessment.proctorMode) {
        recordProctoringEvent('FULLSCREEN_EXIT', 'User exited fullscreen')
        setWarningMessage('Warning: You exited fullscreen mode!')
        setShowWarning(true)
        setTimeout(() => setShowWarning(false), 3000)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [assessment.requireFullscreen, assessment.proctorMode])

  // Tab visibility detection
  useEffect(() => {
    if (!assessment.proctorMode) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordProctoringEvent('TAB_SWITCH', 'User switched tabs or minimized')
        setWarningMessage('Warning: Focus lost - this has been recorded!')
        setShowWarning(true)
        setTimeout(() => setShowWarning(false), 3000)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [assessment.proctorMode])

  // Prevent copy/paste
  useEffect(() => {
    if (!assessment.preventCopyPaste) return

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      recordProctoringEvent('COPY_PASTE', 'Attempted to copy')
    }

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      recordProctoringEvent('COPY_PASTE', 'Attempted to paste')
    }

    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)

    return () => {
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
    }
  }, [assessment.preventCopyPaste])

  const enterFullscreen = async () => {
    try {
      await containerRef.current?.requestFullscreen()
    } catch (error) {
      console.error('Error entering fullscreen:', error)
    }
  }

  const handlePause = async () => {
    if (!assessment.allowPause) return

    try {
      await fetch(`/api/timed-exams/sessions/${sessionId}/pause`, {
        method: 'POST',
        credentials: 'include',
      })
      setIsPaused(true)
    } catch (error) {
      console.error('Error pausing exam:', error)
    }
  }

  const handleResume = async () => {
    try {
      await fetch(`/api/timed-exams/sessions/${sessionId}/resume`, {
        method: 'POST',
        credentials: 'include',
      })
      setIsPaused(false)
    } catch (error) {
      console.error('Error resuming exam:', error)
    }
  }

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/timed-exams/sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers }),
      })

      const data = await response.json()

      if (data.success && onComplete) {
        onComplete(data.data)
      }
    } catch (error) {
      console.error('Error submitting exam:', error)
      setIsSubmitting(false)
    }
  }

  const currentQuestion = assessment.questions[currentQuestionIndex]
  const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== null).length
  const progress = (answeredCount / assessment.questions.length) * 100

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50">
      {/* Warning Banner */}
      {showWarning && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-3 text-center z-50 animate-pulse">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {warningMessage}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 bg-white border-b shadow-sm z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{assessment.title}</h1>
              <p className="text-sm text-muted-foreground">
                {answeredCount} of {assessment.questions.length} answered
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              {assessment.showTimer && (
                <div className={`flex items-center gap-2 text-2xl font-mono font-bold ${getTimerColor()}`}>
                  <Clock className="w-6 h-6" />
                  {formatTime(timeRemaining)}
                </div>
              )}

              {/* Pause Button */}
              {assessment.allowPause && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isPaused ? handleResume : handlePause}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </>
                  )}
                </Button>
              )}

              {/* Fullscreen Button */}
              {assessment.requireFullscreen && !isFullscreen && (
                <Button variant="outline" size="sm" onClick={enterFullscreen}>
                  <Maximize className="w-4 h-4 mr-1" />
                  Fullscreen
                </Button>
              )}
            </div>
          </div>

          {/* Progress */}
          <Progress value={progress} className="mt-3 h-2" />
        </div>
      </div>

      {/* Proctoring Warning */}
      {assessment.proctorMode && proctorWarnings > 0 && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">
              {proctorWarnings} proctoring warning{proctorWarnings > 1 ? 's' : ''} recorded
            </span>
          </div>
        </div>
      )}

      {/* Paused Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <Card className="p-8 text-center max-w-md">
            <Pause className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Exam Paused</h2>
            <p className="text-muted-foreground mb-6">
              Your timer is paused. Click resume to continue.
            </p>
            <Button onClick={handleResume} size="lg">
              <Play className="w-5 h-5 mr-2" />
              Resume Exam
            </Button>
          </Card>
        </div>
      )}

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {assessment.showOneQuestion ? (
          // One question at a time
          <Card className="p-6">
            <div className="mb-4">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {assessment.questions.length}
              </span>
              <span className="float-right text-sm font-medium">
                {currentQuestion.points} points
              </span>
            </div>

            <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>

            {/* Answer Options */}
            {currentQuestion.options && (
              <div className="space-y-3">
                {(currentQuestion.options as any[]).map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      answers[currentQuestion.id] === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={index}
                      checked={answers[currentQuestion.id] === index}
                      onChange={() => handleAnswerChange(currentQuestion.id, index)}
                      className="mr-3"
                    />
                    {typeof option === 'string' ? option : option.text}
                  </label>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={currentQuestionIndex === 0 || !assessment.allowBackNavigation}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              {currentQuestionIndex < assessment.questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  <Send className="w-4 h-4 mr-1" />
                  {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                </Button>
              )}
            </div>
          </Card>
        ) : (
          // All questions at once
          <div className="space-y-6">
            {assessment.questions.map((question, index) => (
              <Card key={question.id} className="p-6">
                <div className="mb-4">
                  <span className="text-sm text-muted-foreground">
                    Question {index + 1}
                  </span>
                  <span className="float-right text-sm font-medium">
                    {question.points} points
                  </span>
                </div>

                <h3 className="text-lg font-medium mb-4">{question.question}</h3>

                {question.options && (
                  <div className="space-y-3">
                    {(question.options as any[]).map((option, optIndex) => (
                      <label
                        key={optIndex}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          answers[question.id] === optIndex
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={optIndex}
                          checked={answers[question.id] === optIndex}
                          onChange={() => handleAnswerChange(question.id, optIndex)}
                          className="mr-3"
                        />
                        {typeof option === 'string' ? option : option.text}
                      </label>
                    ))}
                  </div>
                )}
              </Card>
            ))}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button size="lg" onClick={handleSubmit} disabled={isSubmitting}>
                <Send className="w-5 h-5 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
