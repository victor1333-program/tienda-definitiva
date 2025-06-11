import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db as prisma } from "@/lib/db"
import { validateData, orderSchema, paginationSchema } from "@/lib/validations"
import { 
  generateOrderNumber, 
  calculateOrderTotal, 
  updateStockForOrder, 
  validateStockAvailability 
} from "@/lib/order-utils"
import { sendOrderConfirmationEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  images: true
                }
              }
            }
          },
          address: true
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    // Estadísticas rápidas
    const stats = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    })

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const todayOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: todayStart
        }
      }
    })

    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    return NextResponse.json({
      orders,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      stats: {
        totalRevenue: stats._sum.totalAmount || 0,
        totalOrders: stats._count.id || 0,
        todayOrders,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count.status
          return acc
        }, {} as Record<string, number>)
      }
    })
  } catch (error) {
    console.error("Error al obtener pedidos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validar datos del pedido
    const validation = validateData(orderSchema, data)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos del pedido inválidos", details: validation.errors },
        { status: 400 }
      )
    }

    const {
      customerEmail,
      customerName,
      customerPhone,
      shippingMethod,
      shippingAddress,
      paymentMethod,
      customerNotes,
      items,
      userId,
      addressId
    } = validation.data

    // Validar disponibilidad de stock
    const stockValidation = await validateStockAvailability(items)
    if (!stockValidation.valid) {
      return NextResponse.json(
        { error: "Problemas de stock", details: stockValidation.errors },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe si se proporciona
    let user = null
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (!user) {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        )
      }
    }

    // Verificar que la dirección existe si se proporciona
    let address = null
    if (addressId) {
      address = await prisma.address.findUnique({
        where: { id: addressId }
      })
      
      if (!address) {
        return NextResponse.json(
          { error: "Dirección no encontrada" },
          { status: 404 }
        )
      }
    }

    // Obtener método de envío para calcular costo
    const shippingMethodData = await prisma.shippingMethod.findFirst({
      where: { name: shippingMethod, isActive: true }
    })

    const shippingCost = shippingMethodData?.price || 0

    // Calcular totales
    const { subtotal, taxAmount, totalAmount } = calculateOrderTotal(items, shippingCost, 0.21) // 21% IVA España

    // Generar número de pedido único
    const orderNumber = await generateOrderNumber()

    // Crear pedido con transacción
    const order = await prisma.$transaction(async (tx) => {
      // Crear el pedido
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          totalAmount,
          shippingCost,
          taxAmount,
          customerEmail,
          customerName,
          customerPhone,
          shippingMethod,
          shippingAddress,
          paymentMethod,
          customerNotes,
          userId,
          addressId,
          orderItems: {
            create: items.map(item => ({
              productId: item.productId,
              variantId: item.variantId,
              designId: item.designId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice * item.quantity,
              customizationData: item.customizationData
            }))
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true
                }
              },
              variant: {
                select: {
                  id: true,
                  sku: true,
                  size: true,
                  color: true
                }
              },
              design: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true
                }
              }
            }
          },
          address: true
        }
      })

      // Actualizar stock
      await updateStockForOrder(items, 'reserve')

      return newOrder
    })

    // Enviar email de confirmación (no bloquear si falla)
    try {
      await sendOrderConfirmationEmail(order)
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError)
      // No fallar la creación del pedido si el email falla
    }

    return NextResponse.json({
      order,
      message: 'Pedido creado correctamente'
    }, { status: 201 })

  } catch (error) {
    console.error("Error al crear pedido:", error)
    
    if (error instanceof Error && error.message.includes('Stock insuficiente')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}