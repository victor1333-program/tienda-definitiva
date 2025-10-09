// WhatsApp Business API Integration
import { z } from 'zod'

export interface WhatsAppConfig {
  phone: string
  businessName: string
  welcomeMessage: string
  availability: {
    enabled: boolean
    schedule: string
    timezone: string
  }
  quickReplies: string[]
  enabled: boolean
  notifications: {
    newOrders: boolean
    lowStock: boolean
    customerMessages: boolean
    paymentIssues: boolean
  }
  businessProfile: {
    description: string
    address: string
    website: string
    email: string
  }
}

export interface WhatsAppMessage {
  to: string
  message: string
  type: 'text' | 'template' | 'image' | 'document'
  templateName?: string
  templateData?: Record<string, string>
  mediaUrl?: string
}

export interface WhatsAppTemplate {
  name: string
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
  language: string
  components: {
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS'
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT'
    text?: string
    buttons?: Array<{
      type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER'
      text: string
      url?: string
      phone_number?: string
    }>
  }[]
}

const messageSchema = z.object({
  to: z.string().min(10),
  message: z.string().min(1),
  type: z.enum(['text', 'template', 'image', 'document']),
  templateName: z.string().optional(),
  templateData: z.record(z.string()).optional(),
  mediaUrl: z.string().url().optional()
})

class WhatsAppService {
  private config: WhatsAppConfig
  private baseURL = 'https://graph.facebook.com/v18.0'
  private accessToken: string | null = null

  constructor(config: WhatsAppConfig) {
    this.config = config
    // En producción, obtener el token de variables de entorno
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || null
  }

  // Formatear número de teléfono
  formatPhoneNumber(phone: string): string {
    // Remover caracteres no numéricos excepto +
    let formatted = phone.replace(/[^\d+]/g, '')
    
    // Si no empieza con +, agregar código de país por defecto (España)
    if (!formatted.startsWith('+')) {
      if (formatted.startsWith('6') || formatted.startsWith('7')) {
        formatted = '+34' + formatted
      } else {
        formatted = '+' + formatted
      }
    }
    
    return formatted
  }

  // Crear enlace de WhatsApp Web
  createWhatsAppLink(to: string, message: string): string {
    const formattedPhone = this.formatPhoneNumber(to)
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${formattedPhone.replace('+', '')}?text=${encodedMessage}`
  }

  // Enviar mensaje usando WhatsApp Business API
  async sendMessage(messageData: WhatsAppMessage): Promise<boolean> {
    try {
      // Validar datos
      const validatedData = messageSchema.parse(messageData)
      
      if (!this.accessToken) {
        console.warn('WhatsApp Business API token not configured, using web link fallback')
        return this.sendViaWebLink(validatedData)
      }

      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(validatedData.to),
        type: validatedData.type,
        ...(validatedData.type === 'text' && {
          text: { body: validatedData.message }
        }),
        ...(validatedData.type === 'template' && {
          template: {
            name: validatedData.templateName,
            language: { code: 'es' },
            components: this.buildTemplateComponents(validatedData.templateData || {})
          }
        })
      }

      const response = await fetch(`${this.baseURL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('📱 WhatsApp message sent:', result.messages?.[0]?.id)
      return true

    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      // Fallback a web link
      return this.sendViaWebLink(messageData)
    }
  }

  // Fallback: abrir WhatsApp Web
  private sendViaWebLink(messageData: WhatsAppMessage): boolean {
    try {
      const link = this.createWhatsAppLink(messageData.to, messageData.message)
      
      if (typeof window !== 'undefined') {
        window.open(link, '_blank')
      } else {
        console.log('WhatsApp link:', link)
      }
      
      return true
    } catch (error) {
      console.error('Error creating WhatsApp web link:', error)
      return false
    }
  }

  // Construir componentes de template
  private buildTemplateComponents(data: Record<string, string>) {
    return Object.entries(data).map(([key, value], index) => ({
      type: 'body',
      parameters: [
        {
          type: 'text',
          text: value
        }
      ]
    }))
  }

  // Obtener templates disponibles
  async getTemplates(): Promise<WhatsAppTemplate[]> {
    try {
      if (!this.accessToken) {
        return this.getDefaultTemplates()
      }

      const response = await fetch(`${this.baseURL}/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Templates API error: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data || []

    } catch (error) {
      console.error('Error fetching WhatsApp templates:', error)
      return this.getDefaultTemplates()
    }
  }

  // Templates por defecto
  private getDefaultTemplates(): WhatsAppTemplate[] {
    return [
      {
        name: 'new_order_confirmation',
        category: 'UTILITY',
        language: 'es',
        components: [
          {
            type: 'BODY',
            text: '¡Hola {{1}}! 🎉\n\nTu pedido #{{2}} ha sido confirmado.\n\nTotal: {{3}}€\nEstado: En preparación\n\n¡Gracias por confiar en Lovilike!'
          }
        ]
      },
      {
        name: 'order_shipped',
        category: 'UTILITY', 
        language: 'es',
        components: [
          {
            type: 'BODY',
            text: '📦 ¡Tu pedido #{{1}} ya está en camino!\n\nNúmero de seguimiento: {{2}}\n\nPuedes trackear tu envío en: {{3}}'
          }
        ]
      },
      {
        name: 'low_stock_alert',
        category: 'UTILITY',
        language: 'es',
        components: [
          {
            type: 'BODY',
            text: '⚠️ ALERTA DE STOCK\n\nProducto: {{1}}\nStock actual: {{2}} unidades\n\nRevisa el inventario urgentemente.'
          }
        ]
      }
    ]
  }

  // Notificaciones automáticas para admin
  async notifyNewOrder(orderData: {
    customerName: string
    orderNumber: string
    total: number
    items: string[]
  }): Promise<boolean> {
    if (!this.config.notifications.newOrders) return false

    const message = `🔔 NUEVO PEDIDO\n\n` +
      `Cliente: ${orderData.customerName}\n` +
      `Pedido: #${orderData.orderNumber}\n` +
      `Total: ${orderData.total}€\n\n` +
      `Productos:\n${orderData.items.map(item => `• ${item}`).join('\n')}\n\n` +
      `¡Revisar en el panel de admin!`

    return this.sendMessage({
      to: this.config.phone,
      message,
      type: 'text'
    })
  }

  async notifyLowStock(productData: {
    name: string
    currentStock: number
    minStock: number
  }): Promise<boolean> {
    if (!this.config.notifications.lowStock) return false

    const message = `⚠️ STOCK BAJO\n\n` +
      `Producto: ${productData.name}\n` +
      `Stock actual: ${productData.currentStock}\n` +
      `Stock mínimo: ${productData.minStock}\n\n` +
      `¡Reponer inventario!`

    return this.sendMessage({
      to: this.config.phone,
      message,
      type: 'text'
    })
  }

  async notifyPaymentIssue(paymentData: {
    orderNumber: string
    customerName: string
    amount: number
    error: string
  }): Promise<boolean> {
    if (!this.config.notifications.paymentIssues) return false

    const message = `❌ ERROR DE PAGO\n\n` +
      `Pedido: #${paymentData.orderNumber}\n` +
      `Cliente: ${paymentData.customerName}\n` +
      `Monto: ${paymentData.amount}€\n` +
      `Error: ${paymentData.error}\n\n` +
      `¡Atender urgentemente!`

    return this.sendMessage({
      to: this.config.phone,
      message,
      type: 'text'
    })
  }

  // Validar configuración de horarios
  isBusinessOpen(): boolean {
    if (!this.config.availability.enabled) return false

    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay()

    // Por defecto: Lunes a Viernes, 9:00 a 18:00
    return day >= 1 && day <= 5 && hour >= 9 && hour < 18
  }

  // Obtener mensaje de bienvenida personalizado
  getWelcomeMessage(customerName?: string): string {
    const baseMessage = this.config.welcomeMessage
    const greeting = customerName ? `¡Hola ${customerName}! 👋` : '¡Hola! 👋'
    
    return `${greeting}\n\n${baseMessage}`
  }

  // Obtener estadísticas de WhatsApp
  async getStats(): Promise<{
    totalMessages: number
    messagesSentToday: number
    templatesUsed: number
    responseRate: number
  }> {
    // En una implementación real, esto vendría de analytics de WhatsApp Business
    return {
      totalMessages: 0,
      messagesSentToday: 0,
      templatesUsed: 0,
      responseRate: 0
    }
  }
}

// Instancia por defecto
const defaultConfig: WhatsAppConfig = {
  phone: '+34612345678',
  businessName: 'Lovilike Personalizados',
  welcomeMessage: '¡Bienvenido a Lovilike! Estamos aquí para ayudarte con tus productos personalizados.',
  availability: {
    enabled: true,
    schedule: 'Lunes a Viernes: 9:00 - 18:00',
    timezone: 'Europe/Madrid'
  },
  quickReplies: [
    '¿Cómo personalizar mi producto?',
    'Información sobre envíos',
    'Consultar mi pedido',
    'Precios y descuentos'
  ],
  enabled: true,
  notifications: {
    newOrders: true,
    lowStock: true,
    customerMessages: true,
    paymentIssues: true
  },
  businessProfile: {
    description: 'Especialistas en productos personalizados de alta calidad',
    address: 'España',
    website: 'https://lovilike.com',
    email: 'info@lovilike.com'
  }
}

export const whatsappService = new WhatsAppService(defaultConfig)

// Funciones de utilidad
export function formatWhatsAppPhone(phone: string): string {
  return whatsappService.formatPhoneNumber(phone)
}

export function createWhatsAppLink(phone: string, message: string): string {
  return whatsappService.createWhatsAppLink(phone, message)
}

export function isValidWhatsAppPhone(phone: string): boolean {
  try {
    const formatted = formatWhatsAppPhone(phone)
    return formatted.length >= 10 && formatted.startsWith('+')
  } catch {
    return false
  }
}