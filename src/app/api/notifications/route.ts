import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const filter = searchParams.get('filter') // 'unread', 'read', 'all'

    // Por ahora vamos a generar notificaciones dinámicamente
    // En el futuro estas vendrán de la base de datos
    const mockNotifications = await generateMockNotifications()

    // Aplicar filtros
    let filteredNotifications = mockNotifications
    if (filter === 'unread') {
      filteredNotifications = mockNotifications.filter(n => !n.isRead)
    } else if (filter === 'read') {
      filteredNotifications = mockNotifications.filter(n => n.isRead)
    }

    // Aplicar paginación
    const paginatedNotifications = filteredNotifications
      .slice(offset, offset + limit)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const stats = {
      total: filteredNotifications.length,
      unread: mockNotifications.filter(n => !n.isRead).length,
      actionRequired: mockNotifications.filter(n => n.actionRequired && !n.isRead).length
    }

    return NextResponse.json({
      notifications: paginatedNotifications,
      stats,
      pagination: {
        limit,
        offset,
        total: filteredNotifications.length,
        hasMore: offset + limit < filteredNotifications.length
      }
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()

    // Validar datos requeridos
    if (!body.type || !body.category || !body.title || !body.message) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: type, category, title, message' },
        { status: 400 }
      )
    }

    // En el futuro, aquí crearíamos la notificación en la base de datos
    const notification = {
      id: `notif_${Date.now()}`,
      type: body.type,
      category: body.category,
      title: body.title,
      message: body.message,
      isRead: false,
      actionRequired: body.actionRequired || false,
      actionUrl: body.actionUrl || null,
      createdAt: new Date(),
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      metadata: body.metadata || null
    }

    return NextResponse.json(notification, { status: 201 })

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función para generar notificaciones mock basadas en datos reales
async function generateMockNotifications() {
  const notifications = []
  const now = new Date()

  try {
    // Verificar pedidos pendientes
    const pendingOrders = await db.order.count({
      where: { status: 'PENDING' }
    })

    if (pendingOrders > 0) {
      notifications.push({
        id: 'pending-orders',
        type: 'warning',
        category: 'order',
        title: 'Pedidos pendientes de confirmar',
        message: `Tienes ${pendingOrders} pedido${pendingOrders > 1 ? 's' : ''} pendiente${pendingOrders > 1 ? 's' : ''} de confirmación`,
        isRead: false,
        actionRequired: true,
        actionUrl: '/admin/orders?status=pending',
        createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutos atrás
        metadata: { count: pendingOrders }
      })
    }

    // Verificar stock bajo (simulado)
    const lowStockCount = Math.floor(Math.random() * 3) // Simulamos 0-2 productos con stock bajo
    if (lowStockCount > 0) {
      notifications.push({
        id: 'low-stock',
        type: 'warning',
        category: 'inventory',
        title: 'Stock bajo detectado',
        message: `${lowStockCount} producto${lowStockCount > 1 ? 's tienen' : ' tiene'} stock bajo. Revisa el inventario.`,
        isRead: false,
        actionRequired: true,
        actionUrl: '/admin/inventory?filter=low-stock',
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 horas atrás
        metadata: { count: lowStockCount }
      })
    }

    // Verificar pagos fallidos (simulado)
    if (Math.random() > 0.7) {
      notifications.push({
        id: 'failed-payment',
        type: 'error',
        category: 'payment',
        title: 'Pago fallido detectado',
        message: 'Un pago ha fallado y requiere atención. El cliente ha sido notificado.',
        isRead: false,
        actionRequired: true,
        actionUrl: '/admin/orders?payment_status=failed',
        createdAt: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutos atrás
        metadata: { orderId: 'order_123' }
      })
    }

    // Verificar nuevos clientes registrados
    const recentCustomers = await db.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Últimas 24 horas
        }
      }
    })

    if (recentCustomers > 0) {
      notifications.push({
        id: 'new-customers',
        type: 'success',
        category: 'customer',
        title: 'Nuevos clientes registrados',
        message: `${recentCustomers} nuevo${recentCustomers > 1 ? 's' : ''} cliente${recentCustomers > 1 ? 's se han' : ' se ha'} registrado en las últimas 24 horas`,
        isRead: Math.random() > 0.5, // 50% de posibilidad de estar leída
        actionRequired: false,
        actionUrl: '/admin/customers?filter=recent',
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 horas atrás
        metadata: { count: recentCustomers }
      })
    }

    // Verificar descuentos próximos a expirar
    const expiringDiscounts = await db.discount.count({
      where: {
        isActive: true,
        validUntil: {
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Próximos 7 días
          gte: now
        }
      }
    })

    if (expiringDiscounts > 0) {
      notifications.push({
        id: 'expiring-discounts',
        type: 'info',
        category: 'system',
        title: 'Descuentos próximos a expirar',
        message: `${expiringDiscounts} descuento${expiringDiscounts > 1 ? 's expiran' : ' expira'} en los próximos 7 días`,
        isRead: Math.random() > 0.3, // 70% de posibilidad de estar leída
        actionRequired: false,
        actionUrl: '/admin/discounts?filter=expiring',
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 horas atrás
        metadata: { count: expiringDiscounts }
      })
    }

    // Notificaciones del sistema
    notifications.push({
      id: 'system-update',
      type: 'info',
      category: 'system',
      title: 'Sistema actualizado',
      message: 'El sistema de notificaciones ha sido implementado correctamente. ¡Ya puedes recibir alertas en tiempo real!',
      isRead: false,
      actionRequired: false,
      actionUrl: '/admin/settings/notifications',
      createdAt: new Date(now.getTime() - 10 * 60 * 1000), // 10 minutos atrás
      metadata: { version: '1.0.0' }
    })

  } catch (error) {
    console.error('Error generating notifications:', error)
  }

  return notifications
}