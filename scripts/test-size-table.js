// Test script para verificar generateSizeTableData

const mockVariantGroups = [
  {
    "name": "TALLA",
    "type": "size",
    "id": "1751838715240_eaaqc74ay",
    "options": [
      {
        "name": "XS",
        "value": "xs",
        "colorHex": "#000000",
        "measurements": {
          "width": 12,
          "length": 13
        },
        "id": "1751838728261_b98k3qknu"
      },
      {
        "name": "S", 
        "value": "s",
        "colorHex": "#000000",
        "measurements": {
          "width": 13,
          "length": 14
        },
        "id": "1751838736378_2tgn4wyhz"
      },
      {
        "name": "M",
        "value": "m", 
        "colorHex": "#000000",
        "measurements": {
          "width": 14,
          "length": 15
        },
        "id": "1751838746176_y4ch1ux0j"
      }
    ],
    "showSizeTable": true
  }
]

// Función copiada de AdvancedVariantsManager 
const generateSizeTableData = (groups) => {
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

console.log('🧪 Probando generateSizeTableData...')
const result = generateSizeTableData(mockVariantGroups)
console.log('📊 Resultado:', JSON.stringify(result, null, 2))

console.log('\n📋 Resultado esperado:')
console.log('- Grupo: TALLA')
console.log('- XS: 12×13 cm')
console.log('- S: 13×14 cm') 
console.log('- M: 14×15 cm')