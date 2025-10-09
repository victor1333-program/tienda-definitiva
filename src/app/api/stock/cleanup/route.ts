import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Solo permitir esta API desde el servidor o con autorización específica
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.INTERNAL_API_KEY}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Limpiar reservas expiradas
    const result = await prisma.stockReservation.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    return NextResponse.json({
      success: true,
      cleanedReservations: result.count,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error en limpieza de reservas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Endpoint público para estadísticas (sin eliminar)
export async function GET() {
  try {
    const now = new Date()
    
    const [activeReservations, expiredReservations] = await Promise.all([
      prisma.stockReservation.count({
        where: {
          expiresAt: {
            gt: now
          }
        }
      }),
      prisma.stockReservation.count({
        where: {
          expiresAt: {
            lt: now
          }
        }
      })
    ])

    return NextResponse.json({
      activeReservations,
      expiredReservations,
      totalReservations: activeReservations + expiredReservations,
      timestamp: now.toISOString()
    })

  } catch (error) {
    console.error('Error obteniendo estadísticas de reservas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}