import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    const order = await db.order.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                basePrice: true
              }
            }
          }
        },
        address: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error al obtener pedido:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    // Verificar que el pedido existe
    const existingOrder = await db.order.findUnique({
      where: { id: id },
      include: {
        orderItems: true
      }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      )
    }

    // TODO: Restaurar stock por variantes cuando se cancele
    // if (data.status === "CANCELLED" && existingOrder.status !== "CANCELLED") {
    //   for (const item of existingOrder.orderItems) {
    //     await db.product.update({
    //       where: { id: item.productId },
    //       data: {
    //         stock: {
    //           increment: item.quantity
    //         }
    //       }
    //     })
    //   }
    // }

    // Actualizar pedido
    const updatedOrder = await db.order.update({
      where: { id: id },
      data: {
        status: data.status,
        customerNotes: data.notes,
        shippingCost: data.shippingCost,
        trackingNumber: data.trackingNumber,
        ...(data.status === "DELIVERED" && { deliveredAt: new Date() })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                basePrice: true
              }
            }
          }
        },
        address: true
      }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Error al actualizar pedido:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    // Verificar que el pedido existe
    const order = await db.order.findUnique({
      where: { id: id },
      include: {
        orderItems: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      )
    }

    // Solo permitir eliminar pedidos pendientes o cancelados
    if (order.status !== "PENDING" && order.status !== "CANCELLED") {
      return NextResponse.json(
        { error: "Solo se pueden eliminar pedidos pendientes o cancelados" },
        { status: 400 }
      )
    }

    // TODO: Restaurar stock por variantes si el pedido no estaba cancelado
    // if (order.status !== "CANCELLED") {
    //   for (const item of order.orderItems) {
    //     await db.product.update({
    //       where: { id: item.productId },
    //       data: {
    //         stock: {
    //           increment: item.quantity
    //         }
    //       }
    //     })
    //   }
    // }

    // No necesitamos eliminar la dirección porque es una relación

    // Eliminar items del pedido
    await db.orderItem.deleteMany({
      where: { orderId: id }
    })

    // Eliminar pedido
    await db.order.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: "Pedido eliminado exitosamente" })
  } catch (error) {
    console.error("Error al eliminar pedido:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}