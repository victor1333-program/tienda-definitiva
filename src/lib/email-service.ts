import { db } from './db'
import nodemailer from 'nodemailer'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent?: string
  variables: string[]
  type: 'ORDER_CONFIRMATION' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'WELCOME' | 'PASSWORD_RESET' | 'CUSTOM'
  isActive: boolean
}

export interface EmailConfig {
  smtpHost: string
  smtpPort: number
  smtpSecure: boolean
  smtpUser: string
  smtpPassword: string
  fromEmail: string
  fromName: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private config: EmailConfig | null = null

  async getConfig(): Promise<EmailConfig | null> {
    if (this.config) return this.config

    try {
      // Intentar obtener configuración de la base de datos
      const settings = await db.setting.findMany({
        where: {
          key: {
            in: ['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_password', 'from_email', 'from_name']
          }
        }
      })

      const settingsMap = settings.reduce((acc, setting) => {
        // El campo value es de tipo Json en Prisma
        // Si es un string JSON, parsearlo; si ya es un valor simple, usarlo directamente
        let value = setting.value
        if (typeof value === 'string') {
          try {
            // Intentar parsear si es un JSON string
            value = JSON.parse(value)
          } catch {
            // Si falla el parse, usar el valor tal cual
          }
        }
        acc[setting.key] = String(value)
        return acc
      }, {} as Record<string, string>)

      if (settingsMap.smtp_host) {
        this.config = {
          smtpHost: settingsMap.smtp_host,
          smtpPort: parseInt(settingsMap.smtp_port) || 587,
          smtpSecure: settingsMap.smtp_secure === 'true',
          smtpUser: settingsMap.smtp_user,
          smtpPassword: settingsMap.smtp_password,
          fromEmail: settingsMap.from_email,
          fromName: settingsMap.from_name || 'Lovilike Personalizados'
        }
        return this.config
      }
    } catch (error) {
      console.error('Error getting email config from database:', error)
    }

    // Fallback a variables de entorno
    if (process.env.EMAIL_SERVER_HOST) {
      this.config = {
        smtpHost: process.env.EMAIL_SERVER_HOST,
        smtpPort: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        smtpSecure: process.env.EMAIL_SERVER_PORT === '465',
        smtpUser: process.env.EMAIL_SERVER_USER || '',
        smtpPassword: process.env.EMAIL_SERVER_PASSWORD || '',
        fromEmail: process.env.EMAIL_FROM || 'noreply@lovilike.es',
        fromName: 'Lovilike Personalizados'
      }
      return this.config
    }

    return null
  }

  async getTransporter(): Promise<nodemailer.Transporter | null> {
    if (this.transporter) return this.transporter

    const config = await this.getConfig()
    if (!config) return null

    try {
      this.transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPassword,
        },
        tls: {
          rejectUnauthorized: false
        }
      })

      // Verificar conexión
      await this.transporter.verify()
      console.log('✅ Email transporter configured successfully')
      return this.transporter
    } catch (error) {
      console.error('❌ Error configuring email transporter:', error)
      this.transporter = null
      return null
    }
  }

  async sendEmail(options: {
    to: string
    subject: string
    html: string
    text?: string
    attachments?: any[]
  }): Promise<boolean> {
    try {
      const transporter = await this.getTransporter()
      const config = await this.getConfig()
      
      if (!transporter || !config) {
        console.error('Email transporter or config not available')
        return false
      }

      const result = await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments
      })

      console.log('✅ Email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('❌ Error sending email:', error)
      return false
    }
  }

  async sendTemplateEmail(templateType: string, to: string, variables: Record<string, any>): Promise<boolean> {
    try {
      const template = await this.getTemplate(templateType)
      if (!template || !template.isActive) {
        console.error(`Template ${templateType} not found or inactive`)
        return false
      }

      const { subject, html, text } = this.processTemplate(template, variables)
      
      return await this.sendEmail({
        to,
        subject,
        html,
        text
      })
    } catch (error) {
      console.error('❌ Error sending template email:', error)
      return false
    }
  }

  async getTemplate(type: string): Promise<EmailTemplate | null> {
    try {
      // Intentar obtener de la base de datos (cuando esté implementado)
      // const template = await db.emailTemplate.findFirst({
      //   where: { type: type as any, isActive: true }
      // })
      // if (template) return template

      // Fallback a templates por defecto
      return this.getDefaultTemplate(type)
    } catch (error) {
      console.error('Error getting template:', error)
      return this.getDefaultTemplate(type)
    }
  }

  private getDefaultTemplate(type: string): EmailTemplate | null {
    const templates: Record<string, EmailTemplate> = {
      ORDER_CONFIRMATION: {
        id: 'order_confirmation_default',
        name: 'Confirmación de Pedido',
        subject: '✅ Pedido confirmado #{orderNumber} - Lovilike',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="{{siteUrl}}/Social Logo.png" alt="Lovilike" style="height: 60px;" />
              <h1 style="color: #ea580c; margin: 20px 0;">¡Pedido Confirmado!</h1>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0 0 15px 0; color: #374151;">Detalles del Pedido</h2>
              <p><strong>Número de pedido:</strong> #{orderNumber}</p>
              <p><strong>Fecha:</strong> {{orderDate}}</p>
              <p><strong>Total:</strong> {{orderTotal}}</p>
              <p><strong>Estado:</strong> {{orderStatus}}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #374151;">Productos</h3>
              {{orderItems}}
            </div>
            
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #374151;">Información de Envío</h3>
              <p>{{shippingAddress}}</p>
              <p><strong>Método de envío:</strong> {{shippingMethod}}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="{{siteUrl}}/admin/orders/{{orderId}}" style="background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver Pedido</a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p>Si tienes alguna pregunta, contacta con nosotros en <a href="mailto:info@lovilike.es">info@lovilike.es</a></p>
              <p>Lovilike Personalizados - Tu tienda de productos personalizados</p>
            </div>
          </div>
        `,
        textContent: `
¡Pedido Confirmado!

Número de pedido: #{orderNumber}
Fecha: {{orderDate}}
Total: {{orderTotal}}
Estado: {{orderStatus}}

Productos:
{{orderItemsText}}

Información de Envío:
{{shippingAddress}}
Método de envío: {{shippingMethod}}

Ver pedido: {{siteUrl}}/admin/orders/{{orderId}}

Si tienes alguna pregunta, contacta con nosotros en info@lovilike.es

Lovilike Personalizados - Tu tienda de productos personalizados
        `,
        variables: ['orderNumber', 'orderDate', 'orderTotal', 'orderStatus', 'orderItems', 'orderItemsText', 'shippingAddress', 'shippingMethod', 'orderId', 'siteUrl'],
        type: 'ORDER_CONFIRMATION',
        isActive: true
      },
      ORDER_SHIPPED: {
        id: 'order_shipped_default',
        name: 'Pedido Enviado',
        subject: '📦 Tu pedido #{orderNumber} ha sido enviado - Lovilike',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="{{siteUrl}}/Social Logo.png" alt="Lovilike" style="height: 60px;" />
              <h1 style="color: #ea580c; margin: 20px 0;">¡Tu pedido está en camino!</h1>
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0ea5e9;">
              <h2 style="margin: 0 0 15px 0; color: #0369a1;">Información de Envío</h2>
              <p><strong>Número de pedido:</strong> #{orderNumber}</p>
              <p><strong>Número de seguimiento:</strong> {{trackingNumber}}</p>
              <p><strong>Transportista:</strong> {{carrier}}</p>
              <p><strong>Fecha de envío:</strong> {{shippedDate}}</p>
              <p><strong>Entrega estimada:</strong> {{estimatedDelivery}}</p>
            </div>
            
            <div style="text-align: center; margin-bottom: 20px;">
              <a href="{{trackingUrl}}" style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Seguir Envío</a>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #374151;">Dirección de Entrega</h3>
              <p>{{shippingAddress}}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p>Si tienes alguna pregunta sobre tu envío, contacta con nosotros en <a href="mailto:info@lovilike.es">info@lovilike.es</a></p>
              <p>Lovilike Personalizados - Tu tienda de productos personalizados</p>
            </div>
          </div>
        `,
        textContent: `
¡Tu pedido está en camino!

Número de pedido: #{orderNumber}
Número de seguimiento: {{trackingNumber}}
Transportista: {{carrier}}
Fecha de envío: {{shippedDate}}
Entrega estimada: {{estimatedDelivery}}

Seguir envío: {{trackingUrl}}

Dirección de Entrega:
{{shippingAddress}}

Si tienes alguna pregunta sobre tu envío, contacta con nosotros en info@lovilike.es

Lovilike Personalizados - Tu tienda de productos personalizados
        `,
        variables: ['orderNumber', 'trackingNumber', 'carrier', 'shippedDate', 'estimatedDelivery', 'trackingUrl', 'shippingAddress', 'siteUrl'],
        type: 'ORDER_SHIPPED',
        isActive: true
      },
      WELCOME: {
        id: 'welcome_default',
        name: 'Bienvenida',
        subject: '🎉 ¡Bienvenido a Lovilike Personalizados!',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="{{siteUrl}}/Social Logo.png" alt="Lovilike" style="height: 60px;" />
              <h1 style="color: #ea580c; margin: 20px 0;">¡Bienvenido, {{customerName}}!</h1>
            </div>
            
            <div style="background: #fef3e2; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ea580c;">
              <p style="margin: 0; font-size: 16px; color: #9a3412;">
                ¡Gracias por unirte a nuestra comunidad! Estamos emocionados de ayudarte a crear productos únicos y personalizados.
              </p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #374151;">¿Qué puedes hacer ahora?</h3>
              <ul style="color: #6b7280;">
                <li>Explorar nuestro catálogo de productos personalizables</li>
                <li>Crear diseños únicos con nuestro editor</li>
                <li>Realizar pedidos fácil y rápidamente</li>
                <li>Seguir el estado de tus pedidos</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-bottom: 20px;">
              <a href="{{siteUrl}}" style="background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 10px;">Explorar Productos</a>
              <a href="{{siteUrl}}/mi-cuenta" style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Mi Cuenta</a>
            </div>
            
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #374151;">Descuento de Bienvenida</h3>
              <p>Como nuevo cliente, tienes un <strong>10% de descuento</strong> en tu primera compra.</p>
              <p style="text-align: center; margin: 15px 0;">
                <strong style="background: #ea580c; color: white; padding: 8px 16px; border-radius: 4px; font-size: 18px;">BIENVENIDO10</strong>
              </p>
              <p style="font-size: 14px; color: #6b7280;">Válido hasta {{discountExpiry}}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p>Si tienes alguna pregunta, estamos aquí para ayudarte en <a href="mailto:info@lovilike.es">info@lovilike.es</a></p>
              <p>Lovilike Personalizados - Tu tienda de productos personalizados</p>
            </div>
          </div>
        `,
        textContent: `
¡Bienvenido, {{customerName}}!

¡Gracias por unirte a nuestra comunidad! Estamos emocionados de ayudarte a crear productos únicos y personalizados.

¿Qué puedes hacer ahora?
- Explorar nuestro catálogo de productos personalizables
- Crear diseños únicos con nuestro editor
- Realizar pedidos fácil y rápidamente
- Seguir el estado de tus pedidos

Explorar Productos: {{siteUrl}}
Mi Cuenta: {{siteUrl}}/mi-cuenta

Descuento de Bienvenida:
Como nuevo cliente, tienes un 10% de descuento en tu primera compra.
Código: BIENVENIDO10
Válido hasta {{discountExpiry}}

Si tienes alguna pregunta, estamos aquí para ayudarte en info@lovilike.es

Lovilike Personalizados - Tu tienda de productos personalizados
        `,
        variables: ['customerName', 'siteUrl', 'discountExpiry'],
        type: 'WELCOME',
        isActive: true
      }
    }

    return templates[type] || null
  }

  private processTemplate(template: EmailTemplate, variables: Record<string, any>): { subject: string, html: string, text?: string } {
    let subject = template.subject
    let html = template.htmlContent
    let text = template.textContent

    // Reemplazar variables en el subject
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      subject = subject.replace(regex, String(value))
      html = html.replace(regex, String(value))
      if (text) {
        text = text.replace(regex, String(value))
      }
    })

    return { subject, html, text }
  }

  async testConnection(): Promise<{ success: boolean, message: string }> {
    try {
      const transporter = await this.getTransporter()
      if (!transporter) {
        return { success: false, message: 'No se pudo configurar el transportador de email' }
      }

      await transporter.verify()
      return { success: true, message: 'Conexión SMTP exitosa' }
    } catch (error: any) {
      return { success: false, message: `Error de conexión: ${error.message}` }
    }
  }

  // Reset transporter para recargar configuración
  resetTransporter(): void {
    this.transporter = null
    this.config = null
  }
}

export const emailService = new EmailService()

// Funciones de conveniencia para compatibilidad con el código existente
export async function sendOrderConfirmationEmail(orderData: any) {
  return await emailService.sendTemplateEmail('ORDER_CONFIRMATION', orderData.customerEmail, {
    orderNumber: orderData.orderNumber,
    orderDate: new Date(orderData.createdAt).toLocaleDateString('es-ES'),
    orderTotal: `€${orderData.totalAmount.toFixed(2)}`,
    orderStatus: orderData.status,
    orderItems: orderData.orderItems.map((item: any) => `
      <div style="padding: 15px; border-bottom: 1px solid #eee;">
        <div style="display: flex; justify-content: space-between;">
          <div>
            <strong>${item.product.name}</strong>
            ${item.variant ? `<br><small>SKU: ${item.variant.sku} | ${item.variant.size} | ${item.variant.color}</small>` : ''}
            <br><small>Cantidad: ${item.quantity}</small>
          </div>
          <div style="text-align: right;">
            <strong>€${item.totalPrice.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    `).join(''),
    orderItemsText: orderData.orderItems.map((item: any) => 
      `${item.product.name} - Cantidad: ${item.quantity} - €${item.totalPrice.toFixed(2)}`
    ).join('\n'),
    shippingAddress: typeof orderData.shippingAddress === 'object' 
      ? `${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state}, ${orderData.shippingAddress.postalCode}`
      : orderData.shippingAddress || 'Dirección no especificada',
    shippingMethod: orderData.shippingMethod,
    orderId: orderData.id,
    siteUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
  })
}

export async function sendOrderStatusUpdateEmail(orderData: any) {
  return await emailService.sendTemplateEmail('ORDER_SHIPPED', orderData.customerEmail, {
    orderNumber: orderData.orderNumber,
    trackingNumber: orderData.trackingNumber || 'No disponible',
    carrier: orderData.carrier || 'Correos',
    shippedDate: new Date().toLocaleDateString('es-ES'),
    estimatedDelivery: orderData.estimatedDelivery || 'En 2-3 días laborables',
    trackingUrl: orderData.trackingUrl || '#',
    shippingAddress: typeof orderData.shippingAddress === 'object' 
      ? `${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state}, ${orderData.shippingAddress.postalCode}`
      : orderData.shippingAddress || 'Dirección no especificada',
    siteUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
  })
}

export async function sendWelcomeEmail(userData: any) {
  const discountExpiry = new Date()
  discountExpiry.setDate(discountExpiry.getDate() + 30)
  
  return await emailService.sendTemplateEmail('WELCOME', userData.email, {
    customerName: userData.name || 'Usuario',
    siteUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    discountExpiry: discountExpiry.toLocaleDateString('es-ES')
  })
}

export async function sendPasswordResetEmail(userData: any, resetToken: string) {
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
  
  return await emailService.sendEmail({
    to: userData.email,
    subject: 'Restablece tu Contraseña - Lovilike',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ea580c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1>Restablece tu Contraseña</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Hola ${userData.name || 'Usuario'},</p>
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Lovilike.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          
          <p>Este enlace expirará en 1 hora por seguridad.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; margin-top: 20px; border-radius: 5px;">
            <p><strong>Por tu seguridad:</strong></p>
            <ul>
              <li>Nunca compartas este enlace con nadie</li>
              <li>Si tienes dudas, contacta con nosotros directamente</li>
            </ul>
          </div>
        </div>
      </div>
    `
  })
}

export async function sendEmailVerification(userData: { to: string, name: string, verificationUrl: string }) {
  return await emailService.sendEmail({
    to: userData.to,
    subject: 'Verifica tu Email - Lovilike Personalizados',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">¡Verifica tu Email!</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Hola <strong>${userData.name}</strong>,</p>
          <p>¡Bienvenido a Lovilike Personalizados! Para completar tu registro y activar tu cuenta, necesitamos verificar tu dirección de email.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${userData.verificationUrl}" style="background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              ✅ Verificar Email
            </a>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>⏰ Importante:</strong> Este enlace expira en 24 horas.</p>
          </div>
          
          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0369a1;">¿Qué puedes hacer después de verificar?</h3>
            <ul style="color: #0c4a6e; margin-bottom: 0;">
              <li>🛍️ Explorar nuestro catálogo de productos personalizables</li>
              <li>🎨 Crear diseños únicos con nuestro editor</li>
              <li>📦 Realizar y seguir tus pedidos</li>
              <li>🎁 Acceder a ofertas exclusivas</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">Si no creaste esta cuenta, puedes ignorar este email de forma segura.</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">¿Tienes problemas con el enlace?</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #9ca3af;">Copia y pega este enlace en tu navegador:</p>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #9ca3af; word-break: break-all;">${userData.verificationUrl}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>Este email fue enviado por Lovilike Personalizados</p>
          <p>Si necesitas ayuda, contáctanos en <a href="mailto:soporte@lovilike.es" style="color: #ea580c;">soporte@lovilike.es</a></p>
        </div>
      </div>
    `,
    text: `
¡Verifica tu Email - Lovilike Personalizados!

Hola ${userData.name},

¡Bienvenido a Lovilike Personalizados! Para completar tu registro y activar tu cuenta, necesitamos verificar tu dirección de email.

Haz clic en el siguiente enlace para verificar tu email:
${userData.verificationUrl}

⏰ Importante: Este enlace expira en 24 horas.

¿Qué puedes hacer después de verificar?
- Explorar nuestro catálogo de productos personalizables
- Crear diseños únicos con nuestro editor
- Realizar y seguir tus pedidos
- Acceder a ofertas exclusivas

Si no creaste esta cuenta, puedes ignorar este email de forma segura.

¿Tienes problemas con el enlace? Contacta con nosotros en soporte@lovilike.es

Lovilike Personalizados - Tu tienda de productos personalizados
    `
  })
}

// Verificar configuración de email
export async function verifyEmailConfig() {
  return await emailService.testConnection()
}

// Función genérica para enviar emails
export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  return await emailService.sendEmail({ to, subject, html, text })
}