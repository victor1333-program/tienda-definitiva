// Tipos para el AreaEditor

export interface Point {
  x: number
  y: number
}

export interface PrintArea {
  id: string
  name: string
  shape: 'rectangle' | 'circle' | 'ellipse' | 'polygon'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  realWidth?: number  // En cm
  realHeight?: number // En cm
  // Campos para coordenadas relativas
  isRelativeCoordinates?: boolean
  referenceWidth?: number
  referenceHeight?: number
  // Propiedades adicionales
  description?: string
  isActive?: boolean
  color?: string
  opacity?: number
  locked?: boolean
  zIndex?: number
}

export interface MeasurementLine {
  id: string
  start: Point
  end: Point
  realDistance: number // En cm
  label?: string
  color?: string
}

export interface MeasurementData {
  pixelsPerCm?: number | null
  measurementLines?: MeasurementLine[]
  hasValidMeasurement?: boolean
  calibrationImage?: string
  lastUpdated?: string
}

export interface AreaEditorProps {
  isOpen: boolean
  onClose: () => void
  sideImage: string
  sideName: string
  onSave: (areas: PrintArea[], measurementData?: MeasurementData) => Promise<void>
  existingAreas?: PrintArea[]
  existingMeasurementData?: MeasurementData
  readonly?: boolean
  showMeasurements?: boolean
  canvasSize?: { width: number; height: number }
}

export interface Tool {
  id: string
  name: string
  icon: any
  cursor?: string
}

export interface CanvasState {
  zoom: number
  panX: number
  panY: number
  isDragging: boolean
  isDrawing: boolean
  tool: string
  selectedArea: string | null
}

export interface AreaCreationState {
  isCreating: boolean
  startPoint: Point | null
  currentPoint: Point | null
  shape: 'rectangle' | 'circle' | 'ellipse'
  previewArea: Partial<PrintArea> | null
}

export interface MeasurementState {
  isCreating: boolean
  startPoint: Point | null
  currentPoint: Point | null
  lines: MeasurementLine[]
  pixelsPerCm: number | null
}

export interface AreaEditorState {
  areas: PrintArea[]
  measurementData: MeasurementData
  canvas: CanvasState
  areaCreation: AreaCreationState
  measurement: MeasurementState
  selectedArea: PrintArea | null
  imageLoaded: boolean
  imageNaturalSize: { width: number; height: number }
}