const { db } = require('../src/lib/db');
async function checkPersonalizableProducts() {
  try {
    console.log('🔍 Verificando productos personalizables...\n');
    
    // Verificar total de productos
    const totalProducts = await db.product.count();
    console.log(`📊 Total de productos: ${totalProducts}`);
    
    // Verificar productos personalizables
    const personalizableProducts = await db.product.findMany({
      where: { isPersonalizable: true },
      select: {
        id: true,
        name: true,
        isPersonalizable: true,
        isActive: true
      }
    });
    
    console.log(`✨ Productos personalizables: ${personalizableProducts.length}`);
    
    if (personalizableProducts.length > 0) {
      console.log('\n📋 Lista de productos personalizables:');
      personalizableProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (ID: ${product.id}) - Activo: ${product.isActive}`);
      });
    } else {
      console.log('\n❌ No hay productos marcados como personalizables');
      console.log('\n🔧 Soluciones:');
      console.log('1. Marcar algunos productos como personalizables');
      console.log('2. Crear productos nuevos con personalización activada');
    }
    
    // Verificar categorías
    const totalCategories = await db.category.count();
    console.log(`\n📂 Total de categorías: ${totalCategories}`);
    
    // Verificar plantillas Zakeke
    const zakekeTemplates = await db.zakekeTemplate.count();
    console.log(`🎨 Plantillas Zakeke: ${zakekeTemplates}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkPersonalizableProducts();