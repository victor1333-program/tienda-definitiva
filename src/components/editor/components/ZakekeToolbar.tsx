"use client"

import React, { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Type, 
  ImageIcon, 
  Square, 
  Circle,
  Upload,
  Download,
  Undo,
  Redo,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Save
} from 'lucide-react'
import { ToolState, HistoryState } from '../types/ZakekeTypes'

interface ZakekeToolbarProps {
  toolState: ToolState
  historyState: HistoryState
  canvasZoom: number
  isModified: boolean
  selectedElementId: string | null
  onToolChange: (tool: 'select' | 'text' | 'image' | 'shape' | 'draw') => void
  onUndo: () => void
  onRedo: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onDeleteSelected: () => void
  onCopySelected: () => void
  onSave: () => void
  onImportImage: () => void
  onExportDesign: () => void
}

export const ZakekeToolbar = memo(({
  toolState,
  historyState,
  canvasZoom,
  isModified,
  selectedElementId,
  onToolChange,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onDeleteSelected,
  onCopySelected,
  onSave,
  onImportImage,
  onExportDesign
}: ZakekeToolbarProps) => {
  return (
    <div className="bg-white border-b border-gray-200 p-3">
      <div className="flex items-center justify-between">
        {/* Herramientas principales */}
        <div className="flex items-center gap-2">
          <Button
            variant={toolState.activeTool === 'select' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolChange('select')}
            title="Seleccionar (V)"
          >
            <Square className="w-4 h-4" />
          </Button>
          
          <Button
            variant={toolState.activeTool === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolChange('text')}
            title="Texto (T)"
          >
            <Type className="w-4 h-4" />
          </Button>
          
          <Button
            variant={toolState.activeTool === 'image' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolChange('image')}
            title="Imagen (I)"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          
          <Button
            variant={toolState.activeTool === 'shape' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolChange('shape')}
            title="Formas (S)"
          >
            <Circle className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Historial */}
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!historyState.canUndo}
            title="Deshacer (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!historyState.canRedo}
            title="Rehacer (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Acciones de elemento */}
          <Button
            variant="outline"
            size="sm"
            onClick={onCopySelected}
            disabled={!selectedElementId}
            title="Copiar (Ctrl+C)"
          >
            <Copy className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteSelected}
            disabled={!selectedElementId}
            title="Eliminar (Delete)"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Zoom y acciones */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomOut}
            disabled={canvasZoom <= 0.1}
            title="Alejar (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onResetZoom}
            title="Zoom 100% (0)"
            className="min-w-[60px]"
          >
            {Math.round(canvasZoom * 100)}%
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomIn}
            disabled={canvasZoom >= 5}
            title="Acercar (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          <Button
            variant="outline"
            size="sm"
            onClick={onImportImage}
            title="Subir imagen"
          >
            <Upload className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onExportDesign}
            title="Exportar diseño"
          >
            <Download className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          <Button
            onClick={onSave}
            disabled={!isModified}
            title="Guardar diseño (Ctrl+S)"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>
    </div>
  )
})

ZakekeToolbar.displayName = 'ZakekeToolbar'