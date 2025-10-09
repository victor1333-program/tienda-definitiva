const fetch = require('node-fetch')

async function testApiResponse() {
  try {
    console.log('🔍 Probando API response...')
    
    const response = await fetch('http://localhost:3000/api/products/public/cmcs6wd190000jguqbjbs109c?include=variants,reviews,category,personalization')
    const data = await response.json()
    
    console.log('📦 Producto:', data.name)
    console.log('🎨 Personalizable:', data.isPersonalizable)
    console.log('📋 Variant Groups Config:', data.variantGroupsConfig ? 'SÍ' : 'NO')
    
    if (data.variantGroupsConfig) {
      const sizeGroups = data.variantGroupsConfig.filter(g => g.type === 'size' && g.showSizeTable)
      console.log('📏 Grupos de tallas encontrados:', sizeGroups.length)
      
      sizeGroups.forEach(group => {
        console.log(`\n📊 Grupo: ${group.name}`)
        group.options.forEach(option => {
          if (option.measurements) {
            console.log(`  ${option.name}: ${option.measurements.width}×${option.measurements.length}cm`)
          }
        })
      })
    }
    
    console.log('\n🧪 Simulando generateSizeTableData...')
    const mockGenerateSizeTableData = (groups) => {
      return groups
        .filter(group => group.type === 'size' && group.showSizeTable)
        .map(group => ({
          groupName: group.name,
          sizes: group.options
            .filter(option => option.measurements?.width || option.measurements?.length)
            .map(option => ({
              name: option.name,
              width: option.measurements?.width,
              length: option.measurements?.length
            }))
        }))
        .filter(table => table.sizes.length > 0)
    }
    
    if (data.variantGroupsConfig) {
      const sizeTableData = mockGenerateSizeTableData(data.variantGroupsConfig)
      console.log('📋 Resultado SizeTableData:', JSON.stringify(sizeTableData, null, 2))
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testApiResponse()