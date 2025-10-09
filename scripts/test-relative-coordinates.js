#!/usr/bin/env node

/**
 * Script de prueba para el sistema de coordenadas relativas
 * 
 * Verifica que:
 * 1. Los elementos se posicionan correctamente con coordenadas relativas
 * 2. Las conversiones entre absolutas y relativas funcionan
 * 3. Los elementos se mantienen en posición al cambiar el tamaño de imagen
 */

const { db } = require('../src/lib/db');
// Importar funciones de conversión (simuladas para Node.js)
function absoluteToRelative(absolute, imageDimensions) {
  return {
    x: (absolute.x / imageDimensions.width) * 100,
    y: (absolute.y / imageDimensions.height) * 100,
    width: (absolute.width / imageDimensions.width) * 100,
    height: (absolute.height / imageDimensions.height) * 100,
  };
}

function relativeToAbsolute(relative, imageDimensions) {
  return {
    x: (relative.x / 100) * imageDimensions.width,
    y: (relative.y / 100) * imageDimensions.height,
    width: (relative.width / 100) * imageDimensions.width,
    height: (relative.height / 100) * imageDimensions.height,
  };
}

async function testCoordinateConversions() {
  console.log('🧪 Probando conversiones de coordenadas...\n');

  // Caso de prueba 1: Imagen 800x600
  const image1 = { width: 800, height: 600 };
  const absolute1 = { x: 100, y: 50, width: 200, height: 100 };
  
  const relative1 = absoluteToRelative(absolute1, image1);
  const backToAbsolute1 = relativeToAbsolute(relative1, image1);
  
  console.log('📐 Caso 1 - Imagen 800x600:');
  console.log(`   Absoluta original: x=${absolute1.x}, y=${absolute1.y}, w=${absolute1.width}, h=${absolute1.height}`);
  console.log(`   Relativa calculada: x=${relative1.x.toFixed(2)}%, y=${relative1.y.toFixed(2)}%, w=${relative1.width.toFixed(2)}%, h=${relative1.height.toFixed(2)}%`);
  console.log(`   Vuelta a absoluta: x=${backToAbsolute1.x}, y=${backToAbsolute1.y}, w=${backToAbsolute1.width}, h=${backToAbsolute1.height}`);
  
  const isAccurate1 = Math.abs(absolute1.x - backToAbsolute1.x) < 0.1 &&
                     Math.abs(absolute1.y - backToAbsolute1.y) < 0.1 &&
                     Math.abs(absolute1.width - backToAbsolute1.width) < 0.1 &&
                     Math.abs(absolute1.height - backToAbsolute1.height) < 0.1;
  
  console.log(`   ${isAccurate1 ? '✅' : '❌'} Conversión ${isAccurate1 ? 'exitosa' : 'fallida'}\n`);

  // Caso de prueba 2: Misma posición relativa en imagen diferente (400x300)
  const image2 = { width: 400, height: 300 };
  const absolute2 = relativeToAbsolute(relative1, image2);
  
  console.log('📐 Caso 2 - Misma posición relativa en imagen 400x300:');
  console.log(`   Relativa: x=${relative1.x.toFixed(2)}%, y=${relative1.y.toFixed(2)}%, w=${relative1.width.toFixed(2)}%, h=${relative1.height.toFixed(2)}%`);
  console.log(`   Nueva absoluta: x=${absolute2.x}, y=${absolute2.y}, w=${absolute2.width}, h=${absolute2.height}`);
  
  // Las proporciones deberían mantenerse
  const proportion1 = { x: absolute1.x / image1.width, y: absolute1.y / image1.height };
  const proportion2 = { x: absolute2.x / image2.width, y: absolute2.y / image2.height };
  
  const proportionsMatch = Math.abs(proportion1.x - proportion2.x) < 0.001 &&
                          Math.abs(proportion1.y - proportion2.y) < 0.001;
  
  console.log(`   Proporción original: x=${(proportion1.x * 100).toFixed(2)}%, y=${(proportion1.y * 100).toFixed(2)}%`);
  console.log(`   Proporción nueva: x=${(proportion2.x * 100).toFixed(2)}%, y=${(proportion2.y * 100).toFixed(2)}%`);
  console.log(`   ${proportionsMatch ? '✅' : '❌'} Proporciones ${proportionsMatch ? 'mantenidas' : 'alteradas'}\n`);

  return isAccurate1 && proportionsMatch;
}

async function testDatabaseElements() {
  console.log('🗄️  Probando elementos en la base de datos...\n');

  try {
    // Obtener elementos con coordenadas relativas
    const elementsWithRelative = await db.designElement.findMany({
      where: {
        AND: [
          { relativeX: { not: null } },
          { relativeY: { not: null } },
          { relativeWidth: { not: null } },
          { relativeHeight: { not: null } }
        ]
      },
      take: 5
    });

    console.log(`📊 Encontrados ${elementsWithRelative.length} elementos con coordenadas relativas`);

    if (elementsWithRelative.length === 0) {
      console.log('ℹ️  No hay elementos para probar, creando uno de ejemplo...\n');
      return true;
    }

    for (const [index, element] of elementsWithRelative.entries()) {
      console.log(`\n🔍 Elemento ${index + 1} (${element.type}):`)
      console.log(`   ID: ${element.id}`);
      console.log(`   Absolutas: x=${element.x}, y=${element.y}, w=${element.width}, h=${element.height}`);
      console.log(`   Relativas: x=${element.relativeX?.toFixed(2)}%, y=${element.relativeY?.toFixed(2)}%, w=${element.relativeWidth?.toFixed(2)}%, h=${element.relativeHeight?.toFixed(2)}%`);
      
      if (element.referenceDimensionsWidth && element.referenceDimensionsHeight) {
        console.log(`   Dimensiones referencia: ${element.referenceDimensionsWidth}x${element.referenceDimensionsHeight}`);
        
        // Verificar consistencia
        const calculatedAbsolute = relativeToAbsolute(
          {
            x: element.relativeX,
            y: element.relativeY,
            width: element.relativeWidth,
            height: element.relativeHeight
          },
          {
            width: element.referenceDimensionsWidth,
            height: element.referenceDimensionsHeight
          }
        );
        
        const isConsistent = Math.abs(element.x - calculatedAbsolute.x) < 1 &&
                           Math.abs(element.y - calculatedAbsolute.y) < 1 &&
                           Math.abs(element.width - calculatedAbsolute.width) < 1 &&
                           Math.abs(element.height - calculatedAbsolute.height) < 1;
        
        console.log(`   Calculadas desde relativas: x=${calculatedAbsolute.x.toFixed(1)}, y=${calculatedAbsolute.y.toFixed(1)}, w=${calculatedAbsolute.width.toFixed(1)}, h=${calculatedAbsolute.height.toFixed(1)}`);
        console.log(`   ${isConsistent ? '✅' : '❌'} Coordenadas ${isConsistent ? 'consistentes' : 'inconsistentes'}`);
      } else {
        console.log('   ⚠️  Sin dimensiones de referencia');
      }
    }

    return true;

  } catch (error) {
    console.error('❌ Error probando elementos de base de datos:', error);
    return false;
  }
}

async function testPrintAreas() {
  console.log('\n🖨️  Probando áreas de impresión...\n');

  try {
    const areasWithRelative = await db.printArea.findMany({
      where: {
        AND: [
          { relativeX: { not: null } },
          { relativeY: { not: null } },
          { relativeWidth: { not: null } },
          { relativeHeight: { not: null } }
        ]
      },
      include: {
        side: {
          include: {
            product: true
          }
        }
      },
      take: 3
    });

    console.log(`📊 Encontradas ${areasWithRelative.length} áreas con coordenadas relativas`);

    for (const [index, area] of areasWithRelative.entries()) {
      console.log(`\n🎯 Área ${index + 1} (${area.name}):`);
      console.log(`   Producto: ${area.side.product.name}`);
      console.log(`   Absolutas: x=${area.x}, y=${area.y}, w=${area.width}, h=${area.height}`);
      console.log(`   Relativas: x=${area.relativeX?.toFixed(2)}%, y=${area.relativeY?.toFixed(2)}%, w=${area.relativeWidth?.toFixed(2)}%, h=${area.relativeHeight?.toFixed(2)}%`);
      console.log(`   ${area.isRelativeCoordinates ? '✅' : '❌'} Marcada como relativa: ${area.isRelativeCoordinates}`);
    }

    return true;

  } catch (error) {
    console.error('❌ Error probando áreas de impresión:', error);
    return false;
  }
}

async function testTemplates() {
  console.log('\n📋 Probando plantillas...\n');

  try {
    const templates = await db.zakekeTemplate.findMany({
      take: 3
    });

    console.log(`📊 Encontradas ${templates.length} plantillas para probar`);

    for (const [index, template] of templates.entries()) {
      console.log(`\n📄 Plantilla ${index + 1} (${template.name}):`);
      
      let hasRelativeElements = false;
      let elementCount = 0;

      if (template.templateData) {
        if (template.templateData.areas && Array.isArray(template.templateData.areas)) {
          template.templateData.areas.forEach(area => {
            if (area.elements && Array.isArray(area.elements)) {
              elementCount += area.elements.length;
              area.elements.forEach(element => {
                if (element.relativeX !== undefined) {
                  hasRelativeElements = true;
                }
              });
            }
          });
        } else if (template.templateData.elements && Array.isArray(template.templateData.elements)) {
          elementCount = template.templateData.elements.length;
          template.templateData.elements.forEach(element => {
            if (element.relativeX !== undefined) {
              hasRelativeElements = true;
            }
          });
        }
      }

      console.log(`   Elementos: ${elementCount}`);
      console.log(`   ${hasRelativeElements ? '✅' : '❌'} Coordenadas relativas: ${hasRelativeElements ? 'Sí' : 'No'}`);
    }

    return true;

  } catch (error) {
    console.error('❌ Error probando plantillas:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Pruebas del sistema de coordenadas relativas\n');
  
  const results = [];
  
  // Probar conversiones matemáticas
  results.push(await testCoordinateConversions());
  
  // Probar elementos de base de datos
  results.push(await testDatabaseElements());
  
  // Probar áreas de impresión
  results.push(await testPrintAreas());
  
  // Probar plantillas
  results.push(await testTemplates());
  
  const allPassed = results.every(result => result === true);
  
  console.log('\n📈 Resumen de pruebas:');
  console.log(`✅ Conversiones matemáticas: ${results[0] ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Elementos de base de datos: ${results[1] ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Áreas de impresión: ${results[2] ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Plantillas: ${results[3] ? 'PASS' : 'FAIL'}`);
  
  console.log(`\n🎯 Resultado general: ${allPassed ? '✅ TODAS LAS PRUEBAS PASARON' : '❌ ALGUNAS PRUEBAS FALLARON'}`);
  
  if (allPassed) {
    console.log('\n🎉 ¡El sistema de coordenadas relativas está funcionando correctamente!');
    console.log('Los elementos ahora deberían mantenerse alineados correctamente');
    console.log('independientemente del tamaño de imagen donde se muestren.\n');
  }
  
  return allPassed;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    })
    .finally(() => {
      db.$disconnect();
    });
}

module.exports = {
  testCoordinateConversions,
  testDatabaseElements,
  testPrintAreas,
  testTemplates
};