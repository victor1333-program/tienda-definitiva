import { PrismaClient } from '@prisma/client'

// Force new instance for each API request in development to avoid connection issues
let cachedPrisma: PrismaClient | null = null

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
}

// Get Prisma client with fresh connection management
export function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    // In production, use singleton
    if (!cachedPrisma) {
      cachedPrisma = createPrismaClient()
    }
    return cachedPrisma
  } else {
    // In development, always return fresh instance to avoid connection issues
    return createPrismaClient()
  }
}

// Main database instance
export const db = getPrismaClient()

// Connection function that actually works
export async function ensureConnection(): Promise<PrismaClient> {
  const prisma = getPrismaClient()
  
  try {
    // Force connection and test
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection established and verified')
    return prisma
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    
    // Try once more with a fresh client
    const freshPrisma = createPrismaClient()
    try {
      await freshPrisma.$connect()
      await freshPrisma.$queryRaw`SELECT 1`
      console.log('✅ Database reconnected with fresh client')
      return freshPrisma
    } catch (retryError) {
      console.error('❌ Fresh client connection also failed:', retryError)
      throw retryError
    }
  }
}