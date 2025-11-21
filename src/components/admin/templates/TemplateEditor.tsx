"use client"

import React, { useState, useEffect, useRef, useCallback, lazy, Suspense, useMemo, memo } from 'react'
import { FabricOnlyBorderShape, StableTransparencySection, getHueRotation } from './components'

import useSWR from 'swr'
import fetcher from '@/lib/fetcher'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  STANDARD_CANVAS_SIZE,
  relativeToAbsolute,
  absoluteToRelative,
  scaleImageToCanvas,
  calculatePrintAreaOnScaledImage,
  type RelativeCoordinates,
  type AbsoluteCoordinates
} from "@/lib/canvas-utils"

const ElementsLibrary = lazy(() => import("./ElementsLibrary"))
import StableShapeRenderer from "./StableShapeRenderer"

// Componente extraído a ./components/StableTransparencySection.tsx


// Componente aislado para renderizado de formas - evita DOM manipulations problemáticas
const IsolatedShapeRenderer = memo(({ element, zoom }: { element: any, zoom: number }) => {
  const [renderKey, setRenderKey] = useState(0)
  
  // Solo re-renderizar cuando cambian propiedades esenciales, no fillColor
  const stableProps = useMemo(() => ({
    shapeType: element.shapeType,
    strokeColor: element.strokeColor,
    strokeWidth: element.strokeWidth,
    id: element.id
  }), [element.shapeType, element.strokeColor, element.strokeWidth, element.id])
  
  const fillColorStyle = useMemo(() => ({
    backgroundColor: element.fillColor === 'transparent' ? 'transparent' : (element.fillColor || '#ff6b35')
  }), [element.fillColor])
  
  const borderStyle = useMemo(() => ({
    border: (element.strokeColor === 'transparent' || !element.strokeColor || !element.strokeWidth || element.strokeWidth <= 0) 
      ? 'none' 
      : `${element.strokeWidth || 1}px solid ${element.strokeColor || '#000000'}`
  }), [element.strokeColor, element.strokeWidth])
  
  return (
    <div
      key={`isolated-shape-${element.id}`}
      style={{
        width: '100%',
        height: '100%',
        ...fillColorStyle,
        ...borderStyle,
        borderRadius: element.shapeType === 'circle' ? '50%' : 
                     element.shapeType === 'star' ? '8px' :
                     element.shapeType === 'heart' ? '8px' : '0',
        position: 'relative'
      }}
    >
      {/* Contenido especial para formas complejas */}
      {element.shapeType === 'star' && (
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
          ⭐
        </div>
      )}
      {element.shapeType === 'heart' && (
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
          ❤️
        </div>
      )}
    </div>
  )
})

import ImageLibrary from "@/components/editor/ImageLibrary"
import ShapesLibrary from "@/components/editor/ShapesLibrary"
import { toast } from "react-hot-toast"
import { Switch } from "@/components/ui/switch"
import { 
  X, 
  Type, 
  Image, 
  Square, 
  Circle, 
  Undo2, 
  Redo2, 
  Save, 
  Eye,
  EyeOff,
  Layers,
  Settings,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  RotateCw,
  Move,
  Trash2,
  Copy,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  CheckCircle,
  Package,
  FileText,
  Upload,
  Search,
  Triangle,
  Star,
  Heart,
  GripVertical,
  Camera,
  Check,
  RefreshCw,
  Target,
  Tags,
  Keyboard,
  Shapes,
  Grid3X3,
  List,
  Filter,
  Folder
} from "lucide-react"

interface ShapeItem {
  id: string
  name: string
  category: string
  fileUrl: string
  tags: string[]
  isMask: boolean
  isFromLibrary: boolean
  fileType?: string | null
  fileSize?: number | null
  createdAt: string
}

interface TemplateElement {
  id: string
  type: 'text' | 'image' | 'shape'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  locked: boolean
  visible: boolean
  printable: boolean
  // Text specific
  name?: string
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: 'normal' | 'bold'
  fontStyle?: 'normal' | 'italic'
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  color?: string
  textDecoration?: 'none' | 'underline'
  curved?: boolean
  curveRadius?: number
  // Advanced text properties
  canEditText?: boolean
  canMove?: boolean
  canRotate?: boolean
  canResize?: boolean
  canDelete?: boolean
  canChangeFontFamily?: boolean
  canChangeFontColor?: boolean
  canChangeFontStyle?: boolean
  canUseCurvedText?: boolean
  canResizeTextBox?: boolean
  mandatoryToEdit?: boolean
  alwaysOnTop?: boolean
  alwaysOnBottom?: boolean
  canChangeFontAlignment?: boolean
  minFontSize?: number
  maxFontSize?: number
  verticalAlign?: 'top' | 'middle' | 'bottom'
  letterSpacing?: number
  minLetterSpacing?: number
  maxLetterSpacing?: number
  lineSpacing?: number
  minLineSpacing?: number
  maxLineSpacing?: number
  autoUppercase?: boolean
  includeInThumbnail?: boolean
  // Image specific
  src?: string
  maintainAspectRatio?: boolean
  canReplaceImage?: boolean
  canAddMask?: boolean
  canReplaceMask?: boolean
  canRemoveMask?: boolean
  canEditMask?: boolean
  canEditMaskStrokeWidth?: boolean
  canEditMaskStrokeColor?: boolean
  canEditMaskedImage?: boolean
  // Shape specific
  shapeType?: 'rectangle' | 'circle' | 'triangle' | 'star' | 'heart'
  fillColor?: string
  strokeColor?: string
  strokeWidth?: number
  useAsFillableShape?: boolean
  shapeSrc?: string // Para formas rellenables con imagen
  // Mask properties
  maskImageSrc?: string
  maskImageX?: number
  maskImageY?: number
  maskImageScale?: number
  lastFillColor?: string
  lastStrokeColor?: string
  // Shape permissions (Zakeke options)
  canChangeStrokeWidth?: boolean
  canChangeStrokeColor?: boolean
  canMoveRotateResizeStretch?: boolean
  canMoveRotateResizeMaskedImage?: boolean
}

interface TemplateEditorProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  templateName: string
  category: string
  onSave: (templateData: any) => void
  isEditMode?: boolean
  existingTemplateData?: any
}

export default function TemplateEditor({
  isOpen,
  onClose,
  productId,
  templateName,
  category,
  onSave,
  isEditMode = false,
  existingTemplateData = null
}: TemplateEditorProps) {
  // Early return if component is not open or required props are missing
  if (!isOpen || !productId || !onClose || !onSave) {
    return null
  }

  // Validate props types and content
  if (typeof productId !== 'string' || typeof templateName !== 'string' || typeof category !== 'string') {
    console.error('Invalid props types passed to TemplateEditor:', { productId, templateName, category })
    return null
  }

  // Validate props content - must not be empty strings
  if (productId.trim() === '' || templateName.trim() === '' || category.trim() === '') {
    console.warn('Empty required props passed to TemplateEditor:', { productId, templateName, category })
    return null
  }

  const [elements, setElements] = useState<TemplateElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const componentIdRef = useRef(Math.random().toString(36).substr(2, 9))

  // Debug: Log component mount/unmount
  useEffect(() => {
    console.log(`🚀 TemplateEditor mounted - ID: ${componentIdRef.current}`)
    console.log('  - productId:', productId)
    console.log('  - templateName:', templateName)
    console.log('  - category:', category)
    console.log('  - isEditMode:', isEditMode)

    return () => {
      console.log(`💥 TemplateEditor unmounting - ID: ${componentIdRef.current}`)
    }
  }, [])

  // Debug: Log elements changes
  useEffect(() => {
    console.log(`📊 Elements changed - ID: ${componentIdRef.current} - Count:`, elements.length)
    if (elements.length > 0) {
      console.log('   Elements:', elements.map(e => ({ id: e.id, type: e.type, x: e.x, y: e.y })))
    }
  }, [elements])

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection in TemplateEditor:', {
        reason: event.reason,
        promise: event.promise,
        stack: event.reason?.stack || 'No stack trace available'
      })
      // Don't prevent default for debugging - let's see what's causing this
      // event.preventDefault()
    }

    const handleError = (event: ErrorEvent) => {
      console.error('Error event in TemplateEditor:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      })
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])
  
  // Debug: Log cuando cambian los elementos
  useEffect(() => {
    console.log('🔄 Elements state changed:', elements.length, 'elements')
  }, [elements])

  // Keyboard shortcuts for zoom (similar to ZakekeAdvancedEditor)
  const [tool, setTool] = useState<'select' | 'text' | 'image' | 'shape'>('select')
  const [canvasSize, setCanvasSize] = useState(STANDARD_CANVAS_SIZE)
  const [zoom, setZoom] = useState(1)
  const [canvasViewport, setCanvasViewport] = useState({ x: 0, y: 0 })
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  

  const [showPreview, setShowPreview] = useState(false)
  const [showElementsLibrary, setShowElementsLibrary] = useState(true)
  const [restrictions, setRestrictions] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [availableFonts, setAvailableFonts] = useState<any[]>([])
  const [showTextSettings, setShowTextSettings] = useState(false)
  const [showImageSettings, setShowImageSettings] = useState(false)
  const [showShapeSettings, setShowShapeSettings] = useState(false)
  const [showTemplateSettings, setShowTemplateSettings] = useState(false)
  const [activePanel, setActivePanel] = useState('design')
  const [hasLinkedImages, setHasLinkedImages] = useState(false)
  const [linkedImages, setLinkedImages] = useState<any[]>([])
  const [showImageLibrary, setShowImageLibrary] = useState(false)
  const [showShapesLibrary, setShowShapesLibrary] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedElementIndex, setDraggedElementIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [editingElementId, setEditingElementId] = useState<string | null>(null)
  const [tempElementName, setTempElementName] = useState('')
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [snapActive, setSnapActive] = useState({ x: false, y: false })
  const snapThreshold = 10 // Pixels de distancia para activar el snap
  
  // Template settings state
  const [templateSettings, setTemplateSettings] = useState({
    name: templateName,
    category: category,
    syncElementsAllSides: false,
    applySettingsTo: 'all', // 'all' | 'current'
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
      ai: false
    },
    allowUserAddText: true,
    maxTexts: 5
  })
  const [productImage, setProductImage] = useState<string | null>(null)
  const [productSides, setProductSides] = useState<any[]>([])
  const [currentSide, setCurrentSide] = useState<string | null>(null)
  const [sideElements, setSideElements] = useState<Record<string, TemplateElement[]>>({})

  // Debug: Log cuando cambia productImage
  useEffect(() => {
    console.log('🖼️ Product image changed:', productImage)
  }, [productImage])

  // Debug: Log cuando cambian sideElements
  useEffect(() => {
    console.log('🔀 SideElements changed:', Object.keys(sideElements).length, 'sides')
  }, [sideElements])

  // Debug: Log cuando cambia currentSide
  useEffect(() => {
    console.log('🎯 CurrentSide changed:', currentSide)
  }, [currentSide])

  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Ref para evitar bucles de sincronización
  const isUpdatingFromEditor = useRef(false)
  const lastSyncedElements = useRef<string>('')

  // Sincronizar elements con sideElements[currentSide] cuando cambien
  useEffect(() => {
    if (!currentSide) return

    const elementsJson = JSON.stringify(elements)

    // Verificar también que el contenido de sideElements[currentSide] sea diferente
    const currentSideElementsJson = JSON.stringify(sideElements[currentSide] || [])

    // Solo actualizar si realmente cambió (evitar bucles)
    if (elementsJson !== lastSyncedElements.current && elementsJson !== currentSideElementsJson) {
      console.log('📝 Syncing elements to sideElements:', currentSide, elements.length, 'elements')
      lastSyncedElements.current = elementsJson

      setSideElements(prev => ({
        ...prev,
        [currentSide]: elements
      }))
    }
  }, [elements])

  // Helper function to get area coordinates similar to ZakekeAdvancedEditor
  const getAreaCoordinates = (printArea: any, sideImage?: string): AbsoluteCoordinates | null => {
    const imageToUse = sideImage || productImage
    if (!imageToUse || !canvasRef.current || !printArea) return null
    
    // Usar dimensiones base del canvas SIN zoom para los cálculos - el zoom se aplica después
    const canvasWidth = canvasSize.width
    const canvasHeight = canvasSize.height
    
    // Asumir proporción estándar para camiseta (aproximadamente 1:1.3)
    const assumedImageWidth = 600
    const assumedImageHeight = 780
    const imageAspect = assumedImageWidth / assumedImageHeight
    const canvasAspect = canvasWidth / canvasHeight
    
    let scaledWidth, scaledHeight, offsetX, offsetY
    
    if (imageAspect > canvasAspect) {
      // Imagen más ancha que el canvas
      scaledWidth = canvasWidth
      scaledHeight = canvasWidth / imageAspect
      offsetX = 0
      offsetY = (canvasHeight - scaledHeight) / 2
    } else {
      // Imagen más alta que el canvas
      scaledWidth = canvasHeight * imageAspect
      scaledHeight = canvasHeight
      offsetX = (canvasWidth - scaledWidth) / 2
      offsetY = 0
    }
    
    // Calcular coordenadas del área considerando las coordenadas relativas
    let areaCoords: AbsoluteCoordinates
    
    if (printArea.isRelativeCoordinates) {
      // Coordenadas relativas - convertir a absolutas
      const relativeCoords: RelativeCoordinates = {
        x: printArea.x,
        y: printArea.y,
        width: printArea.width,
        height: printArea.height
      }
      
      const imageTransform = {
        left: offsetX,
        top: offsetY,
        width: scaledWidth,
        height: scaledHeight,
        scaleX: scaledWidth / assumedImageWidth,
        scaleY: scaledHeight / assumedImageHeight
      }
      
      areaCoords = calculatePrintAreaOnScaledImage(
        relativeCoords,
        imageTransform,
        STANDARD_CANVAS_SIZE
      )
    } else {
      // Coordenadas absolutas legacy - convertir a relativas y luego a absolutas
      const referenceSize = {
        width: printArea.referenceWidth || STANDARD_CANVAS_SIZE.width,
        height: printArea.referenceHeight || STANDARD_CANVAS_SIZE.height
      }
      
      const relativeCoords: RelativeCoordinates = {
        x: (printArea.x / referenceSize.width) * 100,
        y: (printArea.y / referenceSize.height) * 100,
        width: (printArea.width / referenceSize.width) * 100,
        height: (printArea.height / referenceSize.height) * 100
      }
      
      const imageTransform = {
        left: offsetX,
        top: offsetY,
        width: scaledWidth,
        height: scaledHeight,
        scaleX: scaledWidth / assumedImageWidth,
        scaleY: scaledHeight / assumedImageHeight
      }
      
      areaCoords = calculatePrintAreaOnScaledImage(
        relativeCoords,
        imageTransform,
        STANDARD_CANVAS_SIZE
      )
    }
    
    return areaCoords
  }

  // Función para obtener el área activa actual
  const getCurrentPrintArea = () => {
    if (!currentSide || !productSides.length) return null
    const currentSideData = productSides.find(s => s.id === currentSide)
    if (!currentSideData?.printAreas?.length) return null
    // Por simplicidad, usar la primera área del lado actual
    return currentSideData.printAreas[0]
  }


  // Función para agregar forma seleccionada a la plantilla
  // Función para agregar imagen desde la biblioteca
  const addImageFromLibrary = (image: any) => {
    // Obtener área activa para posicionar la imagen correctamente
    const currentArea = getCurrentPrintArea()
    const currentSideData = productSides.find(s => s.id === currentSide)
    const sideImage = currentSideData?.image2D
    
    let imageX = 50, imageY = 50, imageWidth = 200, imageHeight = 200
    
    if (currentArea) {
      const areaCoords = getAreaCoordinates(currentArea, sideImage)
      if (areaCoords) {
        // Posicionar imagen en el centro del área - aplicar zoom a las coordenadas
        const scaledAreaCoords = {
          x: areaCoords.x,
          y: areaCoords.y,
          width: areaCoords.width,
          height: areaCoords.height
        }
        imageWidth = Math.min(200, scaledAreaCoords.width * 0.5)
        imageHeight = Math.min(200, scaledAreaCoords.height * 0.5)
        imageX = scaledAreaCoords.x + (scaledAreaCoords.width - imageWidth) / 2
        imageY = scaledAreaCoords.y + (scaledAreaCoords.height - imageHeight) / 2
      }
    }
    
    const newImageElement = {
      id: `image_${Date.now()}`,
      type: 'image',
      x: imageX,
      y: imageY,
      width: imageWidth,
      height: imageHeight,
      rotation: 0,
      locked: false,
      visible: true,
      printable: true,
      src: image.fileUrl || image.url,
      canMove: true,
      canResize: true,
      canRotate: true,
      canDelete: true,
      canReplaceImage: true,
      name: image.name,
      // Datos adicionales de la imagen
      imageData: {
        id: image.id,
        name: image.name,
        category: image.category,
        isFromLibrary: true
      }
    }
    
    addElementFromLibrary(newImageElement)
    setShowImageLibrary(false)
    toast.success(`Imagen "${image.name}" añadida al diseño`)
  }

  const addShapeToTemplate = (shape: ShapeItem) => {
    // Obtener área activa para posicionar la forma correctamente
    const currentArea = getCurrentPrintArea()
    const currentSideData = productSides.find(s => s.id === currentSide)
    const sideImage = currentSideData?.image2D
    
    let shapeX = 50, shapeY = 50, shapeWidth = 120, shapeHeight = 80
    
    if (currentArea) {
      const areaCoords = getAreaCoordinates(currentArea, sideImage)
      if (areaCoords) {
        // Posicionar forma en el centro del área - aplicar zoom a las coordenadas
        const scaledAreaCoords = {
          x: areaCoords.x,
          y: areaCoords.y,
          width: areaCoords.width,
          height: areaCoords.height
        }
        shapeWidth = Math.min(120, scaledAreaCoords.width * 0.3)
        shapeHeight = Math.min(80, scaledAreaCoords.height * 0.3)
        shapeX = scaledAreaCoords.x + (scaledAreaCoords.width - shapeWidth) / 2
        shapeY = scaledAreaCoords.y + (scaledAreaCoords.height - shapeHeight) / 2
      }
    }
    
    const newShapeElement = {
      id: `shape_${Date.now()}`,
      type: 'shape',
      x: shapeX,
      y: shapeY,
      width: shapeWidth,
      height: shapeHeight,
      rotation: 0,
      locked: false,
      visible: true,
      printable: true,
      shapeType: 'custom', // Forma personalizada de la biblioteca
      src: shape.fileUrl, // URL del archivo SVG
      fillColor: '#ff6b35',
      strokeColor: '#000000',
      strokeWidth: 2,
      useAsFillableShape: false, // Siempre false por defecto
      lastFillColor: '#ff6b35',
      lastStrokeColor: '#000000',
      canMove: true,
      canResize: true,
      canRotate: true,
      canDelete: true,
      name: shape.name,
      // Datos adicionales de la forma
      shapeData: {
        id: shape.id,
        category: shape.category,
        fileType: shape.fileType,
        tags: shape.tags,
        isFromLibrary: shape.isFromLibrary
      }
    }
    
    addElementFromLibrary(newShapeElement)
    setShowShapesLibrary(false)
    toast.success(`Forma "${shape.name}" añadida al diseño`)
  }
  
  // Paleta de colores predefinidos
  const predefinedColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#800080', '#808000', '#008080', '#C0C0C0', '#808080',
    '#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#00D2D3', '#FF6B9D', '#C44569', '#F8B500', '#6C5CE7', '#A55EEA',
    '#26DE81', '#FD79A8', '#FDCB6E', '#E17055', '#FF7675', '#74B9FF', '#0984E3', '#00B894'
  ]

  // Tamaños de fuente disponibles
  const fontSizes = Array.from({length: 200}, (_, i) => i + 1)

  // Cargar datos existentes en modo edición
  useEffect(() => {
    console.log('📋 Template data loading useEffect triggered')
    console.log('  - isEditMode:', isEditMode)
    console.log('  - existingTemplateData:', existingTemplateData ? 'present' : 'null')
    console.log('  - current elements count:', elements.length)

    if (isEditMode && existingTemplateData) {
      try {
        // Cargar elementos desde templateData
        if (existingTemplateData.templateData) {
          
          if (existingTemplateData.templateData.sideElements) {
            // Nueva estructura: { sideElements: { sideId: elements[] } }
            
            const currentSide = existingTemplateData.templateData.currentSide || 
                               Object.keys(existingTemplateData.templateData.sideElements)[0]
            const elements = existingTemplateData.templateData.sideElements[currentSide] || []
            
            // Debug: Verificar que elements es un array válido
            if (Array.isArray(elements) && elements.length > 0) {
              console.log('✅ Setting elements - valid array with', elements.length, 'items')
              
              // Convertir elementos de coordenadas relativas a absolutas si es necesario
              const convertedElements = convertElementsToAbsolute(elements, canvasSize)
              console.log('📏 Converted elements from relative to absolute coordinates:', convertedElements)
              
              setElements(convertedElements)
              
              // Debug: Verificar después de un pequeño delay
              setTimeout(() => {
                console.log('⏰ Elements state after setting:', convertedElements.length)
              }, 100)
            } else {
            }
            
            // También establecer el lado actual y el sideElements
            if (existingTemplateData.templateData.currentSide) {
              setCurrentSide(existingTemplateData.templateData.currentSide)
            }
            
            // Inicializar sideElements con todos los lados, convirtiendo a coordenadas absolutas
            const convertedSideElements: Record<string, TemplateElement[]> = {}
            Object.entries(existingTemplateData.templateData.sideElements).forEach(([sideId, sideElementsList]) => {
              convertedSideElements[sideId] = convertElementsToAbsolute(sideElementsList as any[], canvasSize)
            })
            setSideElements(convertedSideElements)
          } else {
            
            if (Array.isArray(existingTemplateData.templateData) && 
                existingTemplateData.templateData.length > 0 && 
                existingTemplateData.templateData[0].id) {
              // Si es un array de lados (formato intermedio)
              const frontSide = existingTemplateData.templateData.find((side: any) => side.id === 'front')
              if (frontSide) {
                normalizeElementDimensions(frontSide.elements || []).then(normalizedElements => {
                  setElements(normalizedElements)
                })
              }
            } else if (Array.isArray(existingTemplateData.templateData)) {
              // Si es un array directo de elementos (formato anterior)
              console.log('📁 Found direct array format')
              normalizeElementDimensions(existingTemplateData.templateData).then(normalizedElements => {
                setElements(normalizedElements)
              })
            } else {
              console.log('❌ Unknown templateData format:', existingTemplateData.templateData)
            }
          }
        }

        // Cargar restricciones si existen
        console.log('🔧 Loading restrictions...')
        if (existingTemplateData.restrictions) {
          setRestrictions(existingTemplateData.restrictions)
        }

        // Cargar tamaño del canvas si existe
        console.log('📐 Loading canvas size...')
        if (existingTemplateData.templateData?.canvasSize) {
          setCanvasSize(existingTemplateData.templateData.canvasSize)
        } else if (existingTemplateData.canvasSize) {
          setCanvasSize(existingTemplateData.canvasSize)
        }

        // Cargar ajustes de plantilla si existen
        console.log('⚙️ Loading template settings...')
        if (existingTemplateData.templateData?.templateSettings) {
          console.log('Found templateSettings in templateData:', existingTemplateData.templateData.templateSettings)
          setTemplateSettings(existingTemplateData.templateData.templateSettings)
        } else if (existingTemplateData.templateSettings) {
          console.log('Found templateSettings in root:', existingTemplateData.templateSettings)
          setTemplateSettings(existingTemplateData.templateSettings)
        } else {
          console.log('No templateSettings found, using defaults')
        }
        
        console.log('✅ Finished loading existing template data')
      } catch (error) {
        console.error('❌ Error loading existing template data:', error)
      }
    } else {
      // Limpiar datos para nueva plantilla SOLO si hay elementos cargados de antes
      if (elements.length > 0) {
        console.log('🧹 Clearing data for new template - had', elements.length, 'elements from previous template')
        setElements([])
        setRestrictions([])
      } else {
        console.log('✨ New template - elements already empty')
      }
    }
  }, [isEditMode, existingTemplateData])

  // Cargar fuentes disponibles
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const response = await fetch('/api/personalization/fonts', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (response.ok) {
          try {
            const data = await response.json()
            console.log('📝 Fuentes cargadas desde API:', data)
            // La API devuelve directamente el array de fuentes CustomFont
            setAvailableFonts(Array.isArray(data) ? data : (data.fonts || []))
          } catch (jsonError) {
            console.error('Error parsing fonts JSON response:', jsonError)
            throw jsonError
          }
        } else {
          console.warn('Failed to load fonts from API, using default fonts')
          // Usar fuentes por defecto si la API falla
          setAvailableFonts([
            { id: '1', family: 'Arial', style: 'Regular', weight: '400', isActive: true },
            { id: '2', family: 'Helvetica', style: 'Regular', weight: '400', isActive: true },
            { id: '3', family: 'Times New Roman', style: 'Regular', weight: '400', isActive: true },
            { id: '4', family: 'Georgia', style: 'Regular', weight: '400', isActive: true }
          ])
        }
      } catch (error) {
        console.error('Error loading fonts:', error)
        // Usar fuentes por defecto en caso de error
        setAvailableFonts([
          { id: '1', family: 'Arial', style: 'Regular', weight: '400', isActive: true },
          { id: '2', family: 'Helvetica', style: 'Regular', weight: '400', isActive: true },
          { id: '3', family: 'Times New Roman', style: 'Regular', weight: '400', isActive: true },
          { id: '4', family: 'Georgia', style: 'Regular', weight: '400', isActive: true }
        ])
      }
    }
    loadFonts().catch(error => {
      console.error('Caught error in loadFonts call:', error)
    })
  }, [])

  // Cargar imagen del producto
  useEffect(() => {
    const loadProductImage = async () => {
      if (productId) {
        try {
          const response = await fetch(`/api/products/${productId}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          if (response.ok) {
            let data
            try {
              data = await response.json()
            } catch (jsonError) {
              console.error('Error parsing product JSON response:', jsonError)
              throw jsonError
            }
            console.log('📦 Product data received:', data)
            if (data.product && data.product.images) {
              const images = typeof data.product.images === 'string' 
                ? JSON.parse(data.product.images) 
                : data.product.images
              console.log('🖼️ Product images found:', images)
              if (images.length > 0) {
                console.log('✅ Setting product image:', images[0])
                setProductImage(images[0])
              } else {
                console.warn('⚠️ Product has no images, using placeholder')
                setProductImage('/placeholder-product.png')
              }
            } else {
              console.warn('⚠️ Product has no images property, using placeholder')
              setProductImage('/placeholder-product.png')
            }
          } else {
            console.warn(`Product API returned ${response.status} for product ${productId}`)
            // Usar imagen placeholder si no se puede cargar
            setProductImage('/placeholder-product.png')
          }
        } catch (error) {
          console.error('Error loading product image:', error)
          // Usar imagen placeholder como fallback
          setProductImage('/placeholder-product.png')
        }
      }
    }
    loadProductImage().catch(error => {
      console.error('Caught error in loadProductImage call:', error)
    })
  }, [productId])

  // Cargar lados del producto
  useEffect(() => {
    const loadProductSides = async () => {
      if (productId) {
        try {
          const response = await fetch(`/api/products/${productId}?includeSides=true`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          if (response.ok) {
            let data
            try {
              data = await response.json()
            } catch (jsonError) {
              console.error('Error parsing product sides JSON response:', jsonError)
              throw jsonError
            }
            console.log('📋 Product sides data received:', data)
            if (data.success && data.product && data.product.sides) {
              const sides = data.product.sides.filter((side: any) => side.isActive)
              console.log('📋 Filtered active sides:', sides)
              setProductSides(sides)
              
              // Establecer el primer lado como activo por defecto SOLO si no hay datos existentes
              if (sides.length > 0 && !currentSide && !isEditMode) {
                console.log('🎯 Setting default first side:', sides[0].id)
                setCurrentSide(sides[0].id)
                // Cargar imagen del lado si existe
                if (sides[0].image2D) {
                  console.log('🖼️ Setting side image:', sides[0].image2D)
                  setProductImage(sides[0].image2D)
                } else {
                  console.log('⚠️ Side has no image2D, keeping current product image')
                }
              }
            }
          } else {
            console.warn(`Product sides API returned ${response.status} for product ${productId}`)
            // Usar lados predeterminados si no se pueden cargar
            setProductSides([
              { id: 'front', name: 'Frente', image2D: '/placeholder-product.png', isActive: true },
              { id: 'back', name: 'Espalda', image2D: '/placeholder-product.png', isActive: true }
            ])
            if (!currentSide) {
              setCurrentSide('front')
            }
          }
        } catch (error) {
          console.error('Error loading product sides:', error)
          // Usar lados predeterminados como fallback
          setProductSides([
            { id: 'front', name: 'Frente', image2D: '/placeholder-product.png', isActive: true },
            { id: 'back', name: 'Espalda', image2D: '/placeholder-product.png', isActive: true }
          ])
          if (!currentSide) {
            setCurrentSide('front')
          }
        }
      }
    }
    loadProductSides().catch(error => {
      console.error('Caught error in loadProductSides call:', error)
    })
  }, [productId, isEditMode])

  // Verificar si hay imágenes enlazadas al producto
  useEffect(() => {
    const checkLinkedImages = async () => {
      if (productId) {
        try {
          const response = await fetch(`/api/products/${productId}/personalization-images`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          if (response.ok) {
            let data
            try {
              data = await response.json()
            } catch (jsonError) {
              console.error('Error parsing linked images JSON response:', jsonError)
              throw jsonError
            }
            const images = data.images || []
            setHasLinkedImages(images.length > 0)
            setLinkedImages(images)
          } else {
            console.warn(`Personalization images API returned ${response.status} for product ${productId}`)
            // No hay imágenes enlazadas
            setHasLinkedImages(false)
            setLinkedImages([])
          }
        } catch (error) {
          console.error('Error checking linked images:', error)
          // Asumir que no hay imágenes enlazadas si falla la API
          setHasLinkedImages(false)
          setLinkedImages([])
        }
      }
    }
    checkLinkedImages().catch(error => {
      console.error('Caught error in checkLinkedImages call:', error)
    })
  }, [productId])

  // Función para calcular dimensiones reales del texto usando Fabric.js directamente
  const calculateTextDimensions = async (text: string, fontSize: number, fontFamily: string, fontWeight: string = 'normal'): Promise<{ width: number, height: number }> => {
    try {
      // Importar Fabric.js dinámicamente
      const fabricModule = await import('fabric')
      const fabric = fabricModule.fabric
      
      // Crear un texto temporal para obtener las dimensiones exactas
      const tempText = new fabric.Text(text, {
        fontSize: fontSize,
        fontFamily: fontFamily,
        fontWeight: fontWeight
      })
      
      // Obtener las dimensiones que Fabric.js calcula
      const bounds = tempText.getBoundingRect()
      
      return {
        width: Math.round(bounds.width),
        height: Math.round(bounds.height)
      }
    } catch (error) {
      console.warn('Error calculando dimensiones con Fabric.js:', error)
      // Fallback al método anterior
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return { width: 120, height: 30 }
      
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      const lines = text.split('\n')
      let maxWidth = 0
      
      lines.forEach(line => {
        const metrics = ctx.measureText(line)
        maxWidth = Math.max(maxWidth, metrics.width)
      })
      
      const lineHeight = fontSize * 1.16
      const totalHeight = lines.length > 1 ? 
        (lines.length - 1) * lineHeight + fontSize : 
        fontSize
      
      return {
        width: Math.max(maxWidth + 2, 20),
        height: Math.max(totalHeight + 2, fontSize)
      }
    }
  }

  // Función para normalizar dimensiones de elementos existentes
  const normalizeElementDimensions = async (elements: TemplateElement[]): Promise<TemplateElement[]> => {
    const normalizedElements = await Promise.all(
      elements.map(async (element) => {
        if (element.type === 'text') {
          // Verificar si el elemento tiene dimensiones fijas típicas del sistema anterior (120x30)
          if (element.width === 120 && element.height === 30) {
            const calculatedDimensions = await calculateTextDimensions(
              element.text || 'Texto de ejemplo',
              element.fontSize || 16,
              element.fontFamily || 'Arial',
              element.fontWeight || 'normal'
            )
            
            return {
              ...element,
              width: calculatedDimensions.width,
              height: calculatedDimensions.height
            }
          }
        }
        return element
      })
    )
    
    return normalizedElements
  }

  // Funciones de conversión consistentes con ZakekeAdvancedEditor
  const pixelsToCm = (pixels: number, isWidth: boolean = true) => {
    const currentArea = getCurrentPrintArea()
    if (!currentArea) return pixels

    // Conversión estándar para impresión: 300 DPI = 11.81 pixels por cm
    const PIXELS_PER_CM = 11.81
    
    // Si el área tiene dimensiones reales configuradas, usar esas para mayor precisión
    let pixelsPerCm = PIXELS_PER_CM
    
    // Si el área tiene medidas reales configuradas, usar conversiones separadas para width y height
    if (currentArea.realWidth && currentArea.realHeight) {
      if (isWidth) {
        pixelsPerCm = currentArea.width / currentArea.realWidth
      } else {
        pixelsPerCm = currentArea.height / currentArea.realHeight
      }
    }
    
    return Number((pixels / pixelsPerCm).toFixed(1))
  }

  const cmToPixels = (cm: number, isWidth: boolean = true) => {
    const currentArea = getCurrentPrintArea()
    if (!currentArea) return cm

    // Conversión estándar para impresión: 300 DPI = 11.81 pixels por cm
    const PIXELS_PER_CM = 11.81
    
    // Si el área tiene dimensiones reales configuradas, usar esas para mayor precisión
    let pixelsPerCm = PIXELS_PER_CM
    
    // Si el área tiene medidas reales configuradas, usar conversiones separadas para width y height
    if (currentArea.realWidth && currentArea.realHeight) {
      if (isWidth) {
        pixelsPerCm = currentArea.width / currentArea.realWidth
      } else {
        pixelsPerCm = currentArea.height / currentArea.realHeight
      }
    }
    
    return Math.round(cm * pixelsPerCm)
  }

  // Manejar cambio de lado
  const handleSideChange = (sideId: string) => {
    console.log('🔄 Changing side from', currentSide, 'to', sideId)
    
    // Guardar elementos del lado actual
    if (currentSide) {
      console.log('💾 Saving elements for current side:', currentSide, 'Elements:', elements.length)
      setSideElements(prev => ({
        ...prev,
        [currentSide]: elements
      }))
    }
    
    // Cambiar al nuevo lado
    setCurrentSide(sideId)
    
    // Cargar elementos del nuevo lado
    const newSideElements = sideElements[sideId] || []
    console.log('📂 Loading elements for new side:', sideId, 'Elements:', newSideElements.length)
    normalizeElementDimensions(newSideElements).then(normalizedElements => {
      setElements(normalizedElements)
    })
    
    // Cargar imagen del lado
    const selectedSide = productSides.find(side => side.id === sideId)
    console.log('🖼️ Selected side for image:', selectedSide)
    if (selectedSide?.image2D) {
      console.log('✅ Setting side image:', selectedSide.image2D)
      setProductImage(selectedSide.image2D)
    } else {
      console.log('⚠️ Selected side has no image2D property')
    }
    
    // Limpiar selección
    setSelectedElement(null)
  }

  // Inicializar historial con estado inicial
  useEffect(() => {
    if (elements.length > 0 && history.length === 0) {
      const newHistory = [JSON.parse(JSON.stringify(elements))]
      setHistory(newHistory)
      setHistoryIndex(0)
    }
  }, [elements.length, history.length])

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
          case 'y':
            e.preventDefault()
            redo()
            break
          case 'd':
            e.preventDefault()
            if (selectedElement) {
              duplicateElement(selectedElement)
            }
            break
          case 'Delete':
          case 'Backspace':
            e.preventDefault()
            if (selectedElement) {
              deleteElement(selectedElement)
            }
            break
        }
      } else {
        // Atajos de herramientas
        switch (e.key.toLowerCase()) {
          case 'v':
            setTool('select')
            break
          case 't':
            setTool('text')
            break
          case 'i':
            setTool('image')
            break
          case 's':
            setTool('shape')
            break
          case 'Delete':
          case 'Backspace':
            if (selectedElement) {
              deleteElement(selectedElement)
            }
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElement, historyIndex, history.length])

  // Guardar estado en el historial
  const saveToHistory = (newElements: TemplateElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(newElements)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    
    // Limitar el historial a 50 estados
    if (newHistory.length > 50) {
      newHistory.shift()
      setHistoryIndex(newHistory.length - 1)
    }
  }

  // Deshacer
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setElements(JSON.parse(JSON.stringify(history[historyIndex - 1])))
    }
  }

  // Rehacer
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setElements(JSON.parse(JSON.stringify(history[historyIndex + 1])))
    }
  }

  // Actualizar elementos y guardar en historial
  const updateElementsWithHistory = (newElements: TemplateElement[]) => {
    console.log('🔧 updateElementsWithHistory called with', newElements.length, 'elements')
    if (newElements.length === 0) {
      console.trace('⚠️ Stack trace for empty elements call:')
    }
    setElements(newElements)
    saveToHistory(newElements)
  }

  // Canvas interaction handlers
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (tool === 'select') return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    if (tool === 'text') {
      addTextElement(x, y)
    } else if (tool === 'shape') {
      addShapeElement(x, y)
    }
  }

  const addTextElement = async (x: number, y: number) => {
    console.log('🟢 addTextElement called with x:', x, 'y:', y)
    console.log('Current side:', currentSide)
    console.log('Product sides:', productSides)

    // Si se llama sin coordenadas específicas, posicionar en el área activa
    let textX = x, textY = y

    if (x === 100 && y === 100) { // Valores por defecto del handleDirectTextAdd
      const currentArea = getCurrentPrintArea()
      const currentSideData = productSides.find(s => s.id === currentSide)
      const sideImage = currentSideData?.image2D

      console.log('Current area:', currentArea)
      console.log('Current side data:', currentSideData)

      if (currentArea) {
        const areaCoords = getAreaCoordinates(currentArea, sideImage)
        console.log('Area coords:', areaCoords)
        if (areaCoords) {
          // Posicionar texto en el centro del área - aplicar zoom a las coordenadas
          const scaledAreaCoords = {
            x: areaCoords.x,
            y: areaCoords.y,
            width: areaCoords.width,
            height: areaCoords.height
          }
          textX = scaledAreaCoords.x + scaledAreaCoords.width * 0.1 // 10% margen desde la izquierda
          textY = scaledAreaCoords.y + scaledAreaCoords.height * 0.1 // 10% margen desde arriba
          console.log('Calculated text position:', textX, textY)
        }
      }
    }

    // Calcular dimensiones dinámicas del texto
    const textContent = 'Texto de ejemplo'
    const textFontSize = 16
    const textFontFamily = 'Arial'
    const textFontWeight = 'normal'

    // Calcular dimensiones reales ANTES de crear el elemento
    console.log('🔄 Calculating text dimensions...')
    const calculatedDimensions = await calculateTextDimensions(textContent, textFontSize, textFontFamily, textFontWeight)
    console.log('📐 Dimensions calculated:', calculatedDimensions)

    // Crear elemento con las dimensiones correctas desde el inicio
    const newElement: TemplateElement = {
      id: `text_${Date.now()}`,
      type: 'text',
      x: textX,
      y: textY,
      width: calculatedDimensions.width,
      height: calculatedDimensions.height,
      rotation: 0,
      locked: false,
      visible: true,
      printable: true,
      text: textContent,
      fontSize: textFontSize,
      fontFamily: textFontFamily,
      fontWeight: textFontWeight,
      fontStyle: 'normal',
      textAlign: 'left',
      color: '#000000',
      textDecoration: 'none',
      curved: false,
      curveRadius: 50
    }
    console.log('New element created with correct dimensions:', newElement)
    const newElements = [...elements, newElement]
    console.log('New elements array:', newElements)
    updateElementsWithHistory(newElements)
    setSelectedElement(newElement.id)
    setTool('select')
    console.log('🟢 Element added successfully')
    
    // Si está habilitada la sincronización, agregar a todos los lados
    if (templateSettings.syncElementsAllSides && currentSide) {
      console.log('🔄 Synchronizing text element to all sides')
      const updatedSideElements = { ...sideElements }
      productSides.forEach(side => {
        if (side.id !== currentSide) {
          // Crear una copia del elemento para cada lado
          const elementCopy = { ...newElement, id: `${newElement.id}_${side.id}` }
          updatedSideElements[side.id] = [...(updatedSideElements[side.id] || []), elementCopy]
        }
      })
      setSideElements(updatedSideElements)
    }
  }

  const addElementFromLibrary = (elementData: any) => {
    const newElements = [...elements, elementData]
    updateElementsWithHistory(newElements)
    setSelectedElement(elementData.id)
    
    // Si está habilitada la sincronización, agregar a todos los lados
    if (templateSettings.syncElementsAllSides && currentSide) {
      console.log('🔄 Synchronizing element to all sides:', elementData.type)
      const updatedSideElements = { ...sideElements }
      productSides.forEach(side => {
        if (side.id !== currentSide) {
          // Crear una copia del elemento para cada lado
          const elementCopy = { ...elementData, id: `${elementData.id}_${side.id}` }
          updatedSideElements[side.id] = [...(updatedSideElements[side.id] || []), elementCopy]
        }
      })
      setSideElements(updatedSideElements)
    }
  }

  const addShapeElement = (x: number, y: number) => {
    const newElement: TemplateElement = {
      id: `shape_${Date.now()}`,
      type: 'shape',
      x,
      y,
      width: 100,
      height: 100,
      rotation: 0,
      locked: false,
      visible: true,
      printable: true,
      shapeType: 'rectangle',
      fillColor: '#ff6b35',
      strokeColor: '#000000',
      strokeWidth: 2,
      useAsFillableShape: false,
      lastFillColor: '#ff6b35',
      lastStrokeColor: '#000000'
    }
    const newElements = [...elements, newElement]
    updateElementsWithHistory(newElements)
    setSelectedElement(newElement.id)
    setTool('select')
  }



  const updateElement = (id: string, updates: Partial<TemplateElement>) => {
    console.log('🔧 updateElement called for:', id, 'Current elements count:', elements.length)

    const newElements = elements.map(el => {
      if (el.id === id) {
        const updatedElement = { ...el, ...updates }

        // Si es un elemento de texto y se han actualizado propiedades que afectan las dimensiones
        if (updatedElement.type === 'text' && (
          updates.text !== undefined ||
          updates.fontSize !== undefined ||
          updates.fontFamily !== undefined ||
          updates.fontWeight !== undefined
        )) {
          // Recalcular dimensiones automáticamente de forma asíncrona
          if (updates.width === undefined || updates.height === undefined) {
            console.log('🔄 Scheduling dimension recalculation for:', id)
            calculateTextDimensions(
              updatedElement.text || 'Texto de ejemplo',
              updatedElement.fontSize || 16,
              updatedElement.fontFamily || 'Arial',
              updatedElement.fontWeight || 'normal'
            ).then(calculatedDimensions => {
              console.log('📐 Dimensions calculated:', calculatedDimensions, 'Updating element:', id)
              console.log('   Current elements count in callback:', elements.length)

              // Crear una segunda actualización solo para las dimensiones
              const dimensionUpdates: Partial<TemplateElement> = {}
              if (updates.width === undefined) {
                dimensionUpdates.width = calculatedDimensions.width
              }
              if (updates.height === undefined) {
                dimensionUpdates.height = calculatedDimensions.height
              }

              if (Object.keys(dimensionUpdates).length > 0) {
                // IMPORTANT: Use a functional update to get the latest elements state
                setElements(currentElements => {
                  console.log('   Mapping over current elements:', currentElements.length)
                  const finalElements = currentElements.map(el =>
                    el.id === id ? { ...el, ...updates, ...dimensionUpdates } : el
                  )
                  console.log('   Final elements after dimension update:', finalElements.length)
                  saveToHistory(finalElements)
                  return finalElements
                })
              }
            })
          }
        }

        return updatedElement
      }
      return el
    })
    console.log('🔧 updateElement: newElements count:', newElements.length)
    updateElementsWithHistory(newElements)
  }

  const deleteElement = (id: string) => {
    const newElements = elements.filter(el => el.id !== id)
    updateElementsWithHistory(newElements)
    if (selectedElement === id) {
      setSelectedElement(null)
    }
  }

  const duplicateElement = (id: string) => {
    const element = elements.find(el => el.id === id)
    if (!element) return

    const newElement = {
      ...element,
      id: `${element.type}_${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20
    }
    const newElements = [...elements, newElement]
    updateElementsWithHistory(newElements)
  }

  // Enviar elemento hacia delante
  const moveElementForward = (id: string) => {
    const currentIndex = elements.findIndex(el => el.id === id)
    if (currentIndex === -1 || currentIndex === elements.length - 1) return
    
    const newElements = [...elements]
    const element = newElements[currentIndex]
    newElements.splice(currentIndex, 1)
    newElements.splice(currentIndex + 1, 0, element)
    updateElementsWithHistory(newElements)
  }

  // Enviar elemento hacia atrás
  // Funciones para drag & drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    console.log('🚀 Drag start:', { index, element: elements[index]?.type })
    setDraggedElementIndex(index)
    setDragOverIndex(null)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    
    // Solo actualizar dragOverIndex si es diferente al elemento arrastrado
    if (draggedElementIndex !== null && draggedElementIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    // Solo limpiar si realmente salimos del elemento
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('🎯 Drop event:', { draggedElementIndex, dropIndex })
    
    setDragOverIndex(null)
    
    if (draggedElementIndex === null || draggedElementIndex === dropIndex) {
      console.log('❌ Invalid drop: same index or no dragged element')
      setDraggedElementIndex(null)
      return
    }

    // Reordenar elementos
    const newElements = [...elements]
    const draggedElement = newElements[draggedElementIndex]
    
    console.log('🔄 Reordering:', {
      from: draggedElementIndex,
      to: dropIndex,
      elementName: draggedElement?.name || draggedElement?.type
    })
    
    // Remover elemento de posición actual
    newElements.splice(draggedElementIndex, 1)
    
    // Insertar en nueva posición
    // Cuando removemos un elemento, los índices se ajustan:
    // Si movemos hacia abajo: usamos dropIndex - 1 (porque el array se redujo)
    // Si movemos hacia arriba: usamos dropIndex (sin cambios)
    const insertIndex = dropIndex > draggedElementIndex ? dropIndex - 1 : dropIndex
    newElements.splice(insertIndex, 0, draggedElement)
    
    console.log('📍 Final positions:', newElements.map((el, idx) => `${idx}: ${el.type}`))
    
    updateElementsWithHistory(newElements)
    setDraggedElementIndex(null)
    
    toast.success(`Elemento movido a posición ${insertIndex + 1}`)
  }

  const handleDragEnd = () => {
    setDraggedElementIndex(null)
    setDragOverIndex(null)
  }

  // Función para editar nombre de elemento
  const startEditingElementName = (elementId: string, currentName: string) => {
    setEditingElementId(elementId)
    setTempElementName(currentName || '')
  }

  const saveElementName = (elementId: string) => {
    const element = elements.find(el => el.id === elementId)
    if (element && (element.type === 'text' || element.type === 'i-text')) {
      // Para elementos de texto, actualizar tanto el nombre como el texto
      updateElement(elementId, { 
        name: tempElementName,
        text: tempElementName 
      })
    } else {
      // Para otros elementos, solo actualizar el nombre
      updateElement(elementId, { name: tempElementName })
    }
    setEditingElementId(null)
    setTempElementName('')
  }

  const cancelEditingElementName = () => {
    setEditingElementId(null)
    setTempElementName('')
  }

  // Función para convertir px a cm basándose en las dimensiones del área de impresión
  const pxToCm = (pixels: number, areaPixelSize: number, areaCmSize: number) => {
    if (!areaPixelSize || !areaCmSize) return pixels // Fallback si no hay datos
    const cmPerPixel = areaCmSize / areaPixelSize
    return (pixels * cmPerPixel).toFixed(1)
  }

  // Función para obtener las medidas del elemento en cm
  const getElementSizeInCm = (element: any) => {
    const currentArea = getCurrentPrintArea()
    if (!currentArea) {
      // Si no hay área, mostrar px como fallback
      return `${Math.round(element.width)}×${Math.round(element.height)}px`
    }

    // Conversión estándar para impresión: 300 DPI = 11.81 pixels por cm
    const PIXELS_PER_CM = 11.81
    
    // Si el área tiene dimensiones reales configuradas, usar esas para mayor precisión
    let pixelsPerCmWidth = PIXELS_PER_CM
    let pixelsPerCmHeight = PIXELS_PER_CM
    
    // Si el área tiene medidas reales configuradas (opcional)
    if (currentArea.realWidth && currentArea.realHeight) {
      pixelsPerCmWidth = currentArea.width / currentArea.realWidth
      pixelsPerCmHeight = currentArea.height / currentArea.realHeight
    }
    
    const widthCm = (element.width / pixelsPerCmWidth).toFixed(1)
    const heightCm = (element.height / pixelsPerCmHeight).toFixed(1)
    const widthPx = Math.round(element.width)
    const heightPx = Math.round(element.height)
    
    return `${widthCm}×${heightCm}cm (${widthPx}×${heightPx}px)`
  }

  const moveElementBackward = (id: string) => {
    const currentIndex = elements.findIndex(el => el.id === id)
    if (currentIndex === -1 || currentIndex === 0) return
    
    const newElements = [...elements]
    const element = newElements[currentIndex]
    newElements.splice(currentIndex, 1)
    newElements.splice(currentIndex - 1, 0, element)
    updateElementsWithHistory(newElements)
  }

  // Funciones de acción directa para el nuevo panel
  const handleDirectTextAdd = () => {
    console.log('🔵 handleDirectTextAdd called')
    console.log('Current elements before add:', elements)
    addTextElement(100, 100)
    setActivePanel('')
    console.log('🔵 handleDirectTextAdd completed')
  }

  const handleDirectImageUpload = () => {
    fileInputRef.current?.click()
    setActivePanel('')
  }

  // Función de zoom mejorada - centrada como en ZakekeAdvancedEditor
  const handleZoom = useCallback((newZoom: number, centerPoint?: { x: number, y: number }) => {
    const clampedZoom = Math.max(0.25, Math.min(3, newZoom))
    setZoom(clampedZoom)
  }, [])

  // Event handler para zoom con rueda del mouse
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const delta = -e.deltaY
    const zoomSpeed = 0.1 // Velocidad más suave
    const zoomFactor = delta > 0 ? (1 + zoomSpeed) : (1 - zoomSpeed)
    const newZoom = zoom * zoomFactor
    
    // Obtener posición del mouse relativa al canvas
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      // Convertir a coordenadas del canvas sin zoom
      const canvasX = mouseX / zoom
      const canvasY = mouseY / zoom
      
      handleZoom(newZoom, { x: canvasX, y: canvasY })
    } else {
      // Zoom desde el centro si no podemos obtener la posición del mouse
      handleZoom(newZoom)
    }
  }, [zoom, handleZoom])

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault()
            handleZoom(zoom + 0.25)
            break
          case '-':
            e.preventDefault()
            handleZoom(zoom - 0.25)
            break
          case '0':
            e.preventDefault()
            handleZoom(1) // Reset to 100%
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [zoom, handleZoom])

  // Función para calcular snap a las guías de centrado
  const snapToCenter = (x: number, y: number, elementWidth: number, elementHeight: number) => {
    const centerX = canvasSize.width / 2
    const centerY = canvasSize.height / 2
    
    let snappedX = x
    let snappedY = y
    let isSnappingX = false
    let isSnappingY = false
    
    // Snap horizontal (centro del elemento al centro del canvas)
    const elementCenterX = x + elementWidth / 2
    if (Math.abs(elementCenterX - centerX) <= snapThreshold) {
      snappedX = centerX - elementWidth / 2
      isSnappingX = true
    }
    
    // Snap vertical (centro del elemento al centro del canvas)
    const elementCenterY = y + elementHeight / 2
    if (Math.abs(elementCenterY - centerY) <= snapThreshold) {
      snappedY = centerY - elementHeight / 2
      isSnappingY = true
    }
    
    return { x: snappedX, y: snappedY, isSnappingX, isSnappingY }
  }

  const handleSave = async () => {
    try {
      console.log('🚀 handleSave called - Starting save process')
      alert('🎯 Botón de guardar presionado!')
      // Validar que hay elementos para guardar
      let allSideElements = { ...sideElements }
      if (currentSide) {
        allSideElements[currentSide] = elements
      }

      const totalElements = Object.values(allSideElements).reduce((total, els) => total + els.length, 0)
      
      if (totalElements === 0) {
        alert('No hay elementos para guardar. Agrega al menos un elemento antes de guardar la plantilla.')
        return
      }

      if (!confirm('¿Estás seguro de que quieres guardar esta plantilla?')) {
        return
      }

    // Generar imagen de vista previa del canvas
    let thumbnailUrl = ''
    try {
      console.log('🎨 Canvas ref available:', !!canvasRef.current)
      
      // Crear una imagen simple con datos de la plantilla como thumbnail
      const fallbackCanvas = document.createElement('canvas')
      fallbackCanvas.width = 400
      fallbackCanvas.height = 400
      const ctx = fallbackCanvas.getContext('2d')
      if (ctx) {
        // Fondo con gradiente
        const gradient = ctx.createLinearGradient(0, 0, 400, 400)
        gradient.addColorStop(0, '#f8fafc')
        gradient.addColorStop(1, '#e2e8f0')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 400, 400)
        
        // Borde
        ctx.strokeStyle = '#cbd5e1'
        ctx.lineWidth = 2
        ctx.strokeRect(0, 0, 400, 400)
        
        // Título
        ctx.fillStyle = '#1e293b'
        ctx.font = 'bold 24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(templateName, 200, 180)
        
        // Información de elementos
        ctx.fillStyle = '#64748b'
        ctx.font = '16px Arial'
        ctx.fillText(`${totalElements} elemento${totalElements !== 1 ? 's' : ''}`, 200, 210)
        
        // Categoría
        ctx.fillStyle = '#f97316'
        ctx.font = '14px Arial'
        ctx.fillText(category, 200, 240)
        
        // Icono simple de plantilla
        ctx.fillStyle = '#f97316'
        ctx.fillRect(150, 120, 100, 40)
        ctx.fillStyle = '#ffffff'
        ctx.font = '12px Arial'
        ctx.fillText('PLANTILLA', 200, 145)
        
        thumbnailUrl = fallbackCanvas.toDataURL('image/png')
      }
    } catch (error) {
      console.warn('Error generando thumbnail:', error)
    }

    console.log('🖼️ Generated thumbnailUrl:', thumbnailUrl ? 'Generated successfully' : 'Empty/failed')
    console.log('📊 ThumbnailUrl length:', thumbnailUrl.length)

    // Convertir todos los elementos a coordenadas relativas antes de guardar
    const relativeSideElements: Record<string, any[]> = {}
    Object.entries(allSideElements).forEach(([sideId, sideElementsList]) => {
      console.log(`🔄 Converting elements for side ${sideId} to relative coordinates`)
      relativeSideElements[sideId] = convertElementsToRelative(sideElementsList, canvasSize)
    })

    console.log('📏 Converted elements to relative coordinates:', relativeSideElements)

    const templateData = {
      name: templateName,
      category,
      productId,
      currentSide,
      sideElements: relativeSideElements, // Usar elementos con coordenadas relativas
      productSides: productSides.map(side => ({
        id: side.id,
        name: side.name,
        displayName: side.displayName,
        image2D: side.image2D
      })),
      canvasSize, // Tamaño de referencia para conversión
      restrictions,
      templateSettings, // Incluir los ajustes de plantilla
      thumbnailUrl, // Incluir imagen de vista previa
      allowTextEdit: Object.values(allSideElements).some(els => els.some((el: any) => el.type === 'text')),
      allowImageEdit: Object.values(allSideElements).some(els => els.some((el: any) => el.type === 'image')),
      allowColorEdit: true,
      editableAreas: Object.values(allSideElements).flatMap(els => 
        els.filter((el: any) => !el.locked).map((el: any) => el.id)
      )
    }
    
      console.log('Saving template data:', templateData)
      onSave(templateData)
    } catch (error) {
      console.error('Error in handleSave:', error)
      alert('Error al guardar la plantilla. Por favor, inténtalo de nuevo.')
    }
  }

  const handleDownloadPDF = async () => {
    try {
      // Crear un canvas temporal para capturar la vista previa
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Establecer el tamaño del canvas
      canvas.width = canvasSize.width
      canvas.height = canvasSize.height

      // Fondo blanco
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Dibujar imagen de fondo del producto si existe
      if (productImage) {
        try {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = productImage.startsWith('http') ? productImage : `/uploads/products/${productImage}`
          })
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        } catch (error) {
          console.warn('No se pudo cargar la imagen del producto:', error)
        }
      }

      // Dibujar elementos
      for (const element of elements) {
        if (!element.visible) continue

        ctx.save()
        
        // Aplicar transformaciones
        const centerX = element.x + element.width / 2
        const centerY = element.y + element.height / 2
        ctx.translate(centerX, centerY)
        ctx.rotate((element.rotation * Math.PI) / 180)
        ctx.translate(-element.width / 2, -element.height / 2)

        if (element.type === 'text') {
          // Dibujar texto
          ctx.fillStyle = element.color || '#000000'
          ctx.font = `${element.fontWeight || 'normal'} ${element.fontSize || 16}px ${element.fontFamily || 'Arial'}`
          ctx.textAlign = (element.textAlign as CanvasTextAlign) || 'left'
          
          const lines = (element.text || '').split('\n')
          const lineHeight = (element.fontSize || 16) * (element.lineSpacing || 1.2)
          
          lines.forEach((line, index) => {
            ctx.fillText(line, 0, index * lineHeight + (element.fontSize || 16))
          })
        } else if (element.type === 'shape') {
          // Dibujar formas
          ctx.fillStyle = element.color || '#000000'
          if (element.shape === 'rectangle') {
            ctx.fillRect(0, 0, element.width, element.height)
          } else if (element.shape === 'circle') {
            ctx.beginPath()
            ctx.arc(element.width / 2, element.height / 2, Math.min(element.width, element.height) / 2, 0, 2 * Math.PI)
            ctx.fill()
          }
        } else if (element.type === 'image' && element.src) {
          // Dibujar imagen
          try {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            await new Promise((resolve, reject) => {
              img.onload = resolve
              img.onerror = reject
              img.src = element.src.startsWith('http') || element.src.startsWith('/uploads') ? element.src : `/uploads/personalization/${element.src}`
            })
            ctx.drawImage(img, 0, 0, element.width, element.height)
          } catch (error) {
            console.warn('No se pudo cargar la imagen del elemento:', error)
          }
        }

        ctx.restore()
      }

      // Convertir canvas a PDF usando jsPDF (carga dinámica)
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })

      // Convertir canvas a imagen
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)

      // Descargar PDF
      const fileName = `${templateName || 'plantilla'}_preview.pdf`
      pdf.save(fileName)

    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar el PDF. Por favor, intenta de nuevo.')
    }
  }

  // Función para convertir elementos a coordenadas relativas
  const convertElementsToRelative = (elements: TemplateElement[], canvasSize: { width: number, height: number }) => {
    return elements.map(element => {
      const absoluteCoords = {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height
      }
      
      const relativeCoords = absoluteToRelative(absoluteCoords, canvasSize)
      
      return {
        ...element,
        // Guardar coordenadas relativas
        x: relativeCoords.x,
        y: relativeCoords.y,
        width: relativeCoords.width,
        height: relativeCoords.height,
        // Marcar como coordenadas relativas
        isRelativeCoordinates: true,
        // Guardar tamaño de referencia
        referenceCanvasSize: canvasSize
      }
    })
  }

  // Función para convertir elementos de relativas a absolutas
  const convertElementsToAbsolute = (elements: any[], targetCanvasSize: { width: number, height: number }) => {
    return elements.map(element => {
      if (element.isRelativeCoordinates) {
        const relativeCoords = {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height
        }
        
        const absoluteCoords = relativeToAbsolute(relativeCoords, targetCanvasSize)
        
        return {
          ...element,
          x: absoluteCoords.x,
          y: absoluteCoords.y,
          width: absoluteCoords.width,
          height: absoluteCoords.height
        }
      }
      return element
    })
  }

  // Función para validar formato de archivo
  const validateImageFormat = (file: File): boolean => {
    const fileName = file.name.toLowerCase()
    const fileType = file.type.toLowerCase()
    
    // Mapa de extensiones a configuración
    const extensionMap: {[key: string]: keyof typeof templateSettings.allowedImageFormats} = {
      'jpg': 'jpg',
      'jpeg': 'jpg',
      'png': 'png',
      'svg': 'svg',
      'pdf': 'pdf',
      'eps': 'eps',
      'ai': 'ai'
    }
    
    // Obtener extensión del archivo
    const extension = fileName.split('.').pop() || ''
    const formatKey = extensionMap[extension]
    
    if (!formatKey) {
      return false
    }
    
    // Verificar si el formato está permitido
    return templateSettings.allowedImageFormats[formatKey]
  }

  // Funciones para manejar imágenes
  const handleImageUpload = async (file: File, elementId?: string) => {
    setIsUploadingImage(true)
    try {
      console.log('Starting image upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      })

      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'personalization')

      console.log('Sending request to /api/upload...')
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include', // Incluir cookies de sesión
        body: formData
      })

      console.log('Upload response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Upload error response:', errorData)
        throw new Error(`Error al subir la imagen: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Upload response:', data)
      
      const imageUrl = data.url || data.secure_url
      if (!imageUrl) {
        throw new Error('No se recibió URL de la imagen')
      }

      if (elementId) {
        // Reemplazar imagen existente
        updateElement(elementId, { src: imageUrl })
      } else {
        // Obtener área activa para posicionar la imagen correctamente
        const currentArea = getCurrentPrintArea()
        const currentSideData = productSides.find(s => s.id === currentSide)
        const sideImage = currentSideData?.image2D
        
        let imageX = 50, imageY = 50, imageWidth = 200, imageHeight = 200
        
        if (currentArea) {
          // Calcular coordenadas del área
          const areaCoords = getAreaCoordinates(currentArea, sideImage)
          if (areaCoords) {
            // Posicionar imagen en el centro del área con 80% del tamaño del área - aplicar zoom a las coordenadas
            const scaledAreaCoords = {
              x: areaCoords.x,
              y: areaCoords.y,
              width: areaCoords.width,
              height: areaCoords.height
            }
            const maxWidth = scaledAreaCoords.width * 0.8
            const maxHeight = scaledAreaCoords.height * 0.8
            
            // Mantener proporción 1:1 por defecto, usar el menor de los dos
            const size = Math.min(maxWidth, maxHeight)
            
            imageX = scaledAreaCoords.x + (scaledAreaCoords.width - size) / 2
            imageY = scaledAreaCoords.y + (scaledAreaCoords.height - size) / 2
            imageWidth = size
            imageHeight = size
          }
        }
        
        // Crear nuevo elemento de imagen
        const newImageElement: TemplateElement = {
          id: Date.now().toString(),
          type: 'image',
          x: imageX,
          y: imageY,
          width: imageWidth,
          height: imageHeight,
          rotation: 0,
          locked: false,
          visible: true,
          printable: true,
          src: imageUrl,
          canMove: true,
          canResize: true,
          canRotate: true,
          canDelete: true
        }
        updateElementsWithHistory([...elements, newImageElement])
        setSelectedElement(newImageElement.id)
      }
    } catch (error) {
      console.error('Error al subir imagen:', error)
      alert('Error al subir la imagen. Por favor, intenta de nuevo.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const triggerImageUpload = (elementId?: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.dataset.elementId = elementId || ''
      fileInputRef.current.click()
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const elementId = e.target.dataset.elementId || undefined
      handleImageUpload(file, elementId)
    }
    // Reset input
    e.target.value = ''
  }

  const selectedElementData = useMemo(() => {
    return elements.find(el => el.id === selectedElement)
  }, [elements, selectedElement])

  if (!isOpen) return null


  // Shapes Panel Component
  const ShapesPanel = () => {
    // Fetch shapes from the API
    const { data: shapes, isLoading } = useSWR(
      activePanel === 'shapes' ? '/api/personalization/shapes' : null,
      fetcher,
      { revalidateOnFocus: false }
    )

    // Memoize shapes to prevent unnecessary re-renders
    const shapesList = useMemo(() => shapes || [], [shapes])
    
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // Compute filtered shapes directly with useMemo
    const filteredShapes = useMemo(() => {
      let filtered = shapesList

      if (selectedCategory !== 'all') {
        filtered = filtered.filter((shape: ShapeItem) => shape.category === selectedCategory)
      }

      if (searchTerm) {
        filtered = filtered.filter((shape: ShapeItem) => 
          shape.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shape.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }

      return filtered
    }, [shapesList, searchTerm, selectedCategory])

    // Generate categories from the actual shapes
    const allCategories = shapesList.reduce((cats: any[], shape: ShapeItem) => {
      if (!cats.some(c => c.id === shape.category)) {
        cats.push({
          id: shape.category,
          name: getCategoryDisplayName(shape.category),
          count: shapesList.filter((s: ShapeItem) => s.category === shape.category).length
        })
      }
      return cats
    }, [])

    const categories = [
      { id: 'all', name: 'Todas', count: shapesList.length },
      ...allCategories
    ].filter(cat => cat.count > 0)

    function getCategoryDisplayName(category: string) {
      const categoryNames: Record<string, string> = {
        'geometricas': '🔷 Geométricas',
        'decorativas': '✨ Decorativas', 
        'letras': '🔤 Letras',
        'marcos': '🖼️ Marcos',
        'naturaleza': '🌿 Naturaleza'
      }
      return categoryNames[category] || category
    }

    const handleSelectShape = (shape: ShapeItem) => {
      addShapeToTemplate(shape)
    }

    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Biblioteca de Formas</h3>
        
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar formas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Categorías</h4>
          <div className="space-y-1">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  {category.name}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* View Mode */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Vista</h4>
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {filteredShapes.length} forma{filteredShapes.length !== 1 ? 's' : ''} encontrada{filteredShapes.length !== 1 ? 's' : ''}
            </span>
            {searchTerm && (
              <Badge variant="secondary">
                Filtro: "{searchTerm}"
              </Badge>
            )}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-gray-600">Cargando formas...</span>
          </div>
        )}

        {/* Shapes Grid/List */}
        {!isLoading && viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredShapes.map((shape: ShapeItem) => (
              <Card 
                key={shape.id} 
                className="group cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSelectShape(shape)}
              >
                <div className="relative p-3">
                  <div className="w-full h-16 flex items-center justify-center bg-gray-50 rounded border">
                    {shape.fileType === 'image/svg+xml' ? (
                      <img
                        src={`${window.location.origin}${shape.fileUrl}`}
                        alt={shape.name}
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <Shapes className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {shape.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {getCategoryDisplayName(shape.category)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : !isLoading && viewMode === 'list' ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredShapes.map((shape: ShapeItem) => (
              <div
                key={shape.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSelectShape(shape)}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded">
                  {shape.fileType === 'image/svg+xml' ? (
                    <img
                      src={`${window.location.origin}${shape.fileUrl}`}
                      alt={shape.name}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <Shapes className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{shape.name}</p>
                  <p className="text-xs text-gray-500">{getCategoryDisplayName(shape.category)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Empty state */}
        {!isLoading && filteredShapes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Shapes className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              {searchTerm ? 
                `No se encontraron formas con "${searchTerm}"` : 
                'No hay formas disponibles'
              }
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed top-16 left-56 right-0 bottom-0 bg-black/50 backdrop-blur-sm z-50 flex">
      {/* Main Editor */}
      <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? 'Editar Plantilla' : 'Editor de Plantillas'}
            </h2>
            <p className="text-sm text-gray-600">{templateName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowElementsLibrary(!showElementsLibrary)}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                showElementsLibrary ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Layers className="h-4 w-4" />
              Elementos
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                showPreview ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Eye className="h-4 w-4" />
              Vista Previa
            </button>
            <button
              onClick={() => setShowTemplateSettings(!showTemplateSettings)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
              type="button"
            >
              <Settings className="h-4 w-4" />
              Ajustes de Plantilla
            </button>
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
              type="button"
            >
              <Save className="h-4 w-4" />
              {isEditMode ? 'Actualizar' : 'Guardar'}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              PDF
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">

          <div className="flex items-center gap-1">
            <button 
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`p-2 rounded ${historyIndex <= 0 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200'}`} 
              title="Deshacer (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button 
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`p-2 rounded ${historyIndex >= history.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200'}`} 
              title="Rehacer (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            <button 
              onClick={() => selectedElement && moveElementForward(selectedElement)}
              disabled={!selectedElement}
              className={`p-2 rounded ${!selectedElement ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200'}`} 
              title="Enviar hacia delante"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button 
              onClick={() => selectedElement && moveElementBackward(selectedElement)}
              disabled={!selectedElement}
              className={`p-2 rounded ${!selectedElement ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200'}`} 
              title="Enviar hacia atrás"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Zoom:</span>
            <button
              onClick={() => handleZoom(zoom - 0.25)}
              className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              title="Alejar (25%)"
            >
              -
            </button>
            <span className={`text-sm font-medium min-w-[3rem] text-center px-2 py-1 rounded ${
              zoom === 1 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => handleZoom(zoom + 0.25)}
              className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              title="Acercar (25%)"
            >
              +
            </button>
            <button
              onClick={() => handleZoom(1)}
              className="px-2 py-1 text-sm bg-blue-200 rounded hover:bg-blue-300 ml-2"
              title="Zoom 100%"
            >
              100%
            </button>
          </div>

          {/* Atajos de teclado info */}
          <div className="text-xs text-gray-500">
            <span className="hidden lg:inline">
              Ctrl+Z: Deshacer | Ctrl+Y: Rehacer | Ctrl++: Acercar | Ctrl+-: Alejar | Ctrl+0: 100%
            </span>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* New Left Panel - Like User Editor */}
          {showElementsLibrary && (
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
              {/* Direct Action Buttons - Vertical Layout */}
              <div className="p-4 border-b border-gray-200">
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setActivePanel('design')
                      setSelectedElement(null)
                    }}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      activePanel === 'design'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <Settings className="h-5 w-5 mr-3" />
                      <span className="font-medium">Diseño</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleDirectImageUpload}
                    className="w-full p-3 rounded-lg border-2 text-left border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700 transition-all"
                  >
                    <div className="flex items-center">
                      <Upload className="h-5 w-5 mr-3" />
                      <span className="font-medium">Cargar</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setShowImageLibrary(true)}
                    className="w-full p-3 rounded-lg border-2 text-left transition-all border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700"
                  >
                    <div className="flex items-center">
                      <Image className="h-5 w-5 mr-3" />
                      <span className="font-medium">Biblioteca de Imágenes</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setShowShapesLibrary(true)}
                    className="w-full p-3 rounded-lg border-2 text-left transition-all border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700"
                  >
                    <div className="flex items-center">
                      <Shapes className="h-5 w-5 mr-3" />
                      <span className="font-medium">Biblioteca de Formas</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleDirectTextAdd}
                    className="w-full p-3 rounded-lg border-2 text-left border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700 transition-all"
                  >
                    <div className="flex items-center">
                      <Type className="h-5 w-5 mr-3" />
                      <span className="font-medium">Texto</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Panel Content - Solo spacer */}
              <div className="flex-1"></div>

              {/* Spacer to push selector down */}
              <div className="flex-1"></div>

              {/* Product Sides Selector - At bottom like user editor */}
              {productSides.length > 0 && (
                <div className="border-t border-gray-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Lados del Producto
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {productSides.map((side) => (
                      <button
                        key={side.id}
                        onClick={() => handleSideChange(side.id)}
                        className={`relative group p-2 rounded-lg border-2 transition-all ${
                          currentSide === side.id 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50 bg-white'
                        }`}
                      >
                        {/* Side Image Preview */}
                        <div className="aspect-square mb-1 bg-gray-100 rounded overflow-hidden">
                          {side.image2D ? (
                            <img 
                              src={side.image2D} 
                              alt={side.displayName || side.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        
                        {/* Side Name */}
                        <div className="text-xs font-medium text-center truncate">
                          {side.displayName || side.name}
                        </div>
                        
                        {/* Active Indicator */}
                        {currentSide === side.id && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-2 w-2 text-white" />
                          </div>
                        )}
                        
                        {/* Print Areas Count */}
                        {side.printAreas && side.printAreas.length > 0 && (
                          <div className="absolute -top-1 -left-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            <span className="text-xs">{side.printAreas.length}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* Current Side Info */}
                  {currentSide && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      <strong>Lado actual:</strong> {productSides.find(s => s.id === currentSide)?.displayName || productSides.find(s => s.id === currentSide)?.name}
                      <br />
                      <strong>Áreas de impresión:</strong> {productSides.find(s => s.id === currentSide)?.printAreas?.length || 0}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Canvas */}
          <div 
            ref={canvasContainerRef}
            className="flex-1 bg-gray-100 overflow-auto p-8"
          >
            <div className="flex justify-center">
              <div
                className="bg-white border border-gray-300 relative shadow-lg flex items-center justify-center"
                style={{
                  width: canvasSize.width * 1.5, // Más espacio para zoom
                  height: canvasSize.height * 1.5,
                  cursor: 'crosshair'
                }}
                onWheel={handleWheel}
                title="Usa la rueda del mouse para hacer zoom. Ctrl+0 para resetear al 100%."
              >
                <div
                  ref={canvasRef}
                  className="relative"
                  style={{
                    width: canvasSize.width,
                    height: canvasSize.height,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center'
                  }}
                  onClick={handleCanvasClick}
                >
                {/* Product Image Background */}
                {productImage && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${productImage})`,
                      backgroundSize: 'contain'
                    }}
                    onLoad={() => console.log('🖼️ Product image loaded in DOM')}
                    onError={() => console.error('❌ Product image failed to load')}
                  />
                )}
                {!productImage && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                    No product image available
                  </div>
                )}
                
                {/* Canvas Background */}
                <div className="absolute inset-0 bg-white/10" />

                {/* Center Guidelines */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Vertical center line */}
                  <div 
                    className={`absolute top-0 bottom-0 w-px border-l border-dashed transition-colors duration-200 ${
                      snapActive.x 
                        ? 'bg-orange-500/80 border-orange-500' 
                        : 'bg-blue-400/60 border-blue-400'
                    }`}
                    style={{
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }}
                  />
                  {/* Horizontal center line */}
                  <div 
                    className={`absolute left-0 right-0 h-px border-t border-dashed transition-colors duration-200 ${
                      snapActive.y 
                        ? 'bg-orange-500/80 border-orange-500' 
                        : 'bg-blue-400/60 border-blue-400'
                    }`}
                    style={{
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  />
                </div>

                {/* Print Areas Visualization */}
                {productSides.length > 0 && currentSide && (
                  <div className="absolute inset-0 pointer-events-none">
                    {productSides
                      .find(side => side.id === currentSide)
                      ?.printAreas?.map((area) => {
                        // Obtener la imagen específica del lado actual
                        const currentSideData = productSides.find(s => s.id === currentSide)
                        const sideImage = currentSideData?.image2D
                        
                        // Usar la función getAreaCoordinates para obtener coordenadas correctas
                        const areaCoords = getAreaCoordinates(area, sideImage)
                        if (!areaCoords) return null
                        
                        return (
                          <div
                            key={area.id}
                            className="absolute border-4 border-dashed border-green-500 bg-green-200/30 shadow-lg"
                            style={{
                              left: areaCoords.x,
                              top: areaCoords.y,
                              width: areaCoords.width,
                              height: areaCoords.height,
                              boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.2), inset 0 0 20px rgba(34, 197, 94, 0.1)',
                              borderRadius: '4px'
                            }}
                          >
                            {/* Area label */}
                            <div 
                              className="absolute left-0 bg-green-600 text-white px-2 py-1 text-xs font-medium rounded-md shadow-lg border border-green-700"
                              style={{
                                top: -24,
                                fontSize: Math.max(10, 12),
                              }}
                            >
                              {area.name}
                            </div>
                            
                            {/* Corner indicators para mejor visibilidad */}
                            <div 
                              className="absolute top-0 left-0 bg-green-500 border-2 border-white rounded-full shadow-md"
                              style={{
                                width: Math.max(6, 8),
                                height: Math.max(6, 8),
                                transform: 'translate(-50%, -50%)'
                              }}
                            ></div>
                            <div 
                              className="absolute top-0 right-0 bg-green-500 border-2 border-white rounded-full shadow-md"
                              style={{
                                width: Math.max(6, 8),
                                height: Math.max(6, 8),
                                transform: 'translate(50%, -50%)'
                              }}
                            ></div>
                            <div 
                              className="absolute bottom-0 left-0 bg-green-500 border-2 border-white rounded-full shadow-md"
                              style={{
                                width: Math.max(6, 8),
                                height: Math.max(6, 8),
                                transform: 'translate(-50%, 50%)'
                              }}
                            ></div>
                            <div 
                              className="absolute bottom-0 right-0 bg-green-500 border-2 border-white rounded-full shadow-md"
                              style={{
                                width: Math.max(6, 8),
                                height: Math.max(6, 8),
                                transform: 'translate(50%, 50%)'
                              }}
                            ></div>
                          </div>
                        )
                      })}
                  </div>
                )}

                {/* Elements */}
                {elements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute group ${
                      selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
                    } ${!element.visible ? 'opacity-50' : ''}`}
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      transform: `rotate(${element.rotation}deg)`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedElement(element.id)
                    }}
                    onMouseDown={(e) => {
                      if (e.target === e.currentTarget || e.target.closest('.element-content')) {
                        const rect = canvasRef.current?.getBoundingClientRect()
                        if (!rect) return
                        
                        const startX = ((e.clientX - rect.left) / zoom) - element.x
                        const startY = ((e.clientY - rect.top) / zoom) - element.y
                        
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          let newX = Math.max(-element.width/2, Math.min(canvasSize.width - element.width/2, ((moveEvent.clientX - rect.left) / zoom) - startX))
                          let newY = Math.max(-element.height/2, Math.min(canvasSize.height - element.height/2, ((moveEvent.clientY - rect.top) / zoom) - startY))
                          
                          // Aplicar snap a las guías de centrado
                          const snapped = snapToCenter(newX, newY, element.width, element.height)
                          newX = snapped.x
                          newY = snapped.y
                          
                          // Actualizar estado de snap activo
                          setSnapActive({ x: snapped.isSnappingX, y: snapped.isSnappingY })
                          
                          updateElement(element.id, { x: newX, y: newY })
                          setIsDragging(true)
                        }
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove)
                          document.removeEventListener('mouseup', handleMouseUp)
                          setIsDragging(false)
                          setSnapActive({ x: false, y: false })
                        }
                        
                        document.addEventListener('mousemove', handleMouseMove)
                        document.addEventListener('mouseup', handleMouseUp)
                        e.preventDefault()
                      }
                    }}
                  >
                    {element.type === 'text' && (
                      <div
                        className="element-content cursor-move"
                        style={{
                          fontSize: element.fontSize,
                          fontFamily: element.fontFamily,
                          fontWeight: element.fontWeight,
                          fontStyle: element.fontStyle,
                          textAlign: element.textAlign,
                          textDecoration: element.textDecoration,
                          color: element.color,
                          letterSpacing: `${element.letterSpacing || 0}px`,
                          lineHeight: element.lineSpacing || 1.2,
                          textTransform: element.autoUppercase ? 'uppercase' : 'none',
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: element.verticalAlign === 'top' ? 'flex-start' : 
                                     element.verticalAlign === 'bottom' ? 'flex-end' : 'center',
                          justifyContent: element.textAlign === 'center' ? 'center' : 
                                         element.textAlign === 'right' ? 'flex-end' : 'flex-start',
                          overflow: 'hidden',
                        }}
                      >
                        {element.curved ? (
                          // Texto curvo: usando CSS con path para crear el arco
                          <div
                            style={{
                              position: 'relative',
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'visible'
                            }}
                          >
                            <svg
                              viewBox="0 0 200 100"
                              style={{
                                width: '100%',
                                height: '100%',
                                overflow: 'visible'
                              }}
                            >
                              <defs>
                                <path
                                  id={`curve-${element.id}`}
                                  d={(() => {
                                    const curveValue = element.curveRadius || 50
                                    const curvature = (curveValue - 50) * 2 // -100 a +100
                                    
                                    if (curvature === 0) {
                                      // Línea recta
                                      return "M 20 50 L 180 50"
                                    } else {
                                      // Arco: curvatura positiva = arco hacia arriba, negativa = hacia abajo
                                      const controlY = 50 - curvature
                                      return `M 20 50 Q 100 ${controlY} 180 50`
                                    }
                                  })()}
                                />
                              </defs>
                              <text
                                style={{
                                  fontSize: element.fontSize || 16,
                                  fontFamily: element.fontFamily || 'Arial',
                                  fontWeight: element.fontWeight || 'normal',
                                  fontStyle: element.fontStyle || 'normal',
                                  fill: element.color || '#000000',
                                  textAnchor: 'middle'
                                }}
                              >
                                <textPath
                                  href={`#curve-${element.id}`}
                                  startOffset="50%"
                                >
                                  {element.text}
                                </textPath>
                              </text>
                            </svg>
                          </div>
                        ) : (
                          // Texto normal
                          element.text
                        )}
                      </div>
                    )}

                    {element.type === 'shape' && (
                      <StableShapeRenderer 
                        element={element} 
                        zoom={zoom}
                        updateElement={updateElement}
                      />
                    )}

                    {element.type === 'image' && (
                      <div className="element-content cursor-move w-full h-full">
                        {element.src ? (
                          <img
                            src={element.src.startsWith('http') || element.src.startsWith('/uploads') 
                              ? element.src 
                              : `/uploads/personalization/${element.src}`}
                            alt="Imagen"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              console.error('Error loading image:', element.src)
                              e.currentTarget.style.display = 'none'
                              const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                              if (placeholder) {
                                placeholder.style.display = 'flex'
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center ${
                            element.src ? 'hidden' : 'flex'
                          }`}
                        >
                          <Image className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>
                    )}
                    
                    {/* Manipulation Controls - Only show when selected */}
                    {selectedElement === element.id && (
                      <>
                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteElement(element.id)
                          }}
                          className="absolute bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg z-10"
                          style={{
                            top: -8,
                            right: -8,
                            width: 24,
                            height: 24
                          }}
                          title="Eliminar"
                        >
                          <X style={{ width: 12, height: 12 }} />
                        </button>

                        {/* Resize Handles */}
                        {/* Top-left */}
                        <div
                          className="absolute bg-blue-500 border-2 border-white rounded-full cursor-nw-resize shadow-lg"
                          style={{
                            top: -4,
                            left: -4,
                            width: 12,
                            height: 12
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            const startX = e.clientX
                            const startY = e.clientY
                            const startWidth = element.width
                            const startHeight = element.height
                            const startLeft = element.x
                            const startTop = element.y
                            
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const deltaX = (moveEvent.clientX - startX) / zoom
                              const deltaY = (moveEvent.clientY - startY) / zoom
                              const newWidth = Math.max(20, startWidth - deltaX)
                              const newHeight = Math.max(20, startHeight - deltaY)
                              const newX = startLeft + (startWidth - newWidth)
                              const newY = startTop + (startHeight - newHeight)
                              
                              updateElement(element.id, { 
                                width: newWidth, 
                                height: newHeight,
                                x: newX,
                                y: newY
                              })
                            }
                            
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove)
                              document.removeEventListener('mouseup', handleMouseUp)
                            }
                            
                            document.addEventListener('mousemove', handleMouseMove)
                            document.addEventListener('mouseup', handleMouseUp)
                          }}
                        />

                        {/* Top-right */}
                        <div
                          className="absolute bg-blue-500 border-2 border-white rounded-full cursor-ne-resize shadow-lg"
                          style={{
                            top: -4,
                            right: -4,
                            width: 12,
                            height: 12
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            const startX = e.clientX
                            const startY = e.clientY
                            const startWidth = element.width
                            const startHeight = element.height
                            const startTop = element.y
                            
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const deltaX = (moveEvent.clientX - startX) / zoom
                              const deltaY = (moveEvent.clientY - startY) / zoom
                              const newWidth = Math.max(20, startWidth + deltaX)
                              const newHeight = Math.max(20, startHeight - deltaY)
                              const newY = startTop + (startHeight - newHeight)
                              
                              updateElement(element.id, { 
                                width: newWidth, 
                                height: newHeight,
                                y: newY
                              })
                            }
                            
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove)
                              document.removeEventListener('mouseup', handleMouseUp)
                            }
                            
                            document.addEventListener('mousemove', handleMouseMove)
                            document.addEventListener('mouseup', handleMouseUp)
                          }}
                        />

                        {/* Bottom-left */}
                        <div
                          className="absolute bg-blue-500 border-2 border-white rounded-full cursor-sw-resize shadow-lg"
                          style={{
                            bottom: -4,
                            left: -4,
                            width: 12,
                            height: 12
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            const startX = e.clientX
                            const startY = e.clientY
                            const startWidth = element.width
                            const startHeight = element.height
                            const startLeft = element.x
                            
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const deltaX = (moveEvent.clientX - startX) / zoom
                              const deltaY = (moveEvent.clientY - startY) / zoom
                              const newWidth = Math.max(20, startWidth - deltaX)
                              const newHeight = Math.max(20, startHeight + deltaY)
                              const newX = startLeft + (startWidth - newWidth)
                              
                              updateElement(element.id, { 
                                width: newWidth, 
                                height: newHeight,
                                x: newX
                              })
                            }
                            
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove)
                              document.removeEventListener('mouseup', handleMouseUp)
                            }
                            
                            document.addEventListener('mousemove', handleMouseMove)
                            document.addEventListener('mouseup', handleMouseUp)
                          }}
                        />

                        {/* Bottom-right */}
                        <div
                          className="absolute bg-blue-500 border-2 border-white rounded-full cursor-se-resize shadow-lg"
                          style={{
                            bottom: -4,
                            right: -4,
                            width: 12,
                            height: 12
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            const startX = e.clientX
                            const startY = e.clientY
                            const startWidth = element.width
                            const startHeight = element.height
                            
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const deltaX = (moveEvent.clientX - startX) / zoom
                              const deltaY = (moveEvent.clientY - startY) / zoom
                              const newWidth = Math.max(20, startWidth + deltaX)
                              const newHeight = Math.max(20, startHeight + deltaY)
                              
                              updateElement(element.id, { 
                                width: newWidth, 
                                height: newHeight
                              })
                            }
                            
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove)
                              document.removeEventListener('mouseup', handleMouseUp)
                            }
                            
                            document.addEventListener('mousemove', handleMouseMove)
                            document.addEventListener('mouseup', handleMouseUp)
                          }}
                        />

                        {/* Rotation Handle */}
                        <div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-green-500 hover:bg-green-600 border-2 border-white rounded-full cursor-grab shadow-lg flex items-center justify-center"
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            const rect = e.currentTarget.closest('.group')?.getBoundingClientRect()
                            if (!rect) return
                            
                            const centerX = rect.left + rect.width / 2
                            const centerY = rect.top + rect.height / 2
                            
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const angle = Math.atan2(
                                moveEvent.clientY - centerY,
                                moveEvent.clientX - centerX
                              ) * 180 / Math.PI
                              
                              updateElement(element.id, { rotation: Math.round(angle) })
                            }
                            
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove)
                              document.removeEventListener('mouseup', handleMouseUp)
                            }
                            
                            document.addEventListener('mousemove', handleMouseMove)
                            document.addEventListener('mouseup', handleMouseUp)
                          }}
                          title="Rotar"
                        >
                          <RotateCw className="h-4 w-4 text-white" />
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Grid overlay when not in preview */}
                {!showPreview && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      backgroundImage: 'linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}
                  />
                )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Properties */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">
                {selectedElementData ? 'Propiedades del Elemento' : 'Panel de Herramientas'}
              </h3>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Panel Content when no element is selected */}
              {!selectedElementData && (
                <div className="p-4">
                  {activePanel === 'design' && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Elementos del Área</h3>
                      
                      {/* Elements List */}
                      <div className="space-y-2">
                        {elements.length > 0 ? (
                          elements.map((element, index) => {
                            const getElementIcon = () => {
                              // Si es una forma con máscara, mostrar icono de cámara junto al icono de forma
                              const getShapeIcon = () => {
                                switch (element.type) {
                                  case 'text':
                                  case 'i-text':
                                    return <Type className="h-4 w-4" />
                                  case 'image':
                                    return <Image className="h-4 w-4" />
                                  case 'shape':
                                    // Para formas personalizadas, intentar mostrar según shapeType
                                    if (element.shapeType === 'custom') {
                                      return <Star className="h-4 w-4" />
                                    }
                                    switch (element.shapeType) {
                                      case 'rectangle':
                                      case 'rect':
                                        return <Square className="h-4 w-4" />
                                      case 'circle':
                                        return <Circle className="h-4 w-4" />
                                      case 'triangle':
                                        return <Triangle className="h-4 w-4" />
                                      case 'star':
                                        return <Star className="h-4 w-4" />
                                      case 'heart':
                                        return <Heart className="h-4 w-4" />
                                      default:
                                        return <Square className="h-4 w-4" />
                                    }
                                  case 'rect':
                                    return <Square className="h-4 w-4" />
                                  case 'circle':
                                    return <Circle className="h-4 w-4" />
                                  case 'triangle':
                                    return <Triangle className="h-4 w-4" />
                                  case 'path':
                                    return <Star className="h-4 w-4" />
                                  default:
                                    return <Square className="h-4 w-4" />
                                }
                              }
                              
                              const shapeIcon = getShapeIcon()
                              
                              // Si es una forma con máscara habilitada, mostrar cámara también
                              if (element.type === 'shape' && element.useAsFillableShape) {
                                return (
                                  <div className="flex items-center">
                                    {shapeIcon}
                                    <Camera className="h-3 w-3 ml-1 opacity-70" />
                                  </div>
                                )
                              }
                              
                              return shapeIcon
                            }

                            const getElementColor = () => {
                              switch (element.type) {
                                case 'text':
                                case 'i-text':
                                  return 'bg-blue-100 text-blue-600'
                                case 'image':
                                  return 'bg-green-100 text-green-600'
                                case 'rect':
                                case 'circle':
                                case 'triangle':
                                case 'path':
                                  return 'bg-purple-100 text-purple-600'
                                default:
                                  return 'bg-gray-100 text-gray-600'
                              }
                            }

                            // Visual feedback for drag & drop
                            const showInsertionLine = draggedElementIndex !== null && dragOverIndex === index && draggedElementIndex !== index
                            const isDraggedElement = draggedElementIndex === index
                            const isDragTarget = dragOverIndex === index && draggedElementIndex !== null && draggedElementIndex !== index
                            
                            return (
                              <div key={element.id}>
                                {/* Insertion line indicator */}
                                {showInsertionLine && (
                                  <div className="relative">
                                    <div className="h-1 bg-blue-500 mx-2 mb-2 rounded-full shadow-md"></div>
                                    <div className="absolute -top-1 left-4 w-3 h-3 bg-blue-500 rounded-full shadow-md"></div>
                                    <div className="absolute -top-1 right-4 w-3 h-3 bg-blue-500 rounded-full shadow-md"></div>
                                  </div>
                                )}
                                
                                <div
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, index)}
                                  onDragOver={(e) => handleDragOver(e, index)}
                                  onDragLeave={handleDragLeave}
                                  onDrop={(e) => handleDrop(e, index)}
                                  onDragEnd={handleDragEnd}
                                  className={`border rounded-lg p-3 transition-all cursor-grab active:cursor-grabbing ${
                                    selectedElement === element.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                                  } ${isDraggedElement ? 'opacity-50 scale-95' : ''}
                                  ${isDragTarget ? 'border-blue-500 bg-blue-50 shadow-lg' : ''}
                                  ${!isDraggedElement && !isDragTarget ? 'hover:border-orange-300' : ''}`}
                                  onClick={(e) => {
                                    // Solo seleccionar si no estamos arrastrando
                                    if (draggedElementIndex === null) {
                                      setSelectedElement(element.id)
                                      // Scroll to element properties if needed
                                      const rightPanel = document.querySelector('.right-panel')
                                      if (rightPanel) {
                                        rightPanel.scrollTo({ top: 0, behavior: 'smooth' })
                                      }
                                    }
                                  }}
                                >
                                <div className="flex items-center gap-3">
                                  {/* Drag Handle */}
                                  <div 
                                    className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                                    title="Arrastra para reordenar"
                                  >
                                    <GripVertical className="h-4 w-4" />
                                  </div>
                                  
                                  {/* Element Icon */}
                                  <div className={`p-2 rounded ${getElementColor()}`}>
                                    {getElementIcon()}
                                  </div>

                                  {/* Element Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-900">
                                      {editingElementId === element.id && (element.type === 'text' || element.type === 'i-text') ? (
                                        <div className="flex items-center gap-2">
                                          <Input
                                            value={tempElementName}
                                            onChange={(e) => setTempElementName(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                e.preventDefault()
                                                saveElementName(element.id)
                                              } else if (e.key === 'Escape') {
                                                e.preventDefault()
                                                cancelEditingElementName()
                                              }
                                            }}
                                            className="h-7 text-xs border-2 border-orange-400 focus:border-orange-500 bg-orange-50"
                                            autoFocus
                                            placeholder="Escribe el texto aquí..."
                                          />
                                          <Button
                                            size="sm"
                                            onClick={() => saveElementName(element.id)}
                                            className="h-7 px-2 text-xs bg-orange-600 hover:bg-orange-700"
                                          >
                                            <Check className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <div 
                                          className={`truncate cursor-text hover:text-orange-600 ${
                                            element.type === 'text' || element.type === 'i-text' 
                                              ? 'border border-dashed border-gray-400 hover:border-orange-400 px-2 py-1 rounded bg-gray-50 hover:bg-orange-50' 
                                              : ''
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            if (element.type === 'text' || element.type === 'i-text') {
                                              startEditingElementName(element.id, element.text || element.name || '')
                                            }
                                          }}
                                          title={element.type === 'text' || element.type === 'i-text' ? "Haz clic para editar el texto" : ""}
                                        >
                                          {element.type === 'text' || element.type === 'i-text' ? (
                                            element.text || element.name || 'Haz clic para editar texto'
                                          ) : (
                                            element.name || `${element.type.charAt(0).toUpperCase() + element.type.slice(1)} ${element.id.slice(-4)}`
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {element.type.toUpperCase()} • {getElementSizeInCm(element)}
                                    </div>
                                    <div className="text-xs text-blue-600">
                                      Debug: Área {(() => {
                                        const currentArea = getCurrentPrintArea()
                                        if (!currentArea) return 'N/A×N/A'
                                        return `${Math.round(currentArea.width)}×${Math.round(currentArea.height)}`
                                      })()} px | Real {(() => {
                                        const currentArea = getCurrentPrintArea()
                                        if (!currentArea?.realWidth || !currentArea?.realHeight) return 'N/A×N/A'
                                        return `${currentArea.realWidth}×${currentArea.realHeight}`
                                      })()} cm | Factor {(() => {
                                        const currentArea = getCurrentPrintArea()
                                        if (!currentArea?.realWidth || !currentArea?.realHeight) return 'N/A×N/A'
                                        const factorW = (currentArea.width / currentArea.realWidth).toFixed(2)
                                        const factorH = (currentArea.height / currentArea.realHeight).toFixed(2)
                                        return `${factorW}×${factorH}`
                                      })()}
                                    </div>
                                  </div>

                                  {/* Controls */}
                                  <div className="flex items-center gap-1">
                                    {/* Visibility Toggle */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        // Toggle visibility logic would go here
                                      }}
                                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                                      title={element.visible !== false ? "Ocultar" : "Mostrar"}
                                    >
                                      {element.visible !== false ? (
                                        <Eye className="h-4 w-4 text-gray-600" />
                                      ) : (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                      )}
                                    </button>

                                    {/* Delete */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        // Delete element logic would go here
                                        const updatedElements = elements.filter(el => el.id !== element.id)
                                        setElements(updatedElements)
                                      }}
                                      className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                      title="Eliminar"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              </div>
                            )
                          })
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-sm">No hay elementos en esta área</p>
                            <p className="text-xs text-gray-400 mt-1">Añade texto, imágenes o formas para comenzar</p>
                          </div>
                        )}
                      </div>

                      {/* Clear All Button */}
                      {elements.length > 0 && (
                        <div className="pt-3 mt-3 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setElements([])
                              setSelectedElement(null)
                            }}
                            className="w-full px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Limpiar todo
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activePanel === 'shapes' && <ShapesPanel />}

                  {/* Panel de imágenes eliminado - ahora se usa modal */}
                  {false && activePanel === 'images' && hasLinkedImages && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-900">Imágenes Enlazadas ({linkedImages.length})</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {linkedImages.map((image) => (
                          <div
                            key={image.id}
                            className="relative group cursor-pointer border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                            onClick={() => {
                              // Aquí agregaremos la lógica para añadir la imagen al canvas
                              console.log('Imagen seleccionada:', image.name);
                            }}
                          >
                            <div className="aspect-square bg-gray-100 flex items-center justify-center">
                              <img
                                src={image.thumbnailUrl || image.fileUrl}
                                alt={image.name}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  // Fallback si la imagen no carga
                                  e.currentTarget.src = '/placeholder-image.png';
                                }}
                              />
                            </div>
                            <div className="p-2 bg-white">
                              <p className="text-xs font-medium text-gray-900 truncate" title={image.name}>
                                {image.name}
                              </p>
                              {image.linkType && (
                                <span className={`inline-block px-1 py-0.5 text-xs rounded text-white mt-1 ${
                                  image.linkType === 'direct' ? 'bg-blue-500' :
                                  image.linkType === 'category' ? 'bg-green-500' :
                                  'bg-purple-500'
                                }`}>
                                  {image.linkType === 'direct' ? 'Directa' :
                                   image.linkType === 'category' ? 'Categoría' :
                                   'Macrocategoría'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Properties Panel when element is selected */}
              {selectedElementData && (
              <div className="flex-1 p-3 overflow-y-auto" style={{ maxHeight: '100vh', minHeight: '600px' }}>
                {/* Shape Settings Panel - Replace entire content when active */}
                {selectedElementData.type === 'shape' && showShapeSettings ? (
                  <div className="space-y-2">
                    {/* Back Button */}
                    <div className="pb-2 border-b border-gray-200">
                      <button
                        onClick={() => setShowShapeSettings(false)}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <ChevronLeft className="h-3 w-3" />
                        Volver a Editor de Forma
                      </button>
                    </div>

                    {/* Nombre del elemento */}
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Nombre del elemento</label>
                      <input
                        type="text"
                        value={selectedElementData.name || ''}
                        onChange={(e) => updateElement(selectedElementData.id, { name: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                        placeholder="Nombre de la forma"
                      />
                    </div>

                    {/* Permisos del usuario */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">Comprobar todo</label>
                      <div className="space-y-1">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canMove !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { canMove: e.target.checked })}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3 h-3"
                          />
                          Mover
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canRotate !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { canRotate: e.target.checked })}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3 h-3"
                          />
                          Girar
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canResize !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { canResize: e.target.checked })}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3 h-3"
                          />
                          Redimensionar
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canDelete !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { canDelete: e.target.checked })}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3 h-3"
                          />
                          Borrar
                        </label>
                      </div>
                    </div>

                    {/* Edición obligatoria */}
                    <div className="space-y-1">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedElementData.mandatoryToEdit || false}
                          onChange={(e) => updateElement(selectedElementData.id, { mandatoryToEdit: e.target.checked })}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3 h-3"
                        />
                        Mandatory to edit
                      </label>
                    </div>

                    {/* Configuraciones de trazo */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">Configuraciones de trazo</label>
                      <div className="space-y-1">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canChangeStrokeWidth !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { canChangeStrokeWidth: e.target.checked })}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3 h-3"
                          />
                          Cambiar el ancho del trazo
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canChangeStrokeColor !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { canChangeStrokeColor: e.target.checked })}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3 h-3"
                          />
                          Cambiar el color del trazo
                        </label>
                      </div>
                    </div>

                    {/* Manipulación de forma */}
                    <div className="space-y-1">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedElementData.canMoveRotateResizeStretch !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { canMoveRotateResizeStretch: e.target.checked })}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3 h-3"
                        />
                        Mover/rotar/cambiar el tamaño/estirar la forma
                      </label>
                    </div>

                    {/* Solo para formas rellenables */}
                    {selectedElementData.useAsFillableShape && (
                      <div className="space-y-1">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canMoveRotateResizeMaskedImage !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { canMoveRotateResizeMaskedImage: e.target.checked })}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3 h-3"
                          />
                          Mover/rotar/cambiar el tamaño de la imagen en forma
                        </label>
                      </div>
                    )}

                    {/* Capas */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">Duplicar/Espejo/Capas</label>
                      <div className="space-y-1">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.alwaysOnTop || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateElement(selectedElementData.id, {
                                  alwaysOnTop: true,
                                  alwaysOnBottom: false
                                })
                              } else {
                                updateElement(selectedElementData.id, { alwaysOnTop: false })
                              }
                            }}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3 h-3"
                          />
                          Siempre en la primera capa
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.alwaysOnBottom || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateElement(selectedElementData.id, {
                                  alwaysOnBottom: true,
                                  alwaysOnTop: false
                                })
                              } else {
                                updateElement(selectedElementData.id, { alwaysOnBottom: false })
                              }
                            }}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3 h-3"
                          />
                          Siempre en el fondo
                        </label>
                      </div>
                    </div>

                    {/* Imprimible */}
                    <div className="space-y-1">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedElementData.printable !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { printable: e.target.checked })}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3 h-3"
                        />
                        Imprimible
                      </label>
                    </div>

                    {/* Incluir en la miniatura */}
                    <div className="space-y-1">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedElementData.includeInThumbnail !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { includeInThumbnail: e.target.checked })}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3 h-3"
                        />
                        Incluir en la miniatura
                      </label>
                    </div>

                    {/* Información del elemento */}
                    <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 space-y-1">
                      <div>Ancho: {Math.round(selectedElementData.width)}px</div>
                      <div>Alto: {Math.round(selectedElementData.height)}px</div>
                      <div>Rotación: {selectedElementData.rotation || 0}°</div>
                      <div>Tipo: {selectedElementData.shapeType || 'rectangle'}</div>
                    </div>
                  </div>
                
                ) : selectedElementData.type === 'image' && showImageSettings ? (
                  <div className="space-y-2">
                    {/* Back Button */}
                    <div className="pb-2 border-b border-gray-200">
                      <button
                        onClick={() => setShowImageSettings(false)}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <ChevronLeft className="h-3 w-3" />
                        Volver a Editor Imagen
                      </button>
                    </div>

                    {/* Ajustes de Imagen Header */}
                    <div className="bg-blue-50 p-2 rounded">
                      <h4 className="text-xs font-semibold text-blue-800 flex items-center gap-1">
                        <Settings className="h-3 w-3" />
                        Ajustes Avanzados de Imagen
                      </h4>
                    </div>

                    {/* Nombre del elemento */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del elemento</label>
                      <input
                        type="text"
                        value={selectedElementData.name || `Imagen ${selectedElementData.id.slice(-4)}`}
                        onChange={(e) => updateElement(selectedElementData.id, { name: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Comprobar todo */}
                    <div className="bg-green-50 p-2 rounded">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            const checked = e.target.checked
                            updateElement(selectedElementData.id, {
                              canReplaceImage: checked,
                              canMove: checked,
                              canRotate: checked,
                              canResize: checked,
                              canDelete: checked,
                              canAddMask: checked,
                              canReplaceMask: checked,
                              canRemoveMask: checked,
                              canEditMask: checked,
                              canEditMaskStrokeWidth: checked,
                              canEditMaskStrokeColor: checked,
                              canEditMaskedImage: checked,
                              printable: checked
                            })
                          }}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3 h-3"
                        />
                        Comprobar todo
                      </label>
                    </div>

                    {/* Permisos de usuario - Marque para permitir que los usuarios */}
                    <div className="bg-gray-50 p-2 rounded">
                      <label className="block text-xs font-medium text-gray-700 mb-2">Marque para permitir que los usuarios:</label>
                      <div className="space-y-1">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canReplaceImage !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { canReplaceImage: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                          />
                          Reemplazar imagen
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canMove !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { canMove: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                          />
                          Mover
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canRotate !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { canRotate: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                          />
                          Girar
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canResize !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { canResize: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                          />
                          Redimensionar
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canDelete !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { canDelete: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                          />
                          Borrar
                        </label>
                      </div>
                    </div>

                    {/* Configuración obligatoria - with spacing */}
                    <div className="space-y-1">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedElementData.mandatoryToEdit || false}
                          onChange={(e) => updateElement(selectedElementData.id, { mandatoryToEdit: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                        />
                        Obligatorio editar
                      </label>
                    </div>

                    {/* Opciones de máscara */}
                    <div className="bg-purple-50 p-2 rounded">
                      <label className="block text-xs font-medium text-gray-700 mb-2">Opciones de máscara:</label>
                      <div className="space-y-1">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canAddMask || false}
                            onChange={(e) => updateElement(selectedElementData.id, { canAddMask: e.target.checked })}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-3 h-3"
                          />
                          Añadir máscara
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canReplaceMask || false}
                            onChange={(e) => updateElement(selectedElementData.id, { canReplaceMask: e.target.checked })}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-3 h-3"
                          />
                          Reemplazar máscara
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canRemoveMask || false}
                            onChange={(e) => updateElement(selectedElementData.id, { canRemoveMask: e.target.checked })}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-3 h-3"
                          />
                          Quitar la máscara
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canEditMask || false}
                            onChange={(e) => updateElement(selectedElementData.id, { canEditMask: e.target.checked })}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-3 h-3"
                          />
                          Editar máscara
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canEditMaskStrokeWidth || false}
                            onChange={(e) => updateElement(selectedElementData.id, { canEditMaskStrokeWidth: e.target.checked })}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-3 h-3"
                          />
                          Editar el ancho del trazo de la máscara
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canEditMaskStrokeColor || false}
                            onChange={(e) => updateElement(selectedElementData.id, { canEditMaskStrokeColor: e.target.checked })}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-3 h-3"
                          />
                          Editar el color del trazo de la máscara
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canEditMaskedImage || false}
                            onChange={(e) => updateElement(selectedElementData.id, { canEditMaskedImage: e.target.checked })}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-3 h-3"
                          />
                          Editar imagen enmascarada
                        </label>
                      </div>
                    </div>

                    {/* Layer positioning - with exclusive logic and proper spacing */}
                    <div className="mt-3 space-y-1 bg-blue-50 p-2 rounded">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedElementData.alwaysOnTop || false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateElement(selectedElementData.id, {
                                alwaysOnTop: true,
                                alwaysOnBottom: false
                              })
                            } else {
                              updateElement(selectedElementData.id, { alwaysOnTop: false })
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                        />
                        Siempre en la primera capa
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedElementData.alwaysOnBottom || false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateElement(selectedElementData.id, {
                                alwaysOnBottom: true,
                                alwaysOnTop: false
                              })
                            } else {
                              updateElement(selectedElementData.id, { alwaysOnBottom: false })
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                        />
                        Siempre en el fondo
                      </label>
                    </div>

                    {/* Mantener proporción y configuraciones adicionales */}
                    <div className="mt-3 space-y-1">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedElementData.maintainAspectRatio !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { maintainAspectRatio: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                        />
                        Mantener proporción
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedElementData.printable !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { printable: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                        />
                        Imprimible
                      </label>
                    </div>

                    {/* Información del elemento */}
                    <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 space-y-1">
                      <div>Ancho: {Math.round(selectedElementData.width)}px</div>
                      <div>Alto: {Math.round(selectedElementData.height)}px</div>
                      <div>Rotación: {selectedElementData.rotation || 0}°</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                  {/* Text Properties */}
                  {selectedElementData.type === 'text' && !showTextSettings && (
                    <div className="space-y-4">
                      {/* Texto */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Texto</label>
                        <textarea
                          value={selectedElementData.text || ''}
                          onChange={(e) => updateElement(selectedElementData.id, { text: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          rows={3}
                          placeholder="Escribe tu texto aquí..."
                        />
                      </div>

                      {/* Fuente */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Fuente</label>
                        <select
                          value={selectedElementData.fontFamily || 'Arial'}
                          onChange={(e) => updateElement(selectedElementData.id, { fontFamily: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          {availableFonts
                            .filter(font => font.isActive)
                            .map((font) => (
                            <option 
                              key={font.id} 
                              value={font.family} 
                              style={{ fontFamily: font.family }}
                            >
                              {font.family} {font.style}
                            </option>
                          ))}
                          {availableFonts.length === 0 && (
                            <>
                              <option value="Arial">Arial</option>
                              <option value="Helvetica">Helvetica</option>
                              <option value="Times New Roman">Times New Roman</option>
                              <option value="Georgia">Georgia</option>
                            </>
                          )}
                        </select>
                      </div>

                      {/* Texto Arqueado */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedElementData.curved || false}
                            onChange={(e) => updateElement(selectedElementData.id, { curved: e.target.checked })}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          Texto Arqueado
                        </label>
                        {selectedElementData.curved && (
                          <div className="ml-6">
                            <label className="block text-xs text-gray-600 mb-1">Curvatura (0: ⬇ hacia abajo | 50: — plano | 100: ⬆ hacia arriba)</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={selectedElementData.curveRadius || 50}
                              onChange={(e) => updateElement(selectedElementData.id, { curveRadius: parseInt(e.target.value) })}
                              className="w-full"
                            />
                            <div className="text-xs text-gray-500 text-center">{selectedElementData.curveRadius || 50}%</div>
                          </div>
                        )}
                      </div>

                      {/* Estilo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Estilo</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateElement(selectedElementData.id, { 
                              fontWeight: selectedElementData.fontWeight === 'bold' ? 'normal' : 'bold' 
                            })}
                            className={`px-3 py-2 rounded border text-sm font-bold flex items-center gap-2 ${
                              selectedElementData.fontWeight === 'bold' 
                                ? 'bg-orange-100 border-orange-300 text-orange-700' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Bold className="h-4 w-4" />
                            Negrita
                          </button>
                          <button
                            onClick={() => updateElement(selectedElementData.id, { 
                              fontStyle: selectedElementData.fontStyle === 'italic' ? 'normal' : 'italic' 
                            })}
                            className={`px-3 py-2 rounded border text-sm italic flex items-center gap-2 ${
                              selectedElementData.fontStyle === 'italic' 
                                ? 'bg-orange-100 border-orange-300 text-orange-700' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Italic className="h-4 w-4" />
                            Cursiva
                          </button>
                        </div>
                      </div>

                      {/* Color */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Color</label>
                        <div className="grid grid-cols-10 gap-0.5 mb-3">
                          {predefinedColors.map((color, index) => (
                            <button
                              key={`color-${index}-${color}`}
                              onClick={() => updateElement(selectedElementData.id, { color })}
                              className={`w-5 h-5 rounded border transition-all hover:scale-110 ${
                                selectedElementData.color === color ? 'border-gray-900 shadow-md border-2' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                        <input
                          type="color"
                          value={selectedElementData.color || '#000000'}
                          onChange={(e) => updateElement(selectedElementData.id, { color: e.target.value })}
                          className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>

                      {/* Tamaño de fuente */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Tamaño de fuente</label>
                        <select
                          value={selectedElementData.fontSize || 16}
                          onChange={(e) => updateElement(selectedElementData.id, { fontSize: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          {fontSizes.map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>

                      {/* Alineación Horizontal */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Alineación Horizontal</label>
                        <div className="grid grid-cols-4 gap-1">
                          <button
                            onClick={() => updateElement(selectedElementData.id, { textAlign: 'left' })}
                            className={`p-2 rounded border text-sm ${
                              selectedElementData.textAlign === 'left' 
                                ? 'bg-orange-100 border-orange-300 text-orange-700' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                            title="Izquierda"
                          >
                            <AlignLeft className="h-4 w-4 mx-auto" />
                          </button>
                          <button
                            onClick={() => updateElement(selectedElementData.id, { textAlign: 'center' })}
                            className={`p-2 rounded border text-sm ${
                              selectedElementData.textAlign === 'center' 
                                ? 'bg-orange-100 border-orange-300 text-orange-700' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                            title="Centro"
                          >
                            <AlignCenter className="h-4 w-4 mx-auto" />
                          </button>
                          <button
                            onClick={() => updateElement(selectedElementData.id, { textAlign: 'right' })}
                            className={`p-2 rounded border text-sm ${
                              selectedElementData.textAlign === 'right' 
                                ? 'bg-orange-100 border-orange-300 text-orange-700' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                            title="Derecha"
                          >
                            <AlignRight className="h-4 w-4 mx-auto" />
                          </button>
                          <button
                            onClick={() => updateElement(selectedElementData.id, { textAlign: 'justify' })}
                            className={`p-2 rounded border text-sm ${
                              selectedElementData.textAlign === 'justify' 
                                ? 'bg-orange-100 border-orange-300 text-orange-700' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                            title="Justificado"
                          >
                            <AlignJustify className="h-4 w-4 mx-auto" />
                          </button>
                        </div>
                      </div>

                      {/* Botones de acción para texto */}
                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => duplicateElement(selectedElementData.id)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-xs flex items-center justify-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Duplicar
                        </button>
                        <button
                          onClick={() => deleteElement(selectedElementData.id)}
                          className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-xs flex items-center justify-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Eliminar
                        </button>
                      </div>

                      {/* Botón de Ajustes de Texto */}
                      <div className="border-t border-gray-200 pt-3">
                        <button
                          onClick={() => setShowTextSettings(true)}
                          className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-2 rounded text-xs flex items-center justify-center gap-2 transition-colors border border-orange-300"
                        >
                          <Settings className="h-4 w-4" />
                          Ajustes de Texto
                        </button>
                      </div>

                    </div>
                  )}
                  

                  {/* Image Properties */}
                  {selectedElementData.type === 'image' && (
                    <div className="space-y-3 border-t border-gray-200 pt-3">
                      {selectedElementData.src ? (
                        <>
                          {/* Vista previa de la imagen */}
                          <div className="bg-gray-50 p-3 rounded">
                            <label className="block text-xs font-medium text-gray-700 mb-2">Vista previa</label>
                            <div className="relative">
                              <img
                                src={selectedElementData.src.startsWith('http') || selectedElementData.src.startsWith('/uploads') 
                                  ? selectedElementData.src 
                                  : `/uploads/personalization/${selectedElementData.src}`}
                                alt="Vista previa"
                                className="w-full h-24 object-cover rounded border border-gray-200"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-product.png'
                                }}
                              />
                            </div>
                          </div>

                          {/* Botones de acción para imagen */}
                          {templateSettings.allowUserAddImage && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => triggerImageUpload(selectedElementData.id)}
                                disabled={isUploadingImage}
                                className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-xs flex items-center justify-center gap-1 disabled:opacity-50"
                              >
                                <RefreshCw className="h-3 w-3" />
                                {isUploadingImage ? 'Subiendo...' : 'Reemplazar'}
                              </button>
                            </div>
                          )}

                          {/* Dimensiones de la imagen */}
                          <div className="bg-gray-50 p-3 rounded">
                            <label className="block text-xs font-medium text-gray-700 mb-2">Dimensiones</label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Ancho</label>
                                <input
                                  type="number"
                                  value={Math.round(selectedElementData.width)}
                                  onChange={(e) => {
                                    const newWidth = parseInt(e.target.value) || 100
                                    if (selectedElementData.maintainAspectRatio !== false) {
                                      // Mantener proporción
                                      const aspectRatio = selectedElementData.height / selectedElementData.width
                                      const newHeight = Math.round(newWidth * aspectRatio)
                                      updateElement(selectedElementData.id, { 
                                        width: newWidth, 
                                        height: newHeight 
                                      })
                                    } else {
                                      updateElement(selectedElementData.id, { width: newWidth })
                                    }
                                  }}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                  min="10"
                                  max="500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Altura</label>
                                <input
                                  type="number"
                                  value={Math.round(selectedElementData.height)}
                                  onChange={(e) => {
                                    const newHeight = parseInt(e.target.value) || 100
                                    if (selectedElementData.maintainAspectRatio !== false) {
                                      // Mantener proporción
                                      const aspectRatio = selectedElementData.width / selectedElementData.height
                                      const newWidth = Math.round(newHeight * aspectRatio)
                                      updateElement(selectedElementData.id, { 
                                        width: newWidth, 
                                        height: newHeight 
                                      })
                                    } else {
                                      updateElement(selectedElementData.id, { height: newHeight })
                                    }
                                  }}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                  min="10"
                                  max="500"
                                />
                              </div>
                            </div>
                          </div>

                        </>
                      ) : (
                        /* Sin imagen seleccionada */
                        <div className="text-center py-8">
                          {templateSettings.allowUserAddImage ? (
                            <>
                              <button
                                onClick={() => triggerImageUpload(selectedElementData.id)}
                                disabled={isUploadingImage}
                                className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2 w-full disabled:opacity-50"
                              >
                                <Upload className="h-4 w-4" />
                                {isUploadingImage ? 'Subiendo imagen...' : 'Subir Imagen'}
                              </button>
                              <p className="text-xs text-gray-500 mt-2">
                                Formatos soportados: JPG, PNG, GIF
                              </p>
                            </>
                          ) : (
                            <div className="text-gray-500">
                              <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Carga de imágenes deshabilitada</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Botones de acción para imagen */}
                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => duplicateElement(selectedElementData.id)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-xs flex items-center justify-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Duplicar
                        </button>
                        <button
                          onClick={() => deleteElement(selectedElementData.id)}
                          className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-xs flex items-center justify-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Eliminar
                        </button>
                      </div>

                      {/* Botón de Ajustes de Imagen */}
                      <div className="border-t border-gray-200 pt-3">
                        <button
                          onClick={() => setShowImageSettings(true)}
                          className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-xs flex items-center justify-center gap-2 transition-colors border border-blue-300"
                        >
                          <Settings className="h-4 w-4" />
                          Ajustes Imagen
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Shape Properties - Like User Editor */}
                  {selectedElementData.type === 'shape' && (
                    <div className="space-y-4 border-t border-gray-200 pt-4">
                      
                      {/* SOLUCIÓN RADICAL: Usar componente completamente aislado y estable */}
                      <StableTransparencySection
                        key={`transparency-${selectedElementData.id}`}
                        elementData={selectedElementData}
                        onUpdate={updateElement}
                      />
                      
                      {/* Grosor de borde */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Grosor de borde
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={selectedElementData.strokeWidth || 1}
                            onChange={(e) => {
                              const newStrokeWidth = parseFloat(e.target.value)
                              updateElement(selectedElementData.id, { strokeWidth: newStrokeWidth })
                            }}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium text-gray-700 min-w-[40px]">
                            {selectedElementData.strokeWidth || 1}px
                          </span>
                        </div>
                      </div>
                      
                      {/* Funcionalidad de Máscara */}
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Opciones de Máscara</h4>
                        
                        <div className={`flex items-center justify-between mb-3 p-3 rounded-lg border-2 transition-all ${
                          selectedElementData.useAsFillableShape 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-red-50 border-red-300'
                        }`}>
                          <label className={`text-sm font-medium ${
                            selectedElementData.useAsFillableShape 
                              ? 'text-green-800' 
                              : 'text-red-800'
                          }`}>
                            Habilitar como Máscara
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              selectedElementData.useAsFillableShape 
                                ? 'bg-green-200 text-green-800'
                                : 'bg-red-200 text-red-800'
                            }`}>
                              {selectedElementData.useAsFillableShape ? 'ACTIVO' : 'DESHABILITADO'}
                            </span>
                          </label>
                          <Switch
                            key={`mask-switch-${selectedElementData.id}`}
                            checked={Boolean(selectedElementData.useAsFillableShape)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                // Al habilitar máscara, guardar color actual y hacer transparente
                                updateElement(selectedElementData.id, { 
                                  useAsFillableShape: true,
                                  lastFillColor: selectedElementData.fillColor !== 'transparent' ? selectedElementData.fillColor : '#ff6b35',
                                  fillColor: 'transparent'
                                })
                              } else {
                                // Al deshabilitar máscara, volver al color guardado
                                updateElement(selectedElementData.id, { 
                                  useAsFillableShape: false,
                                  fillColor: selectedElementData.lastFillColor || '#ff6b35'
                                })
                              }
                            }}
                          />
                        </div>
                        
                        {/* Si la máscara está activa, mostrar opciones adicionales */}
                        {selectedElementData.useAsFillableShape && (
                          <div className="bg-blue-50 p-3 rounded border border-blue-200">
                            <p className="text-xs text-blue-800 mb-2">
                              La forma actúa como máscara. Haz clic en el icono de cámara para seleccionar una imagen.
                            </p>
                            <div className="flex items-center gap-2">
                              <Camera className="h-4 w-4 text-blue-600" />
                              <span className="text-xs text-blue-700">
                                Imagen de máscara: {selectedElementData.maskImageSrc ? 'Configurada' : 'Sin configurar'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Controles de imagen de máscara */}
                        {selectedElementData.useAsFillableShape && selectedElementData.maskImageSrc && (
                          <div className="bg-green-50 p-3 rounded border border-green-200 space-y-3">
                            <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center">
                              📍 Posición de Imagen en Máscara
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-green-800 font-medium">Posición X (horizontal)</label>
                                <input
                                  type="number"
                                  value={selectedElementData.maskImageX || 0}
                                  onChange={(e) => {
                                    console.log('🖼️ Updating maskImageX from', selectedElementData.maskImageX, 'to', Number(e.target.value))
                                    console.log('🖼️ Element position before:', { x: selectedElementData.x, y: selectedElementData.y, width: selectedElementData.width, height: selectedElementData.height })
                                    updateElement(selectedElementData.id, { maskImageX: Number(e.target.value) })
                                  }}
                                  className="w-full text-xs border border-green-300 rounded px-2 py-1 focus:border-green-500"
                                  step="5"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-green-800 font-medium">Posición Y (vertical)</label>
                                <input
                                  type="number"
                                  value={selectedElementData.maskImageY || 0}
                                  onChange={(e) => {
                                    console.log('🖼️ Updating maskImageY from', selectedElementData.maskImageY, 'to', Number(e.target.value))
                                    updateElement(selectedElementData.id, { maskImageY: Number(e.target.value) })
                                  }}
                                  className="w-full text-xs border border-green-300 rounded px-2 py-1 focus:border-green-500"
                                  step="5"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs text-green-800 font-medium mb-1">
                                Escala de Imagen: <span className="text-purple-600 font-bold">{((selectedElementData.maskImageScale || 1) * 100).toFixed(0)}%</span>
                              </label>
                              <input
                                type="range"
                                min="0.1"
                                max="3"
                                step="0.1"
                                value={selectedElementData.maskImageScale || 1}
                                onChange={(e) => {
                                  console.log('🖼️ Updating maskImageScale from', selectedElementData.maskImageScale, 'to', parseFloat(e.target.value))
                                  updateElement(selectedElementData.id, { maskImageScale: parseFloat(e.target.value) })
                                }}
                                className="w-full"
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  updateElement(selectedElementData.id, {
                                    maskImageX: 0,
                                    maskImageY: 0
                                  })
                                }}
                                className="flex-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                              >
                                🎯 Centrar Imagen
                              </button>
                              <button
                                onClick={() => {
                                  updateElement(selectedElementData.id, {
                                    maskImageX: 0,
                                    maskImageY: 0,
                                    maskImageScale: 1
                                  })
                                }}
                                className="flex-1 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                              >
                                🔄 Restablecer
                              </button>
                              <button
                                onClick={() => {
                                  updateElement(selectedElementData.id, {
                                    maskImageSrc: null,
                                    maskImageX: 0,
                                    maskImageY: 0,
                                    maskImageScale: 1
                                  })
                                  toast.success('Imagen de máscara eliminada')
                                }}
                                className="flex-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                              >
                                🗑️ Quitar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>


                      {/* Botones de acción */}
                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => {
                            // Centrar elemento en el canvas
                            const centerX = canvasSize.width / 2 - selectedElementData.width / 2
                            const centerY = canvasSize.height / 2 - selectedElementData.height / 2
                            updateElement(selectedElementData.id, { 
                              x: centerX, 
                              y: centerY 
                            })
                            toast.success('Elemento centrado')
                          }}
                          className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-xs flex items-center justify-center gap-1"
                        >
                          <Target className="h-3 w-3" />
                          Centrar
                        </button>
                        <button
                          onClick={() => duplicateElement(selectedElementData.id)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-xs flex items-center justify-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Duplicar
                        </button>
                      </div>

                      {/* Botón de Ajustes de Forma */}
                      <div className="border-t border-gray-200 pt-3">
                        <button
                          onClick={() => setShowShapeSettings(true)}
                          className="w-full bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded text-xs flex items-center justify-center gap-2 transition-colors border border-green-300"
                        >
                          <Settings className="h-4 w-4" />
                          Ajustes de Forma
                        </button>
                      </div>

                    </div>
                  )}


                  {/* Comprehensive Text Settings Panel */}
                  {selectedElementData.type === 'text' && showTextSettings && (
                    <div className="space-y-2">
                      {/* Back Button */}
                      <div className="pb-2 border-b border-gray-200">
                        <button
                          onClick={() => setShowTextSettings(false)}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <ChevronLeft className="h-3 w-3" />
                          Volver a Editor de Texto
                        </button>
                      </div>

                      {/* Ajustes de Texto Header */}
                      <div className="bg-orange-50 p-2 rounded">
                        <h4 className="text-xs font-semibold text-orange-800 flex items-center gap-1">
                          <Settings className="h-3 w-3" />
                          Ajustes Avanzados de Texto
                        </h4>
                      </div>

                      {/* Nombre del elemento */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del elemento</label>
                        <input
                          type="text"
                          value={selectedElementData.name || `Texto ${selectedElementData.id.slice(-4)}`}
                          onChange={(e) => updateElement(selectedElementData.id, { name: e.target.value })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                        />
                      </div>

                      {/* Permisos de usuario - Extended with Zakeke features */}
                      <div className="bg-gray-50 p-2 rounded">
                        <label className="block text-xs font-medium text-gray-700 mb-2">Permitir al usuario:</label>
                        <div className="space-y-1">
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={selectedElementData.canEditText !== false}
                              onChange={(e) => updateElement(selectedElementData.id, { canEditText: e.target.checked })}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                            />
                            Editar texto
                          </label>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={selectedElementData.canChangeFontFamily !== false}
                              onChange={(e) => updateElement(selectedElementData.id, { canChangeFontFamily: e.target.checked })}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                            />
                            Tipo de letra
                          </label>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={selectedElementData.canChangeFontColor !== false}
                              onChange={(e) => updateElement(selectedElementData.id, { canChangeFontColor: e.target.checked })}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                            />
                            Color de fuente
                          </label>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={selectedElementData.canChangeFontStyle !== false}
                              onChange={(e) => updateElement(selectedElementData.id, { canChangeFontStyle: e.target.checked })}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                            />
                            Fuente negrita/cursiva
                          </label>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={selectedElementData.canUseCurvedText !== false}
                              onChange={(e) => updateElement(selectedElementData.id, { canUseCurvedText: e.target.checked })}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                            />
                            Texto curvo
                          </label>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={selectedElementData.canResizeTextBox !== false}
                              onChange={(e) => updateElement(selectedElementData.id, { canResizeTextBox: e.target.checked })}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                            />
                            Cambiar el tamaño del cuadro de texto
                          </label>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={selectedElementData.canMove !== false}
                              onChange={(e) => updateElement(selectedElementData.id, { canMove: e.target.checked })}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                            />
                            Mover
                          </label>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={selectedElementData.canRotate !== false}
                              onChange={(e) => updateElement(selectedElementData.id, { canRotate: e.target.checked })}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                            />
                            Girar
                          </label>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={selectedElementData.canResize !== false}
                              onChange={(e) => updateElement(selectedElementData.id, { canResize: e.target.checked })}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                            />
                            Redimensionar
                          </label>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={selectedElementData.canDelete !== false}
                              onChange={(e) => updateElement(selectedElementData.id, { canDelete: e.target.checked })}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                            />
                            Borrar
                          </label>
                        </div>
                      </div>

                      {/* Configuración obligatoria - with spacing */}
                      <div className="space-y-1">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.mandatoryToEdit || false}
                            onChange={(e) => updateElement(selectedElementData.id, { mandatoryToEdit: e.target.checked })}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                          />
                          Obligatorio editar
                        </label>
                      </div>

                      {/* Layer positioning - with exclusive logic and proper spacing */}
                      <div className="mt-3 space-y-1 bg-blue-50 p-2 rounded">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.alwaysOnTop || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateElement(selectedElementData.id, { 
                                  alwaysOnTop: true, 
                                  alwaysOnBottom: false 
                                })
                              } else {
                                updateElement(selectedElementData.id, { alwaysOnTop: false })
                              }
                            }}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                          />
                          Siempre en capa superior
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.alwaysOnBottom || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateElement(selectedElementData.id, { 
                                  alwaysOnBottom: true, 
                                  alwaysOnTop: false 
                                })
                              } else {
                                updateElement(selectedElementData.id, { alwaysOnBottom: false })
                              }
                            }}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                          />
                          Siempre en capa inferior
                        </label>
                      </div>

                      {/* Permitir cambiar alineación - with spacing */}
                      <div className="mt-3">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.canChangeFontAlignment !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { canChangeFontAlignment: e.target.checked })}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                          />
                          Permitir cambiar alineación de la fuente
                        </label>
                      </div>

                      {/* Tamaño de fuente con límites */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Tamaño de fuente (Min/Actual/Max)</label>
                        <div className="grid grid-cols-3 gap-1">
                          <input
                            type="number"
                            placeholder="Min"
                            value={selectedElementData.minFontSize || 8}
                            onChange={(e) => updateElement(selectedElementData.id, { minFontSize: parseInt(e.target.value) || 8 })}
                            className="px-1 py-1 text-xs border border-gray-300 rounded text-center"
                          />
                          <input
                            type="number"
                            value={selectedElementData.fontSize || 16}
                            onChange={(e) => updateElement(selectedElementData.id, { fontSize: parseInt(e.target.value) || 16 })}
                            className="px-1 py-1 text-xs border border-gray-300 rounded text-center"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={selectedElementData.maxFontSize || 200}
                            onChange={(e) => updateElement(selectedElementData.id, { maxFontSize: parseInt(e.target.value) || 200 })}
                            className="px-1 py-1 text-xs border border-gray-300 rounded text-center"
                          />
                        </div>
                      </div>

                      {/* Alineación vertical */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Alineación vertical</label>
                        <select
                          value={selectedElementData.verticalAlign || 'middle'}
                          onChange={(e) => updateElement(selectedElementData.id, { verticalAlign: e.target.value })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="top">Arriba</option>
                          <option value="middle">Medio</option>
                          <option value="bottom">Abajo</option>
                        </select>
                      </div>

                      {/* Espaciado entre letras */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Espaciado entre letras (Min/Actual/Max)</label>
                        <div className="grid grid-cols-3 gap-1">
                          <input
                            type="number"
                            placeholder="Min"
                            value={selectedElementData.minLetterSpacing || -5}
                            onChange={(e) => updateElement(selectedElementData.id, { minLetterSpacing: parseInt(e.target.value) || -5 })}
                            className="px-1 py-1 text-xs border border-gray-300 rounded text-center"
                          />
                          <input
                            type="number"
                            value={selectedElementData.letterSpacing || 0}
                            onChange={(e) => updateElement(selectedElementData.id, { letterSpacing: parseInt(e.target.value) || 0 })}
                            className="px-1 py-1 text-xs border border-gray-300 rounded text-center"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={selectedElementData.maxLetterSpacing || 20}
                            onChange={(e) => updateElement(selectedElementData.id, { maxLetterSpacing: parseInt(e.target.value) || 20 })}
                            className="px-1 py-1 text-xs border border-gray-300 rounded text-center"
                          />
                        </div>
                      </div>

                      {/* Espaciado entre líneas */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Espaciado entre líneas (Min/Actual/Max)</label>
                        <div className="grid grid-cols-3 gap-1">
                          <input
                            type="number"
                            placeholder="Min"
                            value={selectedElementData.minLineSpacing || 0.5}
                            step="0.1"
                            onChange={(e) => updateElement(selectedElementData.id, { minLineSpacing: parseFloat(e.target.value) || 0.5 })}
                            className="px-1 py-1 text-xs border border-gray-300 rounded text-center"
                          />
                          <input
                            type="number"
                            value={selectedElementData.lineSpacing || 1.2}
                            step="0.1"
                            onChange={(e) => updateElement(selectedElementData.id, { lineSpacing: parseFloat(e.target.value) || 1.2 })}
                            className="px-1 py-1 text-xs border border-gray-300 rounded text-center"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={selectedElementData.maxLineSpacing || 3}
                            step="0.1"
                            onChange={(e) => updateElement(selectedElementData.id, { maxLineSpacing: parseFloat(e.target.value) || 3 })}
                            className="px-1 py-1 text-xs border border-gray-300 rounded text-center"
                          />
                        </div>
                      </div>

                      {/* Configuraciones adicionales */}
                      <div className="space-y-1">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.autoUppercase || false}
                            onChange={(e) => updateElement(selectedElementData.id, { autoUppercase: e.target.checked })}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                          />
                          Mayúsculas automáticas
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.printable !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { printable: e.target.checked })}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                          />
                          Imprimible
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElementData.includeInThumbnail !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { includeInThumbnail: e.target.checked })}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                          />
                          Incluir en miniatura
                        </label>
                      </div>

                      {/* Información del elemento */}
                      <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 space-y-1">
                        <div>Caracteres: {selectedElementData.text?.length || 0}</div>
                        <div>Familia: {selectedElementData.fontFamily || 'Arial'}</div>
                        <div>Tamaño: {selectedElementData.fontSize || 16}px</div>
                        {selectedElementData.width && selectedElementData.height && (
                          <div className="text-gray-500">Medidas: {pixelsToCm(selectedElementData.width, true)}×{pixelsToCm(selectedElementData.height, false)}cm</div>
                        )}
                        {selectedElementData.width && selectedElementData.height && (
                          <div className="text-blue-600">Píxeles: {Math.round(selectedElementData.width)}×{Math.round(selectedElementData.height)}px</div>
                        )}
                        {selectedElementData.width && selectedElementData.height && (() => {
                          const currentArea = getCurrentPrintArea()
                          if (!currentArea) return null
                          const pixelsPerCmWidth = currentArea.realWidth ? currentArea.width / currentArea.realWidth : 11.81
                          const pixelsPerCmHeight = currentArea.realHeight ? currentArea.height / currentArea.realHeight : 11.81
                          return (
                            <div className="text-blue-600">
                              Debug: Área {Math.round(currentArea.width)}×{Math.round(currentArea.height)}px | Real {currentArea.realWidth}×{currentArea.realHeight}cm | Factor {pixelsPerCmWidth.toFixed(2)}×{pixelsPerCmHeight.toFixed(2)}
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )}

                </div>
              )}
              </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Template Settings Panel */}
      {showTemplateSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-semibold text-gray-900">Ajustes de Plantilla</h2>
              </div>
              <button
                onClick={() => setShowTemplateSettings(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Información básica</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la plantilla
                  </label>
                  <input
                    type="text"
                    value={templateSettings.name}
                    onChange={(e) => setTemplateSettings(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tags className="h-4 w-4 inline mr-1" />
                    Categoría
                  </label>
                  <select
                    value={templateSettings.category}
                    onChange={(e) => setTemplateSettings(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Ropa">Ropa</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Geométricas">Geométricas</option>
                    <option value="Decorativas">Decorativas</option>
                    <option value="Letras">Letras</option>
                    <option value="Marcos">Marcos</option>
                    <option value="Naturaleza">Naturaleza</option>
                  </select>
                </div>
              </div>

              {/* Configuración de sincronización */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Configuración de elementos</h3>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="sync-elements"
                    checked={templateSettings.syncElementsAllSides}
                    onChange={(e) => setTemplateSettings(prev => ({ ...prev, syncElementsAllSides: e.target.checked }))}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="sync-elements" className="text-sm text-gray-700">
                    Sincronizar elementos en todos los lados del producto
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aplicar ajustes a:
                  </label>
                  <select
                    value={templateSettings.applySettingsTo}
                    onChange={(e) => setTemplateSettings(prev => ({ ...prev, applySettingsTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">Todo el Producto</option>
                    <option value="current">Cada lado</option>
                  </select>
                </div>
              </div>

              {/* Configuración de galería */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Galería de imágenes</h3>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="disable-gallery"
                    checked={templateSettings.disableSellerImageGallery}
                    onChange={(e) => setTemplateSettings(prev => ({ ...prev, disableSellerImageGallery: e.target.checked }))}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="disable-gallery" className="text-sm text-gray-700">
                    Deshabilitar Galería de imágenes del vendedor
                  </label>
                </div>
              </div>

              {/* Configuración de imágenes del usuario */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Configuración de imágenes del usuario</h3>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="allow-user-images"
                    checked={templateSettings.allowUserAddImage}
                    onChange={(e) => setTemplateSettings(prev => ({ ...prev, allowUserAddImage: e.target.checked }))}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="allow-user-images" className="text-sm text-gray-700">
                    El usuario puede agregar una imagen
                  </label>
                </div>

                {templateSettings.allowUserAddImage && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número máximo de imágenes
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={templateSettings.maxImages}
                        onChange={(e) => setTemplateSettings(prev => ({ ...prev, maxImages: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Opciones de carga de imágenes (comprobar para permitir)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries({
                          jpg: 'JPG',
                          png: 'PNG',
                          svg: 'SVG',
                          pdf: 'PDF',
                          withRasters: 'Con las tramas',
                          eps: 'EPS',
                          ai: 'AI'
                        }).map(([key, label]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`format-${key}`}
                              checked={templateSettings.allowedImageFormats[key as keyof typeof templateSettings.allowedImageFormats]}
                              onChange={(e) => setTemplateSettings(prev => ({
                                ...prev,
                                allowedImageFormats: {
                                  ...prev.allowedImageFormats,
                                  [key]: e.target.checked
                                }
                              }))}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <label htmlFor={`format-${key}`} className="text-sm text-gray-700">
                              {label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Configuración de texto del usuario */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Configuración de texto del usuario</h3>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="allow-user-text"
                    checked={templateSettings.allowUserAddText}
                    onChange={(e) => setTemplateSettings(prev => ({ ...prev, allowUserAddText: e.target.checked }))}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="allow-user-text" className="text-sm text-gray-700">
                    El usuario puede agregar texto
                  </label>
                </div>

                {templateSettings.allowUserAddText && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad máxima de textos
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={templateSettings.maxTexts}
                      onChange={(e) => setTemplateSettings(prev => ({ ...prev, maxTexts: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowTemplateSettings(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Aquí se aplicarían los ajustes
                  setShowTemplateSettings(false)
                }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                Aplicar Ajustes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Library Modal */}
      <ImageLibrary
        isOpen={showImageLibrary}
        onClose={() => setShowImageLibrary(false)}
        onSelectImage={addImageFromLibrary}
        productId={productId}
        allowUpload={false}
      />
      
      {/* Shapes Library Modal */}
      <ShapesLibrary
        isOpen={showShapesLibrary}
        onClose={() => setShowShapesLibrary(false)}
        onSelectShape={addShapeToTemplate}
      />

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}