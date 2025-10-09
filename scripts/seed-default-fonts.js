const { db } = require('../src/lib/db');
async function seedDefaultFonts() {
  try {
    console.log('🔤 Insertando fuentes por defecto...');

    const defaultFonts = [
      {
        name: 'Arial Regular',
        family: 'Arial',
        style: 'Regular',
        weight: '400',
        format: 'system',
        fileName: 'arial-regular.system',
        fileUrl: null, // Fuente del sistema
        fileSize: 0,
        isActive: true
      },
      {
        name: 'Arial Bold',
        family: 'Arial',
        style: 'Bold',
        weight: '700',
        format: 'system',
        fileName: 'arial-bold.system',
        fileUrl: null,
        fileSize: 0,
        isActive: true
      },
      {
        name: 'Times New Roman Regular',
        family: 'Times New Roman',
        style: 'Regular',
        weight: '400',
        format: 'system',
        fileName: 'times-regular.system',
        fileUrl: null,
        fileSize: 0,
        isActive: true
      },
      {
        name: 'Helvetica Regular',
        family: 'Helvetica',
        style: 'Regular',
        weight: '400',
        format: 'system',
        fileName: 'helvetica-regular.system',
        fileUrl: null,
        fileSize: 0,
        isActive: true
      },
      {
        name: 'Georgia Regular',
        family: 'Georgia',
        style: 'Regular',
        weight: '400',
        format: 'system',
        fileName: 'georgia-regular.system',
        fileUrl: null,
        fileSize: 0,
        isActive: true
      }
    ];

    for (const font of defaultFonts) {
      // Verificar si ya existe
      const existingFont = await db.customFont.findFirst({
        where: {
          family: font.family,
          style: font.style
        }
      });

      if (existingFont) {
        console.log(`⏭️  Fuente ${font.family} ${font.style} ya existe, saltando...`);
        continue;
      }

      // Crear la fuente
      await db.customFont.create({
        data: font
      });

      console.log(`✅ Insertada fuente: ${font.family} ${font.style}`);
    }

    console.log('🎉 Fuentes por defecto insertadas correctamente');
    
    // Mostrar resumen
    const totalFonts = await db.customFont.count();
    console.log(`📊 Total de fuentes en la base de datos: ${totalFonts}`);

  } catch (error) {
    console.error('❌ Error al insertar fuentes por defecto:', error);
  } finally {
    await db.$disconnect();
  }
}

seedDefaultFonts();