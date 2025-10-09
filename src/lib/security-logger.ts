import { NextRequest } from 'next/server'

export interface SecurityEvent {
  type: 'auth_failure' | 'rate_limit' | 'malicious_request' | 'xss_attempt' | 'sql_injection' | 'file_upload' | 'admin_action'
  severity: 'low' | 'medium' | 'high' | 'critical'
  ip: string
  userAgent: string
  url: string
  method: string
  userId?: string
  details: Record<string, unknown>
  timestamp: Date
}

class SecurityLogger {
  private events: SecurityEvent[] = []
  private maxEvents = 10000

  log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    }

    this.events.push(fullEvent)

    // Mantener solo los últimos eventos
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }

    // Log críticos se muestran en consola inmediatamente
    if (event.severity === 'critical') {
      console.error('🚨 SECURITY ALERT:', fullEvent)
    }

    // En producción, enviar a servicio de monitoreo
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(fullEvent)
    }
  }

  private async sendToMonitoring(event: SecurityEvent): Promise<void> {
    // Aquí se integraría con servicios como:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom webhook
    
    try {
      if (process.env.SECURITY_WEBHOOK_URL) {
        await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        })
      }
    } catch (error) {
      console.error('Failed to send security event to monitoring:', error)
    }
  }

  getEvents(filters?: {
    type?: SecurityEvent['type']
    severity?: SecurityEvent['severity']
    since?: Date
    ip?: string
    userId?: string
  }): SecurityEvent[] {
    let filtered = this.events

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(e => e.type === filters.type)
      }
      if (filters.severity) {
        filtered = filtered.filter(e => e.severity === filters.severity)
      }
      if (filters.since) {
        filtered = filtered.filter(e => e.timestamp >= filters.since!)
      }
      if (filters.ip) {
        filtered = filtered.filter(e => e.ip === filters.ip)
      }
      if (filters.userId) {
        filtered = filtered.filter(e => e.userId === filters.userId)
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  getStats(): {
    total: number
    byType: Record<string, number>
    bySeverity: Record<string, number>
    recentActivity: { hour: string; count: number }[]
  } {
    const byType: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}
    
    this.events.forEach(event => {
      byType[event.type] = (byType[event.type] || 0) + 1
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1
    })

    // Actividad por horas (últimas 24h)
    const now = new Date()
    const recentActivity = []
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
      const hourStr = hour.toISOString().slice(0, 13) + ':00:00.000Z'
      const count = this.events.filter(e => 
        e.timestamp >= hour && 
        e.timestamp < new Date(hour.getTime() + 60 * 60 * 1000)
      ).length
      
      recentActivity.push({ hour: hourStr, count })
    }

    return {
      total: this.events.length,
      byType,
      bySeverity,
      recentActivity
    }
  }

  clear(): void {
    this.events = []
  }
}

export const securityLogger = new SecurityLogger()

// Helpers para logging común
export function logAuthFailure(request: NextRequest, details: Record<string, unknown>) {
  securityLogger.log({
    type: 'auth_failure',
    severity: 'medium',
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    url: request.url,
    method: request.method,
    details
  })
}

export function logRateLimit(request: NextRequest, limit: number, windowMs: number) {
  securityLogger.log({
    type: 'rate_limit',
    severity: 'medium',
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    url: request.url,
    method: request.method,
    details: { limit, windowMs }
  })
}

export function logMaliciousRequest(request: NextRequest, reason: string) {
  securityLogger.log({
    type: 'malicious_request',
    severity: 'high',
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    url: request.url,
    method: request.method,
    details: { reason }
  })
}

export function logXSSAttempt(request: NextRequest, payload: string) {
  securityLogger.log({
    type: 'xss_attempt',
    severity: 'high',
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    url: request.url,
    method: request.method,
    details: { payload: payload.slice(0, 200) } // Limitar tamaño
  })
}

export function logSQLInjection(request: NextRequest, payload: string) {
  securityLogger.log({
    type: 'sql_injection',
    severity: 'critical',
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    url: request.url,
    method: request.method,
    details: { payload: payload.slice(0, 200) }
  })
}

export function logFileUpload(request: NextRequest, fileName: string, fileSize: number, userId?: string) {
  securityLogger.log({
    type: 'file_upload',
    severity: 'low',
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    url: request.url,
    method: request.method,
    userId,
    details: { fileName, fileSize }
  })
}

export function logAdminAction(request: NextRequest, action: string, userId: string, target?: string) {
  securityLogger.log({
    type: 'admin_action',
    severity: 'medium',
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    url: request.url,
    method: request.method,
    userId,
    details: { action, target }
  })
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0].trim() || realIp || 'unknown'
}

// Análisis automático de patrones sospechosos
export function analyzeSecurityPatterns(): {
  suspiciousIPs: string[]
  bruteForceAttempts: { ip: string; count: number }[]
  frequentTargets: { url: string; count: number }[]
} {
  const events = securityLogger.getEvents()
  const ipCounts: Record<string, number> = {}
  const urlCounts: Record<string, number> = {}
  const authFailures: Record<string, number> = {}

  events.forEach(event => {
    ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1
    urlCounts[event.url] = (urlCounts[event.url] || 0) + 1
    
    if (event.type === 'auth_failure') {
      authFailures[event.ip] = (authFailures[event.ip] || 0) + 1
    }
  })

  // IPs sospechosas (>50 eventos en ventana actual)
  const suspiciousIPs = Object.entries(ipCounts)
    .filter(([, count]) => count > 50)
    .map(([ip]) => ip)

  // Intentos de fuerza bruta (>5 fallos auth)
  const bruteForceAttempts = Object.entries(authFailures)
    .filter(([, count]) => count > 5)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)

  // URLs más atacadas
  const frequentTargets = Object.entries(urlCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([url, count]) => ({ url, count }))

  return {
    suspiciousIPs,
    bruteForceAttempts,
    frequentTargets
  }
}