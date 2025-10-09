"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Bell, 
  Check, 
  Trash2, 
  Filter,
  Search,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Package,
  Users,
  CreditCard,
  TrendingDown,
  Clock,
  ArrowLeft,
  MoreVertical,
  Archive,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import type { Notification } from "@/components/admin/NotificationCenter"

export default function NotificationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    actionRequired: 0
  })

  useEffect(() => {
    loadNotifications()
  }, [filter])

  const loadNotifications = async () => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (filter !== 'all') queryParams.append('filter', filter)
      
      const response = await fetch(`/api/notifications?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setStats(data.stats || { total: 0, unread: 0, actionRequired: 0 })
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
      toast.error('Error al cargar notificaciones')
    } finally {
      setIsLoading(false)
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
        setStats(prev => ({ ...prev, unread: prev.unread - 1 }))
        toast.success('Marcada como leída')
      }
    } catch (error) {
      toast.error('Error al marcar como leída')
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        toast.success('Notificación eliminada')
      }
    } catch (error) {
      toast.error('Error al eliminar notificación')
    }
  }

  const handleBulkAction = async (action: 'read' | 'delete') => {
    if (selectedNotifications.length === 0) return

    try {
      if (action === 'read') {
        // Marcar todas como leídas
        await Promise.all(
          selectedNotifications.map(id => 
            fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
          )
        )
        
        setNotifications(prev => 
          prev.map(n => 
            selectedNotifications.includes(n.id) ? { ...n, isRead: true } : n
          )
        )
        toast.success(`${selectedNotifications.length} notificaciones marcadas como leídas`)
      } else if (action === 'delete') {
        // Eliminar todas
        await Promise.all(
          selectedNotifications.map(id => 
            fetch(`/api/notifications/${id}`, { method: 'DELETE' })
          )
        )
        
        setNotifications(prev => 
          prev.filter(n => !selectedNotifications.includes(n.id))
        )
        toast.success(`${selectedNotifications.length} notificaciones eliminadas`)
      }
      
      setSelectedNotifications([])
    } catch (error) {
      toast.error('Error en la acción masiva')
    }
  }

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'order') return <Package className="w-5 h-5" />
    if (category === 'payment') return <CreditCard className="w-5 h-5" />
    if (category === 'inventory') return <TrendingDown className="w-5 h-5" />
    if (category === 'customer') return <Users className="w-5 h-5" />
    if (category === 'production') return <Settings className="w-5 h-5" />
    
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />
      case 'warning': return <AlertTriangle className="w-5 h-5" />
      case 'error': return <X className="w-5 h-5" />
      default: return <Info className="w-5 h-5" />
    }
  }

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'error':
        return 'border-l-red-500 bg-red-50'
      default:
        return 'border-l-blue-500 bg-blue-50'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando notificaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🔔 Centro de Notificaciones</h1>
            <p className="text-gray-600 mt-1">
              Gestiona todas las alertas y notificaciones del sistema
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadNotifications}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => router.push('/admin/settings/notifications')}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sin Leer</p>
                <p className="text-2xl font-bold text-orange-600">{stats.unread}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acción Requerida</p>
                <p className="text-2xl font-bold text-red-600">{stats.actionRequired}</p>
              </div>
              <Star className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar notificaciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
              >
                Todas ({stats.total})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                onClick={() => setFilter('unread')}
                size="sm"
              >
                Sin Leer ({stats.unread})
              </Button>
              <Button
                variant={filter === 'action-required' ? 'default' : 'outline'}
                onClick={() => setFilter('action-required')}
                size="sm"
              >
                Acción Requerida ({stats.actionRequired})
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedNotifications.length} notificación(es) seleccionada(s)
              </span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleBulkAction('read')}>
                  <Check className="w-3 h-3 mr-1" />
                  Marcar como leídas
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay notificaciones</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'No se encontraron notificaciones con ese término' : 
                 filter === 'unread' ? 'No hay notificaciones sin leer' :
                 filter === 'action-required' ? 'No hay acciones pendientes' :
                 'No hay notificaciones disponibles'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-l-4 rounded-lg p-4 transition-colors ${
                    !notification.isRead ? 'bg-blue-25' : 'bg-white'
                  } ${getNotificationStyles(notification.type)} hover:shadow-sm border border-gray-200`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedNotifications(prev => [...prev, notification.id])
                          } else {
                            setSelectedNotifications(prev => prev.filter(id => id !== notification.id))
                          }
                        }}
                        className="mt-1"
                      />

                      <div className={`p-2 rounded-full ${
                        notification.type === 'success' ? 'text-green-600 bg-green-100' :
                        notification.type === 'warning' ? 'text-yellow-600 bg-yellow-100' :
                        notification.type === 'error' ? 'text-red-600 bg-red-100' :
                        'text-blue-600 bg-blue-100'
                      }`}>
                        {getNotificationIcon(notification.type, notification.category)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          {notification.actionRequired && (
                            <Badge variant="destructive">
                              Acción requerida
                            </Badge>
                          )}
                          <Badge variant="secondary" className="capitalize">
                            {notification.category}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 mb-3">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {new Intl.DateTimeFormat('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }).format(new Date(notification.createdAt))}
                            </span>
                          </div>
                          
                          {notification.actionUrl && (
                            <Button
                              size="sm"
                              onClick={() => {
                                window.location.href = notification.actionUrl!
                                markAsRead(notification.id)
                              }}
                            >
                              Ver detalles
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-4">
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                          title="Marcar como leída"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}