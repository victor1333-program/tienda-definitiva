const { db } = require('../src/lib/db');
async function testFormData() {
  try {
    console.log('🧪 Probando datos para el formulario de variantes...\n');
    
    // Probar productos personalizables
    const products = await db.product.findMany({
      where: {
        isPersonalizable: true,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        isPersonalizable: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`✅ Productos personalizables encontrados: ${products.length}`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - €${product.basePrice}`);
    });
    
    // Probar plantillas Zakeke
    const templates = await db.zakekeTemplate.findMany({
      where: {
        isActive: true,
        isPublic: true
      },
      select: {
        id: true,
        name: true,
        category: true,
        thumbnailUrl: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`\n✅ Plantillas Zakeke encontradas: ${templates.length}`);
    templates.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name} (${template.category})`);
    });
    
    // Probar categorías
    const categories = await db.category.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`\n✅ Categorías encontradas: ${categories.length}`);
    categories.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category.name} (${category.slug})`);
    });
    
    if (products.length > 0 && categories.length > 0) {
      console.log('\n🎉 ¡Todo está listo para crear variantes de diseño!');
      console.log('\n📋 Próximos pasos:');
      console.log('1. Inicia sesión como admin en el panel');
      console.log('2. Ve a Personalización → Variantes de Diseño');
      console.log('3. Haz clic en "Nueva Variante"');
      console.log('4. ¡Los selectores ahora deberían mostrar datos!');
    } else {
      console.log('\n⚠️ Faltan datos para el formulario:');
      if (products.length === 0) console.log('- No hay productos personalizables');
      if (categories.length === 0) console.log('- No hay categorías activas');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

testFormData();