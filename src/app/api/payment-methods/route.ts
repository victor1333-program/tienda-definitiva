import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface PaymentMethod {
  id: string
  name: string
  type: 'card' | 'bank_transfer' | 'digital_wallet' | 'buy_now_pay_later' | 'crypto' | 'cash'
  gatewayId: string
  isEnabled: boolean
  displayOrder: number
  icon: string
  description: string
  processingTime: string
  availability: {
    countries: string[]
    minAmount: number
    maxAmount: number
    currencies: string[]
  }
  fees: {
    customer: number // percentage charged to customer
    merchant: number // percentage charged to merchant
  }
  features: {
    instantPayment: boolean
    refundable: boolean
    recurring: boolean
    mobile: boolean
  }
  restrictions: {
    ageLimit?: number
    requiresVerification: boolean
    businessOnly: boolean
  }
  createdAt: string
  updatedAt: string
}

// GET payment methods
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Mock payment methods data
    const paymentMethods: PaymentMethod[] = [
      {
        id: "method-card-stripe",
        name: "Tarjeta de Crédito/Débito",
        type: "card",
        gatewayId: "gateway-stripe",
        isEnabled: true,
        displayOrder: 1,
        icon: "/icons/credit-card.svg",
        description: "Visa, Mastercard, American Express y más",
        processingTime: "Instantáneo",
        availability: {
          countries: ["ES", "FR", "DE", "IT", "UK", "US", "CA"],
          minAmount: 0.50,
          maxAmount: 999999.99,
          currencies: ["EUR", "USD", "GBP"]
        },
        fees: {
          customer: 0.0, // No fee for customer
          merchant: 1.4 // 1.4% + fixed fee handled by gateway
        },
        features: {
          instantPayment: true,
          refundable: true,
          recurring: true,
          mobile: true
        },
        restrictions: {
          requiresVerification: false,
          businessOnly: false
        },
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: "method-paypal",
        name: "PayPal",
        type: "digital_wallet",
        gatewayId: "gateway-paypal",
        isEnabled: true,
        displayOrder: 2,
        icon: "/icons/paypal.svg",
        description: "Paga con tu cuenta PayPal de forma segura",
        processingTime: "Instantáneo",
        availability: {
          countries: ["ES", "FR", "DE", "IT", "UK", "US", "CA", "AU"],
          minAmount: 1.00,
          maxAmount: 10000.00,
          currencies: ["EUR", "USD", "GBP", "CAD", "AUD"]
        },
        fees: {
          customer: 0.0,
          merchant: 2.9
        },
        features: {
          instantPayment: true,
          refundable: true,
          recurring: true,
          mobile: true
        },
        restrictions: {
          requiresVerification: true, // Requires PayPal account
          businessOnly: false
        },
        createdAt: "2024-01-20T14:30:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: "method-bizum",
        name: "Bizum",
        type: "digital_wallet",
        gatewayId: "gateway-bizum",
        isEnabled: true,
        displayOrder: 3,
        icon: "/icons/bizum.svg",
        description: "Pago móvil instantáneo con Bizum",
        processingTime: "Instantáneo",
        availability: {
          countries: ["ES"],
          minAmount: 0.50,
          maxAmount: 1000.00,
          currencies: ["EUR"]
        },
        fees: {
          customer: 0.0,
          merchant: 0.5
        },
        features: {
          instantPayment: true,
          refundable: true,
          recurring: false,
          mobile: true
        },
        restrictions: {
          requiresVerification: true, // Requires Spanish bank account
          businessOnly: false
        },
        createdAt: "2024-02-10T11:20:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: "method-bank-transfer",
        name: "Transferencia Bancaria",
        type: "bank_transfer",
        gatewayId: "gateway-redsys",
        isEnabled: true,
        displayOrder: 4,
        icon: "/icons/bank-transfer.svg",
        description: "Transferencia directa desde tu banco",
        processingTime: "1-3 días laborables",
        availability: {
          countries: ["ES", "FR", "DE", "IT"],
          minAmount: 10.00,
          maxAmount: 50000.00,
          currencies: ["EUR"]
        },
        fees: {
          customer: 0.0,
          merchant: 0.2
        },
        features: {
          instantPayment: false,
          refundable: true,
          recurring: true,
          mobile: false
        },
        restrictions: {
          requiresVerification: true,
          businessOnly: false
        },
        createdAt: "2024-02-01T09:15:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: "method-apple-pay",
        name: "Apple Pay",
        type: "digital_wallet",
        gatewayId: "gateway-apple-pay",
        isEnabled: false,
        displayOrder: 5,
        icon: "/icons/apple-pay.svg",
        description: "Pago rápido y seguro con Touch ID o Face ID",
        processingTime: "Instantáneo",
        availability: {
          countries: ["ES", "US", "UK", "FR", "DE"],
          minAmount: 1.00,
          maxAmount: 10000.00,
          currencies: ["EUR", "USD", "GBP"]
        },
        fees: {
          customer: 0.0,
          merchant: 0.15
        },
        features: {
          instantPayment: true,
          refundable: true,
          recurring: true,
          mobile: true
        },
        restrictions: {
          requiresVerification: false,
          businessOnly: false
        },
        createdAt: "2024-02-15T16:45:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: "method-google-pay",
        name: "Google Pay",
        type: "digital_wallet",
        gatewayId: "gateway-google-pay",
        isEnabled: false,
        displayOrder: 6,
        icon: "/icons/google-pay.svg",
        description: "Pago rápido con tu dispositivo Android",
        processingTime: "Instantáneo",
        availability: {
          countries: ["ES", "US", "UK", "FR", "DE"],
          minAmount: 1.00,
          maxAmount: 10000.00,
          currencies: ["EUR", "USD", "GBP"]
        },
        fees: {
          customer: 0.0,
          merchant: 0.12
        },
        features: {
          instantPayment: true,
          refundable: true,
          recurring: true,
          mobile: true
        },
        restrictions: {
          requiresVerification: false,
          businessOnly: false
        },
        createdAt: "2024-02-15T16:50:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: "method-klarna",
        name: "Klarna - Paga Después",
        type: "buy_now_pay_later",
        gatewayId: "gateway-klarna",
        isEnabled: false,
        displayOrder: 7,
        icon: "/icons/klarna.svg",
        description: "Compra ahora, paga en 30 días sin interés",
        processingTime: "Instantáneo",
        availability: {
          countries: ["ES", "DE", "UK", "US", "SE", "NO"],
          minAmount: 35.00,
          maxAmount: 10000.00,
          currencies: ["EUR", "USD", "GBP", "SEK"]
        },
        fees: {
          customer: 0.0,
          merchant: 3.29
        },
        features: {
          instantPayment: true,
          refundable: true,
          recurring: false,
          mobile: true
        },
        restrictions: {
          ageLimit: 18,
          requiresVerification: true,
          businessOnly: false
        },
        createdAt: "2024-03-01T12:00:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: "method-afterpay",
        name: "Afterpay - Pago en Cuotas",
        type: "buy_now_pay_later",
        gatewayId: "gateway-afterpay",
        isEnabled: false,
        displayOrder: 8,
        icon: "/icons/afterpay.svg",
        description: "Divide tu compra en 4 pagos sin interés",
        processingTime: "Instantáneo",
        availability: {
          countries: ["US", "UK", "AU", "CA"],
          minAmount: 50.00,
          maxAmount: 2000.00,
          currencies: ["USD", "GBP", "AUD", "CAD"]
        },
        fees: {
          customer: 0.0,
          merchant: 4.17
        },
        features: {
          instantPayment: true,
          refundable: true,
          recurring: false,
          mobile: true
        },
        restrictions: {
          ageLimit: 18,
          requiresVerification: true,
          businessOnly: false
        },
        createdAt: "2024-03-05T14:20:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: "method-cash-on-delivery",
        name: "Pago Contra Reembolso",
        type: "cash",
        gatewayId: "internal",
        isEnabled: true,
        displayOrder: 9,
        icon: "/icons/cash-on-delivery.svg",
        description: "Paga en efectivo cuando recibas tu pedido",
        processingTime: "Al entregar",
        availability: {
          countries: ["ES"],
          minAmount: 5.00,
          maxAmount: 300.00,
          currencies: ["EUR"]
        },
        fees: {
          customer: 3.95, // Fee charged to customer for COD service
          merchant: 0.0
        },
        features: {
          instantPayment: false,
          refundable: true,
          recurring: false,
          mobile: false
        },
        restrictions: {
          requiresVerification: false,
          businessOnly: false
        },
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: new Date().toISOString()
      }
    ]

    // Sort by display order and enabled status
    paymentMethods.sort((a, b) => {
      if (a.isEnabled && !b.isEnabled) return -1
      if (!a.isEnabled && b.isEnabled) return 1
      return a.displayOrder - b.displayOrder
    })

    return NextResponse.json(paymentMethods)

  } catch (error) {
    console.error("Error fetching payment methods:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Create new payment method
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const methodData = await request.json()

    // In a real implementation, you would:
    // 1. Validate method data
    // 2. Check gateway compatibility
    // 3. Set up method configuration
    // 4. Save to database
    // 5. Update checkout flow

    const newMethod: PaymentMethod = {
      id: `method-${Date.now()}`,
      ...methodData,
      isEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(newMethod)

  } catch (error) {
    console.error("Error creating payment method:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}