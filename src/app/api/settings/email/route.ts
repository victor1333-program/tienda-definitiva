import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'

// GET: Obtener configuración de email
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener todas las configuraciones de email
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          startsWith: 'email_'
        }
      }
    })

    // Configuración por defecto
    const emailSettings = {
      smtp: {
        enabled: false,
        host: '',
        port: 587,
        secure: false,
        username: '',
        password: '',
        fromName: 'Lovilike Personalizados',
        fromEmail: 'noreply@lovilike.com',
        replyToEmail: 'info@lovilike.com'
      },
      templates: {
        orderConfirmation: {
          enabled: true,
          subject: 'Confirmación de pedido #{orderNumber}',
          template: 'order_confirmation'
        },
        orderStatusUpdate: {
          enabled: true,
          subject: 'Actualización de tu pedido #{orderNumber}',
          template: 'order_status_update'
        },
        passwordReset: {
          enabled: true,
          subject: 'Restablece tu contraseña',
          template: 'password_reset'
        },
        welcomeEmail: {
          enabled: true,
          subject: 'Bienvenido a Lovilike Personalizados',
          template: 'welcome'
        },
        contactConfirmation: {
          enabled: true,
          subject: 'Hemos recibido tu mensaje',
          template: 'contact_confirmation'
        },
        lowStockAlert: {
          enabled: true,
          subject: 'Alerta de stock bajo',
          template: 'low_stock_alert'
        }
      },
      automation: {
        enableWelcomeSeries: false,
        enableAbandonedCart: false,
        enableOrderReminders: false,
        enableReviewRequests: false,
        abandonedCartDelay: 24,
        orderReminderDelay: 7,
        reviewRequestDelay: 14
      },
      branding: {
        logoUrl: '',
        headerColor: '#FB6D0E',
        footerText: '© 2025 Lovilike Personalizados. Todos los derechos reservados.',
        socialLinks: {
          facebook: '',
          instagram: '',
          twitter: '',
          youtube: ''
        }
      }
    }

    // Aplicar configuraciones guardadas
    settings.forEach(setting => {
      const keyParts = setting.key.replace('email_', '').split('_')
      if (keyParts.length >= 2) {
        const section = keyParts[0]
        const field = keyParts.slice(1).join('_')
        
        if (emailSettings[section as keyof typeof emailSettings]) {
          try {
            const value = typeof setting.value === 'string' 
              ? JSON.parse(setting.value) 
              : setting.value
              
            if (field.includes('_')) {
              // Campo anidado (ej: orderConfirmation_enabled)
              const nestedParts = field.split('_')
              const parentField = nestedParts[0]
              const childField = nestedParts.slice(1).join('_')
              
              if (!emailSettings[section as keyof typeof emailSettings][parentField]) {
                emailSettings[section as keyof typeof emailSettings][parentField] = {}
              }
              emailSettings[section as keyof typeof emailSettings][parentField][childField] = value
            } else {
              // Campo directo
              emailSettings[section as keyof typeof emailSettings][field] = value
            }
          } catch (error) {
            console.error('Error parsing setting value:', error)
          }
        }
      }
    })

    return NextResponse.json(emailSettings)

  } catch (error) {
    console.error('Error fetching email settings:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración de email' },
      { status: 500 }
    )
  }
}

// PUT: Actualizar configuración de email
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Convertir el objeto anidado a configuraciones planas
    const settingsToUpdate: Array<{ key: string; value: any }> = []

    // Procesar cada sección de configuración
    Object.entries(body).forEach(([section, config]: [string, any]) => {
      if (config && typeof config === 'object') {
        Object.entries(config).forEach(([field, value]) => {
          if (value !== null && value !== undefined) {
            if (typeof value === 'object' && !Array.isArray(value)) {
              // Campo anidado (ej: orderConfirmation.enabled)
              Object.entries(value).forEach(([nestedField, nestedValue]) => {
                settingsToUpdate.push({
                  key: `email_${section}_${field}_${nestedField}`,
                  value: JSON.stringify(nestedValue)
                })
              })
            } else {
              // Campo directo
              settingsToUpdate.push({
                key: `email_${section}_${field}`,
                value: JSON.stringify(value)
              })
            }
          }
        })
      }
    })

    // Actualizar configuraciones en base de datos
    const updatePromises = settingsToUpdate.map(({ key, value }) => 
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: 'Configuración de email guardada correctamente',
      updatedCount: settingsToUpdate.length
    })

  } catch (error) {
    console.error('Error updating email settings:', error)
    return NextResponse.json(
      { error: 'Error al guardar configuración de email' },
      { status: 500 }
    )
  }
}