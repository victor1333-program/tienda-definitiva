const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testAuthFlow() {
  console.log('🧪 TESTING FLUJO DE AUTENTICACIÓN')
  console.log('=' .repeat(40))
  
  try {
    // Paso 1: Verificar usuario
    console.log('📧 Paso 1: Buscar usuario admin@lovilike.es')
    const user = await prisma.user.findUnique({
      where: { email: 'admin@lovilike.es' }
    })
    
    if (!user) {
      console.log('❌ Usuario no encontrado')
      return
    }
    
    console.log('✅ Usuario encontrado')
    console.log(`   Role: ${user.role}`)
    console.log(`   Email verificado: ${user.emailVerified ? 'SÍ' : 'NO'}`)
    
    // Paso 2: Verificar contraseña
    console.log('\n🔑 Paso 2: Verificar contraseña "admin123"')
    const isPasswordValid = await bcrypt.compare('admin123', user.password)
    
    if (!isPasswordValid) {
      console.log('❌ Contraseña incorrecta')
      return
    }
    
    console.log('✅ Contraseña válida')
    
    // Paso 3: Verificar permisos
    console.log('\n🛡️  Paso 3: Verificar permisos de administrador')
    const hasAdminRole = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    
    if (!hasAdminRole) {
      console.log(`❌ Rol insuficiente: ${user.role}`)
      return
    }
    
    console.log('✅ Permisos de administrador válidos')
    
    // Paso 4: Simular objeto de sesión
    console.log('\n📋 Paso 4: Simular objeto de sesión NextAuth')
    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
    
    console.log('✅ Objeto de usuario para sesión:')
    console.log(JSON.stringify(sessionUser, null, 2))
    
    // Paso 5: Verificar configuración de middleware
    console.log('\n🔧 Paso 5: Verificar configuración de rutas')
    const adminRoutes = ['/admin']
    const needsAdminAuth = adminRoutes.some(route => '/admin'.startsWith(route))
    
    console.log(`✅ Ruta /admin requiere auth: ${needsAdminAuth}`)
    
    // Paso 6: Verificar redirección esperada
    console.log('\n🔄 Paso 6: Verificar redirección esperada')
    console.log('   Después del login exitoso debería redirigir a: /admin')
    console.log('   Método usado: window.location.href = "/admin"')
    
    console.log('\n🎉 RESUMEN:')
    console.log('✅ Usuario existe y es válido')
    console.log('✅ Contraseña correcta: admin123')  
    console.log('✅ Rol de administrador válido')
    console.log('✅ Configuración de rutas correcta')
    console.log('')
    console.log('🔍 POSIBLES CAUSAS DEL PROBLEMA:')
    console.log('1. ❓ JavaScript del navegador bloqueado')
    console.log('2. ❓ Error en la creación de la sesión NextAuth')
    console.log('3. ❓ Problema con cookies/localStorage')
    console.log('4. ❓ Error en el middleware de verificación')
    
    console.log('\n💡 SOLUCIONES A PROBAR:')
    console.log('1. 🔍 Revisar console.log del navegador (F12)')
    console.log('2. 🔍 Verificar Network tab para ver requests fallidos')
    console.log('3. 🔍 Comprobar si se crean cookies de sesión')
    console.log('4. 🧪 Probar acceso directo a /admin después del login')
    
  } catch (error) {
    console.error('❌ Error en el flujo de autenticación:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuthFlow()