/**
 * Script de verificación: Comprobar integridad del sistema multi-marca
 * 
 * Este script verifica que la migración se ejecutó correctamente y que
 * el stock agregado coincide con el stock real de las marcas.
 */

const { db } = require('../src/lib/db');
async function verifyMigration() {
  console.log('🔍 Verificando integridad del sistema multi-marca...')
  
  try {
    // 1. Verificar consistencia de stock agregado
    console.log('\n📊 Verificando consistencia de stock agregado...')
    
    const variants = await db.productVariant.findMany({
      where: { isActive: true },
      include: {
        product: { select: { name: true } },
        brandStocks: {
          where: { isActive: true }
        }
      }
    })

    let inconsistencies = []
    let totalVariants = variants.length
    let variantsWithBrandStock = 0

    for (const variant of variants) {
      const brandStockTotal = variant.brandStocks.reduce((sum, bs) => sum + bs.quantity, 0)
      const aggregatedStock = variant.stock

      if (variant.brandStocks.length > 0) {
        variantsWithBrandStock++
      }

      if (brandStockTotal !== aggregatedStock) {
        inconsistencies.push({
          sku: variant.sku,
          productName: variant.product.name,
          aggregatedStock,
          brandStockTotal,
          difference: brandStockTotal - aggregatedStock,
          brandsCount: variant.brandStocks.length
        })
      }
    }

    console.log(`📦 Total variantes analizadas: ${totalVariants}`)
    console.log(`🏷️  Variantes con stock multi-marca: ${variantsWithBrandStock}`)
    console.log(`⚠️  Inconsistencias encontradas: ${inconsistencies.length}`)

    if (inconsistencies.length > 0) {
      console.log('\n❌ INCONSISTENCIAS DETECTADAS:')
      inconsistencies.slice(0, 10).forEach(inc => {
        console.log(`   ${inc.sku} (${inc.productName}):`)
        console.log(`     Stock agregado: ${inc.aggregatedStock}`)
        console.log(`     Stock real marcas: ${inc.brandStockTotal}`)
        console.log(`     Diferencia: ${inc.difference > 0 ? '+' : ''}${inc.difference}`)
        console.log(`     Marcas: ${inc.brandsCount}`)
      })
      
      if (inconsistencies.length > 10) {
        console.log(`   ... y ${inconsistencies.length - 10} inconsistencias más`)
      }
    } else {
      console.log('✅ Todos los stocks están consistentes')
    }

    // 2. Verificar registros huérfanos
    console.log('\n🔍 Verificando registros huérfanos...')
    
    const orphanedBrandStocks = await db.brandStock.findMany({
      where: {
        variant: null
      }
    })

    const orphanedMovements = await db.brandStockMovement.findMany({
      where: {
        brandStock: null
      }
    })

    const orphanedAllocations = await db.orderItemAllocation.findMany({
      where: {
        OR: [
          { brandStock: null },
          { orderItem: null }
        ]
      }
    })

    console.log(`🏷️  BrandStocks huérfanos: ${orphanedBrandStocks.length}`)
    console.log(`📝 Movimientos huérfanos: ${orphanedMovements.length}`)
    console.log(`📋 Asignaciones huérfanas: ${orphanedAllocations.length}`)

    // 3. Estadísticas generales
    console.log('\n📊 ESTADÍSTICAS DEL SISTEMA:')
    
    const totalBrandStocks = await db.brandStock.count({ where: { isActive: true } })
    const totalMovements = await db.brandStockMovement.count()
    const totalAllocations = await db.orderItemAllocation.count()
    
    const brandStats = await db.brandStock.groupBy({
      by: ['brand'],
      where: { isActive: true },
      _count: { brand: true },
      _sum: { quantity: true }
    })

    const locationStats = await db.brandStock.groupBy({
      by: ['location'],
      where: { 
        isActive: true,
        location: { not: null }
      },
      _count: { location: true },
      _sum: { quantity: true }
    })

    console.log(`📦 Total registros BrandStock activos: ${totalBrandStocks}`)
    console.log(`📝 Total movimientos registrados: ${totalMovements}`)
    console.log(`📋 Total asignaciones a pedidos: ${totalAllocations}`)

    console.log('\n🏷️  DISTRIBUCIÓN POR MARCAS:')
    brandStats.slice(0, 10).forEach(stat => {
      console.log(`   ${stat.brand}: ${stat._count.brand} productos, ${stat._sum.quantity || 0} unidades`)
    })

    if (locationStats.length > 0) {
      console.log('\n📍 DISTRIBUCIÓN POR UBICACIONES:')
      locationStats.slice(0, 5).forEach(stat => {
        console.log(`   ${stat.location}: ${stat._count.location} productos, ${stat._sum.quantity || 0} unidades`)
      })
    }

    // 4. Alertas de stock bajo
    console.log('\n⚠️  ALERTAS DE STOCK:')
    
    const lowStockBrands = await db.brandStock.findMany({
      where: {
        isActive: true,
        quantity: { lte: 5 }
      },
      include: {
        variant: {
          include: {
            product: { select: { name: true } }
          }
        }
      },
      orderBy: { quantity: 'asc' }
    })

    const outOfStockBrands = lowStockBrands.filter(bs => bs.quantity === 0)
    const lowStockCount = lowStockBrands.filter(bs => bs.quantity > 0 && bs.quantity <= 5)

    console.log(`🔴 Sin stock: ${outOfStockBrands.length} registros`)
    console.log(`🟡 Stock bajo (≤5): ${lowStockCount.length} registros`)

    if (outOfStockBrands.length > 0) {
      console.log('\n🔴 SIN STOCK:')
      outOfStockBrands.slice(0, 5).forEach(bs => {
        console.log(`   ${bs.brand} - ${bs.variant.product.name} (${bs.variant.sku})`)
      })
    }

    // 5. Verificar integridad de asignaciones
    console.log('\n🔍 Verificando asignaciones de pedidos...')
    
    const allocationsWithIssues = await db.orderItemAllocation.findMany({
      where: {
        quantity: { lte: 0 }
      },
      include: {
        brandStock: { select: { brand: true } },
        orderItem: {
          include: {
            order: { select: { orderNumber: true } }
          }
        }
      }
    })

    console.log(`❌ Asignaciones con cantidad ≤ 0: ${allocationsWithIssues.length}`)

    // 6. Recomendaciones
    console.log('\n💡 RECOMENDACIONES:')
    
    if (inconsistencies.length > 0) {
      console.log('❌ Corregir inconsistencias de stock ejecutando script de reparación')
    }
    
    if (variantsWithBrandStock < totalVariants * 0.8) {
      console.log('⚠️  Menos del 80% de variantes tienen stock multi-marca configurado')
    }
    
    if (brandStats.some(stat => stat.brand === 'Marca Genérica')) {
      console.log('🏷️  Hay marcas genéricas que necesitan configuración específica')
    }
    
    if (locationStats.length === 0) {
      console.log('📍 Configurar ubicaciones específicas para el stock')
    }

    console.log('\n✅ Verificación completada')

    return {
      totalVariants,
      variantsWithBrandStock,
      inconsistencies: inconsistencies.length,
      orphanedRecords: orphanedBrandStocks.length + orphanedMovements.length + orphanedAllocations.length,
      lowStockAlerts: lowStockCount.length,
      outOfStockAlerts: outOfStockBrands.length,
      isHealthy: inconsistencies.length === 0 && orphanedBrandStocks.length === 0
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error)
    throw error
  } finally {
    await db.$disconnect()
  }
}

// Función para reparar inconsistencias
async function repairInconsistencies() {
  console.log('🔧 Reparando inconsistencias de stock...')
  
  try {
    const variants = await db.productVariant.findMany({
      where: { isActive: true },
      include: {
        brandStocks: { where: { isActive: true } }
      }
    })

    let repairedCount = 0

    for (const variant of variants) {
      const brandStockTotal = variant.brandStocks.reduce((sum, bs) => sum + bs.quantity, 0)
      
      if (variant.stock !== brandStockTotal) {
        await db.productVariant.update({
          where: { id: variant.id },
          data: { stock: brandStockTotal }
        })
        
        console.log(`🔧 Reparado ${variant.sku}: ${variant.stock} → ${brandStockTotal}`)
        repairedCount++
      }
    }

    console.log(`✅ Reparadas ${repairedCount} inconsistencias`)

  } catch (error) {
    console.error('❌ Error reparando inconsistencias:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar verificación
if (require.main === module) {
  const command = process.argv[2]
  
  if (command === 'repair') {
    repairInconsistencies()
  } else {
    verifyMigration()
  }
}

module.exports = { verifyMigration, repairInconsistencies }