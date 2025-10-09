const { PrismaClient } = require('@prisma/client')

const globalForPrisma = globalThis
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Medidas reales para camiseta de fútbol técnica deportiva (en cm)
const sizeMeasurements = {
  'xs': { width: 42, height: 60 },  // XS
  's': { width: 45, height: 62 },   // S  
  'm': { width: 48, height: 65 },   // M
  'l': { width: 52, height: 68 },   // L
  'xl': { width: 56, height: 71 }   // XL
}

async function updateProductMeasurements() {
  console.log('🔄 Actualizando medidas del producto cmcs6wd190000jguqbjbs109c...')
  
  try {
    // Obtener todas las variantes del producto
    const variants = await prisma.productVariant.findMany({
      where: {
        productId: 'cmcs6wd190000jguqbjbs109c'
      },
      select: {
        id: true,
        sku: true,
        size: true,
        colorName: true,
        width: true,
        height: true
      }
    })

    console.log(`📦 Encontradas ${variants.length} variantes:`)
    variants.forEach(v => {
      console.log(`  - ${v.sku} (${v.size?.toUpperCase()} - ${v.colorName}) - Actual: ${v.width}x${v.height}cm`)
    })

    // Actualizar cada variante con las medidas correspondientes
    let updatedCount = 0

    for (const variant of variants) {
      if (variant.size) {
        const sizeKey = variant.size.toLowerCase()
        const measurements = sizeMeasurements[sizeKey]
        
        if (measurements) {
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: {
              width: measurements.width,
              height: measurements.height,
              material: 'Poliéster técnico 100%' // Material común para camisetas deportivas
            }
          })
          
          console.log(`✅ Actualizada ${variant.sku}: ${measurements.width}x${measurements.height}cm`)
          updatedCount++
        } else {
          console.log(`⚠️  No se encontraron medidas para la talla: ${variant.size}`)
        }
      }
    }

    console.log(`\n🎉 Proceso completado: ${updatedCount} variantes actualizadas`)
    
    // Verificar las actualizaciones
    console.log('\n📋 Verificando actualizaciones...')
    const updatedVariants = await prisma.productVariant.findMany({
      where: {
        productId: 'cmcs6wd190000jguqbjbs109c'
      },
      select: {
        sku: true,
        size: true,
        colorName: true,
        width: true,
        height: true,
        material: true
      },
      orderBy: [
        { size: 'asc' },
        { colorName: 'asc' }
      ]
    })

    console.log('\n📊 Estado final de las variantes:')
    updatedVariants.forEach(v => {
      console.log(`  ${v.size?.toUpperCase().padEnd(3)} - ${v.colorName?.padEnd(8)} | ${v.width}x${v.height}cm | ${v.material}`)
    })

  } catch (error) {
    console.error('❌ Error actualizando medidas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProductMeasurements()