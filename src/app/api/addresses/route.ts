import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'

// GET: Obtener direcciones
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Si es cliente, solo puede ver sus direcciones
    // Si es admin, puede ver direcciones de cualquier usuario
    let where: any = {}

    if (session.user.role === 'CUSTOMER') {
      where.userId = session.user.id
    } else if (userId) {
      where.userId = userId
    }

    const addresses = await prisma.address.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: [
        { isDefault: 'desc' } // Direcciones por defecto primero
      ]
    })

    return NextResponse.json({ addresses })

  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json(
      { error: 'Error al obtener direcciones' },
      { status: 500 }
    )
  }
}

// POST: Crear dirección
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      street,
      city,
      state,
      postalCode,
      country = 'ES',
      isDefault = false,
      userId
    } = body

    // Validaciones
    if (!name || !street || !city || !state || !postalCode) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Determinar userId
    let targetUserId = session.user.id
    if (userId && session.user.role !== 'CUSTOMER') {
      // Solo admins pueden crear direcciones para otros usuarios
      targetUserId = userId
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: targetUserId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Si es dirección por defecto, quitar el default de las otras
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: targetUserId },
        data: { isDefault: false }
      })
    }

    // Crear dirección
    const address = await prisma.address.create({
      data: {
        name,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault,
        userId: targetUserId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      address,
      message: 'Dirección creada correctamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json(
      { error: 'Error al crear dirección' },
      { status: 500 }
    )
  }
}