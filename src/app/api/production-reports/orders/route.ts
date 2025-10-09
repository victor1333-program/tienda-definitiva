import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

function generateProductionReport(index: number) {
  const products = [
    'Camiseta Premium Personalizada',
    'Taza Cerámica Sublimada',
    'Bolsa Ecológica Bordada',
    'Gorra Snapback Custom',
    'Llavero Acrílico Cortado',
    'Sudadera Hoodie DTF',
    'Mousepad Gaming',
    'Botella Térmica Grabada'
  ]
  
  const categories = ['Textil', 'Sublimación', 'Láser', 'Bordado']
  const workers = [
    'María González', 'Carlos Ruiz', 'Ana López', 'Luis Martín',
    'Carmen Jiménez', 'Pedro Castillo', 'Sofia Morales', 'Roberto Vega'
  ]
  
  const statuses = ['COMPLETED', 'IN_PROGRESS', 'DELAYED', 'CANCELLED']
  const statusWeights = [0.7, 0.15, 0.1, 0.05] // 70% completed, 15% in progress, etc.
  
  // Weighted random status selection
  const randomValue = Math.random()
  let cumulativeWeight = 0
  let selectedStatus = statuses[0]
  
  for (let i = 0; i < statuses.length; i++) {
    cumulativeWeight += statusWeights[i]
    if (randomValue <= cumulativeWeight) {
      selectedStatus = statuses[i]
      break
    }
  }
  
  const estimatedTime = 4 + Math.random() * 8 // 4-12 hours
  const actualTime = selectedStatus === 'COMPLETED' ? 
    estimatedTime * (0.8 + Math.random() * 0.4) : // 80-120% of estimated
    undefined
  
  const efficiency = actualTime ? 
    Math.min(100, Math.max(50, (estimatedTime / actualTime) * 100)) :
    75 + Math.random() * 20
  
  const baseCost = 20 + Math.random() * 40
  const revenue = baseCost * (1.3 + Math.random() * 0.8) // 130-210% markup
  const profit = revenue - baseCost
  
  const startDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
  const completionDate = selectedStatus === 'COMPLETED' ? 
    new Date(startDate.getTime() + (actualTime || estimatedTime) * 60 * 60 * 1000) :
    undefined
    
  return {
    id: `report-${index}`,
    orderNumber: `ORD-2024-${String(1000 + index).padStart(4, '0')}`,
    productName: products[index % products.length],
    category: categories[index % categories.length],
    startDate: startDate.toISOString(),
    completionDate: completionDate?.toISOString(),
    estimatedTime: Number(estimatedTime.toFixed(1)),
    actualTime: actualTime ? Number(actualTime.toFixed(1)) : undefined,
    status: selectedStatus,
    cost: Number(baseCost.toFixed(2)),
    revenue: Number(revenue.toFixed(2)),
    profit: Number(profit.toFixed(2)),
    efficiency: Number(efficiency.toFixed(1)),
    defects: Math.floor(Math.random() * 3),
    qualityScore: 7 + Math.random() * 3, // 7-10 scale
    worker: workers[index % workers.length],
    materials: [
      {
        name: 'Material Principal',
        quantity: 1 + Math.floor(Math.random() * 5),
        cost: Number((baseCost * 0.4).toFixed(2))
      },
      {
        name: 'Tinta/Filamento',
        quantity: Math.ceil(Math.random() * 3),
        cost: Number((baseCost * 0.2).toFixed(2))
      }
    ],
    timeBreakdown: {
      design: Number((estimatedTime * 0.15).toFixed(1)),
      cutting: Number((estimatedTime * 0.25).toFixed(1)),
      printing: Number((estimatedTime * 0.35).toFixed(1)),
      assembly: Number((estimatedTime * 0.15).toFixed(1)),
      quality: Number((estimatedTime * 0.1).toFixed(1))
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month"

    // Generate different number of reports based on period
    const reportCounts = {
      week: 25,
      month: 45,
      quarter: 120,
      year: 450
    }

    const reportCount = reportCounts[period as keyof typeof reportCounts] || 45
    const reports = Array.from({ length: reportCount }, (_, index) => 
      generateProductionReport(index)
    )

    // Sort by start date (most recent first)
    reports.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

    return NextResponse.json(reports)

  } catch (error) {
    console.error("Error fetching production reports:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}