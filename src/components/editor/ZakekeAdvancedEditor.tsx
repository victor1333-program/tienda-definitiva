"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { toast } from "react-hot-toast"
import useSWR from "swr"
import fetcher from "@/lib/fetcher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { 
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
  Shapes,
  Check,
  X,
  Camera,
  Star,
  Heart,
  Hexagon,
  Pentagon,
  FileText,
  GripVertical
} from "lucide-react"

import {
  STANDARD_CANVAS_SIZE,
  relativeToAbsolute,
  absoluteToRelative,
  scaleImageToCanvas,
  calculatePrintAreaOnScaledImage,
  type RelativeCoordinates,
  type AbsoluteCoordinates
} from "@/lib/canvas-utils"

import ImageLibrary from "./ImageLibrary"
import ShapesLibrary from "./ShapesLibrary"

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
  image2D?: string
  printAreas: PrintArea[]
  variantSideImages?: Array<{
    id: string
    variantId: string
    sideId: string
    imageUrl: string
  }>
}

interface ProductVariant {
  id: string
  sku: string
  size: string
  colorName: string
  colorHex: string
  stock: number
  price: number
  width: number
  height: number
}

interface ZakekeAdvancedEditorProps {
  productId: string
  sides: ProductSide[]
  variants?: ProductVariant[]
  templateId?: string | null
  onSave: (designData: any) => void
  onDownloadPDF?: () => void
  initialDesign?: any
  isReadOnly?: boolean
  allowPersonalization?: boolean
}

interface CanvasState {
  objects: any[]
  zoom: number
  viewportTransform: number[]
}

console.log('🚀 ZAKEKE ADVANCED EDITOR CARGADO - VERSIÓN CON CORRECCIONES DE MODO VISUAL')
console.log('Timestamp:', new Date().toISOString())

export default function ZakekeAdvancedEditor({ 
  productId, 
  sides, 
  variants = [],
  templateId,
  onSave, 
  onDownloadPDF,
  initialDesign,
  isReadOnly = false,
  allowPersonalization = true 
}: ZakekeAdvancedEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<any>(null)
  const [fabricLoaded, setFabricLoaded] = useState(false)
  
  // Estado para variante seleccionada
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.length > 0 ? variants[0] : null
  )

  // Estado para plantillas
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [availableTemplates, setAvailableTemplates] = useState<{
    hasDefaultTemplate: boolean
    defaultTemplates: any[]
    optionalTemplates: any[]
  } | null>(null)

  // Función para obtener la imagen del lado según la variante seleccionada
  const getSideImageForVariant = (side: ProductSide, variant: ProductVariant | null) => {
    if (!variant || !side.variantSideImages) {
      return side.image2D
    }

    const variantImage = side.variantSideImages.find(
      vsi => vsi.variantId === variant.id && vsi.sideId === side.id
    )

    return variantImage?.imageUrl || side.image2D
  }

  // Formas organizadas por categorías
  const shapesByCategory = {
    all: [
      { id: 'rect', name: 'Rectángulo', icon: '⬜', category: 'geometricas' },
      { id: 'circle', name: 'Círculo', icon: '🔵', category: 'geometricas' },
      { id: 'triangle', name: 'Triángulo', icon: '🔺', category: 'geometricas' },
      { id: 'diamond', name: 'Diamante', icon: '🔷', category: 'geometricas' },
      { id: 'star', name: 'Estrella', icon: '⭐', category: 'decorativas' },
      { id: 'heart', name: 'Corazón', icon: '❤️', category: 'decorativas' },
      { id: 'flower', name: 'Flor', icon: '🌸', category: 'decorativas' },
      { id: 'arrow', name: 'Flecha', icon: '➡️', category: 'decorativas' },
      { id: 'frame-circle', name: 'Marco Circular', icon: '⭕', category: 'marcos' },
      { id: 'frame-rect', name: 'Marco Rectangular', icon: '🔲', category: 'marcos' },
      { id: 'leaf', name: 'Hoja', icon: '🍃', category: 'naturaleza' },
      { id: 'tree', name: 'Árbol', icon: '🌳', category: 'naturaleza' }
    ],
    geometricas: [
      { id: 'rect', name: 'Rectángulo', icon: '⬜' },
      { id: 'circle', name: 'Círculo', icon: '🔵' },
      { id: 'triangle', name: 'Triángulo', icon: '🔺' },
      { id: 'diamond', name: 'Diamante', icon: '🔷' },
      { id: 'pentagon', name: 'Pentágono', icon: '⬟' },
      { id: 'hexagon', name: 'Hexágono', icon: '⬢' }
    ],
    decorativas: [
      { id: 'star', name: 'Estrella', icon: '⭐' },
      { id: 'heart', name: 'Corazón', icon: '❤️' },
      { id: 'flower', name: 'Flor', icon: '🌸' },
      { id: 'arrow', name: 'Flecha', icon: '➡️' },
      { id: 'crown', name: 'Corona', icon: '👑' },
      { id: 'butterfly', name: 'Mariposa', icon: '🦋' }
    ],
    letras: [
      { id: 'letter-a', name: 'Letra A', icon: '🅰️' },
      { id: 'letter-b', name: 'Letra B', icon: '🅱️' },
      { id: 'ampersand', name: 'Ampersand', icon: '&' },
      { id: 'at-symbol', name: 'Arroba', icon: '@' }
    ],
    marcos: [
      { id: 'frame-circle', name: 'Marco Circular', icon: '⭕' },
      { id: 'frame-rect', name: 'Marco Rectangular', icon: '🔲' },
      { id: 'frame-ornate', name: 'Marco Ornamentado', icon: '🖼️' },
      { id: 'frame-vintage', name: 'Marco Vintage', icon: '🎨' }
    ],
    naturaleza: [
      { id: 'leaf', name: 'Hoja', icon: '🍃' },
      { id: 'tree', name: 'Árbol', icon: '🌳' },
      { id: 'flower-sun', name: 'Girasol', icon: '🌻' },
      { id: 'mountain', name: 'Montaña', icon: '⛰️' }
    ]
  }
  const [activeSide, setActiveSide] = useState<ProductSide | null>(null)
  const [activePrintArea, setActivePrintArea] = useState<PrintArea | null>(null)
  const [selectedObject, setSelectedObject] = useState<any>(null)
  const [canvasHistory, setCanvasHistory] = useState<CanvasState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [zoom, setZoom] = useState(100)
  
  // Tool states
  const [activePanel, setActivePanel] = useState("design")
  const [canvasElements, setCanvasElements] = useState<any[]>([])
  const [textContent, setTextContent] = useState("Texto nuevo")
  const [textColor, setTextColor] = useState("#000000")
  const [fontSize, setFontSize] = useState(24)
  const [fontFamily, setFontFamily] = useState("Arial")
  const [fontWeight, setFontWeight] = useState("normal")
  const [fontStyle, setFontStyle] = useState("normal")
  
  // Shape states
  const [shapeColor, setShapeColor] = useState("#ff6b35")
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [strokeWidth, setStrokeWidth] = useState(1)
  
  // Image states
  const [imageWidth, setImageWidth] = useState(200)
  const [imageHeight, setImageHeight] = useState(200)
  const [showImageLibrary, setShowImageLibrary] = useState(false)
  
  // Shapes states
  const [showShapesLibrary, setShowShapesLibrary] = useState(false)
  const [selectedShapeCategory, setSelectedShapeCategory] = useState("all")
  const [shapeSearchTerm, setShapeSearchTerm] = useState("")
  
  // Element editing states
  const [editingElementId, setEditingElementId] = useState<string | null>(null)
  
  // Mask image movement states
  const [imageMovementMode, setImageMovementMode] = useState(false)
  const [lastMousePos, setLastMousePos] = useState<{x: number, y: number} | null>(null)
  const [tempElementName, setTempElementName] = useState("")
  
  // Drag & Drop states for layer reordering
  const [draggedElementIndex, setDraggedElementIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  
  // Object properties
  const [objectOpacity, setObjectOpacity] = useState(100)

  // Template settings from loaded template
  const [templateSettings, setTemplateSettings] = useState({
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
      ai: false
    },
    allowUserAddText: true,
    maxTexts: 5
  })

  // Check if product has linked content for images
  const { data: linkedContentData } = useSWR(
    `/api/products/${productId}/personalization-linked-content`,
    fetcher,
    { revalidateOnFocus: false }
  )

  const hasLinkedImages = linkedContentData?.hasLinkedContent || false
  const [objectRotation, setObjectRotation] = useState(0)
  
  // UI states
  const [showGrid, setShowGrid] = useState(true)
  const [currentSide, setCurrentSide] = useState<ProductSide | null>(null)
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  
  // Snap states
  const [isDragging, setIsDragging] = useState(false)
  const [snapActive, setSnapActive] = useState({ x: false, y: false })
  const isSnapping = useRef(false)
  const snapCooldown = useRef(0)
  
  // Initialize first side
  useEffect(() => {
    if (sides.length > 0 && !currentSide) {
      setCurrentSide(sides[0])
      setActiveSide(sides[0])
      if (sides[0].printAreas.length > 0) {
        setActivePrintArea(sides[0].printAreas[0])
      }
    }
  }, [sides, currentSide])

  // Conversion functions: pixels to centimeters (igual que en TemplateEditor)
  const pixelsToCm = (pixels: number, isWidth: boolean = true) => {
    if (!activePrintArea) return pixels
    
    // Conversión estándar para impresión: 300 DPI = 11.81 pixels por cm
    const PIXELS_PER_CM = 11.81
    
    // Si el área tiene dimensiones reales configuradas, usar esas para mayor precisión
    let pixelsPerCm = PIXELS_PER_CM
    
    // Si el área tiene medidas reales configuradas, usar conversiones separadas para width y height
    if (activePrintArea.realWidth && activePrintArea.realHeight) {
      if (isWidth) {
        pixelsPerCm = activePrintArea.width / activePrintArea.realWidth
      } else {
        pixelsPerCm = activePrintArea.height / activePrintArea.realHeight
      }
    }
    
    return Number((pixels / pixelsPerCm).toFixed(1))
  }

  const cmToPixels = (cm: number, isWidth: boolean = true) => {
    if (!activePrintArea) return cm
    
    // Conversión estándar para impresión: 300 DPI = 11.81 pixels por cm
    const PIXELS_PER_CM = 11.81
    
    // Si el área tiene dimensiones reales configuradas, usar esas para mayor precisión
    let pixelsPerCm = PIXELS_PER_CM
    
    // Si el área tiene medidas reales configuradas, usar conversiones separadas para width y height
    if (activePrintArea.realWidth && activePrintArea.realHeight) {
      if (isWidth) {
        pixelsPerCm = activePrintArea.width / activePrintArea.realWidth
      } else {
        pixelsPerCm = activePrintArea.height / activePrintArea.realHeight
      }
    }
    
    return Math.round(cm * pixelsPerCm)
  }

  // Función para calcular snap a las guías de centrado (centro del canvas/panel)
  const snapToCenter = (x: number, y: number, elementWidth: number, elementHeight: number) => {
    if (!canvas) return { x, y, isSnappingX: false, isSnappingY: false }
    
    // Usar el centro del canvas completo
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
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

  // Handle element name editing
  const startEditingElementName = (elementId: string, currentName: string) => {
    setEditingElementId(elementId)
    setTempElementName(currentName)
  }

  const saveElementName = (elementId: string) => {
    if (!canvas) return
    
    // Find the object in canvas and update its text if it's a text element
    const objects = canvas.getObjects()
    const targetObject = objects.find((obj: any) => 
      obj.id === elementId || `element-${objects.indexOf(obj)}-${obj.text?.substring(0, 5)}` === elementId
    )
    
    if (targetObject && (targetObject.type === 'text' || targetObject.type === 'i-text')) {
      targetObject.set('text', tempElementName)
      canvas.renderAll()
      updateCanvasElements()
    }
    
    setEditingElementId(null)
    setTempElementName("")
  }

  const cancelEditingElementName = () => {
    setEditingElementId(null)
    setTempElementName("")
  }

  // Update canvas elements list
  const updateCanvasElements = () => {
    if (!canvas) return
    
    // Filter objects to show in the design panel
    const objects = canvas.getObjects().filter((obj: any) => {
      // Exclude background images and print area indicators
      if (obj.isBackground || obj.id?.startsWith('print-area-')) return false
      
      // Exclude objects specifically marked as excludeFromExport
      if (obj.excludeFromExport === true) return false
      
      // Include all other user-added elements
      return obj.selectable !== false
    })
    
    const elements = objects.map((obj: any, index: number) => ({
      id: obj.id || `element-${index}-${Date.now()}`,
      name: obj.type === 'i-text' || obj.type === 'text' 
        ? (obj.text?.substring(0, 20) + (obj.text?.length > 20 ? '...' : '') || 'Texto')
        : obj.type === 'image' 
        ? (obj.customName || 'Imagen')
        : obj.customName || (obj.type === 'rect'
        ? 'Rectángulo'
        : obj.type === 'circle' 
        ? 'Círculo'
        : obj.type === 'triangle'
        ? 'Triángulo'
        : obj.type === 'path'
        ? 'Forma SVG'
        : 'Elemento'),
      type: obj.type,
      width: Math.round(obj.width * (obj.scaleX || 1)),
      height: Math.round(obj.height * (obj.scaleY || 1)),
      visible: obj.visible !== false,
      locked: obj.selectable === false,
      zIndex: index,
      object: obj
    }))
    
    // Sort by z-index (reverse to show top elements first)
    elements.reverse()
    
    console.log('Canvas elements updated:', elements.length, elements)
    setCanvasElements(elements)
  }


  // Direct action functions
  const handleDirectTextAdd = () => {
    if (!backgroundLoaded) {
      toast.error('Espera a que se cargue el editor...')
      return
    }
    
    // Verificar límite de textos
    const currentTextCount = canvasElements.filter(el => el.type === 'text' || el.type === 'i-text').length
    if (currentTextCount >= templateSettings.maxTexts) {
      toast.error(`No se pueden agregar más textos. Límite máximo: ${templateSettings.maxTexts}`)
      return
    }
    
    addText()
    // No establecer activePanel aquí - el objeto se seleccionará y setActivePanel('') se llamará automáticamente
  }

  const handleDirectImageUpload = () => {
    if (!backgroundLoaded) {
      toast.error('Espera a que se cargue el editor...')
      return
    }
    
    // Verificar límite de imágenes
    const currentImageCount = canvasElements.filter(el => el.type === 'image').length
    if (currentImageCount >= templateSettings.maxImages) {
      toast.error(`No se pueden agregar más imágenes. Límite máximo: ${templateSettings.maxImages}`)
      return
    }
    
    const input = document.createElement('input')
    input.type = 'file'
    // Configurar accept dinámicamente basado en formatos permitidos
    const allowedFormats = Object.entries(templateSettings.allowedImageFormats)
      .filter(([_, allowed]) => allowed)
      .map(([format, _]) => {
        if (format === 'jpg') return '.jpg,.jpeg'
        return `.${format}`
      })
      .join(',')
    input.accept = allowedFormats || 'image/*'
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files[0]) {
        addImage({ target } as any)
        // No establecer activePanel aquí - el objeto se seleccionará y setActivePanel('') se llamará automáticamente
      }
    }
    input.click()
  }

  const selectElement = (element: any) => {
    if (canvas && element.object) {
      canvas.setActiveObject(element.object)
      setSelectedObject(element.object)
      updateObjectProperties(element.object)
      canvas.renderAll()
      // Resetear activePanel para mostrar propiedades en lugar de elementos del diseño
      setActivePanel('')
    }
  }

  // Helper function para remover objetos del canvas de forma segura
  const safeCanvasRemove = (canvasInstance: any, object: any) => {
    if (!canvasInstance || !object || canvasInstance._isDisposed) return false
    
    try {
      // Verificar que el objeto aún esté en el canvas
      if (canvasInstance.getObjects().includes(object)) {
        // Si el objeto tiene un icono de máscara, eliminarlo primero
        if (object.maskPlaceholderId) {
          const placeholderId = object.maskPlaceholderId
          const objectsToRemove = canvasInstance.getObjects().filter((o: any) => 
            o.id && o.id.startsWith(placeholderId)
          )
          
          objectsToRemove.forEach((placeholder: any) => {
            try {
              canvasInstance.remove(placeholder)
            } catch (e) {
              console.warn('Error removing placeholder:', e)
            }
          })
          
          object.maskPlaceholderId = null
        }
        
        // Deseleccionar el objeto si está seleccionado
        if (canvasInstance.getActiveObject() === object) {
          canvasInstance.discardActiveObject()
        }
        canvasInstance.remove(object)
        // Use requestAnimationFrame to avoid DOM timing issues
        requestAnimationFrame(() => {
          if (!canvasInstance._isDisposed) {
            canvasInstance.renderAll()
          }
        })
        return true
      }
    } catch (error) {
      console.warn('Error removing object from canvas:', error)
    }
    return false
  }

  const deleteElement = (element: any) => {
    if (canvas && element.object) {
      safeCanvasRemove(canvas, element.object)
    }
  }

  // Load Fabric.js with retry logic
  useEffect(() => {
    const loadFabric = async () => {
      if (typeof window !== 'undefined' && !fabric) {
        try {
          console.log('🔄 Loading Fabric.js...')
          const fabricModule = await import('fabric')
          fabric = fabricModule.fabric
          console.log('✅ Fabric.js loaded successfully')
          setFabricLoaded(true)
        } catch (error) {
          console.error('❌ Error loading Fabric.js:', error)
          
          // Retry once after a short delay
          setTimeout(async () => {
            try {
              console.log('🔄 Retrying Fabric.js load...')
              const fabricModule = await import('fabric')
              fabric = fabricModule.fabric
              console.log('✅ Fabric.js loaded successfully on retry')
              setFabricLoaded(true)
            } catch (retryError) {
              console.error('❌ Retry failed for Fabric.js:', retryError)
              toast.error('Error cargando el editor visual. Por favor recarga la página.')
            }
          }, 2000)
        }
      } else if (fabric) {
        setFabricLoaded(true)
      }
    }
    
    loadFabric()
  }, [])

  // Cargar lado cuando cambie el lado activo
  useEffect(() => {
    if (canvas && activeSide) {
      loadSideBackground(canvas, activeSide)
    }
  }, [canvas, activeSide])

  // Initialize canvas elements when canvas is ready and periodically update
  useEffect(() => {
    if (canvas) {
      updateCanvasElements()
      
      // Set up periodic updates to ensure sync
      const interval = setInterval(() => {
        updateCanvasElements()
      }, 2000)
      
      return () => clearInterval(interval)
    }
  }, [canvas])

  // Monitor imageMovementMode changes
  useEffect(() => {
    console.log('🔴 CAMBIO EN IMAGE MOVEMENT MODE:', imageMovementMode)
  }, [imageMovementMode])

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !fabricLoaded || !fabric || canvas) return

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      imageSmoothingEnabled: true,
      allowTouchScrolling: false,
      selection: !isReadOnly,
      interactive: !isReadOnly,
    })

    // Configure object defaults
    fabric.Object.prototype.transparentCorners = false
    fabric.Object.prototype.cornerColor = '#ff6b35'
    fabric.Object.prototype.cornerStyle = 'circle'
    fabric.Object.prototype.cornerSize = 8
    fabric.Object.prototype.borderColor = '#ff6b35'
    fabric.Object.prototype.borderScaleFactor = 2

    // Setup events
    setupCanvasEvents(fabricCanvas)
    
    setCanvas(fabricCanvas)

    // Load initial design if provided
    if (initialDesign) {
      loadDesign(fabricCanvas, initialDesign)
    }

    // Set first side as active
    if (sides.length > 0) {
      setActiveSide(sides[0])
      loadSideBackground(fabricCanvas, sides[0])
    }

    return () => {
      if (fabricCanvas && !fabricCanvas._isDisposed) {
        try {
          fabricCanvas.dispose()
        } catch (error) {
          console.warn('Error disposing canvas:', error)
        }
      }
    }
  }, [fabricLoaded, isReadOnly])

  // Helper function to get area coordinates
  const getAreaCoordinates = (fabricCanvas: any, printArea: PrintArea): AbsoluteCoordinates | null => {
    if (!fabricCanvas || !backgroundLoaded) return null
    const backgroundImage = fabricCanvas.backgroundImage
    if (!backgroundImage) return null
    
    // Calcular coordenadas absolutas del área en el canvas
    let areaCoords: AbsoluteCoordinates
    
    if (printArea.isRelativeCoordinates) {
      // Coordenadas relativas - calcular posición en imagen escalada
      const relativeCoords: RelativeCoordinates = {
        x: printArea.x,
        y: printArea.y,
        width: printArea.width,
        height: printArea.height
      }
      
      // Obtener transformación de la imagen de fondo
      const imageTransform = {
        left: backgroundImage.left,
        top: backgroundImage.top,
        width: backgroundImage.width * backgroundImage.scaleX,
        height: backgroundImage.height * backgroundImage.scaleY,
        scaleX: backgroundImage.scaleX,
        scaleY: backgroundImage.scaleY
      }
      
      areaCoords = calculatePrintAreaOnScaledImage(
        relativeCoords,
        imageTransform,
        STANDARD_CANVAS_SIZE
      )
    } else {
      // Coordenadas absolutas legacy
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
        left: backgroundImage.left,
        top: backgroundImage.top,
        width: backgroundImage.width * backgroundImage.scaleX,
        height: backgroundImage.height * backgroundImage.scaleY,
        scaleX: backgroundImage.scaleX,
        scaleY: backgroundImage.scaleY
      }
      
      areaCoords = calculatePrintAreaOnScaledImage(
        relativeCoords,
        imageTransform,
        STANDARD_CANVAS_SIZE
      )
    }
    
    return areaCoords
  }

  // Función para aplicar restricciones de área a un objeto
  const enforceAreaConstraints = (obj: any) => {
    if (!canvas || !obj) return
    
    // No restringir elementos del área visual (que son solo indicadores)
    if (obj.id && obj.id.startsWith('print-area-')) {
      return
    }
    
    // No restringir elementos marcados como excludeFromExport
    if (obj.excludeFromExport) {
      return
    }
    
    // Buscar cualquier área de impresión disponible para aplicar restricciones
    const availableAreas = activeSide?.printAreas || []
    const areaToUse = activePrintArea || (availableAreas.length > 0 ? availableAreas[0] : null)
    
    if (!areaToUse) return
    
    // Obtener coordenadas del área usando la función helper
    const areaCoords = getAreaCoordinates(canvas, areaToUse)
    if (!areaCoords) return
    
    // Calcular los límites efectivos del objeto
    const objBounds = obj.getBoundingRect()
    
    // Límites del área de impresión
    const areaLeft = areaCoords.x
    const areaTop = areaCoords.y
    const areaRight = areaCoords.x + areaCoords.width
    const areaBottom = areaCoords.y + areaCoords.height
    
    // Calcular nueva posición restringida de forma simple
    let newLeft = obj.left
    let newTop = obj.top
    
    // Restringir horizontalmente
    if (objBounds.left < areaLeft) {
      newLeft = obj.left + (areaLeft - objBounds.left)
    } else if (objBounds.left + objBounds.width > areaRight) {
      newLeft = obj.left - (objBounds.left + objBounds.width - areaRight)
    }
    
    // Restringir verticalmente
    if (objBounds.top < areaTop) {
      newTop = obj.top + (areaTop - objBounds.top)
    } else if (objBounds.top + objBounds.height > areaBottom) {
      newTop = obj.top - (objBounds.top + objBounds.height - areaBottom)
    }
    
    // Solo aplicar restricciones si es necesario
    if (newLeft !== obj.left || newTop !== obj.top) {
      obj.set({
        left: newLeft,
        top: newTop
      })
      obj.setCoords()
      // No renderizar aquí para evitar múltiples renders
    }
  }

  // Funciones para guías de centrado
  const showCenteringGuides = (fabricCanvas: any, obj: any, areaCoords: AbsoluteCoordinates) => {
    const tolerance = 5 // Tolerancia en píxeles para considerar "centrado"
    
    // Calcular centros
    const objBounds = obj.getBoundingRect()
    const objCenterX = objBounds.left + objBounds.width / 2
    const objCenterY = objBounds.top + objBounds.height / 2
    
    const areaCenterX = areaCoords.x + areaCoords.width / 2
    const areaCenterY = areaCoords.y + areaCoords.height / 2
    
    // Limpiar guías existentes
    clearCenteringGuides(fabricCanvas)
    
    // Mostrar guía vertical si está centrado horizontalmente
    if (Math.abs(objCenterX - areaCenterX) < tolerance) {
      const verticalGuide = new fabric.Line([areaCenterX, areaCoords.y, areaCenterX, areaCoords.y + areaCoords.height], {
        stroke: '#00FF00',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        excludeFromExport: true,
        id: 'centering-guide-vertical'
      })
      fabricCanvas.add(verticalGuide)
    }
    
    // Mostrar guía horizontal si está centrado verticalmente
    if (Math.abs(objCenterY - areaCenterY) < tolerance) {
      const horizontalGuide = new fabric.Line([areaCoords.x, areaCenterY, areaCoords.x + areaCoords.width, areaCenterY], {
        stroke: '#00FF00',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        excludeFromExport: true,
        id: 'centering-guide-horizontal'
      })
      fabricCanvas.add(horizontalGuide)
    }
    
    // Mostrar punto central si está completamente centrado
    if (Math.abs(objCenterX - areaCenterX) < tolerance && Math.abs(objCenterY - areaCenterY) < tolerance) {
      const centerPoint = new fabric.Circle({
        left: areaCenterX - 3,
        top: areaCenterY - 3,
        radius: 3,
        fill: '#00FF00',
        stroke: '#FFFFFF',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        excludeFromExport: true,
        id: 'centering-guide-center'
      })
      fabricCanvas.add(centerPoint)
    }
    
    fabricCanvas.renderAll()
  }

  const clearCenteringGuides = (fabricCanvas: any) => {
    const objects = fabricCanvas.getObjects()
    const guidesToRemove = objects.filter((obj: any) => 
      obj.id && obj.id.startsWith('centering-guide-')
    )
    
    guidesToRemove.forEach((guide: any) => {
      fabricCanvas.remove(guide)
    })
    
    if (guidesToRemove.length > 0) {
      fabricCanvas.renderAll()
    }
  }

  // Función para aplicar snap magnético sutil al soltar el objeto
  const applySoftSnap = (fabricCanvas: any, obj: any) => {
    const objBounds = obj.getBoundingRect()
    const canvasCenterX = fabricCanvas.width / 2
    const canvasCenterY = fabricCanvas.height / 2
    const objCenterX = objBounds.left + objBounds.width / 2
    const objCenterY = objBounds.top + objBounds.height / 2
    
    const distanceX = Math.abs(objCenterX - canvasCenterX)
    const distanceY = Math.abs(objCenterY - canvasCenterY)
    
    const softSnapThreshold = 12 // Muy pequeño threshold para snap sutil
    let snapped = false
    
    // Solo snap si está muy cerca del centro
    if (distanceX <= softSnapThreshold) {
      const newLeft = canvasCenterX - objBounds.width / 2
      obj.set('left', newLeft)
      snapped = true
    }
    
    if (distanceY <= softSnapThreshold) {
      const newTop = canvasCenterY - objBounds.height / 2
      obj.set('top', newTop)
      snapped = true
    }
    
    if (snapped) {
      obj.setCoords()
      fabricCanvas.renderAll()
      
      // Mostrar brevemente una guía para indicar que se aplicó el snap
      const snapTarget = { type: 'canvas', width: fabricCanvas.width, height: fabricCanvas.height }
      showEnhancedCenteringGuides(fabricCanvas, obj, snapTarget)
      
      // Limpiar guías después de un momento
      setTimeout(() => {
        clearCenteringGuides(fabricCanvas)
      }, 800)
    }
  }

  // Función mejorada para mostrar guías según el tipo de snap
  const showEnhancedCenteringGuides = (fabricCanvas: any, obj: any, snapTarget: any) => {
    const tolerance = 5
    const objBounds = obj.getBoundingRect()
    const objCenterX = objBounds.left + objBounds.width / 2
    const objCenterY = objBounds.top + objBounds.height / 2
    
    // Limpiar guías existentes
    clearCenteringGuides(fabricCanvas)
    
    if (!snapTarget) return

    let centerX, centerY, guideStartX, guideEndX, guideStartY, guideEndY

    switch (snapTarget.type) {
      case 'area':
        // Snap al área de impresión
        centerX = snapTarget.coords.x + snapTarget.coords.width / 2
        centerY = snapTarget.coords.y + snapTarget.coords.height / 2
        guideStartX = snapTarget.coords.x
        guideEndX = snapTarget.coords.x + snapTarget.coords.width
        guideStartY = snapTarget.coords.y
        guideEndY = snapTarget.coords.y + snapTarget.coords.height
        break
        
      case 'canvas':
        // Snap al centro del canvas
        centerX = snapTarget.width / 2
        centerY = snapTarget.height / 2
        guideStartX = 0
        guideEndX = snapTarget.width
        guideStartY = 0
        guideEndY = snapTarget.height
        break
        
      case 'object':
        // Snap a otro objeto
        centerX = snapTarget.bounds.left + snapTarget.bounds.width / 2
        centerY = snapTarget.bounds.top + snapTarget.bounds.height / 2
        guideStartX = Math.min(objBounds.left, snapTarget.bounds.left)
        guideEndX = Math.max(objBounds.left + objBounds.width, snapTarget.bounds.left + snapTarget.bounds.width)
        guideStartY = Math.min(objBounds.top, snapTarget.bounds.top)
        guideEndY = Math.max(objBounds.top + objBounds.height, snapTarget.bounds.top + snapTarget.bounds.height)
        break
        
      default:
        return
    }
    
    // Mostrar guía vertical si está centrado horizontalmente
    if (Math.abs(objCenterX - centerX) < tolerance) {
      const verticalGuide = new fabric.Line([centerX, guideStartY, centerX, guideEndY], {
        stroke: snapTarget.type === 'object' ? '#FF6B35' : '#00FF00',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        excludeFromExport: true,
        id: `centering-guide-vertical-${snapTarget.type}`
      })
      fabricCanvas.add(verticalGuide)
    }
    
    // Mostrar guía horizontal si está centrado verticalmente
    if (Math.abs(objCenterY - centerY) < tolerance) {
      const horizontalGuide = new fabric.Line([guideStartX, centerY, guideEndX, centerY], {
        stroke: snapTarget.type === 'object' ? '#FF6B35' : '#00FF00',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        excludeFromExport: true,
        id: `centering-guide-horizontal-${snapTarget.type}`
      })
      fabricCanvas.add(horizontalGuide)
    }
    
    // Mostrar punto central si está completamente centrado
    if (Math.abs(objCenterX - centerX) < tolerance && Math.abs(objCenterY - centerY) < tolerance) {
      const centerPoint = new fabric.Circle({
        left: centerX - 4,
        top: centerY - 4,
        radius: 4,
        fill: snapTarget.type === 'object' ? '#FF6B35' : '#00FF00',
        stroke: '#FFFFFF',
        strokeWidth: 2,
        selectable: false,
        evented: false,
        excludeFromExport: true,
        id: `centering-guide-center-${snapTarget.type}`
      })
      fabricCanvas.add(centerPoint)
    }
    
    fabricCanvas.renderAll()
  }

  // Configurar restricciones de movimiento para todos los objetos añadidos
  const setupObjectConstraints = (obj: any) => {
    if (!obj || obj.id?.startsWith('print-area-') || obj.excludeFromExport) {
      return
    }
    
    // Función para obtener los límites actuales del área
    const getAreaBounds = () => {
      if (!canvas) return null
      const availableAreas = activeSide?.printAreas || []
      const areaToUse = activePrintArea || (availableAreas.length > 0 ? availableAreas[0] : null)
      
      if (!areaToUse) return null
      
      const areaCoords = getAreaCoordinates(canvas, areaToUse)
      if (!areaCoords) return null
      
      return {
        left: areaCoords.x,
        top: areaCoords.y,
        right: areaCoords.x + areaCoords.width,
        bottom: areaCoords.y + areaCoords.height
      }
    }
    
    // Configurar restricciones de movimiento nativas de Fabric.js
    obj.on('moving', function() {
      const areaBounds = getAreaBounds()
      if (!areaBounds) return
      
      const objBounds = this.getBoundingRect()
      
      // Calcular nueva posición restringida
      let newLeft = this.left
      let newTop = this.top
      
      // Restringir horizontalmente
      if (objBounds.left < areaBounds.left) {
        newLeft = this.left + (areaBounds.left - objBounds.left)
      } else if (objBounds.left + objBounds.width > areaBounds.right) {
        newLeft = this.left - ((objBounds.left + objBounds.width) - areaBounds.right)
      }
      
      // Restringir verticalmente
      if (objBounds.top < areaBounds.top) {
        newTop = this.top + (areaBounds.top - objBounds.top)
      } else if (objBounds.top + objBounds.height > areaBounds.bottom) {
        newTop = this.top - ((objBounds.top + objBounds.height) - areaBounds.bottom)
      }
      
      // Aplicar nueva posición
      this.set({
        left: newLeft,
        top: newTop
      })
    })
  }

  // Funciones para modo visual de movimiento de imagen (definidas antes de setupCanvasEvents)
  
  // Función para entrar en modo visual de movimiento de imagen
  const enterImageMovementMode = (maskObj: any, fabricCanvas: any) => {
    console.log('=== ENTRANDO EN MODO VISUAL DE MOVIMIENTO ===')
    console.log('FabricCanvas:', !!fabricCanvas)
    console.log('MaskObj:', maskObj)
    console.log('MaskImageSrc:', maskObj?.maskImageSrc)
    
    if (!fabricCanvas) {
      console.error('ERROR: No hay fabricCanvas disponible')
      return
    }
    
    if (!maskObj.maskImageSrc) {
      console.error('ERROR: No hay maskImageSrc en el objeto')
      return
    }

    console.log('Entrando en modo visual de movimiento de imagen - INICIANDO...')
    
    // Activar modo de movimiento
    console.log('🟡 ANTES de setImageMovementMode - estado actual:', imageMovementMode)
    setImageMovementMode(true)
    console.log('🟢 DESPUÉS de setImageMovementMode - estado debería ser true')
    setSelectedObject(maskObj)
    
    // Deshabilitar selección del objeto máscara
    maskObj.set({
      selectable: false,
      evented: false
    })
    
    // Cargar la imagen completa para mostrar
    fabric.Image.fromURL(maskObj.maskImageSrc, (fullImg: any) => {
      if (!fullImg) return
      
      const maskBounds = maskObj.getBoundingRect()
      const scale = maskObj.maskImageScale || 1
      const offsetX = maskObj.maskImageX || 0
      const offsetY = maskObj.maskImageY || 0
      
      // Configurar imagen completa visible con opacidad
      fullImg.set({
        left: maskBounds.left + maskBounds.width / 2 + offsetX,
        top: maskBounds.top + maskBounds.height / 2 + offsetY,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
        opacity: 0.7, // Opacidad para ver la imagen completa
        selectable: true,
        evented: true,
        id: `movable-image-${Date.now()}`,
        excludeFromExport: true // No exportar esta imagen temporal
      })
      
      // Añadir imagen movible al canvas
      fabricCanvas.add(fullImg)
      fabricCanvas.setActiveObject(fullImg)
      fabricCanvas.renderAll()
      
      // Guardar referencia para poder eliminarla después
      maskObj.movableImageId = fullImg.id
      
      // Evento para actualizar posición en tiempo real
      fullImg.on('moving', () => {
        if (imageMovementMode && selectedObject === maskObj) {
          const newLeft = fullImg.left - (maskBounds.left + maskBounds.width / 2)
          const newTop = fullImg.top - (maskBounds.top + maskBounds.height / 2)
          
          // Actualizar posición de la máscara sin redibujar toda la máscara
          maskObj.maskImageX = newLeft
          maskObj.maskImageY = newTop
        }
      })
      
      toast('Modo movimiento visual activado. Arrastra la imagen. Clic fuera o presiona ESC para aplicar.')
      
      // Añadir listener para tecla ESC
      const escapeHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && imageMovementMode) {
          console.log('ESC presionado - saliendo del modo movimiento')
          exitImageMovementMode(fabricCanvas)
          document.removeEventListener('keydown', escapeHandler)
        }
      }
      document.addEventListener('keydown', escapeHandler)
    }, { crossOrigin: 'anonymous' })
  }

  // Función para salir del modo visual de movimiento
  const exitImageMovementMode = (fabricCanvas: any) => {
    if (!fabricCanvas || !selectedObject || !imageMovementMode) return

    console.log('Saliendo del modo visual de movimiento de imagen')
    
    const maskObj = selectedObject
    
    // Eliminar todas las imágenes movibles temporales
    console.log('Eliminando imágenes temporales...')
    
    // Buscar y eliminar por ID específico
    if (maskObj.movableImageId) {
      const movableImage = fabricCanvas.getObjects().find((obj: any) => obj.id === maskObj.movableImageId)
      if (movableImage) {
        console.log('Eliminando imagen temporal por ID:', maskObj.movableImageId)
        fabricCanvas.remove(movableImage)
      }
      maskObj.movableImageId = null
    }
    
    // Limpiar todas las imágenes temporales
    cleanupTemporaryImages(fabricCanvas)
    
    // Restaurar selección del objeto máscara
    maskObj.set({
      selectable: true,
      evented: true
    })
    
    // Aplicar nueva posición a la máscara
    applyMaskToObject(maskObj)
    
    // Desactivar modo de movimiento
    setImageMovementMode(false)
    setLastMousePos(null)
    
    // Seleccionar el objeto máscara de nuevo y actualizar elementos
    fabricCanvas.setActiveObject(maskObj)
    setSelectedObject(maskObj)
    updateObjectProperties(maskObj)
    fabricCanvas.renderAll()
    
    // Actualizar lista de elementos del canvas
    setTimeout(() => {
      updateCanvasElements()
    }, 100)
    
    toast.success('Posición de imagen aplicada a la máscara')
  }

  // Helper function to check if Fabric.js is fully loaded
  const isFabricReady = () => {
    if (!fabricLoaded || typeof fabric === 'undefined' || !fabric) {
      console.error('Fabric.js is not loaded')
      toast.error('Editor no está listo. Por favor espera un momento.')
      return false
    }
    return true
  }

  // Función para actualizar posición del icono de placeholder cuando la forma se mueve
  const updateMaskPlaceholderPosition = (obj: any, canvasInstance?: any) => {
    const canvasToUse = canvasInstance || canvas
    console.log('🔄 updateMaskPlaceholderPosition iniciada:', {
      hasCanvas: !!canvas,
      hasCanvasInstance: !!canvasInstance,
      hasCanvasToUse: !!canvasToUse,
      objType: obj?.type,
      maskPlaceholderId: obj?.maskPlaceholderId
    })

    if (!canvasToUse || !obj.maskPlaceholderId) {
      console.log('❌ Saliendo temprano:', {
        hasCanvas: !!canvas,
        hasCanvasInstance: !!canvasInstance,
        hasCanvasToUse: !!canvasToUse,
        hasMaskPlaceholderId: !!obj.maskPlaceholderId
      })
      return
    }

    const placeholderId = obj.maskPlaceholderId
    const allObjects = canvasToUse.getObjects()
    console.log('🔍 Todos los objetos en canvas:', allObjects.map(o => ({ type: o.type, id: o.id })))
    
    const relatedObjects = allObjects.filter((o: any) => 
      o.id && o.id.startsWith(placeholderId)
    )
    
    console.log('🎯 Objetos relacionados encontrados:', {
      placeholderId,
      total: relatedObjects.length,
      objects: relatedObjects.map(o => ({ type: o.type, id: o.id }))
    })
    
    if (relatedObjects.length === 0) {
      console.log('❌ No se encontraron objetos relacionados para placeholder:', placeholderId)
      return
    }

    // Obtener las nuevas coordenadas del objeto
    const bounds = obj.getBoundingRect()
    const iconSize = Math.min(bounds.width, bounds.height) * 0.3

    console.log('📏 Calculando nuevas posiciones:', {
      placeholderId,
      relatedObjects: relatedObjects.length,
      bounds: { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height },
      iconSize,
      centerX: bounds.left + bounds.width / 2,
      centerY: bounds.top + bounds.height / 2
    })

    // Actualizar posición de cada elemento del placeholder
    relatedObjects.forEach((element: any, index: number) => {
      console.log(`🔧 Actualizando elemento ${index + 1}/${relatedObjects.length}:`, {
        id: element.id,
        type: element.type,
        currentPos: { left: element.left, top: element.top }
      })

      if (element.id.includes('-bg')) {
        // Actualizar background
        const newPos = {
          left: bounds.left + bounds.width / 2,
          top: bounds.top + bounds.height / 2,
          width: iconSize,
          height: iconSize
        }
        console.log('🎨 Actualizando background:', newPos)
        element.set(newPos)
        element.setCoords() // Importante: actualizar coordenadas
      } else if (element.id.includes('-icon')) {
        // Actualizar ícono de cámara
        const newPos = {
          left: bounds.left + bounds.width / 2,
          top: bounds.top + bounds.height / 2 - iconSize * 0.1,
          fontSize: iconSize * 0.4
        }
        console.log('📷 Actualizando icono:', newPos)
        element.set(newPos)
        element.setCoords() // Importante: actualizar coordenadas
      } else if (element.id.includes('-text')) {
        // Actualizar texto "Imagen"
        const newPos = {
          left: bounds.left + bounds.width / 2,
          top: bounds.top + bounds.height / 2 + iconSize * 0.2,
          fontSize: Math.min(iconSize * 0.2, 12)
        }
        console.log('📝 Actualizando texto:', newPos)
        element.set(newPos)
        element.setCoords() // Importante: actualizar coordenadas
      }
      
      console.log(`✅ Elemento ${element.id} actualizado a:`, {
        left: element.left,
        top: element.top
      })
    })
    
    canvasToUse.renderAll()
  }

  // Setup canvas events
  const setupCanvasEvents = (fabricCanvas: any) => {
    fabricCanvas.on('selection:created', (e: any) => {
      setSelectedObject(e.selected?.[0] || e.target)
      updateObjectProperties(e.selected?.[0] || e.target)
      // Resetear activePanel cuando se selecciona un objeto
      setActivePanel('')
      // Limpiar guías de centrado al seleccionar un objeto
      clearCenteringGuides(fabricCanvas)
      // Limpiar imágenes temporales por si acaso
      cleanupTemporaryImages(fabricCanvas)
    })

    fabricCanvas.on('selection:updated', (e: any) => {
      setSelectedObject(e.selected?.[0] || e.target)
      updateObjectProperties(e.selected?.[0] || e.target)
      // Resetear activePanel cuando se actualiza la selección
      setActivePanel('')
      // Limpiar guías de centrado al actualizar la selección
      clearCenteringGuides(fabricCanvas)
    })

    fabricCanvas.on('selection:cleared', () => {
      setSelectedObject(null)
      // Volver al panel de diseño cuando se deselecciona (excepto en modo movimiento)
      if (!imageMovementMode) {
        setActivePanel('design')
      }
      // Limpiar guías de centrado al limpiar la selección
      clearCenteringGuides(fabricCanvas)
    })

    // Reset snap state cuando se suelta el mouse
    fabricCanvas.on('mouse:up', () => {
      isSnapping.current = false
      snapCooldown.current = 0
    })

    fabricCanvas.on('object:modified', (e: any) => {
      if (!isReadOnly) {
        // Aplicar restricciones de área después de cualquier modificación
        const obj = e.target
        if (obj && enforceAreaConstraints) {
          enforceAreaConstraints(obj)
        }
        
        // Snap magnético sutil al soltar el objeto
        if (obj && !obj.excludeFromExport && !obj.id?.startsWith('print-area-')) {
          applySoftSnap(fabricCanvas, obj)
        }
        
        saveToHistory(fabricCanvas)
      }
      
      // Resetear estado de snap al terminar el movimiento
      setIsDragging(false)
      setSnapActive({ x: false, y: false })
      
      // Limpiar guías de centrado
      clearCenteringGuides(fabricCanvas)
      
      // Actualizar posición del icono de máscara si existe después de cualquier modificación
      const obj = e.target
      if (obj && obj.isMask && obj.maskPlaceholderId && !obj.maskImageSrc) {
        updateMaskPlaceholderPosition(obj, fabricCanvas)
      }
      
      updateCanvasElements()
    })

    fabricCanvas.on('object:added', (e: any) => {
      if (!isReadOnly) {
        // Configurar restricciones para el nuevo objeto
        const obj = e.target
        if (obj && !obj.id?.startsWith('print-area-') && !obj.excludeFromExport) {
          // Configurar restricciones inmediatamente
          setupObjectConstraints(obj)
          obj._hasConstraints = true
          
          // También aplicar restricciones iniciales
          if (enforceAreaConstraints) {
            setTimeout(() => enforceAreaConstraints(obj), 10)
          }
        }
        saveToHistory(fabricCanvas)
        // Update elements immediately
        setTimeout(() => updateCanvasElements(), 100)
      }
    })

    fabricCanvas.on('object:removed', () => {
      if (!isReadOnly) {
        saveToHistory(fabricCanvas)
        // Update elements immediately
        setTimeout(() => updateCanvasElements(), 50)
      }
    })

    fabricCanvas.on('text:editing:exited', () => {
      updateCanvasElements()
    })

    
    // Evento de movimiento global (como respaldo)
    fabricCanvas.on('object:moving', (e: any) => {
      const obj = e.target
      
      // No restringir elementos del área visual (que son solo indicadores)
      if (obj.id && obj.id.startsWith('print-area-')) {
        return
      }
      
      // No restringir elementos marcados como excludeFromExport
      if (obj.excludeFromExport) {
        return
      }
      
      // Snap magnético con resistencia controlada
      if (fabricCanvas && !isSnapping.current) {
        const now = Date.now()
        
        // Throttle: solo procesar cada 16ms (60fps)
        if (now - snapCooldown.current < 16) {
          return
        }
        snapCooldown.current = now
        
        const objBounds = obj.getBoundingRect()
        const canvasCenterX = fabricCanvas.width / 2
        const canvasCenterY = fabricCanvas.height / 2
        const objCenterX = objBounds.left + objBounds.width / 2
        const objCenterY = objBounds.top + objBounds.height / 2
        
        const distanceX = Math.abs(objCenterX - canvasCenterX)
        const distanceY = Math.abs(objCenterY - canvasCenterY)
        
        const snapZone = 8 // Zone de snap magnético
        const guideZone = 15 // Zone para mostrar guías
        
        let hasSnapped = false
        
        // Aplicar snap magnético si está en la zona
        if (distanceX <= snapZone && distanceX > 0.5) {
          isSnapping.current = true
          const newLeft = canvasCenterX - objBounds.width / 2
          obj.set('left', newLeft)
          obj.setCoords()
          hasSnapped = true
          
          setTimeout(() => {
            isSnapping.current = false
          }, 100) // Cooldown de 100ms
        }
        
        if (distanceY <= snapZone && distanceY > 0.5) {
          isSnapping.current = true
          const newTop = canvasCenterY - objBounds.height / 2
          obj.set('top', newTop)
          obj.setCoords()
          hasSnapped = true
          
          setTimeout(() => {
            isSnapping.current = false
          }, 100) // Cooldown de 100ms
        }
        
        // Mostrar guías
        if (distanceX <= guideZone || distanceY <= guideZone) {
          const snapTarget = { type: 'canvas', width: fabricCanvas.width, height: fabricCanvas.height }
          showEnhancedCenteringGuides(fabricCanvas, obj, snapTarget)
        } else {
          clearCenteringGuides(fabricCanvas)
        }
        
        if (hasSnapped) {
          fabricCanvas.renderAll()
        }
        
        setIsDragging(true)
      }
      
      // Aplicar restricciones inmediatamente durante el movimiento
      enforceAreaConstraints(obj)
      
      // Solo como respaldo si el objeto no tiene restricciones configuradas
      if (!obj._hasConstraints) {
        setupObjectConstraints(obj)
        obj._hasConstraints = true
      }
      
      // Actualizar posición del icono de máscara si existe
      console.log('🔍 object:moving - Verificando objeto:', {
        isMask: obj?.isMask,
        maskPlaceholderId: obj?.maskPlaceholderId,
        maskImageSrc: obj?.maskImageSrc,
        shouldUpdate: obj && obj.isMask && obj.maskPlaceholderId && !obj.maskImageSrc
      })
      if (obj && obj.isMask && obj.maskPlaceholderId && !obj.maskImageSrc) {
        console.log('📍 Llamando updateMaskPlaceholderPosition desde object:moving')
        updateMaskPlaceholderPosition(obj, fabricCanvas)
      }
    })

    // Restringir escalado de objetos dentro del área de impresión
    fabricCanvas.on('object:scaling', (e: any) => {
      // Buscar cualquier área de impresión disponible para aplicar restricciones
      const availableAreas = activeSide?.printAreas || []
      const areaToUse = activePrintArea || (availableAreas.length > 0 ? availableAreas[0] : null)
      
      if (areaToUse) {
        const obj = e.target
        
        // Obtener coordenadas del área usando la función helper
        const areaCoords = getAreaCoordinates(fabricCanvas, areaToUse)
        if (!areaCoords) return
        
        // Calcular nuevas dimensiones después del escalado
        const newBounds = obj.getBoundingRect()
        
        // Límites del área de impresión
        const areaLeft = areaCoords.x
        const areaTop = areaCoords.y
        const areaRight = areaCoords.x + areaCoords.width
        const areaBottom = areaCoords.y + areaCoords.height
        
        // Si el objeto escalado se sale del área, limitar el escalado
        if (newBounds.left < areaLeft || 
            newBounds.top < areaTop || 
            newBounds.left + newBounds.width > areaRight || 
            newBounds.top + newBounds.height > areaBottom) {
          
          // Calcular el factor de escala máximo permitido para mantener el objeto dentro del área
          const maxScaleX = areaCoords.width / obj.width
          const maxScaleY = areaCoords.height / obj.height
          const maxScale = Math.min(maxScaleX, maxScaleY, 1) // No permitir escalado mayor al original si no cabe
          
          // Limitar la escala actual
          const limitedScaleX = Math.min(obj.scaleX, maxScale)
          const limitedScaleY = Math.min(obj.scaleY, maxScale)
          
          obj.set({
            scaleX: limitedScaleX,
            scaleY: limitedScaleY
          })
        }
        
        obj.setCoords()
      }
      
      // Actualizar posición del icono de máscara si existe
      const obj = e.target
      if (obj.isMask && obj.maskPlaceholderId && !obj.maskImageSrc) {
        updateMaskPlaceholderPosition(obj, fabricCanvas)
      }
    })

    // Restringir rotación de objetos dentro del área de impresión
    fabricCanvas.on('object:rotating', (e: any) => {
      // Buscar cualquier área de impresión disponible para aplicar restricciones
      const availableAreas = activeSide?.printAreas || []
      const areaToUse = activePrintArea || (availableAreas.length > 0 ? availableAreas[0] : null)
      
      if (areaToUse) {
        const obj = e.target
        
        // Obtener coordenadas del área usando la función helper
        const areaCoords = getAreaCoordinates(fabricCanvas, areaToUse)
        if (!areaCoords) return
        
        // Calcular dimensiones después de la rotación
        const bounds = obj.getBoundingRect()
        
        // Límites del área de impresión
        const areaLeft = areaCoords.x
        const areaTop = areaCoords.y
        const areaRight = areaCoords.x + areaCoords.width
        const areaBottom = areaCoords.y + areaCoords.height
        
        // Si el objeto rotado se sale del área, restringir la posición
        if (bounds.left < areaLeft || 
            bounds.top < areaTop || 
            bounds.left + bounds.width > areaRight || 
            bounds.top + bounds.height > areaBottom) {
          
          // Ajustar posición para mantener dentro del área
          const centerX = obj.left
          const centerY = obj.top
          const maxLeft = Math.min(centerX, areaRight - bounds.width / 2)
          const minLeft = Math.max(centerX, areaLeft + bounds.width / 2)
          const maxTop = Math.min(centerY, areaBottom - bounds.height / 2)
          const minTop = Math.max(centerY, areaTop + bounds.height / 2)
          
          obj.set({
            left: Math.max(minLeft, Math.min(maxLeft, centerX)),
            top: Math.max(minTop, Math.min(maxTop, centerY))
          })
        }
        
        obj.setCoords()
      }
      
      // Actualizar posición del icono de máscara si existe
      const obj = e.target
      if (obj.isMask && obj.maskPlaceholderId && !obj.maskImageSrc) {
        updateMaskPlaceholderPosition(obj, fabricCanvas)
      }
    })

    // COMBINADO: Reglas de centrado integradas en el event listener principal de restricciones
    // (Ya no necesitamos un event listener separado para las guías)

    // Limpiar guías cuando se termina de mover
    fabricCanvas.on('mouse:up', () => {
      clearCenteringGuides(fabricCanvas)
    })

    // Zoom with mouse wheel - centered
    fabricCanvas.on('mouse:wheel', (opt: any) => {
      const delta = opt.e.deltaY
      const prevZoom = fabricCanvas.getZoom()
      let zoom = prevZoom
      
      zoom *= 0.999 ** delta
      if (zoom > 20) zoom = 20
      if (zoom < 0.01) zoom = 0.01
      
      // Obtener centro del canvas para zoom centrado
      const canvasCenter = {
        x: fabricCanvas.width! / 2,
        y: fabricCanvas.height! / 2
      }
      
      // Aplicar zoom al centro en lugar del cursor
      fabricCanvas.zoomToPoint(canvasCenter, zoom)
      setZoom(Math.round(zoom * 100))
      
      opt.e.preventDefault()
      opt.e.stopPropagation()
    })

    // DOBLE CLIC DESHABILITADO TEMPORALMENTE - Los usuarios usarán los controles de Posición X y Y
    // fabricCanvas.on('mouse:dblclick', (opt: any) => {
    //   console.log('=== EVENTO DOBLE CLIC DETECTADO ===')
    //   console.log('Evento opt:', opt)
    //   const target = opt.target
    //   console.log('Target:', target)
    //   
    //   if (target) {
    //     console.log('Propiedades del target:', {
    //       type: target.type,
    //       isMask: target.isMask,
    //       maskImageSrc: !!target.maskImageSrc,
    //       canBeMask: target.canBeMask,
    //       customName: target.customName
    //     })
    //     
    //     if (target.isMask && target.maskImageSrc) {
    //       console.log('Doble clic en forma con máscara VALIDA, habilitando modo visual de movimiento de imagen')
    //       
    //       // Activar modo de movimiento de imagen
    //       enterImageMovementMode(target, fabricCanvas)
    //     } else {
    //       console.log('🚨 DOBLE CLIC EN OBJETO QUE NO CUMPLE CONDICIONES:')
    //       console.log('isMask:', target.isMask)
    //       console.log('maskImageSrc:', target.maskImageSrc ? 'SÍ TIENE' : 'NO TIENE')
    //       console.log('Propiedades completas del target:', Object.keys(target))
    //       console.log('Target completo:', target)
    //     }
    //   } else {
    //     console.log('Doble clic sin target (en canvas vacío)')
    //   }
    // })

    // Evento para salir del modo movimiento con clic fuera
    fabricCanvas.on('mouse:down', (opt: any) => {
      console.log('Mouse down event - imageMovementMode:', imageMovementMode)
      if (imageMovementMode) {
        console.log('Target:', opt.target)
        console.log('Target ID:', opt.target?.id)
        
        // Si no hay target o el target no es la imagen movible, salir del modo
        if (!opt.target || !opt.target.id || !opt.target.id.includes('movable-image')) {
          console.log('Saliendo del modo movimiento - clic fuera detectado')
          exitImageMovementMode(fabricCanvas)
        } else {
          console.log('Clic en imagen movible - continuando modo')
        }
      }
    })
    
    // Evento adicional para detectar cuando se selecciona otro objeto
    fabricCanvas.on('selection:created', (e: any) => {
      if (imageMovementMode) {
        const selectedObj = e.selected?.[0] || e.target
        if (selectedObj && selectedObj.id && !selectedObj.id.includes('movable-image')) {
          console.log('Objeto diferente seleccionado - saliendo del modo movimiento')
          exitImageMovementMode(fabricCanvas)
        }
      }
    })
  }

  const updateObjectProperties = (obj: any) => {
    if (!obj) return
    
    console.log('Actualizando propiedades del objeto:', {
      type: obj.type,
      canBeMask: obj.canBeMask,
      isMask: obj.isMask,
      customName: obj.customName
    })
    
    setObjectOpacity(Math.round((obj.opacity || 1) * 100))
    setObjectRotation(Math.round(obj.angle || 0))
    
    if (obj.type === 'text' || obj.type === 'i-text') {
      setTextContent(obj.text || '')
      setTextColor(obj.fill || '#000000')
      setFontSize(obj.fontSize || 24)
      setFontFamily(obj.fontFamily || 'Arial')
      setFontWeight(obj.fontWeight || 'normal')
      setFontStyle(obj.fontStyle || 'normal')
    }
    
    if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle' || obj.type === 'path' || obj.type === 'group') {
      setShapeColor(obj.fill || '#ff6b35')
      setStrokeColor(obj.stroke || '#000000')
      setStrokeWidth(obj.strokeWidth || 1)
    }
    
    if (obj.type === 'image') {
      const scaledWidth = Math.round(obj.width * obj.scaleX)
      const scaledHeight = Math.round(obj.height * obj.scaleY)
      setImageWidth(scaledWidth)
      setImageHeight(scaledHeight)
    }
  }

  const saveToHistory = useCallback((fabricCanvas: any) => {
    const state: CanvasState = {
      objects: fabricCanvas.toObject().objects,
      zoom: fabricCanvas.getZoom(),
      viewportTransform: fabricCanvas.viewportTransform
    }
    
    setCanvasHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(state)
      return newHistory.slice(-20) // Keep last 20 states
    })
    
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex])

  // Función para cargar el fondo de un lado con coordenadas relativas
  const loadSideBackground = useCallback((fabricCanvas: any, side: ProductSide, preserveElements = false) => {
    const imageUrl = getSideImageForVariant(side, selectedVariant)
    if (!fabricCanvas || !imageUrl) return

    // Reset background loaded state
    setBackgroundLoaded(false)
    
    // Solo limpiar el canvas si no necesitamos preservar elementos (como plantillas)
    if (!preserveElements) {
      fabricCanvas.clear()
    } else {
      // Si hay elementos que preservar, solo remover el fondo anterior
      const existingBackground = fabricCanvas.backgroundImage
      if (existingBackground) {
        fabricCanvas.setBackgroundImage(null, fabricCanvas.renderAll.bind(fabricCanvas))
      }
    }
    
    // Cargar imagen de fondo
    fabric.Image.fromURL(imageUrl, (img: any) => {
      if (!img) return

      // Calcular cómo escalar la imagen para que se ajuste al canvas
      const imageTransform = scaleImageToCanvas(
        { width: img.width, height: img.height },
        STANDARD_CANVAS_SIZE
      )

      // Configurar imagen de fondo como backgroundImage del canvas
      img.set({
        left: imageTransform.left,
        top: imageTransform.top,
        scaleX: imageTransform.scaleX,
        scaleY: imageTransform.scaleY,
        selectable: false,
        evented: false,
        excludeFromExport: false,
        opacity: 1
      })
      
      // Establecer como imagen de fondo del canvas
      fabricCanvas.setBackgroundImage(img, () => {
        // Mantener el zoom actual si hay uno establecido
        const currentZoom = fabricCanvas.getZoom()
        if (currentZoom && currentZoom !== 1) {
          const canvasCenter = {
            x: fabricCanvas.width / 2,
            y: fabricCanvas.height / 2
          }
          fabricCanvas.zoomToPoint(canvasCenter, currentZoom)
        }
        
        fabricCanvas.renderAll()
        setBackgroundLoaded(true)
        console.log('✅ Background image loaded with zoom:', currentZoom)
      })

      // Cargar áreas de impresión con coordenadas relativas
      console.log('🔧 Cargando áreas de impresión:', side.printAreas.length)
      console.log('📐 Transformación de imagen:', imageTransform)
      console.log('📏 Canvas size:', STANDARD_CANVAS_SIZE)
      loadPrintAreas(fabricCanvas, side.printAreas, imageTransform)

      console.log('✅ Lado cargado:', side.name)
    })
  }, [selectedVariant])

  // Efecto para actualizar el canvas cuando cambia la variante
  useEffect(() => {
    if (canvas && currentSide && selectedVariant) {
      loadSideBackground(canvas, currentSide)
    }
  }, [canvas, currentSide, selectedVariant, loadSideBackground])

  // Cargar plantillas disponibles
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch(`/api/products/${productId}/templates`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setAvailableTemplates({
              hasDefaultTemplate: data.hasDefaultTemplate,
              defaultTemplates: data.defaultTemplates,
              optionalTemplates: data.optionalTemplates
            })
          }
        }
      } catch (error) {
        console.error('Error loading templates:', error)
      }
    }

    loadTemplates()
  }, [productId])

  // Cargar plantilla específica si se proporciona templateId
  useEffect(() => {
    console.log('Template loading effect:', { canvas: !!canvas, templateId, availableTemplates })
    if (canvas && templateId && availableTemplates) {
      const template = availableTemplates.defaultTemplates.find(t => t.id === templateId) ||
                      availableTemplates.optionalTemplates.find(t => t.id === templateId)
      
      console.log('Found template:', template)
      if (template) {
        console.log('Loading template:', template.name)
        loadTemplate(template)
      } else {
        console.log('Template not found with ID:', templateId)
      }
    }
  }, [canvas, templateId, availableTemplates])

  // Función para cargar una plantilla en el canvas
  const loadTemplate = async (template: any) => {
    if (!canvas || !template.templateData || canvas._isDisposed) return

    try {
      // Cargar ajustes de plantilla si existen
      if (template.templateData.templateSettings) {
        console.log('🔧 Loading template settings from template:', template.templateData.templateSettings)
        setTemplateSettings(template.templateData.templateSettings)
      } else if (template.templateSettings) {
        console.log('🔧 Loading template settings from root:', template.templateSettings)
        setTemplateSettings(template.templateSettings)
      } else {
        console.log('⚠️ No template settings found, using defaults')
      }

      // Primero cargar el fondo del lado actual (sin limpiar elementos)
      if (activeSide) {
        await loadSideBackground(canvas, activeSide, false) // Limpiar para empezar limpio
      }

      // Cargar elementos de la plantilla
      console.log('Template data structure:', template.templateData)
      if (template.templateData.sideElements) {
        // Obtener el lado actual
        const currentSide = template.templateData.currentSide || Object.keys(template.templateData.sideElements)[0]
        const elements = template.templateData.sideElements[currentSide] || []
        
        console.log('Loading elements for side:', currentSide, elements)
        // Invertir el orden para que coincida con el editor de plantillas
        // En el editor de plantillas: primer elemento = abajo, último = arriba
        // En fabric.js: primer elemento agregado = abajo, último = arriba
        const elementsToLoad = [...elements].reverse()
        for (const element of elementsToLoad) {
          console.log('Adding element to canvas:', element)
          await addElementToCanvas(element)
        }
      } else if (template.templateData.elements) {
        // Fallback para estructura antigua
        console.log('Loading elements (old structure):', template.templateData.elements)
        // Invertir el orden para mantener consistencia con el editor de plantillas
        const elementsToLoad = [...template.templateData.elements].reverse()
        for (const element of elementsToLoad) {
          await addElementToCanvas(element)
        }
      } else {
        console.log('No elements found in template data')
      }

      // Actualizar elementos del canvas para mostrar en el panel
      updateCanvasElements()

      // Incrementar contador de uso
      fetch('/api/personalization/templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: template.id,
          usageCount: template.usageCount + 1
        })
      }).catch(console.error)

      toast.success(`Plantilla "${template.name}" cargada`)
    } catch (error) {
      console.error('Error loading template:', error)
      toast.error('Error al cargar la plantilla')
    }
  }

  // Función para agregar elemento al canvas (implementación básica)
  const addElementToCanvas = async (element: any) => {
    if (!canvas) return

    try {
      console.log('Adding element to canvas:', element)
      
      // Convertir coordenadas relativas a absolutas si es necesario
      let elementX = element.x || element.left || 0
      let elementY = element.y || element.top || 0
      let elementWidth = element.width || 100
      let elementHeight = element.height || 100
      
      // Si el elemento tiene coordenadas relativas, convertirlas a absolutas
      if (element.isRelativeCoordinates) {
        const relativeCoords: RelativeCoordinates = {
          x: element.x || 0,
          y: element.y || 0,
          width: element.width || 100,
          height: element.height || 100
        }
        
        // Convertir usando el tamaño del canvas actual
        const absoluteCoords = relativeToAbsolute(relativeCoords, STANDARD_CANVAS_SIZE)
        
        elementX = absoluteCoords.x
        elementY = absoluteCoords.y
        elementWidth = absoluteCoords.width
        elementHeight = absoluteCoords.height
        console.log('Converted relative coords to absolute:', { relative: relativeCoords, absolute: absoluteCoords })
      }
      
      switch (element.type) {
        case 'text':
          // Para texto, usar fontSize directamente (ya está en las unidades correctas)
          const text = new fabric.Text(element.text || 'Texto', {
            left: elementX,
            top: elementY,
            fontSize: element.fontSize || 20,
            fill: element.color || element.fillColor || element.fill || '#000000',
            fontFamily: element.fontFamily || 'Arial',
            fontWeight: element.fontWeight || 'normal'
          })
          canvas.add(text)
          console.log('Text element added:', text)
          break

        case 'image':
          if (element.src) {
            fabric.Image.fromURL(element.src, (img: any) => {
              if (img) {
                const scaleX = elementWidth / img.width
                const scaleY = elementHeight / img.height
                
                img.set({
                  left: elementX,
                  top: elementY,
                  scaleX: scaleX,
                  scaleY: scaleY
                })
                canvas.add(img)
                canvas.renderAll()
                console.log('Image element added:', img)
              }
            }, { crossOrigin: 'anonymous' })
          }
          break

        case 'shape':
          // Detectar si es círculo o rectángulo
          const isCircle = element.src && element.src.includes('circle')
          
          if (isCircle) {
            const radius = Math.min(elementWidth, elementHeight) / 2
            const circle = new fabric.Circle({
              left: elementX,
              top: elementY,
              radius: radius,
              fill: element.fillColor || element.fill || '#000000',
              stroke: element.strokeColor || element.stroke,
              strokeWidth: element.strokeWidth || 0
            })
            canvas.add(circle)
            console.log('Circle shape added:', circle)
          } else {
            // Rectángulo por defecto
            const rect = new fabric.Rect({
              left: elementX,
              top: elementY,
              width: elementWidth,
              height: elementHeight,
              fill: element.fillColor || element.fill || '#000000',
              stroke: element.strokeColor || element.stroke,
              strokeWidth: element.strokeWidth || 0
            })
            canvas.add(rect)
            console.log('Rectangle shape added:', rect)
          }
          break

        case 'rect':
          const rect = new fabric.Rect({
            left: elementX,
            top: elementY,
            width: elementWidth,
            height: elementHeight,
            fill: element.fillColor || element.fill || '#000000',
            stroke: element.strokeColor || element.stroke,
            strokeWidth: element.strokeWidth || 0
          })
          canvas.add(rect)
          console.log('Rectangle element added:', rect)
          break

        case 'circle':
          const circle = new fabric.Circle({
            left: elementX,
            top: elementY,
            radius: element.radius || Math.min(elementWidth, elementHeight) / 2,
            fill: element.fillColor || element.fill || '#000000',
            stroke: element.strokeColor || element.stroke,
            strokeWidth: element.strokeWidth || 0
          })
          canvas.add(circle)
          console.log('Circle element added:', circle)
          break

        default:
          console.warn('Unknown element type:', element.type)
      }
      
      canvas.renderAll()
    } catch (error) {
      console.error('Error adding element to canvas:', error)
    }
  }

  // Función para cargar áreas de impresión con sistema de coordenadas relativas
  const loadPrintAreas = useCallback((fabricCanvas: any, printAreas: PrintArea[], imageTransform: any) => {
    console.log('🎯 Procesando áreas de impresión:', printAreas)
    printAreas.forEach((area, index) => {
      console.log(`📍 Área ${index + 1}:`, {
        name: area.name,
        coordinates: { x: area.x, y: area.y, width: area.width, height: area.height },
        isRelative: area.isRelativeCoordinates
      })
      
      // Convertir coordenadas según el tipo
      let absoluteCoords: AbsoluteCoordinates

      if (area.isRelativeCoordinates) {
        // Ya están en formato relativo, calcular posición en imagen escalada
        const relativeCoords: RelativeCoordinates = {
          x: area.x,
          y: area.y,
          width: area.width,
          height: area.height
        }
        
        absoluteCoords = calculatePrintAreaOnScaledImage(
          relativeCoords,
          imageTransform,
          STANDARD_CANVAS_SIZE
        )
      } else {
        // Coordenadas absolutas legacy, usar referencia o canvas estándar
        const referenceSize = {
          width: area.referenceWidth || STANDARD_CANVAS_SIZE.width,
          height: area.referenceHeight || STANDARD_CANVAS_SIZE.height
        }
        
        // Convertir a relativas y luego a absolutas en la imagen escalada
        const relativeCoords: RelativeCoordinates = {
          x: (area.x / referenceSize.width) * 100,
          y: (area.y / referenceSize.height) * 100,
          width: (area.width / referenceSize.width) * 100,
          height: (area.height / referenceSize.height) * 100
        }
        
        absoluteCoords = calculatePrintAreaOnScaledImage(
          relativeCoords,
          imageTransform,
          STANDARD_CANVAS_SIZE
        )
      }

      console.log(`✨ Coordenadas absolutas calculadas para ${area.name}:`, absoluteCoords)
      const areaRect = new fabric.Rect({
        left: absoluteCoords.x,
        top: absoluteCoords.y,
        width: absoluteCoords.width,
        height: absoluteCoords.height,
        fill: 'transparent', // Sin relleno para una visualización más realista
        stroke: '#FF6B35',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        excludeFromExport: true,
        id: `print-area-${area.id}`,
        name: area.name
      })

      fabricCanvas.add(areaRect)

      // Agregar etiqueta del área
      const label = new fabric.Text(area.name, {
        left: absoluteCoords.x,
        top: absoluteCoords.y - 20,
        fontSize: 12,
        fill: '#FF6B35',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        selectable: false,
        evented: false,
        excludeFromExport: true
      })

      fabricCanvas.add(label)
    })

    // Establecer primera área como activa
    if (printAreas.length > 0) {
      setActivePrintArea(printAreas[0])
    }

    fabricCanvas.renderAll()
  }, [])


  // Tool functions
  const addText = () => {
    if (!canvas || !activePrintArea) {
      toast.error('Selecciona un área de impresión primero')
      return
    }
    
    if (!activePrintArea.allowText) {
      toast.error('No se permite texto en esta área')
      return
    }

    // Si no está permitida la personalización (modo admin), permitir todo
    if (!allowPersonalization) {
      // Modo admin - sin restricciones
    } else {
      // Modo usuario - solo dentro del área activa
      if (!activePrintArea.allowText) {
        toast.error('No se permite agregar texto en esta área')
        return
      }
    }

    // Obtener coordenadas correctas del área activa
    const areaCoords = getAreaCoordinates(canvas, activePrintArea)
    if (!areaCoords) {
      toast.error('No se pueden calcular las coordenadas del área')
      return
    }

    const defaultText = textContent || 'Texto nuevo'
    const isDefaultText = defaultText === 'Texto nuevo' || defaultText === 'Texto de ejemplo'
    
    const textObj = new fabric.IText(defaultText, {
      left: areaCoords.x + 20, // Margen de 20px desde el borde izquierdo del área
      top: areaCoords.y + 20,  // Margen de 20px desde el borde superior del área
      fontSize: fontSize,
      fill: isDefaultText ? '#999999' : textColor, // Color más tenue para texto de ejemplo
      fontFamily: fontFamily,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      selectable: true,
      editable: true,
      isPlaceholder: isDefaultText // Marcar como placeholder
    })

    // Evento para limpiar el texto cuando se hace doble click para editar
    textObj.on('editing:entered', function() {
      const textObj = this
      // Limpiar texto si es el texto de ejemplo por defecto
      if (textObj.text === 'Texto nuevo' || textObj.text === 'Texto de ejemplo' || textObj.isPlaceholder) {
        setTimeout(() => {
          textObj.text = ''
          textObj.fill = textColor // Restaurar el color original
          textObj.isPlaceholder = false // Ya no es placeholder
          textObj.selectAll()
          canvas.renderAll()
        }, 10)
      }
    })

    // Evento cuando termina la edición para evitar texto vacío
    textObj.on('editing:exited', function() {
      if (this.text.trim() === '') {
        // Si queda vacío, volver al texto de ejemplo
        this.text = 'Texto nuevo'
        this.fill = '#999999'
        this.isPlaceholder = true
        canvas.renderAll()
      }
    })

    canvas.add(textObj)
    canvas.setActiveObject(textObj)
    setSelectedObject(textObj)
    updateObjectProperties(textObj)
    canvas.renderAll()
  }

  const addShape = (shapeType: string) => {
    if (!canvas || !activePrintArea) {
      toast.error('Selecciona un área de impresión primero')
      return
    }
    
    if (!activePrintArea.allowShapes) {
      toast.error('No se permite formas en esta área')
      return
    }

    // Obtener coordenadas correctas del área activa
    const areaCoords = getAreaCoordinates(canvas, activePrintArea)
    if (!areaCoords) {
      toast.error('No se pueden calcular las coordenadas del área')
      return
    }

    let shape: any
    const baseProps = {
      left: areaCoords.x + 20, // Margen de 20px desde el borde izquierdo del área
      top: areaCoords.y + 20,  // Margen de 20px desde el borde superior del área
      fill: shapeColor,
      stroke: strokeColor,
      strokeWidth: strokeWidth || 1, // Asegurar que siempre tenga al menos 1px
      selectable: true
    }

    switch (shapeType) {
      case 'rect':
        shape = new fabric.Rect({
          ...baseProps,
          width: 100,
          height: 100
        })
        break
      
      case 'circle':
        shape = new fabric.Circle({
          ...baseProps,
          radius: 50
        })
        break
      
      case 'triangle':
        shape = new fabric.Triangle({
          ...baseProps,
          width: 100,
          height: 100
        })
        break

      case 'diamond':
        // Crear un diamante usando un rectángulo rotado
        shape = new fabric.Rect({
          ...baseProps,
          width: 70,
          height: 70,
          angle: 45
        })
        break

      case 'star':
        // Crear una estrella usando path
        const starPoints = 'M 50,5 L 61,35 L 98,35 L 69,57 L 79,91 L 50,70 L 21,91 L 31,57 L 2,35 L 39,35 Z'
        shape = new fabric.Path(starPoints, {
          ...baseProps,
          scaleX: 0.8,
          scaleY: 0.8
        })
        break

      case 'heart':
        // Crear un corazón usando path
        const heartPath = 'M 50,30 C 50,25 45,20 40,20 C 30,20 25,30 25,35 C 25,50 50,65 50,65 C 50,65 75,50 75,35 C 75,30 70,20 60,20 C 55,20 50,25 50,30 Z'
        shape = new fabric.Path(heartPath, {
          ...baseProps,
          scaleX: 0.8,
          scaleY: 0.8
        })
        break

      case 'arrow':
        // Crear una flecha usando path
        const arrowPath = 'M 10,50 L 60,50 L 60,35 L 90,55 L 60,75 L 60,60 L 10,60 Z'
        shape = new fabric.Path(arrowPath, {
          ...baseProps,
          scaleX: 0.8,
          scaleY: 0.8
        })
        break

      case 'pentagon':
        // Crear un pentágono usando path
        const pentagonPath = 'M 50,10 L 90,35 L 75,85 L 25,85 L 10,35 Z'
        shape = new fabric.Path(pentagonPath, {
          ...baseProps,
          scaleX: 0.8,
          scaleY: 0.8
        })
        break

      case 'hexagon':
        // Crear un hexágono usando path
        const hexagonPath = 'M 50,10 L 85,30 L 85,70 L 50,90 L 15,70 L 15,30 Z'
        shape = new fabric.Path(hexagonPath, {
          ...baseProps,
          scaleX: 0.8,
          scaleY: 0.8
        })
        break

      case 'flower':
        // Crear una flor usando path
        const flowerPath = 'M 50,20 C 60,10 70,20 60,30 C 70,40 60,50 50,40 C 40,50 30,40 40,30 C 30,20 40,10 50,20 Z M 50,35 C 55,35 55,45 50,45 C 45,45 45,35 50,35 Z'
        shape = new fabric.Path(flowerPath, {
          ...baseProps,
          scaleX: 0.8,
          scaleY: 0.8
        })
        break

      case 'crown':
        // Crear una corona usando path
        const crownPath = 'M 20,50 L 30,30 L 40,45 L 50,25 L 60,45 L 70,30 L 80,50 L 75,60 L 25,60 Z'
        shape = new fabric.Path(crownPath, {
          ...baseProps,
          scaleX: 0.8,
          scaleY: 0.8
        })
        break

      case 'butterfly':
        // Crear una mariposa usando path
        const butterflyPath = 'M 50,20 L 45,30 C 30,25 20,35 25,50 C 20,65 35,70 45,60 L 50,70 L 55,60 C 65,70 80,65 75,50 C 80,35 70,25 55,30 L 50,20 Z'
        shape = new fabric.Path(butterflyPath, {
          ...baseProps,
          scaleX: 0.8,
          scaleY: 0.8
        })
        break

      // Letras
      case 'letter-a':
        const letterA = new fabric.Text('A', {
          ...baseProps,
          fontSize: 60,
          fontFamily: 'Arial Black',
          fontWeight: 'bold'
        })
        shape = letterA
        break

      case 'letter-b':
        const letterB = new fabric.Text('B', {
          ...baseProps,
          fontSize: 60,
          fontFamily: 'Arial Black',
          fontWeight: 'bold'
        })
        shape = letterB
        break

      case 'ampersand':
        const ampersand = new fabric.Text('&', {
          ...baseProps,
          fontSize: 60,
          fontFamily: 'Times New Roman',
          fontWeight: 'bold',
          fontStyle: 'italic'
        })
        shape = ampersand
        break

      case 'at-symbol':
        const atSymbol = new fabric.Text('@', {
          ...baseProps,
          fontSize: 60,
          fontFamily: 'Arial',
          fontWeight: 'bold'
        })
        shape = atSymbol
        break

      // Marcos
      case 'frame-circle':
        // Marco circular
        shape = new fabric.Circle({
          ...baseProps,
          radius: 50,
          fill: 'transparent',
          stroke: strokeColor,
          strokeWidth: 8
        })
        break

      case 'frame-rect':
        // Marco rectangular
        shape = new fabric.Rect({
          ...baseProps,
          width: 100,
          height: 80,
          fill: 'transparent',
          stroke: strokeColor,
          strokeWidth: 8
        })
        break

      case 'frame-ornate':
        // Marco ornamentado usando path
        const ornateFramePath = 'M 20,20 L 80,20 L 85,15 L 90,20 L 95,15 L 100,20 L 100,80 L 95,85 L 100,90 L 95,95 L 100,100 L 20,100 L 15,95 L 10,100 L 5,95 L 0,100 L 0,20 L 5,15 L 10,20 L 15,15 L 20,20 Z M 25,25 L 75,25 L 75,75 L 25,75 Z'
        shape = new fabric.Path(ornateFramePath, {
          ...baseProps,
          fill: 'transparent',
          stroke: strokeColor,
          strokeWidth: 3,
          scaleX: 0.8,
          scaleY: 0.8
        })
        break

      case 'frame-vintage':
        // Marco vintage usando círculos decorativos
        const vintage = new fabric.Group([
          new fabric.Rect({
            width: 100,
            height: 80,
            fill: 'transparent',
            stroke: strokeColor,
            strokeWidth: 4,
            left: 0,
            top: 0
          }),
          new fabric.Circle({
            radius: 3,
            fill: strokeColor,
            left: -3,
            top: -3
          }),
          new fabric.Circle({
            radius: 3,
            fill: strokeColor,
            left: 97,
            top: -3
          }),
          new fabric.Circle({
            radius: 3,
            fill: strokeColor,
            left: -3,
            top: 77
          }),
          new fabric.Circle({
            radius: 3,
            fill: strokeColor,
            left: 97,
            top: 77
          })
        ])
        vintage.set(baseProps)
        shape = vintage
        break

      // Naturaleza
      case 'leaf':
        // Hoja usando path
        const leafPath = 'M 50,10 C 70,20 80,50 60,80 C 50,85 45,80 50,70 C 30,50 40,20 50,10 Z'
        shape = new fabric.Path(leafPath, {
          ...baseProps,
          scaleX: 0.8,
          scaleY: 0.8
        })
        break

      case 'tree':
        // Árbol usando group
        const tree = new fabric.Group([
          // Tronco
          new fabric.Rect({
            width: 20,
            height: 40,
            fill: '#8B4513',
            left: 40,
            top: 50
          }),
          // Copa
          new fabric.Circle({
            radius: 30,
            fill: '#228B22',
            left: 20,
            top: 20
          })
        ])
        tree.set(baseProps)
        shape = tree
        break

      case 'flower-sun':
        // Girasol usando círculos
        const sunflower = new fabric.Group([
          // Pétalos
          ...Array.from({length: 8}, (_, i) => {
            const angle = (i * 45) * Math.PI / 180
            const x = 50 + Math.cos(angle) * 25
            const y = 50 + Math.sin(angle) * 25
            return new fabric.Ellipse({
              rx: 8,
              ry: 15,
              fill: '#FFD700',
              left: x - 8,
              top: y - 15,
              angle: i * 45
            })
          }),
          // Centro
          new fabric.Circle({
            radius: 15,
            fill: '#8B4513',
            left: 35,
            top: 35
          })
        ])
        sunflower.set(baseProps)
        shape = sunflower
        break

      case 'mountain':
        // Montaña usando path
        const mountainPath = 'M 10,80 L 30,40 L 50,20 L 70,35 L 90,80 Z'
        shape = new fabric.Path(mountainPath, {
          ...baseProps,
          scaleX: 0.8,
          scaleY: 0.8
        })
        break

      default:
        // Para formas no implementadas, crear un rectángulo
        shape = new fabric.Rect({
          ...baseProps,
          width: 100,
          height: 100
        })
        break
    }

    canvas.add(shape)
    canvas.setActiveObject(shape)
    setSelectedObject(shape)
    updateObjectProperties(shape)
    canvas.renderAll()
  }

  const addImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !activePrintArea) {
      toast.error('Selecciona un área de impresión primero')
      return
    }
    
    // Si no está permitida la personalización (modo admin), permitir todo
    if (!allowPersonalization) {
      // Modo admin - sin restricciones
    } else {
      // Modo usuario - solo dentro del área activa
      if (!activePrintArea.allowImages) {
        toast.error('No se permite agregar imágenes en esta área')
        return
      }
    }

    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen')
      return
    }

    // Validar formato de archivo según templateSettings
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
    
    if (!formatKey || !templateSettings.allowedImageFormats[formatKey]) {
      const allowedFormats = Object.entries(templateSettings.allowedImageFormats)
        .filter(([_, allowed]) => allowed)
        .map(([format, _]) => format.toUpperCase())
        .join(', ')
      
      toast.error(`Formato no permitido. Formatos permitidos: ${allowedFormats}`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      
      if (!isFabricReady()) return
      
      fabric.Image.fromURL(result, (img: any) => {
        // Obtener coordenadas correctas del área activa
        const areaCoords = getAreaCoordinates(canvas, activePrintArea)
        if (!areaCoords) {
          toast.error('No se pueden calcular las coordenadas del área')
          return
        }

        // Calcular el tamaño máximo permitido dentro del área de impresión
        const maxWidth = areaCoords.width * 0.8 // 80% del ancho del área
        const maxHeight = areaCoords.height * 0.8 // 80% del alto del área
        
        // Obtener dimensiones originales de la imagen
        const originalWidth = img.width
        const originalHeight = img.height
        
        // Calcular la escala para ajustarse al área manteniendo proporción
        const scaleX = maxWidth / originalWidth
        const scaleY = maxHeight / originalHeight
        const scale = Math.min(scaleX, scaleY) // Usar la escala menor para mantener proporción
        
        // Centrar la imagen en el área de impresión
        const scaledWidth = originalWidth * scale
        const scaledHeight = originalHeight * scale
        const left = areaCoords.x + (areaCoords.width - scaledWidth) / 2
        const top = areaCoords.y + (areaCoords.height - scaledHeight) / 2
        
        img.set({
          left: left,
          top: top,
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          opacity: 1,
          customName: file.name.replace(/\.[^/.]+$/, "") // Usar nombre del archivo sin extensión
        })

        canvas.add(img)
        canvas.setActiveObject(img)
        setSelectedObject(img)
        updateObjectProperties(img)
        canvas.renderAll()
      })
    }
    reader.readAsDataURL(file)
  }

  const addImageFromLibrary = (image: any) => {
    if (!canvas || !activePrintArea) {
      toast.error('Selecciona un área de impresión primero')
      return
    }
    
    // Verificar límite de imágenes
    const currentImageCount = canvasElements.filter(el => el.type === 'image').length
    if (currentImageCount >= templateSettings.maxImages) {
      toast.error(`No se pueden agregar más imágenes. Límite máximo: ${templateSettings.maxImages}`)
      return
    }
    
    // Si no está permitida la personalización (modo admin), permitir todo
    if (!allowPersonalization) {
      // Modo admin - sin restricciones
    } else {
      // Modo usuario - solo dentro del área activa
      if (!activePrintArea.allowImages) {
        toast.error('No se permite agregar imágenes en esta área')
        return
      }
    }

    if (!isFabricReady()) return

    const absoluteUrl = image.fileUrl.startsWith('http') ? image.fileUrl : `${window.location.origin}${image.fileUrl}`
    fabric.Image.fromURL(absoluteUrl, (img: any) => {
      if (!img || !canvas) return

      const areaCoords = getAreaCoordinates(canvas, activePrintArea)
      if (!areaCoords) return

      // Calcular escala para que la imagen se ajuste al área
      const maxWidth = allowPersonalization ? areaCoords.width * 0.8 : 300
      const maxHeight = allowPersonalization ? areaCoords.height * 0.8 : 300
      
      const scaleX = maxWidth / img.width
      const scaleY = maxHeight / img.height
      const scale = Math.min(scaleX, scaleY, 1)

      // Centrar en el área activa
      const left = allowPersonalization ? 
        areaCoords.x + (areaCoords.width - img.width * scale) / 2 :
        canvas.width / 2 - (img.width * scale) / 2
        
      const top = allowPersonalization ?
        areaCoords.y + (areaCoords.height - img.height * scale) / 2 :
        canvas.height / 2 - (img.height * scale) / 2

      img.set({
        left: left,
        top: top,
        scaleX: scale,
        scaleY: scale,
        selectable: true,
        opacity: 1,
        customName: image.name // Guardar el nombre de la imagen de galería
      })

      canvas.add(img)
      canvas.setActiveObject(img)
      setSelectedObject(img)
      updateObjectProperties(img)
      canvas.renderAll()
      
      setShowImageLibrary(false)
      toast.success(`Imagen "${image.name}" añadida al diseño`)
    })
  }

  const addShapeFromLibrary = (shape: any) => {
    if (!canvas || !activePrintArea) {
      toast.error('Selecciona un área de impresión primero')
      return
    }
    
    // Si no está permitida la personalización (modo admin), permitir todo
    if (!allowPersonalization) {
      // Modo admin - sin restricciones
    } else {
      // Modo usuario - solo dentro del área activa
      if (!activePrintArea.allowShapes) {
        toast.error('No se permite agregar formas en esta área')
        return
      }
    }

    const absoluteUrl = shape.fileUrl.startsWith('http') ? shape.fileUrl : `${window.location.origin}${shape.fileUrl}`
    
    if (!isFabricReady()) return

    if (shape.fileType === 'image/svg+xml') {
      // Load SVG shape
      
      fabric.loadSVGFromURL(absoluteUrl, (objects: any[], options: any) => {
        if (!objects || objects.length === 0 || !canvas) return

        if (!fabric.util || !fabric.util.groupSVGElements) {
          console.error('fabric.util.groupSVGElements not available')
          toast.error('Error: Función de Fabric.js no disponible')
          return
        }

        const obj = fabric.util.groupSVGElements(objects, options)
        if (!obj) return

        const areaCoords = getAreaCoordinates(canvas, activePrintArea)
        if (!areaCoords) return

        // Calculate scale to fit the shape in the area
        const maxWidth = allowPersonalization ? areaCoords.width * 0.3 : 100
        const maxHeight = allowPersonalization ? areaCoords.height * 0.3 : 100
        
        const scaleX = maxWidth / obj.width
        const scaleY = maxHeight / obj.height
        const scale = Math.min(scaleX, scaleY, 1)

        // Center in the active area
        const left = allowPersonalization ? 
          areaCoords.x + (areaCoords.width - obj.width * scale) / 2 :
          canvas.width / 2 - (obj.width * scale) / 2
          
        const top = allowPersonalization ?
          areaCoords.y + (areaCoords.height - obj.height * scale) / 2 :
          canvas.height / 2 - (obj.height * scale) / 2

        obj.set({
          left: left,
          top: top,
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          opacity: 1,
          fill: shapeColor,
          stroke: strokeColor, // Agregar borde por defecto
          strokeWidth: Math.max(strokeWidth || 1, 1), // Asegurar mínimo 1px de borde
          originalFill: shapeColor, // Guardar el fill original
          customName: shape.name, // Guardar el nombre de la forma
          canBeMask: true, // Propiedades de máscara - TEMPORAL: todas las formas pueden ser máscara
          isMask: false,
          maskImageSrc: null,
          maskImageX: 0,
          maskImageY: 0,
          maskImageScale: 1
        })

        canvas.add(obj)
        canvas.setActiveObject(obj)
        setSelectedObject(obj)
        updateObjectProperties(obj)
        canvas.renderAll()
        
        setShowShapesLibrary(false)
        toast.success(`Forma "${shape.name}" añadida al diseño`)
      })
    } else {
      // Load as image for non-SVG shapes
      fabric.Image.fromURL(absoluteUrl, (img: any) => {
        if (!img || !canvas) return

        const areaCoords = getAreaCoordinates(canvas, activePrintArea)
        if (!areaCoords) return

        // Calculate scale to fit the shape in the area
        const maxWidth = allowPersonalization ? areaCoords.width * 0.3 : 100
        const maxHeight = allowPersonalization ? areaCoords.height * 0.3 : 100
        
        const scaleX = maxWidth / img.width
        const scaleY = maxHeight / img.height
        const scale = Math.min(scaleX, scaleY, 1)

        // Center in the active area
        const left = allowPersonalization ? 
          areaCoords.x + (areaCoords.width - img.width * scale) / 2 :
          canvas.width / 2 - (img.width * scale) / 2
          
        const top = allowPersonalization ?
          areaCoords.y + (areaCoords.height - img.height * scale) / 2 :
          canvas.height / 2 - (img.height * scale) / 2

        img.set({
          left: left,
          top: top,
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          opacity: 1,
          originalFill: null, // Para imágenes no hay fill original
          customName: shape.name, // Guardar el nombre de la forma
          canBeMask: true, // Propiedades de máscara - TEMPORAL: todas las formas pueden ser máscara
          isMask: false,
          maskImageSrc: null,
          maskImageX: 0,
          maskImageY: 0,
          maskImageScale: 1
        })

        canvas.add(img)
        canvas.setActiveObject(img)
        setSelectedObject(img)
        updateObjectProperties(img)
        canvas.renderAll()
        
        setShowShapesLibrary(false)
        toast.success(`Forma "${shape.name}" añadida al diseño`)
      })
    }
  }

  // Object manipulation
  const updateSelectedObject = (property: string, value: any, skipMaskLogic: boolean = false) => {
    if (!selectedObject || !canvas) return

    selectedObject.set(property, value)
    
    // Skip mask logic if this is just a regular property update (like transparency toggle)
    if (!skipMaskLogic) {
      // Si se está activando la máscara, hacer el fill transparente y preparar para imagen
      if (property === 'isMask' && value === true) {
        console.log('🎭 Habilitando máscara - configurando objeto')
        selectedObject.set({
          fill: selectedObject.maskImageSrc ? selectedObject.fill : 'transparent',
          stroke: selectedObject.stroke || 'rgba(0,0,0,0.5)',
          strokeWidth: selectedObject.strokeWidth || 2
        })
        
        // Si ya hay imagen, aplicar máscara
        if (selectedObject.maskImageSrc) {
          console.log('🖼️ Ya hay imagen, aplicando máscara')
          applyMaskToObject(selectedObject)
        } else {
          // Si no hay imagen, añadir icono de placeholder
          console.log('📷 No hay imagen, añadiendo placeholder')
          addMaskPlaceholderIcon(selectedObject)
        }
      }
      
      // Si se está desactivando la máscara, restaurar el fill original
      if (property === 'isMask' && value === false) {
        selectedObject.set({
          fill: selectedObject.originalFill || '#000000'
        })
        // Remover icono de placeholder si existe
        removeMaskPlaceholderIcon(selectedObject)
      }
      
      // Si se está actualizando una propiedad de máscara y la máscara está activa
      if (['maskImageSrc', 'maskImageX', 'maskImageY', 'maskImageScale'].includes(property) && selectedObject.isMask) {
        if (property === 'maskImageSrc' && value === null) {
          // Si se está eliminando la imagen, restaurar fill transparente
          console.log('Eliminando imagen de máscara, restaurando fill transparente')
          selectedObject.set({
            fill: 'transparent',
            stroke: selectedObject.stroke || 'rgba(0,0,0,0.5)',
            strokeWidth: selectedObject.strokeWidth || 2
          })
          // Remover placeholder anterior si existe
          removeMaskPlaceholderIcon(selectedObject)
        } else {
          // Limpiar cualquier imagen temporal antes de aplicar la máscara
          cleanupTemporaryImages(canvas)
          // Aplicar máscara normalmente
          applyMaskToObject(selectedObject)
        }
      }
    }
    
    canvas.renderAll()
    
    // Update local state
    updateObjectProperties(selectedObject)
  }

  // Función para limpiar imágenes temporales del canvas
  const cleanupTemporaryImages = (fabricCanvas: any) => {
    if (!fabricCanvas) return
    
    const tempImages = fabricCanvas.getObjects().filter((obj: any) => 
      obj.id && (obj.id.includes('movable-image') || obj.excludeFromExport)
    )
    
    if (tempImages.length > 0) {
      console.log(`🧹 Limpiando ${tempImages.length} imágenes temporales`)
      tempImages.forEach((img: any) => {
        fabricCanvas.remove(img)
      })
      fabricCanvas.renderAll()
    }
  }

  // Función para aplicar máscara a un objeto de Fabric.js
  const applyMaskToObject = (obj: any) => {
    if (!obj.isMask || !obj.maskImageSrc) {
      console.log('No aplicando máscara - isMask:', obj.isMask, 'maskImageSrc:', !!obj.maskImageSrc)
      return
    }

    if (!isFabricReady()) return

    console.log('Aplicando máscara a objeto:', obj.type, 'con imagen:', obj.maskImageSrc)

    // Cargar la imagen de la máscara
    fabric.Image.fromURL(obj.maskImageSrc, (maskImg: any) => {
      if (!maskImg) {
        console.error('No se pudo cargar la imagen de máscara')
        return
      }

      console.log('Imagen de máscara cargada:', maskImg.width, 'x', maskImg.height)

      // Configurar la imagen de máscara
      const scale = obj.maskImageScale || 1
      const offsetX = obj.maskImageX || 0
      const offsetY = obj.maskImageY || 0
      
      // Si es la primera vez que se aplica la imagen (offsets están en 0 Y la escala es 1), centrar automáticamente
      // Solo aplicar centrado automático en la primera carga, no en cambios de escala posteriores
      const isFirstApplication = offsetX === 0 && offsetY === 0 && scale === 1 && !obj.maskImageWasInitialized
      if (isFirstApplication) {
        console.log('🎯 Primera aplicación de imagen - centrando automáticamente')
        
        // Marcar que la imagen ha sido inicializada
        obj.maskImageWasInitialized = true
        
        console.log('🎯 Imagen centrada automáticamente - primera carga:', {
          finalOffset: { x: 0, y: 0 },
          finalScale: 1
        })
      }

      // Actualizar los valores después del posible auto-ajuste
      const finalScale = obj.maskImageScale || 1
      const finalOffsetX = obj.maskImageX || 0
      const finalOffsetY = obj.maskImageY || 0
      
      console.log('🎯 Configuración final de máscara:', {
        originalImageSize: { width: maskImg.width, height: maskImg.height },
        scale: finalScale,
        offset: { x: finalOffsetX, y: finalOffsetY },
        wasFirstApplication: offsetX === 0 && offsetY === 0
      })

      // Obtener las dimensiones del objeto (usar dimensiones directas mejor que bounding rect)
      const objWidth = obj.width * (obj.scaleX || 1)
      const objHeight = obj.height * (obj.scaleY || 1)
      
      console.log('Dimensiones del objeto calculadas:', {
        directSize: { width: objWidth, height: objHeight },
        objectProps: { width: obj.width, height: obj.height, scaleX: obj.scaleX, scaleY: obj.scaleY }
      })
      
      // Calcular el tamaño de la imagen escalada con la escala final
      const scaledWidth = maskImg.width * finalScale
      const scaledHeight = maskImg.height * finalScale
      
      // Crear canvas temporal para el patrón con dimensiones del objeto
      // Para evitar problemas de escalado, usar dimensiones fijas más grandes que permitan centrado
      const patternCanvas = document.createElement('canvas')
      const ctx = patternCanvas.getContext('2d')
      
      // Usar las dimensiones calculadas del objeto o un fallback
      const canvasWidth = objWidth || 200
      const canvasHeight = objHeight || 200
      
      patternCanvas.width = canvasWidth
      patternCanvas.height = canvasHeight
      
      if (ctx) {
        // Limpiar canvas
        ctx.clearRect(0, 0, patternCanvas.width, patternCanvas.height)
        
        // Centrar la imagen perfectamente en el canvas del patrón
        // El centro del canvas debe coincidir exactamente con el centro de la imagen
        const canvasCenterX = canvasWidth / 2
        const canvasCenterY = canvasHeight / 2
        
        // Calcular posición de imagen para mantener centrado durante escalado
        // El punto de referencia siempre debe ser el centro de la forma
        let imgX, imgY
        
        if (finalOffsetX === 0 && finalOffsetY === 0) {
          // Imagen centrada: siempre debe estar en el centro del canvas
          imgX = canvasCenterX - (scaledWidth / 2)
          imgY = canvasCenterY - (scaledHeight / 2)
        } else {
          // Imagen desplazada: mantener la posición relativa pero desde el centro
          imgX = canvasCenterX - (scaledWidth / 2) + finalOffsetX
          imgY = canvasCenterY - (scaledHeight / 2) + finalOffsetY
        }
        
        // Verificar centrado perfecto
        const imageCenterX = imgX + (scaledWidth / 2)
        const imageCenterY = imgY + (scaledHeight / 2)
        const isPerfectlyCentered = (
          Math.abs(imageCenterX - canvasCenterX) < 1 && 
          Math.abs(imageCenterY - canvasCenterY) < 1
        )
        
        console.log('🖼️ Posición de imagen calculada:', {
          patternSize: { width: patternCanvas.width, height: patternCanvas.height },
          scaledSize: { width: scaledWidth, height: scaledHeight },
          canvasCenter: { x: canvasCenterX, y: canvasCenterY },
          imageCenter: { x: imageCenterX, y: imageCenterY },
          position: { x: imgX, y: imgY },
          offset: { x: finalOffsetX, y: finalOffsetY },
          scale: finalScale,
          isPerfectlyCentered: isPerfectlyCentered,
          centeringError: { 
            x: Math.abs(imageCenterX - canvasCenterX), 
            y: Math.abs(imageCenterY - canvasCenterY) 
          },
          imageWillBeVisible: scaledWidth > 0 && scaledHeight > 0 && finalScale > 0
        })
        
        // Verificar que las dimensiones sean válidas antes de dibujar
        if (scaledWidth > 0 && scaledHeight > 0) {
          ctx.drawImage(maskImg.getElement(), imgX, imgY, scaledWidth, scaledHeight)
          console.log('✅ Imagen dibujada exitosamente en el canvas del patrón')
          
          if (isPerfectlyCentered) {
            console.log('✅ ¡CENTRADO PERFECTO! La imagen está perfectamente centrada')
          } else {
            console.log('⚠️ Centrado no perfecto, error de centrado:', {
              x: Math.abs(imageCenterX - canvasCenterX), 
              y: Math.abs(imageCenterY - canvasCenterY)
            })
          }
        } else {
          console.error('❌ Error: Dimensiones de imagen inválidas:', { scaledWidth, scaledHeight })
          return
        }
        
        // Crear patrón con offsets para centrar correctamente durante escalado
        // Solo usar offsets del patrón cuando la imagen está desplazada del centro
        const patternOffsetX = (finalOffsetX === 0 && finalOffsetY === 0) ? 0 : finalOffsetX
        const patternOffsetY = (finalOffsetX === 0 && finalOffsetY === 0) ? 0 : finalOffsetY
        
        const pattern = new fabric.Pattern({
          source: patternCanvas,
          repeat: 'no-repeat',
          offsetX: patternOffsetX,
          offsetY: patternOffsetY
        })
        
        console.log('🎯 Patrón con offsets de centrado:', {
          patternOffsets: { x: patternOffsetX, y: patternOffsetY },
          finalOffsets: { x: finalOffsetX, y: finalOffsetY },
          imageScale: finalScale,
          imageDimensions: { width: scaledWidth, height: scaledHeight },
          canvasDimensions: { width: canvasWidth, height: canvasHeight },
          imagePosition: { x: imgX, y: imgY },
          imageCenter: { x: imgX + scaledWidth/2, y: imgY + scaledHeight/2 },
          canvasCenter: { x: canvasCenterX, y: canvasCenterY },
          isImageCentered: finalOffsetX === 0 && finalOffsetY === 0
        })

        console.log('✅ Patrón creado exitosamente, aplicando al objeto...')

        // Aplicar el patrón al objeto
        if (obj.type === 'group') {
          // Para grupos SVG, aplicar a todos los paths
          const pathObjects = obj.getObjects()
          console.log(`📋 Aplicando patrón a grupo con ${pathObjects.length} elementos`)
          let appliedCount = 0
          pathObjects.forEach((pathObj: any) => {
            if (pathObj.type === 'path') {
              pathObj.set({
                fill: pattern,
                stroke: pathObj.stroke || 'rgba(0,0,0,0.5)',
                strokeWidth: pathObj.strokeWidth || 1
              })
              appliedCount++
            }
          })
          console.log(`✅ Patrón aplicado a ${appliedCount} paths del grupo`)
        } else {
          // Para formas simples
          console.log(`📋 Aplicando patrón a forma simple: ${obj.type}`)
          obj.set({
            fill: pattern,
            stroke: obj.stroke || 'rgba(0,0,0,0.5)',
            strokeWidth: obj.strokeWidth || 1
          })
          console.log('✅ Patrón aplicado a forma simple')
        }

        console.log('✅ Máscara aplicada correctamente - Refrescando canvas...')
        // Remover icono de placeholder si existe
        removeMaskPlaceholderIcon(obj)
        canvas.renderAll()
      }
    }, { crossOrigin: 'anonymous' })
  }

  // Función para añadir icono de placeholder en formas con máscara sin imagen
  const addMaskPlaceholderIcon = (obj: any) => {
    if (!canvas || obj.maskPlaceholderId) {
      console.log('❌ No se puede añadir placeholder:', {
        hasCanvas: !!canvas,
        alreadyHasPlaceholder: !!obj.maskPlaceholderId
      })
      return // Ya tiene placeholder
    }

    console.log('✅ Añadiendo icono placeholder para máscara:', obj)
    
    const bounds = obj.getBoundingRect()
    const iconSize = Math.min(bounds.width * 0.4, bounds.height * 0.4, 50) // Tamaño máximo 50px
    
    // Crear fondo circular
    const background = new fabric.Circle({
      left: bounds.left + bounds.width / 2,
      top: bounds.top + bounds.height / 2,
      radius: iconSize / 2,
      fill: 'rgba(255, 255, 255, 0.9)',
      stroke: 'rgba(0, 0, 0, 0.3)',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      selectable: false,
      excludeFromExport: true,
      evented: true,
      opacity: 0.8
    })

    // Crear texto del icono de cámara (usar unicode)
    const cameraIcon = new fabric.Text('📷', {
      left: bounds.left + bounds.width / 2,
      top: bounds.top + bounds.height / 2 - iconSize * 0.1,
      fontSize: iconSize * 0.4,
      originX: 'center',
      originY: 'center',
      selectable: false,
      excludeFromExport: true,
      evented: true
    })

    // Crear texto "Imagen"
    const helpText = new fabric.Text('Imagen', {
      left: bounds.left + bounds.width / 2,
      top: bounds.top + bounds.height / 2 + iconSize * 0.2,
      fontSize: Math.min(iconSize * 0.2, 12),
      originX: 'center',
      originY: 'center',
      fill: 'rgba(0, 0, 0, 0.8)',
      fontFamily: 'Arial',
      selectable: false,
      excludeFromExport: true,
      evented: true
    })

    // Generar ID único para el placeholder
    const placeholderId = `mask-placeholder-${Date.now()}`
    background.set('id', placeholderId + '-bg')
    cameraIcon.set('id', placeholderId + '-icon')
    helpText.set('id', placeholderId + '-text')
    
    obj.maskPlaceholderId = placeholderId

    // Añadir elementos al canvas por separado
    canvas.add(background)
    canvas.add(cameraIcon)
    canvas.add(helpText)
    canvas.renderAll()

    console.log('Icono placeholder añadido correctamente')

    // Hacer que los elementos sean clickeables para cargar imagen
    const handleClick = () => {
      console.log('Clic en placeholder, abriendo selector de archivos')
      // Seleccionar el objeto original para que updateSelectedObject funcione
      canvas.setActiveObject(obj)
      setSelectedObject(obj)
      
      // Simular clic en el input de imagen
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = 'image/*'
      fileInput.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const imageData = event.target?.result as string
            
            // Resetear propiedades de posición y escala para forzar centrado automático
            updateSelectedObject('maskImageX', 0)
            updateSelectedObject('maskImageY', 0)
            updateSelectedObject('maskImageScale', 1)
            
            // Limpiar flag de inicialización para permitir centrado automático
            if (obj.maskImageWasInitialized) {
              obj.maskImageWasInitialized = false
            }
            
            // Cargar la imagen (esto activará el centrado automático)
            updateSelectedObject('maskImageSrc', imageData)
            
            // Desactivar selección después de cargar la imagen
            setTimeout(() => {
              canvas.discardActiveObject()
              setSelectedObject(null)
              canvas.renderAll()
            }, 100)
            
            toast.success('Imagen cargada y centrada automáticamente en la máscara')
          }
          reader.readAsDataURL(file)
        }
      }
      fileInput.click()
    }
    
    background.on('mousedown', handleClick)
    cameraIcon.on('mousedown', handleClick)
    helpText.on('mousedown', handleClick)
  }


  // Función para remover icono de placeholder
  const removeMaskPlaceholderIcon = (obj: any) => {
    if (!canvas || !obj.maskPlaceholderId) return

    console.log('Removiendo icono placeholder')
    
    const placeholderId = obj.maskPlaceholderId
    const objectsToRemove = canvas.getObjects().filter((o: any) => 
      o.id && o.id.startsWith(placeholderId)
    )
    
    objectsToRemove.forEach((placeholder: any) => {
      safeCanvasRemove(canvas, placeholder)
    })
    
    if (objectsToRemove.length > 0) {
      canvas.renderAll()
      console.log(`Removidos ${objectsToRemove.length} elementos del placeholder`)
    }
    
    obj.maskPlaceholderId = null
  }

  const deleteSelected = () => {
    if (!selectedObject || !canvas) return
    
    // Si el objeto tiene un icono de máscara, eliminarlo primero
    if (selectedObject.maskPlaceholderId) {
      removeMaskPlaceholderIcon(selectedObject)
    }
    
    if (safeCanvasRemove(canvas, selectedObject)) {
      setSelectedObject(null)
    }
  }


  const moveLayerToTop = (element: any) => {
    if (!canvas) return
    
    const canvasObject = canvas.getObjects().find((obj: any) => obj.id === element.id)
    if (!canvasObject) return
    
    canvas.bringToFront(canvasObject)
    canvas.renderAll()
    updateCanvasElements()
    toast.success('Capa movida al frente')
  }

  const moveLayerToBottom = (element: any) => {
    if (!canvas) return
    
    const canvasObject = canvas.getObjects().find((obj: any) => obj.id === element.id)
    if (!canvasObject) return
    
    canvas.sendToBack(canvasObject)
    canvas.renderAll()
    updateCanvasElements()
    toast.success('Capa movida al fondo')
  }

  // Drag & Drop handlers for reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedElementIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', 'dragging')
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)
    
    if (draggedElementIndex === null || draggedElementIndex === dropIndex) {
      setDraggedElementIndex(null)
      return
    }

    if (!canvas) return

    const objects = canvas.getObjects()
    const draggedObject = objects[draggedElementIndex]
    
    if (!draggedObject) return

    // Remove dragged object from its current position
    safeCanvasRemove(canvas, draggedObject)
    
    // Insert at new position
    const insertIndex = dropIndex > draggedElementIndex ? dropIndex - 1 : dropIndex
    canvas.insertAt(draggedObject, insertIndex)
    
    canvas.renderAll()
    updateCanvasElements()
    setDraggedElementIndex(null)
    
    toast.success('Orden de capas actualizado')
  }

  const handleDragEnd = () => {
    setDraggedElementIndex(null)
    setDragOverIndex(null)
  }

  const copySelected = () => {
    if (!selectedObject) return
    
    selectedObject.clone((cloned: any) => {
      cloned.set({
        left: selectedObject.left + 10,
        top: selectedObject.top + 10
      })
      canvas.add(cloned)
      canvas.setActiveObject(cloned)
    })
  }

  const centerSelected = () => {
    if (!selectedObject || !canvas) return
    
    // Buscar área de impresión
    const availableAreas = activeSide?.printAreas || []
    const areaToUse = activePrintArea || (availableAreas.length > 0 ? availableAreas[0] : null)
    
    if (!areaToUse) {
      toast.error('No hay área de impresión disponible')
      return
    }
    
    const areaCoords = getAreaCoordinates(canvas, areaToUse)
    if (!areaCoords) return
    
    // Calcular centro del área
    const areaCenterX = areaCoords.x + areaCoords.width / 2
    const areaCenterY = areaCoords.y + areaCoords.height / 2
    
    // Obtener dimensiones del objeto
    const objBounds = selectedObject.getBoundingRect()
    
    // Calcular nueva posición para centrar
    const newLeft = areaCenterX - (objBounds.width / 2) + (selectedObject.left - objBounds.left)
    const newTop = areaCenterY - (objBounds.height / 2) + (selectedObject.top - objBounds.top)
    
    // Aplicar nueva posición
    selectedObject.set({
      left: newLeft,
      top: newTop
    })
    
    selectedObject.setCoords()
    canvas.renderAll()
    
    toast.success('Elemento centrado en el área')
  }

  // Image specific functions
  const replaceImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedObject || selectedObject.type !== 'image' || !canvas) return
    
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      
      if (!isFabricReady()) return
      
      fabric.Image.fromURL(result, (newImg: any) => {
        // Mantener la posición y escala actual
        const currentLeft = selectedObject.left
        const currentTop = selectedObject.top
        const currentScaleX = selectedObject.scaleX
        const currentScaleY = selectedObject.scaleY
        
        newImg.set({
          left: currentLeft,
          top: currentTop,
          scaleX: currentScaleX,
          scaleY: currentScaleY,
          selectable: true,
          opacity: 1
        })

        // Remover la imagen anterior y agregar la nueva
        safeCanvasRemove(canvas, selectedObject)
        canvas.add(newImg)
        canvas.setActiveObject(newImg)
        setSelectedObject(newImg)
        updateObjectProperties(newImg)
        canvas.renderAll()
      })
    }
    reader.readAsDataURL(file)
    
    // Reset the input
    event.target.value = ''
  }

  const updateImageDimensions = (width: number, height: number) => {
    if (!selectedObject || selectedObject.type !== 'image' || !canvas) return
    
    const scaleX = width / selectedObject.width
    const scaleY = height / selectedObject.height
    
    selectedObject.set({
      scaleX: scaleX,
      scaleY: scaleY
    })
    
    canvas.renderAll()
    updateObjectProperties(selectedObject)
  }


  const undo = () => {
    if (!canvas || historyIndex <= 0 || !canvasHistory[historyIndex - 1]) return
    
    const prevState = canvasHistory[historyIndex - 1]
    if (!prevState || !prevState.objects) return
    
    canvas.loadFromJSON({ objects: prevState.objects }, () => {
      if (prevState.zoom) {
        const zoomValue = prevState.zoom
        const canvasCenter = {
          x: canvas.width / 2,
          y: canvas.height / 2
        }
        canvas.zoomToPoint(canvasCenter, zoomValue)
        setZoom(zoomValue * 100)
      }
      if (prevState.viewportTransform) canvas.setViewportTransform(prevState.viewportTransform)
      canvas.renderAll()
    })
    setHistoryIndex(prev => prev - 1)
  }

  const redo = () => {
    if (!canvas || historyIndex >= canvasHistory.length - 1 || !canvasHistory[historyIndex + 1]) return
    
    const nextState = canvasHistory[historyIndex + 1]
    if (!nextState || !nextState.objects) return
    
    canvas.loadFromJSON({ objects: nextState.objects }, () => {
      if (nextState.zoom) {
        const zoomValue = nextState.zoom
        const canvasCenter = {
          x: canvas.width / 2,
          y: canvas.height / 2
        }
        canvas.zoomToPoint(canvasCenter, zoomValue)
        setZoom(zoomValue * 100)
      }
      if (nextState.viewportTransform) canvas.setViewportTransform(nextState.viewportTransform)
      canvas.renderAll()
    })
    setHistoryIndex(prev => prev + 1)
  }

  const handleZoom = (newZoom: number) => {
    if (!canvas) return
    
    const zoom = newZoom / 100
    
    // Obtener el punto central del canvas para mantenerlo centrado durante el zoom
    const canvasCenter = {
      x: canvas.width / 2,
      y: canvas.height / 2
    }
    
    // Aplicar zoom desde el centro del canvas
    canvas.zoomToPoint(canvasCenter, zoom)
    
    // Opcional: Centrar la vista después del zoom para asegurar que la imagen esté visible
    canvas.centerObject = canvas.centerObject || (() => {})
    
    canvas.renderAll()
    setZoom(newZoom)
  }

  const handleSave = () => {
    if (!canvas) return
    
    const designData = {
      productId,
      sideId: activeSide?.id,
      canvasData: canvas.toJSON(),
      timestamp: new Date().toISOString()
    }
    
    onSave(designData)
  }

  const loadDesign = (fabricCanvas: any, designData: any) => {
    if (designData.canvasData) {
      fabricCanvas.loadFromJSON(designData.canvasData, () => {
        fabricCanvas.renderAll()
      })
    }
  }

  // Export canvas as image
  const exportCanvas = () => {
    if (!canvas) return
    
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 2
    })
    
    const link = document.createElement('a')
    link.download = `diseño-${Date.now()}.png`
    link.href = dataURL
    link.click()
    
    toast.success('Diseño exportado como imagen')
  }

  // Save design function
  const saveDesign = () => {
    if (!canvas || !activeSide) {
      toast.error('No hay canvas o lado activo para guardar')
      return
    }
    
    const designData = {
      productId,
      sideId: activeSide?.id,
      canvasData: canvas.toJSON(),
      timestamp: new Date().toISOString()
    }
    
    onSave(designData)
    toast.success('Diseño guardado correctamente')
  }

  // PDF download function
  const handleDownloadPDF = async () => {
    if (!canvas || !activeSide) {
      toast.error('No hay canvas o lado activo para generar PDF')
      return
    }

    try {
      // Create a temporary canvas to capture the preview
      const tempCanvas = document.createElement('canvas')
      const ctx = tempCanvas.getContext('2d')
      if (!ctx) return

      // Set canvas size based on the current canvas
      tempCanvas.width = canvas.width
      tempCanvas.height = canvas.height

      // White background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

      // Draw current side image if exists
      const currentSideImage = activeSide?.image2D
      if (currentSideImage) {
        try {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = currentSideImage.startsWith('http') ? currentSideImage : `${window.location.origin}${currentSideImage}`
          })
          ctx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height)
        } catch (error) {
          console.warn('Could not load product image:', error)
        }
      }

      // Get canvas data as image
      const fabricCanvasData = canvas.toDataURL({
        format: 'png',
        quality: 1.0,
        multiplier: 1
      })

      // Draw the fabric canvas content on top
      const fabricImg = new Image()
      await new Promise((resolve, reject) => {
        fabricImg.onload = resolve
        fabricImg.onerror = reject
        fabricImg.src = fabricCanvasData
      })
      ctx.drawImage(fabricImg, 0, 0, tempCanvas.width, tempCanvas.height)

      // Convert canvas to PDF using jsPDF (dynamic load)
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({
        orientation: tempCanvas.width > tempCanvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [tempCanvas.width, tempCanvas.height]
      })

      // Convert canvas to image
      const imgData = tempCanvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, tempCanvas.width, tempCanvas.height)

      // Download PDF
      const fileName = `diseño_vista_previa_${Date.now()}.pdf`
      pdf.save(fileName)
      
      toast.success('PDF descargado correctamente')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Error al generar el PDF. Por favor, intenta de nuevo.')
    }
  }

  if (!fabricLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando editor visual...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
      {/* Hidden PDF download button */}
      <button 
        data-pdf-download
        onClick={handleDownloadPDF}
        style={{ display: 'none' }}
      />

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">

        <div className="w-px h-6 bg-gray-300 mr-4" />

        <div className="flex items-center gap-1">
          <button 
            onClick={undo}
            disabled={historyIndex <= 0}
            className={`p-2 rounded ${historyIndex <= 0 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200'}`} 
            title="Deshacer (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button 
            onClick={redo}
            disabled={historyIndex >= canvasHistory.length - 1}
            className={`p-2 rounded ${historyIndex >= canvasHistory.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200'}`} 
            title="Rehacer (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Zoom:</span>
          <button
            onClick={() => handleZoom(Math.max(10, zoom - 25))}
            className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            -
          </button>
          <span className="text-sm font-medium min-w-[3rem] text-center">
            {zoom}%
          </span>
          <button
            onClick={() => handleZoom(Math.min(500, zoom + 25))}
            className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            +
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* New Left Panel */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Direct Action Buttons - Vertical Layout */}
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-2">
              <button
                onClick={() => {
                  setActivePanel('design')
                  // Deseleccionar cualquier objeto seleccionado
                  if (canvas) {
                    canvas.discardActiveObject()
                    canvas.renderAll()
                  }
                  setSelectedObject(null)
                }}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                  activePanel === 'design'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 hover:shadow-md text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <Settings className="h-5 w-5 mr-3" />
                  <span className="font-medium">Diseño</span>
                </div>
              </button>
              
              {templateSettings.allowUserAddImage && (
                <button
                  onClick={handleDirectImageUpload}
                  className="w-full p-3 rounded-lg border-2 text-left border-gray-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 hover:shadow-md text-gray-700 transition-all duration-200"
                >
                  <div className="flex items-center">
                    <Upload className="h-5 w-5 mr-3" />
                    <span className="font-medium">Cargar</span>
                  </div>
                </button>
              )}
              
              {/* Botón de Plantillas - solo mostrar si hay plantillas disponibles y no se cargó una por defecto */}
              {!templateId && availableTemplates && (availableTemplates.optionalTemplates.length > 0) && (
                <button
                  onClick={() => setShowTemplateSelector(true)}
                  className="w-full p-3 rounded-lg border-2 text-left border-gray-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 hover:shadow-md text-gray-700 transition-all duration-200"
                >
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-3" />
                    <span className="font-medium">Plantillas ({availableTemplates.optionalTemplates.length})</span>
                  </div>
                </button>
              )}
              
              {hasLinkedImages && !templateSettings.disableSellerImageGallery && (
                <button
                  onClick={() => setShowImageLibrary(true)}
                  className="w-full p-3 rounded-lg border-2 text-left border-gray-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 hover:shadow-md text-gray-700 transition-all duration-200"
                >
                  <div className="flex items-center">
                    <ImageIcon className="h-5 w-5 mr-3" />
                    <span className="font-medium">Imágenes</span>
                  </div>
                </button>
              )}
              
              <button
                onClick={() => setShowShapesLibrary(true)}
                className="w-full p-3 rounded-lg border-2 text-left border-gray-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 hover:shadow-md text-gray-700 transition-all duration-200"
              >
                <div className="flex items-center">
                  <Shapes className="h-5 w-5 mr-3" />
                  <span className="font-medium">Formas</span>
                </div>
              </button>
              
              {templateSettings.allowUserAddText && (
                <button
                  onClick={handleDirectTextAdd}
                  className="w-full p-3 rounded-lg border-2 text-left border-gray-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 hover:shadow-md text-gray-700 transition-all duration-200"
                >
                  <div className="flex items-center">
                    <Type className="h-5 w-5 mr-3" />
                    <span className="font-medium">Texto</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Panel content for design mode will go here */}
          </div>

          {/* Espaciador para empujar el selector más abajo */}
          <div className="flex-1"></div>

          {/* Product Variants Selector - Encima del selector de lados */}
          {variants.length > 0 && (
            <div className="border-t border-gray-200 bg-white p-4 mb-0">
              {/* Mostrar rango de tallas */}
              <div className="mb-5">
                <div className="text-base text-gray-600 mb-3">Tallas disponibles:</div>
                <div className="text-base font-medium text-gray-900">
                  {(() => {
                    // Orden personalizado de tallas de menor a mayor
                    const sizeOrder = ['xs', 's', 'm', 'l', 'xl', 'xxl', '3xl']
                    const uniqueSizes = [...new Set(variants.map(v => v.size?.toLowerCase()))]
                    const sortedSizes = uniqueSizes.sort((a, b) => {
                      const indexA = sizeOrder.indexOf(a)
                      const indexB = sizeOrder.indexOf(b)
                      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
                    })
                    
                    if (sortedSizes.length === 0) return 'No disponible'
                    if (sortedSizes.length === 1) return sortedSizes[0].toUpperCase()
                    
                    return `${sortedSizes[0].toUpperCase()} - ${sortedSizes[sortedSizes.length - 1].toUpperCase()}`
                  })()}
                </div>
              </div>

              {/* Selector de colores */}
              <div>
                <div className="text-base text-gray-600 mb-3">Colores:</div>
                <div className="flex gap-3 flex-wrap">
                  {(() => {
                    // Agrupar variantes por color para evitar duplicados
                    const colorGroups = variants.reduce((acc, variant) => {
                      if (!acc[variant.colorHex]) {
                        acc[variant.colorHex] = variant
                      }
                      return acc
                    }, {} as Record<string, ProductVariant>)

                    return Object.values(colorGroups).map((variant) => (
                      <button
                        key={variant.colorHex}
                        onClick={() => setSelectedVariant(variant)}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                          selectedVariant?.colorHex === variant.colorHex 
                            ? 'border-orange-500 ring-2 ring-orange-200' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: variant.colorHex }}
                        title={variant.colorName}
                      />
                    ))
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Product Sides Selector - Fijo en la parte inferior del panel */}
          {sides.length > 0 && (
            <div className="border-t border-gray-200 bg-white p-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Lados del Producto
              </h4>
              <div className="flex gap-2">
                {sides.map((side) => (
                  <button
                    key={side.id}
                    onClick={() => {
                      setCurrentSide(side)
                      setActiveSide(side)
                      if (side.printAreas.length > 0) {
                        setActivePrintArea(side.printAreas[0])
                      }
                    }}
                    className={`relative flex-1 rounded border-2 transition-all ${
                      currentSide?.id === side.id 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {/* Side Image Preview - Más pequeño */}
                    <div className="aspect-square w-12 mx-auto mb-1 bg-gray-100 rounded overflow-hidden">
                      {(() => {
                        const imageUrl = getSideImageForVariant(side, selectedVariant)
                        return imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={side.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Square className="h-4 w-4" />
                          </div>
                        )
                      })()}
                    </div>
                    
                    {/* Side Name - Más pequeño */}
                    <div className="text-center pb-2">
                      <h5 className="text-xs font-medium text-gray-900">{side.name}</h5>
                    </div>
                    
                    {/* Active indicator */}
                    {currentSide?.id === side.id && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col bg-gray-100">
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
            <div 
              className="relative bg-white shadow-lg border border-gray-300"
              style={{ 
                maxWidth: 'calc(100vw - 400px)', 
                maxHeight: 'calc(100vh - 200px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
            >
              <canvas 
                ref={canvasRef} 
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  outline: 'none'
                }}
                onDragStart={(e) => e.preventDefault()}
              />
              
              {/* Grid overlay when not in preview */}
              {showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                />
              )}

              {/* Center Guidelines - Centradas en el panel de edición */}
              {activePrintArea && canvas && backgroundLoaded && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Vertical center line - centro del panel */}
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
                  {/* Horizontal center line - centro del panel */}
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
              )}
            </div>
          </div>
          
          {/* Area Status - Solo información del área activa */}
          {activePrintArea && (
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  Área activa: {activePrintArea.name}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Properties */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Propiedades</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {activePanel === 'design' && !selectedObject ? (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Elementos del diseño</h3>
                  <p className="text-sm text-gray-600">Gestiona los elementos que has añadido al canvas</p>
                </div>
                
                {canvasElements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No hay elementos en el diseño</p>
                    <p className="text-sm mt-1">Agrega texto, imágenes o formas para comenzar</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {canvasElements.map((element, index) => {
                      // Visual feedback for drag & drop
                      const showInsertionLine = draggedElementIndex !== null && dragOverIndex === index && draggedElementIndex !== index
                      const getElementIcon = () => {
                        // Si es una forma con máscara, mostrar icono de cámara junto al icono de forma
                        const getShapeIcon = () => {
                          switch (element.type) {
                            case 'text':
                            case 'i-text':
                              return <Type className="h-4 w-4" />
                            case 'image':
                              return <ImageIcon className="h-4 w-4" />
                            case 'rect':
                              return <Square className="h-4 w-4" />
                            case 'circle':
                              return <Circle className="h-4 w-4" />
                            case 'triangle':
                              return <Triangle className="h-4 w-4" />
                            case 'path':
                            case 'group':
                              // Detectar tipo de forma por nombre si es posible
                              const name = element.customName?.toLowerCase() || ''
                              if (name.includes('estrella') || name.includes('star')) {
                                return <Star className="h-4 w-4" />
                              } else if (name.includes('corazón') || name.includes('heart')) {
                                return <Heart className="h-4 w-4" />
                              } else if (name.includes('hexágono') || name.includes('hexagon')) {
                                return <Hexagon className="h-4 w-4" />
                              } else if (name.includes('pentágono') || name.includes('pentagon')) {
                                return <Pentagon className="h-4 w-4" />
                              }
                              return <Shapes className="h-4 w-4" />
                            default:
                              return <Square className="h-4 w-4" />
                          }
                        }
                        
                        // Si tiene máscara habilitada, mostrar icono compuesto
                        if (element.isMask) {
                          return (
                            <div className="flex items-center relative">
                              {getShapeIcon()}
                              <Camera className="h-3 w-3 absolute -top-1 -right-1 bg-white rounded-full p-0.5" />
                            </div>
                          )
                        }
                        
                        return getShapeIcon()
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

                      return (
                        <div key={element.id}>
                          {/* Insertion line */}
                          {showInsertionLine && (
                            <div className="h-0.5 bg-blue-400 mx-2 mb-2 rounded-full"></div>
                          )}
                          
                          <div
                            className={`border border-gray-200 rounded-lg p-3 hover:border-orange-300 transition-all cursor-pointer ${
                              draggedElementIndex === index ? 'opacity-50' : ''
                            } ${
                              dragOverIndex === index ? 'border-blue-400 bg-blue-50' : ''
                            }`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            onClick={() => selectElement(element)}
                          >
                          <div className="flex items-center gap-3">
                            {/* Drag Handle */}
                            <div className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
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
                                      onBlur={() => saveElementName(element.id)}
                                      className="flex-1 text-sm h-8 px-3 border-2 border-blue-500 bg-blue-50 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-200 rounded-md"
                                      autoFocus
                                      placeholder="Editar texto..."
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        saveElementName(element.id)
                                      }}
                                      className="p-1.5 hover:bg-green-100 text-green-600 rounded-md transition-colors"
                                      title="Guardar (Enter)"
                                    >
                                      <Check className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        cancelEditingElementName()
                                      }}
                                      className="p-1.5 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                                      title="Cancelar (Escape)"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div 
                                    className={`truncate ${(element.type === 'text' || element.type === 'i-text') ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-200 border border-transparent px-2 py-1 rounded-md transition-all' : ''}`}
                                    onClick={() => {
                                      if (element.type === 'text' || element.type === 'i-text') {
                                        startEditingElementName(element.id, element.name)
                                      }
                                    }}
                                    title={element.type === 'text' || element.type === 'i-text' ? '✏️ Clic para editar texto' : undefined}
                                  >
                                    {element.name}
                                    {(element.type === 'text' || element.type === 'i-text') && (
                                      <span className="ml-1 text-blue-500 opacity-50">✏️</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {element.type.toUpperCase()} • {pixelsToCm(element.width, true)}×{pixelsToCm(element.height, false)}cm
                              </div>
                              <div className="text-xs text-blue-600">
                                Píxeles: {Math.round(element.width)}×{Math.round(element.height)}px
                              </div>
                              <div className="text-xs text-blue-600">
                                Debug: Área {activePrintArea ? Math.round(activePrintArea.width) : 'N/A'}×{activePrintArea ? Math.round(activePrintArea.height) : 'N/A'}px | Real {activePrintArea?.realWidth || 'N/A'}×{activePrintArea?.realHeight || 'N/A'}cm | Factor {(() => {
                                  if (!activePrintArea?.realWidth || !activePrintArea?.realHeight) return 'N/A×N/A'
                                  const factorW = (activePrintArea.width / activePrintArea.realWidth).toFixed(2)
                                  const factorH = (activePrintArea.height / activePrintArea.realHeight).toFixed(2)
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
                                  if (element.object) {
                                    const newVisible = !element.visible
                                    element.object.set('visible', newVisible)
                                    canvas?.renderAll()
                                    updateCanvasElements()
                                  }
                                }}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title={element.visible ? "Ocultar" : "Mostrar"}
                              >
                                {element.visible ? (
                                  <Eye className="h-4 w-4 text-gray-600" />
                                ) : (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                )}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteElement(element)
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
                    })}
                    
                    {/* Clear All Button */}
                    <div className="pt-2 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (canvas && canvasElements.length > 0) {
                            canvasElements.forEach(element => {
                              if (element.object) {
                                safeCanvasRemove(canvas, element.object)
                              }
                            })
                            canvas.renderAll()
                            updateCanvasElements()
                          }
                        }}
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpiar todo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : selectedObject ? (
              <div className="space-y-4">
                {/* Object Type Info */}
                <div className="text-xs text-gray-500 mb-4">
                  {selectedObject.type === 'i-text' || selectedObject.type === 'text' ? 'Elemento de Texto' : 
                   selectedObject.type === 'image' ? 'Imagen' : 
                   selectedObject.type === 'rect' ? 'Rectángulo' :
                   selectedObject.type === 'circle' ? 'Círculo' :
                   selectedObject.type === 'triangle' ? 'Triángulo' : 'Elemento'}
                </div>

                {/* Text-specific properties */}
                {selectedObject && (selectedObject.type === 'text' || selectedObject.type === 'i-text') && (
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    
                    {/* 1. Texto (Text Content) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Texto</label>
                      <textarea
                        value={textContent}
                        onChange={(e) => {
                          setTextContent(e.target.value)
                          updateSelectedObject('text', e.target.value)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows={3}
                        placeholder="Nuevo texto"
                      />
                    </div>

                    {/* 2. Fuente (Font Family) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Fuente</label>
                      <Select value={fontFamily} onValueChange={(value) => {
                        setFontFamily(value)
                        updateSelectedObject('fontFamily', value)
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                          <SelectItem value="Verdana">Verdana</SelectItem>
                          <SelectItem value="Impact">Impact</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 3. Texto Arqueado (Curved Text) */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        Texto Arqueado
                      </label>
                    </div>

                    {/* 4. Estilo (Bold & Italic) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Estilo</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const newWeight = fontWeight === 'bold' ? 'normal' : 'bold'
                            setFontWeight(newWeight)
                            updateSelectedObject('fontWeight', newWeight)
                          }}
                          className={`px-3 py-2 rounded border text-sm font-bold flex items-center gap-2 ${
                            fontWeight === 'bold' 
                              ? 'bg-orange-100 border-orange-300 text-orange-700' 
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="font-bold">B</span>
                          Negrita
                        </button>
                        <button
                          onClick={() => {
                            const newStyle = fontStyle === 'italic' ? 'normal' : 'italic'
                            setFontStyle(newStyle)
                            updateSelectedObject('fontStyle', newStyle)
                          }}
                          className={`px-3 py-2 rounded border text-sm italic flex items-center gap-2 ${
                            fontStyle === 'italic' 
                              ? 'bg-orange-100 border-orange-300 text-orange-700' 
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="italic">I</span>
                          Cursiva
                        </button>
                      </div>
                    </div>

                    {/* 5. Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Color</label>
                      <div className="grid grid-cols-8 gap-1 mb-3">
                        {[
                          '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
                          '#800000', '#008000', '#000080', '#800080', '#808000', '#008080', '#C0C0C0', '#808080',
                          '#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'
                        ].map((color, index) => (
                          <button
                            key={`color-${index}-${color}`}
                            onClick={() => {
                              setTextColor(color)
                              updateSelectedObject('fill', color, true)
                            }}
                            className={`w-6 h-6 rounded border transition-all hover:scale-110 ${
                              textColor === color ? 'border-gray-900 shadow-md border-2' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => {
                          setTextColor(e.target.value)
                          updateSelectedObject('fill', e.target.value, true)
                        }}
                        className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                      />
                    </div>

                    {/* 6. Tamaño de fuente */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Tamaño de fuente</label>
                      <Select value={fontSize.toString()} onValueChange={(value) => {
                        const size = parseInt(value)
                        setFontSize(size)
                        updateSelectedObject('fontSize', size)
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-300 shadow-lg z-50 max-h-48 overflow-y-auto">
                          {Array.from({length: 100}, (_, i) => i + 8).map((size) => (
                            <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 7. Alineación Horizontal */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Alineación Horizontal</label>
                      <div className="grid grid-cols-4 gap-1">
                        <button
                          onClick={() => updateSelectedObject('textAlign', 'left')}
                          className={`p-2 rounded border text-sm ${
                            selectedObject.textAlign === 'left' 
                              ? 'bg-orange-100 border-orange-300 text-orange-700' 
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                          title="Izquierda"
                        >
                          ⬅
                        </button>
                        <button
                          onClick={() => updateSelectedObject('textAlign', 'center')}
                          className={`p-2 rounded border text-sm ${
                            selectedObject.textAlign === 'center' 
                              ? 'bg-orange-100 border-orange-300 text-orange-700' 
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                          title="Centro"
                        >
                          ↔
                        </button>
                        <button
                          onClick={() => updateSelectedObject('textAlign', 'right')}
                          className={`p-2 rounded border text-sm ${
                            selectedObject.textAlign === 'right' 
                              ? 'bg-orange-100 border-orange-300 text-orange-700' 
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                          title="Derecha"
                        >
                          ➡
                        </button>
                        <button
                          onClick={() => updateSelectedObject('textAlign', 'justify')}
                          className={`p-2 rounded border text-sm ${
                            selectedObject.textAlign === 'justify' 
                              ? 'bg-orange-100 border-orange-300 text-orange-700' 
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                          title="Justificado"
                        >
                          ⬌
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1 pt-4 border-t border-gray-200">
                      <Button size="sm" onClick={centerSelected} variant="outline" className="flex-1">
                        <Target className="h-4 w-4 mr-1" />
                        Centrar
                      </Button>
                      <Button size="sm" onClick={copySelected} variant="outline" className="flex-1">
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicar
                      </Button>
                      <Button size="sm" onClick={deleteSelected} variant="destructive" className="flex-1">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>

                  </div>
                )}

                {/* Shape-specific properties */}
                {selectedObject && ['rect', 'circle', 'triangle', 'path', 'group'].includes(selectedObject.type) && (
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    
                    {/* Color de relleno */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Color de relleno</label>
                      <div className="grid grid-cols-8 gap-1 mb-3">
                        {[
                          '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
                          '#800000', '#008000', '#000080', '#800080', '#808000', '#008080', '#C0C0C0', '#808080',
                          '#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'
                        ].map((color, index) => (
                          <button
                            key={`shape-color-${index}-${color}`}
                            onClick={() => {
                              setShapeColor(color)
                              updateSelectedObject('fill', color, true)
                            }}
                            className={`w-6 h-6 rounded border transition-all hover:scale-110 ${
                              shapeColor === color ? 'border-gray-900 shadow-md border-2' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                      
                      {/* Botón transparente y selector de color */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (shapeColor === 'transparent') {
                              // Si está transparente, volver al último color sólido
                              const lastColor = selectedObject?.lastFillColor || '#000000'
                              setShapeColor(lastColor)
                              updateSelectedObject('fill', lastColor, true)
                            } else {
                              // Guardar el color actual antes de hacer transparente
                              if (selectedObject) {
                                selectedObject.lastFillColor = shapeColor
                              }
                              setShapeColor('transparent')
                              updateSelectedObject('fill', 'transparent', true)
                            }
                          }}
                          className={`px-3 py-2 text-xs rounded border-2 transition-all ${
                            shapeColor === 'transparent' 
                              ? 'bg-blue-100 border-blue-400 text-blue-800 shadow-md' 
                              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                          }`}
                          title={shapeColor === 'transparent' ? 'Volver a color sólido' : 'Sin relleno (transparente)'}
                        >
                          {shapeColor === 'transparent' ? '✓ Transparente' : '∅ Transparente'}
                        </button>
                        <input
                          type="color"
                          value={shapeColor === 'transparent' ? (selectedObject?.lastFillColor || '#000000') : shapeColor}
                          onChange={(e) => {
                            setShapeColor(e.target.value)
                            updateSelectedObject('fill', e.target.value, true)
                            // Guardar como último color sólido
                            if (selectedObject) {
                              selectedObject.lastFillColor = e.target.value
                            }
                          }}
                          className="flex-1 h-10 border border-gray-300 rounded cursor-pointer"
                          disabled={shapeColor === 'transparent'}
                        />
                      </div>
                    </div>
                    
                    {/* Color de borde */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Color de borde</label>
                      
                      {/* Botón transparente y selector de color */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (strokeColor === 'transparent') {
                              // Si está transparente, volver al último color sólido
                              const lastColor = selectedObject?.lastStrokeColor || '#000000'
                              setStrokeColor(lastColor)
                              updateSelectedObject('stroke', lastColor)
                              // Asegurar que el strokeWidth sea visible
                              if (!selectedObject?.strokeWidth || selectedObject.strokeWidth < 1) {
                                updateSelectedObject('strokeWidth', 1)
                                setStrokeWidth(1)
                              }
                            } else {
                              // Guardar el color actual antes de hacer transparente
                              if (selectedObject) {
                                selectedObject.lastStrokeColor = strokeColor
                              }
                              setStrokeColor('transparent')
                              updateSelectedObject('stroke', 'transparent')
                            }
                          }}
                          className={`px-3 py-2 text-xs rounded border-2 transition-all ${
                            strokeColor === 'transparent' 
                              ? 'bg-blue-100 border-blue-400 text-blue-800 shadow-md' 
                              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                          }`}
                          title={strokeColor === 'transparent' ? 'Volver a color sólido' : 'Sin borde (transparente)'}
                        >
                          {strokeColor === 'transparent' ? '✓ Transparente' : '∅ Transparente'}
                        </button>
                        <input
                          type="color"
                          value={strokeColor === 'transparent' ? (selectedObject?.lastStrokeColor || '#000000') : strokeColor}
                          onChange={(e) => {
                            setStrokeColor(e.target.value)
                            updateSelectedObject('stroke', e.target.value)
                            // Asegurar que el strokeWidth sea visible cuando se cambia a un color sólido
                            if (!selectedObject?.strokeWidth || selectedObject.strokeWidth < 1) {
                              updateSelectedObject('strokeWidth', 1)
                              setStrokeWidth(1)
                            }
                            // Guardar como último color sólido
                            if (selectedObject) {
                              selectedObject.lastStrokeColor = e.target.value
                            }
                          }}
                          className="flex-1 h-10 border border-gray-300 rounded cursor-pointer"
                          disabled={strokeColor === 'transparent'}
                        />
                      </div>
                    </div>
                    
                    {/* Grosor de borde */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Grosor de borde</label>
                      <Select value={strokeWidth.toString()} onValueChange={(value) => {
                        const width = parseInt(value)
                        setStrokeWidth(width)
                        updateSelectedObject('strokeWidth', width)
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                          {Array.from({length: 21}, (_, i) => i).map((width) => (
                            <SelectItem key={width} value={width.toString()}>{width}px</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Funcionalidad de Máscara */}
                    {selectedObject?.canBeMask && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Opciones de Máscara</h4>
                        
                        <div className={`flex items-center justify-between mb-3 p-3 rounded-lg border-2 transition-all ${
                          selectedObject?.isMask 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-red-50 border-red-300'
                        }`}>
                          <label className={`text-sm font-medium ${
                            selectedObject?.isMask 
                              ? 'text-green-800' 
                              : 'text-red-800'
                          }`}>
                            Habilitar como Máscara
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              selectedObject?.isMask 
                                ? 'bg-green-200 text-green-800'
                                : 'bg-red-200 text-red-800'
                            }`}>
                              {selectedObject?.isMask ? 'ACTIVO' : 'DESHABILITADO'}
                            </span>
                          </label>
                          <Switch
                            checked={selectedObject?.isMask || false}
                            onCheckedChange={(checked) => {
                              console.log('🎭 Toggling máscara:', checked)
                              updateSelectedObject('isMask', checked)
                              if (checked) {
                                // Hacer transparente el relleno cuando se habilita máscara
                                updateSelectedObject('fill', 'transparent')
                              } else {
                                // Limpiar imagen de máscara si se desactiva y restaurar color
                                updateSelectedObject('maskImageSrc', null)
                                updateSelectedObject('fill', shapeColor, true)
                              }
                            }}
                            className={`transition-colors ${
                              selectedObject?.isMask 
                                ? 'data-[state=checked]:bg-green-600' 
                                : 'data-[state=unchecked]:bg-red-400'
                            }`}
                          />
                        </div>

                        {selectedObject?.isMask && (
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Cargar Imagen</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    // Guardar el fill original si no se ha guardado ya
                                    if (!selectedObject.originalFill) {
                                      selectedObject.originalFill = selectedObject.fill
                                    }
                                    
                                    const reader = new FileReader()
                                    reader.onload = (event) => {
                                      const imageData = event.target?.result as string
                                      
                                      // Resetear propiedades de posición y escala para forzar centrado automático
                                      updateSelectedObject('maskImageX', 0)
                                      updateSelectedObject('maskImageY', 0)
                                      updateSelectedObject('maskImageScale', 1)
                                      
                                      // Limpiar flag de inicialización para permitir centrado automático
                                      if (selectedObject.maskImageWasInitialized) {
                                        selectedObject.maskImageWasInitialized = false
                                      }
                                      
                                      // Cargar la imagen (esto activará el centrado automático)
                                      updateSelectedObject('maskImageSrc', imageData)
                                      
                                      // Desactivar selección después de cargar la imagen
                                      setTimeout(() => {
                                        if (canvas) {
                                          canvas.discardActiveObject()
                                          setSelectedObject(null)
                                          canvas.renderAll()
                                        }
                                      }, 100)
                                      
                                      toast.success('Imagen cargada y centrada automáticamente en la máscara')
                                    }
                                    reader.readAsDataURL(file)
                                  }
                                }}
                                className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                              />
                            </div>

                            {selectedObject?.maskImageSrc && (
                              <>
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                  <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                                    📍 Posición de Imagen en Máscara
                                  </h4>
                                  <p className="text-xs text-blue-700 mb-3">
                                    Usa estos controles para mover la imagen dentro de la forma
                                  </p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-xs text-blue-800 font-medium">Posición X (horizontal)</label>
                                      <Input
                                        type="number"
                                        value={selectedObject?.maskImageX || 0}
                                        onChange={(e) => updateSelectedObject('maskImageX', Number(e.target.value))}
                                        className="text-sm border-blue-300 focus:border-blue-500"
                                        step="5"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-blue-800 font-medium">Posición Y (vertical)</label>
                                      <Input
                                        type="number"
                                        value={selectedObject?.maskImageY || 0}
                                        onChange={(e) => updateSelectedObject('maskImageY', Number(e.target.value))}
                                        className="text-sm border-blue-300 focus:border-blue-500"
                                        step="5"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-center mt-2">
                                    <button
                                      onClick={() => {
                                        updateSelectedObject('maskImageX', 0)
                                        updateSelectedObject('maskImageY', 0)
                                      }}
                                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                                    >
                                      🎯 Centrar Imagen
                                    </button>
                                  </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg border">
                                  <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Escala de Imagen: <span className="text-purple-600 font-bold">{((selectedObject?.maskImageScale || 1) * 100).toFixed(0)}%</span>
                                  </label>
                                  <Slider
                                    value={[(selectedObject?.maskImageScale || 1) * 100]}
                                    onValueChange={(value) => updateSelectedObject('maskImageScale', value[0] / 100)}
                                    min={10}
                                    max={300}
                                    step={10}
                                    className="w-full"
                                  />
                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>10%</span>
                                    <span>100%</span>
                                    <span>300%</span>
                                  </div>
                                </div>

                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      updateSelectedObject('maskImageX', 0)
                                      updateSelectedObject('maskImageY', 0)
                                      updateSelectedObject('maskImageScale', 1)
                                    }}
                                    className="text-xs flex-1"
                                  >
                                    Centrar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      console.log('Quitando imagen de máscara')
                                      // Limpiar imagen de máscara
                                      updateSelectedObject('maskImageSrc', null)
                                      updateSelectedObject('maskImageX', 0)
                                      updateSelectedObject('maskImageY', 0)
                                      updateSelectedObject('maskImageScale', 1)
                                      
                                      // Restaurar fill transparente y añadir icono de placeholder
                                      updateSelectedObject('fill', 'transparent')
                                      
                                      // Añadir icono de placeholder de nuevo
                                      setTimeout(() => {
                                        if (selectedObject && selectedObject.isMask) {
                                          addMaskPlaceholderIcon(selectedObject)
                                        }
                                      }, 100)
                                      
                                      toast.success('Imagen eliminada de la máscara')
                                    }}
                                    className="text-xs text-red-600 flex-1"
                                  >
                                    Quitar Imagen
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-1 pt-4 border-t border-gray-200">
                      <Button size="sm" onClick={centerSelected} variant="outline" className="flex-1">
                        <Target className="h-4 w-4 mr-1" />
                        Centrar
                      </Button>
                      <Button size="sm" onClick={copySelected} variant="outline" className="flex-1">
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicar
                      </Button>
                      <Button size="sm" onClick={deleteSelected} variant="destructive" className="flex-1">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>

                  </div>
                )}

                {/* Image-specific properties */}
                {selectedObject && selectedObject.type === 'image' && (
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    
                    {/* Vista previa */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Vista previa</label>
                      <div className="w-full h-32 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                        {selectedObject.getSrc ? (
                          <img 
                            src={selectedObject.getSrc()} 
                            alt="Vista previa" 
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="text-gray-400 text-sm">Vista previa</div>
                        )}
                      </div>
                    </div>

                    {/* Reemplazar */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Reemplazar</label>
                      <input
                        id="replace-image"
                        type="file"
                        accept="image/*"
                        onChange={replaceImage}
                        className="hidden"
                      />
                      <Button 
                        onClick={() => document.getElementById('replace-image')?.click()}
                        variant="outline"
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Seleccionar nueva imagen
                      </Button>
                    </div>

                    {/* Dimensiones */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Dimensiones (cm)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Ancho (cm)</label>
                          <Input
                            type="number"
                            step="0.1"
                            value={pixelsToCm(imageWidth, true)}
                            onChange={(e) => {
                              const widthCm = parseFloat(e.target.value) || 0
                              const widthPx = cmToPixels(widthCm, true)
                              setImageWidth(widthPx)
                              updateImageDimensions(widthPx, imageHeight)
                            }}
                            className="text-sm"
                            min="0.1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Altura (cm)</label>
                          <Input
                            type="number"
                            step="0.1"
                            value={pixelsToCm(imageHeight, false)}
                            onChange={(e) => {
                              const heightCm = parseFloat(e.target.value) || 0
                              const heightPx = cmToPixels(heightCm, false)
                              setImageHeight(heightPx)
                              updateImageDimensions(imageWidth, heightPx)
                            }}
                            className="text-sm"
                            min="0.1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1 pt-4 border-t border-gray-200">
                      <Button size="sm" onClick={centerSelected} variant="outline" className="flex-1">
                        <Target className="h-4 w-4 mr-1" />
                        Centrar
                      </Button>
                      <Button size="sm" onClick={copySelected} variant="outline" className="flex-1">
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicar
                      </Button>
                      <Button size="sm" onClick={deleteSelected} variant="destructive" className="flex-1">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-8">
                <div className="mb-4">
                  <Settings className="h-12 w-12 mx-auto text-gray-300" />
                </div>
                {activePanel === 'design' ? (
                  <p className="text-sm">Haz clic en "Diseño" en el panel izquierdo para ver los elementos del diseño</p>
                ) : (
                  <p className="text-sm">Selecciona un elemento en el canvas para ver sus propiedades o haz clic en "Diseño" para gestionar elementos</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
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
        onSelectShape={addShapeFromLibrary}
      />

      {/* Template Selector Modal */}
      {showTemplateSelector && availableTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Seleccionar Plantilla
              </h2>
              <button 
                onClick={() => setShowTemplateSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[calc(80vh-120px)] overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableTemplates.optionalTemplates.map((template) => (
                  <div key={template.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-orange-300 transition-colors">
                    <div className="aspect-square bg-white rounded-lg mb-3 flex items-center justify-center border border-gray-100">
                      <Star className="h-8 w-8 text-orange-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                    {template.description && (
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>Usos: {template.usageCount}</span>
                      <span>{template.category}</span>
                    </div>
                    <button
                      onClick={() => {
                        loadTemplate(template)
                        setShowTemplateSelector(false)
                      }}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Usar Plantilla
                    </button>
                  </div>
                ))}
              </div>
              
              {availableTemplates.optionalTemplates.length === 0 && (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay plantillas disponibles para este producto.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}