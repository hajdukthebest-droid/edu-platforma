'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import api from '@/lib/api'
import {
  ArrowLeft,
  Send,
  Users,
  MessageSquare,
  HelpCircle,
  Play,
  Square,
  Video,
  Calendar,
  Clock,
  Pin,
  CheckCircle,
  BarChart3,
  Settings,
  Copy,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Eye,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { hr } from 'date-fns/locale'

export default function ManageLiveSessionPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Fetch session
  const { data: session, isLoading } = useQuery({
    queryKey: ['live-session', params.id],
    queryFn: async () => {
      const response = await api.get(`/live-sessions/${params.id}`)
      return response.data.data
    },
    refetchInterval: 10000,
  })

  // Fetch messages
  const { data: messages } = useQuery({
    queryKey: ['live-session-messages', params.id],
    queryFn: async () => {
      const response = await api.get(`/live-sessions/${params.id}/messages`)
      return response.data.data
    },
    refetchInterval: 3000,
    enabled: !!session && session.status === 'LIVE',
  })

  // Fetch attendance
  const { data: attendance } = useQuery({
    queryKey: ['live-session-attendance', params.id],
    queryFn: async () => {
      const response = await api.get(`/live-sessions/${params.id}/attendance`)
      return response.data.data
    },
    refetchInterval: 10000,
    enabled: !!session,
  })

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ['live-session-analytics', params.id],
    queryFn: async () => {
      const response = await api.get(`/live-sessions/${params.id}/analytics`)
      return response.data.data
    },
    enabled: !!session,
  })

  // Start session mutation
  const startMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/live-sessions/${params.id}/start`)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-session', params.id] })
    },
  })

  // End session mutation
  const endMutation = useMutation({
    mutationFn: async (data: { recordingUrl?: string }) => {
      const response = await api.post(`/live-sessions/${params.id}/end`, data)
      return response.data.data
    },
    onSuccess: () => {
      setShowEndDialog(false)
      queryClient.invalidateQueries({ queryKey: ['live-session', params.id] })
    },
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; isQuestion: boolean }) => {
      await api.post(`/live-sessions/${params.id}/messages`, data)
    },
    onSuccess: () => {
      setMessage('')
      queryClient.invalidateQueries({ queryKey: ['live-session-messages', params.id] })
    },
  })

  // Pin message mutation
  const pinMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await api.post(`/live-sessions/messages/${messageId}/pin`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-session-messages', params.id] })
    },
  })

  // Mark question answered mutation
  const answerMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await api.post(`/live-sessions/messages/${messageId}/answer`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-session-messages', params.id] })
    },
  })

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      sendMessageMutation.mutate({ message, isQuestion: false })
    }
  }

  const copySessionLink = () => {
    const url = `${window.location.origin}/live/${params.id}`
    navigator.clipboard.writeText(url)
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
            <Link href="/instructor/live-sessions">Povratak</Link>
          </Button>
        </div>
      </div>
    )
  }

  const questions = messages?.filter((m: any) => m.isQuestion && !m.isAnswered) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild size="sm">
                <Link href="/instructor/live-sessions">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Povratak
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">{session.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {session.status === 'SCHEDULED' && (
                    <Badge variant="outline">Zakazano</Badge>
                  )}
                  {session.status === 'LIVE' && (
                    <Badge className="bg-red-500 text-white animate-pulse">
                      <Play className="h-3 w-3 mr-1" />
                      UŽIVO
                    </Badge>
                  )}
                  {session.status === 'ENDED' && (
                    <Badge variant="secondary">Završeno</Badge>
                  )}
                  <span className="text-sm text-gray-500">
                    {format(new Date(session.scheduledStartTime), 'PPP HH:mm', { locale: hr })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copySessionLink}>
                <Copy className="h-4 w-4 mr-2" />
                Kopiraj link
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/live/${params.id}`} target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Otvori
                </Link>
              </Button>
              {session.status === 'SCHEDULED' && (
                <Button onClick={() => startMutation.mutate()} disabled={startMutation.isPending}>
                  {startMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Započni
                </Button>
              )}
              {session.status === 'LIVE' && (
                <Button variant="destructive" onClick={() => setShowEndDialog(true)}>
                  <Square className="h-4 w-4 mr-2" />
                  Završi
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="control" className="space-y-6">
          <TabsList>
            <TabsTrigger value="control" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Kontrole
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
              {questions.length > 0 && (
                <Badge className="ml-1 bg-red-500">{questions.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Prisutnost
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analitika
            </TabsTrigger>
          </TabsList>

          {/* Control Panel */}
          <TabsContent value="control">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Session Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informacije o sessioni</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Status</span>
                      <div className="font-medium">{session.status}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Polaznika</span>
                      <div className="font-medium">{attendance?.length || 0}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Planirano trajanje</span>
                      <div className="font-medium">{session.duration} min</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Max polaznika</span>
                      <div className="font-medium">{session.maxAttendees || 'Neograničeno'}</div>
                    </div>
                  </div>

                  {session.youtubeVideoId && (
                    <div>
                      <span className="text-sm text-gray-500">YouTube Video ID</span>
                      <div className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                        {session.youtubeVideoId}
                      </div>
                    </div>
                  )}

                  {session.meetingUrl && (
                    <div>
                      <span className="text-sm text-gray-500">Meeting URL</span>
                      <div className="font-mono text-sm bg-gray-100 p-2 rounded mt-1 break-all">
                        {session.meetingUrl}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Brze statistike</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {attendance?.filter((a: any) => a.leftAt === null).length || 0}
                      </div>
                      <div className="text-sm text-blue-700">Trenutno prisutno</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {messages?.length || 0}
                      </div>
                      <div className="text-sm text-green-700">Poruka</div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-yellow-600">
                        {questions.length}
                      </div>
                      <div className="text-sm text-yellow-700">Neogovorena pitanja</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {attendance?.length || 0}
                      </div>
                      <div className="text-sm text-purple-700">Ukupno polaznika</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Unanswered Questions */}
              {questions.length > 0 && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-yellow-600" />
                      Neodgovorena pitanja ({questions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {questions.map((q: any) => (
                        <div key={q.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-sm">
                                {q.user.firstName} {q.user.lastName}
                              </div>
                              <p className="text-gray-700 mt-1">{q.message}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => answerMutation.mutate(q.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Odgovoreno
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Chat Management */}
          <TabsContent value="chat">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="h-[500px] flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle>Chat poruke</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto space-y-3">
                    {messages?.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.isQuestion
                            ? msg.isAnswered
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-yellow-50 border border-yellow-200'
                            : msg.isPinned
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">
                                {msg.user.firstName} {msg.user.lastName}
                              </span>
                              {msg.isQuestion && (
                                <Badge variant="outline" className="text-xs">
                                  Pitanje
                                </Badge>
                              )}
                              {msg.isPinned && (
                                <Badge className="text-xs bg-blue-500">Prikvačeno</Badge>
                              )}
                              {msg.isAnswered && (
                                <Badge className="text-xs bg-green-500">Odgovoreno</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">{msg.message}</p>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(msg.createdAt), {
                                addSuffix: true,
                                locale: hr,
                              })}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {!msg.isPinned && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => pinMutation.mutate(msg.id)}
                              >
                                <Pin className="h-3 w-3" />
                              </Button>
                            )}
                            {msg.isQuestion && !msg.isAnswered && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => answerMutation.mutate(msg.id)}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </CardContent>
                  {session.status === 'LIVE' && (
                    <CardFooter className="border-t pt-4">
                      <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
                        <Input
                          placeholder="Pošalji poruku kao instruktor..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button type="submit" disabled={!message.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </CardFooter>
                  )}
                </Card>
              </div>

              {/* Pinned Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pin className="h-4 w-4" />
                    Prikvačene poruke
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {messages?.filter((m: any) => m.isPinned).length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nema prikvačenih poruka
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {messages
                        ?.filter((m: any) => m.isPinned)
                        .map((msg: any) => (
                          <div key={msg.id} className="p-2 bg-blue-50 rounded text-sm">
                            <span className="font-medium">{msg.user.firstName}:</span>{' '}
                            {msg.message}
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Lista prisutnosti</CardTitle>
                <CardDescription>
                  {attendance?.length || 0} polaznika se pridružilo sessioni
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!attendance || attendance.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Još nema prijavljenih polaznika
                  </p>
                ) : (
                  <div className="space-y-2">
                    {attendance.map((a: any) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">
                              {a.user.firstName[0]}
                              {a.user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {a.user.firstName} {a.user.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{a.user.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            {a.leftAt ? (
                              <Badge variant="outline">Napustio</Badge>
                            ) : (
                              <Badge className="bg-green-500">Online</Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {a.watchTime ? `${Math.round(a.watchTime / 60)} min` : 'Upravo se pridružio'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Statistike sessione</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics ? (
                    <>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Ukupno polaznika</span>
                        <span className="font-bold">{analytics.totalAttendees}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Prosječno vrijeme gledanja</span>
                        <span className="font-bold">
                          {Math.round(analytics.avgWatchTime / 60)} min
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Ukupno poruka</span>
                        <span className="font-bold">{analytics.totalMessages}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Ukupno pitanja</span>
                        <span className="font-bold">{analytics.totalQuestions}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Odgovorena pitanja</span>
                        <span className="font-bold">{analytics.answeredQuestions}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Analitika će biti dostupna nakon sessione
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Angažman</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Stopa zadržavanja</span>
                        <span>{analytics?.retentionRate || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${analytics?.retentionRate || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Stopa odgovora na pitanja</span>
                        <span>
                          {analytics?.totalQuestions
                            ? Math.round(
                                (analytics.answeredQuestions / analytics.totalQuestions) * 100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${
                              analytics?.totalQuestions
                                ? (analytics.answeredQuestions / analytics.totalQuestions) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* End Session Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Završi session</DialogTitle>
            <DialogDescription>
              Jeste li sigurni da želite završiti ovaj live session?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              URL snimke (opcionalno)
            </label>
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={recordingUrl}
              onChange={(e) => setRecordingUrl(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Dodajte link do snimke kako bi polaznici mogli pogledati naknadno
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              Odustani
            </Button>
            <Button
              variant="destructive"
              onClick={() => endMutation.mutate({ recordingUrl: recordingUrl || undefined })}
              disabled={endMutation.isPending}
            >
              {endMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Square className="h-4 w-4 mr-2" />
              )}
              Završi session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
