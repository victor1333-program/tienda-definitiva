#!/usr/bin/env node

const { execSync } = require('child_process');

async function resetAndSeed() {
  console.log('🔄 Reiniciando base de datos y cargando datos de prueba...\n');
  
  try {
    console.log('1️⃣ Limpiando base de datos...');
    execSync('node scripts/clear-database.js', { stdio: 'inherit' });
    
    console.log('\n2️⃣ Insertando datos básicos...');
    execSync('node scripts/seed-test-data.js', { stdio: 'inherit' });
    
    console.log('\n3️⃣ Creando pedidos de ejemplo...');
    execSync('node scripts/add-sample-orders.js', { stdio: 'inherit' });
    
    console.log('\n🎉 ¡Base de datos completamente reiniciada y lista para pruebas!');
    console.log('\n👤 Credenciales de admin:');
    console.log('Email: admin@lovilike.es');
    console.log('Password: admin123');
    console.log('\n🔗 Accede al panel de administración en: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Error durante el proceso:', error.message);
    process.exit(1);
  }
}

resetAndSeed();