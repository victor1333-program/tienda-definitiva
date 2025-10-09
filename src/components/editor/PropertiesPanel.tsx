"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  RotateCw,
  Move,
  Maximize2,
  Eye,
  Palette,
  Type,
  Settings
} from "lucide-react"

interface PropertiesPanelProps {
  selectedElement: any
  onPropertyChange: (property: string, value: any) => void
}

export default function PropertiesPanel({ selectedElement, onPropertyChange }: PropertiesPanelProps) {
  const [properties, setProperties] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    fill: '#000000',
    stroke: '#000000',
    strokeWidth: 0,
    fontSize: 16,
    fontFamily: 'Arial',
    text: '',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    customName: ''
  })

  const [selectedObject, setSelectedObject] = useState<any>(null)

  useEffect(() => {
    // Listen for canvas selection changes
    const updateSelectedObject = () => {
      const canvas = (window as any).zakekeCanvas?.canvas
      if (canvas) {
        const activeObject = canvas.getActiveObject()
        setSelectedObject(activeObject)
        
        if (activeObject) {
          updatePropertiesFromObject(activeObject)
        }
      }
    }

    // Set up canvas event listeners
    const canvas = (window as any).zakekeCanvas?.canvas
    if (canvas) {
      canvas.on('selection:created', updateSelectedObject)
      canvas.on('selection:updated', updateSelectedObject)
      canvas.on('selection:cleared', () => setSelectedObject(null))
      canvas.on('object:modified', updateSelectedObject)
    }

    updateSelectedObject()

    return () => {
      if (canvas) {
        canvas.off('selection:created', updateSelectedObject)
        canvas.off('selection:updated', updateSelectedObject)
        canvas.off('selection:cleared', () => setSelectedObject(null))
        canvas.off('object:modified', updateSelectedObject)
      }
    }
  }, [])

  const updatePropertiesFromObject = (obj: any) => {
    if (!obj) return

    setProperties({
      x: Math.round(obj.left || 0),
      y: Math.round(obj.top || 0),
      width: Math.round(obj.getScaledWidth() || 0),
      height: Math.round(obj.getScaledHeight() || 0),
      rotation: Math.round(obj.angle || 0),
      scaleX: obj.scaleX || 1,
      scaleY: obj.scaleY || 1,
      opacity: obj.opacity || 1,
      fill: obj.fill || '#000000',
      stroke: obj.stroke || '#000000',
      strokeWidth: obj.strokeWidth || 0,
      fontSize: obj.fontSize || 16,
      fontFamily: obj.fontFamily || 'Arial',
      text: obj.text || '',
      fontWeight: obj.fontWeight || 'normal',
      fontStyle: obj.fontStyle || 'normal',
      textAlign: obj.textAlign || 'left',
      customName: obj.customName || ''
    })
  }

  const updateObjectProperty = (property: string, value: any) => {
    if (!selectedObject) return

    const canvas = (window as any).zakekeCanvas?.canvas
    if (canvas) {
      selectedObject.set(property, value)
      canvas.renderAll()
      onPropertyChange(property, value)
    }
  }

  const handlePropertyChange = (property: string, value: any) => {
    setProperties(prev => ({ ...prev, [property]: value }))
    updateObjectProperty(property, value)
  }

  const handlePositionChange = (property: 'left' | 'top', value: number) => {
    setProperties(prev => ({ 
      ...prev, 
      [property === 'left' ? 'x' : 'y']: value 
    }))
    updateObjectProperty(property, value)
  }

  const handleScaleChange = (property: 'scaleX' | 'scaleY', value: number) => {
    setProperties(prev => ({ 
      ...prev, 
      [property]: value 
    }))
    updateObjectProperty(property, value)
    
    // Update width/height display
    if (selectedObject) {
      setProperties(prev => ({
        ...prev,
        width: Math.round(selectedObject.getScaledWidth()),
        height: Math.round(selectedObject.getScaledHeight())
      }))
    }
  }

  const resetTransform = () => {
    if (!selectedObject) return
    
    selectedObject.set({
      left: 50,
      top: 50,
      scaleX: 1,
      scaleY: 1,
      angle: 0
    })
    
    const canvas = (window as any).zakekeCanvas?.canvas
    if (canvas) {
      canvas.renderAll()
      updatePropertiesFromObject(selectedObject)
    }
  }

  const duplicateObject = () => {
    if (!selectedObject) return
    
    selectedObject.clone((cloned: any) => {
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
      })
      
      const canvas = (window as any).zakekeCanvas?.canvas
      if (canvas) {
        canvas.add(cloned)
        canvas.setActiveObject(cloned)
        canvas.renderAll()
      }
    })
  }

  const deleteObject = () => {
    if (!selectedObject) return
    
    const canvas = (window as any).zakekeCanvas?.canvas
    if (canvas) {
      canvas.remove(selectedObject)
      canvas.renderAll()
      setSelectedObject(null)
    }
  }

  if (!selectedObject) {
    return (
      <div className="p-4 space-y-4">
        <div className="text-center py-8">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Selecciona un elemento para ver sus propiedades</p>
        </div>
      </div>
    )
  }

  const isTextObject = selectedObject.type === 'text' || selectedObject.type === 'i-text'
  const isImageObject = selectedObject.type === 'image'
  const isShapeObject = ['rect', 'circle', 'triangle'].includes(selectedObject.type)

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Propiedades</h3>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={duplicateObject}>
            Duplicar
          </Button>
          <Button variant="outline" size="sm" onClick={deleteObject}>
            Eliminar
          </Button>
        </div>
      </div>

      {/* Transform Properties */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Move className="h-4 w-4" />
            Transformación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Position */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={properties.x}
                onChange={(e) => handlePositionChange('left', parseInt(e.target.value) || 0)}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={properties.y}
                onChange={(e) => handlePositionChange('top', parseInt(e.target.value) || 0)}
                className="h-8"
              />
            </div>
          </div>

          {/* Size */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Ancho</Label>
              <div className="text-xs text-gray-500">{properties.width}px</div>
            </div>
            <div>
              <Label className="text-xs">Alto</Label>
              <div className="text-xs text-gray-500">{properties.height}px</div>
            </div>
          </div>

          {/* Scale */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Escala X</Label>
              <Input
                type="number"
                step="0.1"
                value={properties.scaleX}
                onChange={(e) => handleScaleChange('scaleX', parseFloat(e.target.value) || 1)}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Escala Y</Label>
              <Input
                type="number"
                step="0.1"
                value={properties.scaleY}
                onChange={(e) => handleScaleChange('scaleY', parseFloat(e.target.value) || 1)}
                className="h-8"
              />
            </div>
          </div>

          {/* Rotation */}
          <div>
            <Label className="text-xs flex items-center gap-1">
              <RotateCw className="h-3 w-3" />
              Rotación: {properties.rotation}°
            </Label>
            <Slider
              value={[properties.rotation]}
              onValueChange={(value) => handlePropertyChange('angle', value[0])}
              min={-180}
              max={180}
              step={1}
              className="mt-2"
            />
          </div>

          {/* Opacity */}
          <div>
            <Label className="text-xs flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Opacidad: {Math.round(properties.opacity * 100)}%
            </Label>
            <Slider
              value={[properties.opacity]}
              onValueChange={(value) => handlePropertyChange('opacity', value[0])}
              min={0}
              max={1}
              step={0.01}
              className="mt-2"
            />
          </div>

          <Button variant="outline" size="sm" onClick={resetTransform} className="w-full">
            Resetear Transformación
          </Button>
        </CardContent>
      </Card>

      {/* Text Properties */}
      {isTextObject && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Type className="h-4 w-4" />
              Texto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Contenido</Label>
              <Input
                value={properties.text}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
                className="h-8"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Tamaño</Label>
                <Input
                  type="number"
                  value={properties.fontSize}
                  onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value) || 16)}
                  className="h-8"
                  min={8}
                  max={72}
                />
              </div>
              <div>
                <Label className="text-xs">Familia</Label>
                <select 
                  value={properties.fontFamily}
                  onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                  className="w-full h-8 px-2 border border-gray-300 rounded text-sm"
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
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={properties.fill}
                  onChange={(e) => handlePropertyChange('fill', e.target.value)}
                  className="h-8 w-16 p-1"
                />
                <Input
                  type="text"
                  value={properties.fill}
                  onChange={(e) => handlePropertyChange('fill', e.target.value)}
                  className="h-8 flex-1 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Properties */}
      {isImageObject && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Propiedades de Imagen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Nombre Personalizado</Label>
              <Input
                value={properties.customName}
                onChange={(e) => handlePropertyChange('customName', e.target.value)}
                className="h-8"
                placeholder="Nombre para mostrar en la lista de capas"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shape Properties */}
      {isShapeObject && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Propiedades de Forma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Nombre Personalizado</Label>
              <Input
                value={properties.customName}
                onChange={(e) => handlePropertyChange('customName', e.target.value)}
                className="h-8"
                placeholder="Nombre para mostrar en la lista de capas"
              />
            </div>
            
            <div>
              <Label className="text-xs">Color de Relleno</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={properties.fill}
                  onChange={(e) => handlePropertyChange('fill', e.target.value)}
                  className="h-8 w-16 p-1"
                />
                <Input
                  type="text"
                  value={properties.fill}
                  onChange={(e) => handlePropertyChange('fill', e.target.value)}
                  className="h-8 flex-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Color de Borde</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={properties.stroke}
                  onChange={(e) => handlePropertyChange('stroke', e.target.value)}
                  className="h-8 w-16 p-1"
                />
                <Input
                  type="text"
                  value={properties.stroke}
                  onChange={(e) => handlePropertyChange('stroke', e.target.value)}
                  className="h-8 flex-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Grosor de Borde</Label>
              <Input
                type="number"
                value={properties.strokeWidth}
                onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value) || 0)}
                className="h-8"
                min={0}
                max={20}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}