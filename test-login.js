// Script para probar login directamente desde línea de comandos
const fetch = require('node-fetch')

async function testLogin() {
  console.log('🧪 TESTING LOGIN API')
  console.log('=' .repeat(30))
  
  const loginData = {
    email: 'admin@lovilike.es',
    password: 'admin123'
  }
  
  try {
    console.log('🚀 Enviando request a debug-login...')
    
    const response = await fetch('http://localhost:3000/api/auth/debug-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    })
    
    console.log(`📊 Status: ${response.status}`)
    
    const result = await response.json()
    console.log('📋 Respuesta:')
    console.log(JSON.stringify(result, null, 2))
    
    if (result.success) {
      console.log('✅ LOGIN EXITOSO - NextAuth debería funcionar')
    } else {
      console.log('❌ LOGIN FALLÓ - Revisar configuración')
      console.log(`🔍 Error en paso: ${result.step}`)
    }
    
  } catch (error) {
    console.error('❌ Error en test:', error.message)
  }
}

// Verificar si se está ejecutando con el puerto correcto
if (process.argv.length > 2) {
  const port = process.argv[2]
  console.log(`🔄 Usando puerto personalizado: ${port}`)
  // Aquí podrías cambiar la URL base
}

testLogin()