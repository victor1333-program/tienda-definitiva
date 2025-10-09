"use client"

import React, { memo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Trash2, 
  Copy, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline
} from 'lucide-react'
import { useTemplateEditor } from '../context/TemplateEditorContext'

export const PropertiesPanel = memo(() => {
  const { 
    state, 
    updateElement, 
    deleteElement, 
    duplicateElement,
    getSelectedElements 
  } = useTemplateEditor()

  const selectedElements = getSelectedElements()
  const selectedElement = selectedElements[0] // Por ahora solo soportamos un elemento

  const handlePropertyChange = useCallback((property: string, value: any) => {
    if (selectedElement) {
      updateElement(selectedElement.id, { [property]: value })
    }
  }, [selectedElement, updateElement])

  const handleDelete = useCallback(() => {
    if (selectedElement) {
      deleteElement(selectedElement.id)
    }
  }, [selectedElement, deleteElement])

  const handleDuplicate = useCallback(() => {
    if (selectedElement) {
      duplicateElement(selectedElement.id)
    }
  }, [selectedElement, duplicateElement])

  if (!selectedElement) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Propiedades</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Selecciona un elemento para editar sus propiedades
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      {/* Información del elemento */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Elemento: {selectedElement.type}</span>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePropertyChange('isLocked', !selectedElement.isLocked)}
                title={selectedElement.isLocked ? 'Desbloquear' : 'Bloquear'}
              >
                {selectedElement.isLocked ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  <Unlock className="w-3 h-3" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePropertyChange('isVisible', !selectedElement.isVisible)}
                title={selectedElement.isVisible ? 'Ocultar' : 'Mostrar'}
              >
                {selectedElement.isVisible ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3" />
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={handleDuplicate}>
              <Copy className="w-3 h-3 mr-1" />
              Duplicar
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-3 h-3 mr-1" />
              Eliminar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posición y tamaño */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Posición y Tamaño</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => handlePropertyChange('x', parseInt(e.target.value) || 0)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => handlePropertyChange('y', parseInt(e.target.value) || 0)}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Ancho</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => handlePropertyChange('width', parseInt(e.target.value) || 1)}
                min={1}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Alto</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => handlePropertyChange('height', parseInt(e.target.value) || 1)}
                min={1}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Rotación (grados)</Label>
            <Input
              type="number"
              value={selectedElement.rotation}
              onChange={(e) => handlePropertyChange('rotation', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">Opacidad</Label>
            <Input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={selectedElement.opacity}
              onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
              className="h-8"
            />
            <span className="text-xs text-gray-500">
              {Math.round(selectedElement.opacity * 100)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Propiedades específicas de texto */}
      {selectedElement.type === 'text' && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Texto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Contenido</Label>
              <Input
                value={selectedElement.text || ''}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Tamaño</Label>
                <Input
                  type="number"
                  value={selectedElement.fontSize || 16}
                  onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value) || 16)}
                  min={8}
                  max={200}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Familia</Label>
                <select
                  value={selectedElement.fontFamily || 'Arial'}
                  onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                  className="w-full h-8 text-xs border rounded px-2"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Color</Label>
              <Input
                type="color"
                value={selectedElement.fill || '#000000'}
                onChange={(e) => handlePropertyChange('fill', e.target.value)}
                className="h-8 w-full"
              />
            </div>

            {/* Botones de estilo */}
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant={selectedElement.fontWeight === 'bold' ? 'default' : 'outline'}
                onClick={() => handlePropertyChange('fontWeight', 
                  selectedElement.fontWeight === 'bold' ? 'normal' : 'bold'
                )}
              >
                <Bold className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant={selectedElement.fontStyle === 'italic' ? 'default' : 'outline'}
                onClick={() => handlePropertyChange('fontStyle', 
                  selectedElement.fontStyle === 'italic' ? 'normal' : 'italic'
                )}
              >
                <Italic className="w-3 h-3" />
              </Button>
            </div>

            {/* Alineación de texto */}
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant={selectedElement.textAlign === 'left' ? 'default' : 'outline'}
                onClick={() => handlePropertyChange('textAlign', 'left')}
              >
                <AlignLeft className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant={selectedElement.textAlign === 'center' ? 'default' : 'outline'}
                onClick={() => handlePropertyChange('textAlign', 'center')}
              >
                <AlignCenter className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant={selectedElement.textAlign === 'right' ? 'default' : 'outline'}
                onClick={() => handlePropertyChange('textAlign', 'right')}
              >
                <AlignRight className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant={selectedElement.textAlign === 'justify' ? 'default' : 'outline'}
                onClick={() => handlePropertyChange('textAlign', 'justify')}
              >
                <AlignJustify className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Propiedades específicas de formas */}
      {selectedElement.type === 'shape' && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Forma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Tipo</Label>
              <select
                value={selectedElement.shapeType || 'rectangle'}
                onChange={(e) => handlePropertyChange('shapeType', e.target.value)}
                className="w-full h-8 text-xs border rounded px-2"
              >
                <option value="rectangle">Rectángulo</option>
                <option value="circle">Círculo</option>
                <option value="star">Estrella</option>
                <option value="heart">Corazón</option>
              </select>
            </div>

            <div>
              <Label className="text-xs">Color de relleno</Label>
              <div className="flex space-x-2">
                <Input
                  type="color"
                  value={selectedElement.fillColor === 'transparent' ? '#ffffff' : (selectedElement.fillColor || '#ff6b35')}
                  onChange={(e) => handlePropertyChange('fillColor', e.target.value)}
                  className="h-8 w-16"
                />
                <Button
                  size="sm"
                  variant={selectedElement.fillColor === 'transparent' ? 'default' : 'outline'}
                  onClick={() => handlePropertyChange('fillColor', 
                    selectedElement.fillColor === 'transparent' ? '#ff6b35' : 'transparent'
                  )}
                  className="text-xs"
                >
                  {selectedElement.fillColor === 'transparent' ? 'Sin relleno' : 'Transparente'}
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-xs">Color de borde</Label>
              <Input
                type="color"
                value={selectedElement.strokeColor || '#000000'}
                onChange={(e) => handlePropertyChange('strokeColor', e.target.value)}
                className="h-8 w-full"
              />
            </div>

            <div>
              <Label className="text-xs">Grosor de borde</Label>
              <Input
                type="number"
                value={selectedElement.strokeWidth || 0}
                onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value) || 0)}
                min={0}
                max={20}
                className="h-8 text-xs"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de Z-Index */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Capas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label className="text-xs">Nivel (Z-Index)</Label>
            <Input
              type="number"
              value={selectedElement.zIndex}
              onChange={(e) => handlePropertyChange('zIndex', parseInt(e.target.value) || 0)}
              className="h-8 text-xs"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handlePropertyChange('zIndex', selectedElement.zIndex + 1)}
            >
              Traer adelante
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handlePropertyChange('zIndex', Math.max(0, selectedElement.zIndex - 1))}
            >
              Enviar atrás
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

PropertiesPanel.displayName = 'PropertiesPanel'