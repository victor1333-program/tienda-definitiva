const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function verifyAdminUser() {
  console.log('🔍 VERIFICANDO USUARIO ADMINISTRADOR')
  console.log('=' .repeat(40))
  
  try {
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@lovilike.es' }
    })
    
    if (!adminUser) {
      console.log('❌ Usuario admin no encontrado')
      return
    }
    
    console.log('✅ Usuario encontrado:')
    console.log(`   📧 Email: ${adminUser.email}`)
    console.log(`   👤 Nombre: ${adminUser.name}`)
    console.log(`   🔐 Role: ${adminUser.role}`)
    console.log(`   ✅ Email verificado: ${adminUser.emailVerified ? 'SÍ' : 'NO'}`)
    console.log(`   📅 Creado: ${adminUser.createdAt}`)
    
    // Verificar contraseñas
    console.log('\n🔑 VERIFICANDO CONTRASEÑAS:')
    
    const passwords = [
      'admin123',
      'Admin123!',
      'Admin123!Lovilike'
    ]
    
    for (const password of passwords) {
      const isValid = await bcrypt.compare(password, adminUser.password)
      console.log(`   ${password.padEnd(20)}: ${isValid ? '✅ VÁLIDA' : '❌ Inválida'}`)
    }
    
    // Información adicional
    console.log('\n📊 INFORMACIÓN ADICIONAL:')
    console.log(`   🔒 Hash de contraseña: ${adminUser.password.substring(0, 20)}...`)
    console.log(`   🆔 ID de usuario: ${adminUser.id}`)
    
  } catch (error) {
    console.error('❌ Error verificando usuario:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAdminUser()