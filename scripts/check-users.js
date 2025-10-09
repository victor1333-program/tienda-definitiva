const { db } = require('../src/lib/db');
async function checkUsers() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log('👥 Usuarios en la base de datos:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - ${user.name || 'Sin nombre'}`);
    });
    
    console.log(`\nTotal usuarios: ${users.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkUsers();