const { db } = require('../src/lib/db');
async function checkAndCreateCategories() {
  try {
    console.log('🔍 Verificando macrocategorías existentes...')
    
    // Verificar macrocategorías
    const macroCategories = await db.personalizationImageMacroCategory.findMany({
      include: {
        categories: true,
        _count: { select: { images: true, categories: true } }
      }
    })
    
    console.log(`📊 Macrocategorías encontradas: ${macroCategories.length}`)
    macroCategories.forEach(macro => {
      console.log(`  - ${macro.name} (${macro._count.categories} categorías, ${macro._count.images} imágenes)`)
    })
    
    // Verificar categorías
    const categories = await db.personalizationImageCategory.findMany({
      include: {
        macroCategory: true,
        _count: { select: { images: true } }
      }
    })
    
    console.log(`📊 Categorías encontradas: ${categories.length}`)
    categories.forEach(cat => {
      console.log(`  - ${cat.name} ${cat.macroCategory ? `(${cat.macroCategory.name})` : '(Sin macro)'} - ${cat._count.images} imágenes`)
    })
    
    // Si no hay macrocategorías, crear algunas de ejemplo
    if (macroCategories.length === 0) {
      console.log('🚀 Creando macrocategorías de ejemplo...')
      
      const exampleMacros = [
        { name: 'Animales', description: 'Imágenes de animales', icon: '🐾' },
        { name: 'Naturaleza', description: 'Imágenes de naturaleza', icon: '🌿' },
        { name: 'Deportes', description: 'Imágenes relacionadas con deportes', icon: '⚽' },
        { name: 'Formas', description: 'Formas geométricas y diseños', icon: '🔷' }
      ]
      
      for (let i = 0; i < exampleMacros.length; i++) {
        const macro = exampleMacros[i]
        const slug = macro.name.toLowerCase().replace(/\s+/g, '-')
        
        const created = await db.personalizationImageMacroCategory.create({
          data: {
            name: macro.name,
            slug: slug,
            description: macro.description,
            icon: macro.icon,
            sortOrder: i,
            isActive: true
          }
        })
        
        console.log(`✅ Macrocategoría creada: ${created.name}`)
      }
    }
    
    // Si no hay categorías, crear algunas de ejemplo
    if (categories.length === 0) {
      console.log('🚀 Creando categorías de ejemplo...')
      
      // Obtener las macrocategorías recién creadas
      const currentMacros = await db.personalizationImageMacroCategory.findMany()
      
      const exampleCategories = [
        { name: 'Perros', macroName: 'Animales' },
        { name: 'Gatos', macroName: 'Animales' },
        { name: 'Flores', macroName: 'Naturaleza' },
        { name: 'Paisajes', macroName: 'Naturaleza' },
        { name: 'Fútbol', macroName: 'Deportes' },
        { name: 'Básquetbol', macroName: 'Deportes' },
        { name: 'Círculos', macroName: 'Formas' },
        { name: 'Estrellas', macroName: 'Formas' }
      ]
      
      for (let i = 0; i < exampleCategories.length; i++) {
        const cat = exampleCategories[i]
        const macro = currentMacros.find(m => m.name === cat.macroName)
        const slug = cat.name.toLowerCase().replace(/\s+/g, '-')
        
        const created = await db.personalizationImageCategory.create({
          data: {
            name: cat.name,
            slug: slug,
            macroCategoryId: macro?.id || null,
            sortOrder: i,
            isActive: true
          }
        })
        
        console.log(`✅ Categoría creada: ${created.name} ${macro ? `(${macro.name})` : ''}`)
      }
    }
    
    console.log('✨ Proceso completado')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

checkAndCreateCategories()