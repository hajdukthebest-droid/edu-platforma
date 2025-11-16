'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import api from '@/lib/api'
import {
  ArrowLeft,
  Send,
  Users,
  MessageSquare,
  HelpCircle,
  Play,
  Video,
  Calendar,
  Clock,
} from 'lucide-react'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'
import { useAuth } from '@/contexts/AuthContext'

export default function LiveSessionPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const [isQuestion, setIsQuestion] = useState(false)
  const [showQuestionsOnly, setShowQuestionsOnly] = useState(false)
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const { data: session, isLoading } = useQuery({
    queryKey: ['live-session', params.id],
    queryFn: async () => {
      const response = await api.get(`/live-sessions/${params.id}`)
      return response.data.data
    },
    refetchInterval: 30000, // Poll every 30s for status updates
  })

  const { data: messages } = useQuery({
    queryKey: ['live-session-messages', params.id, showQuestionsOnly],
    queryFn: async () => {
      const queryParams = showQuestionsOnly ? '?questionsOnly=true' : ''
      const response = await api.get(`/live-sessions/${params.id}/messages${queryParams}`)
      return response.data.data
    },
    refetchInterval: 5000, // Poll every 5s for new messages
    enabled: !!session && session.status === 'LIVE',
  })

  const joinMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/live-sessions/${params.id}/join`)
    },
    onSuccess: () => {
      setWatchStartTime(Date.now())
      queryClient.invalidateQueries({ queryKey: ['live-session', params.id] })
    },
  })

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const watchTime = watchStartTime ? Math.floor((Date.now() - watchStartTime) / 1000) : 0
      await api.post(`/live-sessions/${params.id}/leave`, { watchTime })
    },
  })

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; isQuestion: boolean }) => {
      await api.post(`/live-sessions/${params.id}/messages`, data)
    },
    onSuccess: () => {
      setMessage('')
      setIsQuestion(false)
      queryClient.invalidateQueries({ queryKey: ['live-session-messages', params.id] })
    },
  })

  useEffect(() => {
    if (session?.status === 'LIVE' && user && !session.isAttending) {
      joinMutation.mutate()
    }

    return () => {
      if (watchStartTime) {
        leaveMutation.mutate()
      }
    }
  }, [session?.status])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      sendMessageMutation.mutate({ message, isQuestion })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Session nije pronađen</h2>
          <Button asChild>
            <Link href="/live-sessions">Povratak</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild size="sm">
            <Link href="/live-sessions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Povratak
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <Card>
              <CardContent className="p-0">
                {session.status === 'LIVE' && session.youtubeVideoId ? (
                  <div className="aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${session.youtubeVideoId}?autoplay=1`}
                      title={session.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-t-lg"
                    ></iframe>
                  </div>
                ) : session.status === 'ENDED' && session.recordingUrl ? (
                  <div className="aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src={session.recordingUrl}
                      title={session.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-t-lg"
                    ></iframe>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-900 flex items-center justify-center rounded-t-lg">
                    <div className="text-center text-white">
                      <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold">
                        {session.status === 'SCHEDULED'
                          ? 'Session još nije započeo'
                          : 'Session je završio'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold mb-2">{session.title}</h1>
                      <p className="text-gray-600">{session.description}</p>
                    </div>
                    {session.status === 'LIVE' && (
                      <Badge className="bg-red-500 text-white animate-pulse">
                        <Play className="h-3 w-3 mr-1" />
                        UŽIVO
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(session.scheduledStartTime), 'PPP', { locale: hr })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(session.scheduledStartTime), 'HH:mm')} -{' '}
                        {format(new Date(session.scheduledEndTime), 'HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{session._count?.attendance || 0} polaznika</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {showQuestionsOnly ? 'Q&A' : 'Chat'}
                  </CardTitle>
                  {session.allowQuestions && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQuestionsOnly(!showQuestionsOnly)}
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
                  {messages?.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.isQuestion
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      {msg.isPinned && (
                        <Badge variant="outline" className="mb-2 text-xs">
                          Prikvačeno
                        </Badge>
                      )}
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">
                            {msg.user.firstName[0]}
                            {msg.user.lastName[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              {msg.user.firstName} {msg.user.lastName}
                            </span>
                            {msg.isQuestion && (
                              <Badge variant="outline" className="text-xs">
                                Pitanje
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 break-words">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Message Input */}
                {user && session.status === 'LIVE' && session.chatEnabled && (
                  <form onSubmit={handleSendMessage} className="p-4 border-t">
                    <Textarea
                      placeholder="Napiši poruku..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mb-2"
                      rows={2}
                    />
                    {session.allowQuestions && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="isQuestion"
                          checked={isQuestion}
                          onCheckedChange={(checked) => setIsQuestion(checked as boolean)}
                        />
                        <label htmlFor="isQuestion" className="text-sm cursor-pointer">
                          Ovo je pitanje (Q&A)
                        </label>
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!message.trim() || sendMessageMutation.isPending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Pošalji
                    </Button>
                  </form>
                )}

                {!user && (
                  <div className="p-4 border-t text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Prijavite se za chat
                    </p>
                    <Button asChild size="sm">
                      <Link href="/login">Prijava</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
