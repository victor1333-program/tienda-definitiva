const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function analyzeCurrentData() {
  console.log('🔍 ANÁLISIS DE DATOS ACTUALES')
  console.log('=' .repeat(50))
  
  try {
    // Usuarios
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            addresses: true,
            customerDesigns: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`\n👤 USUARIOS (${users.length}):`)
    users.forEach(user => {
      console.log(`   ${user.email} (${user.role}) - Órdenes: ${user._count.orders}, Diseños: ${user._count.customerDesigns}`)
    })
    
    // Órdenes
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        customerEmail: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            orderItems: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`\n🛒 ÓRDENES (${orders.length}):`)
    if (orders.length > 0) {
      orders.slice(0, 10).forEach(order => {
        console.log(`   ${order.customerEmail} - €${order.totalAmount} (${order.status}) - ${order._count.orderItems} items`)
      })
      if (orders.length > 10) {
        console.log(`   ... y ${orders.length - 10} más`)
      }
    } else {
      console.log('   No hay órdenes')
    }
    
    // Productos
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        featured: true,
        _count: {
          select: {
            variants: true,
            designVariants: true
          }
        }
      }
    })
    
    console.log(`\n📦 PRODUCTOS (${products.length}):`)
    if (products.length > 0) {
      products.slice(0, 5).forEach(product => {
        console.log(`   ${product.name} - Variantes: ${product._count.variants}, Designs: ${product._count.designVariants}`)
      })
      if (products.length > 5) {
        console.log(`   ... y ${products.length - 5} más`)
      }
    }
    
    // Categorías
    const categories = await prisma.category.findMany({
      select: {
        name: true,
        isActive: true,
        isSystem: true,
        _count: {
          select: {
            productCategories: true
          }
        }
      }
    })
    
    console.log(`\n📁 CATEGORÍAS (${categories.length}):`)
    categories.forEach(cat => {
      const type = cat.isSystem ? '[SISTEMA]' : '[CUSTOM]'
      console.log(`   ${cat.name} ${type} - Productos: ${cat._count.productCategories}`)
    })
    
    // Diseños de clientes
    const customerDesigns = await prisma.customerDesign.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        customer: {
          select: {
            email: true
          }
        },
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`\n🎨 DISEÑOS DE CLIENTES (${customerDesigns.length}):`)
    if (customerDesigns.length > 0) {
      customerDesigns.slice(0, 5).forEach(design => {
        console.log(`   ${design.name || 'Sin nombre'} (${design.status}) - ${design.customer?.email || 'Sin usuario'}`)
      })
      if (customerDesigns.length > 5) {
        console.log(`   ... y ${customerDesigns.length - 5} más`)
      }
    }
    
    // Notificaciones
    const notifications = await prisma.notification.count()
    console.log(`\n🔔 NOTIFICACIONES: ${notifications}`)
    
    // Descuentos
    const discounts = await prisma.discount.findMany({
      select: {
        code: true,
        usedCount: true,
        isActive: true
      }
    })
    
    console.log(`\n🎟️  DESCUENTOS (${discounts.length}):`)
    discounts.forEach(discount => {
      const status = discount.isActive ? '[ACTIVO]' : '[INACTIVO]'
      console.log(`   ${discount.code} ${status} - Usado: ${discount.usedCount} veces`)
    })
    
    // Stock de productos
    const stockItems = await prisma.productVariant.findMany({
      where: {
        stock: {
          gt: 0
        }
      },
      select: {
        sku: true,
        stock: true,
        product: {
          select: {
            name: true
          }
        }
      }
    })
    
    console.log(`\n📊 PRODUCTOS CON STOCK (${stockItems.length}):`)
    stockItems.slice(0, 10).forEach(item => {
      console.log(`   ${item.product.name} (${item.sku}) - Stock: ${item.stock}`)
    })
    
    // Suscripciones
    const subscriptions = await prisma.userSubscription.count()
    const loviboxSubs = await prisma.loviBoxSubscription.count()
    console.log(`\n📋 SUSCRIPCIONES:`)
    console.log(`   Suscripciones de usuario: ${subscriptions}`)
    console.log(`   Suscripciones LoviBox: ${loviboxSubs}`)
    
    // Transacciones financieras
    const transactions = await prisma.financialTransaction.count()
    console.log(`\n💰 TRANSACCIONES FINANCIERAS: ${transactions}`)
    
    // WhatsApp
    const whatsappMessages = await prisma.whatsAppMessage.count()
    console.log(`\n📱 MENSAJES WHATSAPP: ${whatsappMessages}`)
    
    console.log('\n' + '=' .repeat(50))
    console.log('📋 RESUMEN:')
    console.log(`   - ${users.length} usuarios`)
    console.log(`   - ${orders.length} órdenes`)
    console.log(`   - ${products.length} productos`)
    console.log(`   - ${categories.length} categorías`)
    console.log(`   - ${customerDesigns.length} diseños de clientes`)
    console.log(`   - ${notifications} notificaciones`)
    console.log(`   - ${discounts.length} descuentos`)
    console.log(`   - ${stockItems.length} variantes con stock`)
    console.log(`   - ${subscriptions + loviboxSubs} suscripciones totales`)
    console.log(`   - ${transactions} transacciones financieras`)
    console.log(`   - ${whatsappMessages} mensajes WhatsApp`)
    
  } catch (error) {
    console.error('❌ Error analizando datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeCurrentData()