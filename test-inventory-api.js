const { db } = require('../src/lib/db');
async function testInventoryHierarchy() {
  try {
    console.log('=== TESTING INVENTORY HIERARCHICAL DATA STRUCTURE ===\n');
    
    // Test the hierarchical structure that should be returned by the API
    const products = await db.product.findMany({
      include: {
        variants: {
          select: {
            id: true,
            sku: true,
            size: true,
            colorName: true,
            colorDisplay: true,
            colorHex: true,
            material: true,
            stock: true,
            price: true,
            isActive: true
          },
          where: {
            isActive: true
          },
          orderBy: [
            { size: 'asc' },
            { colorName: 'asc' }
          ]
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      },
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`Found ${products.length} active products\n`);
    
    // Process and display the hierarchical structure
    const inventoryData = products.map(product => {
      const hasVariants = product.variants.length > 0;
      const totalStock = hasVariants 
        ? product.variants.reduce((sum, variant) => sum + variant.stock, 0)
        : product.directStock;
      
      const lowStock = hasVariants 
        ? product.variants.some(variant => variant.stock <= product.minStock)
        : product.directStock <= product.minStock;
      
      const outOfStock = hasVariants
        ? product.variants.every(variant => variant.stock === 0)
        : product.directStock === 0;
      
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        basePrice: product.basePrice,
        brand: product.brand,
        supplier: product.supplier,
        trackInventory: product.trackInventory,
        
        // Inventory summary
        inventory: {
          totalStock: totalStock,
          directStock: product.directStock,
          minStock: product.minStock,
          hasVariants: hasVariants,
          lowStock: lowStock,
          outOfStock: outOfStock,
          stockStatus: outOfStock ? 'OUT_OF_STOCK' : lowStock ? 'LOW_STOCK' : 'IN_STOCK'
        },
        
        // Variants (if any)
        variants: hasVariants ? product.variants.map(variant => ({
          id: variant.id,
          sku: variant.sku,
          size: variant.size,
          color: {
            name: variant.colorName,
            display: variant.colorDisplay,
            hex: variant.colorHex
          },
          material: variant.material,
          stock: variant.stock,
          price: variant.price || product.basePrice,
          isActive: variant.isActive,
          stockStatus: variant.stock === 0 ? 'OUT_OF_STOCK' : variant.stock <= product.minStock ? 'LOW_STOCK' : 'IN_STOCK'
        })) : [],
        
        // Categories
        categories: product.categories.map(pc => ({
          id: pc.category.id,
          name: pc.category.name,
          slug: pc.category.slug,
          isPrimary: pc.isPrimary
        }))
      };
    });
    
    // Display summary
    console.log('=== INVENTORY SUMMARY ===');
    console.log(`Total Products: ${inventoryData.length}`);
    console.log(`Products with Variants: ${inventoryData.filter(p => p.inventory.hasVariants).length}`);
    console.log(`Products without Variants: ${inventoryData.filter(p => !p.inventory.hasVariants).length}`);
    console.log(`Out of Stock: ${inventoryData.filter(p => p.inventory.outOfStock).length}`);
    console.log(`Low Stock: ${inventoryData.filter(p => p.inventory.lowStock).length}`);
    console.log(`In Stock: ${inventoryData.filter(p => p.inventory.stockStatus === 'IN_STOCK').length}`);
    
    // Display detailed breakdown
    console.log('\n=== DETAILED INVENTORY BREAKDOWN ===\n');
    
    inventoryData.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Brand: ${product.brand} | Supplier: ${product.supplier}`);
      console.log(`   Total Stock: ${product.inventory.totalStock} | Min Stock: ${product.inventory.minStock} | Status: ${product.inventory.stockStatus}`);
      
      if (product.inventory.hasVariants) {
        console.log(`   Variants (${product.variants.length}):`);
        product.variants.forEach(variant => {
          const colorInfo = variant.color.name || variant.color.display || 'No color';
          const sizeInfo = variant.size || 'No size';
          console.log(`     - ${sizeInfo} ${colorInfo}: ${variant.stock} units (${variant.stockStatus})`);
        });
      } else {
        console.log(`   Direct Stock: ${product.inventory.directStock} units`);
      }
      
      console.log(`   Categories: ${product.categories.map(c => c.name).join(', ')}`);
      console.log('');
    });
    
    // Test low stock and out of stock filtering
    console.log('=== STOCK ALERTS ===');
    const lowStockProducts = inventoryData.filter(p => p.inventory.lowStock && !p.inventory.outOfStock);
    const outOfStockProducts = inventoryData.filter(p => p.inventory.outOfStock);
    
    if (lowStockProducts.length > 0) {
      console.log(`\nLow Stock Products (${lowStockProducts.length}):`);
      lowStockProducts.forEach(product => {
        console.log(`- ${product.name}: ${product.inventory.totalStock} units`);
      });
    }
    
    if (outOfStockProducts.length > 0) {
      console.log(`\nOut of Stock Products (${outOfStockProducts.length}):`);
      outOfStockProducts.forEach(product => {
        console.log(`- ${product.name}: ${product.inventory.totalStock} units`);
      });
    }
    
    if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
      console.log('\n✅ All products have adequate stock levels!');
    }
    
    console.log('\n=== INVENTORY STRUCTURE TEST COMPLETED ===');
    
    // Return the structured data for API testing
    return {
      products: inventoryData,
      summary: {
        totalProducts: inventoryData.length,
        withVariants: inventoryData.filter(p => p.inventory.hasVariants).length,
        withoutVariants: inventoryData.filter(p => !p.inventory.hasVariants).length,
        outOfStock: inventoryData.filter(p => p.inventory.outOfStock).length,
        lowStock: inventoryData.filter(p => p.inventory.lowStock).length,
        inStock: inventoryData.filter(p => p.inventory.stockStatus === 'IN_STOCK').length
      }
    };
    
  } catch (error) {
    console.error('Error testing inventory hierarchy:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run the test
testInventoryHierarchy()
  .then((result) => {
    console.log('\n✅ Inventory hierarchy test completed successfully!');
    console.log('Data structure is ready for API integration.');
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });