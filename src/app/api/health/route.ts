import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    await db.$queryRaw`SELECT 1`
    
    // Verificar memoria y estado del proceso
    const memoryUsage = process.memoryUsage()
    const uptime = process.uptime()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'lovilike-api',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      uptime: Math.floor(uptime),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
        external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100
      },
      database: 'connected'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'lovilike-api',
        error: 'Database connection failed'
      },
      { status: 503 }
    )
  }
}