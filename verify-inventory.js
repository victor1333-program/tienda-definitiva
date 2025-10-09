const { db } = require('../src/lib/db');
async function verifyUpdatedData() {
  try {
    console.log('=== VERIFYING UPDATED INVENTORY DATA ===\n');
    
    // Get all products with their variants
    const products = await db.product.findMany({
      include: {
        variants: {
          orderBy: {
            size: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`Found ${products.length} products\n`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. Product: ${product.name}`);
      console.log(`   Stock: ${product.stock} | DirectStock: ${product.directStock} | MinStock: ${product.minStock}`);
      console.log(`   Brand: ${product.brand} | Supplier: ${product.supplier}`);
      console.log(`   Variants: ${product.variants.length}`);
      
      if (product.variants.length > 0) {
        let totalVariantStock = 0;
        product.variants.forEach(variant => {
          totalVariantStock += variant.stock;
          console.log(`     - ${variant.size || 'No size'} ${variant.colorName || variant.colorDisplay || 'No color'}: ${variant.stock} units`);
        });
        console.log(`   Total Variant Stock: ${totalVariantStock} (should match Product Stock: ${product.stock})`);
        
        if (totalVariantStock !== product.stock) {
          console.log(`   ⚠️  MISMATCH: Variant total (${totalVariantStock}) != Product stock (${product.stock})`);
        } else {
          console.log(`   ✅ Stock calculation correct`);
        }
      } else {
        console.log(`   ✅ No variants - using directStock (${product.directStock})`);
      }
      console.log('');
    });
    
    await db.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await db.$disconnect();
  }
}

verifyUpdatedData();