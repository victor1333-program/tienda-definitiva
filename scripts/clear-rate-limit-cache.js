// Script para limpiar el cache de rate limiting
// Esto requerirá reiniciar el servidor ya que el cache está en memoria

console.log('🧹 LIMPIAR CACHE DE RATE LIMITING')
console.log('=' .repeat(40))
console.log('')
console.log('⚠️  IMPORTANTE:')
console.log('El cache de rate limiting está en memoria del servidor.')
console.log('Para limpiar completamente el cache, necesitas reiniciar el servidor.')
console.log('')
console.log('💡 PASOS PARA LIMPIAR:')
console.log('1. Detén el servidor: Ctrl+C en la terminal donde corre')
console.log('2. Vuelve a iniciar: npm run dev')
console.log('')
console.log('🔧 CAMBIOS APLICADOS:')
console.log('✅ Rate limit de autenticación aumentado a 100 intentos por 5 minutos')
console.log('✅ Configuración más permisiva para desarrollo')
console.log('')
console.log('📋 CONFIGURACIÓN ACTUAL:')
console.log('   - Modo desarrollo: 100 intentos / 5 minutos')
console.log('   - Modo producción: 20 intentos / 15 minutos')
console.log('')
console.log('🚀 Después de reiniciar el servidor:')
console.log('   - El cache estará limpio')
console.log('   - Los nuevos límites estarán activos')
console.log('   - Podrás acceder al sistema de autenticación')

// Verificar el modo actual
console.log('\n🔍 VERIFICACIÓN:')
console.log(`NODE_ENV actual: ${process.env.NODE_ENV || 'undefined'}`)

if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  console.log('✅ Modo desarrollo detectado - Límites permisivos')
} else {
  console.log('⚠️  Modo producción - Límites restrictivos')
  console.log('💡 Para testing, considera cambiar NODE_ENV a development')
}

console.log('\n🎯 PRÓXIMOS PASOS:')
console.log('1. Reinicia el servidor con: npm run dev')
console.log('2. Accede a: http://147.93.53.104:3000/auth/signin')
console.log('3. Usa las credenciales: admin@lovilike.es / Admin123!Lovilike')
console.log('')