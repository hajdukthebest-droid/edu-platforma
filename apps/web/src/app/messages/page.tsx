'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/api'
import {
  MessageSquare,
  Send,
  Search,
  User,
  Loader2,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function MessagesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch conversations
  const { data: conversationsData, isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/messages/conversations')
      return response.data.data
    },
    enabled: !!user,
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: async () => {
      const response = await api.get(
        `/messages/conversations/${selectedConversation.id}/messages`
      )
      return response.data.data
    },
    enabled: !!selectedConversation,
    refetchInterval: 3000, // Refresh every 3 seconds
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await api.post(
        `/messages/conversations/${selectedConversation.id}/messages`,
        { content }
      )
    },
    onSuccess: () => {
      setMessageText('')
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation?.id] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      await api.post(`/messages/conversations/${conversationId}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageText.trim() && selectedConversation) {
      sendMessageMutation.mutate(messageText)
    }
  }

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation)
    if (conversation.unreadCount > 0) {
      markAsReadMutation.mutate(conversation.id)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Potrebna prijava</h2>
            <p className="text-gray-600 mb-6">
              Morate biti prijavljeni da biste pristupili porukama.
            </p>
            <Button asChild>
              <Link href="/login">Prijava</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const conversations = conversationsData || []
  const messages = messagesData?.messages || []

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv: any) => {
    if (!searchQuery) return true
    const otherUser = conv.otherParticipant
    const fullName = `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Poruke</h1>
          <p className="text-blue-100">Vaše privatne konverzacije</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Conversations List */}
          <div className="md:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Konverzacije</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Pretraži..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {loadingConversations ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>Nema konverzacija</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredConversations.map((conversation: any) => {
                      const otherUser = conversation.otherParticipant
                      const isSelected = selectedConversation?.id === conversation.id

                      return (
                        <button
                          key={conversation.id}
                          onClick={() => handleSelectConversation(conversation)}
                          className={`w-full p-3 rounded-lg text-left transition-colors ${
                            isSelected
                              ? 'bg-blue-50 border-2 border-blue-500'
                              : 'bg-white hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {otherUser.avatar ? (
                              <img
                                src={otherUser.avatar}
                                alt={otherUser.firstName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold truncate">
                                  {otherUser.firstName} {otherUser.lastName}
                                </span>
                                {conversation.unreadCount > 0 && (
                                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                                    {conversation.unreadCount}
                                  </span>
                                )}
                              </div>
                              {conversation.lastMessage && (
                                <p className="text-sm text-gray-600 truncate">
                                  {conversation.lastMessage.content}
                                </p>
                              )}
                              {conversation.lastMessageAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(conversation.lastMessageAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Messages Panel */}
          <div className="md:col-span-2">
            <Card className="h-full flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b">
                    <div className="flex items-center gap-3">
                      {selectedConversation.otherParticipant.avatar ? (
                        <img
                          src={selectedConversation.otherParticipant.avatar}
                          alt={selectedConversation.otherParticipant.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">
                          {selectedConversation.otherParticipant.firstName}{' '}
                          {selectedConversation.otherParticipant.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          @{selectedConversation.otherParticipant.username}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 overflow-y-auto p-4">
                    {loadingMessages ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>Nema poruka</p>
                        <p className="text-sm mt-2">Pošaljite prvu poruku!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message: any) => {
                          const isOwn = message.senderId === user.id

                          return (
                            <div
                              key={message.id}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                  isOwn
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                              >
                                <p className="whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>
                                <p
                                  className={`text-xs mt-1 ${
                                    isOwn ? 'text-blue-100' : 'text-gray-500'
                                  }`}
                                >
                                  {new Date(message.createdAt).toLocaleTimeString('hr-HR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Textarea
                        placeholder="Napišite poruku..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage(e)
                          }
                        }}
                        className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                      />
                      <Button
                        type="submit"
                        disabled={!messageText.trim() || sendMessageMutation.isPending}
                        className="self-end"
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-semibold mb-2">
                      Odaberite konverzaciju
                    </p>
                    <p className="text-sm">
                      Kliknite na konverzaciju s lijeve strane
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
