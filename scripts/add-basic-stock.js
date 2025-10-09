const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addBasicStock() {
  console.log('📦 CONFIGURANDO STOCK BÁSICO PARA TESTING')
  console.log('=' .repeat(50))
  
  try {
    // Obtener productos principales para añadir stock
    const products = await prisma.product.findMany({
      include: {
        variants: true
      },
      where: {
        isActive: true
      }
    })
    
    console.log(`🔍 Encontrados ${products.length} productos`)
    
    let totalVariantsUpdated = 0
    
    for (const product of products) {
      console.log(`\n📦 Configurando stock para: ${product.name}`)
      
      if (product.variants.length === 0) {
        console.log('   ⚠️  Sin variantes - saltando')
        continue
      }
      
      // Configurar stock básico según el tipo de producto
      let baseStock = 10 // Stock por defecto
      
      if (product.name.toLowerCase().includes('camiseta')) {
        baseStock = 25
      } else if (product.name.toLowerCase().includes('taza')) {
        baseStock = 15
      } else if (product.name.toLowerCase().includes('láser')) {
        baseStock = 5
      }
      
      // Actualizar stock de todas las variantes
      for (const variant of product.variants) {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { stock: baseStock }
        })
        
        console.log(`   ✅ ${variant.sku}: ${baseStock} unidades`)
        totalVariantsUpdated++
      }
    }
    
    console.log('\n📊 RESUMEN DEL STOCK CONFIGURADO:')
    
    const stockSummary = await prisma.productVariant.findMany({
      where: {
        stock: { gt: 0 }
      },
      include: {
        product: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        stock: 'desc'
      }
    })
    
    const stockByProduct = stockSummary.reduce((acc, variant) => {
      const productName = variant.product.name
      if (!acc[productName]) {
        acc[productName] = 0
      }
      acc[productName] += variant.stock
      return acc
    }, {})
    
    console.log('\n🏷️  Stock por producto:')
    Object.entries(stockByProduct).forEach(([productName, totalStock]) => {
      console.log(`   ${productName}: ${totalStock} unidades totales`)
    })
    
    console.log(`\n✅ Stock configurado en ${totalVariantsUpdated} variantes`)
    console.log(`📦 Total de unidades en stock: ${stockSummary.reduce((sum, v) => sum + v.stock, 0)}`)
    
    console.log('\n🎉 ¡STOCK BÁSICO CONFIGURADO!')
    console.log('La tienda está lista para recibir pedidos de prueba.')
    
  } catch (error) {
    console.error('❌ Error configurando stock:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

addBasicStock()