import { NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const orders = await db.order.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true
              }
            },
            variant: {
              select: {
                id: true,
                sku: true,
                size: true,
                colorName: true,
                price: true
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
        address: {
          select: {
            name: true,
            street: true,
            city: true,
            postalCode: true,
            country: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formatear la respuesta
    const formattedOrders = orders.map(order => {
      const images = order.orderItems[0]?.product.images ? JSON.parse(order.orderItems[0].product.images) : []
      
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.totalAmount,
        subtotal: order.totalAmount - order.shippingCost - order.taxAmount,
        shipping: order.shippingCost,
        tax: order.taxAmount,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        trackingNumber: order.trackingNumber,
        items: order.orderItems.map(item => {
          const productImages = item.product.images ? JSON.parse(item.product.images) : []
          return {
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.unitPrice,
            product: {
              id: item.product.id,
              name: item.product.name,
              slug: item.product.slug,
              image: productImages[0] || null
            },
            customization: item.customizationData,
            variant: item.variant,
            design: item.design
          }
        }),
        shippingAddress: order.shippingAddress || {
          name: order.address?.name || order.customerName,
          address: order.address?.street || '',
          city: order.address?.city || '',
          postalCode: order.address?.postalCode || '',
          phone: order.customerPhone || ''
        }
      }
    })

    return NextResponse.json(formattedOrders)

  } catch (error) {
    console.error('Error al obtener pedidos del usuario:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}