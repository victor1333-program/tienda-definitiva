import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    const customer = await db.user.findUnique({
      where: { 
        id: id,
        role: "CUSTOMER"
      },
      include: {
        addresses: true,
        orders: {
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    name: true,
                    images: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      )
    }

    // Calcular estadísticas
    const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const totalOrders = customer.orders.length
    const lastOrderDate = customer.orders.length > 0 ? customer.orders[0].createdAt : null
    
    // Calcular meses como cliente
    const monthsAsCustomer = Math.floor(
      (new Date().getTime() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
    )

    // Clasificación RFM simplificada
    let rfmSegment = "Nuevo cliente"
    if (totalOrders > 5 && totalSpent > 200) {
      rfmSegment = "Cliente VIP"
    } else if (totalOrders > 2 && totalSpent > 100) {
      rfmSegment = "Cliente regular"
    } else if (totalOrders > 0) {
      rfmSegment = "Cliente ocasional"
    }

    const customerWithStats = {
      ...customer,
      stats: {
        totalSpent,
        totalOrders,
        lastOrderDate,
        monthsAsCustomer,
        rfmSegment,
        averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0
      }
    }

    return NextResponse.json(customerWithStats)
  } catch (error) {
    console.error("Error al obtener cliente:", error)
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
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    // Validar que el cliente existe
    const existingCustomer = await db.user.findUnique({
      where: { 
        id: id,
        role: "CUSTOMER"
      }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      )
    }

    // Actualizar cliente
    const updatedCustomer = await db.user.update({
      where: { id: id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
      include: {
        addresses: true
      }
    })

    return NextResponse.json(updatedCustomer)
  } catch (error) {
    console.error("Error al actualizar cliente:", error)
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
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    // Verificar que el cliente existe y no tiene pedidos
    const customer = await db.user.findUnique({
      where: { 
        id: id,
        role: "CUSTOMER"
      },
      include: {
        orders: true
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      )
    }

    if (customer.orders.length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un cliente con pedidos" },
        { status: 400 }
      )
    }

    // Eliminar direcciones primero
    await db.address.deleteMany({
      where: { userId: id }
    })

    // Eliminar cliente
    await db.user.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: "Cliente eliminado exitosamente" })
  } catch (error) {
    console.error("Error al eliminar cliente:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}