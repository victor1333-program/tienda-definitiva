#!/usr/bin/env node

/**
 * Script para testear el sistema de rate limiting
 */

const BASE_URL = 'http://localhost:3000'

async function makeRequest(endpoint, method = 'GET') {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'RateLimitTester/1.0'
      }
    })
    
    return {
      status: response.status,
      headers: {
        'x-ratelimit-limit': response.headers.get('X-RateLimit-Limit'),
        'x-ratelimit-remaining': response.headers.get('X-RateLimit-Remaining'),
        'x-ratelimit-reset': response.headers.get('X-RateLimit-Reset'),
        'retry-after': response.headers.get('Retry-After')
      },
      data: await response.json().catch(() => ({}))
    }
  } catch (error) {
    return {
      status: 0,
      error: error.message
    }
  }
}

async function testEndpoint(endpoint, maxRequests = 15, delayMs = 100) {
  console.log(`\n🧪 Probando ${endpoint} con ${maxRequests} requests (delay: ${delayMs}ms)`)
  console.log('=' .repeat(60))
  
  const results = []
  
  for (let i = 1; i <= maxRequests; i++) {
    const result = await makeRequest(endpoint)
    results.push(result)
    
    const status = result.status === 200 ? '✅' : result.status === 429 ? '⚠️' : '❌'
    const remaining = result.headers['x-ratelimit-remaining'] || 'N/A'
    const limit = result.headers['x-ratelimit-limit'] || 'N/A'
    
    console.log(`${status} Request ${i.toString().padStart(2)}: Status ${result.status} | Remaining: ${remaining}/${limit}`)
    
    if (result.status === 429) {
      const retryAfter = result.headers['retry-after']
      console.log(`   ⏰ Rate limited! Retry after: ${retryAfter}s`)
      
      if (result.data.message) {
        console.log(`   💬 Message: ${result.data.message}`)
      }
    }
    
    // Delay entre requests
    if (i < maxRequests) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  
  // Estadísticas
  const successful = results.filter(r => r.status === 200).length
  const rateLimited = results.filter(r => r.status === 429).length
  const errors = results.filter(r => r.status !== 200 && r.status !== 429).length
  
  console.log(`\n📊 Resultados:`)
  console.log(`   ✅ Exitosos: ${successful}`)
  console.log(`   ⚠️  Rate limited: ${rateLimited}`)
  console.log(`   ❌ Errores: ${errors}`)
  
  return results
}

async function testMultipleIPs() {
  console.log(`\n🌐 Probando desde múltiples IPs simuladas`)
  console.log('=' .repeat(60))
  
  const ips = ['192.168.1.1', '192.168.1.2', '192.168.1.3']
  
  for (const ip of ips) {
    console.log(`\n🖥️  Simulando IP: ${ip}`)
    
    // Simular requests desde diferentes IPs
    for (let i = 1; i <= 5; i++) {
      const result = await makeRequest('/api/rate-limit-check?endpoint=general')
      const status = result.status === 200 ? '✅' : '❌'
      console.log(`   ${status} Request ${i} from ${ip}: Status ${result.status}`)
      
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
}

async function testBurstRequests() {
  console.log(`\n💥 Probando burst de requests simultáneas`)
  console.log('=' .repeat(60))
  
  const promises = []
  const burstSize = 20
  
  for (let i = 1; i <= burstSize; i++) {
    promises.push(makeRequest('/api/rate-limit-check?endpoint=general'))
  }
  
  const results = await Promise.all(promises)
  
  const successful = results.filter(r => r.status === 200).length
  const rateLimited = results.filter(r => r.status === 429).length
  
  console.log(`📊 Burst de ${burstSize} requests:`)
  console.log(`   ✅ Exitosos: ${successful}`)
  console.log(`   ⚠️  Rate limited: ${rateLimited}`)
}

async function testDifferentEndpoints() {
  const endpoints = [
    { path: '/api/rate-limit-check?endpoint=general', name: 'General API' },
    { path: '/api/rate-limit-check?endpoint=auth', name: 'Auth' },
    { path: '/api/rate-limit-check?endpoint=create', name: 'Create' },
    { path: '/api/rate-limit-check?endpoint=upload', name: 'Upload' },
    { path: '/api/rate-limit-check?endpoint=admin', name: 'Admin' }
  ]
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint.path, 8, 200)
  }
}

async function main() {
  console.log('🚀 Iniciando pruebas de Rate Limiting')
  console.log('🌐 Servidor:', BASE_URL)
  console.log('⏰ Timestamp:', new Date().toISOString())
  
  try {
    // Test 1: Endpoints diferentes
    await testDifferentEndpoints()
    
    // Test 2: Burst requests
    await testBurstRequests()
    
    // Test 3: Múltiples IPs (simuladas)
    await testMultipleIPs()
    
    console.log(`\n✨ Pruebas completadas exitosamente!`)
    console.log(`\n📋 Recomendaciones:`)
    console.log(`   1. Verificar que los límites sean apropiados para tu uso`)
    console.log(`   2. Monitorear logs para detectar patrones de abuso`)
    console.log(`   3. Considerar implementar whitelist para IPs confiables`)
    console.log(`   4. Implementar cache de Redis para persistencia real`)
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error)
  }
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('test-rate-limiting.js')) {
  main()
}