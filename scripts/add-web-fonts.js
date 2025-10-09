const { db } = require('../src/lib/db');
async function addWebFonts() {
  try {
    console.log('🌐 Agregando fuentes web adicionales...');

    const webFonts = [
      {
        name: 'Open Sans Regular',
        family: 'Open Sans',
        style: 'Regular',
        weight: '400',
        format: 'web',
        fileName: 'open-sans-regular.web',
        fileUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400',
        fileSize: 0,
        isActive: true
      },
      {
        name: 'Open Sans Bold',
        family: 'Open Sans',
        style: 'Bold',
        weight: '700',
        format: 'web',
        fileName: 'open-sans-bold.web',
        fileUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@700',
        fileSize: 0,
        isActive: true
      },
      {
        name: 'Roboto Regular',
        family: 'Roboto',
        style: 'Regular',
        weight: '400',
        format: 'web',
        fileName: 'roboto-regular.web',
        fileUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400',
        fileSize: 0,
        isActive: true
      },
      {
        name: 'Montserrat Regular',
        family: 'Montserrat',
        style: 'Regular',
        weight: '400',
        format: 'web',
        fileName: 'montserrat-regular.web',
        fileUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400',
        fileSize: 0,
        isActive: true
      },
      {
        name: 'Montserrat Bold',
        family: 'Montserrat',
        style: 'Bold',
        weight: '700',
        format: 'web',
        fileName: 'montserrat-bold.web',
        fileUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@700',
        fileSize: 0,
        isActive: true
      }
    ];

    for (const font of webFonts) {
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

      console.log(`✅ Agregada fuente web: ${font.family} ${font.style}`);
    }

    console.log('🎉 Fuentes web agregadas correctamente');
    
    // Mostrar resumen
    const totalFonts = await db.customFont.count();
    const activeFonts = await db.customFont.count({
      where: { isActive: true }
    });
    console.log(`📊 Total de fuentes: ${totalFonts} (${activeFonts} activas)`);

  } catch (error) {
    console.error('❌ Error al agregar fuentes web:', error);
  } finally {
    await db.$disconnect();
  }
}

addWebFonts();