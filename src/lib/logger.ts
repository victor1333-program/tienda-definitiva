// Comprehensive logging and monitoring system

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  userId?: string
  sessionId?: string
  requestId?: string
  traceId?: string
  stack?: string
  category?: string
  tags?: string[]
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableRemote: boolean
  remoteEndpoint?: string
  enableLocalStorage: boolean
  maxLocalStorageEntries: number
  enableSentry: boolean
  enableAnalytics: boolean
  categories?: string[]
  sensitiveFields?: string[]
}

class Logger {
  private config: LoggerConfig
  private context: Record<string, any> = {}
  private buffer: LogEntry[] = []
  private readonly maxBufferSize = 100

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
      enableLocalStorage: false,
      maxLocalStorageEntries: 1000,
      enableSentry: false,
      enableAnalytics: false,
      sensitiveFields: ['password', 'token', 'apiKey', 'secret', 'creditCard'],
      ...config
    }

    if (typeof window !== 'undefined') {
      this.initializeClientLogger()
    }
  }

  private initializeClientLogger() {
    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.error('Unhandled error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
    })

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      })
    })

    // Flush buffer before page unload
    window.addEventListener('beforeunload', () => {
      this.flush()
    })
  }

  setContext(context: Record<string, any>) {
    this.context = { ...this.context, ...context }
  }

  clearContext() {
    this.context = {}
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context)
  }

  error(message: string, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context)
  }

  critical(message: string, context?: Record<string, any>) {
    this.log(LogLevel.CRITICAL, message, context)
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    if (level < this.config.level) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.sanitizeContext({ ...this.context, ...context }),
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      requestId: this.getRequestId(),
      traceId: this.getTraceId(),
      stack: level >= LogLevel.ERROR ? this.getStackTrace() : undefined
    }

    this.processLogEntry(entry)
  }

  private processLogEntry(entry: LogEntry) {
    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(entry)
    }

    // Buffer for batch sending
    this.buffer.push(entry)
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush()
    }

    // Local storage (for debugging)
    if (this.config.enableLocalStorage) {
      this.logToLocalStorage(entry)
    }

    // Send to external services
    if (this.config.enableSentry && entry.level >= LogLevel.ERROR) {
      this.sendToSentry(entry)
    }

    if (this.config.enableAnalytics) {
      this.sendToAnalytics(entry)
    }

    if (this.config.enableRemote) {
      this.sendToRemote(entry)
    }
  }

  private logToConsole(entry: LogEntry) {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL']
    const levelColors = ['#666', '#2196F3', '#FF9800', '#F44336', '#9C27B0']
    
    const style = `color: ${levelColors[entry.level]}; font-weight: bold;`
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    
    console.groupCollapsed(
      `%c[${levelNames[entry.level]}] ${timestamp} ${entry.message}`,
      style
    )
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      console.log('Context:', entry.context)
    }
    
    if (entry.stack) {
      console.log('Stack:', entry.stack)
    }
    
    console.groupEnd()
  }

  private logToLocalStorage(entry: LogEntry) {
    try {
      const key = 'app_logs'
      const existingLogs = JSON.parse(localStorage.getItem(key) || '[]')
      
      existingLogs.push(entry)
      
      // Keep only the latest entries
      if (existingLogs.length > this.config.maxLocalStorageEntries) {
        existingLogs.splice(0, existingLogs.length - this.config.maxLocalStorageEntries)
      }
      
      localStorage.setItem(key, JSON.stringify(existingLogs))
    } catch (error) {
      console.warn('Failed to save log to localStorage:', error)
    }
  }

  private async sendToRemote(entry: LogEntry) {
    if (!this.config.remoteEndpoint) return

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
        keepalive: true
      })
    } catch (error) {
      console.warn('Failed to send log to remote endpoint:', error)
    }
  }

  private sendToSentry(entry: LogEntry) {
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry
      
      Sentry.withScope((scope: any) => {
        scope.setLevel(entry.level >= LogLevel.CRITICAL ? 'fatal' : 
                      entry.level >= LogLevel.ERROR ? 'error' : 'warning')
        
        if (entry.context) {
          scope.setContext('additional', entry.context)
        }
        
        if (entry.userId) {
          scope.setUser({ id: entry.userId })
        }
        
        if (entry.tags) {
          entry.tags.forEach(tag => scope.setTag('category', tag))
        }
        
        Sentry.captureMessage(entry.message)
      })
    }
  }

  private sendToAnalytics(entry: LogEntry) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'application_log', {
        event_category: 'logging',
        event_label: entry.message,
        log_level: LogLevel[entry.level],
        custom_parameter_1: entry.context?.category || 'general'
      })
    }
  }

  private sanitizeContext(context: Record<string, any>): Record<string, any> {
    const sanitized = { ...context }
    
    this.config.sensitiveFields?.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]'
      }
    })
    
    return sanitized
  }

  private getUserId(): string | undefined {
    if (typeof window !== 'undefined') {
      // Try to get from session or auth context
      return (window as any).__USER_ID__ || 
             sessionStorage.getItem('userId') ||
             localStorage.getItem('userId') ||
             undefined
    }
    return undefined
  }

  private getSessionId(): string | undefined {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('sessionId')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('sessionId', sessionId)
      }
      return sessionId
    }
    return undefined
  }

  private getRequestId(): string | undefined {
    // This would typically be set by the request context
    return this.context.requestId
  }

  private getTraceId(): string | undefined {
    // This would typically be set by distributed tracing
    return this.context.traceId
  }

  private getStackTrace(): string {
    return new Error().stack || ''
  }

  async flush() {
    if (this.buffer.length === 0) return

    const entries = [...this.buffer]
    this.buffer = []

    if (this.config.enableRemote && this.config.remoteEndpoint) {
      try {
        await fetch(`${this.config.remoteEndpoint}/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ entries }),
          keepalive: true
        })
      } catch (error) {
        console.warn('Failed to flush logs to remote endpoint:', error)
        // Put entries back in buffer
        this.buffer.unshift(...entries)
      }
    }
  }

  // Performance logging utilities
  createPerformanceLogger(name: string) {
    const startTime = performance.now()
    
    return {
      end: (context?: Record<string, any>) => {
        const duration = performance.now() - startTime
        this.info(`Performance: ${name}`, {
          duration: Math.round(duration),
          ...context
        })
        return duration
      }
    }
  }

  // API call logging
  logApiCall(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: Record<string, any>
  ) {
    const level = statusCode >= 500 ? LogLevel.ERROR :
                  statusCode >= 400 ? LogLevel.WARN :
                  duration > 5000 ? LogLevel.WARN :
                  LogLevel.INFO

    this.log(level, `API ${method} ${url}`, {
      method,
      url,
      statusCode,
      duration: Math.round(duration),
      ...context
    })
  }

  // User action logging
  logUserAction(action: string, context?: Record<string, any>) {
    this.info(`User action: ${action}`, {
      action,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...context
    })
  }

  // Business event logging
  logBusinessEvent(event: string, context?: Record<string, any>) {
    this.info(`Business event: ${event}`, {
      event,
      timestamp: new Date().toISOString(),
      ...context
    })
  }

  // Get logs for debugging
  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    if (typeof window === 'undefined') return []

    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]') as LogEntry[]
      
      let filtered = logs
      if (level !== undefined) {
        filtered = logs.filter(log => log.level >= level)
      }
      
      if (limit) {
        filtered = filtered.slice(-limit)
      }
      
      return filtered
    } catch {
      return []
    }
  }

  // Clear logs
  clearLogs() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app_logs')
    }
    this.buffer = []
  }
}

// Create default logger instance
export const logger = new Logger({
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableLocalStorage: process.env.NODE_ENV !== 'production',
  enableRemote: process.env.NODE_ENV === 'production',
  remoteEndpoint: '/api/logs',
  enableAnalytics: process.env.NODE_ENV === 'production'
})

// Server-side logger for API routes
export class ServerLogger extends Logger {
  constructor(config: Partial<LoggerConfig> = {}) {
    super({
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
      enableLocalStorage: false,
      enableSentry: false,
      enableAnalytics: false,
      ...config
    })
  }

  logRequest(req: any, res: any, duration: number) {
    const statusCode = res.statusCode || 200
    const level = statusCode >= 500 ? LogLevel.ERROR :
                  statusCode >= 400 ? LogLevel.WARN :
                  duration > 5000 ? LogLevel.WARN :
                  LogLevel.INFO

    this.log(level, `${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      statusCode,
      duration: Math.round(duration),
      userAgent: req.headers?.['user-agent'],
      ip: req.headers?.['x-forwarded-for'] || req.connection?.remoteAddress,
      requestId: req.headers?.['x-request-id']
    })
  }
}

export const serverLogger = new ServerLogger()

