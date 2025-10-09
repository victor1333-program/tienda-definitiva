const { PrismaClient } = require('@prisma/client')

async function deleteProductsDirectly(ids) {
  const prisma = new PrismaClient()
  
  try {
    console.log('🗑️ Eliminando productos:', ids)
    
    // Eliminar directamente
    const result = await prisma.product.deleteMany({
      where: {
        id: { in: ids }
      }
    })
    
    console.log(`✅ Eliminados: ${result.count} productos`)
    return result
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Usar el primer argumento como ID
const productId = process.argv[2]
if (productId) {
  deleteProductsDirectly([productId])
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
} else {
  console.log('Usage: node temp-delete.js <product-id>')
  process.exit(1)
}