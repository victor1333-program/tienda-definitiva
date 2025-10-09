import nodemailer from 'nodemailer'

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// Verificar configuración
export async function verifyEmailConfig() {
  try {
    await transporter.verify()
    console.log('✅ Email configuration verified')
    return true
  } catch (error) {
    console.error('❌ Email configuration error:', error)
    return false
  }
}

// Plantillas de email base
const EMAIL_TEMPLATES = {
  ORDER_CONFIRMATION: {
    subject: 'Confirmación de Pedido #{orderNumber} - Lovilike',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FB6D0E; color: white; padding: 20px; text-align: center;">
          <h1>¡Gracias por tu pedido!</h1>
          <p>Tu pedido #{orderNumber} ha sido confirmado</p>
        </div>
        
        <div style="padding: 20px;">
          <h2>Detalles del Pedido</h2>
          <p><strong>Número de pedido:</strong> {orderNumber}</p>
          <p><strong>Fecha:</strong> {orderDate}</p>
          <p><strong>Total:</strong> €{totalAmount}</p>
          
          <h3>Productos</h3>
          <div style="border: 1px solid #ddd; border-radius: 5px;">
            {orderItems}
          </div>
          
          <h3>Información de Envío</h3>
          <p><strong>Método:</strong> {shippingMethod}</p>
          <p><strong>Dirección:</strong><br>{shippingAddress}</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; margin-top: 20px; border-radius: 5px;">
            <p><strong>¿Necesitas ayuda?</strong></p>
            <p>Contacta con nosotros en <a href="mailto:info@lovilike.es">info@lovilike.es</a> o llama al 611 066 997</p>
          </div>
        </div>
        
        <div style="background-color: #79B695; color: white; padding: 15px; text-align: center;">
          <p>Gracias por confiar en Lovilike</p>
          <p>Hellín, Albacete | www.lovilike.es</p>
        </div>
      </div>
    `
  },

  ORDER_STATUS_UPDATE: {
    subject: 'Actualización de Pedido #{orderNumber} - Lovilike',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #79B695; color: white; padding: 20px; text-align: center;">
          <h1>Actualización de tu Pedido</h1>
          <p>Pedido #{orderNumber}</p>
        </div>
        
        <div style="padding: 20px;">
          <h2>Estado del Pedido: {status}</h2>
          <p>{statusMessage}</p>
          
          {trackingInfo}
          
          <div style="background-color: #f9f9f9; padding: 15px; margin-top: 20px; border-radius: 5px;">
            <h3>Resumen del Pedido</h3>
            <p><strong>Número:</strong> {orderNumber}</p>
            <p><strong>Total:</strong> €{totalAmount}</p>
            <p><strong>Fecha:</strong> {orderDate}</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; margin-top: 20px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <p><strong>¿Tienes alguna pregunta?</strong></p>
            <p>No dudes en contactarnos en <a href="mailto:info@lovilike.es">info@lovilike.es</a></p>
          </div>
        </div>
        
        <div style="background-color: #FB6D0E; color: white; padding: 15px; text-align: center;">
          <p>Lovilike - Personalización con Calidad</p>
        </div>
      </div>
    `
  },

  PASSWORD_RESET: {
    subject: 'Restablece tu Contraseña - Lovilike',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FB6D0E; color: white; padding: 20px; text-align: center;">
          <h1>Restablece tu Contraseña</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Hola {userName},</p>
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Lovilike.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{resetLink}" style="background-color: #79B695; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
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
        
        <div style="background-color: #6c757d; color: white; padding: 15px; text-align: center;">
          <p>Lovilike Team | info@lovilike.es</p>
        </div>
      </div>
    `
  },

  WELCOME: {
    subject: '¡Bienvenido a Lovilike! 🎨',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FB6D0E; color: white; padding: 20px; text-align: center;">
          <h1>¡Bienvenido a Lovilike!</h1>
          <p>Tu cuenta ha sido creada exitosamente</p>
        </div>
        
        <div style="padding: 20px;">
          <p>Hola {userName},</p>
          <p>¡Nos alegra tenerte en la familia Lovilike! 🎉</p>
          
          <h3>¿Qué puedes hacer ahora?</h3>
          <ul>
            <li>🎨 Personaliza productos con nuestro editor</li>
            <li>📦 Realiza pedidos fácilmente</li>
            <li>🚚 Sigue el estado de tus envíos</li>
            <li>💬 Contáctanos directamente</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{shopLink}" style="background-color: #79B695; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Empezar a Personalizar
            </a>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 15px; margin-top: 20px; border-radius: 5px;">
            <h4>Nuestras Especialidades:</h4>
            <p><strong>DTF:</strong> Perfecto para textiles</p>
            <p><strong>Sublimación:</strong> Ideal para tazas y productos rígidos</p>
            <p><strong>Corte Láser:</strong> Para madera y materiales especiales</p>
          </div>
        </div>
        
        <div style="background-color: #79B695; color: white; padding: 15px; text-align: center;">
          <p>¿Necesitas ayuda? Estamos aquí para ti</p>
          <p>📧 info@lovilike.es | 📞 611 066 997</p>
        </div>
      </div>
    `
  }
}

// Funciones para enviar emails específicos

export async function sendOrderConfirmationEmail(orderData: any) {
  try {
    const orderItemsHtml = orderData.orderItems.map((item: any) => `
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
    `).join('')

    const shippingAddressText = typeof orderData.shippingAddress === 'object' 
      ? `${orderData.shippingAddress.street}<br>${orderData.shippingAddress.city}, ${orderData.shippingAddress.state}<br>${orderData.shippingAddress.postalCode}`
      : orderData.shippingAddress || 'Dirección no especificada'

    const emailHtml = EMAIL_TEMPLATES.ORDER_CONFIRMATION.template
      .replace(/{orderNumber}/g, orderData.orderNumber)
      .replace(/{orderDate}/g, new Date(orderData.createdAt).toLocaleDateString('es-ES'))
      .replace(/{totalAmount}/g, orderData.totalAmount.toFixed(2))
      .replace(/{orderItems}/g, orderItemsHtml)
      .replace(/{shippingMethod}/g, orderData.shippingMethod)
      .replace(/{shippingAddress}/g, shippingAddressText)

    await transporter.sendMail({
      from: `"Lovilike" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: orderData.customerEmail,
      subject: EMAIL_TEMPLATES.ORDER_CONFIRMATION.subject.replace('{orderNumber}', orderData.orderNumber),
      html: emailHtml
    })

    console.log(`✅ Order confirmation email sent to ${orderData.customerEmail}`)
    return true
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error)
    return false
  }
}

export async function sendOrderStatusUpdateEmail(orderData: any) {
  try {
    const statusMessages = {
      CONFIRMED: 'Tu pedido ha sido confirmado y está siendo preparado.',
      IN_PRODUCTION: 'Tu pedido está en producción. Nuestro equipo está trabajando en él.',
      READY_FOR_PICKUP: 'Tu pedido está listo para recoger en nuestra tienda.',
      SHIPPED: 'Tu pedido ha sido enviado y está en camino.',
      DELIVERED: '¡Tu pedido ha sido entregado! Esperamos que disfrutes tus productos.',
      CANCELLED: 'Tu pedido ha sido cancelado.',
      REFUNDED: 'Tu pedido ha sido reembolsado.'
    }

    const trackingInfo = orderData.trackingNumber ? `
      <div style="background-color: #d1ecf1; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <h4>Información de Seguimiento</h4>
        <p><strong>Número de seguimiento:</strong> ${orderData.trackingNumber}</p>
      </div>
    ` : ''

    const emailHtml = EMAIL_TEMPLATES.ORDER_STATUS_UPDATE.template
      .replace(/{orderNumber}/g, orderData.orderNumber)
      .replace(/{status}/g, orderData.status)
      .replace(/{statusMessage}/g, statusMessages[orderData.status as keyof typeof statusMessages] || 'Estado actualizado')
      .replace(/{trackingInfo}/g, trackingInfo)
      .replace(/{totalAmount}/g, orderData.totalAmount.toFixed(2))
      .replace(/{orderDate}/g, new Date(orderData.createdAt).toLocaleDateString('es-ES'))

    await transporter.sendMail({
      from: `"Lovilike" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: orderData.customerEmail,
      subject: EMAIL_TEMPLATES.ORDER_STATUS_UPDATE.subject.replace('{orderNumber}', orderData.orderNumber),
      html: emailHtml
    })

    console.log(`✅ Order status update email sent to ${orderData.customerEmail}`)
    return true
  } catch (error) {
    console.error('❌ Error sending order status update email:', error)
    return false
  }
}

export async function sendPasswordResetEmail(userData: any, resetToken: string) {
  try {
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

    const emailHtml = EMAIL_TEMPLATES.PASSWORD_RESET.template
      .replace(/{userName}/g, userData.name || 'Usuario')
      .replace(/{resetLink}/g, resetLink)

    await transporter.sendMail({
      from: `"Lovilike" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: userData.email,
      subject: EMAIL_TEMPLATES.PASSWORD_RESET.subject,
      html: emailHtml
    })

    console.log(`✅ Password reset email sent to ${userData.email}`)
    return true
  } catch (error) {
    console.error('❌ Error sending password reset email:', error)
    return false
  }
}

export async function sendWelcomeEmail(userData: any) {
  try {
    const shopLink = `${process.env.NEXTAUTH_URL}/productos`

    const emailHtml = EMAIL_TEMPLATES.WELCOME.template
      .replace(/{userName}/g, userData.name || 'Usuario')
      .replace(/{shopLink}/g, shopLink)

    await transporter.sendMail({
      from: `"Lovilike" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: userData.email,
      subject: EMAIL_TEMPLATES.WELCOME.subject,
      html: emailHtml
    })

    console.log(`✅ Welcome email sent to ${userData.email}`)
    return true
  } catch (error) {
    console.error('❌ Error sending welcome email:', error)
    return false
  }
}

// Función genérica para enviar emails
export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  try {
    await transporter.sendMail({
      from: `"Lovilike" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text
    })

    console.log(`✅ Email sent to ${to}`)
    return true
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return false
  }
}