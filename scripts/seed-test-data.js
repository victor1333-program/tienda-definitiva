const { db } = require('../src/lib/db');
async function seedTestData() {
  console.log('🌱 Insertando datos de prueba...');
  
  try {
    // Create categories
    const categories = await Promise.all([
      db.category.create({
        data: {
          name: 'Camisetas',
          slug: 'camisetas',
          description: 'Camisetas personalizables de alta calidad',
          image: '/images/categories/camisetas.jpg',
          icon: '👕',
          isActive: true,
          sortOrder: 1,
          categoryType: 'FEATURED'
        }
      }),
      db.category.create({
        data: {
          name: 'Tazas',
          slug: 'tazas',
          description: 'Tazas personalizables para cualquier ocasión',
          image: '/images/categories/tazas.jpg',
          icon: '☕',
          isActive: true,
          sortOrder: 2,
          categoryType: 'FEATURED'
        }
      }),
      db.category.create({
        data: {
          name: 'Bolsas',
          slug: 'bolsas',
          description: 'Bolsas reutilizables personalizables',
          image: '/images/categories/bolsas.jpg',
          icon: '🛍️',
          isActive: true,
          sortOrder: 3,
          categoryType: 'REGULAR'
        }
      })
    ]);
    
    console.log(`✅ Creadas ${categories.length} categorías`);
    
    // Create products
    const products = [
      {
        name: 'Camiseta Básica Algodón',
        slug: 'camiseta-basica-algodon',
        sku: 'CAMI-BAS-001',
        description: 'Camiseta 100% algodón ideal para personalización con vinilo textil o serigrafía',
        basePrice: 15.99,
        comparePrice: 19.99,
        costPrice: 8.50,
        images: JSON.stringify([
          '/images/products/camiseta-blanca-frontal.jpg',
          '/images/products/camiseta-blanca-trasera.jpg'
        ]),
        hasQuantityPricing: true,
        quantityPrices: JSON.stringify([
          { min: 1, max: 9, price: 15.99 },
          { min: 10, max: 49, price: 14.99 },
          { min: 50, max: 99, price: 13.99 },
          { min: 100, max: null, price: 12.99 }
        ]),
        isActive: true,
        featured: true,
        topSelling: true,
        stock: 100,
        directStock: 50,
        minStock: 10,
        brand: 'Fruit of the Loom',
        materialType: '100% Algodón',
        categoryId: categories[0].id
      },
      {
        name: 'Taza Cerámica Blanca 11oz',
        slug: 'taza-ceramica-blanca-11oz',
        sku: 'TAZA-CER-001',
        description: 'Taza de cerámica blanca de 11oz perfecta para sublimación',
        basePrice: 8.99,
        comparePrice: 11.99,
        costPrice: 4.50,
        images: JSON.stringify([
          '/images/products/taza-blanca.jpg',
          '/images/products/taza-blanca-interior.jpg'
        ]),
        hasQuantityPricing: true,
        quantityPrices: JSON.stringify([
          { min: 1, max: 9, price: 8.99 },
          { min: 10, max: 49, price: 7.99 },
          { min: 50, max: 99, price: 6.99 },
          { min: 100, max: null, price: 5.99 }
        ]),
        isActive: true,
        featured: true,
        stock: 150,
        directStock: 75,
        minStock: 20,
        brand: 'Orca Coatings',
        materialType: 'Cerámica con recubrimiento para sublimación',
        categoryId: categories[1].id
      },
      {
        name: 'Bolsa de Algodón Natural',
        slug: 'bolsa-algodon-natural',
        sku: 'BOLSA-ALG-001',
        description: 'Bolsa de algodón natural reutilizable, ideal para personalización ecológica',
        basePrice: 4.99,
        comparePrice: 6.99,
        costPrice: 2.25,
        images: JSON.stringify([
          '/images/products/bolsa-algodon.jpg'
        ]),
        hasQuantityPricing: true,
        quantityPrices: JSON.stringify([
          { min: 1, max: 24, price: 4.99 },
          { min: 25, max: 99, price: 4.49 },
          { min: 100, max: 249, price: 3.99 },
          { min: 250, max: null, price: 3.49 }
        ]),
        isActive: true,
        stock: 200,
        directStock: 100,
        minStock: 25,
        brand: 'EcoBags',
        materialType: '100% Algodón Natural',
        categoryId: categories[2].id
      }
    ];
    
    const createdProducts = [];
    for (const productData of products) {
      const { categoryId, ...productFields } = productData;
      
      const product = await db.product.create({
        data: productFields
      });
      
      // Create product-category relationship
      await db.productCategory.create({
        data: {
          productId: product.id,
          categoryId: categoryId,
          isPrimary: true
        }
      });
      
      createdProducts.push(product);
    }
    
    console.log(`✅ Creados ${createdProducts.length} productos`);
    
    // Create product variants
    const variants = [];
    
    // Variants for T-shirt (sizes and colors)
    const tshirtColors = [
      { name: 'Blanco', hex: '#FFFFFF', display: 'Blanco' },
      { name: 'Negro', hex: '#000000', display: 'Negro' },
      { name: 'Azul Marino', hex: '#1f2937', display: 'Azul Marino' },
      { name: 'Rojo', hex: '#dc2626', display: 'Rojo' }
    ];
    
    const tshirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    
    for (const color of tshirtColors) {
      for (const size of tshirtSizes) {
        const variant = await db.productVariant.create({
          data: {
            sku: `CAMI-BAS-001-${color.name.toUpperCase().replace(' ', '')}-${size}`,
            size: size,
            colorName: color.name,
            colorHex: color.hex,
            colorDisplay: color.display,
            material: '100% Algodón',
            stock: Math.floor(Math.random() * 20) + 5,
            price: 15.99,
            isActive: true,
            images: JSON.stringify([
              `/images/products/camiseta-${color.name.toLowerCase().replace(' ', '-')}-${size.toLowerCase()}.jpg`
            ]),
            productId: createdProducts[0].id
          }
        });
        variants.push(variant);
      }
    }
    
    // Variants for Mug (only colors, no sizes)
    const mugColors = [
      { name: 'Blanco', hex: '#FFFFFF', display: 'Blanco' },
      { name: 'Azul', hex: '#3b82f6', display: 'Azul' },
      { name: 'Rosa', hex: '#ec4899', display: 'Rosa' }
    ];
    
    for (const color of mugColors) {
      const variant = await db.productVariant.create({
        data: {
          sku: `TAZA-CER-001-${color.name.toUpperCase()}`,
          colorName: color.name,
          colorHex: color.hex,
          colorDisplay: color.display,
          material: 'Cerámica',
          stock: Math.floor(Math.random() * 30) + 10,
          price: 8.99,
          isActive: true,
          images: JSON.stringify([
            `/images/products/taza-${color.name.toLowerCase()}.jpg`
          ]),
          productId: createdProducts[1].id,
          width: 11,
          height: 9.5
        }
      });
      variants.push(variant);
    }
    
    // Variants for Bag (only natural color, different sizes)
    const bagSizes = [
      { name: 'Pequeña', width: 30, height: 35 },
      { name: 'Mediana', width: 35, height: 40 },
      { name: 'Grande', width: 40, height: 45 }
    ];
    
    for (const bagSize of bagSizes) {
      const variant = await db.productVariant.create({
        data: {
          sku: `BOLSA-ALG-001-${bagSize.name.toUpperCase()}`,
          size: bagSize.name,
          colorName: 'Natural',
          colorHex: '#f5f5dc',
          colorDisplay: 'Natural',
          material: '100% Algodón Natural',
          stock: Math.floor(Math.random() * 40) + 15,
          price: 4.99,
          isActive: true,
          images: JSON.stringify([
            `/images/products/bolsa-algodon-${bagSize.name.toLowerCase()}.jpg`
          ]),
          productId: createdProducts[2].id,
          width: bagSize.width,
          height: bagSize.height
        }
      });
      variants.push(variant);
    }
    
    console.log(`✅ Creadas ${variants.length} variantes de productos`);
    
    // Create personalization categories
    const personalizationCategories = await Promise.all([
      db.personalizationCategory.create({
        data: {
          name: 'Textil',
          slug: 'textil',
          description: 'Personalización para productos textiles',
          sortOrder: 1,
          isActive: true
        }
      }),
      db.personalizationCategory.create({
        data: {
          name: 'Sublimación',
          slug: 'sublimacion',
          description: 'Personalización por sublimación',
          sortOrder: 2,
          isActive: true
        }
      })
    ]);
    
    console.log(`✅ Creadas ${personalizationCategories.length} categorías de personalización`);
    
    // Create personalizations for products
    const tshirtPersonalization = await db.personalization.create({
      data: {
        name: 'Personalización Camiseta',
        description: 'Personaliza tu camiseta con vinilo textil, serigrafía o bordado',
        isActive: true,
        productId: createdProducts[0].id,
        categoryId: personalizationCategories[0].id,
        allowText: true,
        allowImages: true,
        maxImages: 3,
        maxFileSize: 10
      }
    });
    
    const mugPersonalization = await db.personalization.create({
      data: {
        name: 'Personalización Taza',
        description: 'Personaliza tu taza con sublimación',
        isActive: true,
        productId: createdProducts[1].id,
        categoryId: personalizationCategories[1].id,
        allowText: true,
        allowImages: true,
        maxImages: 2,
        maxFileSize: 15
      }
    });
    
    console.log('✅ Creadas personalizaciones para productos');
    
    // Create shipping methods
    const shippingMethods = await Promise.all([
      db.shippingMethod.create({
        data: {
          name: 'Estándar',
          description: 'Envío estándar 3-5 días laborables',
          price: 4.95,
          isActive: true,
          estimatedDays: '3-5 días'
        }
      }),
      db.shippingMethod.create({
        data: {
          name: 'Express',
          description: 'Envío express 24-48h',
          price: 9.95,
          isActive: true,
          estimatedDays: '24-48h'
        }
      }),
      db.shippingMethod.create({
        data: {
          name: 'Recogida en tienda',
          description: 'Recoge tu pedido en nuestra tienda',
          price: 0,
          isActive: true,
          estimatedDays: '2-3 días'
        }
      })
    ]);
    
    console.log(`✅ Creados ${shippingMethods.length} métodos de envío`);
    
    // Create sample discounts
    const discounts = await Promise.all([
      db.discount.create({
        data: {
          code: 'BIENVENIDO10',
          name: 'Descuento de Bienvenida',
          type: 'PRODUCT_DISCOUNT',
          value: 10,
          isPercentage: true,
          minOrderAmount: 20,
          maxUses: 100,
          usedCount: 0,
          usesPerCustomer: 1,
          oneTimePerCustomer: true,
          isActive: true,
          validFrom: new Date(),
          validUntil: new Date('2024-12-31'),
          targetType: 'ALL',
          description: 'Descuento del 10% para nuevos clientes',
          allCountries: true
        }
      }),
      db.discount.create({
        data: {
          code: 'ENVIOGRATIS',
          name: 'Envío Gratuito',
          type: 'FREE_SHIPPING',
          value: 0,
          isPercentage: false,
          minOrderAmount: 50,
          isActive: true,
          validFrom: new Date(),
          targetType: 'ALL',
          description: 'Envío gratuito en pedidos superiores a 50€',
          allCountries: true
        }
      })
    ]);
    
    console.log(`✅ Creados ${discounts.length} descuentos`);
    
    // Create settings
    const settings = await Promise.all([
      db.setting.create({
        data: {
          key: 'site_name',
          value: JSON.stringify('Lovilike - Personalización Profesional')
        }
      }),
      db.setting.create({
        data: {
          key: 'site_description',
          value: JSON.stringify('Tu tienda de personalización profesional. Camisetas, tazas, bolsas y mucho más.')
        }
      }),
      db.setting.create({
        data: {
          key: 'company_info',
          value: JSON.stringify({
            name: 'Lovilike S.L.',
            email: 'info@lovilike.es',
            phone: '+34 600 000 000',
            address: 'Calle Principal 123, 28001 Madrid',
            taxId: 'B12345678'
          })
        }
      }),
      db.setting.create({
        data: {
          key: 'social_media',
          value: JSON.stringify({
            facebook: 'https://facebook.com/lovilike',
            instagram: 'https://instagram.com/lovilike',
            twitter: 'https://twitter.com/lovilike',
            youtube: 'https://youtube.com/lovilike'
          })
        }
      })
    ]);
    
    console.log(`✅ Creadas ${settings.length} configuraciones`);
    
    console.log('\n🎉 ¡Datos de prueba insertados exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`- ${categories.length} categorías`);
    console.log(`- ${createdProducts.length} productos`);
    console.log(`- ${variants.length} variantes`);
    console.log(`- ${personalizationCategories.length} categorías de personalización`);
    console.log(`- 2 personalizaciones`);
    console.log(`- ${shippingMethods.length} métodos de envío`);
    console.log(`- ${discounts.length} descuentos`);
    console.log(`- ${settings.length} configuraciones`);
    console.log('\n✅ La base de datos está lista para pruebas');
    
  } catch (error) {
    console.error('❌ Error insertando datos de prueba:', error);
  } finally {
    await db.$disconnect();
  }
}

seedTestData();