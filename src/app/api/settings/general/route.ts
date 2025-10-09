import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'

// GET: Obtener configuración general
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener todas las configuraciones generales
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          startsWith: 'general_'
        }
      }
    })

    // Configuración por defecto
    const generalSettings = {
      company: {
        name: 'Lovilike Personalizados',
        email: 'info@lovilike.com',
        phone: '611 066 997',
        address: 'Calle Principal 123',
        city: 'Hellín',
        postalCode: '02400',
        province: 'Albacete',
        country: 'España',
        website: 'https://lovilike.com',
        logo: '',
        favicon: '',
        description: 'Productos personalizados para eventos especiales'
      },
      store: {
        currency: 'EUR',
        timezone: 'Europe/Madrid',
        language: 'es',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        allowGuestCheckout: true,
        requirePhoneNumber: true,
        requireCompanyInfo: false,
        minOrderAmount: 0,
        maxOrderAmount: 10000,
        defaultShippingMethod: 'standard',
        stockDisplayThreshold: 5,
        lowStockThreshold: 10
      },
      seo: {
        metaTitle: 'Lovilike Personalizados - Productos Únicos para Eventos Especiales',
        metaDescription: 'Productos personalizados para bodas, comuniones, bautizos, baby shower y textil personalizado. Detalles únicos para tus momentos especiales.',
        metaKeywords: 'productos personalizados, bodas, comuniones, bautizos, baby shower, textil personalizado',
        ogImage: '',
        googleAnalyticsId: '',
        googleTagManagerId: '',
        facebookPixelId: '',
        enableSitemap: true,
        enableRobots: true
      },
      notifications: {
        enableEmailNotifications: true,
        enableSmsNotifications: false,
        enablePushNotifications: false,
        orderNotificationEmail: 'orders@lovilike.com',
        contactNotificationEmail: 'info@lovilike.com',
        lowStockNotificationEmail: 'stock@lovilike.com'
      },
      maintenance: {
        maintenanceMode: false,
        maintenanceMessage: 'Estamos realizando mejoras en el sitio. Volveremos pronto.',
        allowedIps: [],
        maintenanceStartDate: null,
        maintenanceEndDate: null
      }
    }

    // Aplicar configuraciones guardadas
    settings.forEach(setting => {
      const keyParts = setting.key.replace('general_', '').split('_')
      if (keyParts.length >= 2) {
        const section = keyParts[0]
        const field = keyParts.slice(1).join('_')
        
        if (generalSettings[section as keyof typeof generalSettings]) {
          try {
            const value = typeof setting.value === 'string' 
              ? JSON.parse(setting.value) 
              : setting.value
            generalSettings[section as keyof typeof generalSettings][field] = value
          } catch (error) {
            console.error('Error parsing setting value:', error)
          }
        }
      }
    })

    return NextResponse.json(generalSettings)

  } catch (error) {
    console.error('Error fetching general settings:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración general' },
      { status: 500 }
    )
  }
}

// PUT: Actualizar configuración general
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
            settingsToUpdate.push({
              key: `general_${section}_${field}`,
              value: JSON.stringify(value)
            })
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
      message: 'Configuración general guardada correctamente',
      updatedCount: settingsToUpdate.length
    })

  } catch (error) {
    console.error('Error updating general settings:', error)
    return NextResponse.json(
      { error: 'Error al guardar configuración general' },
      { status: 500 }
    )
  }
}