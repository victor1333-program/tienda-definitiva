import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const resolvedParams = await params;
    const shape = await prisma.personalizationShape.findUnique({
      where: { id: resolvedParams.id },
      include: {
        usages: {
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                createdAt: true,
              }
            }
          }
        }
      }
    })

    if (!shape) {
      return NextResponse.json({ error: 'Forma no encontrada' }, { status: 404 })
    }

    return NextResponse.json(shape)
  } catch (error) {
    console.error('Error fetching shape:', error)
    return NextResponse.json(
      { error: 'Error al obtener forma' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, category, isMask, tags } = body

    const shape = await prisma.personalizationShape.update({
      where: { id: resolvedParams.id },
      data: {
        name,
        category,
        isMask,
        tags,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(shape)
  } catch (error) {
    console.error('Error updating shape:', error)
    return NextResponse.json(
      { error: 'Error al actualizar forma' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si la forma está siendo usada
    const usages = await prisma.personalizationShapeUsage.count({
      where: { shapeId: resolvedParams.id }
    })

    if (usages > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una forma que está siendo utilizada' },
        { status: 400 }
      )
    }

    await prisma.personalizationShape.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting shape:', error)
    return NextResponse.json(
      { error: 'Error al eliminar forma' },
      { status: 500 }
    )
  }
}