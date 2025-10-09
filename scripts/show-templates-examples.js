const { db } = require('../src/lib/db');
async function showTemplatesExamples() {
  try {
    console.log('🎨 PLANTILLAS DE PERSONALIZACIÓN - EJEMPLOS DE USO\n')

    const templates = await db.personalizationTemplate.findMany({
      orderBy: { usageCount: 'desc' }
    })

    if (templates.length === 0) {
      console.log('❌ No se encontraron plantillas. Ejecuta primero create-sample-templates.js')
      return
    }

    console.log(`📊 Total de plantillas disponibles: ${templates.length}\n`)

    templates.forEach((template, index) => {
      const tags = JSON.parse(template.tags)
      const categoryIds = JSON.parse(template.categoryIds)
      
      console.log(`${index + 1}. 🌟 ${template.name}`)
      console.log(`   📝 ${template.description}`)
      console.log(`   🏷️  Etiquetas: ${tags.join(', ')}`)
      console.log(`   💰 ${template.isPremium ? `Premium (€${template.price})` : 'Gratuita'}`)
      console.log(`   👁️  ${template.isPublic ? 'Pública' : 'Privada'}`)
      console.log(`   📈 ${template.usageCount} usos | ⭐ ${template.rating}/5`)
      
      // Casos de uso específicos
      console.log('   💡 Casos de uso ideales:')
      
      if (template.name.includes('Básica')) {
        console.log('      • Nombres personalizados en camisetas')
        console.log('      • Frases motivacionales simples')
        console.log('      • Mensajes de cumpleaños básicos')
        console.log('      • Regalos personalizados económicos')
      }
      
      if (template.name.includes('Corporativo')) {
        console.log('      • Uniformes de empresa con logo')
        console.log('      • Eventos corporativos y ferias')
        console.log('      • Merchandising empresarial')
        console.log('      • Equipos de trabajo identificados')
        console.log('      • Polos para personal de atención al cliente')
      }
      
      if (template.name.includes('Boda')) {
        console.log('      • Camisetas para despedidas de soltera/o')
        console.log('      • Recuerdos de boda para invitados')
        console.log('      • Regalos personalizados para la pareja')
        console.log('      • Camisetas del cortejo nupcial')
        console.log('      • Souvenirs del enlace matrimonial')
      }
      
      if (template.name.includes('Cumpleaños')) {
        console.log('      • Fiestas infantiles temáticas')
        console.log('      • Camisetas para toda la familia en cumpleaños')
        console.log('      • Regalos personalizados para niños')
        console.log('      • Celebraciones en colegios y guarderías')
        console.log('      • Fiestas de cumpleaños en salones')
      }
      
      if (template.name.includes('Fitness')) {
        console.log('      • Ropa deportiva para gimnasios')
        console.log('      • Camisetas para equipos de running')
        console.log('      • Merchandising de entrenadores personales')
        console.log('      • Eventos deportivos y maratones')
        console.log('      • Ropa motivacional para clases de fitness')
      }
      
      if (template.name.includes('Graduación')) {
        console.log('      • Ceremonias de graduación universitaria')
        console.log('      • Finales de curso en colegios')
        console.log('      • Celebraciones académicas')
        console.log('      • Regalos para graduados')
        console.log('      • Eventos de promoción estudiantil')
      }
      
      console.log('')
    })

    console.log('🔥 PLANTILLAS MÁS POPULARES:')
    const topTemplates = templates
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 3)
    
    topTemplates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.name} - ${template.usageCount} usos`)
    })

    console.log('\n⭐ PLANTILLAS MEJOR VALORADAS:')
    const bestRated = templates
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3)
    
    bestRated.forEach((template, index) => {
      console.log(`${index + 1}. ${template.name} - ${template.rating}/5 ⭐`)
    })

    console.log('\n💎 PLANTILLAS PREMIUM:')
    const premiumTemplates = templates.filter(t => t.isPremium)
    premiumTemplates.forEach(template => {
      console.log(`• ${template.name} - €${template.price}`)
    })

    console.log('\n🎯 SEGMENTACIÓN POR INDUSTRIA:')
    console.log('\n📊 B2B - Empresas y Corporativo:')
    console.log('• Logo + Texto Corporativo: Ideal para uniformes, eventos empresariales')
    console.log('• Plantillas con espacios para logos y branding corporativo')
    console.log('• Diseños profesionales y sobrios')

    console.log('\n🎉 B2C - Eventos Personales:')
    console.log('• Bodas: Diseños elegantes y románticos')
    console.log('• Cumpleaños: Templates coloridos y divertidos')
    console.log('• Graduaciones: Formales y académicos')

    console.log('\n💪 Nicho - Fitness y Deporte:')
    console.log('• Motivacional Fitness: Frases inspiradoras')
    console.log('• Diseños para gimnasios, equipos deportivos')
    console.log('• Tipografías fuertes y colores energéticos')

    console.log('\n🛠️  CÓMO USAR LAS PLANTILLAS:')
    console.log('1. 👥 Cliente accede al editor de personalización')
    console.log('2. 🎨 Selecciona una plantilla como punto de partida')
    console.log('3. ✏️  Modifica textos, colores y elementos')
    console.log('4. 👀 Previsualiza en tiempo real')
    console.log('5. 🛒 Añade al carrito con su diseño personalizado')

    console.log('\n📈 ESTRATEGIA DE PRECIOS:')
    console.log('• 🆓 Plantillas básicas: Gratuitas para atraer clientes')
    console.log('• ⭐ Plantillas premium: €2.99 para diseños elaborados')
    console.log('• 🎯 Freemium: Acceso básico gratis, avanzado de pago')

    console.log('\n🔗 URLs para acceder:')
    console.log('• Admin: /admin/personalizacion/templates')
    console.log('• Crear nueva: /admin/personalizacion/templates/nueva')
    console.log('• Editor público: /editor/[productId] (usa plantillas)')

    console.log('\n✨ PRÓXIMAS MEJORAS SUGERIDAS:')
    console.log('• 🖼️  Integración con banco de imágenes stock')
    console.log('• 🤖 IA para generar plantillas automáticamente')
    console.log('• 👥 Plantillas colaborativas entre usuarios')
    console.log('• 📊 Analytics detallado por plantilla')
    console.log('• 🔄 Sistema de versiones de plantillas')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

showTemplatesExamples()