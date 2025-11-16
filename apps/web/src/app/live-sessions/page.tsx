'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import {
  Calendar,
  Clock,
  Users,
  Video,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'
import { useAuth } from '@/contexts/AuthContext'

export default function LiveSessionsPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['live-sessions', filter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filter === 'upcoming') params.append('upcoming', 'true')
      if (filter === 'live') params.append('status', 'LIVE')

      const response = await api.get(`/live-sessions?${params.toString()}`)
      return response.data.data
    },
  })

  const isInstructor = user && (user.role === 'INSTRUCTOR' || user.role === 'ADMIN')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Zakazano
          </Badge>
        )
      case 'LIVE':
        return (
          <Badge className="bg-red-500 text-white animate-pulse">
            <Play className="h-3 w-3 mr-1" />
            UŽIVO
          </Badge>
        )
      case 'ENDED':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Završeno
          </Badge>
        )
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Otkazano
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Video className="h-8 w-8 text-blue-600" />
                Live Predavanja
              </h1>
              <p className="text-gray-600 mt-1">
                Pridruži se live sessionima ili pogledaj snimke
              </p>
            </div>
            {isInstructor && (
              <Button asChild>
                <Link href="/instructor/live-sessions/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Zakaži Live Session
                </Link>
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-6">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              Svi
            </Button>
            <Button
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setFilter('upcoming')}
              size="sm"
            >
              Nadolazeći
            </Button>
            <Button
              variant={filter === 'live' ? 'default' : 'outline'}
              onClick={() => setFilter('live')}
              size="sm"
            >
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Uživo
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        ) : !data?.sessions || data.sessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nema live sessiona za odabrani filter</p>
              {isInstructor && (
                <Button asChild className="mt-4">
                  <Link href="/instructor/live-sessions/create">Zakaži prvi session</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.sessions.map((session: any) => (
              <Card
                key={session.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    {getStatusBadge(session.status)}
                    {session.isRecorded && session.status === 'ENDED' && session.recordingUrl && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Dostupna snimka
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{session.title}</CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">{session.description}</p>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Instructor */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {session.instructor.firstName[0]}
                        {session.instructor.lastName[0]}
                      </span>
                    </div>
                    <span className="text-gray-700">
                      {session.instructor.firstName} {session.instructor.lastName}
                    </span>
                  </div>

                  {/* Scheduled time */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(session.scheduledStartTime), 'PPP', { locale: hr })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(session.scheduledStartTime), 'HH:mm')} -{' '}
                      {format(new Date(session.scheduledEndTime), 'HH:mm')}
                    </span>
                  </div>

                  {/* Stats */}
                  {session._count && (
                    <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{session._count.attendance}</span>
                      </div>
                      {session.chatEnabled && (
                        <div className="flex items-center gap-1">
                          <Video className="h-4 w-4" />
                          <span>{session._count.messages} poruka</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2">
                    {session.status === 'LIVE' && (
                      <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                        <Link href={`/live/${session.id}`}>
                          <Play className="h-4 w-4 mr-2" />
                          Pridruži se uživo
                        </Link>
                      </Button>
                    )}

                    {session.status === 'SCHEDULED' && (
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/live/${session.id}`}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Detalji
                        </Link>
                      </Button>
                    )}

                    {session.status === 'ENDED' && session.recordingUrl && (
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/live/${session.id}`}>
                          <Video className="h-4 w-4 mr-2" />
                          Pogledaj snimku
                        </Link>
                      </Button>
                    )}
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
