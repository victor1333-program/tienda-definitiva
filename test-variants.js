// Script para probar el guardado de variantes
const testVariantSaving = async () => {
  console.log('🧪 Probando guardado de variantes...')
  
  const testData = {
    groups: [
      {
        id: "test-size-group",
        name: "Tallas",
        type: "size",
        options: [
          { id: "s", name: "S", value: "S" },
          { id: "m", name: "M", value: "M" },
          { id: "l", name: "L", value: "L" }
        ]
      },
      {
        id: "test-color-group", 
        name: "Colores",
        type: "color",
        options: [
          { id: "black", name: "Negro", value: "Negro", colorHex: "#000000" },
          { id: "white", name: "Blanco", value: "Blanco", colorHex: "#FFFFFF" }
        ]
      }
    ],
    combinations: [
      {
        id: "s-black",
        groupCombinations: [
          { groupId: "test-size-group", optionId: "s" },
          { groupId: "test-color-group", optionId: "black" }
        ],
        sku: "TEST-S-BLACK",
        stock: 10,
        price: 25.99,
        isActive: true,
        displayName: "S - Negro"
      },
      {
        id: "m-white",
        groupCombinations: [
          { groupId: "test-size-group", optionId: "m" },
          { groupId: "test-color-group", optionId: "white" }
        ],
        sku: "TEST-M-WHITE",
        stock: 15,
        price: 25.99,
        isActive: true,
        displayName: "M - Blanco"
      }
    ]
  }

  try {
    const response = await fetch('http://localhost:3001/api/products/cm5yiujpj0002tjqolv3q0eoh/variants', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=YOUR_SESSION_TOKEN_HERE' // Necesitarás reemplazar esto
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Variantes guardadas exitosamente:', result)
    } else {
      console.log('❌ Error al guardar variantes:', result)
    }
  } catch (error) {
    console.error('❌ Error en la petición:', error)
  }
}

testVariantSaving()