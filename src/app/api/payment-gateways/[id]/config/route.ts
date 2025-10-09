import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface GatewayConfig {
  name: string
  provider: string
  isEnabled: boolean
  configuration: {
    publicKey?: string
    secretKey?: string
    webhookSecret?: string
    merchantId?: string
    merchantCode?: string
    terminal?: string
    currency?: string
    phoneNumber?: string
    concept?: string
    environment: 'sandbox' | 'production'
  }
  fees: {
    fixedFee: number
    percentageFee: number
    currency: string
  }
  limits: {
    minAmount: number
    maxAmount: number
    dailyLimit: number
    monthlyLimit: number
  }
}

// PUT - Update gateway configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const gatewayId = id
    const configData: GatewayConfig = await request.json()

    // Validate required fields based on provider
    if (configData.provider === 'redsys') {
      if (!configData.configuration.merchantCode || !configData.configuration.secretKey) {
        return NextResponse.json(
          { error: "Código de comercio y clave secreta son requeridos para Redsys" },
          { status: 400 }
        )
      }
    }

    if (configData.provider === 'bizum') {
      if (!configData.configuration.merchantCode || !configData.configuration.secretKey) {
        return NextResponse.json(
          { error: "Código de comercio y clave secreta son requeridos para Bizum" },
          { status: 400 }
        )
      }
    }

    // In a real implementation, you would:
    // 1. Validate configuration data
    // 2. Test connection with provider
    // 3. Encrypt sensitive credentials before saving
    // 4. Update database record
    // 5. Update webhook endpoints
    // 6. Log changes for audit trail
    // 7. Notify relevant services of configuration changes

    // Mock successful update
    const updatedGateway = {
      id: gatewayId === 'new' ? `gateway-${Date.now()}` : gatewayId,
      ...configData,
      status: configData.configuration.environment === 'sandbox' ? 'testing' : 'active',
      lastSync: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(gatewayId === 'new' && { createdAt: new Date().toISOString() })
    }

    // Simulate configuration validation
    if (configData.provider === 'redsys') {
      // Validate Redsys specific configuration
      if (configData.configuration.merchantCode?.length !== 9) {
        return NextResponse.json(
          { error: "El código de comercio debe tener 9 dígitos" },
          { status: 400 }
        )
      }
    }

    if (configData.provider === 'bizum') {
      // Validate Bizum specific configuration
      if (configData.configuration.concept && configData.configuration.concept.length > 35) {
        return NextResponse.json(
          { error: "El concepto no puede exceder 35 caracteres" },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      gateway: updatedGateway,
      message: `Configuración de ${configData.provider} ${gatewayId === 'new' ? 'creada' : 'actualizada'} correctamente`
    })

  } catch (error) {
    console.error("Error updating gateway configuration:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// GET - Get gateway configuration
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const gatewayId = id

    // In a real implementation, fetch from database
    // For now, return mock configuration
    const mockConfig = {
      id: gatewayId,
      name: "Configuración de Ejemplo",
      provider: "redsys",
      isEnabled: false,
      configuration: {
        merchantCode: "",
        terminal: "1",
        currency: "EUR",
        environment: "sandbox" as const
      },
      fees: {
        fixedFee: 0,
        percentageFee: 0,
        currency: "EUR"
      },
      limits: {
        minAmount: 1,
        maxAmount: 10000,
        dailyLimit: 50000,
        monthlyLimit: 500000
      }
    }

    return NextResponse.json(mockConfig)

  } catch (error) {
    console.error("Error fetching gateway configuration:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}