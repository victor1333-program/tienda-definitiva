import { db } from './db'

export type NotificationType = 
  | 'NEW_ORDER' 
  | 'ORDER_STATUS_CHANGE' 
  | 'LOW_STOCK' 
  | 'NEW_CUSTOMER' 
  | 'PAYMENT_RECEIVED' 
  | 'CONTACT_FORM' 
  | 'SYSTEM_ALERT'
  | 'REVIEW_RECEIVED'

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface NotificationData {
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  userId?: string
  metadata?: Record<string, any>
  actionUrl?: string
  expiresAt?: Date
}

export interface NotificationPreferences {
  email: boolean
  browser: boolean
  sound: boolean
  newOrders: boolean
  stockAlerts: boolean
  customerMessages: boolean
  systemAlerts: boolean
}

class NotificationService {
  private subscribers: Map<string, (notification: any) => void> = new Map()
  private sounds: Map<NotificationType, string> = new Map([
    ['NEW_ORDER', '/sounds/new-order.mp3'],
    ['LOW_STOCK', '/sounds/alert.mp3'],
    ['CONTACT_FORM', '/sounds/message.mp3'],
    ['SYSTEM_ALERT', '/sounds/warning.mp3'],
  ])

  // Crear una notificación
  async create(data: NotificationData): Promise<any> {
    try {
      const notification = await db.notification.create({
        data: {
          type: data.type,
          title: data.title,
          message: data.message,
          priority: data.priority,
          userId: data.userId,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          actionUrl: data.actionUrl,
          expiresAt: data.expiresAt,
          isRead: false,
          createdAt: new Date()
        }
      })

      // Enviar notificación en tiempo real
      this.broadcast(notification)

      // Enviar notificación push del navegador si está habilitado
      await this.sendBrowserNotification(notification)

      console.log(`📱 Notification created: ${data.title}`)
      return notification

    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  // Obtener notificaciones para un usuario
  async getForUser(userId: string, options: {
    limit?: number
    offset?: number
    unreadOnly?: boolean
    types?: NotificationType[]
  } = {}): Promise<any[]> {
    try {
      const {
        limit = 20,
        offset = 0,
        unreadOnly = false,
        types = []
      } = options

      const where: any = { userId }

      if (unreadOnly) {
        where.isRead = false
      }

      if (types.length > 0) {
        where.type = { in: types }
      }

      // Filtrar notificaciones no expiradas
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]

      const notifications = await db.notification.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit,
        skip: offset
      })

      return notifications

    } catch (error) {
      console.error('Error getting notifications:', error)
      return []
    }
  }

  // Obtener notificaciones para administradores
  async getForAdmins(options: {
    limit?: number
    offset?: number
    unreadOnly?: boolean
    types?: NotificationType[]
  } = {}): Promise<any[]> {
    try {
      const {
        limit = 50,
        offset = 0,
        unreadOnly = false,
        types = []
      } = options

      const where: any = {
        OR: [
          { userId: null }, // Notificaciones globales
          { 
            user: { 
              role: { in: ['ADMIN', 'SUPER_ADMIN'] } 
            } 
          }
        ]
      }

      if (unreadOnly) {
        where.isRead = false
      }

      if (types.length > 0) {
        where.type = { in: types }
      }

      // Filtrar notificaciones no expiradas
      where.AND = [
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      ]

      const notifications = await db.notification.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true, role: true }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit,
        skip: offset
      })

      return notifications

    } catch (error) {
      console.error('Error getting admin notifications:', error)
      return []
    }
  }

  // Marcar como leída
  async markAsRead(notificationId: string, userId?: string): Promise<boolean> {
    try {
      const where: any = { id: notificationId }
      if (userId) {
        where.userId = userId
      }

      await db.notification.update({
        where,
        data: { 
          isRead: true,
          readAt: new Date()
        }
      })

      return true
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  // Marcar todas como leídas
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      await db.notification.updateMany({
        where: { 
          userId,
          isRead: false
        },
        data: { 
          isRead: true,
          readAt: new Date()
        }
      })

      return true
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }

  // Contar notificaciones no leídas
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await db.notification.count({
        where: {
          userId,
          isRead: false,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      })

      return count
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }

  // Limpiar notificaciones expiradas
  async cleanupExpired(): Promise<number> {
    try {
      const result = await db.notification.deleteMany({
        where: {
          expiresAt: { lt: new Date() }
        }
      })

      console.log(`🧹 Cleaned up ${result.count} expired notifications`)
      return result.count
    } catch (error) {
      console.error('Error cleaning up notifications:', error)
      return 0
    }
  }

  // Suscribirse a notificaciones en tiempo real
  subscribe(userId: string, callback: (notification: any) => void): () => void {
    this.subscribers.set(userId, callback)
    
    return () => {
      this.subscribers.delete(userId)
    }
  }

  // Enviar notificación a todos los suscriptores
  private broadcast(notification: any): void {
    if (notification.userId) {
      // Notificación específica para un usuario
      const callback = this.subscribers.get(notification.userId)
      if (callback) {
        callback(notification)
      }
    } else {
      // Notificación global para todos los administradores
      this.subscribers.forEach((callback, userId) => {
        callback(notification)
      })
    }
  }

  // Enviar notificación push del navegador
  private async sendBrowserNotification(notification: any): Promise<void> {
    try {
      // En el cliente, esto se manejará con la Web Push API
      // Aquí solo preparamos los datos
      const pushData = {
        title: notification.title,
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: notification.type,
        data: {
          notificationId: notification.id,
          actionUrl: notification.actionUrl,
          type: notification.type
        },
        actions: notification.actionUrl ? [
          {
            action: 'view',
            title: 'Ver detalles'
          }
        ] : []
      }

      // En producción, aquí se enviaría a un servicio push como FCM
      console.log('🔔 Browser notification prepared:', pushData)
      
    } catch (error) {
      console.error('Error preparing browser notification:', error)
    }
  }

  // Reproducir sonido de notificación
  playSound(type: NotificationType): void {
    const soundPath = this.sounds.get(type)
    if (soundPath && typeof window !== 'undefined') {
      try {
        const audio = new Audio(soundPath)
        audio.volume = 0.5
        audio.play().catch(console.error)
      } catch (error) {
        console.error('Error playing notification sound:', error)
      }
    }
  }

  // Funciones de conveniencia para tipos específicos
  async notifyNewOrder(orderData: any): Promise<any> {
    return this.create({
      type: 'NEW_ORDER',
      title: `Nuevo pedido #${orderData.orderNumber}`,
      message: `Pedido de ${orderData.customerName} por ${orderData.totalAmount}€`,
      priority: 'HIGH',
      metadata: {
        orderId: orderData.id,
        orderNumber: orderData.orderNumber,
        customerName: orderData.customerName,
        totalAmount: orderData.totalAmount
      },
      actionUrl: `/admin/orders/${orderData.id}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
    })
  }

  async notifyLowStock(productData: any): Promise<any> {
    return this.create({
      type: 'LOW_STOCK',
      title: 'Stock bajo',
      message: `${productData.name} tiene solo ${productData.stock} unidades`,
      priority: 'MEDIUM',
      metadata: {
        productId: productData.id,
        productName: productData.name,
        currentStock: productData.stock
      },
      actionUrl: `/admin/products/${productData.id}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 día
    })
  }

  async notifyNewCustomer(customerData: any): Promise<any> {
    return this.create({
      type: 'NEW_CUSTOMER',
      title: 'Nuevo cliente registrado',
      message: `${customerData.name} se ha registrado`,
      priority: 'LOW',
      metadata: {
        customerId: customerData.id,
        customerName: customerData.name,
        customerEmail: customerData.email
      },
      actionUrl: `/admin/customers/${customerData.id}`,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 días
    })
  }

  async notifyContactForm(contactData: any): Promise<any> {
    return this.create({
      type: 'CONTACT_FORM',
      title: 'Nueva consulta de contacto',
      message: `${contactData.name}: ${contactData.subject}`,
      priority: 'MEDIUM',
      metadata: {
        contactId: contactData.id,
        customerName: contactData.name,
        customerEmail: contactData.email,
        subject: contactData.subject
      },
      actionUrl: `/admin/communication`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
    })
  }

  async notifySystemAlert(alertData: { title: string, message: string, severity?: string }): Promise<any> {
    const priority: NotificationPriority = alertData.severity === 'critical' ? 'URGENT' : 
                                          alertData.severity === 'warning' ? 'HIGH' : 'MEDIUM'

    return this.create({
      type: 'SYSTEM_ALERT',
      title: alertData.title,
      message: alertData.message,
      priority,
      metadata: {
        severity: alertData.severity || 'info',
        timestamp: new Date().toISOString()
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 día
    })
  }
}

export const notificationService = new NotificationService()

// Configurar limpieza automática de notificaciones expiradas
if (typeof window === 'undefined') {
  // Solo en el servidor
  setInterval(async () => {
    try {
      await notificationService.cleanupExpired()
    } catch (error) {
      console.error('Error in notification cleanup:', error)
    }
  }, 60 * 60 * 1000) // Cada hora
}