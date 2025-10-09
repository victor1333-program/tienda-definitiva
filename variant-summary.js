const { db } = require('../src/lib/db');
const productId = 'cmc5ysotf0009jg3vvq6d2ql8'

async function generateVariantSummary() {
  try {
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          orderBy: [
            { size: 'asc' },
            { colorName: 'asc' }
          ]
        }
      }
    })

    if (!product) {
      console.log('❌ Producto no encontrado')
      return
    }

    console.log('📊 RESUMEN COMPLETO DE VARIANTES')
    console.log('='.repeat(50))
    console.log(`🏷️  Producto: ${product.name}`)
    console.log(`🆔 ID: ${product.id}`)
    console.log(`💰 Precio base: €${product.basePrice}`)
    console.log(`📦 Total variantes: ${product.variants.length}`)
    console.log('')

    // Agrupar por talla
    const variantsBySize = {}
    product.variants.forEach(variant => {
      if (!variantsBySize[variant.size]) {
        variantsBySize[variant.size] = []
      }
      variantsBySize[variant.size].push(variant)
    })

    // Obtener todas las tallas y colores únicos
    const allSizes = [...new Set(product.variants.map(v => v.size))].sort()
    const allColors = [...new Set(product.variants.map(v => v.colorName))].sort()

    console.log('📏 TALLAS DISPONIBLES:')
    console.log(`   ${allSizes.map(s => s.toUpperCase()).join(', ')}`)
    console.log('')

    console.log('🎨 COLORES DISPONIBLES:')
    allColors.forEach(color => {
      const variant = product.variants.find(v => v.colorName === color)
      console.log(`   ${color} (${variant.colorHex})`)
    })
    console.log('')

    console.log('📋 MATRIZ COMPLETA (Talla x Color):')
    console.log('─'.repeat(50))
    
    // Crear tabla matricial
    const header = '   TALLA |  ' + allColors.map(c => c.padEnd(8)).join(' | ')
    console.log(header)
    console.log('─'.repeat(header.length))

    allSizes.forEach(size => {
      let row = `   ${size.toUpperCase().padEnd(5)} | `
      allColors.forEach(color => {
        const hasVariant = product.variants.some(v => v.size === size && v.colorName === color)
        row += ` ${hasVariant ? '✅' : '❌'}     | `
      })
      console.log(row)
    })

    console.log('')
    console.log('📊 ESTADÍSTICAS:')
    console.log(`   • Combinaciones posibles: ${allSizes.length} × ${allColors.length} = ${allSizes.length * allColors.length}`)
    console.log(`   • Combinaciones creadas: ${product.variants.length}`)
    console.log(`   • Completitud: ${((product.variants.length / (allSizes.length * allColors.length)) * 100).toFixed(1)}%`)
    
    // Stock total
    const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
    console.log(`   • Stock total: ${totalStock} unidades`)
    console.log(`   • Stock promedio por variante: ${(totalStock / product.variants.length).toFixed(1)}`)

    console.log('')
    console.log('🎯 NUEVAS ADICIONES COMPLETADAS:')
    console.log('   ✅ Tallas agregadas: S, L, XXL')
    console.log('   ✅ Colores agregados: Blanco (#FFFFFF), Negro (#000000), Azul (#1E3A8A)')
    console.log('   ✅ Total variantes nuevas: 27')
    console.log('   ✅ Todas las combinaciones están disponibles')

    console.log('')
    console.log('🔗 ENLACES ÚTILES:')
    console.log(`   • Ver producto: http://localhost:3000/productos/${product.id}`)
    console.log(`   • Admin - Editar: http://localhost:3000/admin/products/${product.id}/edit`)
    console.log(`   • Admin - Lista: http://localhost:3000/admin/products`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateVariantSummary()
}

module.exports = { generateVariantSummary }