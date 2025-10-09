import React, { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, AlertCircle, Info, ShoppingCart, Heart, Package } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface Notification {
  id: string
  type: 'order' | 'promotion' | 'wishlist' | 'stock' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  image?: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    checkNotificationPermission()
    loadNotifications()
    
    // Simulate receiving notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 10 seconds
        addMockNotification()
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted')
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setHasPermission(permission === 'granted')
      
      if (permission === 'granted') {
        toast.success('¡Notificaciones activadas!')
      } else {
        toast.error('Permisos de notificación denegados')
      }
    }
  }

  const loadNotifications = () => {
    const saved = localStorage.getItem('notifications')
    if (saved) {
      const parsed = JSON.parse(saved).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }))
      setNotifications(parsed)
    }
  }

  const saveNotifications = (newNotifications: Notification[]) => {
    localStorage.setItem('notifications', JSON.stringify(newNotifications))
    setNotifications(newNotifications)
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }

    const updatedNotifications = [newNotification, ...notifications].slice(0, 50) // Keep only last 50
    saveNotifications(updatedNotifications)

    // Show browser notification if permission granted
    if (hasPermission && 'Notification' in window) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: newNotification.id
      })
    }

    // Show toast notification
    toast.success(notification.title)
  }

  const addMockNotification = () => {
    const mockNotifications = [
      {
        type: 'promotion' as const,
        title: '¡Nueva oferta disponible!',
        message: '20% de descuento en productos personalizados. ¡Solo hasta mañana!',
        actionUrl: '/productos'
      },
      {
        type: 'stock' as const,
        title: 'Producto disponible',
        message: 'El producto en tu lista de favoritos ya está en stock',
        actionUrl: '/favoritos'
      },
      {
        type: 'order' as const,
        title: 'Pedido actualizado',
        message: 'Tu pedido #12345 está siendo preparado',
        actionUrl: '/perfil/pedidos'
      }
    ]

    const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)]
    addNotification(randomNotification)
  }

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
    saveNotifications(updated)
  }

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    saveNotifications(updated)
  }

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id)
    saveNotifications(updated)
  }

  const clearAllNotifications = () => {
    saveNotifications([])
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5 text-blue-500" />
      case 'promotion':
        return <ShoppingCart className="w-5 h-5 text-green-500" />
      case 'wishlist':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'stock':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-black hover:text-orange-500 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 w-96 max-w-[95vw] bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-black text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notificaciones</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {!hasPermission && (
              <div className="mt-3">
                <Button
                  size="sm"
                  onClick={requestNotificationPermission}
                  className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                >
                  <Bell className="w-3 h-3 mr-1" />
                  Activar notificaciones
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-xs"
                >
                  Marcar todas como leídas
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearAllNotifications}
                  className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                >
                  Limpiar todo
                </Button>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="font-medium mb-1">No hay notificaciones</p>
                <p className="text-sm">Te notificaremos cuando haya novedades</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 hover:bg-gray-50 transition-colors cursor-pointer',
                      !notification.read && 'bg-blue-50 border-l-4 border-blue-500'
                    )}
                    onClick={() => {
                      markAsRead(notification.id)
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={cn(
                            'text-sm font-medium truncate',
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          )}>
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Utility function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Ahora mismo'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `Hace ${minutes} min`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `Hace ${hours}h`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `Hace ${days}d`
  }
}

// Hook for managing notifications from other components
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }

    const saved = localStorage.getItem('notifications')
    const existing = saved ? JSON.parse(saved) : []
    const updated = [newNotification, ...existing].slice(0, 50)
    
    localStorage.setItem('notifications', JSON.stringify(updated))
    setNotifications(updated)

    // Trigger custom event for notification center update
    window.dispatchEvent(new CustomEvent('notificationAdded'))
  }

  return { addNotification }
}