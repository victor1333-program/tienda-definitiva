import { NextRequest, NextResponse } from 'next/server'

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: boolean
  hsts?: boolean
  noSniff?: boolean
  frameOptions?: boolean
  xssProtection?: boolean
  referrerPolicy?: boolean
  permissionsPolicy?: boolean
}

export function securityHeaders(config: SecurityHeadersConfig = {}) {
  const {
    contentSecurityPolicy = true,
    hsts = true,
    noSniff = true,
    frameOptions = true,
    xssProtection = true,
    referrerPolicy = true,
    permissionsPolicy = true
  } = config

  return (response: NextResponse): NextResponse => {
    // Content Security Policy
    if (contentSecurityPolicy) {
      const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "media-src 'self' data: https:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
      ].join('; ')
      
      response.headers.set('Content-Security-Policy', csp)
    }

    // HTTP Strict Transport Security
    if (hsts) {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      )
    }

    // X-Content-Type-Options
    if (noSniff) {
      response.headers.set('X-Content-Type-Options', 'nosniff')
    }

    // X-Frame-Options
    if (frameOptions) {
      response.headers.set('X-Frame-Options', 'DENY')
    }

    // X-XSS-Protection
    if (xssProtection) {
      response.headers.set('X-XSS-Protection', '1; mode=block')
    }

    // Referrer-Policy
    if (referrerPolicy) {
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    }

    // Permissions-Policy
    if (permissionsPolicy) {
      response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=(self)'
      )
    }

    // Seguridad adicional
    response.headers.set('X-Powered-By', '') // Ocultar tecnología
    response.headers.set('Server', '') // Ocultar servidor
    response.headers.set('X-DNS-Prefetch-Control', 'off')
    response.headers.set('X-Download-Options', 'noopen')
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

    return response
  }
}

// Headers específicos para APIs
export function apiSecurityHeaders(response: NextResponse): NextResponse {
  // CORS configurado de forma restrictiva
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  response.headers.set('Access-Control-Max-Age', '86400') // 24 horas

  // Headers de seguridad para APIs
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  return response
}

// Headers específicos para uploads
export function uploadSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Content-Disposition', 'attachment')
  response.headers.set('X-Download-Options', 'noopen')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

  return response
}

// Verificar HTTPS en producción
export function enforceHttps(request: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV === 'production') {
    const proto = request.headers.get('x-forwarded-proto')
    const host = request.headers.get('host')
    
    if (proto !== 'https') {
      return NextResponse.redirect(`https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`, 301)
    }
  }
  
  return null
}

// Detectar bots maliciosos
export function detectMaliciousBots(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || ''
  
  const maliciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /acunetix/i,
    /netsparker/i,
    /appscan/i,
    /burp/i,
    /zap/i,
    /w3af/i,
    /skipfish/i
  ]
  
  return maliciousPatterns.some(pattern => pattern.test(userAgent))
}

// Detectar patrones de ataque en URL
export function detectAttackPatterns(request: NextRequest): boolean {
  const url = request.nextUrl.toString()
  const searchParams = request.nextUrl.searchParams.toString()
  
  const attackPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /eval\(/i,
    /union.*select/i,
    /drop.*table/i,
    /insert.*into/i,
    /delete.*from/i,
    /\.\.\//,
    /\.\.%2f/i,
    /%2e%2e%2f/i,
    /etc\/passwd/i,
    /boot\.ini/i,
    /proc\/self\/environ/i,
    /<\?php/i,
    /<%.*%>/
  ]
  
  return attackPatterns.some(pattern => 
    pattern.test(url) || pattern.test(searchParams)
  )
}

// Wrapper completo de seguridad
export function withSecurity(handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>, config?: SecurityHeadersConfig) {
  return async (request: NextRequest, ...args: unknown[]) => {
    // 1. Verificar HTTPS
    const httpsRedirect = enforceHttps(request)
    if (httpsRedirect) return httpsRedirect

    // 2. Detectar bots maliciosos
    if (detectMaliciousBots(request)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // 3. Detectar patrones de ataque
    if (detectAttackPatterns(request)) {
      return new NextResponse('Bad Request', { status: 400 })
    }

    // 4. Ejecutar handler
    const response = await handler(request, ...args)

    // 5. Agregar headers de seguridad
    return securityHeaders(config)(response)
  }
}