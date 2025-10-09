"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { toast } from "react-hot-toast"
import useSWR from "swr"
import fetcher from "@/lib/fetcher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { 
  X, 
  Type, 
  Image as ImageIcon, 
  Square, 
  Circle, 
  Triangle,
  Upload,
  Download,
  Undo,
  Redo,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Palette,
  Settings,
  Save,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut,
  Search,
  Target,
  Check,
  Camera,
  Star,
  Heart,
  Package,
  CheckCircle,
  FileText,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline
} from "lucide-react"

import {
  STANDARD_CANVAS_SIZE,
  relativeToAbsolute,
  scaleImageToCanvas,
  calculatePrintAreaOnScaledImage,
  type RelativeCoordinates,
  type AbsoluteCoordinates
} from "@/lib/canvas-utils"

// Dynamic import para Fabric.js
let fabric: any = null

interface PrintArea {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  printingMethod: string
  allowText: boolean
  allowImages: boolean
  allowShapes: boolean
  allowClipart: boolean
  maxColors: number
  basePrice: number
  isRelativeCoordinates?: boolean
  referenceWidth?: number
  referenceHeight?: number
}

interface ProductSide {
  id: string
  name: string
  displayName?: string
  image2D?: string
  printAreas: PrintArea[]
  variantSideImages?: Array<{
    id: string
    variantId: string
    sideId: string
    imageUrl: string
  }>
}

interface TemplateElement {
  id: string
  type: 'text' | 'image' | 'shape'
  x: number
  y: number
  width?: number
  height?: number
  rotation?: number
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  imageUrl?: string
  shapeType?: string
  locked?: boolean
  visible?: boolean
  zIndex?: number
  // Restricciones
  canMove?: boolean
  canResize?: boolean
  canRotate?: boolean
  canDelete?: boolean
  canReplaceImage?: boolean
  mandatoryToEdit?: boolean
  canAddMask?: boolean
  canReplaceMask?: boolean
  canRemoveMask?: boolean
  canEditMask?: boolean
  canEditMaskStrokeWidth?: boolean
  canEditMaskStrokeColor?: boolean
  canEditMaskedImage?: boolean
  printable?: boolean
}

interface TemplateSettings {
  name: string
  category: string
  syncElementsAllSides: boolean
  applySettingsTo: 'all' | 'current'
  disableSellerImageGallery: boolean
  allowUserAddImage: boolean
  maxImages: number
  allowedImageFormats: {
    jpg: boolean
    png: boolean
    svg: boolean
    pdf: boolean
    withRasters: boolean
    eps: boolean
    ai: boolean
    facebook: boolean
  }
  allowUserAddText: boolean
  maxTexts: number
}

interface TemplateEditorNewProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  templateName: string
  category: string
  onSave: (templateData: any) => void
  isEditMode?: boolean
  existingTemplateData?: any
}

export default function TemplateEditorNew({
  isOpen,
  onClose,
  productId,
  templateName,
  category,
  onSave,
  isEditMode = false,
  existingTemplateData = null
}: TemplateEditorNewProps) {
  // Estados principales
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [elements, setElements] = useState<TemplateElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [currentSide, setCurrentSide] = useState<string>('')
  const [zoom, setZoom] = useState(1)
  const [showImageLibrary, setShowImageLibrary] = useState(false)
  const [showShapesLibrary, setShowShapesLibrary] = useState(false)
  const [showTemplateSettings, setShowTemplateSettings] = useState(false)

  // Estados de configuración de plantilla
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>({
    name: templateName,
    category: category,
    syncElementsAllSides: false,
    applySettingsTo: 'all',
    disableSellerImageGallery: false,
    allowUserAddImage: true,
    maxImages: 10,
    allowedImageFormats: {
      jpg: true,
      png: true,
      svg: false,
      pdf: false,
      withRasters: false,
      eps: false,
      ai: false,
      facebook: false
    },
    allowUserAddText: true,
    maxTexts: 5
  })

  // Cargar datos del producto
  const { data: productData, error, isLoading } = useSWR(
    productId ? `/api/products/public/${productId}?include=personalization,variants` : null,
    fetcher
  )

  // Inicializar Fabric.js
  useEffect(() => {
    const initFabric = async () => {
      if (!fabric && typeof window !== 'undefined') {
        const { fabric: fabricJS } = await import('fabric')
        fabric = fabricJS
        setIsInitialized(true)
      }
    }
    initFabric()
  }, [])

  // Inicializar canvas
  useEffect(() => {
    if (!isInitialized || !canvasRef.current || fabricCanvasRef.current) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: STANDARD_CANVAS_SIZE.width,
      height: STANDARD_CANVAS_SIZE.height,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true
    })

    fabricCanvasRef.current = canvas

    // Event listeners
    canvas.on('selection:created', handleSelectionCreated)
    canvas.on('selection:updated', handleSelectionUpdated)
    canvas.on('selection:cleared', handleSelectionCleared)
    canvas.on('object:modified', handleObjectModified)

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose()
        fabricCanvasRef.current = null
      }
    }
  }, [isInitialized])

  // Cargar datos existentes de plantilla
  useEffect(() => {
    if (isEditMode && existingTemplateData && fabricCanvasRef.current) {
      loadExistingTemplate()
    }
  }, [isEditMode, existingTemplateData, fabricCanvasRef.current])

  // Configurar lado inicial
  useEffect(() => {
    if (productData?.sides && productData.sides.length > 0 && !currentSide) {
      setCurrentSide(productData.sides[0].id)
    }
  }, [productData])

  const loadExistingTemplate = useCallback(() => {
    if (!existingTemplateData || !fabricCanvasRef.current) return

    try {
      // Cargar configuración de plantilla
      if (existingTemplateData.restrictions) {
        setTemplateSettings(prev => ({
          ...prev,
          ...existingTemplateData.restrictions
        }))
      }

      // Cargar elementos si existen
      if (existingTemplateData.templateData) {
        // Limpiar canvas
        fabricCanvasRef.current.clear()
        
        // Cargar elementos del template
        if (Array.isArray(existingTemplateData.templateData)) {
          existingTemplateData.templateData.forEach((elementData: any) => {
            addElementToCanvas(elementData)
          })
        }
      }
    } catch (error) {
      console.error('Error loading existing template:', error)
      toast.error('Error al cargar la plantilla existente')
    }
  }, [existingTemplateData])

  // Event handlers de Fabric.js
  const handleSelectionCreated = (e: any) => {
    const activeObject = e.selected[0]
    if (activeObject && activeObject.id) {
      setSelectedElement(activeObject.id)
    }
  }

  const handleSelectionUpdated = (e: any) => {
    const activeObject = e.selected[0]
    if (activeObject && activeObject.id) {
      setSelectedElement(activeObject.id)
    }
  }

  const handleSelectionCleared = () => {
    setSelectedElement(null)
  }

  const handleObjectModified = (e: any) => {
    const obj = e.target
    if (!obj || !obj.id) return

    // Actualizar el elemento en el estado
    updateElementInState(obj.id, {
      x: obj.left,
      y: obj.top,
      width: obj.width * obj.scaleX,
      height: obj.height * obj.scaleY,
      rotation: obj.angle
    })
  }

  // Funciones de elementos
  const addTextElement = () => {
    if (!fabricCanvasRef.current) return

    const text = new fabric.Text('Texto de ejemplo', {
      left: 100,
      top: 100,
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
      id: `text_${Date.now()}`
    })

    fabricCanvasRef.current.add(text)
    fabricCanvasRef.current.setActiveObject(text)

    const element: TemplateElement = {
      id: text.id,
      type: 'text',
      x: text.left,
      y: text.top,
      width: text.width,
      height: text.height,
      text: text.text,
      fontSize: text.fontSize,
      fontFamily: text.fontFamily,
      fill: text.fill,
      canMove: true,
      canResize: true,
      canRotate: true,
      canDelete: true,
      mandatoryToEdit: false,
      printable: true
    }

    setElements(prev => [...prev, element])
    setSelectedElement(text.id)
  }

  const addImageElement = (imageUrl: string) => {
    if (!fabricCanvasRef.current) return

    fabric.Image.fromURL(imageUrl, (img: any) => {
      img.set({
        left: 150,
        top: 150,
        scaleX: 0.5,
        scaleY: 0.5,
        id: `image_${Date.now()}`
      })

      fabricCanvasRef.current.add(img)
      fabricCanvasRef.current.setActiveObject(img)

      const element: TemplateElement = {
        id: img.id,
        type: 'image',
        x: img.left,
        y: img.top,
        width: img.width * img.scaleX,
        height: img.height * img.scaleY,
        imageUrl: imageUrl,
        canMove: true,
        canResize: true,
        canRotate: true,
        canDelete: true,
        canReplaceImage: true,
        mandatoryToEdit: false,
        printable: true
      }

      setElements(prev => [...prev, element])
      setSelectedElement(img.id)
    })
  }

  const addShapeElement = (shapeType: string) => {
    if (!fabricCanvasRef.current) return

    let shape: any

    switch (shapeType) {
      case 'circle':
        shape = new fabric.Circle({
          radius: 50,
          fill: '#ff6b35',
          left: 200,
          top: 200,
          id: `circle_${Date.now()}`
        })
        break
      case 'rectangle':
        shape = new fabric.Rect({
          width: 100,
          height: 80,
          fill: '#4ecdc4',
          left: 200,
          top: 200,
          id: `rect_${Date.now()}`
        })
        break
      case 'triangle':
        shape = new fabric.Triangle({
          width: 80,
          height: 80,
          fill: '#45b7d1',
          left: 200,
          top: 200,
          id: `triangle_${Date.now()}`
        })
        break
      default:
        return
    }

    fabricCanvasRef.current.add(shape)
    fabricCanvasRef.current.setActiveObject(shape)

    const element: TemplateElement = {
      id: shape.id,
      type: 'shape',
      x: shape.left,
      y: shape.top,
      width: shape.width,
      height: shape.height,
      shapeType: shapeType,
      fill: shape.fill,
      canMove: true,
      canResize: true,
      canRotate: true,
      canDelete: true,
      mandatoryToEdit: false,
      printable: true
    }

    setElements(prev => [...prev, element])
    setSelectedElement(shape.id)
  }

  const addElementToCanvas = (elementData: any) => {
    if (!fabricCanvasRef.current) return

    switch (elementData.type) {
      case 'text':
        const text = new fabric.Text(elementData.text || 'Texto', {
          left: elementData.x,
          top: elementData.y,
          fontSize: elementData.fontSize || 24,
          fontFamily: elementData.fontFamily || 'Arial',
          fill: elementData.fill || '#000000',
          id: elementData.id
        })
        fabricCanvasRef.current.add(text)
        break

      case 'image':
        if (elementData.imageUrl) {
          fabric.Image.fromURL(elementData.imageUrl, (img: any) => {
            img.set({
              left: elementData.x,
              top: elementData.y,
              scaleX: (elementData.width || 100) / img.width,
              scaleY: (elementData.height || 100) / img.height,
              id: elementData.id
            })
            fabricCanvasRef.current.add(img)
          })
        }
        break

      case 'shape':
        let shape: any
        switch (elementData.shapeType) {
          case 'circle':
            shape = new fabric.Circle({
              radius: (elementData.width || 100) / 2,
              fill: elementData.fill || '#ff6b35',
              left: elementData.x,
              top: elementData.y,
              id: elementData.id
            })
            break
          case 'rectangle':
            shape = new fabric.Rect({
              width: elementData.width || 100,
              height: elementData.height || 80,
              fill: elementData.fill || '#4ecdc4',
              left: elementData.x,
              top: elementData.y,
              id: elementData.id
            })
            break
          case 'triangle':
            shape = new fabric.Triangle({
              width: elementData.width || 80,
              height: elementData.height || 80,
              fill: elementData.fill || '#45b7d1',
              left: elementData.x,
              top: elementData.y,
              id: elementData.id
            })
            break
        }
        if (shape) {
          fabricCanvasRef.current.add(shape)
        }
        break
    }
  }

  const updateElementInState = (id: string, updates: Partial<TemplateElement>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ))
  }

  const updateSelectedElement = (updates: Partial<TemplateElement>) => {
    if (!selectedElement || !fabricCanvasRef.current) return

    const activeObject = fabricCanvasRef.current.getActiveObject()
    if (!activeObject) return

    // Actualizar objeto en canvas
    Object.keys(updates).forEach(key => {
      if (key in activeObject) {
        activeObject.set(key, updates[key as keyof TemplateElement])
      }
    })

    fabricCanvasRef.current.renderAll()

    // Actualizar en estado
    updateElementInState(selectedElement, updates)
  }

  const deleteSelectedElement = () => {
    if (!selectedElement || !fabricCanvasRef.current) return

    const activeObject = fabricCanvasRef.current.getActiveObject()
    if (activeObject) {
      fabricCanvasRef.current.remove(activeObject)
      setElements(prev => prev.filter(el => el.id !== selectedElement))
      setSelectedElement(null)
    }
  }

  const handleSaveTemplate = () => {
    try {
      const templateData = {
        name: templateSettings.name,
        category: templateSettings.category,
        elements: elements,
        settings: templateSettings,
        restrictions: templateSettings,
        allowTextEdit: templateSettings.allowUserAddText,
        allowImageEdit: templateSettings.allowUserAddImage,
        allowColorEdit: true,
        editableAreas: ['all'],
        thumbnailUrl: generateThumbnail()
      }

      onSave(templateData)
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Error al guardar la plantilla')
    }
  }

  const generateThumbnail = () => {
    if (!fabricCanvasRef.current) return ''
    return fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 0.8,
      multiplier: 0.3
    })
  }

  const selectedElementData = elements.find(el => el.id === selectedElement)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex">
      {/* Panel Principal del Editor */}
      <div className="flex-1 bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? 'Editar Plantilla' : 'Nueva Plantilla'}: {templateSettings.name}
            </h2>
            <div className="text-sm text-gray-600">
              Categoría: {templateSettings.category}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowTemplateSettings(!showTemplateSettings)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Ajustes de Plantilla
            </Button>
            <Button
              onClick={handleSaveTemplate}
              className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isEditMode ? 'Actualizar' : 'Guardar'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <Button
              onClick={addTextElement}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Type className="h-4 w-4" />
              Texto
            </Button>
            <Button
              onClick={() => setShowImageLibrary(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Imagen
            </Button>
            <Button
              onClick={() => setShowShapesLibrary(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Formas
            </Button>
          </div>

          <div className="h-6 w-px bg-gray-300 mx-2" />

          <div className="flex items-center gap-2">
            <Button
              onClick={() => fabricCanvasRef.current?.undo?.()}
              variant="outline"
              size="sm"
              disabled={!fabricCanvasRef.current}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => fabricCanvasRef.current?.redo?.()}
              variant="outline"
              size="sm"
              disabled={!fabricCanvasRef.current}
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button
              onClick={deleteSelectedElement}
              variant="outline"
              size="sm"
              disabled={!selectedElement}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-gray-300 mx-2" />

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
              variant="outline"
              size="sm"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              variant="outline"
              size="sm"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-4">
          <div 
            className="bg-white shadow-lg rounded-lg overflow-hidden"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center'
            }}
          >
            <canvas
              ref={canvasRef}
              className="block"
              style={{
                width: STANDARD_CANVAS_SIZE.width,
                height: STANDARD_CANVAS_SIZE.height
              }}
            />
          </div>
        </div>

        {/* Element Settings Panel (Bottom) */}
        {selectedElementData && (
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Ajustes del elemento: {selectedElementData.type}
              </h3>
              <Button
                onClick={() => setSelectedElement(null)}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Propiedades básicas */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Propiedades</h4>
                
                {selectedElementData.type === 'text' && (
                  <>
                    <div>
                      <Label htmlFor="text-content">Texto</Label>
                      <Input
                        id="text-content"
                        value={selectedElementData.text || ''}
                        onChange={(e) => updateSelectedElement({ text: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="font-size">Tamaño de fuente</Label>
                      <Input
                        id="font-size"
                        type="number"
                        value={selectedElementData.fontSize || 24}
                        onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="text-color">Color</Label>
                      <Input
                        id="text-color"
                        type="color"
                        value={selectedElementData.fill || '#000000'}
                        onChange={(e) => updateSelectedElement({ fill: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {selectedElementData.type === 'shape' && (
                  <div>
                    <Label htmlFor="shape-color">Color</Label>
                    <Input
                      id="shape-color"
                      type="color"
                      value={selectedElementData.fill || '#000000'}
                      onChange={(e) => updateSelectedElement({ fill: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {/* Permisos del usuario */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Permisos del usuario</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="can-move"
                      checked={selectedElementData.canMove !== false}
                      onCheckedChange={(checked) => updateSelectedElement({ canMove: checked })}
                    />
                    <Label htmlFor="can-move">Puede mover</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="can-resize"
                      checked={selectedElementData.canResize !== false}
                      onCheckedChange={(checked) => updateSelectedElement({ canResize: checked })}
                    />
                    <Label htmlFor="can-resize">Puede redimensionar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="can-rotate"
                      checked={selectedElementData.canRotate !== false}
                      onCheckedChange={(checked) => updateSelectedElement({ canRotate: checked })}
                    />
                    <Label htmlFor="can-rotate">Puede rotar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="can-delete"
                      checked={selectedElementData.canDelete !== false}
                      onCheckedChange={(checked) => updateSelectedElement({ canDelete: checked })}
                    />
                    <Label htmlFor="can-delete">Puede eliminar</Label>
                  </div>
                  {selectedElementData.type === 'image' && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="can-replace-image"
                        checked={selectedElementData.canReplaceImage !== false}
                        onCheckedChange={(checked) => updateSelectedElement({ canReplaceImage: checked })}
                      />
                      <Label htmlFor="can-replace-image">Puede reemplazar imagen</Label>
                    </div>
                  )}
                </div>
              </div>

              {/* Configuración avanzada */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Configuración avanzada</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="mandatory-edit"
                      checked={selectedElementData.mandatoryToEdit || false}
                      onCheckedChange={(checked) => updateSelectedElement({ mandatoryToEdit: checked })}
                    />
                    <Label htmlFor="mandatory-edit">Obligatorio editar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="printable"
                      checked={selectedElementData.printable !== false}
                      onCheckedChange={(checked) => updateSelectedElement({ printable: checked })}
                    />
                    <Label htmlFor="printable">Imprimible</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel de Ajustes de Plantilla (Lateral) */}
      {showTemplateSettings && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Ajustes de Plantilla</h3>
              <Button
                onClick={() => setShowTemplateSettings(false)}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Nombre de la plantilla</Label>
                <Input
                  id="template-name"
                  value={templateSettings.name}
                  onChange={(e) => setTemplateSettings(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="template-category">Categoría</Label>
                <Select
                  value={templateSettings.category}
                  onValueChange={(value) => setTemplateSettings(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ropa">Ropa</SelectItem>
                    <SelectItem value="Accesorios">Accesorios</SelectItem>
                    <SelectItem value="Decorativas">Decorativas</SelectItem>
                    <SelectItem value="Letras">Letras</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Configuración de sincronización */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sync-elements"
                  checked={templateSettings.syncElementsAllSides}
                  onCheckedChange={(checked) => setTemplateSettings(prev => ({ ...prev, syncElementsAllSides: checked }))}
                />
                <Label htmlFor="sync-elements">Sincronizar elementos en todos los lados del producto</Label>
              </div>

              <div>
                <Label htmlFor="apply-settings">Aplicar ajustes a:</Label>
                <Select
                  value={templateSettings.applySettingsTo}
                  onValueChange={(value: 'all' | 'current') => setTemplateSettings(prev => ({ ...prev, applySettingsTo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los lados</SelectItem>
                    <SelectItem value="current">Solo lado actual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Configuración de galería */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="disable-gallery"
                  checked={templateSettings.disableSellerImageGallery}
                  onCheckedChange={(checked) => setTemplateSettings(prev => ({ ...prev, disableSellerImageGallery: checked }))}
                />
                <Label htmlFor="disable-gallery">Deshabilitar Galería de imágenes del vendedor</Label>
              </div>
            </div>

            {/* Configuración de imágenes del usuario */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="allow-user-images"
                  checked={templateSettings.allowUserAddImage}
                  onCheckedChange={(checked) => setTemplateSettings(prev => ({ ...prev, allowUserAddImage: checked }))}
                />
                <Label htmlFor="allow-user-images">El usuario puede agregar una imagen</Label>
              </div>

              {templateSettings.allowUserAddImage && (
                <>
                  <div>
                    <Label htmlFor="max-images">Número máximo de imágenes</Label>
                    <Input
                      id="max-images"
                      type="number"
                      min="1"
                      max="50"
                      value={templateSettings.maxImages}
                      onChange={(e) => setTemplateSettings(prev => ({ ...prev, maxImages: parseInt(e.target.value) || 1 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Opciones de carga de imágenes (comprobar para permitir)</Label>
                    <div className="space-y-2">
                      {Object.entries({
                        jpg: 'JPG',
                        png: 'PNG',
                        svg: 'SVG',
                        pdf: 'PDF',
                        withRasters: 'Con las tramas',
                        eps: 'EPS',
                        ai: 'AI',
                        facebook: 'Facebook'
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Switch
                            id={`format-${key}`}
                            checked={templateSettings.allowedImageFormats[key as keyof typeof templateSettings.allowedImageFormats]}
                            onCheckedChange={(checked) => setTemplateSettings(prev => ({
                              ...prev,
                              allowedImageFormats: {
                                ...prev.allowedImageFormats,
                                [key]: checked
                              }
                            }))}
                          />
                          <Label htmlFor={`format-${key}`}>{label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Configuración de texto del usuario */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="allow-user-text"
                  checked={templateSettings.allowUserAddText}
                  onCheckedChange={(checked) => setTemplateSettings(prev => ({ ...prev, allowUserAddText: checked }))}
                />
                <Label htmlFor="allow-user-text">El usuario puede agregar texto</Label>
              </div>

              {templateSettings.allowUserAddText && (
                <div>
                  <Label htmlFor="max-texts">Cantidad máxima de textos</Label>
                  <Input
                    id="max-texts"
                    type="number"
                    min="1"
                    max="20"
                    value={templateSettings.maxTexts}
                    onChange={(e) => setTemplateSettings(prev => ({ ...prev, maxTexts: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de biblioteca de imágenes */}
      {showImageLibrary && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Biblioteca de imágenes</h3>
              <Button
                onClick={() => setShowImageLibrary(false)}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* Aquí iría el contenido de la biblioteca de imágenes */}
            <div className="text-center py-8 text-gray-500">
              Biblioteca de imágenes - Por implementar
            </div>
          </div>
        </div>
      )}

      {/* Modal de biblioteca de formas */}
      {showShapesLibrary && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Formas</h3>
              <Button
                onClick={() => setShowShapesLibrary(false)}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Button
                onClick={() => {
                  addShapeElement('circle')
                  setShowShapesLibrary(false)
                }}
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
              >
                <Circle className="h-6 w-6" />
                Círculo
              </Button>
              <Button
                onClick={() => {
                  addShapeElement('rectangle')
                  setShowShapesLibrary(false)
                }}
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
              >
                <Square className="h-6 w-6" />
                Rectángulo
              </Button>
              <Button
                onClick={() => {
                  addShapeElement('triangle')
                  setShowShapesLibrary(false)
                }}
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
              >
                <Triangle className="h-6 w-6" />
                Triángulo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}