const { db } = require('../src/lib/db');
async function migrateToDesignVariants() {
  console.log('🚀 Iniciando migración a variantes de diseño...');

  try {
    // 1. Buscar productos personalizables que no tengan variantes de diseño
    const personalizableProducts = await db.product.findMany({
      where: {
        isPersonalizable: true,
        hasDesignVariants: false
      },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    console.log(`📦 Encontrados ${personalizableProducts.length} productos personalizables`);

    // 2. Buscar plantillas Zakeke populares
    const popularTemplates = await db.zakekeTemplate.findMany({
      where: {
        isActive: true,
        isPublic: true,
        usageCount: {
          gt: 0
        }
      },
      orderBy: {
        usageCount: 'desc'
      },
      take: 20
    });

    console.log(`🎨 Encontradas ${popularTemplates.length} plantillas populares`);

    // 3. Crear variantes de diseño para combinaciones producto-plantilla
    let createdVariants = 0;

    for (const product of personalizableProducts) {
      console.log(`\n📝 Procesando producto: ${product.name}`);

      // Filtrar plantillas compatibles por tipo de producto
      const compatibleTemplates = popularTemplates.filter(template => 
        template.productTypes.length === 0 || 
        template.productTypes.some(type => 
          product.name.toLowerCase().includes(type.toLowerCase()) ||
          product.categories.some(cat => 
            cat.category.name.toLowerCase().includes(type.toLowerCase())
          )
        )
      );

      console.log(`   🎯 ${compatibleTemplates.length} plantillas compatibles`);

      // Crear variantes para las plantillas más relevantes (máximo 3 por producto)
      const templatesForProduct = compatibleTemplates.slice(0, 3);

      for (const template of templatesForProduct) {
        try {
          // Generar nombre único
          const variantName = `${product.name} - ${template.name}`;
          
          // Generar slug único
          let baseSlug = variantName.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim();
          
          let slug = baseSlug;
          let counter = 1;
          
          while (await db.productDesignVariant.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
          }

          // Generar SKU único
          const baseSku = `${product.sku || product.slug.toUpperCase()}-DSG`;
          let sku = baseSku;
          counter = 1;
          
          while (await db.productDesignVariant.findUnique({ where: { sku } })) {
            sku = `${baseSku}-${counter.toString().padStart(3, '0')}`;
            counter++;
          }

          // Calcular sobreprecio basado en la complejidad de la plantilla
          let designSurcharge = 0;
          if (template.category.toLowerCase().includes('premium')) {
            designSurcharge = product.basePrice * 0.3; // 30% para premium
          } else if (template.category.toLowerCase().includes('complex')) {
            designSurcharge = product.basePrice * 0.2; // 20% para complex
          } else {
            designSurcharge = product.basePrice * 0.1; // 10% para simple/medium
          }

          designSurcharge = Math.round(designSurcharge * 100) / 100; // Redondear a 2 decimales

          // Determinar complejidad
          let complexity = 'SIMPLE';
          if (template.category.toLowerCase().includes('premium')) {
            complexity = 'PREMIUM';
          } else if (template.category.toLowerCase().includes('complex')) {
            complexity = 'COMPLEX';
          } else if (template.category.toLowerCase().includes('medium')) {
            complexity = 'MEDIUM';
          }

          // Crear la variante de diseño
          const designVariant = await db.productDesignVariant.create({
            data: {
              productId: product.id,
              templateId: template.id,
              name: variantName,
              slug,
              sku,
              description: `Diseño basado en la plantilla ${template.name}. ${template.description || ''}`.trim(),
              shortDescription: `${template.name} aplicado a ${product.name}`,
              images: JSON.stringify(template.thumbnailUrl ? [template.thumbnailUrl] : []),
              thumbnailUrl: template.thumbnailUrl,
              basePrice: product.basePrice,
              designSurcharge,
              designData: template.templateData,
              designComplexity: complexity,
              metaTitle: `${variantName} | Diseño Personalizado`,
              metaDescription: `${variantName} - Diseño único y personalizado. Calidad premium con entrega rápida.`,
              marketingTags: [template.category, 'personalizado', 'diseño único'],
              allowCustomization: template.allowTextEdit || template.allowColorEdit || template.allowImageEdit,
              customizationPrice: template.allowTextEdit || template.allowColorEdit || template.allowImageEdit ? 5.0 : null,
              featured: template.usageCount > 10, // Destacar si la plantilla es muy popular
              isActive: true,
              isPublic: true,
              publishedAt: new Date(),
              sortOrder: template.usageCount, // Ordenar por popularidad de la plantilla
              categories: {
                create: product.categories.map((productCategory, index) => ({
                  categoryId: productCategory.categoryId,
                  isPrimary: index === 0
                }))
              }
            }
          });

          console.log(`   ✅ Creada variante: ${designVariant.name} (€${designVariant.basePrice + designVariant.designSurcharge})`);
          createdVariants++;

        } catch (error) {
          console.error(`   ❌ Error creando variante para ${template.name}:`, error.message);
        }
      }

      // Marcar el producto como que tiene variantes de diseño
      await db.product.update({
        where: { id: product.id },
        data: { hasDesignVariants: true }
      });

      console.log(`   🏷️  Producto marcado con hasDesignVariants: true`);
    }

    // 4. Crear algunas variantes destacadas adicionales
    console.log('\n🌟 Creando variantes destacadas adicionales...');

    const featuredProducts = await db.product.findMany({
      where: {
        OR: [
          { featured: true },
          { topSelling: true }
        ],
        isPersonalizable: true
      },
      take: 5
    });

    for (const product of featuredProducts) {
      // Crear una variante "best seller" sin plantilla específica
      try {
        const variantName = `${product.name} - Bestseller`;
        
        let slug = variantName.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
        
        // Verificar que el slug sea único
        const existingVariant = await db.productDesignVariant.findUnique({
          where: { slug }
        });

        if (!existingVariant) {
          const sku = `${product.sku || product.slug.toUpperCase()}-BEST`;
          
          const designVariant = await db.productDesignVariant.create({
            data: {
              productId: product.id,
              name: variantName,
              slug,
              sku,
              description: `Nuestro diseño más popular para ${product.name}. Probado y adorado por miles de clientes.`,
              shortDescription: 'Diseño bestseller con calidad garantizada',
              images: JSON.stringify(JSON.parse(product.images || '[]')),
              thumbnailUrl: JSON.parse(product.images || '[]')[0] || null,
              basePrice: product.basePrice,
              designSurcharge: product.basePrice * 0.15, // 15% de sobreprecio
              designData: {
                type: 'bestseller',
                elements: [],
                metadata: {
                  created: new Date().toISOString(),
                  source: 'migration'
                }
              },
              designComplexity: 'MEDIUM',
              metaTitle: `${variantName} | El Más Vendido`,
              metaDescription: `${variantName} - El diseño más popular entre nuestros clientes. Calidad premium garantizada.`,
              marketingTags: ['bestseller', 'más vendido', 'popular', 'recomendado'],
              allowCustomization: true,
              customizationPrice: 7.5,
              featured: true,
              isActive: true,
              isPublic: true,
              publishedAt: new Date(),
              sortOrder: 1 // Prioridad alta
            }
          });

          console.log(`   🏆 Creada variante bestseller: ${designVariant.name}`);
          createdVariants++;
        }
      } catch (error) {
        console.error(`   ❌ Error creando variante bestseller para ${product.name}:`, error.message);
      }
    }

    // 5. Estadísticas finales
    console.log('\n📊 Estadísticas de migración:');
    console.log(`   ✅ Variantes de diseño creadas: ${createdVariants}`);
    
    const totalVariants = await db.productDesignVariant.count();
    console.log(`   📦 Total de variantes en el sistema: ${totalVariants}`);
    
    const productsWithVariants = await db.product.count({
      where: { hasDesignVariants: true }
    });
    console.log(`   🏷️  Productos con variantes: ${productsWithVariants}`);

    // 6. Actualizar contadores de uso de plantillas
    console.log('\n🔄 Actualizando contadores de plantillas...');
    
    for (const template of popularTemplates) {
      const variantCount = await db.productDesignVariant.count({
        where: { templateId: template.id }
      });
      
      await db.zakekeTemplate.update({
        where: { id: template.id },
        data: { usageCount: template.usageCount + variantCount }
      });
    }

    console.log('✅ Migración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Función para crear datos de ejemplo si no hay plantillas
async function createSampleData() {
  console.log('📝 Creando datos de ejemplo...');

  // Crear algunas plantillas de ejemplo si no existen
  const templateCount = await db.zakekeTemplate.count();
  
  if (templateCount === 0) {
    console.log('🎨 Creando plantillas de ejemplo...');
    
    const sampleTemplates = [
      {
        name: 'Tigre Feroz',
        description: 'Diseño de tigre con estilo moderno y agresivo',
        category: 'Animals',
        subcategory: 'Wildlife',
        thumbnailUrl: '/images/templates/tiger-fierce.jpg',
        productTypes: ['camiseta', 'hoodie', 'tank top'],
        templateData: {
          elements: [
            {
              type: 'image',
              src: '/images/designs/tiger-fierce.png',
              x: 0.5,
              y: 0.4,
              width: 0.6,
              height: 0.6
            }
          ],
          metadata: {
            created: new Date().toISOString(),
            complexity: 'medium'
          }
        },
        usageCount: 15,
        rating: 4.8
      },
      {
        name: 'Paisaje Montaña',
        description: 'Hermoso paisaje montañoso minimalista',
        category: 'Nature',
        subcategory: 'Landscapes',
        thumbnailUrl: '/images/templates/mountain-landscape.jpg',
        productTypes: ['camiseta', 'hoodie'],
        templateData: {
          elements: [
            {
              type: 'image',
              src: '/images/designs/mountain-landscape.png',
              x: 0.5,
              y: 0.3,
              width: 0.8,
              height: 0.5
            }
          ],
          metadata: {
            created: new Date().toISOString(),
            complexity: 'simple'
          }
        },
        usageCount: 22,
        rating: 4.9
      },
      {
        name: 'Motivacional Pro',
        description: 'Texto motivacional con tipografía moderna',
        category: 'Typography',
        subcategory: 'Motivational',
        thumbnailUrl: '/images/templates/motivational-pro.jpg',
        productTypes: ['camiseta', 'hoodie', 'tank top', 'sudadera'],
        templateData: {
          elements: [
            {
              type: 'text',
              content: 'NEVER GIVE UP',
              x: 0.5,
              y: 0.4,
              fontSize: 24,
              fontFamily: 'Arial Black',
              color: '#000000'
            }
          ],
          metadata: {
            created: new Date().toISOString(),
            complexity: 'simple'
          }
        },
        usageCount: 31,
        rating: 4.7,
        allowTextEdit: true,
        allowColorEdit: true
      }
    ];

    for (const templateData of sampleTemplates) {
      await db.zakekeTemplate.create({
        data: {
          ...templateData,
          isPremium: false,
          isActive: true,
          isPublic: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    console.log(`✅ Creadas ${sampleTemplates.length} plantillas de ejemplo`);
  }
}

// Ejecutar migración
if (require.main === module) {
  createSampleData()
    .then(() => migrateToDesignVariants())
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { migrateToDesignVariants, createSampleData };