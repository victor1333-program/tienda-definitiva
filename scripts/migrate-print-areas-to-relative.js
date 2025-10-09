/**
 * Script para migrar las áreas de impresión de coordenadas absolutas a relativas
 * Ejecutar con: node scripts/migrate-print-areas-to-relative.js
 */

const { db } = require('../src/lib/db');
// Dimensiones de referencia (las que se usaron originalmente para configurar las áreas)
const REFERENCE_CANVAS_SIZE = {
  width: 800,
  height: 600
};

/**
 * Convierte coordenadas absolutas a relativas
 */
function absoluteToRelative(absolute, canvasSize) {
  return {
    x: (absolute.x / canvasSize.width) * 100,
    y: (absolute.y / canvasSize.height) * 100,
    width: (absolute.width / canvasSize.width) * 100,
    height: (absolute.height / canvasSize.height) * 100
  };
}

/**
 * Migra todas las áreas de impresión a coordenadas relativas
 */
async function migratePrintAreas() {
  try {
    console.log('🚀 Iniciando migración de áreas de impresión...');
    
    // Obtener todas las áreas de impresión
    const printAreas = await db.printArea.findMany({
      select: {
        id: true,
        name: true,
        x: true,
        y: true,
        width: true,
        height: true,
        side: {
          select: {
            id: true,
            name: true,
            product: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    console.log(`📊 Encontradas ${printAreas.length} áreas de impresión para migrar`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const area of printAreas) {
      try {
        // Verificar si las coordenadas ya están en formato relativo (0-100)
        const isAlreadyRelative = area.x <= 100 && area.y <= 100 && 
                                  area.width <= 100 && area.height <= 100;

        if (isAlreadyRelative && area.x < 1 && area.y < 1) {
          console.log(`⏭️  Área ${area.name} (${area.id}) ya parece estar en formato relativo, saltando...`);
          skippedCount++;
          continue;
        }

        // Convertir a coordenadas relativas
        const relativeCoords = absoluteToRelative({
          x: area.x,
          y: area.y,
          width: area.width,
          height: area.height
        }, REFERENCE_CANVAS_SIZE);

        // Actualizar en la base de datos
        await db.printArea.update({
          where: { id: area.id },
          data: {
            x: relativeCoords.x,
            y: relativeCoords.y,
            width: relativeCoords.width,
            height: relativeCoords.height,
            // Añadir campos para indicar que usa coordenadas relativas
            isRelativeCoordinates: true,
            referenceWidth: REFERENCE_CANVAS_SIZE.width,
            referenceHeight: REFERENCE_CANVAS_SIZE.height
          }
        });

        console.log(`✅ Migrada área "${area.name}" del producto "${area.side.product.name}"`);
        console.log(`   Absoluta: (${area.x}, ${area.y}, ${area.width}x${area.height})`);
        console.log(`   Relativa: (${relativeCoords.x.toFixed(2)}%, ${relativeCoords.y.toFixed(2)}%, ${relativeCoords.width.toFixed(2)}%x${relativeCoords.height.toFixed(2)}%)`);
        
        migratedCount++;
      } catch (error) {
        console.error(`❌ Error migrando área ${area.id}:`, error.message);
      }
    }

    console.log(`\n🎉 Migración completada:`);
    console.log(`   ✅ ${migratedCount} áreas migradas`);
    console.log(`   ⏭️  ${skippedCount} áreas saltadas (ya relativas)`);
    console.log(`   ❌ ${printAreas.length - migratedCount - skippedCount} errores`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

/**
 * Función para verificar la migración
 */
async function verifyMigration() {
  try {
    console.log('🔍 Verificando migración...');
    
    const areas = await db.printArea.findMany({
      select: {
        id: true,
        name: true,
        x: true,
        y: true,
        width: true,
        height: true,
        isRelativeCoordinates: true,
        side: {
          select: {
            name: true,
            product: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    const relativeAreas = areas.filter(area => area.isRelativeCoordinates);
    const absoluteAreas = areas.filter(area => !area.isRelativeCoordinates);

    console.log(`📊 Verificación completada:`);
    console.log(`   ✅ ${relativeAreas.length} áreas con coordenadas relativas`);
    console.log(`   📏 ${absoluteAreas.length} áreas con coordenadas absolutas`);

    if (absoluteAreas.length > 0) {
      console.log('\n📏 Áreas pendientes de migración:');
      absoluteAreas.forEach(area => {
        console.log(`   - ${area.side.product.name} > ${area.side.name} > ${area.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await db.$disconnect();
  }
}

// Ejecutar según el argumento pasado
const command = process.argv[2];

if (command === 'verify') {
  verifyMigration();
} else if (command === 'migrate') {
  migratePrintAreas();
} else {
  console.log('🔧 Script de migración de áreas de impresión');
  console.log('');
  console.log('Uso:');
  console.log('  node scripts/migrate-print-areas-to-relative.js migrate  - Ejecutar migración');
  console.log('  node scripts/migrate-print-areas-to-relative.js verify   - Verificar estado');
  console.log('');
  console.log('⚠️  IMPORTANTE: Haz backup de la base de datos antes de ejecutar la migración');
}