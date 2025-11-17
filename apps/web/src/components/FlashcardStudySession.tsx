'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RotateCcw, ChevronRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

interface Flashcard {
  id: string
  front: string
  back: string
  hint?: string
  image?: string
  orderIndex: number
}

interface FlashcardStudySessionProps {
  deckId: string
  deckTitle: string
  onComplete?: (results: StudyResults) => void
}

interface StudyResults {
  totalCards: number
  againCount: number
  hardCount: number
  goodCount: number
  easyCount: number
}

type Difficulty = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'

export default function FlashcardStudySession({
  deckId,
  deckTitle,
  onComplete,
}: FlashcardStudySessionProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [results, setResults] = useState<Record<Difficulty, number>>({
    AGAIN: 0,
    HARD: 0,
    GOOD: 0,
    EASY: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load study session
  useEffect(() => {
    loadStudySession()
  }, [deckId])

  const loadStudySession = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/flashcards/decks/${deckId}/study`, {
        credentials: 'include',
      })

      const data = await response.json()
      if (data.success) {
        setFlashcards(data.data)
      }
    } catch (error) {
      console.error('Error loading study session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentCard = flashcards[currentIndex]
  const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleDifficulty = async (difficulty: Difficulty) => {
    if (!currentCard || isSubmitting) return

    setIsSubmitting(true)

    try {
      // Submit review
      await fetch(`/api/flashcards/cards/${currentCard.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          difficulty,
        }),
      })

      // Update results
      setResults((prev) => ({
        ...prev,
        [difficulty]: prev[difficulty] + 1,
      }))

      // Move to next card or complete session
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex((prev) => prev + 1)
        setIsFlipped(false)
        setShowHint(false)
      } else {
        // Session complete
        if (onComplete) {
          onComplete({
            totalCards: flashcards.length,
            againCount: results.AGAIN + (difficulty === 'AGAIN' ? 1 : 0),
            hardCount: results.HARD + (difficulty === 'HARD' ? 1 : 0),
            goodCount: results.GOOD + (difficulty === 'GOOD' ? 1 : 0),
            easyCount: results.EASY + (difficulty === 'EASY' ? 1 : 0),
          })
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (flashcards.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-bold mb-2">No cards due for review!</h3>
        <p className="text-muted-foreground mb-4">
          Come back later when cards are scheduled for review.
        </p>
        <Button onClick={loadStudySession}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </Card>
    )
  }

  // Session complete
  if (currentIndex >= flashcards.length) {
    const totalReviews = results.AGAIN + results.HARD + results.GOOD + results.EASY
    const successRate = totalReviews > 0
      ? Math.round(((results.GOOD + results.EASY) / totalReviews) * 100)
      : 0

    return (
      <Card className="p-8">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2">Study Session Complete!</h2>
            <p className="text-muted-foreground">
              You've reviewed {totalReviews} cards
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{results.AGAIN}</div>
              <div className="text-sm text-red-600">Again</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">{results.HARD}</div>
              <div className="text-sm text-orange-600">Hard</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{results.GOOD}</div>
              <div className="text-sm text-blue-600">Good</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{results.EASY}</div>
              <div className="text-sm text-green-600">Easy</div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900 mb-1">{successRate}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>

          <Button className="w-full" onClick={() => window.location.reload()}>
            Study More Cards
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{deckTitle}</span>
          <span className="text-muted-foreground">
            {currentIndex + 1} / {flashcards.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <Card
        className="relative min-h-[400px] cursor-pointer transition-all duration-300 hover:shadow-lg"
        onClick={handleFlip}
      >
        <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
          {!isFlipped ? (
            // Front of card
            <div className="text-center space-y-6 w-full">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Question
              </div>

              <div className="text-2xl md:text-3xl font-bold text-center">
                {currentCard.front}
              </div>

              {currentCard.image && (
                <div className="mt-6">
                  <img
                    src={currentCard.image}
                    alt="Flashcard image"
                    className="max-w-full max-h-48 mx-auto rounded-lg"
                  />
                </div>
              )}

              {currentCard.hint && (
                <div className="mt-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowHint(!showHint)
                    }}
                  >
                    {showHint ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Hide Hint
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Show Hint
                      </>
                    )}
                  </Button>

                  {showHint && (
                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                      {currentCard.hint}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 text-sm text-muted-foreground">
                Click anywhere to reveal answer
              </div>
            </div>
          ) : (
            // Back of card
            <div className="text-center space-y-6 w-full">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Answer
              </div>

              <div className="text-2xl md:text-3xl font-bold text-center text-blue-600">
                {currentCard.back}
              </div>

              <div className="mt-8 pt-8 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  How well did you remember this?
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    className="border-red-200 hover:bg-red-50 hover:border-red-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDifficulty('AGAIN')
                    }}
                    disabled={isSubmitting}
                  >
                    <div className="text-center">
                      <div className="font-bold text-red-600">Again</div>
                      <div className="text-xs text-red-500">&lt;1 day</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDifficulty('HARD')
                    }}
                    disabled={isSubmitting}
                  >
                    <div className="text-center">
                      <div className="font-bold text-orange-600">Hard</div>
                      <div className="text-xs text-orange-500">3 days</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDifficulty('GOOD')
                    }}
                    disabled={isSubmitting}
                  >
                    <div className="text-center">
                      <div className="font-bold text-blue-600">Good</div>
                      <div className="text-xs text-blue-500">6 days</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="border-green-200 hover:bg-green-50 hover:border-green-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDifficulty('EASY')
                    }}
                    disabled={isSubmitting}
                  >
                    <div className="text-center">
                      <div className="font-bold text-green-600">Easy</div>
                      <div className="text-xs text-green-500">10+ days</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Flip indicator */}
        <div className="absolute bottom-4 right-4 text-sm text-muted-foreground flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Click to flip
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <span>Again: {results.AGAIN}</span>
        <span>Hard: {results.HARD}</span>
        <span>Good: {results.GOOD}</span>
        <span>Easy: {results.EASY}</span>
      </div>
    </div>
  )
}
