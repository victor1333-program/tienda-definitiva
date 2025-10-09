import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

// Export loyalty program data
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { format } = await request.json()

    // Fetch all loyalty program data
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    const [customersResponse, configResponse, statsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/loyalty-program/customers`),
      fetch(`${baseUrl}/api/loyalty-program/config`),
      fetch(`${baseUrl}/api/loyalty-program/stats`)
    ])

    const customers = await customersResponse.json()
    const config = await configResponse.json()
    const stats = await statsResponse.json()

    if (format === 'csv') {
      // Generate CSV format
      let csvContent = ""
      
      // Add header
      csvContent += "PROGRAMA DE FIDELIZACION - LOVILIKE\n"
      csvContent += `Generado: ${new Date().toLocaleString('es-ES')}\n\n`
      
      // Program summary
      csvContent += "RESUMEN DEL PROGRAMA\n"
      csvContent += "Nombre,Estado,Puntos por Euro,Canje Minimo,Caducidad\n"
      csvContent += `"${config.name}","${config.isActive ? 'Activo' : 'Inactivo'}",${config.pointsPerEuro},${config.minimumRedemption},${config.expirationMonths} meses\n\n`
      
      // Statistics
      csvContent += "ESTADISTICAS\n"
      csvContent += "Metrica,Valor\n"
      csvContent += `Total Miembros,${stats.totalMembers}\n`
      csvContent += `Miembros Activos,${stats.activeMembers}\n`
      csvContent += `Puntos Emitidos,${stats.pointsIssued}\n`
      csvContent += `Recompensas Canjeadas,${stats.rewardsRedeemed}\n`
      csvContent += `Promedio Puntos,${stats.averagePoints}\n`
      csvContent += `Tasa Conversion,${stats.conversionRate}%\n\n`
      
      // Tier distribution
      csvContent += "DISTRIBUCION POR NIVELES\n"
      csvContent += "Nivel,Cantidad,Porcentaje\n"
      stats.tierDistribution.forEach((tier: any) => {
        csvContent += `"${tier.tier}",${tier.count},${tier.percentage}%\n`
      })
      csvContent += "\n"
      
      // Top rewards
      csvContent += "RECOMPENSAS MAS POPULARES\n"
      csvContent += "Recompensa,Veces Canjeadas,Puntos Utilizados\n"
      stats.topRewards.forEach((reward: any) => {
        csvContent += `"${reward.rewardName}",${reward.timesRedeemed},${reward.pointsUsed}\n`
      })
      csvContent += "\n"
      
      // Customer details
      csvContent += "DETALLE DE CLIENTES\n"
      csvContent += "Nombre,Email,Puntos Totales,Puntos Disponibles,Nivel Actual,Gasto Total,Recompensas Canjeadas,Fecha Registro,Ultima Actividad\n"
      customers.forEach((customer: any) => {
        csvContent += `"${customer.customerName}","${customer.customerEmail}",${customer.totalPoints},${customer.availablePoints},"${customer.currentTier}",${customer.lifetimeSpent},${customer.rewardsRedeemed},"${customer.joinDate}","${customer.lastActivity}"\n`
      })
      csvContent += "\n"
      
      // Tiers configuration
      csvContent += "CONFIGURACION DE NIVELES\n"
      csvContent += "Nivel,Puntos Minimos,Multiplicador,Envio Gratis,Soporte Prioritario,Ofertas Exclusivas,Bonus Cumpleanos\n"
      config.tiers.forEach((tier: any) => {
        csvContent += `"${tier.name}",${tier.minPoints},${tier.multiplier},"${tier.perks.freeShipping ? 'Si' : 'No'}","${tier.perks.prioritySupport ? 'Si' : 'No'}","${tier.perks.exclusiveOffers ? 'Si' : 'No'}",${tier.perks.birthdayBonus}\n`
      })
      csvContent += "\n"
      
      // Rewards configuration
      csvContent += "CONFIGURACION DE RECOMPENSAS\n"
      csvContent += "Nombre,Descripcion,Costo Puntos,Tipo,Valor,Estado,Categoria\n"
      config.rewards.forEach((reward: any) => {
        csvContent += `"${reward.name}","${reward.description}",${reward.pointsCost},"${reward.type}",${reward.value},"${reward.isActive ? 'Activo' : 'Inactivo'}","${reward.category}"\n`
      })
      
      const blob = Buffer.from(csvContent, 'utf-8')
      
      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="loyalty-program-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }
    
    // Default JSON format
    const exportData = {
      exportDate: new Date().toISOString(),
      program: config,
      statistics: stats,
      customers: customers.map((customer: any) => ({
        ...customer,
        // Remove sensitive data if needed
        pointsHistory: customer.pointsHistory?.slice(0, 10) // Limit history for export
      })),
      summary: {
        totalCustomers: customers.length,
        totalPointsIssued: customers.reduce((sum: number, customer: any) => sum + customer.totalPoints, 0),
        totalLifetimeSpent: customers.reduce((sum: number, customer: any) => sum + customer.lifetimeSpent, 0),
        averageCustomerValue: customers.reduce((sum: number, customer: any) => sum + customer.lifetimeSpent, 0) / customers.length
      }
    }
    
    return NextResponse.json(exportData)

  } catch (error) {
    console.error("Error exporting loyalty program data:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}