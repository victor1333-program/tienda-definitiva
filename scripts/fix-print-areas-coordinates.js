const { db } = require('../src/lib/db');
const STANDARD_CANVAS_SIZE = {
  width: 800,
  height: 600
}

async function fixPrintAreasCoordinates() {
  console.log('🔧 Iniciando corrección de coordenadas de áreas de impresión...')
  
  try {
    // Obtener todas las áreas de impresión
    const printAreas = await db.printArea.findMany({
      include: {
        side: {
          include: {
            product: true
          }
        }
      }
    })
    
    console.log(`📊 Encontradas ${printAreas.length} áreas de impresión`)
    
    let updatedCount = 0
    let alreadyRelativeCount = 0
    
    for (const area of printAreas) {
      if (area.isRelativeCoordinates) {
        alreadyRelativeCount++
        console.log(`✅ Área "${area.name}" ya tiene coordenadas relativas`)
        continue
      }
      
      // Determinar dimensiones de referencia
      let referenceWidth = area.referenceWidth || STANDARD_CANVAS_SIZE.width
      let referenceHeight = area.referenceHeight || STANDARD_CANVAS_SIZE.height
      
      // Si las coordenadas parecen ser absolutas (valores grandes), convertir a relativas
      if (area.x > 100 || area.y > 100 || area.width > 100 || area.height > 100) {
        console.log(`🔄 Convirtiendo área "${area.name}" de coordenadas absolutas a relativas`)
        
        // Convertir a coordenadas relativas (porcentajes 0-100)
        const relativeCoords = {
          x: (area.x / referenceWidth) * 100,
          y: (area.y / referenceHeight) * 100,
          width: (area.width / referenceWidth) * 100,
          height: (area.height / referenceHeight) * 100
        }
        
        await db.printArea.update({
          where: { id: area.id },
          data: {
            x: relativeCoords.x,
            y: relativeCoords.y,
            width: relativeCoords.width,
            height: relativeCoords.height,
            isRelativeCoordinates: true,
            referenceWidth: referenceWidth,
            referenceHeight: referenceHeight
          }
        })
        
        console.log(`   ✓ Convertida: (${area.x.toFixed(1)}, ${area.y.toFixed(1)}, ${area.width.toFixed(1)}, ${area.height.toFixed(1)}) → (${relativeCoords.x.toFixed(1)}%, ${relativeCoords.y.toFixed(1)}%, ${relativeCoords.width.toFixed(1)}%, ${relativeCoords.height.toFixed(1)}%)`)
        updatedCount++
        
      } else {
        // Las coordenadas ya parecen estar en formato relativo, solo marcar el flag
        console.log(`🏷️  Marcando área "${area.name}" como coordenadas relativas`)
        
        await db.printArea.update({
          where: { id: area.id },
          data: {
            isRelativeCoordinates: true,
            referenceWidth: referenceWidth,
            referenceHeight: referenceHeight
          }
        })
        
        updatedCount++
      }
    }
    
    console.log('\n📋 Resumen de la migración:')
    console.log(`   ✅ Áreas ya con coordenadas relativas: ${alreadyRelativeCount}`)
    console.log(`   🔄 Áreas convertidas/actualizadas: ${updatedCount}`)
    console.log(`   📊 Total procesadas: ${printAreas.length}`)
    
    // Verificar que todas las áreas ahora tienen coordenadas relativas
    const verificationAreas = await db.printArea.findMany({
      where: {
        isRelativeCoordinates: false
      }
    })
    
    if (verificationAreas.length === 0) {
      console.log('✅ ¡Todas las áreas ahora tienen coordenadas relativas!')
    } else {
      console.log(`⚠️  Advertencia: ${verificationAreas.length} áreas aún no están marcadas como relativas`)
    }
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  fixPrintAreasCoordinates()
    .then(() => {
      console.log('🎉 Migración completada!')
    })
    .catch((error) => {
      console.error('💥 Error en la migración:', error)
      process.exit(1)
    })
}

module.exports = { fixPrintAreasCoordinates }