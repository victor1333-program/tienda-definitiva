const { PrismaClient } = require('@prisma/client')

const globalForPrisma = globalThis
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

async function updateMeasurementsDebug() {
  console.log('🔄 Actualizando medidas con debug...')
  
  try {
    // Intentar actualizar solo una variante para probar
    const testVariant = await prisma.productVariant.findFirst({
      where: {
        productId: 'cmcs6wd190000jguqbjbs109c',
        size: 'xs',
        colorName: 'Negro'
      }
    })

    if (testVariant) {
      console.log('📦 Variante encontrada:', testVariant.sku)
      console.log('📏 Valores actuales:', { width: testVariant.width, height: testVariant.height, material: testVariant.material })
      
      // Intentar actualizar
      const updated = await prisma.productVariant.update({
        where: { id: testVariant.id },
        data: {
          width: 42.0,
          height: 60.0,
          material: 'Poliéster técnico 100%'
        }
      })
      
      console.log('✅ Variante actualizada:', { width: updated.width, height: updated.height, material: updated.material })
      
      // Verificar la actualización
      const verified = await prisma.productVariant.findUnique({
        where: { id: testVariant.id },
        select: { sku: true, width: true, height: true, material: true }
      })
      
      console.log('🔍 Verificación:', verified)
      
    } else {
      console.log('❌ No se encontró la variante de prueba')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateMeasurementsDebug()