import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'

interface Params {
  params: {
    id: string
  }
}

// GET: Obtener factura específica
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: true,
            orderItems: {
              include: {
                product: true,
                variant: true
              }
            }
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    // Verificar permisos: admin o propietario del pedido
    if (session.user.role === 'CUSTOMER' && 
        invoice.order.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    return NextResponse.json({ invoice })

  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Error al obtener factura' },
      { status: 500 }
    )
  }
}

// PATCH: Actualizar factura
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const updates = await request.json()

    // Campos permitidos para actualizar
    const allowedFields = ['status', 'notes', 'paymentTerms', 'paidDate']
    const validUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)

    // Si se marca como pagada, establecer fecha de pago
    if (validUpdates.status === 'PAID' && !validUpdates.paidDate) {
      validUpdates.paidDate = new Date()
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: validUpdates,
      include: {
        order: true
      }
    })

    return NextResponse.json({
      message: 'Factura actualizada exitosamente',
      invoice
    })

  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Error al actualizar factura' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar factura (solo admin)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    await prisma.invoice.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Factura eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { error: 'Error al eliminar factura' },
      { status: 500 }
    )
  }
}