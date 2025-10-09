// Interfaces para el editor Zakeke
export interface PrintArea {
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

export interface ProductSide {
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

export interface DesignElement {
  id: string
  type: 'text' | 'image' | 'shape'
  x: number
  y: number
  width?: number
  height?: number
  rotation?: number
  scaleX?: number
  scaleY?: number
  opacity?: number
  visible?: boolean
  locked?: boolean
  zIndex?: number
  
  // Text specific
  text?: string
  fontFamily?: string
  fontSize?: number
  fontWeight?: string
  fontStyle?: string
  textAlign?: 'left' | 'center' | 'right'
  color?: string
  textDecoration?: string
  lineHeight?: number
  
  // Image specific
  src?: string
  imageUrl?: string
  crop?: {
    x: number
    y: number
    width: number
    height: number
  }
  
  // Shape specific
  shapeType?: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  
  // Print area association
  printAreaId?: string
  
  // Relative coordinates
  relativeX?: number
  relativeY?: number
  relativeWidth?: number
  relativeHeight?: number
  isRelativeCoordinates?: boolean
}

export interface DesignData {
  elements: Record<string, DesignElement>
  selectedVariant?: string
  activeSide?: string
  canvasSize?: {
    width: number
    height: number
  }
}

export interface EditorSettings {
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number
  showRulers: boolean
  showPrintAreas: boolean
  zoomLevel: number
  maxZoom: number
  minZoom: number
}

export interface ToolbarState {
  selectedTool: 'select' | 'text' | 'image' | 'shape' | 'draw'
  selectedElement?: string
  clipboard?: DesignElement[]
  history: DesignData[]
  historyIndex: number
  maxHistory: number
}