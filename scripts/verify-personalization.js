const { db } = require('../src/lib/db');
async function verifyPersonalization() {
  try {
    console.log('🔍 Verificando personalización en la base de datos...')

    // Verificar producto con personalización
    const productWithPersonalization = await db.product.findFirst({
      where: {
        name: 'Camiseta Básica DTF'
      },
      include: {
        personalization: {
          include: {
            category: true,
            mockups: {
              include: {
                variant: true,
                areas: true
              }
            }
          }
        },
        variants: true
      }
    })

    if (!productWithPersonalization) {
      console.log('❌ No se encontró el producto')
      return
    }

    console.log('✅ Producto encontrado:', productWithPersonalization.name)
    console.log('📝 ID del producto:', productWithPersonalization.id)

    if (productWithPersonalization.personalization) {
      console.log('🎨 ✅ Tiene personalización configurada:')
      console.log('  - ID:', productWithPersonalization.personalization.id)
      console.log('  - Nombre:', productWithPersonalization.personalization.name)
      console.log('  - Permite texto:', productWithPersonalization.personalization.allowText)
      console.log('  - Permite imágenes:', productWithPersonalization.personalization.allowImages)
      console.log('  - Mockups:', productWithPersonalization.personalization.mockups.length)
      
      // Verificar mockups
      productWithPersonalization.personalization.mockups.forEach((mockup, index) => {
        console.log(`  📸 Mockup ${index + 1}:`)
        console.log(`    - Nombre: ${mockup.name}`)
        console.log(`    - Variante: ${mockup.variant.size} - ${mockup.variant.colorName}`)
        console.log(`    - Áreas: ${mockup.areas.length}`)
        
        mockup.areas.forEach((area, areaIndex) => {
          console.log(`      🎯 Área ${areaIndex + 1}: ${area.name} (${area.x}, ${area.y}) - ${area.width}x${area.height}`)
          if (area.extraCost > 0) {
            console.log(`        💰 Coste extra: €${area.extraCost}`)
          }
        })
      })

      console.log('\n🔗 URLs para probar:')
      console.log(`📄 Ficha del producto: /productos/${productWithPersonalization.id}`)
      console.log(`🎨 Editor: /editor/${productWithPersonalization.id}`)
      
    } else {
      console.log('❌ El producto NO tiene personalización configurada')
    }

    // Verificar también qué productos NO tienen personalización
    const productsWithoutPersonalization = await db.product.findMany({
      where: {
        personalization: null,
        isActive: true
      },
      select: {
        id: true,
        name: true
      },
      take: 5
    })

    console.log('\n📋 Productos sin personalización (primeros 5):')
    productsWithoutPersonalization.forEach(product => {
      console.log(`  - ${product.name} (${product.id})`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

verifyPersonalization()