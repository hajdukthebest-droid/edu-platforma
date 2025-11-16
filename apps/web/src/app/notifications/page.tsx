'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { Bell, Check, CheckCheck, Trash2, X, Filter } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket, useNewNotification } from '@/contexts/SocketContext'
import { formatDistanceToNow } from 'date-fns'
import { hr } from 'date-fns/locale'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

const NOTIFICATION_TYPES = [
  { value: 'all', label: 'Svi tipovi' },
  { value: 'ACHIEVEMENT', label: '🏆 Postignuća' },
  { value: 'CERTIFICATE', label: '📜 Certifikati' },
  { value: 'COURSE_UPDATE', label: '📚 Tečajevi' },
  { value: 'NEW_CONTENT', label: '🎯 Novi sadržaj' },
  { value: 'SOCIAL', label: '💬 Društveno' },
  { value: 'BADGE', label: '🎖️ Značke' },
  { value: 'SYSTEM', label: '🔔 Sustav' },
]

const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    ACHIEVEMENT: '🏆',
    CERTIFICATE: '📜',
    COURSE_UPDATE: '📚',
    NEW_CONTENT: '🎯',
    SOCIAL: '💬',
    BADGE: '🎖️',
    SYSTEM: '🔔',
  }
  return icons[type] || '📬'
}

const getNotificationColor = (type: string) => {
  const colors: Record<string, string> = {
    ACHIEVEMENT: 'bg-purple-100 text-purple-600',
    CERTIFICATE: 'bg-blue-100 text-blue-600',
    COURSE_UPDATE: 'bg-green-100 text-green-600',
    NEW_CONTENT: 'bg-yellow-100 text-yellow-600',
    SOCIAL: 'bg-pink-100 text-pink-600',
    BADGE: 'bg-orange-100 text-orange-600',
    SYSTEM: 'bg-gray-100 text-gray-600',
  }
  return colors[type] || 'bg-gray-100 text-gray-600'
}

export default function NotificationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { markNotificationAsRead, markAllNotificationsAsRead } = useSocket()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', filter, typeFilter, page],
    queryFn: async () => {
      // Build query params
      const params = new URLSearchParams()
      if (filter === 'unread') params.append('unreadOnly', 'true')
      if (page > 1) params.append('page', page.toString())
      params.append('limit', '10')

      // If type filter is set and not 'all', use the type-specific endpoint
      if (typeFilter !== 'all') {
        const response = await api.get(`/notifications/type/${typeFilter}?${params.toString()}`)
        return response.data.data
      }

      const response = await api.get(`/notifications?${params.toString()}`)
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
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] })
    },
  })

  const markAsUnreadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await api.post(`/notifications/${notificationId}/unread`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] })
    },
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await api.delete(`/notifications/${notificationId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] })
    },
  })

  const deleteAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/notifications/read')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] })
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

  const readCount = notifications.filter((n: Notification) => n.isRead).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">🔔 Obavijesti</h1>
              <p className="text-gray-600 mt-1">
                {unreadCount > 0 ? `Imate ${unreadCount} novih obavijesti` : 'Sve obavijesti pročitane'}
              </p>
            </div>
            <div className="flex gap-2">
              {readCount > 0 && (
                <Button
                  onClick={() => {
                    if (confirm('Jeste li sigurni da želite izbrisati sve pročitane obavijesti?')) {
                      deleteAllReadMutation.mutate()
                    }
                  }}
                  variant="outline"
                  disabled={deleteAllReadMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Obriši pročitane
                </Button>
              )}
              {unreadCount > 0 && (
                <Button
                  onClick={() => markAllAsReadMutation.mutate()}
                  variant="outline"
                  disabled={markAllAsReadMutation.isPending}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Označi sve pročitanim
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Read/Unread Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFilter('all')
                setPage(1)
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Sve obavijesti
            </button>
            <button
              onClick={() => {
                setFilter('unread')
                setPage(1)
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Nepročitane {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Tip:</span>
            {NOTIFICATION_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  setTypeFilter(type.value)
                  setPage(1)
                }}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  typeFilter === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
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
                className={`transition-all hover:shadow-md ${
                  !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${getNotificationColor(
                        notification.type
                      )}`}
                    >
                      <span className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {notification.link ? (
                        <Link
                          href={notification.link}
                          className="block group"
                          onClick={() => {
                            if (!notification.isRead) {
                              markAsReadMutation.mutate(notification.id)
                            }
                          }}
                        >
                          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                            {notification.title}
                            {!notification.isRead && (
                              <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                            )}
                          </h3>
                          <p className="text-gray-700 mb-3">{notification.message}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: hr,
                              })}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getNotificationColor(notification.type)}`}>
                              {notification.type}
                            </span>
                          </div>
                        </Link>
                      ) : (
                        <>
                          <h3 className="font-semibold text-lg mb-2">
                            {notification.title}
                            {!notification.isRead && (
                              <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                            )}
                          </h3>
                          <p className="text-gray-700 mb-3">{notification.message}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: hr,
                              })}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getNotificationColor(notification.type)}`}>
                              {notification.type}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {!notification.isRead ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsReadMutation.mutate(notification.id)
                          }}
                          title="Označi pročitanim"
                          disabled={markAsReadMutation.isPending}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsUnreadMutation.mutate(notification.id)
                          }}
                          title="Označi nepročitanim"
                          disabled={markAsUnreadMutation.isPending}
                        >
                          <X className="h-4 w-4 text-gray-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Jeste li sigurni da želite izbrisati ovu obavijest?')) {
                            deleteNotificationMutation.mutate(notification.id)
                          }
                        }}
                        title="Izbriši"
                        disabled={deleteNotificationMutation.isPending}
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
          <div className="mt-8 flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Prethodna
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: data.pagination.totalPages }).map((_, i) => {
                const pageNum = i + 1
                // Show first page, last page, current page, and pages around current
                if (
                  pageNum === 1 ||
                  pageNum === data.pagination.totalPages ||
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <Button
                      key={i}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                } else if (pageNum === page - 2 || pageNum === page + 2) {
                  return <span key={i} className="px-2">...</span>
                }
                return null
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(data.pagination.totalPages, page + 1))}
              disabled={page === data.pagination.totalPages}
            >
              Sljedeća
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
