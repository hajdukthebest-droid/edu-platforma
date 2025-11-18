'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  MessageSquare,
  Calendar,
  FolderOpen,
  Send,
  Plus,
  Settings,
  UserPlus,
  Copy,
  MoreVertical,
  Trash2,
  FileText,
  Link as LinkIcon,
  Video,
  Clock,
  ArrowLeft,
} from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function StudyGroupDetailPage({ params }: { params: { id: string } }) {
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState('')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false)
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false)
  const [newResource, setNewResource] = useState({ title: '', url: '', type: 'LINK' })
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60,
    meetingUrl: '',
  })

  const { data: group, isLoading } = useQuery({
    queryKey: ['study-group', params.id],
    queryFn: async () => {
      const response = await api.get(`/study-groups/${params.id}`)
      return response.data.data
    },
  })

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ['study-group-messages', params.id],
    queryFn: async () => {
      const response = await api.get(`/study-groups/${params.id}/messages`)
      return response.data.data
    },
    refetchInterval: 5000, // Poll every 5 seconds
  })

  const { data: resources } = useQuery({
    queryKey: ['study-group-resources', params.id],
    queryFn: async () => {
      const response = await api.get(`/study-groups/${params.id}/resources`)
      return response.data.data
    },
  })

  const { data: sessions } = useQuery({
    queryKey: ['study-group-sessions', params.id],
    queryFn: async () => {
      const response = await api.get(`/study-groups/${params.id}/sessions`)
      return response.data.data
    },
  })

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post(`/study-groups/${params.id}/messages`, { content })
      return response.data.data
    },
    onSuccess: () => {
      setMessage('')
      refetchMessages()
    },
  })

  const createInviteMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/study-groups/${params.id}/invites`)
      return response.data.data
    },
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.token)
      toast.success('Kod pozivnice kopiran u međuspremnik')
    },
  })

  const addResourceMutation = useMutation({
    mutationFn: async (data: typeof newResource) => {
      const response = await api.post(`/study-groups/${params.id}/resources`, data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-group-resources', params.id] })
      setResourceDialogOpen(false)
      setNewResource({ title: '', url: '', type: 'LINK' })
      toast.success('Resurs dodan')
    },
  })

  const scheduleSessionMutation = useMutation({
    mutationFn: async (data: typeof newSession) => {
      const response = await api.post(`/study-groups/${params.id}/sessions`, data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-group-sessions', params.id] })
      setSessionDialogOpen(false)
      setNewSession({ title: '', description: '', scheduledAt: '', duration: 60, meetingUrl: '' })
      toast.success('Sesija zakazana')
    },
  })

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await api.delete(`/study-groups/messages/${messageId}`)
    },
    onSuccess: () => {
      refetchMessages()
    },
  })

  const deleteResourceMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      await api.delete(`/study-groups/resources/${resourceId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-group-resources', params.id] })
    },
  })

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await api.delete(`/study-groups/sessions/${sessionId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-group-sessions', params.id] })
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    sendMessageMutation.mutate(message)
  }

  const isAdmin = group?.myRole === 'ADMIN' || group?.myRole === 'MODERATOR'

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Grupa nije pronađena</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/study-groups"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Natrag na grupe
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{group.name}</h1>
              {group.description && (
                <p className="text-gray-600 mt-2">{group.description}</p>
              )}
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Pozovi
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Pozovi u grupu</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-gray-600">
                      Generiraj kod pozivnice koji možeš podijeliti s drugima.
                    </p>
                    <Button
                      onClick={() => createInviteMutation.mutate()}
                      className="w-full"
                      disabled={createInviteMutation.isPending}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {createInviteMutation.isPending
                        ? 'Generiranje...'
                        : 'Generiraj i kopiraj kod'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              {isAdmin && (
                <Button variant="outline" asChild>
                  <Link href={`/study-groups/${params.id}/settings`}>
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Members */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Članovi ({group.members?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.members?.map((member: any) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user.avatar} />
                      <AvatarFallback>
                        {member.user.firstName?.[0]}
                        {member.user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.user.firstName} {member.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {member.role === 'ADMIN'
                          ? 'Admin'
                          : member.role === 'MODERATOR'
                          ? 'Moderator'
                          : 'Član'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Tabs */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="chat">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Resursi
                </TabsTrigger>
                <TabsTrigger value="sessions" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Sesije
                </TabsTrigger>
              </TabsList>

              {/* Chat Tab */}
              <TabsContent value="chat">
                <Card>
                  <CardContent className="p-0">
                    {/* Messages */}
                    <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                      {!messages || messages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Još nema poruka</p>
                          <p className="text-sm">Započni razgovor!</p>
                        </div>
                      ) : (
                        messages.map((msg: any) => (
                          <div key={msg.id} className="flex items-start gap-3 group">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={msg.user.avatar} />
                              <AvatarFallback>
                                {msg.user.firstName?.[0]}
                                {msg.user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {msg.user.firstName} {msg.user.lastName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(msg.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{msg.content}</p>
                            </div>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100"
                                onClick={() => deleteMessageMutation.mutate(msg.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    {/* Message Input */}
                    <form
                      onSubmit={handleSendMessage}
                      className="border-t p-4 flex gap-2"
                    >
                      <Input
                        placeholder="Napiši poruku..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        disabled={!message.trim() || sendMessageMutation.isPending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Resursi</CardTitle>
                      <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Dodaj resurs
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Dodaj resurs</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Naziv</Label>
                              <Input
                                placeholder="npr. Skripta iz farmakologije"
                                value={newResource.title}
                                onChange={(e) =>
                                  setNewResource({ ...newResource, title: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>URL</Label>
                              <Input
                                placeholder="https://..."
                                value={newResource.url}
                                onChange={(e) =>
                                  setNewResource({ ...newResource, url: e.target.value })
                                }
                              />
                            </div>
                            <Button
                              onClick={() => addResourceMutation.mutate(newResource)}
                              className="w-full"
                              disabled={addResourceMutation.isPending}
                            >
                              {addResourceMutation.isPending ? 'Dodavanje...' : 'Dodaj'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!resources || resources.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Još nema resursa</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {resources.map((resource: any) => (
                          <div
                            key={resource.id}
                            className="flex items-center gap-3 p-3 border rounded-lg group"
                          >
                            <div className="p-2 bg-gray-100 rounded">
                              {resource.type === 'DOCUMENT' ? (
                                <FileText className="h-5 w-5 text-blue-600" />
                              ) : resource.type === 'VIDEO' ? (
                                <Video className="h-5 w-5 text-red-600" />
                              ) : (
                                <LinkIcon className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium hover:text-blue-600"
                              >
                                {resource.title}
                              </a>
                              <p className="text-xs text-gray-500">
                                {resource.user.firstName} {resource.user.lastName}
                              </p>
                            </div>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100"
                                onClick={() => deleteResourceMutation.mutate(resource.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sessions Tab */}
              <TabsContent value="sessions">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Zakazane sesije</CardTitle>
                      {isAdmin && (
                        <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Zakaži sesiju
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Zakaži sesiju učenja</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Naziv sesije</Label>
                                <Input
                                  placeholder="npr. Pregled gradiva za ispit"
                                  value={newSession.title}
                                  onChange={(e) =>
                                    setNewSession({ ...newSession, title: e.target.value })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Opis</Label>
                                <Textarea
                                  placeholder="Opišite što će se raditi..."
                                  value={newSession.description}
                                  onChange={(e) =>
                                    setNewSession({
                                      ...newSession,
                                      description: e.target.value,
                                    })
                                  }
                                  rows={2}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Datum i vrijeme</Label>
                                  <Input
                                    type="datetime-local"
                                    value={newSession.scheduledAt}
                                    onChange={(e) =>
                                      setNewSession({
                                        ...newSession,
                                        scheduledAt: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Trajanje (min)</Label>
                                  <Input
                                    type="number"
                                    min={15}
                                    max={480}
                                    value={newSession.duration}
                                    onChange={(e) =>
                                      setNewSession({
                                        ...newSession,
                                        duration: parseInt(e.target.value) || 60,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Meeting URL (opcionalno)</Label>
                                <Input
                                  placeholder="https://meet.google.com/..."
                                  value={newSession.meetingUrl}
                                  onChange={(e) =>
                                    setNewSession({
                                      ...newSession,
                                      meetingUrl: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <Button
                                onClick={() => scheduleSessionMutation.mutate(newSession)}
                                className="w-full"
                                disabled={scheduleSessionMutation.isPending}
                              >
                                {scheduleSessionMutation.isPending
                                  ? 'Zakazivanje...'
                                  : 'Zakaži sesiju'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!sessions || sessions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nema zakazanih sesija</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sessions.map((session: any) => (
                          <div
                            key={session.id}
                            className="p-4 border rounded-lg group"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{session.title}</h4>
                                {session.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {session.description}
                                  </p>
                                )}
                              </div>
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100"
                                  onClick={() => deleteSessionMutation.mutate(session.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(session.scheduledAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {session.duration} min
                              </div>
                            </div>
                            {session.meetingUrl && (
                              <Button asChild size="sm" className="mt-3">
                                <a
                                  href={session.meetingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Video className="h-4 w-4 mr-2" />
                                  Pridruži se
                                </a>
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
