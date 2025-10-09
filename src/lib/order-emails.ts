/**
 * Sistema de emails para actualizaciones de órdenes
 * Maneja notificaciones automáticas de cambios de estado
 */

import { OrderStatus } from '@prisma/client'

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  customerEmail: string
  customerName: string
  shippingAddress?: {
    fullName?: string
    address?: string
    city?: string
    postalCode?: string
  }
  orderItems: Array<{
    productName: string
    quantity: number
    unitPrice: number
  }>
  createdAt: Date
  updatedAt: Date
}

interface EmailTemplate {
  subject: string
  htmlContent: string
  textContent: string
}

/**
 * Genera el contenido del email para cada estado
 */
function generateEmailTemplate(order: Order, newStatus: OrderStatus): EmailTemplate {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)

  const formatDate = (date: Date) => 
    new Intl.DateTimeFormat('es-ES', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    }).format(date)

  const statusMessages = {
    PENDING: {
      subject: `Pedido ${order.orderNumber} - Confirmación recibida`,
      title: 'Pedido Confirmado',
      message: 'Hemos recibido tu pedido y lo estamos preparando.',
      emoji: '📦',
      color: '#3B82F6'
    },
    PROCESSING: {
      subject: `Pedido ${order.orderNumber} - En preparación`,
      title: 'Preparando tu Pedido',
      message: 'Tu pedido está siendo preparado por nuestro equipo.',
      emoji: '🔨',
      color: '#F59E0B'
    },
    SHIPPED: {
      subject: `Pedido ${order.orderNumber} - Enviado`,
      title: 'Pedido Enviado',
      message: 'Tu pedido ha sido enviado y está en camino.',
      emoji: '🚚',
      color: '#10B981'
    },
    DELIVERED: {
      subject: `Pedido ${order.orderNumber} - Entregado`,
      title: 'Pedido Entregado',
      message: '¡Tu pedido ha sido entregado con éxito! Esperamos que disfrutes tus productos.',
      emoji: '✅',
      color: '#059669'
    },
    CANCELLED: {
      subject: `Pedido ${order.orderNumber} - Cancelado`,
      title: 'Pedido Cancelado',
      message: 'Tu pedido ha sido cancelado. Si tienes alguna duda, no dudes en contactarnos.',
      emoji: '❌',
      color: '#DC2626'
    }
  }

  const statusInfo = statusMessages[newStatus] || statusMessages.PENDING

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${statusInfo.subject}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, ${statusInfo.color} 0%, #6366f1 100%); padding: 40px 30px; text-align: center; color: white; }
        .content { padding: 40px 30px; }
        .status-badge { display: inline-block; padding: 12px 20px; background-color: ${statusInfo.color}; color: white; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .order-details { background-color: #f8fafc; padding: 25px; border-radius: 10px; margin: 20px 0; }
        .items-list { margin: 20px 0; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
        .footer { background-color: #1e293b; color: white; padding: 30px; text-align: center; }
        .button { display: inline-block; padding: 15px 30px; background-color: ${statusInfo.color}; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .tracking-info { background-color: #ecfdf5; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${statusInfo.emoji} ${statusInfo.title}</h1>
            <p style="font-size: 18px; margin: 0;">${statusInfo.message}</p>
        </div>
        
        <div class="content">
            <div class="status-badge">
                Estado: ${getStatusLabel(newStatus)}
            </div>
            
            <div class="order-details">
                <h3>Detalles del Pedido</h3>
                <p><strong>Número de pedido:</strong> ${order.orderNumber}</p>
                <p><strong>Fecha:</strong> ${formatDate(order.createdAt)}</p>
                <p><strong>Total:</strong> ${formatCurrency(order.totalAmount)}</p>
                
                ${order.shippingAddress ? `
                <p><strong>Dirección de envío:</strong><br>
                ${order.shippingAddress.fullName}<br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.postalCode} ${order.shippingAddress.city}</p>
                ` : ''}
            </div>
            
            <div class="items-list">
                <h3>Productos</h3>
                ${order.orderItems.map(item => `
                    <div class="item">
                        <span>${item.productName} (x${item.quantity})</span>
                        <span>${formatCurrency(item.unitPrice * item.quantity)}</span>
                    </div>
                `).join('')}
            </div>
            
            ${newStatus === 'SHIPPED' ? `
            <div class="tracking-info">
                <h3>🚚 Información de Envío</h3>
                <p>Tu pedido está en camino. Recibirás información de seguimiento por separado si está disponible.</p>
                <p><strong>Tiempo estimado de entrega:</strong> 2-5 días laborables</p>
            </div>
            ` : ''}
            
            ${newStatus === 'DELIVERED' ? `
            <div class="tracking-info">
                <h3>⭐ ¡Gracias por tu compra!</h3>
                <p>Esperamos que estés satisfecho con tus productos. Si tienes algún problema, no dudes en contactarnos.</p>
                <a href="#" class="button">Dejar una Reseña</a>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 40px 0;">
                <a href="#" class="button">Ver Detalles del Pedido</a>
            </div>
        </div>
        
        <div class="footer">
            <h3>Lovilike</h3>
            <p>Productos personalizados únicos</p>
            <p>Si tienes alguna pregunta, responde a este email o contáctanos:</p>
            <p>📧 soporte@lovilike.es | 📞 +34 900 123 456</p>
            <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
                Este es un email automático, por favor no respondas directamente.
            </p>
        </div>
    </div>
</body>
</html>`

  const textContent = `
${statusInfo.emoji} ${statusInfo.title}

Hola ${order.customerName || 'Cliente'},

${statusInfo.message}

DETALLES DEL PEDIDO
-------------------
Número: ${order.orderNumber}
Estado: ${getStatusLabel(newStatus)}
Fecha: ${formatDate(order.createdAt)}
Total: ${formatCurrency(order.totalAmount)}

PRODUCTOS
---------
${order.orderItems.map(item => 
  `${item.productName} (x${item.quantity}) - ${formatCurrency(item.unitPrice * item.quantity)}`
).join('\n')}

${order.shippingAddress ? `
DIRECCIÓN DE ENVÍO
------------------
${order.shippingAddress.fullName}
${order.shippingAddress.address}
${order.shippingAddress.postalCode} ${order.shippingAddress.city}
` : ''}

${newStatus === 'SHIPPED' ? `
INFORMACIÓN DE ENVÍO
--------------------
Tu pedido está en camino. Tiempo estimado: 2-5 días laborables.
` : ''}

${newStatus === 'DELIVERED' ? `
¡GRACIAS POR TU COMPRA!
----------------------
Esperamos que estés satisfecho con tus productos.
` : ''}

---
Lovilike - Productos personalizados únicos
soporte@lovilike.es | +34 900 123 456

Este es un email automático, por favor no respondas directamente.
`

  return {
    subject: statusInfo.subject,
    htmlContent,
    textContent
  }
}

/**
 * Obtiene la etiqueta legible para un estado
 */
function getStatusLabel(status: OrderStatus): string {
  const labels = {
    PENDING: 'Pendiente',
    PROCESSING: 'En preparación',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado'
  }
  return labels[status] || status
}

/**
 * Envía email de actualización de estado de orden
 */
export async function sendOrderStatusUpdateEmail(
  order: Order, 
  newStatus: OrderStatus,
  previousStatus?: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    // No enviar email para transiciones que no son relevantes para el cliente
    const skipNotification = (
      previousStatus === newStatus ||
      (previousStatus === 'PENDING' && newStatus === 'PROCESSING' && 
       new Date().getTime() - order.createdAt.getTime() < 5 * 60 * 1000) // Menos de 5 minutos
    )

    if (skipNotification) {
      return { success: true }
    }

    const template = generateEmailTemplate(order, newStatus)
    
    // Simular envío de email - aquí integrarías con tu servicio de email real
    // Por ejemplo: SendGrid, Mailgun, Amazon SES, etc.
    
    const emailData = {
      to: order.customerEmail,
      from: 'pedidos@lovilike.es',
      fromName: 'Lovilike - Pedidos',
      subject: template.subject,
      html: template.htmlContent,
      text: template.textContent,
      tags: ['order-update', `status-${newStatus.toLowerCase()}`],
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        newStatus: newStatus,
        previousStatus: previousStatus || 'unknown'
      }
    }

    // IMPLEMENTACIÓN DE EJEMPLO - Reemplazar con tu servicio de email real
    console.log('📧 Sending order status email:', {
      to: emailData.to,
      subject: emailData.subject,
      status: newStatus,
      orderNumber: order.orderNumber
    })

    // Aquí iría la integración real con tu servicio de email:
    /*
    const emailService = new YourEmailService()
    const result = await emailService.send(emailData)
    
    if (!result.success) {
      throw new Error(result.error)
    }
    */

    // Por ahora, simulamos éxito
    await new Promise(resolve => setTimeout(resolve, 100)) // Simular latencia de envío

    return { success: true }

  } catch (error) {
    console.error('Error sending order status email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Envía email de confirmación de pedido (para nuevas órdenes)
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<{ success: boolean; error?: string }> {
  return sendOrderStatusUpdateEmail(order, 'PENDING')
}

/**
 * Verifica si se debe enviar notificación para una transición de estado
 */
export function shouldSendNotification(
  previousStatus: OrderStatus | undefined, 
  newStatus: OrderStatus
): boolean {
  // No notificar si es el mismo estado
  if (previousStatus === newStatus) return false

  // Siempre notificar estos estados importantes
  const alwaysNotify: OrderStatus[] = ['SHIPPED', 'DELIVERED', 'CANCELLED']
  if (alwaysNotify.includes(newStatus)) return true

  // Notificar PROCESSING solo si no viene de PENDING inmediatamente
  if (newStatus === 'PROCESSING') {
    return previousStatus !== 'PENDING'
  }

  return true
}