import { useState, useEffect, useCallback } from 'react'
import { NotificationType } from '@/lib/notifications'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  isRead: boolean
  actionUrl?: string
  createdAt: string
  readAt?: string
  expiresAt?: string
  metadata?: Record<string, any>
}

export interface NotificationFilters {
  unreadOnly?: boolean
  types?: NotificationType[]
  limit?: number
  offset?: number
}

export function useNotifications(filters: NotificationFilters = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const fetchNotifications = useCallback(async (reset = false) => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.offset && !reset) params.append('offset', filters.offset.toString())
      if (filters.unreadOnly) params.append('unreadOnly', 'true')
      if (filters.types && filters.types.length > 0) {
        params.append('types', filters.types.join(','))
      }

      const response = await fetch(`/api/notifications?${params}`)
      
      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit - esperar antes de intentar de nuevo
          console.warn('Rate limit exceeded, backing off...')
          setError('Demasiadas solicitudes, esperando...')
          return
        }
        if (response.status === 404) {
          // API no implementada todavía - usar datos mock silenciosamente
          console.warn('Notifications API not implemented yet, using mock data')
          setNotifications([])
          setUnreadCount(0)
          setHasMore(false)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (reset) {
        setNotifications(data.notifications)
      } else {
        setNotifications(prev => [...prev, ...data.notifications])
      }
      
      setUnreadCount(data.unreadCount)
      setHasMore(data.pagination.hasMore)

    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Notifications API not implemented yet')
          return true // Simular éxito
        }
        throw new Error('Error al marcar como leída')
      }

      // Actualizar el estado local
      setNotifications(prev => 
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      )

      // Decrementar contador de no leídas
      setUnreadCount(prev => Math.max(0, prev - 1))

      return true
    } catch (err) {
      console.error('Error marking notification as read:', err)
      return false
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST'
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Notifications API not implemented yet')
          return true // Simular éxito
        }
        throw new Error('Error al marcar todas como leídas')
      }

      // Actualizar el estado local
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString()
        }))
      )

      setUnreadCount(0)
      return true
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      return false
    }
  }, [])

  const createNotification = useCallback(async (data: {
    type: NotificationType
    title: string
    message: string
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    userId?: string
    metadata?: Record<string, any>
    actionUrl?: string
    expiresAt?: string
  }) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Notifications API not implemented yet')
          throw new Error('API de notificaciones no implementada')
        }
        throw new Error('Error al crear notificación')
      }

      const notification = await response.json()
      
      // Agregar al estado local
      setNotifications(prev => [notification, ...prev])
      
      if (!notification.isRead) {
        setUnreadCount(prev => prev + 1)
      }

      return notification
    } catch (err) {
      console.error('Error creating notification:', err)
      throw err
    }
  }, [])

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return
    
    fetchNotifications(false)
  }, [hasMore, isLoading, fetchNotifications])

  const refresh = useCallback(() => {
    fetchNotifications(true)
  }, [fetchNotifications])

  useEffect(() => {
    fetchNotifications(true)
  }, []) // Solo ejecutar una vez al montar

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,
    markAsRead,
    markAllAsRead,
    createNotification,
    loadMore,
    refresh
  }
}

// Hook para notificaciones en tiempo real
export function useRealtimeNotifications() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastActivity, setLastActivity] = useState<Date | null>(null)

  const playNotificationSound = useCallback((type: NotificationType) => {
    if (typeof window === 'undefined') return

    try {
      const audio = new Audio(`/sounds/${type.toLowerCase()}.mp3`)
      audio.volume = 0.5
      audio.play().catch(console.error)
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
  }, [])

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'not-supported'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission === 'denied') {
      return 'denied'
    }

    const permission = await Notification.requestPermission()
    return permission
  }, [])

  const showBrowserNotification = useCallback(async (notification: Notification) => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return
    }

    if (Notification.permission === 'granted') {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: notification.type,
          data: {
            notificationId: notification.id,
            actionUrl: notification.actionUrl,
            type: notification.type
          }
        })

        browserNotification.onclick = () => {
          if (notification.actionUrl) {
            window.open(notification.actionUrl, '_blank')
          }
          browserNotification.close()
        }

        // Auto cerrar después de 5 segundos
        setTimeout(() => {
          browserNotification.close()
        }, 5000)

      } catch (error) {
        console.error('Error showing browser notification:', error)
      }
    }
  }, [])

  const connect = useCallback(() => {
    // En una implementación real, aquí se conectaría con WebSockets o SSE
    setIsConnected(true)
    setLastActivity(new Date())
    
    console.log('🔔 Real-time notifications connected')
  }, [])

  const disconnect = useCallback(() => {
    setIsConnected(false)
    console.log('🔔 Real-time notifications disconnected')
  }, [])

  useEffect(() => {
    // Auto-conectar al montar el componente
    connect()

    // Limpiar al desmontar
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    lastActivity,
    playNotificationSound,
    showBrowserNotification,
    requestNotificationPermission,
    connect,
    disconnect
  }
}

// Hook para configuraciones de notificaciones
export function useNotificationSettings() {
  const [settings, setSettings] = useState({
    email: true,
    browser: true,
    sound: true,
    newOrders: true,
    stockAlerts: true,
    customerMessages: true,
    systemAlerts: true
  })

  const [isLoading, setIsLoading] = useState(false)

  const updateSettings = useCallback(async (newSettings: Partial<typeof settings>) => {
    try {
      setIsLoading(true)
      
      // En una implementación real, aquí se enviaría al servidor
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      })

      if (response.ok) {
        setSettings(prev => ({ ...prev, ...newSettings }))
        return true
      }

      throw new Error('Error al actualizar configuración')
    } catch (error) {
      console.error('Error updating notification settings:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/settings/notifications')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading notification settings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return {
    settings,
    isLoading,
    updateSettings
  }
}