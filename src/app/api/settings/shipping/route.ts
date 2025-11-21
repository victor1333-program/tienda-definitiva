import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_SHIPPING_SETTINGS = {
  general: {
    defaultWeightUnit: 'kg',
    defaultDimensionUnit: 'cm',
    enableShippingCalculator: true,
    enableShippingInsurance: false,
    enableSignatureRequired: false,
    enableTrackingNotifications: true,
    defaultPackagingWeight: 0.1,
    maxPackageWeight: 30,
    processingTime: { min: 1, max: 3 }
  },
  zones: [
    {
      id: 'spain',
      name: 'España Peninsular',
      countries: ['ES'],
      regions: ['madrid', 'barcelona', 'valencia'],
      postalCodes: [],
      enabled: true
    },
    {
      id: 'spain-islands',
      name: 'Islas Baleares y Canarias',
      countries: ['ES'],
      regions: ['baleares', 'canarias'],
      postalCodes: [],
      enabled: true
    },
    {
      id: 'europe',
      name: 'Unión Europea',
      countries: ['FR', 'DE', 'IT', 'PT'],
      regions: [],
      postalCodes: [],
      enabled: true
    }
  ],
  methods: [
    {
      id: 'standard',
      name: 'Envío Estándar GLS',
      description: 'Entrega en 3-5 días laborables con GLS',
      type: 'flat_rate',
      enabled: true,
      zones: ['spain'],
      minAmount: 0,
      maxAmount: 999999,
      minWeight: 0,
      maxWeight: 30,
      price: 4.95,
      freeShippingThreshold: 50,
      estimatedDays: { min: 3, max: 5 },
      carrier: 'gls',
      trackingEnabled: true,
      requiresSignature: false,
      insuranceIncluded: false
    },
    {
      id: 'express',
      name: 'Envío Express GLS',
      description: 'Entrega en 24-48 horas con GLS Express',
      type: 'flat_rate',
      enabled: true,
      zones: ['spain'],
      minAmount: 0,
      maxAmount: 999999,
      minWeight: 0,
      maxWeight: 10,
      price: 9.95,
      freeShippingThreshold: 100,
      estimatedDays: { min: 1, max: 2 },
      carrier: 'gls',
      trackingEnabled: true,
      requiresSignature: true,
      insuranceIncluded: true
    }
  ],
  carriers: {
    // GLS - ÚNICO TRANSPORTISTA ACTIVO PARA MVP
    // OTROS TRANSPORTISTAS COMENTADOS EN EL CÓDIGO - SE IMPLEMENTARÁN MÁS ADELANTE
    // (correos, ups, dhl, fedex, mrw, seur)
    gls: {
      id: 'gls',
      name: 'GLS',
      enabled: true,
      apiKey: '',
      apiSecret: '',
      accountNumber: '',
      mode: 'test',
      services: ['standard', 'express', 'international', 'business-parcel']
    }
  },
  localDelivery: {
    enabled: false,
    radius: 50,
    basePrice: 5,
    pricePerKm: 0.5,
    freeDeliveryThreshold: 75,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    timeSlots: [
      { start: '09:00', end: '13:00', price: 0 },
      { start: '14:00', end: '18:00', price: 0 },
      { start: '18:00', end: '21:00', price: 2 }
    ]
  },
  pickupPoints: {
    enabled: false,
    locations: []
  }
}

export async function GET() {
  try {
    return NextResponse.json(DEFAULT_SHIPPING_SETTINGS)
  } catch (error) {
    console.error('Error getting shipping settings:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración de envíos' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json()
    
    // Aquí se guardarían en la base de datos
    // Por ahora simulamos el guardado
    
    return NextResponse.json({ 
      message: 'Configuración de envíos guardada correctamente',
      settings 
    })
  } catch (error) {
    console.error('Error saving shipping settings:', error)
    return NextResponse.json(
      { error: 'Error al guardar configuración de envíos' },
      { status: 500 }
    )
  }
}