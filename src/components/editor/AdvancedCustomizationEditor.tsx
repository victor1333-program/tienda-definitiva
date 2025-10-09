"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Palette,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Triangle,
  Star,
  Heart,
  Upload,
  Download,
  Undo,
  Redo,
  MousePointer,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Grid3X3,
  Wand2,
  Save,
  DollarSign,
  Target
} from 'lucide-react'
import {
  STANDARD_CANVAS_SIZE,
  relativeToAbsolute,
  scaleImageToCanvas,
  calculatePrintAreaOnScaledImage,
  type RelativeCoordinates,
  type AbsoluteCoordinates
} from "@/lib/canvas-utils"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { toast } from 'react-hot-toast'

interface DesignElement {
  id: string
  type: 'text' | 'image' | 'shape' | 'background'
  content: any
  style: {
    x: number
    y: number
    width: number
    height: number
    rotation: number
    opacity: number
    zIndex: number
    locked: boolean
    visible: boolean
  }
  pricing?: {
    basePrice: number
    complexity: 'simple' | 'medium' | 'complex'
    timeEstimate: number // minutes
  }
}

interface CustomizationArea {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  maxElements: number
  allowedTypes: string[]
  // Nuevos campos para coordenadas relativas
  isRelativeCoordinates?: boolean
  referenceWidth?: number
  referenceHeight?: number
  pricing: {
    basePrice: number
    pricePerElement: number
    complexityMultiplier: {
      simple: number
      medium: number
      complex: number
    }
  }
}

interface AdvancedCustomizationEditorProps {
  productId?: string
  variantId?: string
  templateId?: string
  customizationAreas?: CustomizationArea[]
  onSave?: (design: any, pricing: any) => void
  onPriceChange?: (totalPrice: number) => void
  readOnly?: boolean
  showPricing?: boolean
}

export default function AdvancedCustomizationEditor({
  productId,
  variantId,
  templateId,
  customizationAreas = [],
  onSave,
  onPriceChange,
  readOnly = false,
  showPricing = true
}: AdvancedCustomizationEditorProps) {
  // Canvas and design state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [elements, setElements] = useState<DesignElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [selectedTool, setSelectedTool] = useState<string>('select')
  const [canvasSize, setCanvasSize] = useState(STANDARD_CANVAS_SIZE)
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(true)
  
  // Editor state
  const [undoStack, setUndoStack] = useState<any[]>([])
  const [redoStack, setRedoStack] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  // Pricing state
  const [totalPrice, setTotalPrice] = useState(0)
  const [priceBreakdown, setPriceBreakdown] = useState<any>({})
  
  // Presets and templates
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([])
  const [colorPalettes, setColorPalettes] = useState<any[]>([
    {
      name: 'Clásico',
      colors: ['#000000', '#FFFFFF', '#808080', '#C0C0C0']
    },
    {
      name: 'Elegante',
      colors: ['#2C3E50', '#ECF0F1', '#E74C3C', '#F39C12']
    },
    {
      name: 'Romántico',
      colors: ['#E91E63', '#F8BBD9', '#FFFFFF', '#FFE0E6']
    },
    {
      name: 'Corporativo',
      colors: ['#1E3A8A', '#3B82F6', '#E5E7EB', '#F3F4F6']
    }
  ])
  
  // Tool configurations
  const tools = [
    { id: 'select', label: 'Seleccionar', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'text', label: 'Texto', icon: <Type className="w-4 h-4" /> },
    { id: 'image', label: 'Imagen', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'shapes', label: 'Formas', icon: <Square className="w-4 h-4" /> },
    { id: 'background', label: 'Fondo', icon: <Palette className="w-4 h-4" /> }
  ]
  
  const shapes = [
    { id: 'rectangle', label: 'Rectángulo', icon: <Square className="w-4 h-4" /> },
    { id: 'circle', label: 'Círculo', icon: <Circle className="w-4 h-4" /> },
    { id: 'triangle', label: 'Triángulo', icon: <Triangle className="w-4 h-4" /> },
    { id: 'star', label: 'Estrella', icon: <Star className="w-4 h-4" /> },
    { id: 'heart', label: 'Corazón', icon: <Heart className="w-4 h-4" /> }
  ]

  // Load initial data
  useEffect(() => {
    loadTemplates()
    if (templateId) {
      loadTemplate(templateId)
    }
  }, [templateId])

  // Update pricing when elements change
  useEffect(() => {
    calculatePricing()
  }, [elements, customizationAreas])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates?category=customization')
      if (response.ok) {
        const templates = await response.json()
        setAvailableTemplates(templates)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const loadTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/templates/${id}`)
      if (response.ok) {
        const template = await response.json()
        setElements(template.elements || [])
        setCanvasSize(template.canvasSize || { width: 800, height: 600 })
      }
    } catch (error) {
      console.error('Error loading template:', error)
      toast.error('Error al cargar la plantilla')
    }
  }

  const calculatePricing = useCallback(() => {
    let total = 0
    const breakdown: any = {
      base: 0,
      elements: {},
      areas: {},
      complexity: {}
    }

    // Calculate pricing for each customization area
    customizationAreas.forEach(area => {
      const areaElements = elements.filter(el => 
        isElementInArea(el, area)
      )
      
      let areaPrice = area.pricing.basePrice
      
      areaElements.forEach(element => {
        const elementPrice = area.pricing.pricePerElement
        const complexityMultiplier = area.pricing.complexityMultiplier[element.pricing?.complexity || 'simple']
        const finalElementPrice = elementPrice * complexityMultiplier
        
        areaPrice += finalElementPrice
        
        breakdown.elements[element.id] = finalElementPrice
        breakdown.complexity[element.pricing?.complexity || 'simple'] = 
          (breakdown.complexity[element.pricing?.complexity || 'simple'] || 0) + finalElementPrice
      })
      
      breakdown.areas[area.id] = areaPrice
      total += areaPrice
    })

    // Add base pricing for elements outside areas
    const elementsOutsideAreas = elements.filter(el => 
      !customizationAreas.some(area => isElementInArea(el, area))
    )
    
    elementsOutsideAreas.forEach(element => {
      const price = element.pricing?.basePrice || 2
      breakdown.elements[element.id] = price
      total += price
    })

    breakdown.base = total
    setPriceBreakdown(breakdown)
    setTotalPrice(total)
    
    if (onPriceChange) {
      onPriceChange(total)
    }
  }, [elements, customizationAreas, onPriceChange])

  // Función para convertir áreas a coordenadas absolutas en el canvas actual
  const getAbsoluteAreaCoordinates = useCallback((area: CustomizationArea): AbsoluteCoordinates => {
    if (area.isRelativeCoordinates) {
      // Ya está en formato relativo, convertir directamente
      const relativeCoords: RelativeCoordinates = {
        x: area.x,
        y: area.y,
        width: area.width,
        height: area.height
      }
      return relativeToAbsolute(relativeCoords, canvasSize)
    } else {
      // Coordenadas absolutas legacy, usar referencia o canvas estándar
      const referenceSize = {
        width: area.referenceWidth || STANDARD_CANVAS_SIZE.width,
        height: area.referenceHeight || STANDARD_CANVAS_SIZE.height
      }
      
      // Convertir a relativas y luego a absolutas
      const relativeCoords: RelativeCoordinates = {
        x: (area.x / referenceSize.width) * 100,
        y: (area.y / referenceSize.height) * 100,
        width: (area.width / referenceSize.width) * 100,
        height: (area.height / referenceSize.height) * 100
      }
      
      return relativeToAbsolute(relativeCoords, canvasSize)
    }
  }, [canvasSize])

  const isElementInArea = (element: DesignElement, area: CustomizationArea): boolean => {
    const absoluteArea = getAbsoluteAreaCoordinates(area)
    
    return element.style.x >= absoluteArea.x && 
           element.style.y >= absoluteArea.y &&
           element.style.x + element.style.width <= absoluteArea.x + absoluteArea.width &&
           element.style.y + element.style.height <= absoluteArea.y + absoluteArea.height
  }

  const addElement = (type: string, config: any = {}) => {
    const newElement: DesignElement = {
      id: `element-${Date.now()}`,
      type: type as any,
      content: config.content || getDefaultContent(type),
      style: {
        x: config.x || 100,
        y: config.y || 100,
        width: config.width || 200,
        height: config.height || 100,
        rotation: 0,
        opacity: 1,
        zIndex: elements.length,
        locked: false,
        visible: true
      },
      pricing: {
        basePrice: config.basePrice || getPricingForElementType(type),
        complexity: config.complexity || getComplexityForType(type),
        timeEstimate: config.timeEstimate || getTimeEstimateForType(type)
      }
    }
    
    setElements(prev => [...prev, newElement])
    setSelectedElement(newElement.id)
    saveToHistory()
  }

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text':
        return { text: 'Texto personalizado', fontSize: 24, fontFamily: 'Arial', color: '#000000' }
      case 'shape':
        return { shape: 'rectangle', fillColor: '#3B82F6', strokeColor: '#1E40AF', strokeWidth: 2 }
      case 'image':
        return { src: null, filters: {} }
      default:
        return {}
    }
  }

  const getPricingForElementType = (type: string): number => {
    const pricing = {
      text: 1.5,
      image: 3.0,
      shape: 2.0,
      background: 5.0
    }
    return pricing[type as keyof typeof pricing] || 1.0
  }

  const getComplexityForType = (type: string): 'simple' | 'medium' | 'complex' => {
    const complexity = {
      text: 'simple',
      shape: 'simple',
      image: 'medium',
      background: 'complex'
    }
    return complexity[type as keyof typeof complexity] || 'simple'
  }

  const getTimeEstimateForType = (type: string): number => {
    const estimates = {
      text: 5,
      shape: 10,
      image: 15,
      background: 20
    }
    return estimates[type as keyof typeof estimates] || 5
  }

  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ))
    saveToHistory()
  }

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id))
    if (selectedElement === id) {
      setSelectedElement(null)
    }
    saveToHistory()
  }

  const duplicateElement = (id: string) => {
    const element = elements.find(el => el.id === id)
    if (!element) return
    
    const duplicated = {
      ...element,
      id: `element-${Date.now()}`,
      style: {
        ...element.style,
        x: element.style.x + 20,
        y: element.style.y + 20,
        zIndex: elements.length
      }
    }
    
    setElements(prev => [...prev, duplicated])
    setSelectedElement(duplicated.id)
    saveToHistory()
  }

  const saveToHistory = () => {
    setUndoStack(prev => [...prev.slice(-20), { elements }])
    setRedoStack([])
  }

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const currentState = { elements }
      setRedoStack(prev => [...prev, currentState])
      
      const previousState = undoStack[undoStack.length - 1]
      setUndoStack(prev => prev.slice(0, -1))
      setElements(previousState.elements)
    }
  }

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const currentState = { elements }
      setUndoStack(prev => [...prev, currentState])
      
      const nextState = redoStack[redoStack.length - 1]
      setRedoStack(prev => prev.slice(0, -1))
      setElements(nextState.elements)
    }
  }

  const handleSave = () => {
    const designData = {
      elements,
      canvasSize,
      customizationAreas,
      totalPrice,
      priceBreakdown,
      metadata: {
        productId,
        variantId,
        templateId,
        createdAt: new Date().toISOString()
      }
    }
    
    const pricingData = {
      total: totalPrice,
      breakdown: priceBreakdown,
      areas: customizationAreas.map(area => ({
        id: area.id,
        name: area.name,
        price: priceBreakdown.areas[area.id] || 0
      }))
    }
    
    if (onSave) {
      onSave(designData, pricingData)
    }
    
    toast.success('Diseño guardado correctamente')
  }

  const exportDesign = async (format: 'png' | 'jpg' | 'svg' | 'pdf') => {
    try {
      // Implementation for exporting the canvas
      const canvas = canvasRef.current
      if (!canvas) return
      
      let dataURL: string
      
      if (format === 'svg') {
        // Generate SVG from elements
        const svgContent = generateSVG()
        dataURL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent)
      } else {
        // Use canvas for bitmap formats
        dataURL = canvas.toDataURL(`image/${format}`, 0.9)
      }
      
      // Download
      const link = document.createElement('a')
      link.download = `diseño-personalizado.${format}`
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success(`Diseño exportado como ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('Error al exportar el diseño')
    }
  }

  const generateSVG = (): string => {
    // Generate SVG from current elements
    let svg = `<svg width="${canvasSize.width}" height="${canvasSize.height}" xmlns="http://www.w3.org/2000/svg">`
    
    elements
      .filter(el => el.style.visible)
      .sort((a, b) => a.style.zIndex - b.style.zIndex)
      .forEach(element => {
        // Add each element to SVG based on type
        switch (element.type) {
          case 'text':
            svg += `<text x="${element.style.x}" y="${element.style.y}" font-size="${element.content.fontSize}" font-family="${element.content.fontFamily}" fill="${element.content.color}">${element.content.text}</text>`
            break
          case 'shape':
            if (element.content.shape === 'rectangle') {
              svg += `<rect x="${element.style.x}" y="${element.style.y}" width="${element.style.width}" height="${element.style.height}" fill="${element.content.fillColor}" stroke="${element.content.strokeColor}" stroke-width="${element.content.strokeWidth}"/>`
            } else if (element.content.shape === 'circle') {
              const cx = element.style.x + element.style.width / 2
              const cy = element.style.y + element.style.height / 2
              const r = Math.min(element.style.width, element.style.height) / 2
              svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${element.content.fillColor}" stroke="${element.content.strokeColor}" stroke-width="${element.content.strokeWidth}"/>`
            }
            break
        }
      })
    
    svg += '</svg>'
    return svg
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Editor de Personalización</h2>
          <p className="text-sm text-gray-600">Personaliza tu producto</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
              showGrid ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
            Cuadrícula
          </button>
          <Select onValueChange={(format) => exportDesign(format as any)}>
            <SelectTrigger asChild>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </button>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG (Alta calidad)</SelectItem>
              <SelectItem value="jpg">JPG (Tamaño reducido)</SelectItem>
              <SelectItem value="svg">SVG (Vectorial)</SelectItem>
              <SelectItem value="pdf">PDF (Impresión)</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={handleSave}
            disabled={readOnly}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Guardar
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-1 mr-4">
          <button
            onClick={() => setSelectedTool('select')}
            className={`p-2 rounded ${selectedTool === 'select' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
            title="Seleccionar (V)"
          >
            <MousePointer className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedTool('text')}
            className={`p-2 rounded ${selectedTool === 'text' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
            title="Texto (T)"
          >
            <Type className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedTool('image')}
            className={`p-2 rounded ${selectedTool === 'image' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
            title="Imagen (I)"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedTool('shape')}
            className={`p-2 rounded ${selectedTool === 'shape' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
            title="Formas (S)"
          >
            <Square className="h-4 w-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300 mr-4" />

        <div className="flex items-center gap-1">
          <button 
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className={`p-2 rounded ${undoStack.length === 0 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200'}`} 
            title="Deshacer (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button 
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className={`p-2 rounded ${redoStack.length === 0 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200'}`} 
            title="Rehacer (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Zoom:</span>
          <button
            onClick={() => setZoom(Math.max(25, zoom - 25))}
            className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            -
          </button>
          <span className="text-sm font-medium min-w-[3rem] text-center">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(Math.min(400, zoom + 25))}
            className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            +
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Elements Library */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Elementos
            </h3>
            <Tabs defaultValue="tools" className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-none">
                <TabsTrigger value="tools" className="text-xs">Herramientas</TabsTrigger>
                <TabsTrigger value="assets" className="text-xs">Assets</TabsTrigger>
                <TabsTrigger value="layers" className="text-xs">Capas</TabsTrigger>
              </TabsList>

            {/* Tools Panel */}
            <TabsContent value="tools" className="flex-1 p-4 space-y-4">
              {/* Tool Selection */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Herramientas</Label>
                <div className="grid grid-cols-2 gap-2">
                  {tools.map(tool => (
                    <Button
                      key={tool.id}
                      variant={selectedTool === tool.id ? "default" : "outline"}
                      size="sm"
                      className="justify-start"
                      onClick={() => setSelectedTool(tool.id)}
                    >
                      {tool.icon}
                      <span className="ml-2 text-xs">{tool.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tool-specific options */}
              {selectedTool === 'text' && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Añadir Texto</Label>
                  <Button
                    className="w-full"
                    onClick={() => addElement('text', { 
                      content: { text: 'Nuevo texto', fontSize: 24, color: '#000000' } 
                    })}
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Añadir texto
                  </Button>
                </div>
              )}

              {selectedTool === 'shapes' && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Formas</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {shapes.map(shape => (
                      <Button
                        key={shape.id}
                        variant="outline"
                        size="sm"
                        onClick={() => addElement('shape', { 
                          content: { shape: shape.id, fillColor: '#3B82F6' } 
                        })}
                      >
                        {shape.icon}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {selectedTool === 'image' && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Imágenes</Label>
                  <Button className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Subir imagen
                  </Button>
                </div>
              )}

              {/* Color Palettes */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Paletas de Color</Label>
                <div className="space-y-2">
                  {colorPalettes.map((palette, index) => (
                    <div key={index} className="p-2 border rounded-lg">
                      <div className="text-xs font-medium mb-1">{palette.name}</div>
                      <div className="flex gap-1">
                        {palette.colors.map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="w-6 h-6 rounded border cursor-pointer"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              // Apply color to selected element
                              if (selectedElement) {
                                const element = elements.find(el => el.id === selectedElement)
                                if (element && element.type === 'text') {
                                  updateElement(selectedElement, {
                                    content: { ...element.content, color }
                                  })
                                }
                              }
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Templates Panel */}
            <TabsContent value="templates" className="flex-1 p-4">
              <div className="space-y-4">
                <Label className="text-sm font-medium">Plantillas Rápidas</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableTemplates.map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="h-auto p-2 flex-col"
                      onClick={() => loadTemplate(template.id)}
                    >
                      <div className="w-full h-12 bg-gray-100 rounded mb-1"></div>
                      <span className="text-xs">{template.name}</span>
                    </Button>
                  ))}
                </div>
                
                <Button className="w-full" variant="outline">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Más plantillas
                </Button>
              </div>
            </TabsContent>

            {/* Assets Panel */}
            <TabsContent value="assets" className="flex-1 p-4">
              <div className="space-y-4">
                <Label className="text-sm font-medium">Biblioteca de Assets</Label>
                <Button className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir archivo
                </Button>
                {/* Asset library content */}
              </div>
            </TabsContent>

            {/* Layers Panel */}
            <TabsContent value="layers" className="flex-1 p-4">
              <div className="space-y-4">
                <Label className="text-sm font-medium">Capas</Label>
                <div className="space-y-2">
                  {elements
                    .sort((a, b) => b.style.zIndex - a.style.zIndex)
                    .map((element) => (
                      <div
                        key={element.id}
                        className={`p-2 border rounded cursor-pointer ${
                          selectedElement === element.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedElement(element.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{element.type} {element.id.slice(-4)}</span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateElement(element.id, {
                                  style: { ...element.style, visible: !element.style.visible }
                                })
                              }}
                            >
                              {element.style.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateElement(element.id, {
                                  style: { ...element.style, locked: !element.style.locked }
                                })
                              }}
                            >
                              {element.style.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteElement(element.id)
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col bg-gray-100">
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
            <div 
              className="relative bg-white shadow-lg border border-gray-300"
              style={{ 
                width: canvasSize.width * (zoom / 100),
                height: canvasSize.height * (zoom / 100)
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setSelectedElement(null)
                }
              }}
            >
              {/* Grid overlay */}
              {showGrid && (
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                      linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                    `,
                    backgroundSize: `${20 * (zoom / 100)}px ${20 * (zoom / 100)}px`
                  }}
                />
              )}

              {/* Customization areas overlay with relative coordinates */}
              {customizationAreas.map(area => {
                const absoluteArea = getAbsoluteAreaCoordinates(area)
                return (
                  <div
                    key={area.id}
                    className="absolute border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-20"
                    style={{
                      left: absoluteArea.x * (zoom / 100),
                      top: absoluteArea.y * (zoom / 100),
                      width: absoluteArea.width * (zoom / 100),
                      height: absoluteArea.height * (zoom / 100)
                    }}
                  >
                    <div className="absolute -top-6 left-0 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                      {area.name}
                      {area.isRelativeCoordinates && (
                        <span className="ml-1 text-xs opacity-75">📐</span>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Canvas */}
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                style={{
                  width: canvasSize.width * (zoom / 100),
                  height: canvasSize.height * (zoom / 100)
                }}
                className="absolute inset-0"
              />

              {/* Elements rendering */}
              {elements
                .filter(el => el.style.visible)
                .sort((a, b) => a.style.zIndex - b.style.zIndex)
                .map(element => (
                  <div
                    key={element.id}
                    className={`absolute cursor-pointer ${
                      selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    style={{
                      left: element.style.x * (zoom / 100),
                      top: element.style.y * (zoom / 100),
                      width: element.style.width * (zoom / 100),
                      height: element.style.height * (zoom / 100),
                      transform: `rotate(${element.style.rotation}deg)`,
                      opacity: element.style.opacity,
                      zIndex: element.style.zIndex
                    }}
                    onClick={() => !element.style.locked && setSelectedElement(element.id)}
                  >
                    {/* Render element based on type */}
                    {element.type === 'text' && (
                      <div
                        style={{
                          fontSize: element.content.fontSize * (zoom / 100),
                          fontFamily: element.content.fontFamily,
                          color: element.content.color,
                          width: '100%',
                          height: '100%'
                        }}
                      >
                        {element.content.text}
                      </div>
                    )}
                    
                    {element.type === 'shape' && element.content.shape === 'rectangle' && (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: element.content.fillColor,
                          border: `${element.content.strokeWidth}px solid ${element.content.strokeColor}`
                        }}
                      />
                    )}
                    
                    {element.type === 'shape' && element.content.shape === 'circle' && (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: element.content.fillColor,
                          border: `${element.content.strokeWidth}px solid ${element.content.strokeColor}`,
                          borderRadius: '50%'
                        }}
                      />
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="bg-white border-t px-4 py-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span>Elementos: {elements.length}</span>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                />
                Cuadrícula
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={snapToGrid}
                  onChange={(e) => setSnapToGrid(e.target.checked)}
                />
                Ajustar
              </label>
            </div>

            {showPricing && (
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {totalPrice.toFixed(2)}€
                </Badge>
                <Button variant="outline" size="sm">
                  <Target className="w-3 h-3 mr-1" />
                  Detalles
                </Button>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-white border-l p-4">
          {selectedElement ? (
            <ElementPropertiesPanel
              element={elements.find(el => el.id === selectedElement)!}
              onUpdate={(updates) => updateElement(selectedElement, updates)}
              onDuplicate={() => duplicateElement(selectedElement)}
              onDelete={() => deleteElement(selectedElement)}
            />
          ) : (
            <div className="text-center text-gray-500 mt-8">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Selecciona un elemento para ver sus propiedades</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}

// Element Properties Panel Component
function ElementPropertiesPanel({
  element,
  onUpdate,
  onDuplicate,
  onDelete
}: {
  element: DesignElement
  onUpdate: (updates: Partial<DesignElement>) => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Propiedades</h3>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={onDuplicate}>
            <Copy className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Position and Size */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Posición y Tamaño</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={element.style.x}
                onChange={(e) => onUpdate({
                  style: { ...element.style, x: Number(e.target.value) }
                })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={element.style.y}
                onChange={(e) => onUpdate({
                  style: { ...element.style, y: Number(e.target.value) }
                })}
                className="h-8"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Ancho</Label>
              <Input
                type="number"
                value={element.style.width}
                onChange={(e) => onUpdate({
                  style: { ...element.style, width: Number(e.target.value) }
                })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Alto</Label>
              <Input
                type="number"
                value={element.style.height}
                onChange={(e) => onUpdate({
                  style: { ...element.style, height: Number(e.target.value) }
                })}
                className="h-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Element-specific properties */}
      {element.type === 'text' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Propiedades de Texto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Texto</Label>
              <Input
                value={element.content.text}
                onChange={(e) => onUpdate({
                  content: { ...element.content, text: e.target.value }
                })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Tamaño de fuente</Label>
              <Input
                type="number"
                value={element.content.fontSize}
                onChange={(e) => onUpdate({
                  content: { ...element.content, fontSize: Number(e.target.value) }
                })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Color</Label>
              <Input
                type="color"
                value={element.content.color}
                onChange={(e) => onUpdate({
                  content: { ...element.content, color: e.target.value }
                })}
                className="h-8"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transform */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Transformación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Rotación: {element.style.rotation}°</Label>
            <Slider
              value={[element.style.rotation]}
              onValueChange={([value]) => onUpdate({
                style: { ...element.style, rotation: value }
              })}
              min={-180}
              max={180}
              step={1}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Opacidad: {Math.round(element.style.opacity * 100)}%</Label>
            <Slider
              value={[element.style.opacity * 100]}
              onValueChange={([value]) => onUpdate({
                style: { ...element.style, opacity: value / 100 }
              })}
              min={0}
              max={100}
              step={1}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Información de Precio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Precio base:</span>
            <span>{element.pricing?.basePrice.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Complejidad:</span>
            <Badge className={
              element.pricing?.complexity === 'simple' ? 'bg-green-100 text-green-800' :
              element.pricing?.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }>
              {element.pricing?.complexity}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tiempo estimado:</span>
            <span>{element.pricing?.timeEstimate} min</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}