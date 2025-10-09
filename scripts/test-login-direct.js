const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testLoginDirect() {
  console.log('🧪 TEST LOGIN DIRECTO')
  console.log('=' .repeat(30))
  
  const email = 'admin@lovilike.es'
  const password = 'admin123'
  
  try {
    // Simular exactamente lo que hace NextAuth
    console.log('🔐 Simulando proceso de NextAuth authorize()...')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${password}`)
    
    if (!email || !password) {
      console.log('❌ Credenciales faltantes')
      return
    }

    console.log('🔍 Buscando usuario en DB...')
    const user = await prisma.user.findUnique({
      where: { email }
    })

    console.log(`👤 Usuario encontrado: ${!!user}`)

    if (!user || !user.password) {
      console.log('❌ Usuario no encontrado o sin contraseña')
      return
    }

    console.log(`🔐 Role del usuario: ${user.role}`)
    console.log(`✅ Email verificado: ${!!user.emailVerified}`)

    // Verificar email (solo para no-admins)
    if (!user.emailVerified && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('❌ Email no verificado para usuario no-admin')
      throw new Error('Email no verificado')
    }

    console.log('🔑 Verificando contraseña...')
    const isPasswordValid = await bcrypt.compare(password, user.password)

    console.log(`✅ Contraseña válida: ${isPasswordValid}`)

    if (!isPasswordValid) {
      console.log('❌ Contraseña incorrecta')
      return
    }

    const returnUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
    
    console.log('✅ Autenticación exitosa!')
    console.log('📋 Usuario autenticado:', returnUser)
    
    console.log('\n🎉 RESULTADO:')
    console.log('✅ Las credenciales son correctas')
    console.log('✅ El proceso de autenticación debería funcionar')
    console.log('✅ NextAuth authorize() debería retornar el usuario')
    
    console.log('\n💡 SI SIGUE FALLANDO:')
    console.log('1. Verifica que el servidor esté corriendo')
    console.log('2. Verifica la variable NEXTAUTH_SECRET')
    console.log('3. Revisa los logs del servidor al hacer login')
    console.log('4. Prueba con la página de debug: /auth/debug')
    
  } catch (error) {
    console.error('❌ Error en test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLoginDirect()