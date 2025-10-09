const { PrismaClient } = require('@prisma/client')

const globalForPrisma = globalThis
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

async function fixFootballShirtAreas() {
  console.log('⚽ Corrigiendo áreas de la camiseta de fútbol...')
  
  try {
    // Obtener las áreas actuales del producto
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

    console.log('📦 Áreas actuales:')
    printAreas.forEach(area => {
      console.log(`  ${area.side.name} - ${area.name}: ${area.x}%, ${area.y}%, ${area.width}×${area.height}%`)
    })

    // Definir las coordenadas correctas para una camiseta de fútbol
    // Estas son coordenadas relativas apropiadas (porcentajes)
    const correctAreas = {
      'ESCUDO': {
        // Área del escudo/logo en el pecho (lado frontal)
        x: 35,     // 35% desde la izquierda (centrado)
        y: 25,     // 25% desde arriba
        width: 30, // 30% de ancho
        height: 20 // 20% de alto
      },
      'NOMBRE': {
        // Área para el nombre del jugador (lado trasero, parte superior)
        x: 15,     // 15% desde la izquierda
        y: 15,     // 15% desde arriba
        width: 70, // 70% de ancho (casi todo el ancho de la espalda)
        height: 12 // 12% de alto
      },
      'NUMERO': {
        // Área para el número del jugador (lado trasero, centro)
        x: 25,     // 25% desde la izquierda
        y: 35,     // 35% desde arriba
        width: 50, // 50% de ancho
        height: 40 // 40% de alto
      }
    }

    console.log('\n🔄 Aplicando coordenadas corregidas...')

    // Actualizar cada área
    for (const area of printAreas) {
      const newCoords = correctAreas[area.name]
      if (newCoords) {
        await prisma.printArea.update({
          where: { id: area.id },
          data: {
            x: newCoords.x,
            y: newCoords.y,
            width: newCoords.width,
            height: newCoords.height,
            isRelativeCoordinates: true,
            referenceWidth: 800,
            referenceHeight: 600
          }
        })
        
        console.log(`✅ ${area.name}: ${newCoords.x}%, ${newCoords.y}%, ${newCoords.width}×${newCoords.height}%`)
      }
    }

    console.log('\n🎉 Corrección completada')

    // Verificar los cambios
    console.log('\n📋 Verificando cambios...')
    const updatedAreas = await prisma.printArea.findMany({
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

    console.log('\n📊 Áreas actualizadas:')
    updatedAreas.forEach(area => {
      console.log(`  ${area.side.name} - ${area.name}: ${area.x}%, ${area.y}%, ${area.width}×${area.height}%`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixFootballShirtAreas()