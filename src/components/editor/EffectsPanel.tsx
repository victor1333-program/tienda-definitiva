'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Sun, 
  Moon,
  Zap,
  Layers,
  Eye,
  EyeOff,
  Palette,
  Brush,
  Wand2
} from 'lucide-react'

interface EffectsPanelProps {
  selectedElement: any
  onUpdateElement: (updates: any) => void
}

export default function EffectsPanel({ selectedElement, onUpdateElement }: EffectsPanelProps) {
  const [activeTab, setActiveTab] = useState<'opacity' | 'shadow' | 'stroke' | 'gradient' | 'filters'>('opacity')

  if (!selectedElement) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-gray-500">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Selecciona un elemento para aplicar efectos</p>
        </CardContent>
      </Card>
    )
  }

  const tabs = [
    { id: 'opacity', name: 'Opacidad', icon: <Eye className="w-4 h-4" /> },
    { id: 'shadow', name: 'Sombra', icon: <Sun className="w-4 h-4" /> },
    { id: 'stroke', name: 'Borde', icon: <Brush className="w-4 h-4" /> },
    { id: 'gradient', name: 'Degradado', icon: <Palette className="w-4 h-4" /> },
    { id: 'filters', name: 'Filtros', icon: <Wand2 className="w-4 h-4" /> },
  ]

  const handleOpacityChange = (opacity: number) => {
    onUpdateElement({ opacity: opacity / 100 })
  }

  const handleShadowChange = (field: string, value: any) => {
    const currentShadow = selectedElement.shadow || {
      color: '#000000',
      blur: 0,
      offsetX: 0,
      offsetY: 0
    }
    
    onUpdateElement({
      shadow: {
        ...currentShadow,
        [field]: value
      }
    })
  }

  const handleGradientChange = (gradient: any) => {
    onUpdateElement({ gradient })
  }

  const applyPresetShadow = (preset: string) => {
    const presets = {
      none: null,
      soft: { color: '#00000020', blur: 10, offsetX: 0, offsetY: 2 },
      medium: { color: '#00000040', blur: 15, offsetX: 0, offsetY: 4 },
      hard: { color: '#00000060', blur: 5, offsetX: 2, offsetY: 4 },
      glow: { color: '#3b82f680', blur: 20, offsetX: 0, offsetY: 0 }
    }
    
    onUpdateElement({ shadow: presets[preset as keyof typeof presets] })
  }

  const handleStrokeChange = (field: string, value: any) => {
    onUpdateElement({ [field]: value })
  }

  const toggleStrokeTransparency = () => {
    if (selectedElement.strokeColor === 'transparent' || !selectedElement.strokeColor) {
      // Make stroke visible
      const strokeWidth = selectedElement.strokeWidth || 0
      onUpdateElement({ 
        strokeColor: '#1e40af',
        strokeWidth: strokeWidth < 1 ? 1 : strokeWidth
      })
    } else {
      // Make stroke transparent
      onUpdateElement({ strokeColor: 'transparent' })
    }
  }

  const toggleFillTransparency = () => {
    if (selectedElement.fillColor === 'transparent' || !selectedElement.fillColor) {
      // Make fill visible
      onUpdateElement({ fillColor: '#3b82f6' })
    } else {
      // Make fill transparent
      onUpdateElement({ fillColor: 'transparent' })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Efectos Visuales
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* Opacity Tab */}
        {activeTab === 'opacity' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Opacidad</label>
                <span className="text-sm text-gray-500">
                  {Math.round((selectedElement.opacity || 1) * 100)}%
                </span>
              </div>
              <Input
                type="range"
                min="0"
                max="100"
                value={(selectedElement.opacity || 1) * 100}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpacityChange(25)}
                className="flex-1"
              >
                25%
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpacityChange(50)}
                className="flex-1"
              >
                50%
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpacityChange(75)}
                className="flex-1"
              >
                75%
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpacityChange(100)}
                className="flex-1"
              >
                100%
              </Button>
            </div>
          </div>
        )}

        {/* Shadow Tab */}
        {activeTab === 'shadow' && (
          <div className="space-y-4">
            {/* Preset Shadows */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sombras predefinidas</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => applyPresetShadow('none')}
                  className="text-xs"
                >
                  Sin sombra
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => applyPresetShadow('soft')}
                  className="text-xs"
                >
                  Suave
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => applyPresetShadow('medium')}
                  className="text-xs"
                >
                  Media
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => applyPresetShadow('hard')}
                  className="text-xs"
                >
                  Fuerte
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => applyPresetShadow('glow')}
                  className="text-xs col-span-2"
                >
                  Resplandor
                </Button>
              </div>
            </div>

            {/* Custom Shadow */}
            {selectedElement.shadow && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Color de sombra</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={selectedElement.shadow.color || '#000000'}
                      onChange={(e) => handleShadowChange('color', e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      type="text"
                      value={selectedElement.shadow.color || '#000000'}
                      onChange={(e) => handleShadowChange('color', e.target.value)}
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Desenfoque ({selectedElement.shadow.blur || 0}px)
                  </label>
                  <Input
                    type="range"
                    min="0"
                    max="50"
                    value={selectedElement.shadow.blur || 0}
                    onChange={(e) => handleShadowChange('blur', Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Offset X ({selectedElement.shadow.offsetX || 0}px)
                    </label>
                    <Input
                      type="range"
                      min="-20"
                      max="20"
                      value={selectedElement.shadow.offsetX || 0}
                      onChange={(e) => handleShadowChange('offsetX', Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Offset Y ({selectedElement.shadow.offsetY || 0}px)
                    </label>
                    <Input
                      type="range"
                      min="-20"
                      max="20"
                      value={selectedElement.shadow.offsetY || 0}
                      onChange={(e) => handleShadowChange('offsetY', Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stroke Tab */}
        {activeTab === 'stroke' && selectedElement.type === 'shape' && (
          <div className="space-y-4">
            {/* Fill Controls */}
            <div>
              <label className="text-sm font-medium mb-2 block">Color de Relleno</label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="color"
                  value={selectedElement.fillColor === 'transparent' ? '#3b82f6' : (selectedElement.fillColor || '#3b82f6')}
                  onChange={(e) => handleStrokeChange('fillColor', e.target.value)}
                  className="w-12 h-8 p-1"
                  disabled={selectedElement.fillColor === 'transparent'}
                />
                <Input
                  type="text"
                  value={selectedElement.fillColor === 'transparent' ? 'transparente' : (selectedElement.fillColor || '#3b82f6')}
                  onChange={(e) => handleStrokeChange('fillColor', e.target.value)}
                  className="flex-1 text-xs"
                  disabled={selectedElement.fillColor === 'transparent'}
                />
              </div>
              <Button
                size="sm"
                variant={selectedElement.fillColor === 'transparent' ? 'default' : 'outline'}
                onClick={toggleFillTransparency}
                className="w-full"
              >
                {selectedElement.fillColor === 'transparent' ? (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Mostrar Relleno
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" />
                    Ocultar Relleno
                  </>
                )}
              </Button>
            </div>

            {/* Stroke Controls */}
            <div>
              <label className="text-sm font-medium mb-2 block">Color de Borde</label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="color"
                  value={selectedElement.strokeColor === 'transparent' ? '#1e40af' : (selectedElement.strokeColor || '#1e40af')}
                  onChange={(e) => {
                    const strokeWidth = selectedElement.strokeWidth || 0
                    handleStrokeChange('strokeColor', e.target.value)
                    if (strokeWidth < 1) {
                      handleStrokeChange('strokeWidth', 1)
                    }
                  }}
                  className="w-12 h-8 p-1"
                  disabled={selectedElement.strokeColor === 'transparent'}
                />
                <Input
                  type="text"
                  value={selectedElement.strokeColor === 'transparent' ? 'transparente' : (selectedElement.strokeColor || '#1e40af')}
                  onChange={(e) => {
                    const strokeWidth = selectedElement.strokeWidth || 0
                    handleStrokeChange('strokeColor', e.target.value)
                    if (strokeWidth < 1) {
                      handleStrokeChange('strokeWidth', 1)
                    }
                  }}
                  className="flex-1 text-xs"
                  disabled={selectedElement.strokeColor === 'transparent'}
                />
              </div>
              <Button
                size="sm"
                variant={selectedElement.strokeColor === 'transparent' ? 'default' : 'outline'}
                onClick={toggleStrokeTransparency}
                className="w-full mb-3"
              >
                {selectedElement.strokeColor === 'transparent' ? (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Mostrar Borde
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" />
                    Ocultar Borde
                  </>
                )}
              </Button>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Grosor del Borde ({selectedElement.strokeWidth || 0}px)
                </label>
                <Input
                  type="range"
                  min="0"
                  max="20"
                  value={selectedElement.strokeWidth || 0}
                  onChange={(e) => handleStrokeChange('strokeWidth', Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Quick Stroke Presets */}
            <div>
              <label className="text-sm font-medium mb-2 block">Bordes Predefinidos</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateElement({ strokeColor: 'transparent', strokeWidth: 0 })}
                  className="text-xs"
                >
                  Sin Borde
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateElement({ strokeColor: '#000000', strokeWidth: 1 })}
                  className="text-xs"
                >
                  Fino Negro
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateElement({ strokeColor: '#1e40af', strokeWidth: 2 })}
                  className="text-xs"
                >
                  Medio Azul
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateElement({ strokeColor: '#dc2626', strokeWidth: 3 })}
                  className="text-xs"
                >
                  Grueso Rojo
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Gradient Tab */}
        {activeTab === 'gradient' && (
          <div className="space-y-4">
            <div className="text-center text-gray-500 py-8">
              <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Degradados disponibles en la próxima versión</p>
            </div>
          </div>
        )}

        {/* Filters Tab */}
        {activeTab === 'filters' && (
          <div className="space-y-4">
            <div className="text-center text-gray-500 py-8">
              <Wand2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Filtros disponibles en la próxima versión</p>
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Vista previa</h4>
          <div className="flex justify-center">
            <div
              className="w-16 h-16 bg-blue-500 rounded"
              style={{
                opacity: selectedElement.opacity || 1,
                boxShadow: selectedElement.shadow 
                  ? `${selectedElement.shadow.offsetX || 0}px ${selectedElement.shadow.offsetY || 0}px ${selectedElement.shadow.blur || 0}px ${selectedElement.shadow.color || '#000000'}`
                  : 'none'
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}