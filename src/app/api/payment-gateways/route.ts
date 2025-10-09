import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface PaymentGateway {
  id: string
  name: string
  provider: 'stripe' | 'paypal' | 'redsys' | 'bizum' | 'apple_pay' | 'google_pay' | 'klarna' | 'afterpay'
  isEnabled: boolean
  isLive: boolean
  configuration: {
    publicKey: string
    secretKey: string
    webhookSecret?: string
    merchantId?: string
    environment: 'sandbox' | 'production'
  }
  fees: {
    fixedFee: number
    percentageFee: number
    currency: string
  }
  supportedCurrencies: string[]
  supportedCountries: string[]
  features: {
    recurringPayments: boolean
    refunds: boolean
    disputes: boolean
    webhooks: boolean
    '3dSecure': boolean
  }
  limits: {
    minAmount: number
    maxAmount: number
    dailyLimit: number
    monthlyLimit: number
  }
  lastSync: string
  status: 'active' | 'inactive' | 'error' | 'testing'
  createdAt: string
  updatedAt: string
}

// GET payment gateways
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Mock payment gateways data
    const gateways: PaymentGateway[] = [
      {
        id: "gateway-stripe",
        name: "Stripe",
        provider: "stripe",
        isEnabled: true,
        isLive: true,
        configuration: {
          publicKey: "pk_live_****",
          secretKey: "sk_live_****",
          webhookSecret: "whsec_****",
          environment: "production"
        },
        fees: {
          fixedFee: 0.25,
          percentageFee: 1.4,
          currency: "EUR"
        },
        supportedCurrencies: ["EUR", "USD", "GBP", "CAD", "AUD"],
        supportedCountries: ["ES", "FR", "DE", "IT", "UK", "US", "CA"],
        features: {
          recurringPayments: true,
          refunds: true,
          disputes: true,
          webhooks: true,
          '3dSecure': true
        },
        limits: {
          minAmount: 0.50,
          maxAmount: 999999.99,
          dailyLimit: 100000,
          monthlyLimit: 1000000
        },
        lastSync: new Date().toISOString(),
        status: "active",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: "gateway-paypal",
        name: "PayPal",
        provider: "paypal",
        isEnabled: true,
        isLive: true,
        configuration: {
          publicKey: "client_id_****",
          secretKey: "client_secret_****",
          webhookSecret: "webhook_id_****",
          environment: "production"
        },
        fees: {
          fixedFee: 0.35,
          percentageFee: 2.9,
          currency: "EUR"
        },
        supportedCurrencies: ["EUR", "USD", "GBP", "CAD", "AUD", "JPY"],
        supportedCountries: ["ES", "FR", "DE", "IT", "UK", "US", "CA", "AU", "JP"],
        features: {
          recurringPayments: true,
          refunds: true,
          disputes: true,
          webhooks: true,
          '3dSecure': false
        },
        limits: {
          minAmount: 1.00,
          maxAmount: 10000.00,
          dailyLimit: 50000,
          monthlyLimit: 500000
        },
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "active",
        createdAt: "2024-01-20T14:30:00Z",
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "gateway-redsys",
        name: "Redsys",
        provider: "redsys",
        isEnabled: true,
        isLive: true,
        configuration: {
          publicKey: "merchant_code_****",
          secretKey: "secret_key_****",
          merchantId: "999008881",
          environment: "production"
        },
        fees: {
          fixedFee: 0.20,
          percentageFee: 1.2,
          currency: "EUR"
        },
        supportedCurrencies: ["EUR"],
        supportedCountries: ["ES"],
        features: {
          recurringPayments: true,
          refunds: true,
          disputes: false,
          webhooks: true,
          '3dSecure': true
        },
        limits: {
          minAmount: 0.01,
          maxAmount: 30000.00,
          dailyLimit: 50000,
          monthlyLimit: 300000
        },
        lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: "active",
        createdAt: "2024-02-01T09:15:00Z",
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: "gateway-bizum",
        name: "Bizum",
        provider: "bizum",
        isEnabled: true,
        isLive: true,
        configuration: {
          publicKey: "bizum_merchant_****",
          secretKey: "bizum_secret_****",
          merchantId: "BIZUM001",
          environment: "production"
        },
        fees: {
          fixedFee: 0.00,
          percentageFee: 0.5,
          currency: "EUR"
        },
        supportedCurrencies: ["EUR"],
        supportedCountries: ["ES"],
        features: {
          recurringPayments: false,
          refunds: true,
          disputes: false,
          webhooks: true,
          '3dSecure': false
        },
        limits: {
          minAmount: 0.50,
          maxAmount: 1000.00,
          dailyLimit: 5000,
          monthlyLimit: 20000
        },
        lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: "active",
        createdAt: "2024-02-10T11:20:00Z",
        updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        id: "gateway-apple-pay",
        name: "Apple Pay",
        provider: "apple_pay",
        isEnabled: false,
        isLive: false,
        configuration: {
          publicKey: "apple_merchant_id_****",
          secretKey: "apple_certificate_****",
          environment: "sandbox"
        },
        fees: {
          fixedFee: 0.00,
          percentageFee: 0.15,
          currency: "EUR"
        },
        supportedCurrencies: ["EUR", "USD", "GBP"],
        supportedCountries: ["ES", "US", "UK", "FR", "DE"],
        features: {
          recurringPayments: true,
          refunds: true,
          disputes: false,
          webhooks: true,
          '3dSecure': true
        },
        limits: {
          minAmount: 1.00,
          maxAmount: 10000.00,
          dailyLimit: 25000,
          monthlyLimit: 100000
        },
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: "testing",
        createdAt: "2024-02-15T16:45:00Z",
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "gateway-google-pay",
        name: "Google Pay",
        provider: "google_pay",
        isEnabled: false,
        isLive: false,
        configuration: {
          publicKey: "google_merchant_id_****",
          secretKey: "google_service_key_****",
          environment: "sandbox"
        },
        fees: {
          fixedFee: 0.00,
          percentageFee: 0.12,
          currency: "EUR"
        },
        supportedCurrencies: ["EUR", "USD", "GBP"],
        supportedCountries: ["ES", "US", "UK", "FR", "DE"],
        features: {
          recurringPayments: true,
          refunds: true,
          disputes: false,
          webhooks: true,
          '3dSecure': true
        },
        limits: {
          minAmount: 1.00,
          maxAmount: 10000.00,
          dailyLimit: 25000,
          monthlyLimit: 100000
        },
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: "inactive",
        createdAt: "2024-02-15T16:50:00Z",
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "gateway-klarna",
        name: "Klarna",
        provider: "klarna",
        isEnabled: false,
        isLive: false,
        configuration: {
          publicKey: "klarna_username_****",
          secretKey: "klarna_password_****",
          environment: "sandbox"
        },
        fees: {
          fixedFee: 0.30,
          percentageFee: 3.29,
          currency: "EUR"
        },
        supportedCurrencies: ["EUR", "USD", "GBP", "SEK"],
        supportedCountries: ["ES", "DE", "UK", "US", "SE", "NO"],
        features: {
          recurringPayments: false,
          refunds: true,
          disputes: true,
          webhooks: true,
          '3dSecure': false
        },
        limits: {
          minAmount: 35.00,
          maxAmount: 10000.00,
          dailyLimit: 50000,
          monthlyLimit: 200000
        },
        lastSync: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "inactive",
        createdAt: "2024-03-01T12:00:00Z",
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    // Sort by status (active first) and then by name
    gateways.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1
      if (a.status !== 'active' && b.status === 'active') return 1
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json(gateways)

  } catch (error) {
    console.error("Error fetching payment gateways:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Create new payment gateway
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const gatewayData = await request.json()

    // In a real implementation, you would:
    // 1. Validate gateway configuration
    // 2. Test connection with provider
    // 3. Encrypt sensitive credentials
    // 4. Save to database
    // 5. Set up webhooks
    // 6. Log creation for audit

    const newGateway: PaymentGateway = {
      id: `gateway-${Date.now()}`,
      ...gatewayData,
      isEnabled: false,
      isLive: false,
      status: "testing",
      lastSync: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(newGateway)

  } catch (error) {
    console.error("Error creating payment gateway:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}