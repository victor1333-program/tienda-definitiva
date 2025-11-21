# PROPUESTA DE ARQUITECTURA: EDITOR UNIFICADO

**Proyecto:** Lovilike
**Fecha:** 2025-11-20
**Autor:** Análisis Claude Code
**Versión:** 1.0

---

## ÍNDICE

1. [Visión General](#visión-general)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Configuraciones](#configuraciones)
4. [Hooks Principales](#hooks-principales)
5. [Componentes](#componentes)
6. [Sistema de Tipos](#sistema-de-tipos)
7. [Plan de Implementación](#plan-de-implementación)
8. [Ejemplos de Uso](#ejemplos-de-uso)

---

## VISIÓN GENERAL

### Objetivo

Crear un **editor universal** que reemplace los tres editores existentes:
- ZakekeAdvancedEditor
- TemplateEditor
- AreaEditor

### Principios de Diseño

1. **Configuración sobre Código** - El comportamiento se define por configuración, no por código condicional
2. **Composición** - Componentes pequeños y reutilizables
3. **Type Safety** - TypeScript en todo el código
4. **Performance** - Code splitting y lazy loading
5. **Extensibilidad** - Fácil agregar nuevas funcionalidades

---

## ESTRUCTURA DE ARCHIVOS

```
src/components/UniversalEditor/
│
├── index.tsx                           # Export principal
├── UniversalEditor.tsx                 # Componente raíz
├── README.md                           # Documentación
│
├── configs/
│   ├── index.ts                        # Export de configs
│   ├── customer.config.ts              # Config para clientes
│   ├── template.config.ts              # Config para plantillas
│   ├── area.config.ts                  # Config para áreas
│   └── types.ts                        # Tipos de configuración
│
├── context/
│   ├── EditorContext.tsx               # Contexto principal
│   └── types.ts                        # Tipos del contexto
│
├── hooks/
│   ├── useEditorCore.ts                # Hook central del editor
│   ├── useCanvas.ts                    # Gestión del canvas
│   ├── useFabricCanvas.ts              # Canvas con Fabric.js
│   ├── useNativeCanvas.ts              # Canvas 2D nativo
│   ├── useCoordinates.ts               # Sistema de coordenadas
│   ├── useHistory.ts                   # Undo/Redo
│   ├── useZoom.ts                      # Control de zoom
│   ├── useMeasurement.ts               # Sistema de medición
│   ├── usePermissions.ts               # Sistema de permisos
│   ├── useElements.ts                  # Gestión de elementos
│   ├── useSelection.ts                 # Selección de elementos
│   └── useTransform.ts                 # Transformaciones
│
├── components/
│   ├── Canvas/
│   │   ├── CanvasWrapper.tsx           # Wrapper que decide qué canvas usar
│   │   ├── FabricCanvas.tsx            # Canvas con Fabric.js
│   │   ├── NativeCanvas.tsx            # Canvas 2D nativo
│   │   └── CanvasControls.tsx          # Controles sobre el canvas
│   │
│   ├── Toolbar/
│   │   ├── MainToolbar.tsx             # Barra de herramientas principal
│   │   ├── ToolButton.tsx              # Botón de herramienta
│   │   ├── ToolGroup.tsx               # Grupo de herramientas
│   │   ├── ZoomControls.tsx            # Controles de zoom
│   │   └── HistoryControls.tsx         # Undo/Redo
│   │
│   ├── Panels/
│   │   ├── LeftPanel/
│   │   │   ├── index.tsx               # Panel izquierdo
│   │   │   ├── DesignPanel.tsx         # Panel de diseño
│   │   │   ├── LayersPanel.tsx         # Lista de capas
│   │   │   ├── LayerItem.tsx           # Item de capa
│   │   │   ├── ImageLibrary.tsx        # Biblioteca de imágenes
│   │   │   ├── ShapesLibrary.tsx       # Biblioteca de formas
│   │   │   ├── MeasurementPanel.tsx    # Panel de medición
│   │   │   ├── TemplateSelector.tsx    # Selector de plantillas
│   │   │   └── VariantSelector.tsx     # Selector de variantes
│   │   │
│   │   └── RightPanel/
│   │       ├── index.tsx               # Panel derecho
│   │       ├── PropertiesPanel.tsx     # Panel de propiedades
│   │       ├── TextProperties.tsx      # Propiedades de texto
│   │       ├── ImageProperties.tsx     # Propiedades de imagen
│   │       ├── ShapeProperties.tsx     # Propiedades de forma
│   │       ├── AreaProperties.tsx      # Propiedades de área
│   │       └── PermissionsPanel.tsx    # Panel de permisos
│   │
│   ├── Elements/
│   │   ├── TextElement.tsx             # Elemento de texto
│   │   ├── ImageElement.tsx            # Elemento de imagen
│   │   ├── ShapeElement.tsx            # Elemento de forma
│   │   └── AreaElement.tsx             # Elemento de área
│   │
│   └── UI/
│       ├── Modal.tsx                   # Modal genérico
│       ├── PropertyField.tsx           # Campo de propiedad
│       ├── ColorPicker.tsx             # Selector de color
│       └── FontPicker.tsx              # Selector de fuente
│
├── utils/
│   ├── validation.ts                   # Validaciones
│   ├── conversion.ts                   # Conversiones de datos
│   ├── export.ts                       # Exportación de datos
│   └── import.ts                       # Importación de datos
│
├── types/
│   ├── index.ts                        # Export de tipos
│   ├── config.ts                       # Tipos de configuración
│   ├── elements.ts                     # Tipos de elementos
│   ├── canvas.ts                       # Tipos de canvas
│   ├── permissions.ts                  # Tipos de permisos
│   └── coordinates.ts                  # Tipos de coordenadas
│
└── styles/
    └── UniversalEditor.css             # Estilos del editor
```

---

## CONFIGURACIONES

### Archivo: `configs/types.ts`

```typescript
export type EditorMode = 'customer' | 'template' | 'area'

export interface EditorConfig {
  mode: EditorMode
  features: EditorFeatures
  ui: UIConfig
  canvas: CanvasConfig
  permissions?: PermissionSet
}

export interface EditorFeatures {
  // Elementos
  elements: {
    text: boolean
    image: boolean
    shape: boolean
    area: boolean
  }

  // Herramientas
  tools: {
    zoom: boolean
    undo: boolean
    snap: boolean
    measurement: boolean
    grid: boolean
    rulers: boolean
  }

  // Funcionalidades avanzadas
  advanced: {
    permissions: boolean      // Editar permisos de elementos
    templates: boolean         // Cargar/guardar plantillas
    variants: boolean          // Cambiar variantes de producto
    multiSide: boolean         // Múltiples lados
    sync: boolean              // Sincronización entre lados
    preview: boolean           // Vista previa
    export: boolean            // Exportar diseño
  }

  // Restricciones
  constraints: {
    enforceAreaLimits: boolean  // Restringir a área de impresión
    enableLocking: boolean      // Bloquear elementos
    snapToCenter: boolean       // Snap magnético al centro
    snapToGrid: boolean         // Snap a grid
  }
}

export interface UIConfig {
  layout: 'inline' | 'modal'

  panels: {
    left: {
      show: boolean
      width?: number
      sections: {
        design?: boolean
        layers?: boolean
        images?: boolean
        shapes?: boolean
        measurement?: boolean
        templates?: boolean
        variants?: boolean
      }
    }
    right: {
      show: boolean
      width?: number
      sections: {
        properties?: boolean
        permissions?: boolean
      }
    }
    top: {
      show: boolean
      sections: {
        tools?: boolean
        zoom?: boolean
        history?: boolean
      }
    }
  }

  theme?: 'light' | 'dark'
  compactMode?: boolean
}

export interface CanvasConfig {
  engine: 'fabric' | 'native'
  size: {
    width: number
    height: number
  }
  background?: string
  grid?: {
    enabled: boolean
    size: number
    color: string
  }
  guides?: {
    enabled: boolean
    color: string
  }
}

export interface PermissionSet {
  // Permisos globales del usuario en el editor
  canAddElements: boolean
  canDeleteElements: boolean
  canModifyElements: boolean
  canExport: boolean
  canImport: boolean
}
```

### Archivo: `configs/customer.config.ts`

```typescript
import { EditorConfig } from './types'

export const customerConfig: EditorConfig = {
  mode: 'customer',

  features: {
    elements: {
      text: true,
      image: true,
      shape: true,
      area: false,
    },

    tools: {
      zoom: true,
      undo: true,
      snap: true,
      measurement: false,
      grid: false,
      rulers: false,
    },

    advanced: {
      permissions: false,      // No edita permisos, solo los respeta
      templates: true,         // Puede cargar plantillas
      variants: true,          // Puede cambiar variantes
      multiSide: true,         // Múltiples lados del producto
      sync: false,
      preview: true,           // Vista previa del diseño
      export: true,            // Exportar diseño
    },

    constraints: {
      enforceAreaLimits: true,   // STRICT: No puede salir del área
      enableLocking: true,       // Elementos bloqueados desde plantilla
      snapToCenter: true,
      snapToGrid: false,
    }
  },

  ui: {
    layout: 'inline',

    panels: {
      left: {
        show: true,
        width: 320,
        sections: {
          design: true,
          layers: true,
          images: true,
          shapes: true,
          templates: true,
          variants: true,
        }
      },
      right: {
        show: true,
        width: 300,
        sections: {
          properties: true,
          permissions: false,  // No se muestran permisos
        }
      },
      top: {
        show: true,
        sections: {
          tools: true,
          zoom: true,
          history: true,
        }
      }
    },

    theme: 'light',
    compactMode: false,
  },

  canvas: {
    engine: 'fabric',
    size: {
      width: 800,
      height: 800,
    },
    background: '#ffffff',
    grid: {
      enabled: false,
      size: 20,
      color: '#e5e5e5',
    },
    guides: {
      enabled: true,
      color: '#3b82f6',
    }
  },

  permissions: {
    canAddElements: true,
    canDeleteElements: true,
    canModifyElements: true,
    canExport: true,
    canImport: false,
  }
}
```

### Archivo: `configs/template.config.ts`

```typescript
import { EditorConfig } from './types'

export const templateConfig: EditorConfig = {
  mode: 'template',

  features: {
    elements: {
      text: true,
      image: true,
      shape: true,
      area: false,
    },

    tools: {
      zoom: true,
      undo: true,
      snap: true,
      measurement: false,
      grid: true,
      rulers: true,
    },

    advanced: {
      permissions: true,       // SÍ edita permisos
      templates: false,        // No carga plantillas (las está creando)
      variants: true,          // Para preview con variantes
      multiSide: true,
      sync: true,              // Sincronización entre lados
      preview: true,
      export: true,
    },

    constraints: {
      enforceAreaLimits: false,  // SOFT: Solo visual
      enableLocking: true,
      snapToCenter: true,
      snapToGrid: true,
    }
  },

  ui: {
    layout: 'inline',

    panels: {
      left: {
        show: true,
        width: 320,
        sections: {
          design: true,
          layers: true,
          images: true,
          shapes: true,
          measurement: false,
        }
      },
      right: {
        show: true,
        width: 350,
        sections: {
          properties: true,
          permissions: true,   // SÍ se muestran permisos
        }
      },
      top: {
        show: true,
        sections: {
          tools: true,
          zoom: true,
          history: true,
        }
      }
    },

    theme: 'light',
    compactMode: false,
  },

  canvas: {
    engine: 'fabric',
    size: {
      width: 800,
      height: 800,
    },
    background: '#f5f5f5',
    grid: {
      enabled: true,
      size: 20,
      color: '#d4d4d4',
    },
    guides: {
      enabled: true,
      color: '#3b82f6',
    }
  },

  permissions: {
    canAddElements: true,
    canDeleteElements: true,
    canModifyElements: true,
    canExport: true,
    canImport: true,
  }
}
```

### Archivo: `configs/area.config.ts`

```typescript
import { EditorConfig } from './types'

export const areaConfig: EditorConfig = {
  mode: 'area',

  features: {
    elements: {
      text: false,
      image: false,
      shape: false,
      area: true,          // Solo áreas
    },

    tools: {
      zoom: false,
      undo: false,
      snap: true,
      measurement: true,   // Sistema de medición
      grid: false,
      rulers: false,
    },

    advanced: {
      permissions: false,
      templates: false,
      variants: false,
      multiSide: false,    // Un lado a la vez
      sync: false,
      preview: false,
      export: false,
    },

    constraints: {
      enforceAreaLimits: false,
      enableLocking: false,
      snapToCenter: true,
      snapToGrid: false,
    }
  },

  ui: {
    layout: 'modal',       // Se muestra como modal

    panels: {
      left: {
        show: true,
        width: 320,
        sections: {
          measurement: true,
          design: false,
          layers: false,
        }
      },
      right: {
        show: false,       // No hay panel derecho
      },
      top: {
        show: true,
        sections: {
          tools: true,
          zoom: false,
          history: false,
        }
      }
    },

    theme: 'light',
    compactMode: true,
  },

  canvas: {
    engine: 'native',      // Canvas 2D nativo (más ligero)
    size: {
      width: 800,
      height: 800,
    },
    background: '#ffffff',
    guides: {
      enabled: true,
      color: '#3b82f6',
    }
  },

  permissions: {
    canAddElements: true,
    canDeleteElements: true,
    canModifyElements: true,
    canExport: false,
    canImport: false,
  }
}
```

---

## HOOKS PRINCIPALES

### Archivo: `hooks/useEditorCore.ts`

```typescript
import { useState, useCallback, useEffect } from 'react'
import { EditorConfig } from '../types/config'
import { EditorElement } from '../types/elements'
import { useHistory } from './useHistory'
import { useZoom } from './useZoom'
import { useMeasurement } from './useMeasurement'
import { useCanvas } from './useCanvas'
import { useElements } from './useElements'
import { useSelection } from './useSelection'

export function useEditorCore(config: EditorConfig) {
  // Canvas
  const canvas = useCanvas(config.canvas)

  // Elementos
  const elements = useElements(config)

  // Selección
  const selection = useSelection(elements.items)

  // Historia (condicional)
  const history = config.features.tools.undo
    ? useHistory(elements.items, elements.setItems)
    : null

  // Zoom (condicional)
  const zoom = config.features.tools.zoom
    ? useZoom(canvas.instance)
    : null

  // Medición (condicional)
  const measurement = config.features.tools.measurement
    ? useMeasurement(canvas.instance)
    : null

  // Estado de carga
  const [isLoading, setIsLoading] = useState(true)

  // Inicialización
  useEffect(() => {
    const init = async () => {
      try {
        await canvas.initialize()
        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing editor:', error)
      }
    }

    init()
  }, [])

  // Agregar elemento
  const addElement = useCallback((element: EditorElement) => {
    if (!canAddElement(element, config)) {
      console.warn('Cannot add element:', element)
      return
    }

    elements.add(element)

    if (history) {
      history.push(elements.items)
    }
  }, [elements, config, history])

  // Actualizar elemento
  const updateElement = useCallback((id: string, updates: Partial<EditorElement>) => {
    const element = elements.items.find(el => el.id === id)

    if (!element || !canUpdateElement(element, updates, config)) {
      console.warn('Cannot update element:', id, updates)
      return
    }

    elements.update(id, updates)

    if (history) {
      history.push(elements.items)
    }
  }, [elements, config, history])

  // Eliminar elemento
  const deleteElement = useCallback((id: string) => {
    const element = elements.items.find(el => el.id === id)

    if (!element || !canDeleteElement(element, config)) {
      console.warn('Cannot delete element:', id)
      return
    }

    elements.remove(id)

    if (history) {
      history.push(elements.items)
    }
  }, [elements, config, history])

  // Exportar datos
  const exportData = useCallback(() => {
    const data = {
      mode: config.mode,
      elements: elements.items,
      measurement: measurement?.data,
      timestamp: Date.now(),
    }

    return data
  }, [config, elements, measurement])

  return {
    // Estado
    isLoading,
    config,

    // Canvas
    canvas: canvas.instance,
    canvasRef: canvas.ref,

    // Elementos
    elements: elements.items,
    selectedElement: selection.selected,

    // Acciones
    addElement,
    updateElement,
    deleteElement,
    selectElement: selection.select,
    clearSelection: selection.clear,
    exportData,

    // Features condicionales
    history,
    zoom,
    measurement,
  }
}

// Validaciones
function canAddElement(element: EditorElement, config: EditorConfig): boolean {
  // Verificar tipo de elemento habilitado
  if (element.type === 'text' && !config.features.elements.text) return false
  if (element.type === 'image' && !config.features.elements.image) return false
  if (element.type === 'shape' && !config.features.elements.shape) return false
  if (element.type === 'area' && !config.features.elements.area) return false

  // Verificar permisos globales
  if (!config.permissions?.canAddElements) return false

  return true
}

function canUpdateElement(
  element: EditorElement,
  updates: Partial<EditorElement>,
  config: EditorConfig
): boolean {
  // Verificar permisos globales
  if (!config.permissions?.canModifyElements) return false

  // En modo customer, verificar permisos del elemento
  if (config.mode === 'customer' && element.permissions) {
    // Verificar movimiento
    if ((updates.x !== undefined || updates.y !== undefined) && !element.permissions.canMove) {
      return false
    }

    // Verificar rotación
    if (updates.rotation !== undefined && !element.permissions.canRotate) {
      return false
    }

    // Verificar escalado
    if ((updates.width !== undefined || updates.height !== undefined) && !element.permissions.canResize) {
      return false
    }

    // Verificar edición de contenido
    if (element.type === 'text' && updates.content !== undefined && !element.permissions.canEditContent) {
      return false
    }
  }

  return true
}

function canDeleteElement(element: EditorElement, config: EditorConfig): boolean {
  // Verificar permisos globales
  if (!config.permissions?.canDeleteElements) return false

  // En modo customer, verificar permisos del elemento
  if (config.mode === 'customer' && element.permissions) {
    if (!element.permissions.canDelete) return false
  }

  return true
}
```

### Archivo: `hooks/useCanvas.ts`

```typescript
import { useState, useRef, useCallback } from 'react'
import { CanvasConfig } from '../types/config'
import { loadFabricWithPlugins } from '@/lib/fabric-loader'

export function useCanvas(config: CanvasConfig) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [instance, setInstance] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const initialize = useCallback(async () => {
    if (!canvasRef.current) return

    if (config.engine === 'fabric') {
      // Cargar Fabric.js dinámicamente
      const fabric = await loadFabricWithPlugins()

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: config.size.width,
        height: config.size.height,
        backgroundColor: config.background || '#ffffff',
        selection: true,
        preserveObjectStacking: true,
      })

      // Configurar grid si está habilitado
      if (config.grid?.enabled) {
        setupGrid(canvas, config.grid)
      }

      setInstance(canvas)
      setIsInitialized(true)
    } else {
      // Canvas 2D nativo
      const ctx = canvasRef.current.getContext('2d')

      setInstance({ canvas: canvasRef.current, ctx })
      setIsInitialized(true)
    }
  }, [config])

  const clear = useCallback(() => {
    if (config.engine === 'fabric' && instance) {
      instance.clear()
    } else if (instance?.ctx) {
      instance.ctx.clearRect(0, 0, config.size.width, config.size.height)
    }
  }, [instance, config])

  return {
    ref: canvasRef,
    instance,
    isInitialized,
    initialize,
    clear,
  }
}

function setupGrid(canvas: any, gridConfig: any) {
  const gridSize = gridConfig.size
  const gridColor = gridConfig.color

  // Dibujar grid
  for (let i = 0; i < canvas.width / gridSize; i++) {
    canvas.add(new fabric.Line([i * gridSize, 0, i * gridSize, canvas.height], {
      stroke: gridColor,
      selectable: false,
      evented: false,
    }))

    canvas.add(new fabric.Line([0, i * gridSize, canvas.width, i * gridSize], {
      stroke: gridColor,
      selectable: false,
      evented: false,
    }))
  }
}
```

### Archivo: `hooks/useHistory.ts`

```typescript
import { useState, useCallback } from 'react'
import { EditorElement } from '../types/elements'

const MAX_HISTORY = 50

export function useHistory(
  elements: EditorElement[],
  setElements: (elements: EditorElement[]) => void
) {
  const [history, setHistory] = useState<EditorElement[][]>([elements])
  const [currentIndex, setCurrentIndex] = useState(0)

  const push = useCallback((newElements: EditorElement[]) => {
    setHistory(prev => {
      // Eliminar estados futuros si estamos en medio del historial
      const newHistory = prev.slice(0, currentIndex + 1)

      // Agregar nuevo estado
      newHistory.push(JSON.parse(JSON.stringify(newElements)))

      // Limitar tamaño del historial
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift()
      }

      return newHistory
    })

    setCurrentIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1))
  }, [currentIndex])

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      setElements(history[newIndex])
    }
  }, [currentIndex, history, setElements])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      setElements(history[newIndex])
    }
  }, [currentIndex, history, setElements])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  return {
    push,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
    currentIndex,
  }
}
```

---

## COMPONENTES

### Archivo: `UniversalEditor.tsx`

```typescript
import React from 'react'
import { EditorConfig } from './types/config'
import { EditorProvider } from './context/EditorContext'
import { useEditorCore } from './hooks/useEditorCore'
import MainToolbar from './components/Toolbar/MainToolbar'
import LeftPanel from './components/Panels/LeftPanel'
import RightPanel from './components/Panels/RightPanel'
import CanvasWrapper from './components/Canvas/CanvasWrapper'

interface UniversalEditorProps {
  config: EditorConfig

  // Props específicos según modo
  productId?: string
  templateId?: string
  sideImage?: string
  sideName?: string
  existingData?: any

  // Callbacks
  onSave: (data: any) => void
  onClose?: () => void
}

export default function UniversalEditor({
  config,
  existingData,
  onSave,
  onClose,
  ...props
}: UniversalEditorProps) {
  const editor = useEditorCore(config)

  const handleSave = () => {
    const data = editor.exportData()
    onSave(data)
  }

  const content = (
    <EditorProvider value={{ config, editor }}>
      <div className={`universal-editor ${config.mode}-mode`}>
        {/* Toolbar superior */}
        {config.ui.panels.top.show && (
          <MainToolbar
            onSave={handleSave}
            onClose={onClose}
          />
        )}

        <div className="editor-content">
          {/* Panel izquierdo */}
          {config.ui.panels.left.show && (
            <LeftPanel width={config.ui.panels.left.width} />
          )}

          {/* Canvas central */}
          <div className="editor-canvas-container">
            <CanvasWrapper {...props} />
          </div>

          {/* Panel derecho */}
          {config.ui.panels.right.show && (
            <RightPanel width={config.ui.panels.right.width} />
          )}
        </div>
      </div>
    </EditorProvider>
  )

  // Si es modal, envolver en modal
  if (config.ui.layout === 'modal') {
    return (
      <div className="universal-editor-modal">
        <div className="modal-backdrop" onClick={onClose} />
        <div className="modal-content">
          {content}
        </div>
      </div>
    )
  }

  return content
}
```

### Archivo: `components/Canvas/CanvasWrapper.tsx`

```typescript
import React from 'react'
import { useEditorContext } from '../../context/EditorContext'
import FabricCanvas from './FabricCanvas'
import NativeCanvas from './NativeCanvas'

export default function CanvasWrapper(props: any) {
  const { config, editor } = useEditorContext()

  const CanvasComponent = config.canvas.engine === 'fabric'
    ? FabricCanvas
    : NativeCanvas

  return (
    <div className="canvas-wrapper">
      <CanvasComponent
        canvasRef={editor.canvasRef}
        config={config.canvas}
        elements={editor.elements}
        selectedElement={editor.selectedElement}
        onSelectElement={editor.selectElement}
        {...props}
      />
    </div>
  )
}
```

### Archivo: `components/Panels/LeftPanel/index.tsx`

```typescript
import React from 'react'
import { useEditorContext } from '../../../context/EditorContext'
import DesignPanel from './DesignPanel'
import LayersPanel from './LayersPanel'
import ImageLibrary from './ImageLibrary'
import ShapesLibrary from './ShapesLibrary'
import MeasurementPanel from './MeasurementPanel'
import TemplateSelector from './TemplateSelector'
import VariantSelector from './VariantSelector'

interface LeftPanelProps {
  width?: number
}

export default function LeftPanel({ width = 320 }: LeftPanelProps) {
  const { config } = useEditorContext()
  const sections = config.ui.panels.left.sections

  return (
    <div className="left-panel" style={{ width }}>
      {sections.design && <DesignPanel />}
      {sections.layers && <LayersPanel />}
      {sections.images && <ImageLibrary />}
      {sections.shapes && <ShapesLibrary />}
      {sections.measurement && <MeasurementPanel />}
      {sections.templates && <TemplateSelector />}
      {sections.variants && <VariantSelector />}
    </div>
  )
}
```

---

## SISTEMA DE TIPOS

### Archivo: `types/elements.ts`

```typescript
export type ElementType = 'text' | 'image' | 'shape' | 'area'

export interface BaseElement {
  id: string
  type: ElementType
  name: string

  // Posición y tamaño (coordenadas relativas 0-100%)
  x: number
  y: number
  width: number
  height: number
  rotation: number

  // Apariencia
  opacity: number
  visible: boolean
  locked: boolean

  // Z-index
  zIndex: number
  alwaysOnTop?: boolean
  alwaysOnBottom?: boolean

  // Permisos (solo en modo template/customer)
  permissions?: ElementPermissions

  // Metadatos
  isRelativeCoordinates?: boolean
  referenceWidth?: number
  referenceHeight?: number
}

export interface ElementPermissions {
  canMove: boolean
  canRotate: boolean
  canResize: boolean
  canDelete: boolean
  canEditContent?: boolean  // Para texto
  canReplaceImage?: boolean // Para imagen
  canChangeColors?: boolean // Para formas
}

export interface TextElement extends BaseElement {
  type: 'text'
  content: string

  // Tipografía
  fontFamily: string
  fontSize: number
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
  textDecoration: 'none' | 'underline' | 'line-through'
  textAlign: 'left' | 'center' | 'right'

  // Color
  color: string

  // Espaciado
  letterSpacing?: number
  lineSpacing?: number

  // Restricciones (solo en template)
  minFontSize?: number
  maxFontSize?: number
  autoUppercase?: boolean
  mandatoryToEdit?: boolean

  // Texto curvo
  curved?: boolean
  curveRadius?: number
}

export interface ImageElement extends BaseElement {
  type: 'image'
  src: string

  // Propiedades
  maintainAspectRatio: boolean

  // Máscara
  mask?: {
    enabled: boolean
    shape: 'rectangle' | 'circle' | 'custom'
    path?: string
  }
}

export interface ShapeElement extends BaseElement {
  type: 'shape'
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'star' | 'heart' | 'custom'

  // Colores
  fillColor: string
  strokeColor: string
  strokeWidth: number

  // Propiedades especiales
  useAsFillableShape?: boolean  // Puede ser rellenada con imagen
}

export interface AreaElement extends BaseElement {
  type: 'area'
  shape: 'rectangle' | 'circle' | 'ellipse'

  // Medidas reales
  realWidth?: number   // cm
  realHeight?: number  // cm
}

export type EditorElement = TextElement | ImageElement | ShapeElement | AreaElement
```

---

## PLAN DE IMPLEMENTACIÓN

### Fase 1: Preparación (Semana 1-2)

**Objetivos:**
- Crear estructura base del proyecto
- Implementar sistema de configuración
- Setup de tipos TypeScript
- Crear hooks centrales básicos

**Tareas:**
1. Crear estructura de carpetas
2. Definir tipos en `types/`
3. Crear configuraciones en `configs/`
4. Implementar `useEditorCore` básico
5. Implementar `EditorContext`
6. Crear componente `UniversalEditor` vacío

**Entregables:**
- [ ] Estructura de archivos completa
- [ ] Sistema de tipos completo
- [ ] Configuraciones para los 3 modos
- [ ] Hook useEditorCore básico
- [ ] Contexto del editor
- [ ] Tests unitarios de hooks

---

### Fase 2: AreaEditor (Semana 3)

**Objetivos:**
- Migrar AreaEditor (el más simple)
- Validar arquitectura con caso real
- Implementar Canvas 2D nativo

**Tareas:**
1. Implementar `useNativeCanvas`
2. Implementar `useMeasurement`
3. Crear `AreaElement` component
4. Crear `MeasurementPanel`
5. Implementar lógica de snap to center
6. Migrar funcionalidad completa de AreaEditor
7. Testing exhaustivo

**Entregables:**
- [ ] AreaEditor funcionando con nueva arquitectura
- [ ] Tests de integración
- [ ] Documentación de uso
- [ ] Comparación de performance

---

### Fase 3: ZakekeAdvancedEditor (Semana 4-6)

**Objetivos:**
- Migrar editor de cliente
- Implementar Fabric.js canvas
- Validar sistema de permisos

**Tareas:**
1. Implementar `useFabricCanvas`
2. Implementar `useHistory`
3. Implementar `useZoom`
4. Crear componentes de elementos (Text, Image, Shape)
5. Implementar panels (Design, Layers, Properties)
6. Migrar sistema de plantillas
7. Migrar sistema de variantes
8. Testing exhaustivo con productos reales

**Entregables:**
- [ ] ZakekeAdvancedEditor funcionando
- [ ] Performance igual o mejor
- [ ] Tests E2E
- [ ] Validación con usuarios beta

---

### Fase 4: TemplateEditor (Semana 7-9)

**Objetivos:**
- Migrar editor de plantillas
- Implementar sistema de permisos completo
- Validar sincronización multi-lado

**Tareas:**
1. Implementar `usePermissions`
2. Crear `PermissionsPanel`
3. Implementar sincronización multi-lado
4. Migrar vista previa de plantilla
5. Implementar validaciones de plantilla
6. Testing exhaustivo de creación de plantillas
7. Migrar plantillas existentes

**Entregables:**
- [ ] TemplateEditor funcionando
- [ ] Sistema de permisos completo
- [ ] Sincronización multi-lado
- [ ] Migración de plantillas existentes

---

### Fase 5: Refinamiento (Semana 10-11)

**Objetivos:**
- Optimizaciones de performance
- Pulir UX
- Documentación completa

**Tareas:**
1. Optimizar bundle size
2. Implementar code splitting
3. Optimizar renderizado de canvas
4. Mejorar UX según feedback
5. Documentación completa
6. Capacitación a equipo
7. Plan de rollout gradual

**Entregables:**
- [ ] Performance optimizada
- [ ] Bundle size reducido
- [ ] Documentación completa
- [ ] Guía de migración
- [ ] Plan de rollout

---

## EJEMPLOS DE USO

### Ejemplo 1: Cliente Personalizando Producto

```tsx
import UniversalEditor, { customerConfig } from '@/components/UniversalEditor'

function ProductCustomizePage({ productId }: { productId: string }) {
  const handleSave = async (data: any) => {
    await fetch(`/api/products/${productId}/customizations`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  return (
    <div className="page">
      <h1>Personaliza tu producto</h1>

      <UniversalEditor
        config={customerConfig}
        productId={productId}
        onSave={handleSave}
      />
    </div>
  )
}
```

### Ejemplo 2: Admin Creando Plantilla

```tsx
import UniversalEditor, { templateConfig } from '@/components/UniversalEditor'

function TemplateEditorPage({ templateId }: { templateId?: string }) {
  const { data: existingTemplate } = useSWR(
    templateId ? `/api/templates/${templateId}` : null
  )

  const handleSave = async (data: any) => {
    const url = templateId
      ? `/api/templates/${templateId}`
      : '/api/templates'

    await fetch(url, {
      method: templateId ? 'PUT' : 'POST',
      body: JSON.stringify(data),
    })
  }

  return (
    <div className="page">
      <h1>{templateId ? 'Editar' : 'Crear'} Plantilla</h1>

      <UniversalEditor
        config={templateConfig}
        templateId={templateId}
        existingData={existingTemplate}
        onSave={handleSave}
      />
    </div>
  )
}
```

### Ejemplo 3: Admin Definiendo Áreas

```tsx
import UniversalEditor, { areaConfig } from '@/components/UniversalEditor'

function ProductSidesManager({ productId }: { productId: string }) {
  const { data: sides } = useSWR(`/api/products/${productId}/sides`)
  const [editingSide, setEditingSide] = useState<string | null>(null)

  const handleSaveAreas = async (data: any) => {
    await fetch(`/api/products/${productId}/sides/${editingSide}/areas`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

    setEditingSide(null)
  }

  return (
    <div className="page">
      <h1>Gestionar Lados del Producto</h1>

      <div className="sides-grid">
        {sides?.map(side => (
          <button key={side.id} onClick={() => setEditingSide(side.id)}>
            Editar {side.name}
          </button>
        ))}
      </div>

      {editingSide && (
        <UniversalEditor
          config={areaConfig}
          sideImage={sides.find(s => s.id === editingSide)?.image}
          sideName={sides.find(s => s.id === editingSide)?.name}
          existingData={sides.find(s => s.id === editingSide)?.areas}
          onSave={handleSaveAreas}
          onClose={() => setEditingSide(null)}
        />
      )}
    </div>
  )
}
```

### Ejemplo 4: Configuración Personalizada

```tsx
import UniversalEditor from '@/components/UniversalEditor'
import { EditorConfig } from '@/components/UniversalEditor/types'

// Crear configuración personalizada
const customConfig: EditorConfig = {
  mode: 'customer',

  features: {
    elements: {
      text: true,
      image: false,      // Deshabilitar imágenes
      shape: true,
      area: false,
    },

    tools: {
      zoom: true,
      undo: true,
      snap: false,       // Sin snap
      measurement: false,
      grid: true,        // Con grid
      rulers: true,
    },

    // ... más configuraciones personalizadas
  },

  // ... resto de config
}

function CustomEditorPage() {
  return (
    <UniversalEditor
      config={customConfig}
      onSave={handleSave}
    />
  )
}
```

---

## CONCLUSIÓN

Esta arquitectura proporciona:

✅ **Flexibilidad** - Configuración completa de features
✅ **Reutilización** - Código compartido entre modos
✅ **Mantenibilidad** - Estructura modular y clara
✅ **Performance** - Code splitting y lazy loading
✅ **Type Safety** - TypeScript en toda la base de código
✅ **Extensibilidad** - Fácil agregar nuevas funcionalidades

El plan de implementación gradual permite validar la arquitectura en cada fase antes de continuar, reduciendo riesgos.

---

**Próximo paso:** Revisar y aprobar esta propuesta para iniciar la implementación.
