const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Función para encontrar archivos con params.
function findFilesWithParams() {
  try {
    const result = execSync('find src/app/api -name "*.ts" -exec grep -l "params\\.[a-zA-Z]" {} \\;', {
      encoding: 'utf8',
      cwd: '/home/developer/lovilike-dev'
    });
    return result.trim().split('\n').filter(f => f);
  } catch (error) {
    console.log('No files found or error occurred');
    return [];
  }
}

// Función para corregir un archivo
function fixFile(filePath) {
  console.log(`🔧 Corrigiendo: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar si ya está corregido
    if (content.includes('{ params }: { params: Promise<{')) {
      console.log(`  ✅ Ya corregido: ${filePath}`);
      return;
    }
    
    // Patrón para encontrar y reemplazar
    const patterns = [
      // Para funciones GET, POST, PATCH, DELETE con params
      {
        from: /{ params }: { params: { ([^}]+) } }/g,
        to: '{ params }: { params: Promise<{ $1 }> }'
      }
    ];
    
    let modified = false;
    
    patterns.forEach(pattern => {
      if (pattern.from.test(content)) {
        content = content.replace(pattern.from, pattern.to);
        modified = true;
      }
    });
    
    if (modified) {
      // Buscar y reemplazar usos de params.id, params.slug, etc.
      const paramUsages = content.match(/params\.([a-zA-Z]+)/g);
      
      if (paramUsages) {
        // Extraer nombres únicos de parámetros
        const paramNames = [...new Set(paramUsages.map(usage => usage.split('.')[1]))];
        
        // Crear la destructuración
        const destructuring = `const { ${paramNames.join(', ')} } = await params`;
        
        // Buscar el primer uso de params y agregar la destructuración antes
        const firstParamUsage = content.search(/params\.[a-zA-Z]+/);
        if (firstParamUsage !== -1) {
          // Encontrar el inicio de la función donde está el primer uso
          const beforeFirstUsage = content.substring(0, firstParamUsage);
          const lastTryIndex = beforeFirstUsage.lastIndexOf('try {');
          
          if (lastTryIndex !== -1) {
            const insertPoint = content.indexOf('\n', lastTryIndex) + 1;
            content = content.substring(0, insertPoint) + 
                     '    ' + destructuring + '\n    \n' + 
                     content.substring(insertPoint);
            
            // Reemplazar todos los usos de params.paramName con paramName
            paramNames.forEach(paramName => {
              const regex = new RegExp(`params\\.${paramName}`, 'g');
              content = content.replace(regex, paramName);
            });
            
            modified = true;
          }
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Corregido: ${filePath}`);
    } else {
      console.log(`  ⚠️  Sin cambios: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`  ❌ Error en ${filePath}:`, error.message);
  }
}

// Ejecutar el script
console.log('🚀 Iniciando corrección de archivos para Next.js 15...\n');

const files = findFilesWithParams();
console.log(`📁 Encontrados ${files.length} archivos con params:\n`);

if (files.length === 0) {
  console.log('✅ No se encontraron archivos que necesiten corrección');
  process.exit(0);
}

files.forEach(file => {
  if (file.trim()) {
    fixFile(file.trim());
  }
});

console.log('\n🎉 Corrección completada!');