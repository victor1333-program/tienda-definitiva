"use client"

import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Square, 
  Circle, 
  Palette, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2,
  RotateCw
} from 'lucide-react'
import { PrintArea } from '../types/AreaEditorTypes'

interface AreaPropertiesPanelProps {
  selectedArea: PrintArea | null
  pixelsPerCm: number | null
  onAreaUpdate: (areaId: string, updates: Partial<PrintArea>) => void
  onAreaDelete: (areaId: string) => void
  readonly?: boolean
}

const AreaPropertiesPanel = memo(({
  selectedArea,
  pixelsPerCm,
  onAreaUpdate,
  onAreaDelete,
  readonly = false
}: AreaPropertiesPanelProps) => {
  if (!selectedArea) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Square className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <h3 className="font-semibold mb-2">No hay área seleccionada</h3>
        <p className="text-sm">
          Selecciona un área en el canvas para editar sus propiedades
        </p>
      </div>
    )
  }

  const handleUpdate = (updates: Partial<PrintArea>) => {
    onAreaUpdate(selectedArea.id, updates)
  }

  const getShapeIcon = (shape: string) => {
    switch (shape) {
      case 'rectangle':
        return <Square className="w-4 h-4" />
      case 'circle':
        return <Circle className="w-4 h-4" />
      default:
        return <Square className="w-4 h-4" />
    }
  }

  const getRealSizeText = (pixels: number) => {
    if (!pixelsPerCm) return `${pixels}px`
    const cm = pixels / pixelsPerCm
    return `${pixels}px (${cm.toFixed(1)}cm)`
  }

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      {/* Header del área */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getShapeIcon(selectedArea.shape)}
          <h3 className="font-semibold">Propiedades del área</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUpdate({ isActive: !selectedArea.isActive })}
            title={selectedArea.isActive ? 'Desactivar área' : 'Activar área'}
            disabled={readonly}
          >
            {selectedArea.isActive !== false ? 
              <Eye className="w-4 h-4" /> : 
              <EyeOff className="w-4 h-4" />
            }
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUpdate({ locked: !selectedArea.locked })}
            title={selectedArea.locked ? 'Desbloquear área' : 'Bloquear área'}
            disabled={readonly}
          >
            {selectedArea.locked ? 
              <Lock className="w-4 h-4" /> : 
              <Unlock className="w-4 h-4" />
            }
          </Button>
        </div>
      </div>

      {/* Información básica */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Información básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="area-name" className="text-xs">Nombre del área</Label>
            <Input
              id="area-name"
              value={selectedArea.name}
              onChange={(e) => handleUpdate({ name: e.target.value })}
              placeholder="Nombre del área"
              className="h-8 text-sm"
              disabled={readonly}
            />
          </div>

          <div>
            <Label htmlFor="area-description" className="text-xs">Descripción</Label>
            <Input
              id="area-description"
              value={selectedArea.description || ''}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              placeholder="Descripción opcional"
              className="h-8 text-sm"
              disabled={readonly}
            />
          </div>

          <div>
            <Label className="text-xs">Forma</Label>
            <Select
              value={selectedArea.shape}
              onValueChange={(value: 'rectangle' | 'circle' | 'ellipse' | 'polygon') => 
                handleUpdate({ shape: value })
              }
              disabled={readonly}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rectangle">
                  <div className="flex items-center gap-2">
                    <Square className="w-3 h-3" />
                    Rectángulo
                  </div>
                </SelectItem>
                <SelectItem value="circle">
                  <div className="flex items-center gap-2">
                    <Circle className="w-3 h-3" />
                    Círculo
                  </div>
                </SelectItem>
                <SelectItem value="ellipse">
                  <div className="flex items-center gap-2">
                    <Circle className="w-3 h-3" />
                    Elipse
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posición y tamaño */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Posición y tamaño</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Posición */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={Math.round(selectedArea.x)}
                onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
                className="h-8 text-sm"
                disabled={readonly}
              />
              <span className="text-xs text-gray-500">
                {getRealSizeText(selectedArea.x)}
              </span>
            </div>
            <div>
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={Math.round(selectedArea.y)}
                onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
                className="h-8 text-sm"
                disabled={readonly}
              />
              <span className="text-xs text-gray-500">
                {getRealSizeText(selectedArea.y)}
              </span>
            </div>
          </div>

          {/* Tamaño */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Ancho</Label>
              <Input
                type="number"
                value={Math.round(selectedArea.width)}
                onChange={(e) => handleUpdate({ width: Math.max(1, Number(e.target.value)) })}
                className="h-8 text-sm"
                min="1"
                disabled={readonly}
              />
              <span className="text-xs text-gray-500">
                {getRealSizeText(selectedArea.width)}
              </span>
            </div>
            <div>
              <Label className="text-xs">Alto</Label>
              <Input
                type="number"
                value={Math.round(selectedArea.height)}
                onChange={(e) => handleUpdate({ height: Math.max(1, Number(e.target.value)) })}
                className="h-8 text-sm"
                min="1"
                disabled={readonly}
              />
              <span className="text-xs text-gray-500">
                {getRealSizeText(selectedArea.height)}
              </span>
            </div>
          </div>

          {/* Rotación */}
          <div>
            <Label className="text-xs">Rotación</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={Math.round(selectedArea.rotation)}
                onChange={(e) => handleUpdate({ rotation: Number(e.target.value) })}
                className="h-8 text-sm flex-1"
                min="-360"
                max="360"
                disabled={readonly}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdate({ rotation: 0 })}
                title="Resetear rotación"
                disabled={readonly}
              >
                <RotateCw className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apariencia */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Apariencia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Color */}
          <div>
            <Label className="text-xs">Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedArea.color || '#3B82F6'}
                onChange={(e) => handleUpdate({ color: e.target.value })}
                className="w-8 h-8 border border-gray-200 rounded cursor-pointer"
                disabled={readonly}
              />
              <Input
                value={selectedArea.color || '#3B82F6'}
                onChange={(e) => handleUpdate({ color: e.target.value })}
                className="h-8 text-sm flex-1 font-mono"
                placeholder="#3B82F6"
                disabled={readonly}
              />
            </div>
          </div>

          {/* Opacidad */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Opacidad</Label>
              <span className="text-xs text-gray-500">
                {Math.round((selectedArea.opacity || 1) * 100)}%
              </span>
            </div>
            <Slider
              value={[(selectedArea.opacity || 1) * 100]}
              onValueChange={([value]) => handleUpdate({ opacity: value / 100 })}
              max={100}
              min={0}
              step={1}
              className="w-full"
              disabled={readonly}
            />
          </div>

          {/* Z-Index */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Capa (Z-Index)</Label>
              <Badge variant="outline" className="text-xs">
                {selectedArea.zIndex || 0}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdate({ zIndex: (selectedArea.zIndex || 0) + 1 })}
                className="text-xs flex-1"
                disabled={readonly}
              >
                Adelante
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdate({ zIndex: Math.max(0, (selectedArea.zIndex || 0) - 1) })}
                className="text-xs flex-1"
                disabled={readonly}
              >
                Atrás
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      {pixelsPerCm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Medidas reales</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-600 space-y-1">
            <p>Ancho: {(selectedArea.width / pixelsPerCm).toFixed(2)} cm</p>
            <p>Alto: {(selectedArea.height / pixelsPerCm).toFixed(2)} cm</p>
            <p>Área: {((selectedArea.width * selectedArea.height) / (pixelsPerCm * pixelsPerCm)).toFixed(2)} cm²</p>
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      {!readonly && (
        <>
          <Separator />
          <Button
            variant="destructive"
            onClick={() => onAreaDelete(selectedArea.id)}
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar área
          </Button>
        </>
      )}
    </div>
  )
})

AreaPropertiesPanel.displayName = 'AreaPropertiesPanel'

export default AreaPropertiesPanel