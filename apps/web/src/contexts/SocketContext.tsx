'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  sendMessage: (conversationId: string, content: string) => void
  sendTyping: (conversationId: string, isTyping: boolean) => void
  joinConversation: (conversationId: string) => void
  markConversationAsRead: (conversationId: string) => void
  markNotificationAsRead: (notificationId: string) => void
  markAllNotificationsAsRead: () => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  sendMessage: () => {},
  sendTyping: () => {},
  joinConversation: () => {},
  markConversationAsRead: () => {},
  markNotificationAsRead: () => {},
  markAllNotificationsAsRead: () => {},
})

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user, token } = useAuth()

  useEffect(() => {
    if (!user || !token) {
      // Disconnect if user logs out
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Create socket connection
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const newSocket = io(apiUrl, {
      auth: {
        token,
      },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id)
      setIsConnected(true)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
      setIsConnected(false)
    })

    newSocket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [user, token])

  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      if (socket && isConnected) {
        socket.emit('message:send', { conversationId, content })
      }
    },
    [socket, isConnected]
  )

  const sendTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      if (socket && isConnected) {
        socket.emit('message:typing', { conversationId, isTyping })
      }
    },
    [socket, isConnected]
  )

  const joinConversation = useCallback(
    (conversationId: string) => {
      if (socket && isConnected) {
        socket.emit('conversation:join', { conversationId })
      }
    },
    [socket, isConnected]
  )

  const markConversationAsRead = useCallback(
    (conversationId: string) => {
      if (socket && isConnected) {
        socket.emit('conversation:read', { conversationId })
      }
    },
    [socket, isConnected]
  )

  const markNotificationAsRead = useCallback(
    (notificationId: string) => {
      if (socket && isConnected) {
        socket.emit('notification:read', { notificationId })
      }
    },
    [socket, isConnected]
  )

  const markAllNotificationsAsRead = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('notification:read-all')
    }
  }, [socket, isConnected])

  const value = {
    socket,
    isConnected,
    sendMessage,
    sendTyping,
    joinConversation,
    markConversationAsRead,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

// Custom hooks for specific socket events
export function useSocketEvent(event: string, handler: (data: any) => void) {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on(event, handler)

    return () => {
      socket.off(event, handler)
    }
  }, [socket, event, handler])
}

export function useNewMessage(handler: (message: any) => void) {
  useSocketEvent('message:new', handler)
}

export function useTypingStatus(handler: (data: { conversationId: string; userId: string; isTyping: boolean }) => void) {
  useSocketEvent('message:typing', handler)
}

export function useConversationRead(handler: (data: { conversationId: string; userId: string }) => void) {
  useSocketEvent('conversation:read', handler)
}

export function useNewNotification(handler: (notification: any) => void) {
  useSocketEvent('notification:new', handler)
}
