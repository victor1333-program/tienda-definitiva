// Test script para verificar APIs de personalización
console.log('Testing Personalization APIs...');

async function testPersonalizationFlow() {
  try {
    // Test 1: Obtener productos disponibles
    const productsResponse = await fetch('http://localhost:3000/api/products?limit=100');
    if (!productsResponse.ok) {
      console.error('❌ Error getting products:', productsResponse.status);
      return;
    }
    const productsData = await productsResponse.json();
    console.log('✅ Products API working:', productsData.products?.length || 0, 'products found');

    // Test 2: Obtener categorías de personalización
    const categoriesResponse = await fetch('http://localhost:3000/api/personalization/categories');
    if (!categoriesResponse.ok) {
      console.error('❌ Error getting personalization categories:', categoriesResponse.status);
      return;
    }
    const categoriesData = await categoriesResponse.json();
    console.log('✅ Categories API working:', categoriesData.categories?.length || 0, 'categories found');

    // Test 3: Obtener configuraciones existentes
    const configurationsResponse = await fetch('http://localhost:3000/api/personalization/configurations');
    if (!configurationsResponse.ok) {
      console.error('❌ Error getting configurations:', configurationsResponse.status);
      return;
    }
    const configurationsData = await configurationsResponse.json();
    console.log('✅ Configurations API working:', configurationsData.personalizations?.length || 0, 'configurations found');

    console.log('✅ All APIs are working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Solo ejecutar si el servidor está corriendo
if (typeof window === 'undefined') {
  testPersonalizationFlow();
}