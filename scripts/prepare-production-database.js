const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function createBackup() {
  console.log('🔄 Creando backup de la base de datos...')
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(__dirname, '..', 'backups')
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
  
  const backupFile = path.join(backupDir, `pre-production-backup-${timestamp}.sql`)
  
  console.log('📁 Backup creado conceptualmente en:', backupFile)
  console.log('⚠️  IMPORTANTE: Hacer backup real de PostgreSQL antes de continuar')
  console.log('   Comando: pg_dump $DATABASE_URL > ' + backupFile)
}

async function cleanDatabase() {
  console.log('🧹 Iniciando limpieza de base de datos para producción...')
  
  try {
    // 1. Eliminar datos transaccionales y de prueba (en orden para respetar foreign keys)
    console.log('🔄 Eliminando datos transaccionales...')
    
    // Órdenes y elementos relacionados
    await prisma.orderItem.deleteMany()
    await prisma.orderStatusHistory.deleteMany()
    await prisma.order.deleteMany()
    console.log('✅ Órdenes eliminadas')
    
    // Personalización y diseños de usuarios
    await prisma.customerDesign.deleteMany()
    await prisma.personalizationImageUsage.deleteMany()
    await prisma.personalizationShapeUsage.deleteMany()
    console.log('✅ Diseños de clientes eliminados')
    
    // Notificaciones
    await prisma.notification.deleteMany()
    console.log('✅ Notificaciones eliminadas')
    
    // Movimientos de inventario y stock
    await prisma.brandStockMovement.deleteMany()
    await prisma.materialMovement.deleteMany()
    console.log('✅ Movimientos de stock eliminados')
    
    // Transacciones financieras
    await prisma.financialTransaction.deleteMany()
    console.log('✅ Transacciones financieras eliminadas')
    
    // Suscripciones y LoviBox
    await prisma.loviBoxProductionTask.deleteMany()
    await prisma.loviBoxSubscription.deleteMany()
    await prisma.userSubscription.deleteMany()
    console.log('✅ Suscripciones eliminadas')
    
    // WhatsApp y comunicaciones
    await prisma.whatsAppMessage.deleteMany()
    console.log('✅ Mensajes WhatsApp eliminados')
    
    // Descuentos usados
    await prisma.discount.deleteMany({
      where: {
        usedCount: {
          gt: 0
        }
      }
    })
    console.log('✅ Descuentos usados eliminados')
    
    // Facturas y reembolsos
    await prisma.refund.deleteMany()
    await prisma.invoice.deleteMany()
    console.log('✅ Facturas y reembolsos eliminados')
    
    // Control de calidad específico
    await prisma.qualityCheck.deleteMany()
    console.log('✅ Controles de calidad eliminados')
    
    // Reportes de producción específicos
    await prisma.productionReport.deleteMany()
    console.log('✅ Reportes de producción eliminados')
    
    // 2. Eliminar usuarios que no sean admin@lovilike.es
    console.log('🔄 Limpiando usuarios...')
    
    // Primero eliminar direcciones de usuarios no-admin
    await prisma.address.deleteMany({
      where: {
        user: {
          email: {
            not: 'admin@lovilike.es'
          }
        }
      }
    })
    
    // Eliminar cuentas y sesiones de usuarios no-admin
    await prisma.account.deleteMany({
      where: {
        user: {
          email: {
            not: 'admin@lovilike.es'
          }
        }
      }
    })
    
    await prisma.session.deleteMany({
      where: {
        user: {
          email: {
            not: 'admin@lovilike.es'
          }
        }
      }
    })
    
    // Eliminar usuarios no-admin
    await prisma.user.deleteMany({
      where: {
        email: {
          not: 'admin@lovilike.es'
        }
      }
    })
    
    console.log('✅ Usuarios limpiados (mantenido admin@lovilike.es)')
    
    // 3. Resetear contadores en productos y variantes
    await prisma.productVariant.updateMany({
      data: {
        stock: 0
      }
    })
    
    await prisma.product.updateMany({
      data: {
        featured: false,
        isActive: true
      }
    })
    
    console.log('✅ Stock de productos reseteado')
    
    // 4. Limpiar estadísticas y contadores
    await prisma.discount.updateMany({
      data: {
        usedCount: 0
      }
    })
    
    console.log('✅ Contadores de descuentos reseteados')
    
    console.log('🎉 Limpieza completada exitosamente!')
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
    throw error
  }
}

async function ensureAdminUser() {
  console.log('🔄 Verificando usuario administrador...')
  
  const adminEmail = 'admin@lovilike.es'
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  })
  
  if (!adminUser) {
    console.log('👤 Creando usuario administrador...')
    const hashedPassword = await bcrypt.hash('Admin123!', 12)
    
    adminUser = await prisma.user.create({
      data: {
        name: 'Administrador Lovilike',
        email: adminEmail,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        emailVerified: new Date()
      }
    })
    
    console.log('✅ Usuario administrador creado')
  } else {
    // Actualizar usuario existente para asegurar que es SUPER_ADMIN
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: 'SUPER_ADMIN',
        emailVerified: new Date()
      }
    })
    
    console.log('✅ Usuario administrador verificado y actualizado')
  }
  
  return adminUser
}

async function verifyDatabaseIntegrity() {
  console.log('🔄 Verificando integridad de la base de datos...')
  
  const counts = {
    users: await prisma.user.count(),
    products: await prisma.product.count(),
    categories: await prisma.category.count(),
    orders: await prisma.order.count(),
    designs: await prisma.customerDesign.count(),
    notifications: await prisma.notification.count()
  }
  
  console.log('📊 Estado final de la base de datos:')
  console.log('   👤 Usuarios:', counts.users)
  console.log('   📦 Productos:', counts.products)
  console.log('   📁 Categorías:', counts.categories)
  console.log('   🛒 Órdenes:', counts.orders)
  console.log('   🎨 Diseños:', counts.designs)
  console.log('   🔔 Notificaciones:', counts.notifications)
  
  if (counts.users === 1) {
    console.log('✅ Solo queda el usuario administrador')
  } else {
    console.warn('⚠️  Advertencia: Hay más de un usuario en la base de datos')
  }
  
  if (counts.orders === 0 && counts.designs === 0 && counts.notifications === 0) {
    console.log('✅ Datos transaccionales limpiados correctamente')
  }
  
  return counts
}

async function setupBasicData() {
  console.log('🔄 Configurando datos básicos para producción...')
  
  // Verificar que tenemos al menos una categoría
  const categoryCount = await prisma.category.count()
  if (categoryCount === 0) {
    await prisma.category.create({
      data: {
        name: 'General',
        slug: 'general',
        description: 'Categoría general para productos',
        isActive: true,
        isSystem: true,
        sortOrder: 0
      }
    })
    console.log('✅ Categoría básica creada')
  }
  
  // Verificar configuraciones del sistema
  const settings = await prisma.setting.findMany()
  if (settings.length === 0) {
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
        }
      ]
    })
    console.log('✅ Configuraciones básicas creadas')
  }
}

async function main() {
  try {
    console.log('🚀 PREPARACIÓN DE BASE DE DATOS PARA PRODUCCIÓN')
    console.log('=' .repeat(50))
    
    // Paso 1: Backup
    await createBackup()
    
    // Confirmación de seguridad
    console.log('\n⚠️  ADVERTENCIA: Esta operación eliminará TODOS los datos de prueba.')
    console.log('   Solo se mantendrá el usuario admin@lovilike.es')
    console.log('   ¿Estás seguro de continuar? (presiona Ctrl+C para cancelar)')
    
    // Esperar 5 segundos para dar tiempo a cancelar
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Paso 2: Limpiar base de datos
    await cleanDatabase()
    
    // Paso 3: Asegurar usuario admin
    await ensureAdminUser()
    
    // Paso 4: Configurar datos básicos
    await setupBasicData()
    
    // Paso 5: Verificar integridad
    const finalCounts = await verifyDatabaseIntegrity()
    
    console.log('\n🎉 ¡PREPARACIÓN COMPLETADA!')
    console.log('=' .repeat(50))
    console.log('La base de datos está lista para producción.')
    console.log('\nCredenciales de administrador:')
    console.log('📧 Email: admin@lovilike.es')
    console.log('🔑 Password: Admin123!')
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login')
    
  } catch (error) {
    console.error('\n❌ Error durante la preparación:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Función para ejecutar solo la verificación
async function checkOnly() {
  try {
    await verifyDatabaseIntegrity()
    await prisma.$disconnect()
  } catch (error) {
    console.error('Error verificando base de datos:', error)
    process.exit(1)
  }
}

// Permitir ejecutar solo verificación con parámetro --check
if (process.argv.includes('--check')) {
  checkOnly()
} else {
  main()
}