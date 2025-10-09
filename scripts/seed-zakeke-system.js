const { db } = require('../src/lib/db');
async function seedZakekeSystem() {
  console.log('🚀 Iniciando seed del sistema Zakeke...')

  try {
    // 1. Crear producto de prueba personalizable
    console.log('📦 Creando producto de prueba...')
    
    const product = await db.product.upsert({
      where: { slug: 'camiseta-personalizable-test' },
      update: {},
      create: {
        name: 'Camiseta Personalizable Test',
        slug: 'camiseta-personalizable-test',
        description: 'Camiseta básica perfecta para personalización con tu diseño único',
        basePrice: 19.99,
        comparePrice: 24.99,
        costPrice: 8.00,
        images: JSON.stringify([
          '/placeholder-product.png'
        ]),
        isActive: true,
        featured: true,
        stock: 100,
        directStock: 100,
        isPersonalizable: true,
        personalizationSettings: JSON.stringify({
          allowMultipleSides: true,
          requiresPrintAreas: true,
          defaultPrintingMethod: 'DTG',
          maxColors: 8,
          baseCustomizationPrice: 5.00
        })
      }
    })

    console.log(`✅ Producto creado: ${product.name} (ID: ${product.id})`)

    // 2. Crear lados del producto
    console.log('📐 Creando lados del producto...')
    
    // Primero eliminar lados existentes del producto
    await db.productSide.deleteMany({
      where: { productId: product.id }
    })

    const sides = await Promise.all([
      db.productSide.create({
        data: {
          productId: product.id,
          name: 'Frontal',
          displayName: 'Parte Frontal',
          position: 0,
          image2D: '/placeholder-product.png',
          isActive: true
        }
      }),
      db.productSide.create({
        data: {
          productId: product.id,
          name: 'Trasero',
          displayName: 'Parte Trasera',
          position: 1,
          image2D: '/placeholder-product.png',
          isActive: true
        }
      })
    ])

    console.log(`✅ Lados creados: ${sides.length}`)

    // 3. Crear áreas de impresión
    console.log('🎯 Creando áreas de impresión...')
    
    const printAreas = []
    
    // Áreas para lado frontal
    const frontalAreas = await Promise.all([
      db.printArea.create({
        data: {
          sideId: sides[0].id,
          name: 'Logo Pecho',
          displayName: 'Logo en el Pecho',
          description: 'Área pequeña perfecta para logos',
          x: 350,
          y: 150,
          width: 100,
          height: 100,
          rotation: 0,
          printingMethod: 'DTG',
          maxPrintWidth: 8.0, // cm
          maxPrintHeight: 8.0, // cm
          resolution: 300,
          maxColors: 4,
          extraCostPerColor: 2.00,
          basePrice: 3.00,
          allowText: true,
          allowImages: true,
          allowShapes: true,
          allowClipart: true,
          sortOrder: 0,
          isActive: true
        }
      }),
      db.printArea.create({
        data: {
          sideId: sides[0].id,
          name: 'Diseño Central',
          displayName: 'Diseño Central Frontal',
          description: 'Área grande para diseños principales',
          x: 250,
          y: 200,
          width: 300,
          height: 300,
          rotation: 0,
          printingMethod: 'DTG',
          maxPrintWidth: 25.0, // cm
          maxPrintHeight: 25.0, // cm
          resolution: 300,
          maxColors: 8,
          extraCostPerColor: 1.50,
          basePrice: 8.00,
          allowText: true,
          allowImages: true,
          allowShapes: true,
          allowClipart: true,
          sortOrder: 1,
          isActive: true
        }
      })
    ])

    // Áreas para lado trasero
    const traseroAreas = await Promise.all([
      db.printArea.create({
        data: {
          sideId: sides[1].id,
          name: 'Diseño Trasero',
          displayName: 'Diseño Trasero Principal',
          description: 'Área principal en la espalda',
          x: 200,
          y: 150,
          width: 400,
          height: 400,
          rotation: 0,
          printingMethod: 'DTG',
          maxPrintWidth: 30.0, // cm
          maxPrintHeight: 30.0, // cm
          resolution: 300,
          maxColors: 8,
          extraCostPerColor: 1.50,
          basePrice: 10.00,
          allowText: true,
          allowImages: true,
          allowShapes: true,
          allowClipart: true,
          sortOrder: 0,
          isActive: true
        }
      }),
      db.printArea.create({
        data: {
          sideId: sides[1].id,
          name: 'Cuello Trasero',
          displayName: 'Área del Cuello',
          description: 'Pequeña área en el cuello trasero',
          x: 350,
          y: 50,
          width: 100,
          height: 50,
          rotation: 0,
          printingMethod: 'VINYL',
          maxPrintWidth: 8.0, // cm
          maxPrintHeight: 3.0, // cm
          resolution: 300,
          maxColors: 2,
          extraCostPerColor: 3.00,
          basePrice: 4.00,
          allowText: true,
          allowImages: false,
          allowShapes: true,
          allowClipart: false,
          sortOrder: 1,
          isActive: true
        }
      })
    ])

    printAreas.push(...frontalAreas, ...traseroAreas)
    console.log(`✅ Áreas de impresión creadas: ${printAreas.length}`)

    // 4. Crear assets predefinidos (colores, fuentes)
    console.log('🎨 Creando assets del sistema...')
    
    // Limpiar colores existentes
    await db.zakekePresetColor.deleteMany({})

    const presetColors = await Promise.all([
      db.zakekePresetColor.create({
        data: {
          name: 'Negro',
          hexValue: '#000000',
          category: 'básicos',
          sortOrder: 0,
          isActive: true
        }
      }),
      db.zakekePresetColor.create({
        data: {
          name: 'Blanco',
          hexValue: '#ffffff',
          category: 'básicos',
          sortOrder: 1,
          isActive: true
        }
      }),
      db.zakekePresetColor.create({
        data: {
          name: 'Naranja Vibrante',
          hexValue: '#ff6b35',
          category: 'vibrantes',
          sortOrder: 0,
          isActive: true
        }
      }),
      db.zakekePresetColor.create({
        data: {
          name: 'Azul Corporativo',
          hexValue: '#4a90e2',
          category: 'corporativos',
          sortOrder: 0,
          isActive: true
        }
      })
    ])

    // Limpiar fuentes existentes
    await db.zakekeFont.deleteMany({})

    const fonts = await Promise.all([
      db.zakekeFont.create({
        data: {
          name: 'Arial',
          fontFamily: 'Arial, sans-serif',
          category: 'sans-serif',
          hasVariants: true,
          variants: ['normal', 'bold', 'italic'],
          previewText: 'Abc',
          isPremium: false,
          isActive: true,
          sortOrder: 0
        }
      }),
      db.zakekeFont.create({
        data: {
          name: 'Times New Roman',
          fontFamily: '"Times New Roman", serif',
          category: 'serif',
          hasVariants: true,
          variants: ['normal', 'bold', 'italic'],
          previewText: 'Abc',
          isPremium: false,
          isActive: true,
          sortOrder: 1
        }
      }),
      db.zakekeFont.create({
        data: {
          name: 'Impact',
          fontFamily: 'Impact, sans-serif',
          category: 'display',
          hasVariants: false,
          variants: ['normal'],
          previewText: 'Abc',
          isPremium: true,
          isActive: true,
          sortOrder: 0
        }
      })
    ])

    console.log(`✅ Colores predefinidos: ${presetColors.length}`)
    console.log(`✅ Fuentes: ${fonts.length}`)

    // 5. Crear templates de ejemplo
    console.log('📋 Creando templates de ejemplo...')
    
    const sampleTemplates = await Promise.all([
      db.zakekeTemplate.create({
        data: {
          name: 'Logo Empresarial Simple',
          description: 'Template básico para logos de empresa',
          category: 'empresarial',
          subcategory: 'logos',
          thumbnailUrl: 'https://via.placeholder.com/200x200/4a90e2/ffffff?text=Logo',
          previewUrl: 'https://via.placeholder.com/400x400/4a90e2/ffffff?text=Preview',
          productTypes: ['camiseta', 'polo', 'sudadera'],
          templateData: {
            elements: [
              {
                type: 'text',
                content: 'TU EMPRESA',
                x: 50,
                y: 50,
                fontSize: 24,
                fontFamily: 'Arial',
                color: '#4a90e2'
              }
            ]
          },
          allowTextEdit: true,
          allowColorEdit: true,
          allowImageEdit: false,
          editableAreas: ['text-1'],
          isPremium: false,
          isActive: true,
          isPublic: true,
          usageCount: 0
        }
      }),
      db.zakekeTemplate.create({
        data: {
          name: 'Diseño Deportivo',
          description: 'Template para equipos deportivos',
          category: 'deportes',
          subcategory: 'equipos',
          thumbnailUrl: 'https://via.placeholder.com/200x200/ff6b35/ffffff?text=Sport',
          previewUrl: 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Preview',
          productTypes: ['camiseta', 'tank-top'],
          templateData: {
            elements: [
              {
                type: 'text',
                content: 'EQUIPO',
                x: 100,
                y: 80,
                fontSize: 32,
                fontFamily: 'Impact',
                color: '#ff6b35'
              },
              {
                type: 'text',
                content: '2024',
                x: 100,
                y: 120,
                fontSize: 18,
                fontFamily: 'Arial',
                color: '#000000'
              }
            ]
          },
          allowTextEdit: true,
          allowColorEdit: true,
          allowImageEdit: true,
          editableAreas: ['text-1', 'text-2'],
          isPremium: true,
          isActive: true,
          isPublic: true,
          usageCount: 0
        }
      })
    ])

    console.log(`✅ Templates creados: ${sampleTemplates.length}`)

    // 6. Crear categoría si no existe
    console.log('📂 Verificando categorías...')
    
    const category = await db.category.upsert({
      where: { slug: 'personalizables' },
      update: {},
      create: {
        name: 'Productos Personalizables',
        slug: 'personalizables',
        description: 'Productos que puedes personalizar con tu propio diseño',
        isActive: true,
        sortOrder: 0,
        categoryType: 'REGULAR'
      }
    })

    // Asociar producto con categoría
    await db.productCategory.upsert({
      where: {
        productId_categoryId: {
          productId: product.id,
          categoryId: category.id
        }
      },
      update: {},
      create: {
        productId: product.id,
        categoryId: category.id,
        isPrimary: true
      }
    })

    console.log('✅ Categoría asignada al producto')

    // 7. Crear diseño de prueba
    console.log('🎨 Creando diseño de prueba...')
    
    const testDesign = await db.customerDesign.create({
      data: {
        productId: product.id,
        customerId: null, // Diseño de invitado
        status: 'DRAFT',
        name: 'Mi Primer Diseño',
        selectedVariant: null,
        quantity: 1,
        designData: {
          version: '1.0',
          sides: {
            [sides[0].id]: {
              elements: [
                {
                  id: 'text-1',
                  type: 'text',
                  content: 'MI DISEÑO',
                  x: 350,
                  y: 200,
                  fontSize: 24,
                  fontFamily: 'Arial',
                  color: '#ff6b35'
                }
              ]
            }
          }
        },
        basePrice: product.basePrice,
        customPrice: 5.00,
        totalPrice: product.basePrice + 5.00,
        previewImages: []
      }
    })

    console.log('✅ Diseño de prueba creado')

    // Resumen final
    console.log('\n🎉 ¡Seed del sistema Zakeke completado!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📦 Producto: ${product.name}`)
    console.log(`📐 Lados: ${sides.length}`)
    console.log(`🎯 Áreas de impresión: ${printAreas.length}`)
    console.log(`🎨 Colores predefinidos: ${presetColors.length}`)
    console.log(`🔤 Fuentes: ${fonts.length}`)
    console.log(`📋 Templates: ${sampleTemplates.length}`)
    console.log(`🎨 Diseños de prueba: 1`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n📋 URLs para probar:')
    console.log(`👉 Admin - Productos: /admin/personalizacion/productos`)
    console.log(`👉 Admin - Editor: /admin/personalizacion/editor`)
    console.log(`👉 Cliente - Personalizar: /personalizar/${product.id}`)
    console.log(`👉 Producto normal: /productos/${product.id}`)

  } catch (error) {
    console.error('❌ Error durante el seed:', error)
    throw error
  } finally {
    await db.$disconnect()
  }
}

seedZakekeSystem()
  .catch((error) => {
    console.error('Error fatal:', error)
    process.exit(1)
  })