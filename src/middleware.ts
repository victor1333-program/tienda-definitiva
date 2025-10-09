import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from 'jose'
import { 
  generalApiLimiter, 
  authLimiter, 
  createLimiter, 
  uploadLimiter, 
  adminLimiter,
  withRateLimit 
} from './lib/rate-limiter'

// Rutas que requieren autenticación de admin
const ADMIN_ROUTES = ['/admin']
const ADMIN_API_ROUTES = ['/api/admin', '/api/orders', '/api/products', '/api/customers']

// Función para verificar token JWT
async function verifySessionToken(token: string) {
  try {
    console.log('🔍 Verificando token JWT...')
    
    if (!process.env.NEXTAUTH_SECRET) {
      console.log('❌ NEXTAUTH_SECRET no configurado')
      throw new Error('NEXTAUTH_SECRET not configured')
    }

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
    console.log('🔑 Secret cargado correctamente')
    
    const { payload } = await jwtVerify(token, secret)
    console.log('✅ Token JWT válido:', { sub: payload.sub, role: payload.role })
    
    return {
      isValid: true,
      user: {
        id: payload.sub as string,
        role: payload.role as string,
        email: payload.email as string
      }
    }
  } catch (error) {
    console.log('❌ Error verificando JWT:', error instanceof Error ? error.message : error)
    return { isValid: false, user: null }
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log(`🔄 Middleware ejecutándose para: ${pathname}`)
  
  // Aplicar rate limiting basado en la ruta
  let rateLimitResponse: Response | null = null
  
  if (pathname.startsWith('/api/auth')) {
    // Deshabilitar rate limiting en desarrollo para auth
    if (process.env.NODE_ENV !== 'development') {
      rateLimitResponse = await withRateLimit(request, authLimiter)
    }
  } else if (pathname.startsWith('/api/upload')) {
    // Deshabilitar rate limiting en desarrollo para upload
    if (process.env.NODE_ENV !== 'development') {
      rateLimitResponse = await withRateLimit(request, uploadLimiter)
    }
  } else if (pathname.startsWith('/api/admin') || 
             pathname.startsWith('/api/products') || 
             pathname.startsWith('/api/categories') ||
             pathname.startsWith('/api/orders') ||
             pathname.startsWith('/api/customers')) {
    // Usar límites más permisivos para admin dashboard
    rateLimitResponse = await withRateLimit(request, adminLimiter)
  } else if (pathname.startsWith('/api/') && request.method === 'POST') {
    // Endpoints de creación
    if (pathname.includes('/create') || pathname.endsWith('/route') && request.method === 'POST') {
      rateLimitResponse = await withRateLimit(request, createLimiter)
    } else {
      rateLimitResponse = await withRateLimit(request, generalApiLimiter)
    }
  } else if (pathname.startsWith('/api/')) {
    rateLimitResponse = await withRateLimit(request, generalApiLimiter)
  }
  
  // Si rate limiting bloquea la solicitud, devolver respuesta de error
  if (rateLimitResponse) {
    return rateLimitResponse
  }
  
  // Verificar si necesita autenticación de admin
  const needsAdminAuth = ADMIN_ROUTES.some(route => pathname.startsWith(route)) ||
                        ADMIN_API_ROUTES.some(route => pathname.startsWith(route))

  // TEMPORAL: Deshabilitar verificación admin en desarrollo para debug
  if (needsAdminAuth && process.env.NODE_ENV === 'development') {
    console.log(`⚠️ DESARROLLO: Permitiendo acceso a ${pathname} sin verificación completa`)
    return NextResponse.next()
  }

  if (needsAdminAuth) {
    console.log(`🔍 Middleware: Verificando acceso admin para ${pathname}`)
    
    // Obtener token de session
    const sessionToken = request.cookies.get('next-auth.session-token')?.value || 
                        request.cookies.get('__Secure-next-auth.session-token')?.value

    console.log(`🍪 Token encontrado: ${!!sessionToken}`)

    if (!sessionToken) {
      console.log(`❌ Sin token de sesión, redirigiendo a login desde ${pathname}`)
      // Si es API, devolver 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'No autorizado', code: 'NO_SESSION' }, 
          { status: 401 }
        )
      }
      // Si es página, redirigir a login
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    // Verificar y decodificar token
    const verification = await verifySessionToken(sessionToken)
    
    console.log(`🔐 Verificación del token: ${verification.isValid}`)
    console.log(`👤 Usuario encontrado: ${!!verification.user}`)
    
    if (!verification.isValid || !verification.user) {
      console.log(`❌ Token inválido, redirigiendo a login desde ${pathname}`)
      // Token inválido - limpiar cookies y redirigir
      const response = pathname.startsWith('/api/') 
        ? NextResponse.json({ error: 'Token inválido', code: 'INVALID_TOKEN' }, { status: 401 })
        : NextResponse.redirect(new URL("/auth/signin", request.url))
      
      // Limpiar cookies de sesión inválida
      response.cookies.delete('next-auth.session-token')
      response.cookies.delete('__Secure-next-auth.session-token')
      return response
    }

    // Verificar que el usuario tenga rol de admin
    const userRole = verification.user.role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return pathname.startsWith('/api/') 
        ? NextResponse.json({ error: 'Acceso denegado', code: 'INSUFFICIENT_PERMISSIONS' }, { status: 403 })
        : NextResponse.redirect(new URL("/", request.url))
    }

    // Agregar headers con info del usuario para rutas API
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.next()
      response.headers.set('x-user-id', verification.user.id)
      response.headers.set('x-user-role', verification.user.role)
      response.headers.set('x-user-email', verification.user.email)
      return response
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/orders/:path*',
    '/api/products/:path*',
    '/api/customers/:path*',
    '/api/auth/:path*',
    '/api/upload/:path*',
    '/api/:path*'
  ]
}