const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function cleanForProduction() {
  console.log('🧹 LIMPIEZA DE BASE DE DATOS PARA PRODUCCIÓN')
  console.log('=' .repeat(50))
  
  try {
    console.log('⚠️  Esta operación eliminará:')
    console.log('   - 3 usuarios de ejemplo (mantendrá admin@lovilike.es)')
    console.log('   - Todos los datos transaccionales (órdenes, diseños, etc.)')
    console.log('   - Resetear stock a 0 en todos los productos')
    console.log('   - Resetear contadores de descuentos')
    console.log('\n📦 Se mantendrán:')
    console.log('   - 13 productos con sus variantes')
    console.log('   - 8 categorías del sistema')
    console.log('   - 2 descuentos básicos')
    console.log('   - Configuraciones del sistema')
    console.log('\n🔄 Iniciando en 3 segundos... (Ctrl+C para cancelar)')
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    console.log('\n🚀 Iniciando limpieza...')
    
    // 1. Eliminar usuarios que no sean admin@lovilike.es
    console.log('👤 Eliminando usuarios de ejemplo...')
    
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          not: 'admin@lovilike.es'
        }
      }
    })
    
    console.log(`✅ ${deletedUsers.count} usuarios eliminados`)
    
    // 2. Asegurar que el usuario admin existe y tiene los permisos correctos
    console.log('🔑 Verificando usuario administrador...')
    
    let adminUser = await prisma.user.findUnique({
      where: { email: 'admin@lovilike.es' }
    })
    
    if (!adminUser) {
      console.log('👤 Creando usuario administrador...')
      const hashedPassword = await bcrypt.hash('Admin123!Lovilike', 12)
      
      adminUser = await prisma.user.create({
        data: {
          name: 'Administrador Lovilike',
          email: 'admin@lovilike.es',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          emailVerified: new Date()
        }
      })
      
      console.log('✅ Usuario administrador creado')
    } else {
      // Actualizar para asegurar que es SUPER_ADMIN
      await prisma.user.update({
        where: { email: 'admin@lovilike.es' },
        data: {
          role: 'SUPER_ADMIN',
          emailVerified: new Date()
        }
      })
      
      console.log('✅ Usuario administrador actualizado')
    }
    
    // 3. Resetear stock de productos a 0 (para empezar desde cero)
    console.log('📦 Reseteando stock de productos...')
    
    const stockReset = await prisma.productVariant.updateMany({
      data: {
        stock: 0
      }
    })
    
    console.log(`✅ Stock reseteado en ${stockReset.count} variantes`)
    
    // 4. Resetear contadores de descuentos
    console.log('🎟️  Reseteando contadores de descuentos...')
    
    const discountReset = await prisma.discount.updateMany({
      data: {
        usedCount: 0
      }
    })
    
    console.log(`✅ Contadores reseteados en ${discountReset.count} descuentos`)
    
    // 5. Limpiar notificaciones (si existen)
    const notifications = await prisma.notification.deleteMany()
    console.log(`✅ ${notifications.count} notificaciones eliminadas`)
    
    // 6. Asegurar configuraciones básicas
    console.log('⚙️  Verificando configuraciones del sistema...')
    
    const settingsCount = await prisma.setting.count()
    if (settingsCount === 0) {
      await prisma.setting.createMany({
        data: [
          {
            key: 'site_name',
            value: JSON.stringify('Lovilike')
          },
          {
            key: 'site_description', 
            value: JSON.stringify('Tienda online de productos personalizados')
          },
          {
            key: 'maintenance_mode',
            value: JSON.stringify(false)
          },
          {
            key: 'allow_registration',
            value: JSON.stringify(true)
          }
        ]
      })
      console.log('✅ Configuraciones básicas creadas')
    } else {
      console.log(`✅ ${settingsCount} configuraciones verificadas`)
    }
    
    // 7. Verificar estado final
    console.log('\n📊 Verificando estado final...')
    
    const finalStats = {
      users: await prisma.user.count(),
      products: await prisma.product.count(),
      categories: await prisma.category.count(),
      variants: await prisma.productVariant.count(),
      discounts: await prisma.discount.count(),
      settings: await prisma.setting.count()
    }
    
    console.log('✅ Estado final:')
    console.log(`   👤 Usuarios: ${finalStats.users}`)
    console.log(`   📦 Productos: ${finalStats.products}`)
    console.log(`   📁 Categorías: ${finalStats.categories}`)
    console.log(`   🏷️  Variantes: ${finalStats.variants}`)
    console.log(`   🎟️  Descuentos: ${finalStats.discounts}`)
    console.log(`   ⚙️  Configuraciones: ${finalStats.settings}`)
    
    if (finalStats.users === 1) {
      console.log('✅ Solo queda el usuario administrador')
    } else {
      console.warn(`⚠️  Advertencia: hay ${finalStats.users} usuarios`)
    }
    
    console.log('\n🎉 ¡LIMPIEZA COMPLETADA!')
    console.log('=' .repeat(50))
    console.log('La base de datos está lista para testing de producción.')
    console.log('\n🔑 CREDENCIALES DE ADMINISTRADOR:')
    console.log('📧 Email: admin@lovilike.es')
    console.log('🔑 Password: Admin123!Lovilike')
    console.log('\n⚠️  IMPORTANTE:')
    console.log('   - Cambia la contraseña después del primer login')
    console.log('   - Configura el stock de productos según necesites')
    console.log('   - Revisa las configuraciones del sistema')
    console.log('   - La web está lista para crear nuevos usuarios/pedidos')
    
  } catch (error) {
    console.error('\n❌ Error durante la limpieza:', error)
    console.error('Operación abortada para preservar datos.')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Función para hacer solo verificación sin cambios
async function checkStatus() {
  console.log('🔍 VERIFICACIÓN DEL ESTADO ACTUAL')
  console.log('=' .repeat(40))
  
  try {
    const stats = {
      users: await prisma.user.count(),
      adminExists: await prisma.user.count({
        where: { email: 'admin@lovilike.es' }
      }),
      orders: await prisma.order.count(),
      designs: await prisma.customerDesign.count(),
      products: await prisma.product.count(),
      categories: await prisma.category.count(),
      stockItems: await prisma.productVariant.count({
        where: { stock: { gt: 0 } }
      }),
      discounts: await prisma.discount.count()
    }
    
    console.log(`👤 Usuarios totales: ${stats.users}`)
    console.log(`🔑 Usuario admin existe: ${stats.adminExists ? 'SÍ' : 'NO'}`)
    console.log(`🛒 Órdenes: ${stats.orders}`)
    console.log(`🎨 Diseños: ${stats.designs}`)
    console.log(`📦 Productos: ${stats.products}`)
    console.log(`📁 Categorías: ${stats.categories}`)
    console.log(`📊 Variantes con stock: ${stats.stockItems}`)
    console.log(`🎟️  Descuentos: ${stats.discounts}`)
    
    if (stats.users === 1 && stats.adminExists === 1 && stats.orders === 0 && stats.designs === 0) {
      console.log('\n✅ Base de datos ya está limpia para producción')
    } else {
      console.log('\n⚠️  Base de datos necesita limpieza')
      console.log(`   - ${stats.users - stats.adminExists} usuarios de ejemplo`)
      console.log(`   - ${stats.orders} órdenes de prueba`)
      console.log(`   - ${stats.designs} diseños de prueba`)
    }
    
  } catch (error) {
    console.error('❌ Error verificando estado:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Permitir ejecutar con --check para solo verificar
if (process.argv.includes('--check')) {
  checkStatus()
} else {
  cleanForProduction()
}