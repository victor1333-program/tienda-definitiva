#!/usr/bin/env node

/**
 * Script para generar alertas de stock automáticamente
 * Se puede ejecutar manualmente o configurar como cron job
 * 
 * Uso:
 * node scripts/auto-generate-stock-alerts.js
 * 
 * Como cron job (cada hora):
 * 0 * * * * cd /path/to/your/app && node scripts/auto-generate-stock-alerts.js
 * 
 * Como cron job (cada 6 horas):
 * 0 */6 * * * cd /path/to/your/app && node scripts/auto-generate-stock-alerts.js
 */

const https = require('https')
const http = require('http')

// Configuración
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET || 'lovilike-cron-2024'

console.log('🚀 Iniciando generación automática de alertas de stock...')
console.log(`📍 URL: ${BASE_URL}/api/stock-alerts/auto-generate`)

// Determinar si usar HTTP o HTTPS
const isHttps = BASE_URL.startsWith('https')
const requestModule = isHttps ? https : http

// Parsear la URL
const url = new URL(`${BASE_URL}/api/stock-alerts/auto-generate`)

const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 3000),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CRON_SECRET}`,
    'User-Agent': 'LoviLike-Auto-Alerts/1.0'
  }
}

const req = requestModule.request(options, (res) => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    try {
      const response = JSON.parse(data)
      
      if (res.statusCode === 200) {
        console.log('✅ Alertas generadas exitosamente:')
        console.log(`   • ${response.summary.alertsCreated} alertas nuevas creadas`)
        console.log(`   • ${response.summary.alertsUpdated} alertas actualizadas`)
        console.log(`   • ${response.summary.alertsResolved} alertas resueltas`)
        console.log(`   • ${response.summary.materialsChecked} materiales revisados`)
        console.log(`   • ${response.summary.variantsChecked} variantes revisadas`)
        console.log(`   • ${response.summary.productsChecked} productos revisados`)
        console.log(`   • Ejecutado a las: ${response.summary.timestamp}`)
        
        if (response.newAlerts && response.newAlerts.length > 0) {
          console.log('\n🔔 Nuevas alertas creadas:')
          response.newAlerts.forEach(alert => {
            console.log(`   - ${alert.priority}: ${alert.message}`)
          })
        }
        
        process.exit(0)
      } else {
        console.error('❌ Error en la respuesta del servidor:')
        console.error(`   Status: ${res.statusCode}`)
        console.error(`   Error: ${response.error || 'Error desconocido'}`)
        process.exit(1)
      }
    } catch (error) {
      console.error('❌ Error al parsear la respuesta:')
      console.error(`   Respuesta: ${data}`)
      console.error(`   Error: ${error.message}`)
      process.exit(1)
    }
  })
})

req.on('error', (error) => {
  console.error('❌ Error en la conexión:')
  console.error(`   Error: ${error.message}`)
  console.error(`   Verifica que el servidor esté ejecutándose en ${BASE_URL}`)
  process.exit(1)
})

req.on('timeout', () => {
  console.error('❌ Timeout en la conexión')
  req.destroy()
  process.exit(1)
})

// Timeout de 30 segundos
req.setTimeout(30000)

// Finalizar la request
req.end()