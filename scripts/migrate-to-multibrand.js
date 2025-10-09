/**
 * Script de migración: Convertir inventario existente a sistema multi-marca
 * 
 * Este script migra las variantes existentes que tienen stock > 0 
 * al nuevo sistema de gestión multi-marca.
 */

const { db } = require('../src/lib/db');
async function migrateToMultiBrand() {
  console.log('🚀 Iniciando migración a sistema multi-marca...')
  
  try {
    // 1. Obtener todas las variantes con stock > 0
    const variantsWithStock = await db.productVariant.findMany({
      where: {
        stock: { gt: 0 },
        isActive: true
      },
      include: {
        product: {
          select: {
            name: true,
            suppliers: {
              include: {
                supplier: true
              }
            }
          }
        }
      }
    })

    console.log(`📦 Encontradas ${variantsWithStock.length} variantes con stock para migrar`)

    let migratedCount = 0
    let skippedCount = 0

    for (const variant of variantsWithStock) {
      console.log(`\n🔄 Migrando variante: ${variant.sku} (Stock: ${variant.stock})`)

      // Verificar si ya tiene registros de BrandStock
      const existingBrandStock = await db.brandStock.findFirst({
        where: { variantId: variant.id }
      })

      if (existingBrandStock) {
        console.log(`⏭️  Variante ${variant.sku} ya tiene registros multi-marca. Saltando...`)
        skippedCount++
        continue
      }

      // Determinar proveedor y marca
      let supplierId = null
      let supplierName = 'Sin asignar'
      let brand = 'Marca Genérica'

      if (variant.product.suppliers && variant.product.suppliers.length > 0) {
        const primarySupplier = variant.product.suppliers[0]
        supplierId = primarySupplier.supplierId
        supplierName = primarySupplier.supplier.name
        
        // Usar el nombre del proveedor como marca inicial
        brand = primarySupplier.supplier.name
      }

      // Precio de coste estimado (70% del precio de venta)
      const estimatedCostPrice = variant.price ? variant.price * 0.7 : 10.0

      try {
        await db.$transaction(async (tx) => {
          // Crear registro de BrandStock
          const brandStock = await tx.brandStock.create({
            data: {
              variantId: variant.id,
              brand: brand,
              supplierId: supplierId,
              quantity: variant.stock,
              costPrice: estimatedCostPrice,
              location: 'Almacén Principal',
              minStock: 5,
              isPreferred: true, // Marcar como preferida por ser la única
              priority: 0,
              notes: `Migrado automáticamente desde stock existente (${new Date().toISOString()})`,
              lastRestock: new Date()
            }
          })

          // Crear movimiento inicial
          await tx.brandStockMovement.create({
            data: {
              brandStockId: brandStock.id,
              type: 'PURCHASE',
              quantity: variant.stock,
              previousStock: 0,
              newStock: variant.stock,
              reason: 'Migración inicial del stock existente'
            }
          })

          console.log(`✅ Creado BrandStock para ${variant.sku}:`)
          console.log(`   - Marca: ${brand}`)
          console.log(`   - Proveedor: ${supplierName}`)
          console.log(`   - Cantidad: ${variant.stock}`)
          console.log(`   - Precio coste estimado: €${estimatedCostPrice.toFixed(2)}`)
        })

        migratedCount++

      } catch (error) {
        console.error(`❌ Error migrando variante ${variant.sku}:`, error.message)
      }
    }

    // 2. Actualizar stock agregado para todas las variantes migradas
    console.log('\n📊 Actualizando stock agregado...')
    
    const allVariants = await db.productVariant.findMany({
      where: { isActive: true },
      include: {
        brandStocks: {
          where: { isActive: true }
        }
      }
    })

    for (const variant of allVariants) {
      const totalStock = variant.brandStocks.reduce((sum, bs) => sum + bs.quantity, 0)
      
      if (variant.stock !== totalStock) {
        await db.productVariant.update({
          where: { id: variant.id },
          data: { stock: totalStock }
        })
        console.log(`🔄 Actualizado stock agregado para ${variant.sku}: ${variant.stock} → ${totalStock}`)
      }
    }

    // 3. Generar reporte final
    console.log('\n📋 RESUMEN DE MIGRACIÓN:')
    console.log(`✅ Variantes migradas exitosamente: ${migratedCount}`)
    console.log(`⏭️  Variantes ya migradas (saltadas): ${skippedCount}`)
    console.log(`📦 Total de variantes procesadas: ${variantsWithStock.length}`)

    // Estadísticas post-migración
    const totalBrandStocks = await db.brandStock.count()
    const totalStockValue = await db.brandStock.aggregate({
      _sum: { quantity: true }
    })

    console.log(`\n📊 ESTADÍSTICAS POST-MIGRACIÓN:`)
    console.log(`🏷️  Total registros BrandStock: ${totalBrandStocks}`)
    console.log(`📦 Stock total en sistema multi-marca: ${totalStockValue._sum.quantity || 0} unidades`)

    // Identificar variantes que necesitan configuración adicional
    const variantsNeedingAttention = await db.brandStock.findMany({
      where: {
        OR: [
          { supplierId: null },
          { brand: 'Marca Genérica' }
        ]
      },
      include: {
        variant: {
          include: {
            product: { select: { name: true } }
          }
        }
      }
    })

    if (variantsNeedingAttention.length > 0) {
      console.log(`\n⚠️  ATENCIÓN - ${variantsNeedingAttention.length} registros necesitan configuración manual:`)
      variantsNeedingAttention.slice(0, 5).forEach(bs => {
        console.log(`   - ${bs.variant.product.name} (${bs.variant.sku}): ${bs.supplierId ? 'Sin proveedor' : 'Marca genérica'}`)
      })
      if (variantsNeedingAttention.length > 5) {
        console.log(`   ... y ${variantsNeedingAttention.length - 5} más`)
      }
    }

    console.log('\n🎉 ¡Migración completada exitosamente!')
    console.log('💡 Recomendaciones:')
    console.log('   1. Revisar y ajustar las marcas genéricas')
    console.log('   2. Configurar proveedores faltantes')
    console.log('   3. Ajustar precios de coste estimados')
    console.log('   4. Configurar ubicaciones específicas')

  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    throw error
  } finally {
    await db.$disconnect()
  }
}

// Función para revertir la migración (solo en desarrollo)
async function revertMigration() {
  console.log('⚠️  REVERTIR MIGRACIÓN - ¡ESTO ELIMINARÁ TODOS LOS DATOS MULTI-MARCA!')
  
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ No se puede revertir en producción')
    return
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.brandStockMovement.deleteMany({})
      await tx.orderItemAllocation.deleteMany({})
      await tx.brandStock.deleteMany({})
    })

    console.log('✅ Migración revertida. Todos los datos multi-marca han sido eliminados.')
  } catch (error) {
    console.error('❌ Error revirtiendo migración:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar migración
if (require.main === module) {
  const command = process.argv[2]
  
  if (command === 'revert') {
    revertMigration()
  } else {
    migrateToMultiBrand()
  }
}

module.exports = { migrateToMultiBrand, revertMigration }