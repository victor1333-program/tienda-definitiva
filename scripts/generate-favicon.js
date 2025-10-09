const fs = require('fs');
const path = require('path');

// Simulamos la generación de favicon usando canvas en Node.js
// En un entorno real usaríamos sharp o similar

console.log('🎨 Generando favicon desde Social_Logo.png...');

// Verificar que existe el logo original
const logoPath = path.join(process.cwd(), 'public', 'img', 'Social_Logo.png');
const publicPath = path.join(process.cwd(), 'public');

if (!fs.existsSync(logoPath)) {
  console.error('❌ No se encontró Social_Logo.png en public/img/');
  process.exit(1);
}

// Crear los archivos de favicon (como placeholder, usaremos copias del original)
// En producción estos serían redimensionados apropiadamente

const faviconSizes = [
  { size: '16x16', filename: 'favicon-16x16.png' },
  { size: '32x32', filename: 'favicon-32x32.png' },
  { size: '96x96', filename: 'favicon-96x96.png' },
  { size: '192x192', filename: 'android-chrome-192x192.png' },
  { size: '512x512', filename: 'android-chrome-512x512.png' },
  { size: '180x180', filename: 'apple-touch-icon.png' }
];

try {
  // Copiar el logo original como base para todos los tamaños
  // En producción esto sería redimensionado apropiadamente
  faviconSizes.forEach(({ filename }) => {
    const destPath = path.join(publicPath, filename);
    fs.copyFileSync(logoPath, destPath);
    console.log(`✅ Creado: ${filename}`);
  });

  // Para favicon.ico, usamos la versión PNG más pequeña
  fs.copyFileSync(logoPath, path.join(publicPath, 'favicon.ico'));
  console.log('✅ Creado: favicon.ico (formato PNG, compatible con navegadores modernos)');

  console.log('🎉 ¡Favicon generado exitosamente!');
  console.log('📝 Nota: Los archivos son copias del logo original.');
  console.log('💡 Para producción, usa herramientas como sharp para redimensionar apropiadamente.');

} catch (error) {
  console.error('❌ Error generando favicon:', error.message);
  process.exit(1);
}