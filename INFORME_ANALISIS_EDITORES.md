# INFORME DE ANÁLISIS DE EDITORES - LOVILIKE
## Análisis Detallado para Unificación de Código

**Fecha:** 19 de Noviembre de 2025
**Propósito:** Evaluar la posibilidad de unificar los editores en un solo componente modular

---

## 📊 RESUMEN EJECUTIVO

El proyecto Lovilike actualmente tiene **13 editores activos** que se pueden clasificar en **4 categorías principales**:

1. **Editores de Personalización** (3) - 12,611 líneas
2. **Editores de Menú/Navegación** (3) - 1,367 líneas
3. **Editores de Módulos de Contenido** (5) - 2,260 líneas
4. **Editor de Productos** (1) - 685 líneas
5. **Contextos/Utilidades** (1) - TemplateEditorContext

**Total: ~17,000 líneas de código en editores**

---

## 🎯 CATEGORÍA 1: EDITORES DE PERSONALIZACIÓN (CANVAS)

Estos son los editores más complejos y con mayor potencial de unificación.

### 1.1 ZakekeAdvancedEditor
**📍 Ubicación:** `src/components/editor/ZakekeAdvancedEditor.tsx`
**📏 Tamaño:** 5,352 líneas
**👥 Usado por:**
- `src/app/editor/[productId]/page.tsx` - Editor principal clientes
- `src/app/personalizar/[productId]/page.tsx` - Personalización de productos

**🎯 Propósito:** Editor que usan los **clientes finales** para diseñar productos personalizados

**🔧 Props recibidas:**
```typescript
interface ZakekeAdvancedEditorProps {
  productId: string
  sides: ProductSide[]
  variants?: ProductVariant[]
  templateId?: string | null
  onSave: (designData: any) => void
  onDownloadPDF?: () => void
  initialDesign?: any
  isReadOnly?: boolean
  allowPersonalization?: boolean
}
```

**✨ Funcionalidades principales:**
- ✅ Canvas interactivo con Fabric.js
- ✅ Zoom y pan del canvas
- ✅ Selector de variantes del producto (talla, color)
- ✅ Selector de lados del producto (frente, espalda, etc.)
- ✅ Añadir y editar texto (fuentes, colores, tamaños)
- ✅ Subir y posicionar imágenes personalizadas
- ✅ Biblioteca de formas geométricas
- ✅ Biblioteca de clipart/elementos prediseñados
- ✅ Áreas de impresión restringidas (print areas)
- ✅ Cálculo de precios en tiempo real
- ✅ Sistema de capas con ordenamiento
- ✅ Historial (undo/redo)
- ✅ Vista previa del diseño
- ✅ Exportar diseño como JSON/PDF
- ✅ Añadir al carrito con diseño
- ✅ Modo de solo lectura (isReadOnly)
- ✅ Coordenadas relativas para responsividad
- ✅ Transformaciones: rotar, escalar, mover elementos

**🎨 UI Components:**
- Toolbar lateral izquierda (añadir elementos)
- Panel de propiedades derecho (editar elementos seleccionados)
- Canvas central con controles de zoom
- Selector de variantes superior
- Selector de lados/caras del producto
- Botones de acción: Guardar, Descargar, Añadir al carrito

**🔑 Tecnologías clave:**
- Fabric.js para canvas
- Canvas-utils para coordenadas relativas/absolutas
- ImageLibrary component
- ShapesLibrary component
- TemplatePreview component

---

### 1.2 TemplateEditor
**📍 Ubicación:** `src/components/admin/templates/TemplateEditor.tsx`
**📏 Tamaño:** 5,335 líneas
**👥 Usado por:**
- `src/app/(admin)/admin/personalizacion/templates/page.tsx` - Gestión de plantillas

**🎯 Propósito:** Editor **administrativo** para crear y gestionar plantillas de diseño reutilizables

**🔧 Props recibidas:**
```typescript
interface TemplateEditorProps {
  isOpen: boolean
  onClose: () => void
  templateId?: string | null
  onSave?: () => void
}
```

**✨ Funcionalidades principales:**
- ✅ Canvas interactivo con Fabric.js
- ✅ Zoom y pan del canvas
- ✅ Crear plantillas desde cero
- ✅ Añadir y editar texto
- ✅ Añadir imágenes y formas
- ✅ **EXCLUSIVO:** Definir elementos como "editables" o "bloqueados"
- ✅ **EXCLUSIVO:** Sistema de categorización de plantillas
- ✅ **EXCLUSIVO:** Asociar plantillas a productos específicos
- ✅ **EXCLUSIVO:** Control de permisos (público, premium, privado)
- ✅ **EXCLUSIVO:** Definir precios adicionales por plantilla
- ✅ Sistema de capas
- ✅ Historial (undo/redo)
- ✅ Biblioteca de elementos
- ✅ Previsualización de plantilla
- ✅ Exportar/Importar plantillas JSON
- ✅ Coordenadas relativas

**🎨 UI Components:**
- Toolbar lateral (similar a ZakekeAdvancedEditor)
- Panel de propiedades con opciones extendidas
- Canvas central
- **EXTRA:** Panel de configuración de plantilla (nombre, categoría, productos)
- **EXTRA:** Toggle para marcar elementos como "editables"
- **EXTRA:** Configuración de permisos y precios

**🔑 Diferencias clave con ZakekeAdvancedEditor:**
1. No tiene selector de variantes (trabaja con templates genéricos)
2. No tiene cálculo de precios del producto
3. No tiene botón "añadir al carrito"
4. Tiene sistema de permisos y categorización
5. Tiene marcado de elementos editables/bloqueados
6. Modal/Dialog en lugar de página completa

**🔄 Similitudes con ZakekeAdvancedEditor:**
- ~90% del código de canvas es idéntico
- Mismas herramientas de edición
- Mismo sistema de coordenadas
- Misma biblioteca de elementos
- Misma lógica de Fabric.js

---

### 1.3 AreaEditor
**📍 Ubicación:** `src/components/admin/personalization/AreaEditor.tsx`
**📏 Tamaño:** 1,924 líneas
**👥 Usado por:**
- `src/app/(admin)/admin/personalizacion/productos/[id]/page.tsx`
- `src/app/(admin)/admin/personalizacion/productos/[id]/variaciones/page.tsx`

**🎯 Propósito:** Editor **administrativo** para definir áreas de impresión y restricciones en productos

**🔧 Props recibidas:**
```typescript
interface AreaEditorProps {
  isOpen: boolean
  onClose: () => void
  sideImage: string
  sideName: string
  onSave: (areas: PrintArea[], measurementData?: MeasurementData) => Promise<void>
  existingAreas?: PrintArea[]
  existingMeasurementData?: MeasurementData
}
```

**✨ Funcionalidades principales:**
- ✅ Canvas con imagen del producto de fondo
- ✅ **Modo 1: Medición** - Establecer escala pixel/cm
- ✅ **Modo 2: Área** - Dibujar zonas personalizables
- ✅ **Modo 3: Selección** - Modificar áreas existentes
- ✅ Dibujar áreas rectangulares, circulares, elípticas
- ✅ Definir dimensiones reales en cm
- ✅ **EXCLUSIVO:** Sistema de medición con líneas de referencia
- ✅ **EXCLUSIVO:** Cálculo automático de pixeles por cm
- ✅ **EXCLUSIVO:** Tamaños estándar predefinidos (A2, A3, A4, A5)
- ✅ **EXCLUSIVO:** Configurar restricciones por área (texto, imágenes, formas)
- ✅ **EXCLUSIVO:** Definir método de impresión por área
- ✅ **EXCLUSIVO:** Configurar precio base por área
- ✅ Transformaciones: mover, redimensionar, rotar áreas
- ✅ Coordenadas relativas
- ✅ Panel de mediciones con estadísticas

**🎨 UI Components:**
- Selector de modo (Medición / Área / Selección)
- Canvas con overlay de mediciones
- Panel de propiedades de área
- Toolbar con herramientas de forma
- Panel de mediciones
- Botones: Guardar, Cancelar

**🔑 Diferencias clave con otros editores:**
1. No edita elementos (texto, imágenes) - solo define ZONAS
2. Tiene sistema de medición único
3. Trabajo sobre imagen estática (no canvas editable)
4. Enfoque en geometría y restricciones
5. Más simple que los otros 2 editores

**🔄 Similitudes con otros editores:**
- Usa canvas HTML5
- Sistema de coordenadas relativas
- Transformaciones geométricas
- Panel de propiedades
- Modal/Dialog

---

## 🔍 ANÁLISIS DE CÓDIGO COMPARTIDO EN EDITORES DE PERSONALIZACIÓN

### ✅ Código 100% Duplicado (unificable inmediatamente):

1. **Sistema de coordenadas relativas/absolutas**
   - `relativeToAbsolute()`, `absoluteToRelative()`
   - `scaleImageToCanvas()`, `calculatePrintAreaOnScaledImage()`
   - Ya está en `lib/canvas-utils.ts` - ✅ BIEN

2. **Inicialización de Canvas**
   ```typescript
   // Los 3 editores tienen código casi idéntico para:
   - Crear canvas HTML
   - Establecer dimensiones
   - Cargar imagen de fondo
   - Configurar zoom/pan
   ```

3. **Sistema de transformaciones**
   ```typescript
   // Lógica de drag, resize, rotate es idéntica:
   - Mouse down/move/up handlers
   - Cálculo de deltas
   - Aplicación de transformaciones
   ```

4. **Toolbar de herramientas**
   - Botones: Texto, Imagen, Formas, etc.
   - Solo cambian qué herramientas están visibles

5. **Panel de propiedades**
   - Inputs para posición, tamaño, rotación
   - Color pickers
   - Sliders de opacidad
   - Solo difieren en campos específicos

6. **Bibliotecas de recursos**
   - ImageLibrary component - compartido
   - ShapesLibrary component - compartido
   - ElementsLibrary component - compartido

### ⚠️ Código Parcialmente Duplicado (necesita refactoring):

1. **Historial (Undo/Redo)**
   - ZakekeAdvancedEditor: Implementado
   - TemplateEditor: Implementado
   - AreaEditor: NO tiene
   - 📝 Se puede unificar con un hook `useHistory()`

2. **Gestión de elementos/capas**
   - ZakekeAdvancedEditor: Sistema complejo de capas
   - TemplateEditor: Sistema complejo de capas
   - AreaEditor: Sistema simple de áreas
   - 📝 Se puede abstraer con `useLayerManager()`

3. **Serialización/Exportación**
   - Todos exportan a JSON con estructura similar
   - Pequeñas diferencias en campos
   - 📝 Se puede unificar con `useSerializer()`

---

## 🧩 CATEGORÍA 2: EDITORES DE MENÚ/NAVEGACIÓN

### 2.1 DynamicMenuEditor
**📍 Ubicación:** `src/components/admin/content/DynamicMenuEditor.tsx`
**📏 Tamaño:** 1,122 líneas

**🎯 Propósito:** Editor completo de menús de navegación con drag-drop, jerarquía, iconos

**✨ Funcionalidades:**
- ✅ Gestión de múltiples menús (header, footer, sidebar)
- ✅ Drag & drop para reordenar items
- ✅ Menús jerárquicos (padres e hijos)
- ✅ Configuración de enlaces (categorías, productos, páginas, externos)
- ✅ Iconos para items
- ✅ Badges/etiquetas
- ✅ Activar/desactivar items
- ✅ Vista previa en vivo
- ✅ Target (_blank, _self)

### 2.2 MenuEditor
**📍 Ubicación:** `src/components/admin/content/MenuEditor.tsx`
**📏 Tamaño:** 245 líneas

**🎯 Propósito:** Wrapper simplificado que usa DragDropMenuEditor

**⚠️ OBSERVACIÓN:** Este componente parece ser un wrapper legacy. El 90% de la funcionalidad está en DragDropMenuEditor.

**💡 RECOMENDACIÓN:** Considerar eliminar MenuEditor y usar DynamicMenuEditor directamente.

### 2.3 DragDropMenuEditor
**📍 Ubicación:** `src/components/admin/content/DragDropMenuEditor.tsx`

**⚠️ OBSERVACIÓN:** Este archivo es importado por MenuEditor pero no lo encontré en el análisis inicial.

---

## 🎨 CATEGORÍA 3: EDITORES DE MÓDULOS DE CONTENIDO

Estos son editores más pequeños y especializados para gestionar módulos individuales de páginas.

### 3.1 HeroBannerEditor
**📏 Tamaño:** 364 líneas

**✨ Funcionalidades:**
- Subir imagen de fondo
- Editar título y subtítulo
- Configurar botón CTA (texto, link, estilo)
- Altura del banner (small, medium, large, full)
- Alineación del texto
- Overlay oscuro (slider 0-100%)
- Color del texto
- Mostrar/ocultar botón

### 3.2 RichTextEditor
**📏 Tamaño:** 276 líneas

**✨ Funcionalidades:**
- Editor de texto HTML
- Alineación (left, center, right)
- Tamaño de fuente (sm, base, lg, xl)
- Color de fondo
- Color de texto
- Padding (small, medium, large)
- Ancho máximo (none, sm, md, lg, xl)

### 3.3 FeaturedProductsEditor
**📏 Tamaño:** 511 líneas

**✨ Funcionalidades:**
- Seleccionar productos destacados
- Ordenar productos
- Límite de productos a mostrar
- Título de la sección
- Estilo de visualización (grid, carousel)
- Items por fila

### 3.4 FeaturedCategoriesEditor
**📏 Tamaño:** 466 líneas

**✨ Funcionalidades:**
- Seleccionar categorías destacadas
- Ordenar categorías
- Mostrar descripción
- Mostrar contador de productos
- Estilo de visualización

### 3.5 TestimonialsEditor
**📏 Tamaño:** 643 líneas

**✨ Funcionalidades:**
- Añadir/editar testimonios
- Nombre, cargo, empresa del autor
- Foto del autor
- Rating (estrellas)
- Texto del testimonio
- Mostrar/ocultar foto
- Estilo del testimonio (card, quote, minimal)

**🔍 ANÁLISIS DE EDITORES DE MÓDULOS:**

**✅ Código compartido:**
- Todos usan el mismo patrón: `props` + `onUpdate()`
- Todos tienen vista previa
- Todos tienen configuración de estilos

**💡 POTENCIAL DE UNIFICACIÓN:**
- Son muy específicos, difícil de unificar
- PERO se puede crear un sistema de "Field Builders" reutilizables:
  - `ImageUploadField`
  - `ColorPickerField`
  - `AlignmentSelector`
  - `SizeSelector`
  - `TextAreaField`
  - Etc.

---

## 📦 CATEGORÍA 4: EDITOR DE PRODUCTOS

### 4.1 GeneralProductEditor
**📍 Ubicación:** `src/components/admin/products/GeneralProductEditor.tsx`
**📏 Tamaño:** 685 líneas

**🎯 Propósito:** Editor de información general del producto (NO personalización)

**✨ Funcionalidades:**
- Editar nombre, SKU, slug
- Descripción
- Precios (base, comparación, costo)
- Peso y dimensiones
- Tipo de material
- Stock y control de inventario
- SEO (meta title, meta description)
- Tags
- Activar/desactivar producto
- Featured / Top selling
- Asignar categorías

**🔑 Diferencia importante:** Este NO es un editor de canvas. Es un formulario tradicional.

---

## 📋 MATRIZ DE COMPARACIÓN DE EDITORES PRINCIPALES

| Característica | ZakekeAdvancedEditor | TemplateEditor | AreaEditor |
|----------------|----------------------|----------------|------------|
| **Tipo** | Canvas Cliente | Canvas Admin | Canvas Admin |
| **Fabric.js** | ✅ Sí | ✅ Sí | ❌ Canvas nativo |
| **Líneas** | 5,352 | 5,335 | 1,924 |
| **Añadir texto** | ✅ | ✅ | ❌ |
| **Añadir imágenes** | ✅ | ✅ | ❌ |
| **Añadir formas** | ✅ | ✅ | ✅ Solo áreas |
| **Sistema de capas** | ✅ | ✅ | ✅ Simple |
| **Undo/Redo** | ✅ | ✅ | ❌ |
| **Zoom/Pan** | ✅ | ✅ | ✅ |
| **Coordenadas relativas** | ✅ | ✅ | ✅ |
| **Selector de variantes** | ✅ | ❌ | ❌ |
| **Selector de lados** | ✅ | ❌ | ❌ |
| **Áreas de impresión** | ✅ Usa | ❌ | ✅ Define |
| **Elementos editables** | N/A | ✅ | N/A |
| **Categorización** | N/A | ✅ | N/A |
| **Permisos** | N/A | ✅ | N/A |
| **Sistema de medición** | ❌ | ❌ | ✅ |
| **Cálculo de precios** | ✅ | ❌ | ❌ |
| **Añadir al carrito** | ✅ | ❌ | ❌ |
| **Modal vs Página** | Página | Modal | Modal |

---

## 🎯 PROPUESTA DE UNIFICACIÓN

### 🏗️ ARQUITECTURA PROPUESTA: UnifiedCanvasEditor

```typescript
<UnifiedCanvasEditor
  mode="customer" | "template" | "area"

  // Props comunes
  productId={productId}
  sideImage={sideImage}
  onSave={handleSave}

  // Props condicionales según modo
  {...(mode === 'customer' && {
    variants: variants,
    templateId: templateId,
    allowPersonalization: true,
    showCart: true,
    showPricing: true
  })}

  {...(mode === 'template' && {
    showTemplateConfig: true,
    allowLockElements: true,
    showPermissions: true
  })}

  {...(mode === 'area' && {
    showMeasurement: true,
    showAreaRestrictions: true,
    showPrintingMethods: true
  })}
/>
```

### 📦 ESTRUCTURA MODULAR PROPUESTA:

```
src/components/unified-editor/
├── UnifiedCanvasEditor.tsx          # Componente principal
├── core/
│   ├── useCanvasCore.ts            # Canvas init, zoom, pan
│   ├── useElementManager.ts        # Gestión de elementos
│   ├── useHistory.ts               # Undo/Redo
│   ├── useCoordinates.ts           # Sistema de coordenadas
│   └── useTransforms.ts            # Drag, resize, rotate
├── modes/
│   ├── CustomerMode.tsx            # Lógica específica cliente
│   ├── TemplateMode.tsx            # Lógica específica templates
│   └── AreaMode.tsx                # Lógica específica áreas
├── ui/
│   ├── Toolbar/
│   │   ├── ToolbarContainer.tsx
│   │   ├── TextTool.tsx
│   │   ├── ImageTool.tsx
│   │   ├── ShapeTool.tsx
│   │   └── AreaTool.tsx
│   ├── Panels/
│   │   ├── PropertiesPanel.tsx
│   │   ├── LayersPanel.tsx
│   │   ├── TemplateConfigPanel.tsx
│   │   ├── AreaConfigPanel.tsx
│   │   └── MeasurementPanel.tsx
│   └── Canvas/
│       ├── CanvasContainer.tsx
│       ├── CanvasControls.tsx
│       └── CanvasOverlay.tsx
├── libraries/
│   ├── ImageLibrary.tsx            # Ya existe - reutilizar
│   ├── ShapesLibrary.tsx           # Ya existe - reutilizar
│   └── ElementsLibrary.tsx         # Ya existe - reutilizar
└── utils/
    ├── serializer.ts               # Exportar/Importar JSON
    ├── pricing.ts                  # Cálculos de precio
    └── validation.ts               # Validaciones
```

### 🔧 HOOKS REUTILIZABLES:

```typescript
// useCanvasCore.ts - Inicialización y gestión básica
const { canvas, isReady, zoom, pan } = useCanvasCore({
  canvasRef,
  backgroundImage,
  size: STANDARD_CANVAS_SIZE
})

// useElementManager.ts - Gestión de elementos
const {
  elements,
  addElement,
  updateElement,
  deleteElement,
  selectedElement,
  selectElement
} = useElementManager({ canvas, mode })

// useHistory.ts - Undo/Redo
const { undo, redo, canUndo, canRedo, recordState } = useHistory({
  maxHistory: 50
})

// useTransforms.ts - Transformaciones
const {
  startDrag,
  startResize,
  startRotate,
  applyTransform
} = useTransforms({ canvas, selectedElement })

// useAreaMeasurement.ts - Solo para modo 'area'
const {
  pixelsPerCm,
  measurementLines,
  startMeasurement,
  finalizeMeasurement
} = useAreaMeasurement({ canvas })

// useTemplateConfig.ts - Solo para modo 'template'
const {
  templateName,
  category,
  permissions,
  lockableElements,
  toggleLock
} = useTemplateConfig({ templateId })
```

---

## 📊 ANÁLISIS DE VIABILIDAD

### ✅ VENTAJAS DE UNIFICAR:

1. **Reducción de código:** De ~12,600 líneas a ~6,000 líneas estimadas (-50%)
2. **Mantenimiento:** Un solo lugar para bugs y mejoras
3. **Consistencia:** UI/UX idéntica en todos los modos
4. **Testing:** Tests unitarios reutilizables
5. **Performance:** Código optimizado compartido
6. **Nuevas características:** Se añaden automáticamente a todos los modos
7. **Onboarding:** Desarrolladores aprenden un solo sistema

### ⚠️ DESVENTAJAS/RIESGOS:

1. **Tiempo inicial:** 2-3 semanas de refactoring intenso
2. **Riesgo de regresión:** Puede introducir bugs en funcionalidad existente
3. **Complejidad inicial:** El componente unificado será complejo al principio
4. **Testing exhaustivo:** Requiere probar los 3 modos a fondo
5. **Curva de aprendizaje:** Nuevos patrones para el equipo

### 📈 ESFUERZO ESTIMADO:

| Fase | Duración | Descripción |
|------|----------|-------------|
| **1. Extracción de hooks** | 3-4 días | Crear hooks reutilizables |
| **2. UI Components** | 4-5 días | Modularizar Toolbar, Panels, Canvas |
| **3. Modo Customer** | 2-3 días | Migrar ZakekeAdvancedEditor |
| **4. Modo Template** | 2-3 días | Migrar TemplateEditor |
| **5. Modo Area** | 2-3 días | Migrar AreaEditor |
| **6. Testing** | 3-4 días | Tests exhaustivos de los 3 modos |
| **7. Refactoring** | 2-3 días | Optimizaciones y limpieza |
| **TOTAL** | **18-25 días** | **~3-5 semanas** |

---

## 🚦 RECOMENDACIÓN FINAL

### 💚 RECOMENDACIÓN: SÍ, UNIFICAR

**Razones:**

1. **Alto código duplicado (90%+):** Los 3 editores de canvas comparten la gran mayoría del código
2. **Mantenimiento insostenible:** Cada bug requiere 3 fixes, cada feature 3 implementaciones
3. **Proyecto en crecimiento:** A futuro habrá más editores, mejor sentar bases ahora
4. **ROI positivo:** 3-5 semanas de inversión vs. ahorro continuo de tiempo

### 📋 PLAN DE ACCIÓN SUGERIDO:

#### FASE 1: PREPARACIÓN (ACTUAL)
✅ Análisis completado
⬜ Aprobación del plan por el equipo
⬜ Backup/branch del código actual
⬜ Crear issues/tickets en GitHub

#### FASE 2: REFACTORING INCREMENTAL
1. **Semana 1:** Extraer hooks compartidos (no rompe nada)
2. **Semana 2:** Modularizar UI components (no rompe nada)
3. **Semana 3:** Crear UnifiedCanvasEditor modo 'customer'
4. **Semana 4:** Añadir modos 'template' y 'area'
5. **Semana 5:** Testing, bugfixing, optimización

#### FASE 3: MIGRACIÓN
- Reemplazar imports uno por uno
- Mantener archivos viejos hasta confirmar que todo funciona
- Eliminar código legacy

#### FASE 4: DOCUMENTACIÓN
- Documentar el nuevo sistema
- Crear guías de uso para desarrolladores
- Ejemplos de cómo añadir nuevos modos

---

## 🔍 ANÁLISIS SECUNDARIO: OTROS EDITORES

### 📱 Editores de Módulos

**RECOMENDACIÓN:** NO unificar, pero SÍ crear componentes field reutilizables

**Plan:**
1. Crear biblioteca de `EditorFields`:
   - `<ImageUploadField />`
   - `<ColorPickerField />`
   - `<AlignmentField />`
   - `<TextInputField />`
   - `<SliderField />`
   - Etc.

2. Refactorizar cada editor para usar estos fields

**Beneficio:** Menos duplicación, más consistencia, sin complejidad de unificación completa

### 🍔 Editores de Menú

**RECOMENDACIÓN:** Eliminar `MenuEditor.tsx`, quedarse solo con `DynamicMenuEditor.tsx`

**Razón:** MenuEditor es solo un wrapper delgado sin valor añadido

---

## 📝 NOTAS ADICIONALES

### Archivos relacionados encontrados:

**Componentes de soporte para AreaEditor:**
- `src/components/admin/personalization/components/AreaCanvas.tsx`
- `src/components/admin/personalization/components/AreaPropertiesPanel.tsx`
- `src/components/admin/personalization/components/AreaToolbar.tsx`
- `src/components/admin/personalization/components/MeasurementPanel.tsx`

**Componentes de soporte para TemplateEditor:**
- `src/components/admin/templates/editor/components/PropertiesPanel.tsx`
- `src/components/admin/templates/editor/components/TemplateCanvas.tsx`
- `src/components/admin/templates/editor/components/TemplateToolbar.tsx`
- `src/components/admin/templates/editor/context/TemplateEditorContext.tsx`

**OBSERVACIÓN:** TemplateEditor ya tiene una estructura más modular con componentes separados. Esta puede ser la base para el UnifiedEditor.

---

## 📚 RECURSOS ÚTILES

- Documentación Fabric.js: https://fabricjs.com/docs/
- Canvas Utils existente: `src/lib/canvas-utils.ts`
- Patrones de composición React: https://reactjs.org/docs/composition-vs-inheritance.html
- Custom Hooks guide: https://react.dev/learn/reusing-logic-with-custom-hooks

---

## 🎓 CONCLUSIONES

1. **Los 3 editores de canvas (ZakekeAdvancedEditor, TemplateEditor, AreaEditor) tienen ~90% de código duplicado**
2. **Unificarlos en UnifiedCanvasEditor es técnicamente viable y altamente beneficioso**
3. **El esfuerzo estimado es de 3-5 semanas pero el ROI es muy positivo**
4. **Los editores de módulos NO deben unificarse pero SÍ usar componentes field compartidos**
5. **MenuEditor debe eliminarse en favor de DynamicMenuEditor**
6. **GeneralProductEditor es independiente y no requiere cambios**

**Total de líneas que se pueden reducir con todas las optimizaciones: ~7,000 líneas (-40%)**

---

**Próximos pasos:** Esperar aprobación para proceder con el plan de refactoring.

