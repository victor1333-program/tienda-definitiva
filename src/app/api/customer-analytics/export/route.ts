import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

// Export customer analytics data
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { period, format } = await request.json()

    // Fetch all analytics data
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    const [segmentsResponse, metricsResponse, insightsResponse, behaviorResponse] = await Promise.all([
      fetch(`${baseUrl}/api/customer-analytics/segments?period=${period}`),
      fetch(`${baseUrl}/api/customer-analytics/metrics?period=${period}`),
      fetch(`${baseUrl}/api/customer-analytics/insights?period=${period}`),
      fetch(`${baseUrl}/api/customer-analytics/behavior?period=${period}`)
    ])

    const segments = await segmentsResponse.json()
    const metrics = await metricsResponse.json()
    const insights = await insightsResponse.json()
    const behaviors = await behaviorResponse.json()

    if (format === 'csv') {
      // Generate CSV format
      let csvContent = ""
      
      // Add header
      csvContent += "ANALISIS DE CLIENTES - LOVILIKE\n"
      csvContent += `Periodo: ${period}\n`
      csvContent += `Generado: ${new Date().toLocaleString('es-ES')}\n\n`
      
      // Metrics section
      csvContent += "METRICAS PRINCIPALES\n"
      csvContent += "Metrica,Valor\n"
      csvContent += `Total Clientes,${metrics.totalCustomers}\n`
      csvContent += `Nuevos Clientes,${metrics.newCustomers}\n`
      csvContent += `Clientes Recurrentes,${metrics.returningCustomers}\n`
      csvContent += `Valor Promedio Pedido,${metrics.averageOrderValue.toFixed(2)}\n`
      csvContent += `Valor Vida Cliente,${metrics.customerLifetimeValue.toFixed(2)}\n`
      csvContent += `Tasa Abandono,${metrics.churnRate.toFixed(1)}%\n`
      csvContent += `Tasa Retencion,${metrics.retentionRate.toFixed(1)}%\n`
      csvContent += `NPS Score,${metrics.npsScore}\n\n`
      
      // Segments section
      csvContent += "SEGMENTACION DE CLIENTES\n"
      csvContent += "Segmento,Descripcion,Clientes,Porcentaje,Valor Promedio,Riesgo Abandono\n"
      segments.forEach((segment: any) => {
        csvContent += `"${segment.name}","${segment.description}",${segment.count},${segment.percentage.toFixed(1)}%,${segment.averageValue.toFixed(2)},${segment.riskScore}%\n`
      })
      csvContent += "\n"
      
      // Behavior patterns section
      csvContent += "PATRONES DE COMPORTAMIENTO\n"
      csvContent += "Patron,Frecuencia,Ingresos,Tendencia,Clientes,Valor Promedio\n"
      behaviors.forEach((behavior: any) => {
        csvContent += `"${behavior.pattern}",${behavior.frequency}%,${behavior.revenue},${behavior.trend},${behavior.customerCount},${behavior.averageOrderValue.toFixed(2)}\n`
      })
      csvContent += "\n"
      
      // Insights section
      csvContent += "INSIGHTS Y RECOMENDACIONES\n"
      csvContent += "Tipo,Titulo,Descripcion,Impacto,Accion Requerida\n"
      insights.forEach((insight: any) => {
        csvContent += `"${insight.type}","${insight.title}","${insight.description}","${insight.impact}","${insight.actionRequired ? 'Si' : 'No'}"\n`
      })
      
      const blob = Buffer.from(csvContent, 'utf-8')
      
      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="customer-analytics-${period}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } 
    
    // Default JSON format
    const exportData = {
      period,
      generatedAt: new Date().toISOString(),
      summary: {
        totalCustomers: metrics.totalCustomers,
        segmentsAnalyzed: segments.length,
        behaviorPatternsIdentified: behaviors.length,
        insightsGenerated: insights.length
      },
      metrics,
      segments,
      behaviorPatterns: behaviors,
      insights,
      recommendations: insights.filter((insight: any) => insight.type === 'recommendation'),
      risks: insights.filter((insight: any) => insight.type === 'risk'),
      opportunities: insights.filter((insight: any) => insight.type === 'opportunity')
    }
    
    return NextResponse.json(exportData)

  } catch (error) {
    console.error("Error exporting customer analytics:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}