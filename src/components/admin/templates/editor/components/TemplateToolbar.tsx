"use client"

import React, { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Type, 
  Image, 
  Square, 
  Undo2, 
  Redo2, 
  Save, 
  Eye,
  EyeOff,
  Layers,
  Settings,
  Grid3x3,
  Ruler,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'
import { useTemplateEditor } from '../context/TemplateEditorContext'

interface TemplateToolbarProps {
  onSave?: () => void
}

export const TemplateToolbar = memo(({ onSave }: TemplateToolbarProps) => {
  const { 
    state, 
    dispatch, 
    setZoom, 
    resetZoom, 
    undo, 
    redo, 
    saveToHistory 
  } = useTemplateEditor()

  const handleToolChange = (tool: typeof state.activeTool) => {
    dispatch({ type: 'SET_ACTIVE_TOOL', payload: tool })
  }

  const handleZoomIn = () => {
    setZoom(state.zoom * 1.2)
  }

  const handleZoomOut = () => {
    setZoom(state.zoom / 1.2)
  }

  const handleSave = () => {
    if (onSave) {
      onSave()
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      {/* Herramientas principales */}
      <div className="flex items-center space-x-2">
        <Button
          variant={state.activeTool === 'select' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToolChange('select')}
          className="relative"
        >
          <Settings className="w-4 h-4" />
        </Button>

        <Button
          variant={state.activeTool === 'text' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToolChange('text')}
        >
          <Type className="w-4 h-4" />
        </Button>

        <Button
          variant={state.activeTool === 'image' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToolChange('image')}
        >
          <Image className="w-4 h-4" />
        </Button>

        <Button
          variant={state.activeTool === 'shape' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToolChange('shape')}
        >
          <Square className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Librerías */}
        <Button
          variant={state.isImageLibraryOpen ? 'default' : 'outline'}
          size="sm"
          onClick={() => dispatch({ type: 'TOGGLE_IMAGE_LIBRARY' })}
        >
          <Image className="w-4 h-4" />
          <span className="ml-1 text-xs">Imágenes</span>
        </Button>

        <Button
          variant={state.isShapesLibraryOpen ? 'default' : 'outline'}
          size="sm"
          onClick={() => dispatch({ type: 'TOGGLE_SHAPES_LIBRARY' })}
        >
          <Square className="w-4 h-4" />
          <span className="ml-1 text-xs">Formas</span>
        </Button>

        <Button
          variant={state.isElementsLibraryOpen ? 'default' : 'outline'}
          size="sm"
          onClick={() => dispatch({ type: 'TOGGLE_ELEMENTS_LIBRARY' })}
        >
          <Layers className="w-4 h-4" />
          <span className="ml-1 text-xs">Elementos</span>
        </Button>
      </div>

      {/* Controles de vista */}
      <div className="flex items-center space-x-2">
        <Button
          variant={state.showGrid ? 'default' : 'outline'}
          size="sm"
          onClick={() => dispatch({ type: 'TOGGLE_GRID' })}
          title="Mostrar/ocultar rejilla"
        >
          <Grid3x3 className="w-4 h-4" />
        </Button>

        <Button
          variant={state.showRulers ? 'default' : 'outline'}
          size="sm"
          onClick={() => dispatch({ type: 'TOGGLE_RULERS' })}
          title="Mostrar/ocultar reglas"
        >
          <Ruler className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Controles de zoom */}
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={state.zoom <= 0.1}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetZoom}
            className="min-w-[60px]"
          >
            {Math.round(state.zoom * 100)}%
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={state.zoom >= 5}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Controles de historial */}
        <Button
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={state.historyIndex <= 0}
        >
          <Undo2 className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={redo}
          disabled={state.historyIndex >= state.history.length - 1}
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Acciones principales */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Badge variant={state.hasUnsavedChanges ? 'destructive' : 'secondary'}>
            {state.hasUnsavedChanges ? 'Sin guardar' : 'Guardado'}
          </Badge>
          
          <span className="text-sm text-gray-500">
            {state.elements.length} elementos
          </span>
        </div>

        <Button 
          onClick={handleSave}
          disabled={state.isSaving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {state.isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </div>
  )
})

TemplateToolbar.displayName = 'TemplateToolbar'