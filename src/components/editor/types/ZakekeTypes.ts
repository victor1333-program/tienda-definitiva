// Tipos para el Zakeke Advanced Editor

export interface PrintArea {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  relativeX: number
  relativeY: number
  relativeWidth: number
  relativeHeight: number
  description?: string
  isActive: boolean
}

export interface ProductSide {
  id: string
  name: string
  displayName: string
  image: string
  printAreas: PrintArea[]
  backgroundImage?: string
  maskImage?: string
  isActive: boolean
  order?: number
}

export interface ProductVariant {
  id: string
  name: string
  color: string
  colorName: string
  sides: ProductSide[]
  isDefault?: boolean
  stockLevel?: number
  priceModifier?: number
}

export interface ZakekeAdvancedEditorProps {
  productId: string
  variants: ProductVariant[]
  onSave?: (designData: any) => void
  onCancel?: () => void
  initialDesignData?: any
  isReadOnly?: boolean
  showVariantSelector?: boolean
  customCanvasSize?: { width: number; height: number }
}

export interface CanvasState {
  zoom: number
  panX: number
  panY: number
  selectedObjectId: string | null
  mode: 'select' | 'text' | 'image' | 'shape'
  isModified: boolean
}

export interface DesignElement {
  id: string
  type: 'text' | 'image' | 'shape'
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  scaleX?: number
  scaleY?: number
  opacity?: number
  zIndex: number
  locked?: boolean
  visible?: boolean
  
  // Text specific
  text?: string
  fontFamily?: string
  fontSize?: number
  fontWeight?: string | number
  fontStyle?: string
  textAlign?: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  
  // Image specific
  src?: string
  filters?: any[]
  
  // Shape specific
  fill?: string
  stroke?: string
  strokeWidth?: number
  shapeType?: string
  
  // Metadata
  name?: string
  createdAt?: string
  updatedAt?: string
}

export interface ShapeCategory {
  id: string
  name: string
  icon: string
  shapes: ShapeItem[]
}

export interface ShapeItem {
  id: string
  name: string
  src: string
  width: number
  height: number
  category: string
  tags?: string[]
  isPremium?: boolean
}

export interface ToolState {
  activeTool: 'select' | 'text' | 'image' | 'shape' | 'draw'
  isDrawing: boolean
  drawingMode: 'free' | 'line' | 'rectangle' | 'circle'
  brushWidth: number
  brushColor: string
}

export interface TextStyle {
  fontFamily: string
  fontSize: number
  fontWeight: string | number
  fontStyle: 'normal' | 'italic'
  textAlign: 'left' | 'center' | 'right' | 'justify'
  fill: string
  stroke?: string
  strokeWidth?: number
  lineHeight?: number
  letterSpacing?: number
}

export interface ImageFilter {
  type: 'brightness' | 'contrast' | 'saturation' | 'blur' | 'sepia' | 'grayscale'
  value: number
}

export interface HistoryState {
  canUndo: boolean
  canRedo: boolean
  currentStep: number
  totalSteps: number
}