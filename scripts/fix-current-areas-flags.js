const { PrismaClient } = require('@prisma/client')

const globalForPrisma = globalThis
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

async function fixCurrentAreasFlags() {
  console.log('🔧 Corrigiendo flags de áreas actuales...')
  
  try {
    // Obtener todas las áreas del producto
    const printAreas = await prisma.printArea.findMany({
      where: {
        side: {
          productId: 'cmcs6wd190000jguqbjbs109c'
        }
      },
      include: {
        side: {
          select: {
            name: true
          }
        }
      }
    })

    console.log('📦 Áreas encontradas:')
    printAreas.forEach(area => {
      console.log(`  ${area.side.name} - ${area.name}: ${area.x}%, ${area.y}%, ${area.width}×${area.height}% (isRelative: ${area.isRelativeCoordinates})`)
    })

    console.log('\n🔄 Marcando todas como coordenadas relativas...')
    
    // Actualizar todas las áreas
    for (const area of printAreas) {
      await prisma.printArea.update({
        where: { id: area.id },
        data: {
          isRelativeCoordinates: true,
          referenceWidth: 800,
          referenceHeight: 600
        }
      })
      
      console.log(`✅ ${area.name}: isRelativeCoordinates = true`)
    }

    console.log('\n🎉 Flags corregidos')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCurrentAreasFlags()