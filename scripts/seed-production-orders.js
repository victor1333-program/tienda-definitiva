const { db } = require('../src/lib/db');
async function createProductionOrders() {
  try {
    console.log('🚀 Creando pedidos de prueba para el tablero de producción...')

    // Primero asegurarse de que tenemos productos
    let products = await db.product.findMany({ take: 3 })
    
    if (products.length === 0) {
      console.log('📦 No hay productos, creando algunos...')
      // Crear algunos productos básicos
      const product1 = await db.product.create({
        data: {
          name: 'Camiseta Personalizada',
          slug: 'camiseta-personalizada',
          basePrice: 25.99,
          description: 'Camiseta de algodón para personalización',
          stock: 100,
          canCustomize: true,
          isActive: true
        }
      })

      const product2 = await db.product.create({
        data: {
          name: 'Taza Cerámica',
          slug: 'taza-ceramica',
          basePrice: 12.50,
          description: 'Taza de cerámica blanca para sublimación',
          stock: 50,
          canCustomize: true,
          isActive: true
        }
      })

      const product3 = await db.product.create({
        data: {
          name: 'Gorra Bordada',
          slug: 'gorra-bordada',
          basePrice: 18.75,
          description: 'Gorra de algodón para bordado personalizado',
          stock: 75,
          canCustomize: true,
          isActive: true
        }
      })

      products = [product1, product2, product3]
      console.log('✅ Productos creados')
    }

    // Crear pedidos de prueba
    const orders = [
      {
        orderNumber: 'PROD-2024-001',
        status: 'PENDING',
        orderSource: 'ONLINE',
        priority: 'HIGH',
        totalAmount: 51.98,
        shippingCost: 5.99,
        taxAmount: 10.92,
        customerEmail: 'maria.garcia@email.com',
        customerName: 'María García',
        customerPhone: '+34 666 123 456',
        paymentMethod: 'stripe',
        paymentStatus: 'PAID',
        shippingMethod: 'express',
        customerNotes: 'Por favor, usar diseño enviado por email. Es para un regalo.',
        products: [products[0]] // Camiseta
      },
      {
        orderNumber: 'PROD-2024-002',
        status: 'CONFIRMED',
        orderSource: 'STORE',
        priority: 'MEDIUM',
        totalAmount: 37.50,
        shippingCost: 0,
        taxAmount: 7.88,
        customerEmail: 'carlos.ruiz@email.com',
        customerName: 'Carlos Ruiz',
        customerPhone: '+34 677 987 654',
        paymentMethod: 'cash',
        paymentStatus: 'PAID',
        shippingMethod: 'pickup',
        customerNotes: 'Cliente quiere recoger en tienda el viernes por la tarde.',
        products: [products[1], products[0]] // Taza + Camiseta
      },
      {
        orderNumber: 'PROD-2024-003',
        status: 'IN_PRODUCTION',
        orderSource: 'ONLINE',
        priority: 'URGENT',
        totalAmount: 93.75,
        shippingCost: 7.99,
        taxAmount: 21.47,
        customerEmail: 'empresa@eventos.com',
        customerName: 'Eventos & Celebraciones SL',
        customerPhone: '+34 912 345 678',
        paymentMethod: 'stripe',
        paymentStatus: 'PAID',
        shippingMethod: 'urgent',
        customerNotes: 'Pedido corporativo urgente para evento del lunes. Usar logo adjunto.',
        productionStartedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // Hace 4 horas
        estimatedCompletionDate: new Date(Date.now() + 20 * 60 * 60 * 1000), // En 20 horas
        products: [products[2], products[0], products[1]] // Gorra + Camiseta + Taza
      },
      {
        orderNumber: 'PROD-2024-004',
        status: 'READY_FOR_PICKUP',
        orderSource: 'STORE',
        priority: 'LOW',
        totalAmount: 25.99,
        shippingCost: 0,
        taxAmount: 5.46,
        customerEmail: 'ana.lopez@email.com',
        customerName: 'Ana López',
        customerPhone: '+34 688 456 789',
        paymentMethod: 'card',
        paymentStatus: 'PAID',
        shippingMethod: 'pickup',
        customerNotes: 'Diseño sencillo con texto. Ya está pagado.',
        productionStartedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hace 24 horas
        productionCompletedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
        products: [products[0]] // Camiseta
      }
    ]

    for (const orderData of orders) {
      console.log(`📝 Creando pedido ${orderData.orderNumber}...`)
      
      const { products: orderProducts, ...orderInfo } = orderData
      
      const order = await db.order.create({
        data: {
          ...orderInfo,
          orderItems: {
            create: orderProducts.map((product, index) => ({
              quantity: Math.floor(Math.random() * 3) + 1, // 1-3 unidades
              unitPrice: product.basePrice,
              totalPrice: product.basePrice * (Math.floor(Math.random() * 3) + 1),
              productId: product.id,
              customizationData: {
                text: `Personalización ${index + 1}`,
                color: ['#FF0000', '#00FF00', '#0000FF'][Math.floor(Math.random() * 3)],
                position: 'center'
              },
              productionStatus: 'PENDING'
            }))
          }
        },
        include: {
          orderItems: true
        }
      })

      console.log(`✅ Pedido ${order.orderNumber} creado con ${order.orderItems.length} productos`)
    }

    console.log('🎉 Todos los pedidos de prueba han sido creados exitosamente!')
    
    // Mostrar resumen
    const summary = await db.order.groupBy({
      by: ['status'],
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY_FOR_PICKUP']
        }
      },
      _count: true
    })

    console.log('\n📊 Resumen de pedidos en el tablero:')
    summary.forEach(group => {
      console.log(`  ${group.status}: ${group._count} pedidos`)
    })

  } catch (error) {
    console.error('❌ Error creando pedidos de prueba:', error)
  } finally {
    await db.$disconnect()
  }
}

createProductionOrders()