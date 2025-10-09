import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'

interface Params {
  params: {
    id: string
  }
}

// GET: Obtener dirección por ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const address = await prisma.address.findUnique({
      where: { id: params.id },
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
      }
    })

    if (!address) {
      return NextResponse.json(
        { error: 'Dirección no encontrada' },
        { status: 404 }
      )
    }

    // Verificar permisos: solo el propietario o admins pueden ver la dirección
    if (address.userId !== session.user.id && session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    return NextResponse.json({ address })

  } catch (error) {
    console.error('Error fetching address:', error)
    return NextResponse.json(
      { error: 'Error al obtener dirección' },
      { status: 500 }
    )
  }
}

// PATCH: Actualizar dirección
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que la dirección existe
    const existingAddress = await prisma.address.findUnique({
      where: { id: params.id }
    })

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Dirección no encontrada' },
        { status: 404 }
      )
    }

    // Verificar permisos: solo el propietario o admins pueden editar
    if (existingAddress.userId !== session.user.id && session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado para editar esta dirección' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault
    } = body

    // Si se está marcando como por defecto, quitar el default de las otras del mismo usuario
    if (isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: existingAddress.userId,
          id: { not: params.id }
        },
        data: { isDefault: false }
      })
    }

    // Actualizar dirección
    const address = await prisma.address.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(street !== undefined && { street }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(postalCode !== undefined && { postalCode }),
        ...(country !== undefined && { country }),
        ...(isDefault !== undefined && { isDefault })
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
      message: 'Dirección actualizada correctamente'
    })

  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json(
      { error: 'Error al actualizar dirección' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar dirección
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que la dirección existe
    const existingAddress = await prisma.address.findUnique({
      where: { id: params.id },
      include: {
        orders: true
      }
    })

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Dirección no encontrada' },
        { status: 404 }
      )
    }

    // Verificar permisos: solo el propietario o admins pueden eliminar
    if (existingAddress.userId !== session.user.id && session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado para eliminar esta dirección' },
        { status: 403 }
      )
    }

    // Verificar que no tiene pedidos asociados
    if (existingAddress.orders.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una dirección con pedidos asociados' },
        { status: 400 }
      )
    }

    // Si era la dirección por defecto, establecer otra como por defecto si existe
    if (existingAddress.isDefault) {
      const otherAddress = await prisma.address.findFirst({
        where: { 
          userId: existingAddress.userId,
          id: { not: params.id }
        }
      })

      if (otherAddress) {
        await prisma.address.update({
          where: { id: otherAddress.id },
          data: { isDefault: true }
        })
      }
    }

    // Eliminar dirección
    await prisma.address.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Dirección eliminada correctamente'
    })

  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json(
      { error: 'Error al eliminar dirección' },
      { status: 500 }
    )
  }
}