const { db } = require('../src/lib/db');
const fs = require('fs')
const path = require('path')

// Definir las formas con sus SVGs
const shapes = [
  // Geométricas
  {
    name: 'Rectángulo',
    category: 'geometricas',
    tags: ['geometrico', 'basico', 'cuadrado'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="80" height="60" fill="currentColor"/></svg>'
  },
  {
    name: 'Círculo',
    category: 'geometricas', 
    tags: ['geometrico', 'basico', 'redondo'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="currentColor"/></svg>'
  },
  {
    name: 'Triángulo',
    category: 'geometricas',
    tags: ['geometrico', 'basico', 'angular'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 90,80 10,80" fill="currentColor"/></svg>'
  },
  {
    name: 'Diamante',
    category: 'geometricas',
    tags: ['geometrico', 'angular', 'rombo'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 80,50 50,90 20,50" fill="currentColor"/></svg>'
  },
  {
    name: 'Pentágono',
    category: 'geometricas',
    tags: ['geometrico', 'angular'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 90,35 75,80 25,80 10,35" fill="currentColor"/></svg>'
  },
  {
    name: 'Hexágono',
    category: 'geometricas',
    tags: ['geometrico', 'angular'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 85,25 85,65 50,85 15,65 15,25" fill="currentColor"/></svg>'
  },

  // Decorativas
  {
    name: 'Estrella',
    category: 'decorativas',
    tags: ['decorativo', 'estrella', 'brillante'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="currentColor"/></svg>'
  },
  {
    name: 'Corazón',
    category: 'decorativas',
    tags: ['decorativo', 'amor', 'corazon'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50,85 C50,85 20,50 20,35 C20,20 35,20 50,35 C65,20 80,20 80,35 C80,50 50,85 50,85 Z" fill="currentColor"/></svg>'
  },
  {
    name: 'Flor',
    category: 'decorativas',
    tags: ['decorativo', 'natura', 'flor'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><ellipse cx="50" cy="30" rx="15" ry="25" transform="rotate(0 50 50)"/><ellipse cx="50" cy="30" rx="15" ry="25" transform="rotate(72 50 50)"/><ellipse cx="50" cy="30" rx="15" ry="25" transform="rotate(144 50 50)"/><ellipse cx="50" cy="30" rx="15" ry="25" transform="rotate(216 50 50)"/><ellipse cx="50" cy="30" rx="15" ry="25" transform="rotate(288 50 50)"/><circle cx="50" cy="50" r="8"/></g></svg>'
  },
  {
    name: 'Flecha',
    category: 'decorativas',
    tags: ['decorativo', 'direccion', 'flecha'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="10,45 60,45 60,25 90,50 60,75 60,55 10,55" fill="currentColor"/></svg>'
  },
  {
    name: 'Corona',
    category: 'decorativas',
    tags: ['decorativo', 'real', 'corona'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M15,70 L20,30 L30,45 L40,25 L50,40 L60,25 L70,45 L80,30 L85,70 Z" fill="currentColor"/></svg>'
  },
  {
    name: 'Mariposa',
    category: 'decorativas',
    tags: ['decorativo', 'natura', 'mariposa'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><ellipse cx="35" cy="35" rx="20" ry="15"/><ellipse cx="65" cy="35" rx="20" ry="15"/><ellipse cx="35" cy="65" rx="15" ry="20"/><ellipse cx="65" cy="65" rx="15" ry="20"/><rect x="48" y="20" width="4" height="60"/></g></svg>'
  },

  // Letras
  {
    name: 'Letra A',
    category: 'letras',
    tags: ['letra', 'alfabeto', 'texto'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M20,80 L35,40 L50,20 L65,40 L80,80 L65,80 L60,65 L40,65 L35,80 Z M45,50 L55,50 L50,35 Z" fill="currentColor"/></svg>'
  },
  {
    name: 'Letra B',
    category: 'letras',
    tags: ['letra', 'alfabeto', 'texto'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M20,20 L20,80 L55,80 C65,80 75,70 75,60 C75,55 72,50 67,48 C72,46 75,41 75,35 C75,25 65,20 55,20 Z M30,30 L50,30 C55,30 60,32 60,37 C60,42 55,45 50,45 L30,45 Z M30,55 L55,55 C60,55 65,57 65,62 C65,67 60,70 55,70 L30,70 Z" fill="currentColor"/></svg>'
  },
  {
    name: 'Ampersand',
    category: 'letras',
    tags: ['simbolo', 'and', 'ampersand'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M30,25 C40,15 60,15 60,30 C60,40 50,45 40,50 C35,52 30,55 30,60 C30,70 35,75 45,75 C55,75 65,70 70,60 L75,65 C70,80 55,85 45,85 C30,85 20,75 20,60 C20,50 25,45 35,40 C25,35 25,25 35,20 C45,15 55,20 55,30 C55,35 50,40 45,40 C40,40 35,35 35,30 C35,25 30,25 30,25 Z" fill="currentColor"/></svg>'
  },
  {
    name: 'Arroba',
    category: 'letras',
    tags: ['simbolo', 'email', 'arroba'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50,15 C70,15 85,30 85,50 C85,60 80,65 75,65 C70,65 65,60 65,55 L65,35 L55,35 L55,45 C50,40 40,40 35,50 C30,60 35,70 45,70 C55,70 60,65 65,60 C70,70 75,75 85,70 C90,85 70,85 50,85 C25,85 10,70 10,50 C10,25 25,15 50,15 Z M45,50 C50,45 55,50 55,55 C55,60 50,65 45,60 C40,55 40,50 45,50 Z" fill="currentColor"/></svg>'
  },

  // Marcos
  {
    name: 'Marco Circular',
    category: 'marcos',
    tags: ['marco', 'borde', 'circular'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="8"/></svg>'
  },
  {
    name: 'Marco Rectangular',
    category: 'marcos',
    tags: ['marco', 'borde', 'rectangular'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="80" height="60" fill="none" stroke="currentColor" stroke-width="8"/></svg>'
  },
  {
    name: 'Marco Ornamentado',
    category: 'marcos',
    tags: ['marco', 'borde', 'decorativo'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="15" width="80" height="70" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="20" cy="25" r="3" fill="currentColor"/><circle cx="80" cy="25" r="3" fill="currentColor"/><circle cx="20" cy="75" r="3" fill="currentColor"/><circle cx="80" cy="75" r="3" fill="currentColor"/></svg>'
  },
  {
    name: 'Marco Vintage',
    category: 'marcos',
    tags: ['marco', 'borde', 'vintage'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M15,20 Q20,15 25,20 L75,20 Q80,15 85,20 L85,75 Q80,80 75,75 L25,75 Q20,80 15,75 Z" fill="none" stroke="currentColor" stroke-width="3"/></svg>'
  },

  // Naturaleza
  {
    name: 'Hoja',
    category: 'naturaleza',
    tags: ['natura', 'planta', 'hoja'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M20,80 Q20,40 50,20 Q80,40 80,80 Q80,90 70,90 Q50,85 30,90 Q20,90 20,80 Z" fill="currentColor"/><line x1="50" y1="20" x2="50" y2="90" stroke="currentColor" stroke-width="2"/></svg>'
  },
  {
    name: 'Árbol',
    category: 'naturaleza',
    tags: ['natura', 'arbol', 'bosque'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="45" y="60" width="10" height="30" fill="currentColor"/><ellipse cx="50" cy="45" rx="25" ry="20" fill="currentColor"/><ellipse cx="50" cy="35" rx="20" ry="15" fill="currentColor"/><ellipse cx="50" cy="25" rx="15" ry="12" fill="currentColor"/></svg>'
  },
  {
    name: 'Girasol',
    category: 'naturaleza',
    tags: ['natura', 'flor', 'girasol'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><circle cx="50" cy="50" r="15"/><ellipse cx="50" cy="25" rx="8" ry="20" transform="rotate(0 50 50)"/><ellipse cx="50" cy="25" rx="8" ry="20" transform="rotate(30 50 50)"/><ellipse cx="50" cy="25" rx="8" ry="20" transform="rotate(60 50 50)"/><ellipse cx="50" cy="25" rx="8" ry="20" transform="rotate(90 50 50)"/><ellipse cx="50" cy="25" rx="8" ry="20" transform="rotate(120 50 50)"/><ellipse cx="50" cy="25" rx="8" ry="20" transform="rotate(150 50 50)"/><ellipse cx="50" cy="25" rx="8" ry="20" transform="rotate(180 50 50)"/><ellipse cx="50" cy="25" rx="8" ry="20" transform="rotate(210 50 50)"/><ellipse cx="50" cy="25" rx="8" ry="20" transform="rotate(240 50 50)"/><ellipse cx="50" cy="25" rx="8" ry="20" transform="rotate(270 50 50)"/><ellipse cx="50" cy="25" rx="8" ry="20" transform="rotate(300 50 50)"/><ellipse cx="50" cy="25" rx="8" ry="20" transform="rotate(330 50 50)"/></g></svg>'
  },
  {
    name: 'Montaña',
    category: 'naturaleza',
    tags: ['natura', 'montana', 'paisaje'],
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="10,80 30,30 50,50 70,20 90,80" fill="currentColor"/></svg>'
  }
]

async function seedShapes() {
  try {
    console.log('🌱 Iniciando la precarga de formas...')

    // Crear directorio para las formas si no existe
    const shapesDir = path.join(process.cwd(), 'public/uploads/personalization/shapes')
    if (!fs.existsSync(shapesDir)) {
      fs.mkdirSync(shapesDir, { recursive: true })
      console.log('📁 Directorio de formas creado')
    }

    // Limpiar formas existentes (opcional)
    const existingShapes = await db.personalizationShape.count()
    if (existingShapes > 0) {
      console.log(`🗑️ Eliminando ${existingShapes} formas existentes...`)
      await db.personalizationShape.deleteMany()
    }

    // Crear las formas en la base de datos
    for (const shape of shapes) {
      // Crear archivo SVG
      const filename = `${shape.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.svg`
      const filePath = path.join(shapesDir, filename)
      fs.writeFileSync(filePath, shape.svg)

      // Crear registro en la base de datos
      await db.personalizationShape.create({
        data: {
          name: shape.name,
          category: shape.category,
          fileUrl: `/uploads/personalization/shapes/${filename}`,
          isMask: true,
          tags: shape.tags,
          isFromLibrary: true,
          fileType: 'image/svg+xml',
          fileSize: Buffer.byteLength(shape.svg, 'utf8'),
          isActive: true
        }
      })

      console.log(`✅ Forma creada: ${shape.name} (${shape.category})`)
    }

    console.log(`🎉 ¡${shapes.length} formas precargadas exitosamente!`)

    // Mostrar resumen por categorías
    const categoryCounts = await db.personalizationShape.groupBy({
      by: ['category'],
      _count: { id: true }
    })

    console.log('\n📊 Resumen por categorías:')
    categoryCounts.forEach(cat => {
      console.log(`   ${cat.category}: ${cat._count.id} formas`)
    })

  } catch (error) {
    console.error('❌ Error al precargar formas:', error)
  } finally {
    await db.$disconnect()
  }
}

seedShapes()