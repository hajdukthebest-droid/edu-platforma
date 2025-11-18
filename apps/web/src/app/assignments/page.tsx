'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import {
  FileText,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Calendar
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Assignment {
  id: string
  title: string
  description: string
  type: string
  status: string
  dueDate: string | null
  maxPoints: number
  peerReviewEnabled: boolean
  reviewsRequired: number
  course: {
    id: string
    title: string
    slug: string
  }
  instructor: {
    firstName: string
    lastName: string
  }
  _count: {
    submissions: number
    criteria: number
  }
}

export default function AssignmentsPage() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const response = await api.get('/peer-reviews/assignments')
      return response.data.data
    },
  })

  const { data: mySubmissions } = useQuery({
    queryKey: ['my-submissions'],
    queryFn: async () => {
      if (!user) return []
      const response = await api.get('/peer-reviews/my-submissions')
      return response.data.data
    },
    enabled: !!user,
  })

  const { data: pendingReviews } = useQuery({
    queryKey: ['pending-reviews'],
    queryFn: async () => {
      if (!user) return []
      const response = await api.get('/peer-reviews/my-pending-reviews')
      return response.data.data
    },
    enabled: !!user,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const assignments = data?.assignments || []
  const submittedIds = new Set(mySubmissions?.map((s: any) => s.assignment.id) || [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Zadaci i peer recenzije</h1>
            <p className="text-xl text-orange-100">
              Predajte svoje radove i recenzirajte radove kolega za bolje razumijevanje gradiva
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {user && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mySubmissions?.length || 0}</p>
                    <p className="text-sm text-gray-600">Predani radovi</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pendingReviews?.length || 0}</p>
                    <p className="text-sm text-gray-600">Recenzije na čekanju</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {mySubmissions?.filter((s: any) => s.status === 'APPROVED').length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Ocijenjeno</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pending Reviews Alert */}
        {pendingReviews && pendingReviews.length > 0 && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">
                    Imate {pendingReviews.length} recenzija na čekanju
                  </span>
                </div>
                <Link href="/assignments/my-reviews">
                  <Button variant="outline" size="sm">
                    Pregledaj recenzije
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assignments List */}
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Trenutno nema dostupnih zadataka</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment: Assignment) => {
              const isSubmitted = submittedIds.has(assignment.id)
              const isPastDue = assignment.dueDate && new Date(assignment.dueDate) < new Date()

              return (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {assignment.type === 'ESSAY' && 'Esej'}
                            {assignment.type === 'PROJECT' && 'Projekt'}
                            {assignment.type === 'CODE' && 'Kod'}
                            {assignment.type === 'PRESENTATION' && 'Prezentacija'}
                            {assignment.type === 'RESEARCH' && 'Istraživanje'}
                            {assignment.type === 'CASE_STUDY' && 'Studija slučaja'}
                          </Badge>
                          {assignment.peerReviewEnabled && (
                            <Badge variant="secondary">
                              <Users className="h-3 w-3 mr-1" />
                              Peer review
                            </Badge>
                          )}
                          {isSubmitted && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Predano
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="mb-2">{assignment.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {assignment.description}
                        </CardDescription>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-orange-600">
                          {assignment.maxPoints}
                        </p>
                        <p className="text-xs text-gray-500">bodova</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {assignment.course.title}
                        </span>
                        {assignment.dueDate && (
                          <span className={`flex items-center gap-1 ${isPastDue ? 'text-red-600' : ''}`}>
                            <Calendar className="h-4 w-4" />
                            {new Date(assignment.dueDate).toLocaleDateString('hr-HR')}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {assignment._count.submissions} predaja
                        </span>
                      </div>
                      <Link href={`/assignments/${assignment.id}`}>
                        <Button>
                          {isSubmitted ? 'Pregledaj' : 'Otvori zadatak'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
