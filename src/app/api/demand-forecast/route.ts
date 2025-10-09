import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from "@/lib/db"

// Simple moving average algorithm for demand forecasting
async function calculateDemandForecast(itemId: string, type: 'material' | 'variant') {
  const now = new Date()
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  
  let movements: any[] = []
  
  if (type === 'material') {
    movements = await db.materialMovement.findMany({
      where: {
        materialId: itemId,
        type: 'CONSUMPTION',
        createdAt: { gte: threeMonthsAgo }
      },
      orderBy: { createdAt: 'desc' }
    })
  } else {
    movements = await db.inventoryMovement.findMany({
      where: {
        variantId: itemId,
        type: 'OUT',
        createdAt: { gte: threeMonthsAgo }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  if (movements.length === 0) {
    return { predictedDemand: 0, confidence: 0 }
  }

  // Group by week and calculate weekly consumption
  const weeklyConsumption: { [key: string]: number } = {}
  
  movements.forEach(movement => {
    const date = new Date(movement.createdAt)
    const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
    weeklyConsumption[weekKey] = (weeklyConsumption[weekKey] || 0) + Math.abs(movement.quantity)
  })

  const consumptionValues = Object.values(weeklyConsumption)
  const avgWeeklyConsumption = consumptionValues.reduce((sum, val) => sum + val, 0) / consumptionValues.length

  // Simple forecast: predict next week consumption = average of last weeks
  const predictedDemand = avgWeeklyConsumption
  
  // Confidence based on data consistency (lower standard deviation = higher confidence)
  const variance = consumptionValues.reduce((sum, val) => sum + Math.pow(val - avgWeeklyConsumption, 2), 0) / consumptionValues.length
  const stdDev = Math.sqrt(variance)
  const confidence = Math.max(0, Math.min(1, 1 - (stdDev / avgWeeklyConsumption)))

  return { predictedDemand, confidence }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const materialId = searchParams.get("materialId")
    const variantId = searchParams.get("variantId")

    const forecasts = await db.demandForecast.findMany({
      where: {
        ...(materialId && { materialId }),
        ...(variantId && { variantId })
      },
      include: {
        material: {
          select: {
            name: true,
            sku: true,
            unit: true,
            currentStock: true,
            minimumStock: true
          }
        },
        variant: {
          select: {
            sku: true,
            stock: true,
            product: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(forecasts)

  } catch (error) {
    console.error("Error fetching demand forecasts:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { materialIds = [], variantIds = [] } = await request.json()

    const forecastsCreated = []

    // Generate forecasts for materials
    for (const materialId of materialIds) {
      const { predictedDemand, confidence } = await calculateDemandForecast(materialId, 'material')
      
      const now = new Date()
      const period = `${now.getFullYear()}-W${Math.ceil(now.getDate() / 7)}`

      const forecast = await db.demandForecast.create({
        data: {
          materialId,
          predictedDemand,
          confidence,
          period,
          algorithm: 'moving_average'
        },
        include: {
          material: {
            select: {
              name: true,
              sku: true,
              unit: true,
              currentStock: true
            }
          }
        }
      })

      forecastsCreated.push(forecast)
    }

    // Generate forecasts for variants
    for (const variantId of variantIds) {
      const { predictedDemand, confidence } = await calculateDemandForecast(variantId, 'variant')
      
      const now = new Date()
      const period = `${now.getFullYear()}-W${Math.ceil(now.getDate() / 7)}`

      const forecast = await db.demandForecast.create({
        data: {
          variantId,
          predictedDemand,
          confidence,
          period,
          algorithm: 'moving_average'
        },
        include: {
          variant: {
            select: {
              sku: true,
              stock: true,
              product: {
                select: { name: true }
              }
            }
          }
        }
      })

      forecastsCreated.push(forecast)
    }

    return NextResponse.json({ 
      success: true, 
      forecastsCreated: forecastsCreated.length,
      forecasts: forecastsCreated 
    })

  } catch (error) {
    console.error("Error generating demand forecasts:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}