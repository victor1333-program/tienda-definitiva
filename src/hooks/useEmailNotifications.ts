import { useCallback } from 'react'
import { sendAdvancedEmail, EmailAlertSystem } from '@/lib/email-advanced'
import { toast } from 'react-hot-toast'

export interface NotificationEvent {
  type: 'ORDER_CREATED' | 'ORDER_STATUS_CHANGED' | 'STOCK_LOW' | 'PRODUCTION_ISSUE' | 'PAYMENT_RECEIVED'
  data: any
}

export function useEmailNotifications() {
  const alertSystem = EmailAlertSystem.getInstance()

  const sendOrderConfirmation = useCallback(async (orderData: any) => {
    try {
      await sendAdvancedEmail({
        to: orderData.customerEmail,
        subject: `¡Pedido confirmado! #${orderData.orderNumber} - Lovilike`,
        type: 'ORDER_CONFIRMATION',
        data: {
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName,
          totalAmount: orderData.totalAmount,
          createdAt: orderData.createdAt,
          estimatedDays: orderData.estimatedDays || 3
        },
        priority: 'normal'
      })
      toast.success('Email de confirmación enviado')
    } catch (error) {
      console.error('Error sending order confirmation:', error)
      toast.error('Error al enviar confirmación por email')
    }
  }, [])

  const sendOrderStatusUpdate = useCallback(async (orderData: any) => {
    try {
      await sendAdvancedEmail({
        to: orderData.customerEmail,
        subject: `Actualización de pedido #${orderData.orderNumber} - Lovilike`,
        type: 'ORDER_STATUS_UPDATE',
        data: {
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName,
          status: orderData.status,
          statusMessage: orderData.statusMessage,
          trackingNumber: orderData.trackingNumber,
          trackingUrl: orderData.trackingUrl
        },
        priority: 'normal'
      })
      toast.success('Actualización de estado enviada')
    } catch (error) {
      console.error('Error sending status update:', error)
      toast.error('Error al enviar actualización')
    }
  }, [])

  const sendPaymentConfirmation = useCallback(async (paymentData: any) => {
    try {
      await sendAdvancedEmail({
        to: paymentData.customerEmail,
        subject: `Pago confirmado - €${paymentData.amount.toFixed(2)} - Lovilike`,
        type: 'PAYMENT_CONFIRMATION',
        data: {
          customerName: paymentData.customerName,
          transactionId: paymentData.transactionId,
          paymentMethod: paymentData.paymentMethod,
          amount: paymentData.amount,
          paymentDate: paymentData.paymentDate,
          orderNumber: paymentData.orderNumber
        },
        priority: 'normal'
      })
      toast.success('Confirmación de pago enviada')
    } catch (error) {
      console.error('Error sending payment confirmation:', error)
      toast.error('Error al enviar confirmación de pago')
    }
  }, [])

  const sendWelcomeEmail = useCallback(async (userData: any) => {
    try {
      await sendAdvancedEmail({
        to: userData.email,
        subject: '¡Bienvenido a Lovilike! 🎨',
        type: 'WELCOME',
        data: {
          userName: userData.name
        },
        priority: 'normal'
      })
      toast.success('Email de bienvenida enviado')
    } catch (error) {
      console.error('Error sending welcome email:', error)
      toast.error('Error al enviar email de bienvenida')
    }
  }, [])

  const sendPasswordResetEmail = useCallback(async (userData: any, resetToken: string) => {
    try {
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`
      
      await sendAdvancedEmail({
        to: userData.email,
        subject: 'Restablece tu contraseña - Lovilike',
        type: 'PASSWORD_RESET',
        data: {
          userName: userData.name,
          resetLink
        },
        priority: 'high'
      })
      toast.success('Email de recuperación enviado')
    } catch (error) {
      console.error('Error sending password reset:', error)
      toast.error('Error al enviar email de recuperación')
    }
  }, [])

  const sendStockAlert = useCallback(async (items: any[]) => {
    try {
      const adminEmails = ['admin@lovilike.com', 'inventory@lovilike.com']
      await alertSystem.sendStockAlert(items, adminEmails)
      toast.success(`Alerta de stock enviada para ${items.length} productos`)
    } catch (error) {
      console.error('Error sending stock alert:', error)
      toast.error('Error al enviar alerta de stock')
    }
  }, [alertSystem])

  const sendProductionAlert = useCallback(async (productionOrder: string, alertType: 'DELAY' | 'ERROR' | 'INFO', message: string) => {
    try {
      const adminEmails = ['admin@lovilike.com', 'production@lovilike.com']
      await alertSystem.sendProductionAlert(productionOrder, alertType, message, adminEmails)
      toast.success('Alerta de producción enviada')
    } catch (error) {
      console.error('Error sending production alert:', error)
      toast.error('Error al enviar alerta de producción')
    }
  }, [alertSystem])

  const sendQualityIssueAlert = useCallback(async (qualityData: any) => {
    try {
      const adminEmails = ['admin@lovilike.com', 'quality@lovilike.com']
      
      await sendAdvancedEmail({
        to: adminEmails,
        subject: `Control de Calidad - ${qualityData.orderNumber}`,
        type: 'QUALITY_ISSUE',
        data: {
          orderNumber: qualityData.orderNumber,
          productName: qualityData.productName,
          inspector: qualityData.inspector,
          checkDate: qualityData.checkDate,
          passed: qualityData.passed,
          comments: qualityData.comments,
          requiredActions: qualityData.requiredActions || []
        },
        priority: qualityData.passed ? 'normal' : 'high'
      })
      
      toast.success('Alerta de calidad enviada')
    } catch (error) {
      console.error('Error sending quality alert:', error)
      toast.error('Error al enviar alerta de calidad')
    }
  }, [])

  const sendSystemAlert = useCallback(async (alertType: string, description: string, severity: 'info' | 'warning' | 'critical') => {
    try {
      const adminEmails = ['admin@lovilike.com', 'tech@lovilike.com']
      await alertSystem.sendSystemAlert(alertType, description, severity, adminEmails)
      toast.success('Alerta del sistema enviada')
    } catch (error) {
      console.error('Error sending system alert:', error)
      toast.error('Error al enviar alerta del sistema')
    }
  }, [alertSystem])

  // Handle notification events automatically
  const handleNotificationEvent = useCallback(async (event: NotificationEvent) => {
    switch (event.type) {
      case 'ORDER_CREATED':
        await sendOrderConfirmation(event.data)
        break
      
      case 'ORDER_STATUS_CHANGED':
        await sendOrderStatusUpdate(event.data)
        break
      
      case 'STOCK_LOW':
        await sendStockAlert(event.data.items)
        break
      
      case 'PRODUCTION_ISSUE':
        await sendProductionAlert(
          event.data.productionOrder,
          event.data.alertType,
          event.data.message
        )
        break
      
      case 'PAYMENT_RECEIVED':
        await sendPaymentConfirmation(event.data)
        break
      
      default:
        console.warn('Unknown notification event type:', event.type)
    }
  }, [sendOrderConfirmation, sendOrderStatusUpdate, sendStockAlert, sendProductionAlert, sendPaymentConfirmation])

  return {
    // Individual notification functions
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    sendPaymentConfirmation,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendStockAlert,
    sendProductionAlert,
    sendQualityIssueAlert,
    sendSystemAlert,
    
    // Event handler for automatic notifications
    handleNotificationEvent
  }
}