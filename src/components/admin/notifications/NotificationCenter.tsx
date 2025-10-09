'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, CheckCheck, Filter, AlertCircle, Package, User, Mail, Settings } from 'lucide-react'
import { useNotifications, useRealtimeNotifications } from '@/hooks/useNotifications'
import { NotificationType } from '@/lib/notifications'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const notificationIcons = {
  NEW_ORDER: Package,
  ORDER_STATUS_CHANGE: Package,
  LOW_STOCK: AlertCircle,
  NEW_CUSTOMER: User,
  PAYMENT_RECEIVED: CheckCheck,
  CONTACT_FORM: Mail,
  SYSTEM_ALERT: AlertCircle,
  REVIEW_RECEIVED: CheckCheck
}

const priorityColors = {
  LOW: 'bg-gray-100 border-gray-300',
  MEDIUM: 'bg-blue-50 border-blue-300',
  HIGH: 'bg-orange-50 border-orange-300',
  URGENT: 'bg-red-50 border-red-300'
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [typeFilter, setTypeFilter] = useState<NotificationType[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,
    markAsRead,
    markAllAsRead,
    loadMore,
    refresh
  } = useNotifications({
    unreadOnly: filter === 'unread',
    types: typeFilter.length > 0 ? typeFilter : undefined,
    limit: 20
  })

  const {
    isConnected,
    requestNotificationPermission,
    showBrowserNotification
  } = useRealtimeNotifications()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen) {
      requestNotificationPermission()
    }
  }, [isOpen, requestNotificationPermission])

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }
    
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank')
    }
  }

  const toggleTypeFilter = (type: NotificationType) => {
    setTypeFilter(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {isConnected && (
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">
                Notificaciones
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({unreadCount} nuevas)
                  </span>
                )}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="p-3 border-b bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filter === 'unread' ? 'Solo no leídas' : 'Todas'}
              </button>
              
              {(['NEW_ORDER', 'LOW_STOCK', 'CONTACT_FORM', 'SYSTEM_ALERT'] as NotificationType[]).map(type => (
                <button
                  key={type}
                  onClick={() => toggleTypeFilter(type)}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    typeFilter.includes(type)
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Cargando notificaciones...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-600">
                Error: {error}
                <button
                  onClick={refresh}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  Reintentar
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {filter === 'unread' ? 'No hay notificaciones sin leer' : 'No hay notificaciones'}
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => {
                  const IconComponent = notificationIcons[notification.type] || Bell
                  const priorityClass = priorityColors[notification.priority] || priorityColors.MEDIUM
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      } ${priorityClass} border-l-4`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 p-2 rounded-full ${
                          notification.priority === 'URGENT' ? 'bg-red-100' :
                          notification.priority === 'HIGH' ? 'bg-orange-100' :
                          notification.priority === 'MEDIUM' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <IconComponent className={`w-4 h-4 ${
                            notification.priority === 'URGENT' ? 'text-red-600' :
                            notification.priority === 'HIGH' ? 'text-orange-600' :
                            notification.priority === 'MEDIUM' ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkAsRead(notification.id)
                                }}
                                className="text-blue-600 hover:text-blue-800 ml-2"
                                title="Marcar como leída"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: es
                              })}
                            </span>
                            <span className="capitalize">
                              {notification.priority.toLowerCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {hasMore && (
                  <div className="p-4 text-center border-t">
                    <button
                      onClick={loadMore}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                    >
                      {isLoading ? 'Cargando...' : 'Cargar más'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t bg-gray-50 text-center">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
              </span>
              <button
                onClick={refresh}
                className="text-blue-600 hover:text-blue-800"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}