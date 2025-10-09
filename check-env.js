// Verificar variables de entorno
const path = require('path')
const fs = require('fs')

console.log('🔍 VERIFICANDO VARIABLES DE ENTORNO')
console.log('=' .repeat(40))

// Verificar archivos .env
const envFiles = ['.env.local', '.env', '.env.development']
console.log('\n📁 Archivos .env disponibles:')

envFiles.forEach(file => {
  const filePath = path.join(__dirname, file)
  const exists = fs.existsSync(filePath)
  console.log(`   ${file}: ${exists ? '✅ Existe' : '❌ No existe'}`)
  
  if (exists) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'))
      console.log(`      Variables definidas: ${lines.length}`)
      
      // Mostrar variables de NextAuth específicamente
      const nextAuthVars = lines.filter(line => line.includes('NEXTAUTH'))
      if (nextAuthVars.length > 0) {
        console.log('      Variables NextAuth:')
        nextAuthVars.forEach(line => {
          const [key] = line.split('=')
          console.log(`        ${key}`)
        })
      }
    } catch (error) {
      console.log(`      Error leyendo archivo: ${error.message}`)
    }
  }
})

// Verificar variables en proceso actual
console.log('\n🔧 Variables en process.env:')
const envVars = [
  'NODE_ENV',
  'NEXTAUTH_SECRET', 
  'NEXTAUTH_URL',
  'DATABASE_URL'
]

envVars.forEach(varName => {
  const value = process.env[varName]
  console.log(`   ${varName}: ${value ? '✅ Definida' : '❌ No definida'}`)
  if (value && varName !== 'DATABASE_URL') {
    // Mostrar solo primeros y últimos caracteres para seguridad
    const masked = value.length > 10 ? 
      `${value.substring(0, 5)}...${value.substring(value.length - 3)}` :
      '***'
    console.log(`      Valor: ${masked}`)
  }
})

console.log('\n🎯 SOLUCIONES:')
if (!process.env.NEXTAUTH_SECRET) {
  console.log('❌ NEXTAUTH_SECRET no está definida')
  console.log('💡 Solución: Reinicia el servidor con: npm run dev')
  console.log('💡 O exporta manualmente: export NEXTAUTH_SECRET="dev-secret-lovilike-2024"')
}

if (!process.env.NEXTAUTH_URL) {
  console.log('❌ NEXTAUTH_URL no está definida')  
  console.log('💡 Solución: export NEXTAUTH_URL="http://147.93.53.104:3000"')
}

console.log('\n📋 COMANDOS PARA EJECUTAR:')
console.log('1. export NEXTAUTH_SECRET="dev-secret-lovilike-2024"')
console.log('2. export NEXTAUTH_URL="http://147.93.53.104:3000"')
console.log('3. npm run dev')

console.log('\n✅ Una vez configurado, el login debería funcionar correctamente.')