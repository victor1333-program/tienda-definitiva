import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Create some sample data for testing
    
    // First check if we already have data
    const existingOrders = await db.order.count()
    if (existingOrders > 0) {
      return NextResponse.json({ 
        message: 'Ya existen datos de prueba',
        orders: existingOrders 
      })
    }

    // Create sample categories
    const category = await db.category.create({
      data: {
        name: 'Textiles Personalizados',
        slug: 'textiles-personalizados',
        description: 'Productos textiles para personalización'
      }
    })

    // Create sample products
    const products = await db.product.createMany({
      data: [
        {
          name: 'Camiseta Básica',
          slug: 'camiseta-basica',
          description: 'Camiseta de algodón 100% para personalización DTF',
          basePrice: 12.99,
          images: JSON.stringify(['camiseta-blanca.jpg']),
          personalizationType: 'DTF',
          materialType: 'cotton',
          categoryId: category.id
        },
        {
          name: 'Taza Cerámica',
          slug: 'taza-ceramica',
          description: 'Taza de cerámica blanca para sublimación',
          basePrice: 8.50,
          images: JSON.stringify(['taza-blanca.jpg']),
          personalizationType: 'SUBLIMATION',
          materialType: 'ceramic',
          categoryId: category.id
        }
      ]
    })

    const createdProducts = await db.product.findMany({
      where: {
        categoryId: category.id
      }
    })

    // Create sample orders
    const orders = await Promise.all([
      db.order.create({
        data: {
          orderNumber: 'ORD-2024-001',
          status: 'CONFIRMED',
          totalAmount: 25.99,
          customerEmail: 'maria@example.com',
          customerName: 'María García',
          customerPhone: '+34 600 123 456',
          shippingMethod: 'standard',
          paymentMethod: 'card',
          paymentStatus: 'PAID'
        }
      }),
      db.order.create({
        data: {
          orderNumber: 'ORD-2024-002',
          status: 'CONFIRMED',
          totalAmount: 17.00,
          customerEmail: 'carlos@example.com',
          customerName: 'Carlos López',
          customerPhone: '+34 600 123 457',
          shippingMethod: 'standard',
          paymentMethod: 'card',
          paymentStatus: 'PAID'
        }
      }),
      db.order.create({
        data: {
          orderNumber: 'ORD-2024-003',
          status: 'IN_PRODUCTION',
          totalAmount: 34.50,
          customerEmail: 'ana@example.com',
          customerName: 'Ana Martínez',
          customerPhone: '+34 600 123 458',
          shippingMethod: 'express',
          paymentMethod: 'card',
          paymentStatus: 'PAID'
        }
      })
    ])

    // Create order items (production tasks)
    await Promise.all([
      db.orderItem.create({
        data: {
          orderId: orders[0].id,
          productId: createdProducts[0].id,
          quantity: 2,
          unitPrice: 12.99,
          totalPrice: 25.98,
          productionStatus: 'PENDING',
          productionNotes: 'Diseño personalizado con logo de empresa'
        }
      }),
      db.orderItem.create({
        data: {
          orderId: orders[1].id,
          productId: createdProducts[1].id,
          quantity: 2,
          unitPrice: 8.50,
          totalPrice: 17.00,
          productionStatus: 'PENDING',
          productionNotes: 'Sublimación con diseño personalizado'
        }
      }),
      db.orderItem.create({
        data: {
          orderId: orders[2].id,
          productId: createdProducts[0].id,
          quantity: 1,
          unitPrice: 12.99,
          totalPrice: 12.99,
          productionStatus: 'IN_PROGRESS',
          productionNotes: 'Camiseta con estampado DTF'
        }
      }),
      db.orderItem.create({
        data: {
          orderId: orders[2].id,
          productId: createdProducts[1].id,
          quantity: 2,
          unitPrice: 8.50,
          totalPrice: 17.00,
          productionStatus: 'PENDING',
          productionNotes: 'Tazas con sublimación personalizada'
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Datos de prueba creados exitosamente',
      created: {
        category: 1,
        products: createdProducts.length,
        orders: orders.length,
        orderItems: 4
      }
    })

  } catch (error) {
    console.error('Error creating seed data:', error)
    return NextResponse.json(
      { error: 'Error creando datos de prueba', details: error },
      { status: 500 }
    )
  }
}