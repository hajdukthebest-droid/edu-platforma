'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Bell, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
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

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { markNotificationAsRead, markAllNotificationsAsRead } = useSocket()

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const response = await api.get('/notifications/unread-count')
      return response.data.data.count
    },
  })

  const { data: notifications } = useQuery({
    queryKey: ['notifications-recent'],
    queryFn: async () => {
      const response = await api.get('/notifications?limit=5')
      return response.data.data.notifications
    },
    enabled: isOpen,
  })

  // Handle new notification from socket
  const handleNewNotification = useCallback((notification: any) => {
    // Invalidate queries to refresh badge and list
    queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    queryClient.invalidateQueries({ queryKey: ['notifications-recent'] })
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }, [queryClient])

  // Subscribe to new notifications
  useNewNotification(handleNewNotification)

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      markNotificationAsRead(notificationId)
      await api.post(`/notifications/${notificationId}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      markAllNotificationsAsRead()
      await api.post('/notifications/mark-all-read')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] })
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-96 z-50">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-base">Obavijesti</CardTitle>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsReadMutation.mutate()}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Označi sve
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                {!notifications || notifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Nema novih obavijesti</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification: Notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            {notification.link ? (
                              <Link
                                href={notification.link}
                                onClick={() => handleNotificationClick(notification)}
                                className="block"
                              >
                                <p className="font-medium text-sm mb-1">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(notification.createdAt)}
                                </p>
                              </Link>
                            ) : (
                              <>
                                <p className="font-medium text-sm mb-1">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(notification.createdAt)}
                                </p>
                              </>
                            )}
                          </div>
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Check className="h-4 w-4 text-blue-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {notifications && notifications.length > 0 && (
                  <div className="p-3 border-t">
                    <Link
                      href="/notifications"
                      onClick={() => setIsOpen(false)}
                      className="text-sm text-blue-600 hover:text-blue-800 block text-center"
                    >
                      Prikaži sve obavijesti
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
