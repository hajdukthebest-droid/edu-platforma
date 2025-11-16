'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/api'
import { Star, Pencil, Trash2, Check, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

interface CourseReviewsProps {
  courseId: string
}

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: {
    firstName: string
    lastName: string
    avatar: string | null
  }
}

export function CourseReviews({ courseId }: CourseReviewsProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isWritingReview, setIsWritingReview] = useState(false)
  const [editingReview, setEditingReview] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [hoveredStar, setHoveredStar] = useState(0)

  // Fetch rating stats
  const { data: stats } = useQuery({
    queryKey: ['course-rating-stats', courseId],
    queryFn: async () => {
      const response = await api.get(`/courses/${courseId}/rating-stats`)
      return response.data.data
    },
  })

  // Fetch reviews
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['course-reviews', courseId],
    queryFn: async () => {
      const response = await api.get(`/courses/${courseId}/reviews`)
      return response.data.data
    },
  })

  // Fetch user's review
  const { data: userReview } = useQuery({
    queryKey: ['my-review', courseId],
    queryFn: async () => {
      if (!user) return null
      try {
        const response = await api.get(`/courses/${courseId}/my-review`)
        return response.data.data
      } catch (error) {
        return null
      }
    },
    enabled: !!user,
  })

  const createReviewMutation = useMutation({
    mutationFn: async (data: { rating: number; comment?: string }) => {
      await api.post(`/courses/${courseId}/reviews`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-reviews', courseId] })
      queryClient.invalidateQueries({ queryKey: ['my-review', courseId] })
      queryClient.invalidateQueries({ queryKey: ['course-rating-stats', courseId] })
      setIsWritingReview(false)
      setRating(5)
      setComment('')
    },
  })

  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, data }: { reviewId: string; data: { rating: number; comment?: string } }) => {
      await api.put(`/reviews/${reviewId}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-reviews', courseId] })
      queryClient.invalidateQueries({ queryKey: ['my-review', courseId] })
      queryClient.invalidateQueries({ queryKey: ['course-rating-stats', courseId] })
      setEditingReview(null)
      setRating(5)
      setComment('')
    },
  })

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      await api.delete(`/reviews/${reviewId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-reviews', courseId] })
      queryClient.invalidateQueries({ queryKey: ['my-review', courseId] })
      queryClient.invalidateQueries({ queryKey: ['course-rating-stats', courseId] })
    },
  })

  const handleSubmitReview = () => {
    if (editingReview) {
      updateReviewMutation.mutate({
        reviewId: editingReview,
        data: { rating, comment: comment || undefined },
      })
    } else {
      createReviewMutation.mutate({
        rating,
        comment: comment || undefined,
      })
    }
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review.id)
    setRating(review.rating)
    setComment(review.comment || '')
    setIsWritingReview(true)
  }

  const handleCancelEdit = () => {
    setEditingReview(null)
    setIsWritingReview(false)
    setRating(5)
    setComment('')
  }

  const reviews = reviewsData?.reviews || []

  const StarRating = ({ value, interactive = false, onRate }: { value: number; interactive?: boolean; onRate?: (rating: number) => void }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate && onRate(star)}
            onMouseEnter={() => interactive && setHoveredStar(star)}
            onMouseLeave={() => interactive && setHoveredStar(0)}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= (interactive ? (hoveredStar || value) : value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Stats */}
      {stats && stats.totalReviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ocjene i recenzije</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Average Rating */}
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                <StarRating value={Math.round(stats.averageRating)} />
                <p className="text-sm text-gray-600 mt-2">
                  {stats.totalReviews} {stats.totalReviews === 1 ? 'recenzija' : 'recenzija'}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.ratingDistribution[rating] || 0
                  const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm">{rating}</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Write Review */}
      {user && !userReview && !isWritingReview && (
        <Card>
          <CardContent className="py-6">
            <Button onClick={() => setIsWritingReview(true)} className="w-full">
              Napišite recenziju
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Review Form */}
      {user && (isWritingReview || userReview) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingReview ? 'Uredi recenziju' : 'Napišite recenziju'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Vaša ocjena</label>
              <StarRating value={rating} interactive onRate={setRating} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Komentar (opcionalno)</label>
              <Textarea
                placeholder="Podijelite svoje iskustvo s tečajem..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmitReview}
                disabled={createReviewMutation.isPending || updateReviewMutation.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                {editingReview ? 'Spremi promjene' : 'Objavi recenziju'}
              </Button>
              {(isWritingReview || editingReview) && (
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Odustani
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Recenzije polaznika</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Još nema recenzija za ovaj tečaj</p>
              {user && (
                <p className="text-sm mt-2">Budite prvi koji će ostaviti recenziju!</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review: Review) => (
                <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">
                        {review.user.firstName} {review.user.lastName}
                      </div>
                      <StarRating value={review.rating} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                      {user && user.id === review.user.id && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditReview(review)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Jeste li sigurni da želite izbrisati recenziju?')) {
                                deleteReviewMutation.mutate(review.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
