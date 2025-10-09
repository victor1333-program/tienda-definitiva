#!/usr/bin/env node

/**
 * Script para migrar elementos de diseño a coordenadas relativas
 * 
 * Este script:
 * 1. Lee todos los elementos de diseño existentes
 * 2. Calcula coordenadas relativas basadas en las dimensiones de referencia
 * 3. Actualiza los elementos con las nuevas coordenadas
 * 4. Preserva las coordenadas absolutas para compatibilidad
 */

const { db } = require('../src/lib/db');
// Función para obtener dimensiones de imagen
async function getImageDimensions(imageUrl) {
  // En un entorno real, usarías una librería como sharp o canvas
  // Para este ejemplo, usamos dimensiones por defecto
  const defaultDimensions = { width: 800, height: 600 };
  
  console.log(`⚠️  Usando dimensiones por defecto para ${imageUrl}: ${defaultDimensions.width}x${defaultDimensions.height}`);
  return defaultDimensions;
}

// Función para convertir coordenadas absolutas a relativas
function absoluteToRelative(absolute, imageDimensions) {
  return {
    x: (absolute.x / imageDimensions.width) * 100,
    y: (absolute.y / imageDimensions.height) * 100,
    width: (absolute.width / imageDimensions.width) * 100,
    height: (absolute.height / imageDimensions.height) * 100,
  };
}

// Función para validar coordenadas relativas
function validateRelativeCoordinates(coordinates) {
  return (
    coordinates.x >= 0 && coordinates.x <= 100 &&
    coordinates.y >= 0 && coordinates.y <= 100 &&
    coordinates.width >= 0 && coordinates.width <= 100 &&
    coordinates.height >= 0 && coordinates.height <= 100 &&
    coordinates.x + coordinates.width <= 100 &&
    coordinates.y + coordinates.height <= 100
  );
}

// Función para ajustar coordenadas fuera de rango
function clampRelativeCoordinates(coordinates) {
  const result = { ...coordinates };
  
  // Asegurar que no sean negativas
  result.x = Math.max(0, result.x);
  result.y = Math.max(0, result.y);
  result.width = Math.max(0, result.width);
  result.height = Math.max(0, result.height);
  
  // Asegurar que no se salgan del límite (100%)
  result.x = Math.min(100, result.x);
  result.y = Math.min(100, result.y);
  result.width = Math.min(100, result.width);
  result.height = Math.min(100, result.height);
  
  // Ajustar ancho y alto si se salen del borde
  if (result.x + result.width > 100) {
    result.width = 100 - result.x;
  }
  if (result.y + result.height > 100) {
    result.height = 100 - result.y;
  }
  
  return result;
}

async function migrateDesignElements() {
  console.log('🚀 Iniciando migración de elementos de diseño a coordenadas relativas...\n');

  try {
    // Obtener todos los elementos de diseño que no tienen coordenadas relativas
    const elementsToMigrate = await db.designElement.findMany({
      where: {
        OR: [
          { relativeX: null },
          { relativeY: null },
          { relativeWidth: null },
          { relativeHeight: null }
        ]
      },
      include: {
        printArea: {
          include: {
            side: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    console.log(`📊 Encontrados ${elementsToMigrate.length} elementos para migrar\n`);

    if (elementsToMigrate.length === 0) {
      console.log('✅ No hay elementos que migrar');
      return;
    }

    let migratedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const element of elementsToMigrate) {
      try {
        console.log(`🔄 Migrando elemento ${element.id} (${element.type})`);

        // Determinar dimensiones de referencia
        let referenceDimensions = { width: 800, height: 600 }; // Valores por defecto

        // Intentar obtener dimensiones del área de impresión
        if (element.printArea.referenceWidth && element.printArea.referenceHeight) {
          referenceDimensions = {
            width: element.printArea.referenceWidth,
            height: element.printArea.referenceHeight
          };
          console.log(`  📐 Usando dimensiones del área: ${referenceDimensions.width}x${referenceDimensions.height}`);
        }
        // Intentar obtener dimensiones del producto/lado
        else if (element.printArea.side?.product) {
          // Aquí podrías obtener dimensiones de la imagen del producto
          // Por ahora usamos valores por defecto
          console.log(`  📐 Usando dimensiones por defecto: ${referenceDimensions.width}x${referenceDimensions.height}`);
        }

        // Convertir coordenadas absolutas a relativas
        const absoluteCoords = {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height
        };

        const relativeCoords = absoluteToRelative(absoluteCoords, referenceDimensions);

        // Validar y ajustar coordenadas
        if (!validateRelativeCoordinates(relativeCoords)) {
          console.log(`  ⚠️  Coordenadas fuera de rango, ajustando...`);
          const clampedCoords = clampRelativeCoordinates(relativeCoords);
          console.log(`    Original: x=${relativeCoords.x.toFixed(2)}%, y=${relativeCoords.y.toFixed(2)}%, w=${relativeCoords.width.toFixed(2)}%, h=${relativeCoords.height.toFixed(2)}%`);
          console.log(`    Ajustado: x=${clampedCoords.x.toFixed(2)}%, y=${clampedCoords.y.toFixed(2)}%, w=${clampedCoords.width.toFixed(2)}%, h=${clampedCoords.height.toFixed(2)}%`);
          Object.assign(relativeCoords, clampedCoords);
        }

        // Actualizar elemento con coordenadas relativas
        await db.designElement.update({
          where: { id: element.id },
          data: {
            relativeX: relativeCoords.x,
            relativeY: relativeCoords.y,
            relativeWidth: relativeCoords.width,
            relativeHeight: relativeCoords.height,
            referenceDimensionsWidth: referenceDimensions.width,
            referenceDimensionsHeight: referenceDimensions.height
          }
        });

        console.log(`  ✅ Migrado: x=${relativeCoords.x.toFixed(2)}%, y=${relativeCoords.y.toFixed(2)}%, w=${relativeCoords.width.toFixed(2)}%, h=${relativeCoords.height.toFixed(2)}%`);
        migratedCount++;

      } catch (error) {
        console.error(`  ❌ Error migrando elemento ${element.id}:`, error.message);
        errors.push({ elementId: element.id, error: error.message });
        errorCount++;
      }
    }

    console.log(`\n📈 Resumen de migración:`);
    console.log(`✅ Elementos migrados exitosamente: ${migratedCount}`);
    console.log(`❌ Elementos con errores: ${errorCount}`);

    if (errors.length > 0) {
      console.log(`\n🔍 Errores encontrados:`);
      errors.forEach(({ elementId, error }) => {
        console.log(`  - Elemento ${elementId}: ${error}`);
      });
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
}

async function migratePrintAreas() {
  console.log('\n🚀 Migrando áreas de impresión a coordenadas relativas...\n');

  try {
    // Obtener todas las áreas de impresión que no tienen coordenadas relativas
    const areasToMigrate = await db.printArea.findMany({
      where: {
        OR: [
          { relativeX: null },
          { relativeY: null },
          { relativeWidth: null },
          { relativeHeight: null }
        ]
      },
      include: {
        side: {
          include: {
            product: true
          }
        }
      }
    });

    console.log(`📊 Encontradas ${areasToMigrate.length} áreas de impresión para migrar\n`);

    if (areasToMigrate.length === 0) {
      console.log('✅ No hay áreas de impresión que migrar');
      return;
    }

    let migratedCount = 0;
    let errorCount = 0;

    for (const area of areasToMigrate) {
      try {
        console.log(`🔄 Migrando área ${area.id} (${area.name})`);

        // Determinar dimensiones de referencia para el área
        let referenceDimensions = { width: 800, height: 600 }; // Valores por defecto

        if (area.referenceWidth && area.referenceHeight) {
          referenceDimensions = {
            width: area.referenceWidth,
            height: area.referenceHeight
          };
        }

        // Convertir coordenadas del área
        const absoluteCoords = {
          x: area.x,
          y: area.y,
          width: area.width,
          height: area.height
        };

        const relativeCoords = absoluteToRelative(absoluteCoords, referenceDimensions);
        const clampedCoords = clampRelativeCoordinates(relativeCoords);

        // Actualizar área con coordenadas relativas
        await db.printArea.update({
          where: { id: area.id },
          data: {
            relativeX: clampedCoords.x,
            relativeY: clampedCoords.y,
            relativeWidth: clampedCoords.width,
            relativeHeight: clampedCoords.height,
            isRelativeCoordinates: true
          }
        });

        console.log(`  ✅ Área migrada: x=${clampedCoords.x.toFixed(2)}%, y=${clampedCoords.y.toFixed(2)}%, w=${clampedCoords.width.toFixed(2)}%, h=${clampedCoords.height.toFixed(2)}%`);
        migratedCount++;

      } catch (error) {
        console.error(`  ❌ Error migrando área ${area.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📈 Resumen de migración de áreas:`);
    console.log(`✅ Áreas migradas exitosamente: ${migratedCount}`);
    console.log(`❌ Áreas con errores: ${errorCount}`);

  } catch (error) {
    console.error('❌ Error durante la migración de áreas:', error);
  }
}

async function updateTemplateData() {
  console.log('\n🚀 Actualizando datos de plantillas para usar coordenadas relativas...\n');

  try {
    // Obtener todas las plantillas Zakeke
    const templates = await db.zakekeTemplate.findMany();

    console.log(`📊 Encontradas ${templates.length} plantillas para revisar\n`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const template of templates) {
      try {
        console.log(`🔄 Revisando plantilla ${template.id} (${template.name})`);

        let templateData = template.templateData;
        let needsUpdate = false;

        // Procesar elementos en la plantilla
        if (templateData.areas && Array.isArray(templateData.areas)) {
          templateData.areas.forEach((area, areaIndex) => {
            if (area.elements && Array.isArray(area.elements)) {
              area.elements.forEach((element, elementIndex) => {
                // Si el elemento no tiene coordenadas relativas, calcularlas
                if (!element.relativeX && element.x !== undefined) {
                  const referenceDimensions = { width: 800, height: 600 };
                  const relativeCoords = absoluteToRelative({
                    x: element.x,
                    y: element.y,
                    width: element.width || 100,
                    height: element.height || 50
                  }, referenceDimensions);

                  element.relativeX = relativeCoords.x;
                  element.relativeY = relativeCoords.y;
                  element.relativeWidth = relativeCoords.width;
                  element.relativeHeight = relativeCoords.height;
                  element.referenceDimensionsWidth = referenceDimensions.width;
                  element.referenceDimensionsHeight = referenceDimensions.height;

                  needsUpdate = true;
                  console.log(`    ✅ Elemento ${elementIndex} actualizado con coordenadas relativas`);
                }
              });
            }
          });
        } else if (templateData.elements && Array.isArray(templateData.elements)) {
          templateData.elements.forEach((element, elementIndex) => {
            if (!element.relativeX && element.x !== undefined) {
              const referenceDimensions = { width: 800, height: 600 };
              const relativeCoords = absoluteToRelative({
                x: element.x,
                y: element.y,
                width: element.width || 100,
                height: element.height || 50
              }, referenceDimensions);

              element.relativeX = relativeCoords.x;
              element.relativeY = relativeCoords.y;
              element.relativeWidth = relativeCoords.width;
              element.relativeHeight = relativeCoords.height;
              element.referenceDimensionsWidth = referenceDimensions.width;
              element.referenceDimensionsHeight = referenceDimensions.height;

              needsUpdate = true;
              console.log(`    ✅ Elemento ${elementIndex} actualizado con coordenadas relativas`);
            }
          });
        }

        if (needsUpdate) {
          await db.zakekeTemplate.update({
            where: { id: template.id },
            data: { templateData }
          });
          updatedCount++;
          console.log(`  ✅ Plantilla ${template.name} actualizada`);
        } else {
          console.log(`  ℹ️  Plantilla ${template.name} ya tiene coordenadas relativas`);
        }

      } catch (error) {
        console.error(`  ❌ Error actualizando plantilla ${template.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📈 Resumen de actualización de plantillas:`);
    console.log(`✅ Plantillas actualizadas: ${updatedCount}`);
    console.log(`❌ Plantillas con errores: ${errorCount}`);

  } catch (error) {
    console.error('❌ Error durante la actualización de plantillas:', error);
  }
}

async function main() {
  console.log('🎯 Script de migración a coordenadas relativas\n');
  console.log('Este script migrará elementos existentes para usar coordenadas relativas');
  console.log('que solucionan el problema de desalineación en diferentes tamaños de imagen.\n');

  try {
    // Migrar elementos de diseño
    await migrateDesignElements();
    
    // Migrar áreas de impresión
    await migratePrintAreas();
    
    // Actualizar plantillas
    await updateTemplateData();

    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('\nAhora los elementos deberían mantenerse alineados correctamente');
    console.log('independientemente del tamaño de la imagen donde se muestren.\n');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = {
  migrateDesignElements,
  migratePrintAreas,
  updateTemplateData,
  absoluteToRelative,
  validateRelativeCoordinates,
  clampRelativeCoordinates
};