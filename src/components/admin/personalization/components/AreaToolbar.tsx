"use client"

import React, { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  MousePointer, 
  Square, 
  Circle, 
  Ruler, 
  Hand,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'
import { Tool } from '../types/AreaEditorTypes'

interface AreaToolbarProps {
  tools: Tool[]
  activeTool: string
  zoom: number
  onToolChange: (tool: string) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  readonly?: boolean
}

const AreaToolbar = memo(({
  tools,
  activeTool,
  zoom,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  readonly = false
}: AreaToolbarProps) => {
  const getToolIcon = (toolId: string) => {
    switch (toolId) {
      case 'select':
        return <MousePointer className="w-4 h-4" />
      case 'rectangle':
        return <Square className="w-4 h-4" />
      case 'circle':
        return <Circle className="w-4 h-4" />
      case 'measure':
        return <Ruler className="w-4 h-4" />
      case 'pan':
        return <Hand className="w-4 h-4" />
      default:
        return <MousePointer className="w-4 h-4" />
    }
  }

  const getToolTooltip = (toolId: string) => {
    switch (toolId) {
      case 'select':
        return 'Seleccionar área (S)'
      case 'rectangle':
        return 'Crear rectángulo (R)'
      case 'circle':
        return 'Crear círculo (C)'
      case 'measure':
        return 'Medir distancia (M)'
      case 'pan':
        return 'Mover vista (Espacio)'
      default:
        return toolId
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Herramientas principales */}
      <div className="flex flex-col gap-1">
        {tools.map(tool => (
          <Button
            key={tool.id}
            variant={activeTool === tool.id ? "default" : "ghost"}
            size="sm"
            className={`w-12 h-12 p-0 ${activeTool === tool.id ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            onClick={() => onToolChange(tool.id)}
            title={getToolTooltip(tool.id)}
            disabled={readonly && (tool.id === 'rectangle' || tool.id === 'circle' || tool.id === 'measure')}
          >
            {getToolIcon(tool.id)}
          </Button>
        ))}
      </div>

      <Separator className="my-2 w-8" />

      {/* Controles de zoom */}
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-12 h-12 p-0"
          onClick={onZoomIn}
          title="Acercar (Ctrl++)"
          disabled={zoom >= 3}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        
        <div className="w-12 text-center">
          <span className="text-xs text-gray-500 font-mono">
            {Math.round(zoom * 100)}%
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-12 h-12 p-0"
          onClick={onZoomOut}
          title="Alejar (Ctrl+-)"
          disabled={zoom <= 0.1}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-12 h-12 p-0"
          onClick={onResetZoom}
          title="Restablecer zoom (Ctrl+0)"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {readonly && (
        <>
          <Separator className="my-2 w-8" />
          <div className="text-xs text-center text-gray-500 rotate-90 whitespace-nowrap">
            Solo lectura
          </div>
        </>
      )}
    </div>
  )
})

AreaToolbar.displayName = 'AreaToolbar'

export default AreaToolbar