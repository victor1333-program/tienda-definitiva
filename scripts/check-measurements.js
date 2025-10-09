const { PrismaClient } = require('@prisma/client')

const globalForPrisma = globalThis
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

async function checkMeasurements() {
  console.log('🔍 Verificando medidas en la base de datos...')
  
  try {
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
        height: true,
        material: true
      },
      take: 5
    })

    console.log('📊 Primeras 5 variantes:')
    variants.forEach(v => {
      console.log(`  ${v.sku}: ${v.size} - ${v.colorName} | ${v.width}x${v.height}cm | ${v.material}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMeasurements()