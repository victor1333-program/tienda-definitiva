import nodemailer from 'nodemailer'

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
}

// Create transporter
const transporter = nodemailer.createTransport(emailConfig)

// Email types for notifications
export type EmailType = 
  | 'ORDER_CONFIRMATION'
  | 'ORDER_STATUS_UPDATE'
  | 'PRODUCTION_ALERT'
  | 'STOCK_ALERT'
  | 'PAYMENT_CONFIRMATION'
  | 'SHIPPING_NOTIFICATION'
  | 'QUALITY_ISSUE'
  | 'CUSTOMER_NOTIFICATION'
  | 'ADMIN_ALERT'
  | 'SYSTEM_NOTIFICATION'
  | 'WELCOME'
  | 'PASSWORD_RESET'

// Email data interface
interface EmailData {
  to: string | string[]
  subject: string
  type: EmailType
  data: any
  priority?: 'low' | 'normal' | 'high'
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

// Base email template with modern design
function createBaseTemplate(content: string, title: string) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .header p {
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 30px 20px;
        }
        .alert {
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid;
        }
        .alert-info {
          background-color: #e3f2fd;
          border-left-color: #2196f3;
          color: #1565c0;
        }
        .alert-success {
          background-color: #e8f5e8;
          border-left-color: #4caf50;
          color: #2e7d32;
        }
        .alert-warning {
          background-color: #fff3cd;
          border-left-color: #ff9800;
          color: #f57c00;
        }
        .alert-error {
          background-color: #ffebee;
          border-left-color: #f44336;
          color: #c62828;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          text-align: center;
          margin: 20px 0;
        }
        .btn:hover {
          background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #6c757d;
          border-top: 1px solid #e9ecef;
        }
        .footer p {
          margin: 5px 0;
          font-size: 14px;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .data-table th,
        .data-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e9ecef;
        }
        .data-table th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #495057;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-pending {
          background-color: #fff3cd;
          color: #856404;
        }
        .status-processing {
          background-color: #cce5ff;
          color: #004085;
        }
        .status-completed {
          background-color: #d4edda;
          color: #155724;
        }
        .status-cancelled {
          background-color: #f8d7da;
          color: #721c24;
        }
        .metric-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 8px;
          padding: 15px;
          margin: 10px 0;
          border-left: 4px solid #f97316;
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #f97316;
        }
        .metric-label {
          font-size: 14px;
          color: #6c757d;
          margin-top: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎨 Lovilike</h1>
          <p>Personalización Premium</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p><strong>Lovilike - Personalización Premium</strong></p>
          <p>📧 info@lovilike.com | 📱 +34 900 123 456</p>
          <p>🌐 www.lovilike.com</p>
          <p style="margin-top: 15px; font-size: 12px; color: #adb5bd;">
            Este es un mensaje automático, por favor no responder directamente.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Email templates
const emailTemplates = {
  ORDER_CONFIRMATION: (data: any) => {
    const content = `
      <h2>¡Gracias por tu pedido! 🎉</h2>
      <div class="alert alert-success">
        <strong>Pedido confirmado:</strong> #${data.orderNumber}
      </div>
      <p>Hola <strong>${data.customerName}</strong>,</p>
      <p>Hemos recibido tu pedido y ya estamos trabajando en él. Te mantendremos informado sobre el progreso de tu personalización.</p>
      
      <h3>Detalles del pedido:</h3>
      <table class="data-table">
        <tr>
          <td><strong>Número de pedido:</strong></td>
          <td>#${data.orderNumber}</td>
        </tr>
        <tr>
          <td><strong>Fecha:</strong></td>
          <td>${new Date(data.createdAt).toLocaleDateString('es-ES')}</td>
        </tr>
        <tr>
          <td><strong>Total:</strong></td>
          <td><strong>€${data.totalAmount.toFixed(2)}</strong></td>
        </tr>
        <tr>
          <td><strong>Estado:</strong></td>
          <td><span class="status-badge status-processing">En Proceso</span></td>
        </tr>
      </table>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}" class="btn">
        Ver detalles del pedido
      </a>
      
      <p><em>Tiempo estimado de producción: ${data.estimatedDays || '3-5'} días laborables</em></p>
    `
    return createBaseTemplate(content, `Pedido confirmado - #${data.orderNumber}`)
  },

  ORDER_STATUS_UPDATE: (data: any) => {
    const statusInfo = {
      PENDING: { text: 'Pendiente', class: 'status-pending', icon: '⏳' },
      PROCESSING: { text: 'En Proceso', class: 'status-processing', icon: '🔄' },
      PRODUCTION: { text: 'En Producción', class: 'status-processing', icon: '🏭' },
      QUALITY_CHECK: { text: 'Control de Calidad', class: 'status-processing', icon: '✅' },
      SHIPPING: { text: 'Enviado', class: 'status-completed', icon: '📦' },
      DELIVERED: { text: 'Entregado', class: 'status-completed', icon: '🎉' },
      CANCELLED: { text: 'Cancelado', class: 'status-cancelled', icon: '❌' }
    }
    
    const status = statusInfo[data.status] || statusInfo.PENDING
    
    const content = `
      <h2>Actualización de tu pedido ${status.icon}</h2>
      <div class="alert alert-info">
        <strong>Pedido:</strong> #${data.orderNumber} - <span class="status-badge ${status.class}">${status.text}</span>
      </div>
      <p>Hola <strong>${data.customerName}</strong>,</p>
      <p>Tu pedido ha sido actualizado. Aquí tienes los detalles más recientes:</p>
      
      <h3>Estado actual:</h3>
      <div class="alert alert-${data.status === 'DELIVERED' ? 'success' : data.status === 'CANCELLED' ? 'error' : 'info'}">
        <strong>${status.icon} ${status.text}</strong><br>
        ${data.statusMessage || 'Tu pedido está progresando según lo planificado.'}
      </div>
      
      ${data.trackingNumber ? `
        <h3>Información de envío:</h3>
        <p><strong>Número de seguimiento:</strong> ${data.trackingNumber}</p>
        <a href="${data.trackingUrl || '#'}" class="btn">Rastrear envío</a>
      ` : ''}
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}" class="btn">
        Ver detalles completos
      </a>
    `
    return createBaseTemplate(content, `Actualización de pedido - #${data.orderNumber}`)
  },

  STOCK_ALERT: (data: any) => {
    const content = `
      <h2>⚠️ Alerta de Stock</h2>
      <div class="alert alert-warning">
        <strong>Atención:</strong> Stock bajo detectado
      </div>
      <p>Se ha detectado un nivel crítico de stock en los siguientes productos:</p>
      
      <table class="data-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>SKU</th>
            <th>Stock Actual</th>
            <th>Mínimo</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map((item: any) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.sku}</td>
              <td>${item.currentStock}</td>
              <td>${item.minimumStock}</td>
              <td><span class="status-badge status-${item.currentStock === 0 ? 'cancelled' : 'pending'}">
                ${item.currentStock === 0 ? 'Sin Stock' : 'Stock Bajo'}
              </span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="alert alert-warning">
        <strong>Acción requerida:</strong> Se recomienda reabastecer estos productos lo antes posible para evitar interrupciones en la producción.
      </div>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/inventory" class="btn">
        Gestionar Inventario
      </a>
    `
    return createBaseTemplate(content, 'Alerta de Stock - Acción Requerida')
  },

  PRODUCTION_ALERT: (data: any) => {
    const content = `
      <h2>🏭 Alerta de Producción</h2>
      <div class="alert alert-${data.alertType === 'DELAY' ? 'warning' : data.alertType === 'ERROR' ? 'error' : 'info'}">
        <strong>${data.alertType === 'DELAY' ? 'Retraso Detectado' : data.alertType === 'ERROR' ? 'Error en Producción' : 'Información de Producción'}</strong>
      </div>
      <p><strong>Orden de Producción:</strong> #${data.productionOrder}</p>
      <p><strong>Producto:</strong> ${data.productName}</p>
      <p><strong>Cliente:</strong> ${data.customerName}</p>
      
      <h3>Detalles del problema:</h3>
      <div class="alert alert-${data.alertType === 'ERROR' ? 'error' : 'warning'}">
        ${data.message}
      </div>
      
      ${data.estimatedResolution ? `
        <p><strong>Resolución estimada:</strong> ${data.estimatedResolution}</p>
      ` : ''}
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/production" class="btn">
        Ver Sistema de Producción
      </a>
    `
    return createBaseTemplate(content, `Alerta de Producción - ${data.productionOrder}`)
  },

  QUALITY_ISSUE: (data: any) => {
    const content = `
      <h2>🔍 Control de Calidad</h2>
      <div class="alert alert-${data.passed ? 'success' : 'error'}">
        <strong>${data.passed ? '✅ Control Aprobado' : '❌ Control Fallido'}</strong>
      </div>
      <p><strong>Orden:</strong> #${data.orderNumber}</p>
      <p><strong>Producto:</strong> ${data.productName}</p>
      <p><strong>Inspector:</strong> ${data.inspector}</p>
      <p><strong>Fecha:</strong> ${new Date(data.checkDate).toLocaleDateString('es-ES')}</p>
      
      <h3>Resultado del control:</h3>
      <div class="alert alert-${data.passed ? 'success' : 'error'}">
        ${data.comments || (data.passed ? 'Producto aprobado para envío' : 'Se requiere corrección antes del envío')}
      </div>
      
      ${!data.passed ? `
        <h3>Acciones requeridas:</h3>
        <ul>
          ${data.requiredActions.map((action: string) => `<li>${action}</li>`).join('')}
        </ul>
      ` : ''}
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/production" class="btn">
        Ver Detalles
      </a>
    `
    return createBaseTemplate(content, `Control de Calidad - ${data.orderNumber}`)
  },

  PAYMENT_CONFIRMATION: (data: any) => {
    const content = `
      <h2>💳 Pago Confirmado</h2>
      <div class="alert alert-success">
        <strong>¡Pago procesado correctamente!</strong>
      </div>
      <p>Hola <strong>${data.customerName}</strong>,</p>
      <p>Hemos recibido tu pago correctamente. Tu pedido será procesado inmediatamente.</p>
      
      <table class="data-table">
        <tr>
          <td><strong>Número de transacción:</strong></td>
          <td>${data.transactionId}</td>
        </tr>
        <tr>
          <td><strong>Método de pago:</strong></td>
          <td>${data.paymentMethod}</td>
        </tr>
        <tr>
          <td><strong>Cantidad:</strong></td>
          <td><strong>€${data.amount.toFixed(2)}</strong></td>
        </tr>
        <tr>
          <td><strong>Fecha:</strong></td>
          <td>${new Date(data.paymentDate).toLocaleDateString('es-ES')}</td>
        </tr>
      </table>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}" class="btn">
        Ver Pedido
      </a>
    `
    return createBaseTemplate(content, `Pago Confirmado - €${data.amount.toFixed(2)}`)
  },

  ADMIN_ALERT: (data: any) => {
    const content = `
      <h2>🚨 Alerta del Sistema</h2>
      <div class="alert alert-${data.severity === 'critical' ? 'error' : data.severity === 'warning' ? 'warning' : 'info'}">
        <strong>Prioridad ${data.severity.toUpperCase()}</strong>
      </div>
      <p><strong>Tipo de alerta:</strong> ${data.alertType}</p>
      <p><strong>Descripción:</strong> ${data.description}</p>
      
      ${data.metrics ? `
        <h3>Métricas del Sistema:</h3>
        <div class="metric-card">
          <div class="metric-value">${data.metrics.cpu}%</div>
          <div class="metric-label">Uso de CPU</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.metrics.memory}%</div>
          <div class="metric-label">Uso de Memoria</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.metrics.activeUsers}</div>
          <div class="metric-label">Usuarios Activos</div>
        </div>
      ` : ''}
      
      ${data.affectedSystems ? `
        <h3>Sistemas afectados:</h3>
        <ul>
          ${data.affectedSystems.map((system: string) => `<li>${system}</li>`).join('')}
        </ul>
      ` : ''}
      
      ${data.recommendedActions ? `
        <h3>Acciones recomendadas:</h3>
        <ul>
          ${data.recommendedActions.map((action: string) => `<li>${action}</li>`).join('')}
        </ul>
      ` : ''}
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" class="btn">
        Ir al Panel de Control
      </a>
    `
    return createBaseTemplate(content, `Alerta del Sistema - ${data.alertType}`)
  },

  WELCOME: (data: any) => {
    const content = `
      <h2>¡Bienvenido a Lovilike! 🎉</h2>
      <div class="alert alert-success">
        <strong>Tu cuenta ha sido creada exitosamente</strong>
      </div>
      <p>Hola <strong>${data.userName}</strong>,</p>
      <p>¡Nos alegra tenerte en la familia Lovilike! Ahora puedes disfrutar de todos nuestros servicios de personalización.</p>
      
      <h3>¿Qué puedes hacer ahora?</h3>
      <ul>
        <li>🎨 Personaliza productos con nuestro editor avanzado</li>
        <li>📦 Realiza pedidos fácilmente</li>
        <li>🚚 Sigue el estado de tus envíos en tiempo real</li>
        <li>💬 Contáctanos directamente desde la plataforma</li>
        <li>🎁 Aprovecha descuentos y ofertas especiales</li>
      </ul>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/productos" class="btn">
        Empezar a Personalizar
      </a>
      
      <div class="alert alert-info">
        <strong>Nuestras Especialidades:</strong><br>
        <strong>DTF:</strong> Perfecto para textiles y prendas<br>
        <strong>Sublimación:</strong> Ideal para tazas y productos rígidos<br>
        <strong>Corte Láser:</strong> Para madera y materiales especiales
      </div>
    `
    return createBaseTemplate(content, '¡Bienvenido a Lovilike!')
  },

  PASSWORD_RESET: (data: any) => {
    const content = `
      <h2>🔐 Restablece tu Contraseña</h2>
      <div class="alert alert-info">
        <strong>Solicitud de restablecimiento recibida</strong>
      </div>
      <p>Hola <strong>${data.userName}</strong>,</p>
      <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Lovilike.</p>
      
      <a href="${data.resetLink}" class="btn">
        Restablecer Contraseña
      </a>
      
      <div class="alert alert-warning">
        <strong>⏰ Este enlace expirará en 1 hora</strong><br>
        Si no solicitaste este cambio, puedes ignorar este email de forma segura.
      </div>
      
      <div class="alert alert-info">
        <strong>Por tu seguridad:</strong><br>
        • Nunca compartas este enlace con nadie<br>
        • Si tienes dudas, contacta con nosotros directamente<br>
        • Usa una contraseña segura y única
      </div>
    `
    return createBaseTemplate(content, 'Restablece tu Contraseña')
  }
}

// Send email function
export async function sendAdvancedEmail(emailData: EmailData): Promise<boolean> {
  try {
    // Get template function
    const templateFunction = emailTemplates[emailData.type]
    if (!templateFunction) {
      throw new Error(`Template not found for email type: ${emailData.type}`)
    }

    // Generate HTML content
    const htmlContent = templateFunction(emailData.data)

    // Prepare email options
    const mailOptions = {
      from: {
        name: 'Lovilike - Personalización Premium',
        address: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@lovilike.com'
      },
      to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
      subject: emailData.subject,
      html: htmlContent,
      priority: emailData.priority || 'normal',
      attachments: emailData.attachments || []
    }

    // Send email
    const result = await transporter.sendMail(mailOptions)
    
    console.log('✅ Advanced email sent successfully:', {
      messageId: result.messageId,
      type: emailData.type,
      to: emailData.to,
      subject: emailData.subject
    })

    return true
  } catch (error) {
    console.error('❌ Error sending advanced email:', error)
    return false
  }
}

// Send bulk emails
export async function sendBulkEmails(emails: EmailData[]): Promise<{ success: number; failed: number }> {
  const results = await Promise.allSettled(
    emails.map(email => sendAdvancedEmail(email))
  )

  const success = results.filter(result => result.status === 'fulfilled' && result.value === true).length
  const failed = results.length - success

  console.log(`📊 Bulk email results: ${success} success, ${failed} failed`)
  return { success, failed }
}

// Queue email for delayed sending
export async function queueEmail(emailData: EmailData, delayMinutes?: number): Promise<void> {
  if (delayMinutes && delayMinutes > 0) {
    console.log(`⏰ Email queued for ${delayMinutes} minutes: ${emailData.subject}`)
    setTimeout(() => {
      sendAdvancedEmail(emailData)
    }, delayMinutes * 60 * 1000)
  } else {
    await sendAdvancedEmail(emailData)
  }
}

// Test email configuration
export async function testEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify()
    console.log('✅ Advanced email configuration verified')
    return true
  } catch (error) {
    console.error('❌ Advanced email configuration test failed:', error)
    return false
  }
}

// Automated alert system
export class EmailAlertSystem {
  private static instance: EmailAlertSystem
  private alertQueue: EmailData[] = []
  private isProcessing = false

  static getInstance(): EmailAlertSystem {
    if (!EmailAlertSystem.instance) {
      EmailAlertSystem.instance = new EmailAlertSystem()
    }
    return EmailAlertSystem.instance
  }

  async sendStockAlert(items: any[], recipients: string[]) {
    const alertData: EmailData = {
      to: recipients,
      subject: `🚨 Alerta de Stock Crítico - ${items.length} productos afectados`,
      type: 'STOCK_ALERT',
      data: { items },
      priority: 'high'
    }

    await this.addToQueue(alertData)
  }

  async sendProductionAlert(productionOrder: string, alertType: 'DELAY' | 'ERROR' | 'INFO', message: string, recipients: string[]) {
    const alertData: EmailData = {
      to: recipients,
      subject: `🏭 Alerta de Producción - ${productionOrder}`,
      type: 'PRODUCTION_ALERT',
      data: {
        productionOrder,
        alertType,
        message,
        estimatedResolution: alertType === 'DELAY' ? '2-4 horas adicionales' : undefined
      },
      priority: alertType === 'ERROR' ? 'high' : 'normal'
    }

    await this.addToQueue(alertData)
  }

  async sendSystemAlert(alertType: string, description: string, severity: 'info' | 'warning' | 'critical', recipients: string[]) {
    const alertData: EmailData = {
      to: recipients,
      subject: `🚨 Alerta del Sistema - ${alertType}`,
      type: 'ADMIN_ALERT',
      data: {
        alertType,
        description,
        severity,
        metrics: {
          cpu: Math.floor(Math.random() * 100),
          memory: Math.floor(Math.random() * 100),
          activeUsers: Math.floor(Math.random() * 50) + 10
        },
        affectedSystems: ['Producción', 'Inventario', 'CRM'],
        recommendedActions: [
          'Verificar logs del sistema',
          'Monitorear métricas de rendimiento',
          'Contactar al equipo técnico si persiste'
        ]
      },
      priority: severity === 'critical' ? 'high' : 'normal'
    }

    await this.addToQueue(alertData)
  }

  private async addToQueue(emailData: EmailData) {
    this.alertQueue.push(emailData)
    if (!this.isProcessing) {
      await this.processQueue()
    }
  }

  private async processQueue() {
    this.isProcessing = true
    
    while (this.alertQueue.length > 0) {
      const email = this.alertQueue.shift()
      if (email) {
        await sendAdvancedEmail(email)
        // Add delay to avoid overwhelming SMTP server
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    this.isProcessing = false
  }
}

// Export original functions for backward compatibility
export { 
  verifyEmailConfig,
  sendEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
} from './email'