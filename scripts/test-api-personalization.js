const productId = 'cmc5ysotf0009jg3vvq6d2ql8';

async function testAPI() {
  try {
    console.log('🔍 Probando API del producto con personalización...');
    console.log(`📡 URL: http://localhost:3000/api/products/public/${productId}?include=variants`);

    const response = await fetch(`http://localhost:3000/api/products/public/${productId}?include=variants`);
    
    if (!response.ok) {
      console.log('❌ Error en la respuesta:', response.status, response.statusText);
      return;
    }

    const data = await response.json();
    
    console.log('✅ Respuesta de la API:');
    console.log('📝 Producto:', data.name);
    console.log('🆔 ID:', data.id);
    
    if (data.personalization) {
      console.log('🎨 ✅ Datos de personalización encontrados:');
      console.log('  - ID:', data.personalization.id);
      console.log('  - Nombre:', data.personalization.name);
      console.log('  - Permite texto:', data.personalization.allowText);
      console.log('  - Permite imágenes:', data.personalization.allowImages);
      console.log('  - Mockups:', data.personalization.mockups?.length || 0);
      
      if (data.personalization.mockups) {
        data.personalization.mockups.slice(0, 2).forEach((mockup, index) => {
          console.log(`  📸 Mockup ${index + 1}: ${mockup.name}`);
          console.log(`    - Variante: ${mockup.variant.size} - ${mockup.variant.colorName}`);
          console.log(`    - Áreas: ${mockup.areas?.length || 0}`);
        });
      }
      
      console.log('\n🎯 Resultado: EL BOTÓN "¡PERSONALÍZAME!" DEBE APARECER');
    } else {
      console.log('❌ No se encontraron datos de personalización');
      console.log('🎯 Resultado: EL BOTÓN "¡PERSONALÍZAME!" NO APARECERÁ');
    }

    // Verificar también las variantes
    console.log('\n📋 Variantes del producto:');
    if (data.variants && data.variants.length > 0) {
      data.variants.slice(0, 3).forEach((variant, index) => {
        console.log(`  ${index + 1}. ${variant.size} - ${variant.color} (Stock: ${variant.stock})`);
      });
    } else {
      console.log('  No hay variantes');
    }

  } catch (error) {
    console.error('❌ Error al probar la API:', error.message);
  }
}

testAPI();