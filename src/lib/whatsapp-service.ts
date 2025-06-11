// WhatsApp Business Service Integration
// This service handles WhatsApp Business API integration for automated alerts

interface WhatsAppAlert {
  type: 'stock' | 'order' | 'production' | 'payment' | 'emergency' | 'quality' | 'material'
  priority: 'low' | 'medium' | 'high' | 'critical'
  recipient: string
  data: Record<string, any>
  templateId?: string
}

interface WhatsAppConfig {
  phoneNumberId: string
  accessToken: string
  webhookToken: string
  businessAccountId: string
}

class WhatsAppService {
  private config: WhatsAppConfig | null = null
  private isConfigured = false

  constructor() {
    this.loadConfig()
  }

  private loadConfig() {
    this.config = {
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      accessToken: process.env.WHATSAPP_BUSINESS_TOKEN || '',
      webhookToken: process.env.WHATSAPP_WEBHOOK_TOKEN || '',
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || ''
    }
    
    this.isConfigured = !!(this.config.phoneNumberId && this.config.accessToken)
  }

  // Send alert message via WhatsApp
  async sendAlert(alert: WhatsAppAlert): Promise<boolean> {
    if (!this.isConfigured || !this.config) {
      console.warn('WhatsApp not configured, skipping alert:', alert.type)
      return false
    }

    try {
      const message = this.formatAlertMessage(alert)
      const success = await this.sendMessage(alert.recipient, message)
      
      if (success) {
        console.log(`WhatsApp alert sent successfully: ${alert.type} to ${alert.recipient}`)
        // Log message to database for tracking
        await this.logMessage(alert.recipient, message, alert.type, alert.priority)
      }
      
      return success
    } catch (error) {
      console.error('Error sending WhatsApp alert:', error)
      return false
    }
  }

  // Format alert message based on type and template
  private formatAlertMessage(alert: WhatsAppAlert): string {
    const templates = {
      stock: (data: any) => 
        `⚠️ *ALERTA DE STOCK*\n\nEl producto *${data.productName}* tiene stock bajo.\n\n📦 Stock actual: ${data.currentStock}\n⚠️ Stock mínimo: ${data.minStock}\n\n📞 Contacta con proveedores para reposición.`,
      
      order: (data: any) => 
        `🎉 *PEDIDO ${data.status.toUpperCase()}*\n\nEl pedido *${data.orderNumber}* ha sido ${data.status}.\n\n📍 Cliente: ${data.customerName}\n💰 Total: ${data.total}€\n🚚 Estado: ${data.statusDescription}`,
      
      production: (data: any) => 
        `⚠️ *ALERTA DE PRODUCCIÓN*\n\nSe ha detectado un problema en la producción.\n\n🏭 Pedido: ${data.orderNumber}\n🕰️ Problema: ${data.issue}\n📝 Acción requerida: ${data.action}`,
      
      payment: (data: any) => 
        `💳 *RECORDATORIO DE PAGO*\n\nHola ${data.customerName},\n\nTienes un pago pendiente por ${data.amount}€.\n\n📅 Vencimiento: ${data.dueDate}\n📄 Factura: ${data.invoiceNumber}`,
      
      emergency: (data: any) => 
        `🚨 *ALERTA CRÍTICA*\n\nError detectado en el sistema.\n\n🚫 Componente: ${data.component}\n⚠️ Severidad: ${data.severity}\n🕰️ Hora: ${data.timestamp}\n\n🔧 Acción requerida inmediatamente.`,
      
      quality: (data: any) => 
        `❌ *PROBLEMA DE CALIDAD*\n\nDetectado problema en control de calidad.\n\n📦 Producto: ${data.productName}\n🔍 Defecto: ${data.defectType}\n📊 Lote: ${data.batchNumber}\n\nDetener producción y revisar proceso.`,
      
      material: (data: any) => 
        `🧵 *MATERIAL AGOTÁNDOSE*\n\nEl material de producción está por agotarse.\n\n🎨 Material: ${data.materialName}\n📊 Cantidad: ${data.remaining} ${data.unit}\n📅 Duración estimada: ${data.estimatedDays} días`
    }

    const template = templates[alert.type]
    return template ? template(alert.data) : `Alerta: ${alert.type} - ${JSON.stringify(alert.data)}`
  }

  // Send message via WhatsApp Business API
  private async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.config) return false

    try {
      // In production, this would make actual API calls to WhatsApp Business API
      // For demo purposes, we'll simulate the API call
      
      /*
      Real implementation would look like this:
      
      const messagePayload = {
        messaging_product: "whatsapp",
        to: phoneNumber.replace('+', ''),
        type: "text",
        text: {
          body: message
        }
      }

      const response = await fetch(`https://graph.facebook.com/v17.0/${this.config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messagePayload)
      })

      return response.ok
      */

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Simulate 95% success rate
      return Math.random() > 0.05
      
    } catch (error) {
      console.error('WhatsApp API error:', error)
      return false
    }
  }

  // Log message for tracking and analytics
  private async logMessage(recipient: string, message: string, type: string, priority: string) {
    try {
      // In production, save to database
      const logEntry = {
        recipient,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        type,
        priority,
        timestamp: new Date().toISOString(),
        status: 'sent'
      }
      
      console.log('WhatsApp message logged:', logEntry)
      
      // Would typically save to database here:
      // await prisma.whatsappMessage.create({ data: logEntry })
      
    } catch (error) {
      console.error('Error logging WhatsApp message:', error)
    }
  }

  // Convenience methods for different alert types
  async sendStockAlert(productName: string, currentStock: number, minStock: number, recipients: string[]) {
    const alert: WhatsAppAlert = {
      type: 'stock',
      priority: 'high',
      recipient: '', // Will be set for each recipient
      data: { productName, currentStock, minStock }
    }

    const results = await Promise.all(
      recipients.map(recipient => 
        this.sendAlert({ ...alert, recipient })
      )
    )

    return results.some(result => result) // Return true if at least one succeeded
  }

  async sendOrderUpdate(orderNumber: string, customerName: string, total: number, status: string, recipients: string[]) {
    const alert: WhatsAppAlert = {
      type: 'order',
      priority: 'medium',
      recipient: '',
      data: { 
        orderNumber, 
        customerName, 
        total, 
        status,
        statusDescription: this.getStatusDescription(status)
      }
    }

    const results = await Promise.all(
      recipients.map(recipient => 
        this.sendAlert({ ...alert, recipient })
      )
    )

    return results.some(result => result)
  }

  async sendProductionAlert(orderNumber: string, issue: string, action: string, recipients: string[]) {
    const alert: WhatsAppAlert = {
      type: 'production',
      priority: 'high',
      recipient: '',
      data: { orderNumber, issue, action }
    }

    const results = await Promise.all(
      recipients.map(recipient => 
        this.sendAlert({ ...alert, recipient })
      )
    )

    return results.some(result => result)
  }

  async sendEmergencyAlert(component: string, severity: string, recipients: string[]) {
    const alert: WhatsAppAlert = {
      type: 'emergency',
      priority: 'critical',
      recipient: '',
      data: { 
        component, 
        severity, 
        timestamp: new Date().toLocaleString('es-ES')
      }
    }

    const results = await Promise.all(
      recipients.map(recipient => 
        this.sendAlert({ ...alert, recipient })
      )
    )

    return results.some(result => result)
  }

  private getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      'pending': 'Pendiente de procesar',
      'processing': 'En proceso de producción',
      'completed': 'Listo para envío',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    }
    
    return descriptions[status] || status
  }

  // Check if WhatsApp service is properly configured
  isReady(): boolean {
    return this.isConfigured
  }

  // Get configuration status
  getStatus() {
    return {
      configured: this.isConfigured,
      hasPhoneNumber: !!(this.config?.phoneNumberId),
      hasAccessToken: !!(this.config?.accessToken),
      hasWebhookToken: !!(this.config?.webhookToken)
    }
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService()

// Export types for use in other modules
export type { WhatsAppAlert, WhatsAppConfig }