import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "../auth"
// Rate limiting imports comentados - DESHABILITADO
// import {
//   generalApiLimiter,
//   authLimiter,
//   createLimiter,
//   uploadLimiter,
//   adminLimiter,
//   withRateLimit
// } from './lib/rate-limiter'

// Rutas que requieren autenticación de admin
const ADMIN_ROUTES = ['/admin']
const ADMIN_API_ROUTES = ['/api/admin', '/api/orders', '/api/products', '/api/customers']

// Rutas públicas que NO requieren autenticación
const PUBLIC_API_ROUTES = [
  '/api/products/public',
  '/api/categories/public',
  '/api/auth',
  '/api/contact'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log(`🔄 Middleware ejecutándose para: ${pathname}`)

  // RATE LIMITING COMPLETAMENTE DESHABILITADO
  // Para evitar problemas con autenticación y trabajo normal del admin
  // TODO: Implementar rate limiting solo para rutas públicas específicas si es necesario
  console.log(`🔓 Rate limiting DESHABILITADO GLOBALMENTE`)

  // Verificar si es una ruta pública (no requiere autenticación)
  const isPublicRoute = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))

  if (isPublicRoute) {
    console.log(`🌐 Ruta pública: ${pathname} - permitiendo acceso sin autenticación`)
    return NextResponse.next()
  }

  // Verificar si necesita autenticación de admin
  const needsAdminAuth = ADMIN_ROUTES.some(route => pathname.startsWith(route)) ||
                        ADMIN_API_ROUTES.some(route => pathname.startsWith(route))

  if (needsAdminAuth) {
    console.log(`🔍 Middleware: Verificando acceso admin para ${pathname}`)

    // Usar auth() de NextAuth para obtener la sesión
    const session = await auth()

    console.log(`🍪 Sesión encontrada: ${!!session}`)
    console.log(`👤 Usuario en sesión: ${session?.user?.email || 'ninguno'}`)

    if (!session || !session.user) {
      console.log(`❌ Sin sesión válida, redirigiendo a login desde ${pathname}`)
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

    // Verificar que el usuario tenga rol de admin
    const userRole = session.user.role
    console.log(`👔 Rol del usuario: ${userRole}`)

    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      console.log(`❌ Acceso denegado - rol insuficiente: ${userRole}`)
      return pathname.startsWith('/api/')
        ? NextResponse.json({ error: 'Acceso denegado', code: 'INSUFFICIENT_PERMISSIONS' }, { status: 403 })
        : NextResponse.redirect(new URL("/", request.url))
    }

    console.log(`✅ Acceso permitido para admin: ${session.user.email}`)

    // Agregar headers con info del usuario para rutas API
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.next()
      response.headers.set('x-user-id', session.user.id!)
      response.headers.set('x-user-role', session.user.role!)
      response.headers.set('x-user-email', session.user.email!)
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