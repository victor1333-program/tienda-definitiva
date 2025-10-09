"use client"

import { useState, useEffect } from "react"
import { 
  Bell, 
  Check, 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Package,
  Users,
  CreditCard,
  TrendingDown,
  Clock,
  Settings,
  MoreVertical,
  Trash2,
  MarkAsUnread
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"

export interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  category: 'order' | 'payment' | 'inventory' | 'customer' | 'system' | 'production'
  title: string
  message: string
  isRead: boolean
  actionRequired: boolean
  actionUrl?: string
  createdAt: Date
  expiresAt?: Date
  metadata?: any
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'action-required'>('all')

  useEffect(() => {
    loadNotifications()
    // POLLING DESHABILITADO - usar solo el hook useNotifications
    // const interval = setInterval(loadNotifications, 30000)
    // return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead).length
    setUnreadCount(unread)
  }, [notifications])

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      } else if (response.status === 404) {
        // API no implementada - usar datos vacíos silenciosamente
        console.warn('Notifications API not implemented yet')
        setNotifications([])
        return
      } else if (response.status === 429) {
        console.warn('Rate limit exceeded in NotificationCenter')
        return
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
      // En caso de error, usar datos vacíos
      setNotifications([])
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        )
      } else if (response.status === 404) {
        // API no implementada - simular éxito localmente
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH'
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true }))
        )
        toast.success('Todas las notificaciones marcadas como leídas')
      }
    } catch (error) {
      toast.error('Error al marcar todas como leídas')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(n => n.id !== notificationId)
        )
        toast.success('Notificación eliminada')
      }
    } catch (error) {
      toast.error('Error al eliminar notificación')
    }
  }

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'order') return <Package className="w-4 h-4" />
    if (category === 'payment') return <CreditCard className="w-4 h-4" />
    if (category === 'inventory') return <TrendingDown className="w-4 h-4" />
    if (category === 'customer') return <Users className="w-4 h-4" />
    if (category === 'production') return <Settings className="w-4 h-4" />
    
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'error': return <X className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 text-green-900'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 text-yellow-900'
      case 'error':
        return 'border-l-red-500 bg-red-50 text-red-900'
      default:
        return 'border-l-blue-500 bg-blue-50 text-blue-900'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead
      case 'action-required':
        return notification.actionRequired && !notification.isRead
      default:
        return true
    }
  })

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center p-0"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notificaciones
                </h3>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={markAllAsRead}
                      disabled={isLoading}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Marcar todas
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                >
                  Todas ({notifications.length})
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  onClick={() => setFilter('unread')}
                >
                  No leídas ({unreadCount})
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'action-required' ? 'default' : 'outline'}
                  onClick={() => setFilter('action-required')}
                >
                  Acción requerida ({notifications.filter(n => n.actionRequired && !n.isRead).length})
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">
                    {filter === 'all' ? 'No hay notificaciones' :
                     filter === 'unread' ? 'No hay notificaciones sin leer' :
                     'No hay acciones pendientes'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 transition-colors hover:bg-gray-50 ${
                        !notification.isRead ? 'bg-blue-25' : 'bg-white'
                      } ${getNotificationStyles(notification.type)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-1 rounded-full ${
                            notification.type === 'success' ? 'text-green-600' :
                            notification.type === 'warning' ? 'text-yellow-600' :
                            notification.type === 'error' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            {getNotificationIcon(notification.type, notification.category)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                              )}
                              {notification.actionRequired && (
                                <Badge variant="destructive" className="text-xs">
                                  Acción requerida
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {new Intl.RelativeTimeFormat('es', { 
                                    numeric: 'auto' 
                                  }).format(
                                    Math.floor((new Date(notification.createdAt).getTime() - Date.now()) / (1000 * 60)),
                                    'minute'
                                  )}
                                </span>
                              </div>
                              
                              {notification.actionUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    window.location.href = notification.actionUrl!
                                    markAsRead(notification.id)
                                  }}
                                  className="text-xs"
                                >
                                  Ver detalles
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions Menu */}
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 h-6 w-6"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 h-6 w-6 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false)
                    window.location.href = '/admin/notifications'
                  }}
                  className="text-primary-600 hover:text-primary-700"
                >
                  Ver todas las notificaciones
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}