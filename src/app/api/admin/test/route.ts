import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing admin access...')
    
    const session = await auth()
    console.log('📋 Session data:', session)

    if (!session?.user) {
      console.log('❌ No session found')
      return NextResponse.json({ 
        error: 'No autorizado - Sin sesión',
        code: 'NO_SESSION'
      }, { status: 401 })
    }

    const userRole = (session.user as any).role
    console.log(`👤 User role: ${userRole}`)

    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      console.log('❌ Insufficient permissions')
      return NextResponse.json({ 
        error: 'Acceso denegado - Permisos insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS',
        userRole 
      }, { status: 403 })
    }

    console.log('✅ Admin access granted')
    return NextResponse.json({
      success: true,
      message: 'Acceso administrativo confirmado',
      user: {
        id: (session.user as any).id,
        email: session.user.email,
        name: session.user.name,
        role: userRole
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error in admin test:', error)
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}