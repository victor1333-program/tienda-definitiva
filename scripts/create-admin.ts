import { db } from '@/lib/db';
import bcrypt from 'bcryptjs'

async function createAdmin() {
  console.log('🔧 Creando usuario administrador...')
  
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // Eliminar usuario existente si existe
    await db.user.deleteMany({
      where: { email: 'admin@lovilike.es' }
    })
    
    // Crear nuevo usuario admin
    const admin = await db.user.create({
      data: {
        email: 'admin@lovilike.es',
        name: 'Administrador Lovilike',
        password: hashedPassword,
        role: 'ADMIN',
        phone: '611066997',
        emailVerified: new Date(),
      }
    })
    
    console.log('✅ Usuario administrador creado exitosamente:')
    console.log('   Email:', admin.email)
    console.log('   Contraseña: admin123')
    console.log('   Rol:', admin.role)
    console.log('   Email verificado:', admin.emailVerified ? 'Sí' : 'No')
    
  } catch (error) {
    console.error('❌ Error creando administrador:', error)
  } finally {
    await db.$disconnect()
  }
}

createAdmin()