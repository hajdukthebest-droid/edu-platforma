'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import api from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import { hr } from 'date-fns/locale'
import { Bell, Check, X, Trash2, ExternalLink } from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
}

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

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  // Fetch unread count
  const { data: unreadCount, refetch: refetchCount } = useQuery({
    queryKey: ['notification-unread-count'],
    queryFn: async () => {
      const response = await api.get('/notifications/unread-count')
      return response.data.data.count
    },
    refetchInterval: 30000, // Poll every 30 seconds
  })

  // Fetch recent notifications
  const { data: notifications, refetch: refetchNotifications } = useQuery<
    Notification[]
  >({
    queryKey: ['notifications-dropdown'],
    queryFn: async () => {
      const response = await api.get('/notifications?limit=5')
      return response.data.data.notifications
    },
    enabled: isOpen,
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/notifications/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-dropdown'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.post('/notifications/mark-all-read')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-dropdown'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-dropdown'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 z-20 mt-2 w-80 sm:w-96 rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifikacije
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="text-sm text-blue-600 hover:text-blue-700"
                  disabled={markAllAsReadMutation.isPending}
                >
                  <Check className="mr-1 inline h-4 w-4" />
                  Označi sve
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications && notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50 ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        <span className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {notification.link ? (
                          <Link
                            href={notification.link}
                            onClick={() => handleNotificationClick(notification)}
                            className="block"
                          >
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {formatDistanceToNow(
                                new Date(notification.createdAt),
                                { addSuffix: true, locale: hr }
                              )}
                            </p>
                          </Link>
                        ) : (
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {formatDistanceToNow(
                                new Date(notification.createdAt),
                                { addSuffix: true, locale: hr }
                              )}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsReadMutation.mutate(notification.id)
                            }}
                            className="text-blue-600 hover:text-blue-700"
                            title="Označi pročitano"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotificationMutation.mutate(notification.id)
                          }}
                          className="text-red-600 hover:text-red-700"
                          title="Obriši"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <Bell className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">
                    Nemate novih notifikacija
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications && notifications.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-3 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Vidi sve notifikacije
                  <ExternalLink className="ml-1 inline h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
