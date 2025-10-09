const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful:', result)

    // Count products
    const productsCount = await prisma.product.count()
    console.log(`📦 Products in database: ${productsCount}`)

    // Count categories
    const categoriesCount = await prisma.category.count()
    console.log(`📂 Categories in database: ${categoriesCount}`)

    // Count users
    const usersCount = await prisma.user.count()
    console.log(`👥 Users in database: ${usersCount}`)

    if (productsCount > 0) {
      const sampleProducts = await prisma.product.findMany({
        take: 3,
        select: {
          id: true,
          name: true,
          basePrice: true,
          createdAt: true
        }
      })
      console.log('📋 Sample products:', sampleProducts)
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()