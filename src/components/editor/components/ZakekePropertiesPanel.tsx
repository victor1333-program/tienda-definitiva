"use client"

import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Type, 
  Palette, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  RotateCw,
  FlipHorizontal,
  FlipVertical 
} from 'lucide-react'
import { DesignElement, TextStyle } from '../types/ZakekeTypes'

interface ZakekePropertiesPanelProps {
  selectedElement: DesignElement | null
  onElementUpdate: (elementId: string, updates: Partial<DesignElement>) => void
  onElementDelete: (elementId: string) => void
  className?: string
}

export const ZakekePropertiesPanel = memo(({
  selectedElement,
  onElementUpdate,
  onElementDelete,
  className = ''
}: ZakekePropertiesPanelProps) => {
  if (!selectedElement) {
    return (
      <div className={`w-80 bg-white border-l border-gray-200 p-4 ${className}`}>
        <div className="text-center text-gray-500 py-8">
          <Type className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No hay elemento seleccionado</p>
          <p className="text-xs mt-1">Selecciona un elemento para editar sus propiedades</p>
        </div>
      </div>
    )
  }

  const handleUpdate = (updates: Partial<DesignElement>) => {
    onElementUpdate(selectedElement.id, updates)
  }

  const handleTransformUpdate = (property: string, value: number) => {
    handleUpdate({ [property]: value })
  }

  return (
    <div className={`w-80 bg-white border-l border-gray-200 overflow-y-auto ${className}`}>
      {/* Header del panel */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Propiedades</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUpdate({ visible: !selectedElement.visible })}
              title={selectedElement.visible ? 'Ocultar elemento' : 'Mostrar elemento'}
            >
              {selectedElement.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUpdate({ locked: !selectedElement.locked })}
              title={selectedElement.locked ? 'Desbloquear elemento' : 'Bloquear elemento'}
            >
              {selectedElement.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500 capitalize mt-1">
          {selectedElement.type} • ID: {selectedElement.id.slice(-6)}
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Información básica */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="element-name" className="text-xs">Nombre</Label>
              <Input
                id="element-name"
                value={selectedElement.name || ''}
                onChange={(e) => handleUpdate({ name: e.target.value })}
                placeholder="Nombre del elemento"
                className="h-8 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Posición y tamaño */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Transformación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Posición */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">X</Label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.x || 0)}
                  onChange={(e) => handleTransformUpdate('x', Number(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Y</Label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.y || 0)}
                  onChange={(e) => handleTransformUpdate('y', Number(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Tamaño */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Ancho</Label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.width || 0)}
                  onChange={(e) => handleTransformUpdate('width', Number(e.target.value))}
                  className="h-8 text-sm"
                  min="1"
                />
              </div>
              <div>
                <Label className="text-xs">Alto</Label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.height || 0)}
                  onChange={(e) => handleTransformUpdate('height', Number(e.target.value))}
                  className="h-8 text-sm"
                  min="1"
                />
              </div>
            </div>

            {/* Rotación */}
            <div>
              <Label className="text-xs">Rotación</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={Math.round(selectedElement.rotation || 0)}
                  onChange={(e) => handleTransformUpdate('rotation', Number(e.target.value))}
                  className="h-8 text-sm flex-1"
                  min="-360"
                  max="360"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdate({ rotation: 0 })}
                  title="Resetear rotación"
                >
                  <RotateCw className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Escala */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Escala X</Label>
                <Input
                  type="number"
                  value={selectedElement.scaleX || 1}
                  onChange={(e) => handleTransformUpdate('scaleX', Number(e.target.value))}
                  className="h-8 text-sm"
                  step="0.1"
                  min="0.1"
                />
              </div>
              <div>
                <Label className="text-xs">Escala Y</Label>
                <Input
                  type="number"
                  value={selectedElement.scaleY || 1}
                  onChange={(e) => handleTransformUpdate('scaleY', Number(e.target.value))}
                  className="h-8 text-sm"
                  step="0.1"
                  min="0.1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Propiedades específicas según tipo */}
        {selectedElement.type === 'text' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Texto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contenido del texto */}
              <div>
                <Label className="text-xs">Contenido</Label>
                <textarea
                  value={selectedElement.text || ''}
                  onChange={(e) => handleUpdate({ text: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded text-sm resize-none"
                  rows={3}
                  placeholder="Introduce tu texto..."
                />
              </div>

              {/* Fuente */}
              <div>
                <Label className="text-xs">Fuente</Label>
                <Select
                  value={selectedElement.fontFamily || 'Arial'}
                  onValueChange={(value) => handleUpdate({ fontFamily: value })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Courier New">Courier New</SelectItem>
                    <SelectItem value="Impact">Impact</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tamaño de fuente */}
              <div>
                <Label className="text-xs">Tamaño</Label>
                <Input
                  type="number"
                  value={selectedElement.fontSize || 20}
                  onChange={(e) => handleUpdate({ fontSize: Number(e.target.value) })}
                  className="h-8 text-sm"
                  min="8"
                  max="200"
                />
              </div>

              {/* Color del texto */}
              <div>
                <Label className="text-xs">Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={selectedElement.fill || '#000000'}
                    onChange={(e) => handleUpdate({ fill: e.target.value })}
                    className="w-8 h-8 border border-gray-200 rounded cursor-pointer"
                  />
                  <Input
                    value={selectedElement.fill || '#000000'}
                    onChange={(e) => handleUpdate({ fill: e.target.value })}
                    className="h-8 text-sm flex-1 font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Alineación */}
              <div>
                <Label className="text-xs">Alineación</Label>
                <Select
                  value={selectedElement.textAlign || 'left'}
                  onValueChange={(value) => handleUpdate({ textAlign: value })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Izquierda</SelectItem>
                    <SelectItem value="center">Centro</SelectItem>
                    <SelectItem value="right">Derecha</SelectItem>
                    <SelectItem value="justify">Justificado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Opacidad */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Apariencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Opacidad</Label>
                <span className="text-xs text-gray-500">
                  {Math.round((selectedElement.opacity || 1) * 100)}%
                </span>
              </div>
              <Slider
                value={[(selectedElement.opacity || 1) * 100]}
                onValueChange={([value]) => handleUpdate({ opacity: value / 100 })}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Capa (Z-Index)</Label>
                <span className="text-xs text-gray-500">
                  {selectedElement.zIndex || 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdate({ zIndex: (selectedElement.zIndex || 0) + 1 })}
                  className="text-xs"
                >
                  Adelante
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdate({ zIndex: Math.max(0, (selectedElement.zIndex || 0) - 1) })}
                  className="text-xs"
                >
                  Atrás
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="pt-4 border-t">
          <Button
            variant="destructive"
            onClick={() => onElementDelete(selectedElement.id)}
            className="w-full"
          >
            Eliminar elemento
          </Button>
        </div>
      </div>
    </div>
  )
})

ZakekePropertiesPanel.displayName = 'ZakekePropertiesPanel'