// Tipos y interfaces compartidas para el editor de templates

export interface ShapeItem {
  id: string
  name: string
  category: string
  src: string
  width: number
  height: number
  preview?: string
  tags?: string[]
  isActive?: boolean
}

export interface TemplateElement {
  id: string
  type: 'shape' | 'text' | 'image' | 'i-text'
  src?: string
  text?: string
  fontFamily?: string
  fontSize?: number
  fontWeight?: string
  textAlign?: string
  fill?: string
  fillColor?: string
  strokeColor?: string
  strokeWidth?: number
  opacity?: number
  transparency?: number
  x?: number
  y?: number
  relativeX?: number
  relativeY?: number
  width?: number
  height?: number
  scaleX?: number
  scaleY?: number
  rotation?: number
  borderRadius?: number
  selected?: boolean
  alt?: string
  zIndex?: number
}

export interface TemplateEditorProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  templateName: string
  category: string
  onSave: (templateData: any) => void
  isEditMode?: boolean
  existingTemplateData?: any
}

export interface RelativeCoordinates {
  x: number // 0-1 range
  y: number // 0-1 range
}

export interface AbsoluteCoordinates {
  x: number // pixels
  y: number // pixels
}

export interface TemplateData {
  id?: string
  name: string
  description?: string
  category?: string
  tags?: string[]
  sides: {
    [sideKey: string]: {
      elements: TemplateElement[]
      backgroundImage?: string
      backgroundColor?: string
      dimensions?: {
        width: number
        height: number
      }
    }
  }
  metadata?: {
    createdAt?: string
    updatedAt?: string
    version?: number
    author?: string
  }
}