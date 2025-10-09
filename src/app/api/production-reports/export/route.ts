import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

// Simple PDF generation for reports
function generatePDFReport(data: any) {
  const reportDate = new Date().toLocaleDateString('es-ES')
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reporte de Producción - ${data.period}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f97316;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #f97316;
          margin-bottom: 10px;
        }
        .title {
          font-size: 20px;
          color: #333;
        }
        .subtitle {
          color: #666;
          margin-top: 5px;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 30px 0;
        }
        .metric-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #f97316;
          margin-bottom: 5px;
        }
        .metric-label {
          color: #666;
          font-size: 14px;
        }
        .section {
          margin: 30px 0;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #333;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .table th,
        .table td {
          border: 1px solid #e5e7eb;
          padding: 12px;
          text-align: left;
        }
        .table th {
          background-color: #f9fafb;
          font-weight: bold;
        }
        .status-completed {
          color: #16a34a;
          font-weight: bold;
        }
        .status-delayed {
          color: #ea580c;
          font-weight: bold;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🎨 Lovilike</div>
        <div class="title">Reporte de Producción</div>
        <div class="subtitle">Período: ${data.period} | Generado: ${reportDate}</div>
      </div>

      <div class="section">
        <div class="section-title">Métricas Principales</div>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">${data.metrics.efficiency.toFixed(1)}%</div>
            <div class="metric-label">Eficiencia Global</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.metrics.onTimeDelivery.toFixed(1)}%</div>
            <div class="metric-label">Entregas a Tiempo</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.metrics.defectRate.toFixed(2)}%</div>
            <div class="metric-label">Tasa de Defectos</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">€${data.metrics.totalRevenue.toLocaleString('es-ES')}</div>
            <div class="metric-label">Ingresos Totales</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.metrics.profitMargin.toFixed(1)}%</div>
            <div class="metric-label">Margen de Beneficio</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.metrics.averageProductionTime.toFixed(1)}h</div>
            <div class="metric-label">Tiempo Promedio</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Top 10 Órdenes por Eficiencia</div>
        <table class="table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Producto</th>
              <th>Estado</th>
              <th>Eficiencia</th>
              <th>Beneficio</th>
              <th>Trabajador</th>
            </tr>
          </thead>
          <tbody>
            ${data.topOrders.map((order: any) => `
              <tr>
                <td>${order.orderNumber}</td>
                <td>${order.productName}</td>
                <td class="status-${order.status.toLowerCase()}">${order.status}</td>
                <td>${order.efficiency.toFixed(1)}%</td>
                <td>€${order.profit.toFixed(2)}</td>
                <td>${order.worker}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Rendimiento del Personal</div>
        <table class="table">
          <thead>
            <tr>
              <th>Trabajador</th>
              <th>Órdenes</th>
              <th>Eficiencia</th>
              <th>Calidad</th>
              <th>Ingresos</th>
            </tr>
          </thead>
          <tbody>
            ${data.workers.slice(0, 8).map((worker: any) => `
              <tr>
                <td>${worker.name}</td>
                <td>${worker.ordersCompleted}</td>
                <td>${worker.efficiency.toFixed(1)}%</td>
                <td>${worker.qualityScore.toFixed(1)}/10</td>
                <td>€${worker.totalRevenue.toLocaleString('es-ES')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Resumen Ejecutivo</div>
        <p><strong>Conclusiones principales:</strong></p>
        <ul>
          <li>La eficiencia global del ${data.metrics.efficiency.toFixed(1)}% ${data.metrics.efficiency >= 85 ? 'supera' : 'está por debajo de'} nuestros objetivos del 85%.</li>
          <li>Las entregas a tiempo del ${data.metrics.onTimeDelivery.toFixed(1)}% ${data.metrics.onTimeDelivery >= 90 ? 'cumplen' : 'requieren mejora para alcanzar'} el objetivo del 90%.</li>
          <li>La tasa de defectos del ${data.metrics.defectRate.toFixed(2)}% ${data.metrics.defectRate <= 2.5 ? 'está dentro' : 'excede'} del rango aceptable (<2.5%).</li>
          <li>El margen de beneficio del ${data.metrics.profitMargin.toFixed(1)}% muestra ${data.metrics.profitMargin >= 30 ? 'una rentabilidad sólida' : 'oportunidades de mejora'}.</li>
        </ul>
        
        <p><strong>Recomendaciones:</strong></p>
        <ul>
          <li>Continuar con los programas de formación del personal para mantener la calidad.</li>
          <li>Implementar mejoras en los procesos de control de calidad.</li>
          <li>Optimizar la planificación de producción para mejorar los tiempos de entrega.</li>
          <li>Revisar los costos de materiales para aumentar el margen de beneficio.</li>
        </ul>
      </div>

      <div class="footer">
        <p>Reporte generado automáticamente por el Sistema de Producción Lovilike</p>
        <p>Para más información, contacte con el departamento de producción</p>
      </div>
    </body>
    </html>
  `
  
  return htmlContent
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { period, includeCharts, format } = await request.json()

    // Fetch data for the report
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    const [metricsResponse, ordersResponse, workersResponse] = await Promise.all([
      fetch(`${baseUrl}/api/production-reports/metrics?period=${period}`),
      fetch(`${baseUrl}/api/production-reports/orders?period=${period}`),
      fetch(`${baseUrl}/api/production-reports/workers?period=${period}`)
    ])

    const metrics = await metricsResponse.json()
    const orders = await ordersResponse.json()
    const workers = await workersResponse.json()

    // Get top 10 orders by efficiency
    const topOrders = orders
      .filter((order: any) => order.status === 'COMPLETED')
      .sort((a: any, b: any) => b.efficiency - a.efficiency)
      .slice(0, 10)

    const reportData = {
      period,
      metrics,
      topOrders,
      workers,
      generatedAt: new Date().toISOString()
    }

    if (format === 'pdf') {
      // Generate HTML report (in a real implementation, this would use a PDF library like Puppeteer)
      const htmlReport = generatePDFReport(reportData)
      
      // For demo purposes, return HTML content
      // In production, you would convert this to PDF using libraries like puppeteer, jsPDF, etc.
      const blob = Buffer.from(htmlReport, 'utf-8')
      
      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="reporte-produccion-${period}-${new Date().toISOString().split('T')[0]}.html"`
        }
      })
    } else {
      // Return JSON data
      return NextResponse.json(reportData)
    }

  } catch (error) {
    console.error("Error generating production report:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}