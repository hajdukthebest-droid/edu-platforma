'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import api from '@/lib/api'
import {
  FileText,
  ArrowLeft,
  Send,
  Star,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface PendingReview {
  id: string
  submission: {
    id: string
    content: string
    fileUrl: string | null
    assignment: {
      id: string
      title: string
      reviewDueDate: string | null
      anonymousReviews: boolean
      criteria: Array<{
        id: string
        name: string
        description: string | null
        maxScore: number
      }>
      course: {
        title: string
      }
    }
  }
}

export default function MyReviewsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [overallFeedback, setOverallFeedback] = useState('')
  const [strengthsNote, setStrengthsNote] = useState('')
  const [improvementsNote, setImprovementsNote] = useState('')

  const { data: pendingReviews, isLoading } = useQuery({
    queryKey: ['pending-reviews'],
    queryFn: async () => {
      const response = await api.get('/peer-reviews/my-pending-reviews')
      return response.data.data as PendingReview[]
    },
    enabled: !!user,
  })

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const review = pendingReviews?.find(r => r.id === reviewId)
      if (!review) return

      const criteriaScores = review.submission.assignment.criteria.map(c => ({
        criteriaId: c.id,
        score: scores[c.id] || 0,
        feedback: feedback[c.id] || '',
      }))

      await api.post(`/peer-reviews/reviews/${reviewId}/submit`, {
        overallFeedback,
        strengthsNote,
        improvementsNote,
        criteriaScores,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] })
      setActiveReviewId(null)
      setScores({})
      setFeedback({})
      setOverallFeedback('')
      setStrengthsNote('')
      setImprovementsNote('')
      alert('Recenzija uspješno predana!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Greška prilikom predaje recenzije')
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const activeReview = pendingReviews?.find(r => r.id === activeReviewId)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-12">
        <div className="container mx-auto px-4">
          <Link
            href="/assignments"
            className="inline-flex items-center gap-2 text-orange-100 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Natrag na zadatke
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Moje recenzije</h1>
            <p className="text-xl text-orange-100">
              Pregledajte i ocijenite radove vaših kolega
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {!pendingReviews || pendingReviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Sve recenzije su završene!</h3>
              <p className="text-gray-600">Trenutno nemate recenzija na čekanju</p>
            </CardContent>
          </Card>
        ) : activeReview ? (
          // Review Form
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{activeReview.submission.assignment.title}</CardTitle>
                    <CardDescription>
                      {activeReview.submission.assignment.course.title}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setActiveReviewId(null)}>
                    Odustani
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Submission Content */}
            <Card>
              <CardHeader>
                <CardTitle>Rad za recenziju</CardTitle>
                {activeReview.submission.assignment.anonymousReviews && (
                  <CardDescription>Anonimna recenzija</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                  <p className="whitespace-pre-wrap">{activeReview.submission.content}</p>
                </div>
              </CardContent>
            </Card>

            {/* Criteria Scoring */}
            <Card>
              <CardHeader>
                <CardTitle>Ocjenjivanje po kriterijima</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {activeReview.submission.assignment.criteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{criterion.name}</h4>
                        {criterion.description && (
                          <p className="text-sm text-gray-600">{criterion.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-orange-600">
                          {scores[criterion.id] || 0}
                        </span>
                        <span className="text-sm text-gray-500">/{criterion.maxScore}</span>
                      </div>
                    </div>
                    <Slider
                      value={[scores[criterion.id] || 0]}
                      onValueChange={(value) =>
                        setScores((prev) => ({ ...prev, [criterion.id]: value[0] }))
                      }
                      max={criterion.maxScore}
                      step={1}
                    />
                    <Textarea
                      value={feedback[criterion.id] || ''}
                      onChange={(e) =>
                        setFeedback((prev) => ({ ...prev, [criterion.id]: e.target.value }))
                      }
                      placeholder="Komentar za ovaj kriterij (opcionalno)"
                      rows={2}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Overall Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Opća povratna informacija</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="strengths">Snage rada</Label>
                  <Textarea
                    id="strengths"
                    value={strengthsNote}
                    onChange={(e) => setStrengthsNote(e.target.value)}
                    placeholder="Što je dobro u ovom radu?"
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="improvements">Prijedlozi za poboljšanje</Label>
                  <Textarea
                    id="improvements"
                    value={improvementsNote}
                    onChange={(e) => setImprovementsNote(e.target.value)}
                    placeholder="Što bi se moglo poboljšati?"
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="overall">Opći komentar</Label>
                  <Textarea
                    id="overall"
                    value={overallFeedback}
                    onChange={(e) => setOverallFeedback(e.target.value)}
                    placeholder="Vaš ukupni dojam o radu..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => submitReviewMutation.mutate(activeReview.id)}
                disabled={submitReviewMutation.isPending}
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitReviewMutation.isPending ? 'Šaljem...' : 'Predaj recenziju'}
              </Button>
            </div>
          </div>
        ) : (
          // Review List
          <div className="space-y-4">
            {pendingReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="mb-1">
                        {review.submission.assignment.title}
                      </CardTitle>
                      <CardDescription>
                        {review.submission.assignment.course.title}
                      </CardDescription>
                    </div>
                    {review.submission.assignment.reviewDueDate && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {new Date(review.submission.assignment.reviewDueDate).toLocaleDateString('hr-HR')}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{review.submission.assignment.criteria.length} kriterija</span>
                      {review.submission.assignment.anonymousReviews && (
                        <Badge variant="outline">Anonimno</Badge>
                      )}
                    </div>
                    <Button onClick={() => setActiveReviewId(review.id)}>
                      Započni recenziju
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
