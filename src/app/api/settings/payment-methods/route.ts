import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'

// GET: Obtener configuración de métodos de pago
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener todas las configuraciones de métodos de pago
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          startsWith: 'payment_'
        }
      }
    })

    // Convertir a objeto estructurado
    const paymentSettings = {
      stripe: {
        enabled: false,
        publicKey: '',
        secretKey: '',
        webhookSecret: '',
        mode: 'test',
        acceptedCards: ['visa', 'mastercard', 'amex'],
        captureMethod: 'automatic',
        fees: { percentage: 2.9, fixed: 0.30 }
      },
      paypal: {
        enabled: false,
        clientId: '',
        clientSecret: '',
        mode: 'sandbox',
        fees: { percentage: 3.4, fixed: 0.35 }
      },
      redsys: {
        enabled: false,
        merchantCode: '',
        terminal: '1',
        secretKey: '',
        mode: 'test',
        fees: { percentage: 1.5, fixed: 0.20 }
      },
      bankTransfer: {
        enabled: true,
        bankName: '',
        accountHolder: '',
        iban: '',
        swift: '',
        instructions: 'Realizar transferencia bancaria con el número de pedido como concepto.',
        fees: { percentage: 0, fixed: 0 }
      },
      bizum: {
        enabled: false,
        phoneNumber: '',
        fees: { percentage: 0, fixed: 0 }
      },
      crypto: {
        enabled: false,
        acceptedCoins: ['BTC', 'ETH'],
        walletAddresses: {},
        fees: { percentage: 1, fixed: 0 }
      },
      general: {
        defaultCurrency: 'EUR',
        autoCapture: true,
        refundPolicy: '14 días',
        maxRefundDays: 14,
        requireAddressVerification: true,
        requireCvv: true,
        savePaymentMethods: true
      }
    }

    // Aplicar configuraciones guardadas
    settings.forEach(setting => {
      const keyParts = setting.key.replace('payment_', '').split('_')
      if (keyParts.length >= 2) {
        const method = keyParts[0]
        const field = keyParts.slice(1).join('_')
        
        if (paymentSettings[method as keyof typeof paymentSettings]) {
          try {
            const value = typeof setting.value === 'string' 
              ? JSON.parse(setting.value) 
              : setting.value
              
            if (field.includes('_')) {
              // Campo anidado (ej: fees_percentage)
              const nestedParts = field.split('_')
              const parentField = nestedParts[0]
              const childField = nestedParts[1]
              
              if (!paymentSettings[method as keyof typeof paymentSettings][parentField]) {
                paymentSettings[method as keyof typeof paymentSettings][parentField] = {}
              }
              paymentSettings[method as keyof typeof paymentSettings][parentField][childField] = value
            } else {
              // Campo directo
              paymentSettings[method as keyof typeof paymentSettings][field] = value
            }
          } catch (error) {
            console.error('Error parsing setting value:', error)
          }
        }
      }
    })

    return NextResponse.json(paymentSettings)

  } catch (error) {
    console.error('Error fetching payment settings:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración de pagos' },
      { status: 500 }
    )
  }
}

// PUT: Actualizar configuración de métodos de pago
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

    // Procesar cada método de pago
    Object.entries(body).forEach(([method, config]: [string, any]) => {
      if (config && typeof config === 'object') {
        Object.entries(config).forEach(([field, value]) => {
          if (value !== null && value !== undefined) {
            if (typeof value === 'object' && !Array.isArray(value)) {
              // Campo anidado (ej: fees.percentage)
              Object.entries(value).forEach(([nestedField, nestedValue]) => {
                settingsToUpdate.push({
                  key: `payment_${method}_${field}_${nestedField}`,
                  value: JSON.stringify(nestedValue)
                })
              })
            } else {
              // Campo directo
              settingsToUpdate.push({
                key: `payment_${method}_${field}`,
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
      message: 'Configuración de pagos guardada correctamente',
      updatedCount: settingsToUpdate.length
    })

  } catch (error) {
    console.error('Error updating payment settings:', error)
    return NextResponse.json(
      { error: 'Error al guardar configuración de pagos' },
      { status: 500 }
    )
  }
}