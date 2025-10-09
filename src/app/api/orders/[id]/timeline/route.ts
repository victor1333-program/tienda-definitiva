import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'
import { z } from 'zod'

const timelineEventSchema = z.object({
  action: z.string().min(1, 'Acción requerida'),
  description: z.string().min(1, 'Descripción requerida'),
  metadata: z.record(z.any()).optional()
})

// GET: Obtener timeline de un pedido
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const orderId = id

    // Verificar que el pedido existe
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    // Obtener eventos del timeline
    const timeline = await prisma.orderTimeline.findMany({
      where: { orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      timeline: timeline.map(event => ({
        id: event.id,
        action: event.action,
        description: event.description,
        metadata: event.metadata,
        createdAt: event.createdAt.toISOString(),
        user: event.user
      }))
    })

  } catch (error) {
    console.error('Error fetching order timeline:', error)
    return NextResponse.json(
      { error: 'Error al obtener el historial del pedido' },
      { status: 500 }
    )
  }
}

// POST: Añadir evento al timeline
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const orderId = id
    const body = await request.json()
    
    // Validar entrada
    const validatedData = timelineEventSchema.parse(body)

    // Verificar que el pedido existe
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    // Crear evento en el timeline
    await prisma.orderTimeline.create({
      data: {
        orderId,
        action: validatedData.action,
        description: validatedData.description,
        metadata: validatedData.metadata || {},
        userId: session.user.id
      }
    })

    // Obtener timeline actualizado
    const timeline = await prisma.orderTimeline.findMany({
      where: { orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      timeline: timeline.map(event => ({
        id: event.id,
        action: event.action,
        description: event.description,
        metadata: event.metadata,
        createdAt: event.createdAt.toISOString(),
        user: event.user
      }))
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: error.errors
        },
        { status: 400 }
      )
    }

    console.error('Error adding timeline event:', error)
    return NextResponse.json(
      { error: 'Error al añadir evento al historial' },
      { status: 500 }
    )
  }
}