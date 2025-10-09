const { db } = require('../src/lib/db');
async function seedMorePrintingMethods() {
  try {
    console.log('Agregando métodos de impresión adicionales...');

    const printingMethods = [
      {
        name: 'DTG (Direct to Garment)',
        isActive: true,
        outputFormat: 'PNG',
        dpi: 300,
        singleFile: true,
        allowText: true,
        allowTextArt: true,
        allowTextBox: true,
        allowCurvedText: true,
        maxTextElements: 10,
        defaultTextColor: '#000000',
        predefinedColors: JSON.stringify(['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff']),
        enableImageGallery: true,
        autoFitImages: true,
        allowUserUploads: true,
        maxImages: 5,
        acceptPNG: true,
        acceptJPG: true,
        acceptSVG: true,
        enableImageTools: true,
        enableTransform: true,
        enableFilters: true,
        allowDuplicate: true,
        allowFlip: true,
        allowLayerOrder: true,
        maxColors: 8
      },
      {
        name: 'DTF (Direct to Film)',
        isActive: true,
        outputFormat: 'PNG',
        dpi: 300,
        singleFile: true,
        allowText: true,
        allowTextArt: true,
        allowTextBox: true,
        allowCurvedText: true,
        maxTextElements: 8,
        defaultTextColor: '#ffffff',
        predefinedColors: JSON.stringify(['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00']),
        enableImageGallery: true,
        autoFitImages: true,
        allowUserUploads: true,
        maxImages: 3,
        acceptPNG: true,
        acceptJPG: true,
        acceptSVG: true,
        enableImageTools: true,
        enableTransform: true,
        enableFilters: true,
        allowDuplicate: true,
        allowFlip: true,
        allowLayerOrder: true,
        maxColors: 6
      },
      {
        name: 'Sublimación',
        isActive: true,
        outputFormat: 'PDF',
        dpi: 300,
        singleFile: true,
        useCMYKProfile: true,
        allowText: true,
        allowTextArt: true,
        allowTextBox: true,
        allowCurvedText: true,
        maxTextElements: 0, // Sin límite
        defaultTextColor: '#000000',
        predefinedColors: JSON.stringify(['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']),
        enableImageGallery: true,
        autoFitImages: true,
        allowUserUploads: true,
        maxImages: 0, // Sin límite
        acceptPNG: true,
        acceptJPG: true,
        acceptSVG: true,
        acceptPDF: true,
        enableImageTools: true,
        enableTransform: true,
        enableFilters: true,
        allowDuplicate: true,
        allowFlip: true,
        allowLayerOrder: true,
        maxColors: 0 // Sin límite para sublimación
      },
      {
        name: 'Vinilo',
        isActive: true,
        outputFormat: 'SVG',
        dpi: 300,
        singleFile: true,
        allowText: true,
        allowTextArt: true,
        allowTextBox: false,
        allowCurvedText: true,
        maxTextElements: 5,
        defaultTextColor: '#000000',
        predefinedColors: JSON.stringify(['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00']),
        enableImageGallery: false,
        autoFitImages: false,
        allowUserUploads: true,
        maxImages: 2,
        acceptPNG: false,
        acceptJPG: false,
        acceptSVG: true,
        acceptPDF: false,
        enableImageTools: false,
        enableTransform: true,
        enableFilters: false,
        allowDuplicate: true,
        allowFlip: true,
        allowLayerOrder: true,
        maxColors: 3
      },
      {
        name: 'Bordado',
        isActive: true,
        outputFormat: 'DXF',
        dpi: 300,
        singleFile: true,
        allowText: true,
        allowTextArt: false,
        allowTextBox: false,
        allowCurvedText: false,
        maxTextElements: 3,
        defaultTextColor: '#000000',
        predefinedColors: JSON.stringify(['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff']),
        enableImageGallery: false,
        autoFitImages: false,
        allowUserUploads: false,
        maxImages: 1,
        acceptPNG: false,
        acceptJPG: false,
        acceptSVG: true,
        acceptPDF: false,
        enableImageTools: false,
        enableTransform: false,
        enableFilters: false,
        allowDuplicate: false,
        allowFlip: false,
        allowLayerOrder: false,
        maxColors: 6
      },
      {
        name: 'Serigrafía',
        isActive: true,
        outputFormat: 'PDF',
        dpi: 300,
        singleFile: false,
        duplicateFiles: true,
        allowText: true,
        allowTextArt: true,
        allowTextBox: true,
        allowCurvedText: true,
        maxTextElements: 0,
        defaultTextColor: '#000000',
        predefinedColors: JSON.stringify(['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00']),
        enableImageGallery: true,
        autoFitImages: true,
        allowUserUploads: true,
        maxImages: 0,
        acceptPNG: true,
        acceptJPG: true,
        acceptSVG: true,
        acceptPDF: true,
        enableImageTools: true,
        enableTransform: true,
        enableFilters: true,
        allowDuplicate: true,
        allowFlip: true,
        allowLayerOrder: true,
        maxColors: 4
      }
    ];

    // Verificar si ya existen estos métodos
    for (const method of printingMethods) {
      const existing = await db.printingMethodConfig.findFirst({
        where: { name: method.name }
      });

      if (!existing) {
        await db.printingMethodConfig.create({
          data: method
        });
        console.log(`✅ Método creado: ${method.name}`);
      } else {
        console.log(`⚠️  Método ya existe: ${method.name}`);
      }
    }

    console.log('\n✅ Proceso completado. Métodos de impresión agregados.');
    
  } catch (error) {
    console.error('Error al agregar métodos de impresión:', error);
  } finally {
    await db.$disconnect();
  }
}

seedMorePrintingMethods();