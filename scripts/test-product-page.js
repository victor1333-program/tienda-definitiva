const productId = 'cmc5ysotf0009jg3vvq6d2ql8';

async function testProductPage() {
  try {
    console.log('🔍 Probando página del producto...');
    console.log(`📄 URL: http://localhost:3000/productos/${productId}`);

    const response = await fetch(`http://localhost:3000/productos/${productId}`);
    
    if (!response.ok) {
      console.log('❌ Error en la respuesta:', response.status, response.statusText);
      return;
    }

    const html = await response.text();
    
    // Buscar elementos específicos en el HTML
    const hasPersonalizeButton = html.includes('¡Personalízame!');
    const hasPersonalizationCheck = html.includes('product.personalization');
    const hasEditorLink = html.includes(`/editor/${productId}`);
    const hasAddToCartButton = html.includes('Añadir al carrito');
    
    console.log('📊 Verificación del HTML de la página:');
    console.log(`✅ Botón "Añadir al carrito": ${hasAddToCartButton ? '✅ Encontrado' : '❌ No encontrado'}`);
    console.log(`✅ Botón "¡Personalízame!": ${hasPersonalizeButton ? '✅ Encontrado' : '❌ No encontrado'}`);
    console.log(`✅ Link al editor: ${hasEditorLink ? '✅ Encontrado' : '❌ No encontrado'}`);
    console.log(`✅ Verificación JS personalización: ${hasPersonalizationCheck ? '✅ Encontrado' : '❌ No encontrado'}`);
    
    if (hasPersonalizeButton && hasEditorLink) {
      console.log('\n🎉 ¡ÉXITO! El botón "¡Personalízame!" está presente en la página');
      console.log(`🔗 El botón debería llevar a: /editor/${productId}`);
    } else {
      console.log('\n❌ PROBLEMA: El botón no está presente o el link es incorrecto');
      
      // Buscar errores en el HTML
      if (html.includes('Error') || html.includes('error')) {
        console.log('🐛 Posibles errores encontrados en la página');
      }
      
      // Verificar si hay datos del producto
      if (html.includes('Camiseta Básica DTF')) {
        console.log('✅ Los datos del producto sí están cargando');
      } else {
        console.log('❌ Los datos del producto no están cargando');
      }
    }
    
    // Verificar también errores de React/Next.js
    const hasReactError = html.includes('Application error') || html.includes('Error: ');
    if (hasReactError) {
      console.log('⚠️  Posibles errores de React/Next.js detectados');
    }

  } catch (error) {
    console.error('❌ Error al acceder a la página:', error.message);
  }
}

testProductPage();