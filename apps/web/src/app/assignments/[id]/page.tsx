'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'
import {
  FileText,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Upload,
  Star,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function AssignmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [selfAssessment, setSelfAssessment] = useState('')

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignment', params.id],
    queryFn: async () => {
      const response = await api.get(`/peer-reviews/assignments/${params.id}`)
      return response.data.data
    },
  })

  const submitMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/peer-reviews/assignments/${params.id}/submit`, {
        content,
        selfAssessment,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', params.id] })
      alert('Rad je uspješno predan!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Greška prilikom predaje')
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Zadatak nije pronađen
      </div>
    )
  }

  const isPastDue = assignment.dueDate && new Date(assignment.dueDate) < new Date()
  const userSubmission = assignment.userSubmission

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
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-white/20">
                {assignment.type === 'ESSAY' && 'Esej'}
                {assignment.type === 'PROJECT' && 'Projekt'}
                {assignment.type === 'CODE' && 'Kod'}
                {assignment.type === 'PRESENTATION' && 'Prezentacija'}
                {assignment.type === 'RESEARCH' && 'Istraživanje'}
                {assignment.type === 'CASE_STUDY' && 'Studija slučaja'}
              </Badge>
              {assignment.peerReviewEnabled && (
                <Badge variant="secondary" className="bg-white/20">
                  <Users className="h-3 w-3 mr-1" />
                  Peer review
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-4">{assignment.title}</h1>
            <p className="text-xl text-orange-100">{assignment.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instructions */}
            {assignment.instructions && (
              <Card>
                <CardHeader>
                  <CardTitle>Upute</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {assignment.instructions}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Criteria */}
            {assignment.criteria && assignment.criteria.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Kriteriji ocjenjivanja</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignment.criteria.map((criterion: any, index: number) => (
                      <div key={criterion.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{criterion.name}</h4>
                            <span className="text-sm text-gray-500">
                              max {criterion.maxScore} bodova
                            </span>
                          </div>
                          {criterion.description && (
                            <p className="text-sm text-gray-600 mt-1">{criterion.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submission Form or Status */}
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {userSubmission ? 'Vaša predaja' : 'Predajte svoj rad'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userSubmission ? (
                    <div className="space-y-4">
                      {/* Submission Status */}
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                        <Badge>
                          {userSubmission.status === 'DRAFT' && 'Nacrt'}
                          {userSubmission.status === 'SUBMITTED' && 'Predano'}
                          {userSubmission.status === 'IN_REVIEW' && 'U recenziji'}
                          {userSubmission.status === 'REVIEWED' && 'Recenzirano'}
                          {userSubmission.status === 'APPROVED' && 'Odobreno'}
                        </Badge>
                        {userSubmission.submittedAt && (
                          <span className="text-sm text-gray-600">
                            Predano: {new Date(userSubmission.submittedAt).toLocaleString('hr-HR')}
                          </span>
                        )}
                      </div>

                      {/* Submitted Content Preview */}
                      {userSubmission.content && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-2">Vaš tekst:</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {userSubmission.content.slice(0, 500)}
                            {userSubmission.content.length > 500 && '...'}
                          </p>
                        </div>
                      )}

                      {/* Scores */}
                      {(userSubmission.peerScore || userSubmission.finalScore) && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          {userSubmission.peerScore && (
                            <div>
                              <p className="text-sm text-gray-600">Peer ocjena</p>
                              <p className="text-2xl font-bold text-orange-600">
                                {userSubmission.peerScore.toFixed(1)}%
                              </p>
                            </div>
                          )}
                          {userSubmission.finalScore && (
                            <div>
                              <p className="text-sm text-gray-600">Konačna ocjena</p>
                              <p className="text-2xl font-bold text-green-600">
                                {userSubmission.finalScore.toFixed(1)}/{assignment.maxPoints}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Received Reviews */}
                      {userSubmission.receivedReviews && userSubmission.receivedReviews.length > 0 && (
                        <div className="pt-4 border-t">
                          <h4 className="font-medium mb-3">Primljene recenzije ({userSubmission.receivedReviews.length})</h4>
                          <div className="space-y-3">
                            {userSubmission.receivedReviews.map((review: any, index: number) => (
                              <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium">Recenzija {index + 1}</span>
                                  <span className="text-sm font-medium text-orange-600">
                                    {review.totalScore?.toFixed(1)}%
                                  </span>
                                </div>
                                {review.overallFeedback && (
                                  <p className="text-sm text-gray-600">{review.overallFeedback}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        submitMutation.mutate()
                      }}
                      className="space-y-4"
                    >
                      {isPastDue ? (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          <span>Rok za predaju je istekao</span>
                        </div>
                      ) : (
                        <>
                          <div>
                            <Label htmlFor="content">Vaš rad</Label>
                            <Textarea
                              id="content"
                              value={content}
                              onChange={(e) => setContent(e.target.value)}
                              rows={10}
                              placeholder="Unesite svoj tekst ovdje..."
                              className="mt-1"
                              required
                            />
                            {assignment.minWordCount && (
                              <p className="text-xs text-gray-500 mt-1">
                                Minimalno {assignment.minWordCount} riječi
                                {assignment.maxWordCount && `, maksimalno ${assignment.maxWordCount}`}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="selfAssessment">Samoprocjena (opcionalno)</Label>
                            <Textarea
                              id="selfAssessment"
                              value={selfAssessment}
                              onChange={(e) => setSelfAssessment(e.target.value)}
                              rows={3}
                              placeholder="Opišite proces izrade i što ste naučili..."
                              className="mt-1"
                            />
                          </div>

                          <Button
                            type="submit"
                            disabled={submitMutation.isPending || !content}
                            className="w-full"
                          >
                            {submitMutation.isPending ? 'Šaljem...' : 'Predaj rad'}
                          </Button>
                        </>
                      )}
                    </form>
                  )}
                </CardContent>
              </Card>
            )}

            {!user && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-600 mb-4">Prijavite se za predaju rada</p>
                  <Button asChild>
                    <Link href="/login">Prijava</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-4">
                <div className="text-center pb-4 border-b">
                  <p className="text-3xl font-bold text-orange-600">{assignment.maxPoints}</p>
                  <p className="text-sm text-gray-600">maksimalnih bodova</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tečaj:</span>
                    <span className="font-medium">{assignment.course.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Instruktor:</span>
                    <span className="font-medium">
                      {assignment.instructor.firstName} {assignment.instructor.lastName}
                    </span>
                  </div>
                  {assignment.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rok:</span>
                      <span className={`font-medium ${isPastDue ? 'text-red-600' : ''}`}>
                        {new Date(assignment.dueDate).toLocaleDateString('hr-HR')}
                      </span>
                    </div>
                  )}
                  {assignment.peerReviewEnabled && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Potrebne recenzije:</span>
                        <span className="font-medium">{assignment.reviewsRequired}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recenzija po studentu:</span>
                        <span className="font-medium">{assignment.reviewsPerStudent}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Predaja:</span>
                    <span className="font-medium">{assignment._count.submissions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
