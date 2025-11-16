'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket, useNewNotification } from '@/contexts/SocketContext'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { markNotificationAsRead, markAllNotificationsAsRead } = useSocket()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      const params = filter === 'unread' ? '?unreadOnly=true' : ''
      const response = await api.get(`/notifications${params}`)
      return response.data.data
    },
  })

  // Handle new notification from socket
  const handleNewNotification = useCallback((notification: any) => {
    // Play notification sound (optional)
    // new Audio('/notification-sound.mp3').play().catch(() => {})

    // Invalidate queries to refresh the list
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
    queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })

    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.message, {
        icon: '/logo.png',
        badge: '/logo.png',
      })
    }
  }, [queryClient])

  // Subscribe to new notifications
  useNewNotification(handleNewNotification)

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      markNotificationAsRead(notificationId)
      await api.post(`/notifications/${notificationId}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      markAllNotificationsAsRead()
      await api.post('/notifications/mark-all-read')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await api.delete(`/notifications/${notificationId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Potrebna prijava</h2>
            <p className="text-gray-600 mb-6">
              Morate biti prijavljeni da biste vidjeli obavijesti.
            </p>
            <Button asChild>
              <Link href="/login">Prijava</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const notifications = data?.notifications || []
  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Obavijesti</h1>
              <p className="text-gray-600 mt-1">
                {unreadCount > 0 ? `Imate ${unreadCount} novih obavijesti` : 'Sve obavijesti pročitane'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button onClick={() => markAllAsReadMutation.mutate()} variant="outline">
                <CheckCheck className="h-4 w-4 mr-2" />
                Označi sve pročitanim
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Sve obavijesti
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Nepročitane {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && notifications.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">
                {filter === 'unread' ? 'Nema novih obavijesti' : 'Nema obavijesti'}
              </p>
              <p className="text-gray-500 text-sm">
                {filter === 'unread'
                  ? 'Sve vaše obavijesti su pročitane'
                  : 'Obavijesti će se prikazati ovdje kada ih primite'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        {!isLoading && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification: Notification) => (
              <Card
                key={notification.id}
                className={`${!notification.isRead ? 'border-blue-200 bg-blue-50' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {notification.link ? (
                        <Link href={notification.link} className="block group">
                          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                            {notification.title}
                          </h3>
                          <p className="text-gray-700 mb-3">{notification.message}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{formatDate(notification.createdAt)}</span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {notification.type}
                            </span>
                          </div>
                        </Link>
                      ) : (
                        <>
                          <h3 className="font-semibold text-lg mb-2">{notification.title}</h3>
                          <p className="text-gray-700 mb-3">{notification.message}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{formatDate(notification.createdAt)}</span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {notification.type}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          title="Označi pročitanim"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Jeste li sigurni da želite izbrisati ovu obavijest?')) {
                            deleteNotificationMutation.mutate(notification.id)
                          }
                        }}
                        title="Izbriši"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: data.pagination.totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={data.pagination.page === i + 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  // Handle pagination
                }}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
