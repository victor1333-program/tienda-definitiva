# 🎨 Sistema Inteligente de Personalización

## Problema Actual
- Cada variante requiere configurar sus propias áreas de personalización
- Para productos como camisetas, las áreas son idénticas (solo cambia el color del mockup)
- Proceso manual repetitivo e ineficiente

## Solución Propuesta: Áreas Compartidas + Templates

### 1. Estructura de Mockups Jerarquizada

```
Personalization (Producto)
├── Base Template (areas comunes)
│   ├── Área "Pecho" (300x200px)
│   ├── Área "Espalda" (300x300px)
│   └── Área "Manga" (100x150px)
└── Variant Mockups (imágenes específicas)
    ├── Mockup Rojo (hereda áreas del template)
    ├── Mockup Azul (hereda áreas del template)
    └── Mockup Verde (hereda áreas del template)
```

### 2. Flujo de Trabajo Optimizado

#### Paso 1: Configurar Template Base
- Crear UNA sola vez las áreas de personalización en un "mockup base"
- Definir posiciones, tamaños, restricciones y precios

#### Paso 2: Aplicar a Variantes
- Subir imagen de mockup para cada variante
- El sistema aplica automáticamente las áreas del template
- Ajuste automático si las dimensiones de imagen varían

#### Paso 3: Personalización por Variante (Opcional)
- Si una variante específica necesita ajustes únicos
- Permitir override de áreas específicas

### 3. Implementación Técnica

#### 3.1 Cambios en la Base de Datos

```sql
-- Nuevo modelo para templates de personalización
PersonalizationTemplate {
  id: String @id
  personalizationId: String
  name: String -- "Template Base Camiseta"
  description: String?
  isDefault: Boolean @default(false)
  templateAreas: PersonalizationTemplateArea[]
}

-- Áreas del template (independientes de mockups específicos)
PersonalizationTemplateArea {
  id: String @id
  templateId: String
  name: String -- "Pecho", "Espalda", etc.
  description: String?
  xPercent: Float -- Posición como % (0-100)
  yPercent: Float -- Posición como % (0-100)
  widthPercent: Float -- Ancho como % (0-100)
  heightPercent: Float -- Alto como % (0-100)
  allowText: Boolean
  allowImages: Boolean
  maxElements: Int
  extraCost: Float
  pricePerColor: Float?
  maxPrintWidth: Float?
  maxPrintHeight: Float?
}

-- Los mockups ahora referencian un template
PersonalizationMockup {
  -- campos existentes...
  templateId: String? -- Referencia al template
  useTemplate: Boolean @default(true)
  customAreas: PersonalizationArea[] -- Solo si override específico
}
```

#### 3.2 Lógica de Herencia

```typescript
const getEffectiveAreas = (mockup: PersonalizationMockup) => {
  if (!mockup.useTemplate || !mockup.templateId) {
    return mockup.customAreas
  }
  
  // Heredar del template y convertir porcentajes a píxeles
  const template = await getTemplate(mockup.templateId)
  const mockupDimensions = await getImageDimensions(mockup.mockupImage)
  
  return template.templateAreas.map(templateArea => ({
    ...templateArea,
    x: (templateArea.xPercent / 100) * mockupDimensions.width,
    y: (templateArea.yPercent / 100) * mockupDimensions.height,
    width: (templateArea.widthPercent / 100) * mockupDimensions.width,
    height: (templateArea.heightPercent / 100) * mockupDimensions.height,
  }))
}
```

### 4. Interfaz de Usuario

#### 4.1 Configuración de Template Base
```
┌─ Configurar Personalización ────────────────────┐
│                                                │
│ 🎯 Template Base                               │
│ ┌─────────────────────────────────────────────┐ │
│ │   [Imagen de referencia - camiseta blanca]  │ │
│ │                                             │ │
│ │     ┌─────┐ ← Área "Pecho"                 │ │
│ │     │     │   300x200px                     │ │
│ │     └─────┘   €2 por color                  │ │
│ │                                             │ │
│ │           ┌─────────┐ ← Área "Espalda"     │ │
│ │           │         │   300x300px           │ │
│ │           └─────────┘   €3 por color       │ │
│ └─────────────────────────────────────────────┘ │
│                                                │
│ [+ Agregar Área] [Guardar Template]           │
└────────────────────────────────────────────────┘
```

#### 4.2 Aplicación a Variantes
```
┌─ Mockups por Variante ──────────────────────────┐
│                                                │
│ 📁 Template: "Camiseta Básica" ✅ Aplicado    │
│                                                │
│ ┌─ Rojo ─────┐ ┌─ Azul ─────┐ ┌─ Verde ────┐  │
│ │ [IMG_ROJA] │ │ [IMG_AZUL] │ │ [IMG_VERDE] │  │
│ │ ✅ 3 áreas │ │ ✅ 3 áreas │ │ ✅ 3 áreas │  │
│ │ heredadas  │ │ heredadas  │ │ heredadas  │  │
│ └────────────┘ └────────────┘ └─────────────┘  │
│                                                │
│ [+ Agregar Variante] [Editar Template]        │
└────────────────────────────────────────────────┘
```

### 5. Beneficios

✅ **Eficiencia**: Configurar áreas una sola vez
✅ **Consistencia**: Todas las variantes tienen las mismas áreas
✅ **Escalabilidad**: Fácil agregar nuevas variantes
✅ **Flexibilidad**: Permitir overrides cuando sea necesario
✅ **Mantenimiento**: Cambios en template se propagan automáticamente

### 6. Casos de Uso

#### Caso 1: Camiseta Simple
- 1 template base con 2 áreas (pecho, espalda)
- 10 variantes de colores → Automáticamente heredan las áreas

#### Caso 2: Camiseta + Variante Especial
- Template base con áreas estándar
- 9 variantes normales → Heredan del template
- 1 variante premium → Override custom con área adicional en manga

#### Caso 3: Producto Completamente Diferente
- Cada variante tiene mockup completamente diferente
- No usar template → Configurar áreas individualmente

### 7. Migración

1. **Fase 1**: Implementar nuevos modelos
2. **Fase 2**: Crear interfaz de templates
3. **Fase 3**: Migrar personalizaciones existentes
4. **Fase 4**: Activar sistema para productos nuevos