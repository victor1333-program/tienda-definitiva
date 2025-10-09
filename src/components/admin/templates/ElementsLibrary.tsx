"use client"

import { useState, useEffect } from "react"
import { 
  Type, 
  Image, 
  Square, 
  Circle, 
  Triangle, 
  Star,
  Heart,
  Search,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Settings,
  Shapes,
  Palette
} from "lucide-react"

interface ElementTemplate {
  id: string
  name: string
  type: 'text' | 'image' | 'shape'
  category: string
  thumbnail?: string
  data: any
  isCustom: boolean
  createdAt: string
}

interface Shape {
  id: string
  name: string
  category: string
  fileUrl: string
  isMask: boolean
  tags: string[]
  isFromLibrary: boolean
  fileType?: string
  fileSize?: number
  createdAt: string
  updatedAt: string
  _count: {
    usages: number
  }
}

interface ShapeCategory {
  category: string
  label: string
  count: number
  isPredefined: boolean
}

interface ElementsLibraryProps {
  onAddElement: (element: any) => void
  selectedElement?: any
  onUpdateElement?: (id: string, updates: any) => void
  availableFonts?: any[]
  onActivateShapeSelector?: () => void
}

export default function ElementsLibrary({ 
  onAddElement, 
  selectedElement, 
  onUpdateElement,
  availableFonts = [],
  onActivateShapeSelector
}: ElementsLibraryProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'images' | 'shapes'>('text')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [shapes, setShapes] = useState<Shape[]>([])
  const [shapeCategories, setShapeCategories] = useState<ShapeCategory[]>([])
  const [shapesLoading, setShapesLoading] = useState(false)

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

  // Load shapes when the shapes tab is activated
  useEffect(() => {
    if (activeTab === 'shapes') {
      loadShapes()
      loadShapeCategories()
    }
  }, [activeTab])

  const loadShapes = async () => {
    try {
      setShapesLoading(true)
      const response = await fetch('/api/personalization/shapes')
      if (response.ok) {
        const data = await response.json()
        setShapes(data)
      }
    } catch (error) {
      console.error('Error loading shapes:', error)
    } finally {
      setShapesLoading(false)
    }
  }

  const loadShapeCategories = async () => {
    try {
      const response = await fetch('/api/personalization/shapes/categories')
      if (response.ok) {
        const data = await response.json()
        setShapeCategories(data)
      }
    } catch (error) {
      console.error('Error loading shape categories:', error)
    }
  }

  // Plantillas predefinidas de texto
  const textTemplates: ElementTemplate[] = [
    {
      id: 'text_title',
      name: 'Título Principal',
      type: 'text',
      category: 'headings',
      data: {
        text: 'TU TÍTULO AQUÍ',
        fontSize: 32,
        fontFamily: 'Arial Black',
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center'
      },
      isCustom: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'text_subtitle',
      name: 'Subtítulo',
      type: 'text',
      category: 'headings',
      data: {
        text: 'Tu subtítulo aquí',
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        color: '#333333',
        textAlign: 'center'
      },
      isCustom: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'text_body',
      name: 'Texto Cuerpo',
      type: 'text',
      category: 'body',
      data: {
        text: 'Tu mensaje personalizado',
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        color: '#666666',
        textAlign: 'left'
      },
      isCustom: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'text_quote',
      name: 'Cita',
      type: 'text',
      category: 'decorative',
      data: {
        text: '"Tu cita inspiradora"',
        fontSize: 20,
        fontFamily: 'Georgia',
        fontWeight: 'italic',
        color: '#444444',
        textAlign: 'center'
      },
      isCustom: false,
      createdAt: new Date().toISOString()
    }
  ]

  // Plantillas predefinidas de formas
  const shapeTemplates: ElementTemplate[] = [
    {
      id: 'shape_rect',
      name: 'Rectángulo',
      type: 'shape',
      category: 'basic',
      data: {
        shapeType: 'rectangle',
        fillColor: '#ff6b35',
        strokeColor: '#000000',
        strokeWidth: 2,
        width: 120,
        height: 80
      },
      isCustom: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'shape_circle',
      name: 'Círculo',
      type: 'shape',
      category: 'basic',
      data: {
        shapeType: 'circle',
        fillColor: '#4dabf7',
        strokeColor: '#000000',
        strokeWidth: 2,
        width: 100,
        height: 100
      },
      isCustom: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'shape_star',
      name: 'Estrella',
      type: 'shape',
      category: 'decorative',
      data: {
        shapeType: 'star',
        fillColor: '#ffd43b',
        strokeColor: '#000000',
        strokeWidth: 2,
        width: 100,
        height: 100
      },
      isCustom: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'shape_heart',
      name: 'Corazón',
      type: 'shape',
      category: 'decorative',
      data: {
        shapeType: 'heart',
        fillColor: '#ff6b9d',
        strokeColor: '#000000',
        strokeWidth: 2,
        width: 100,
        height: 100
      },
      isCustom: false,
      createdAt: new Date().toISOString()
    }
  ]

  // Plantillas de imágenes (placeholders por ahora)
  const imageTemplates: ElementTemplate[] = [
    {
      id: 'img_placeholder',
      name: 'Imagen Placeholder',
      type: 'image',
      category: 'basic',
      data: {
        src: '/images/placeholder-category.jpg',
        width: 200,
        height: 150
      },
      isCustom: false,
      createdAt: new Date().toISOString()
    }
  ]

  const getCurrentTemplates = () => {
    switch (activeTab) {
      case 'text': return textTemplates
      case 'images': return imageTemplates
      case 'shapes': return convertShapesToTemplates(shapes)
      default: return []
    }
  }

  const convertShapesToTemplates = (shapes: Shape[]): ElementTemplate[] => {
    return shapes.map(shape => ({
      id: shape.id,
      name: shape.name,
      type: 'shape' as const,
      category: shape.category,
      thumbnail: shape.fileUrl,
      data: {
        shapeType: 'custom',
        fileUrl: shape.fileUrl,
        fileType: shape.fileType,
        isMask: shape.isMask,
        width: 100,
        height: 100,
        fillColor: '#ff6b35',
        strokeColor: '#000000',
        strokeWidth: 2
      },
      isCustom: !shape.isFromLibrary,
      createdAt: shape.createdAt
    }))
  }

  const getCategories = () => {
    if (activeTab === 'shapes') {
      return shapeCategories.map(cat => cat.category)
    } else {
      const templates = getCurrentTemplates()
      const categories = [...new Set(templates.map(t => t.category))]
      return categories
    }
  }

  const filteredTemplates = getCurrentTemplates().filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddElement = (template: ElementTemplate) => {
    const newElement = {
      id: `${template.type}_${Date.now()}`,
      type: template.type,
      x: 50,
      y: 50,
      width: template.data.width || 120,
      height: template.data.height || 30,
      rotation: 0,
      locked: false,
      visible: true,
      printable: true,
      ...template.data
    }
    onAddElement(newElement)
  }

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />
      case 'image': return <Image className="h-4 w-4" />
      case 'shape': return <Square className="h-4 w-4" />
      default: return <Square className="h-4 w-4" />
    }
  }

  const getShapeIcon = (shapeType: string) => {
    switch (shapeType) {
      case 'rectangle': return <Square className="h-6 w-6" />
      case 'circle': return <Circle className="h-6 w-6" />
      case 'star': return <Star className="h-6 w-6" />
      case 'heart': return <Heart className="h-6 w-6" />
      default: return <Square className="h-6 w-6" />
    }
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Biblioteca de Elementos</h3>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'text' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Type className="h-4 w-4 mx-auto mb-1" />
            Texto
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'images' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Image className="h-4 w-4 mx-auto mb-1" />
            Imágenes
          </button>
          <button
            onClick={() => setActiveTab('shapes')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'shapes' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Square className="h-4 w-4 mx-auto mb-1" />
            Formas
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'text' ? (
        /* Text Configuration Panel */
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Agregar texto */}
          <div>
            <button
              onClick={() => {
                const newTextElement = {
                  id: `text_${Date.now()}`,
                  type: 'text',
                  x: 50,
                  y: 50,
                  width: 200,
                  height: 40,
                  rotation: 0,
                  locked: false,
                  visible: true,
                  printable: true,
                  text: 'Nuevo texto',
                  fontSize: 16,
                  fontFamily: 'Arial',
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  textAlign: 'left',
                  color: '#000000',
                  textDecoration: 'none',
                  curved: false,
                  curveRadius: 50
                }
                onAddElement(newTextElement)
              }}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Texto
            </button>
          </div>

          {/* Text Properties - Only show if text element is selected */}
          {selectedElement && selectedElement.type === 'text' && onUpdateElement && (
            <div className="space-y-3">
              {/* Ajustes de Texto Header */}
              <div className="bg-orange-50 p-2 rounded">
                <h4 className="text-sm font-semibold text-orange-800 flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Ajustes de Texto
                </h4>
              </div>

              {/* Nombre del elemento */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del elemento</label>
                <input
                  type="text"
                  value={selectedElement.name || `Texto ${selectedElement.id.slice(-4)}`}
                  onChange={(e) => onUpdateElement(selectedElement.id, { name: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Texto */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Texto</label>
                <textarea
                  value={selectedElement.text || ''}
                  onChange={(e) => onUpdateElement(selectedElement.id, { text: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded resize-none focus:ring-1 focus:ring-orange-500"
                  rows={2}
                  placeholder="Escribe tu texto aquí..."
                />
              </div>

              {/* Permisos de usuario */}
              <div className="bg-gray-50 p-2 rounded">
                <label className="block text-xs font-medium text-gray-700 mb-2">Permitir al usuario:</label>
                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={selectedElement.canEditText !== false}
                      onChange={(e) => onUpdateElement(selectedElement.id, { canEditText: e.target.checked })}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                    />
                    Editar texto
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={selectedElement.canMove !== false}
                      onChange={(e) => onUpdateElement(selectedElement.id, { canMove: e.target.checked })}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                    />
                    Mover
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={selectedElement.canRotate !== false}
                      onChange={(e) => onUpdateElement(selectedElement.id, { canRotate: e.target.checked })}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                    />
                    Girar
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={selectedElement.canResize !== false}
                      onChange={(e) => onUpdateElement(selectedElement.id, { canResize: e.target.checked })}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                    />
                    Redimensionar
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={selectedElement.canDelete !== false}
                      onChange={(e) => onUpdateElement(selectedElement.id, { canDelete: e.target.checked })}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                    />
                    Borrar
                  </label>
                </div>
              </div>

              {/* Configuración obligatoria */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedElement.mandatoryToEdit || false}
                    onChange={(e) => onUpdateElement(selectedElement.id, { mandatoryToEdit: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                  />
                  Obligatorio editar
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedElement.alwaysOnTop || false}
                    onChange={(e) => onUpdateElement(selectedElement.id, { alwaysOnTop: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                  />
                  Siempre en la cima
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedElement.alwaysOnBottom || false}
                    onChange={(e) => onUpdateElement(selectedElement.id, { alwaysOnBottom: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                  />
                  Siempre en el fondo
                </label>
              </div>

              {/* Fuente */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de letra</label>
                <select
                  value={selectedElement.fontFamily || 'Arial'}
                  onChange={(e) => onUpdateElement(selectedElement.id, { fontFamily: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  {availableFonts.map((font) => (
                    <option key={font.id} value={font.fontFamily} style={{ fontFamily: font.fontFamily }}>
                      {font.fontFamily}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color de fuente */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color de fuente</label>
                <div className="grid grid-cols-8 gap-0.5 mb-1">
                  {predefinedColors.slice(0, 16).map((color, index) => (
                    <button
                      key={`color-${index}-${color}`}
                      onClick={() => onUpdateElement(selectedElement.id, { color })}
                      className={`w-4 h-4 rounded border transition-all hover:scale-110 ${
                        selectedElement.color === color ? 'border-gray-900 shadow-md border-2' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={selectedElement.color || '#000000'}
                  onChange={(e) => onUpdateElement(selectedElement.id, { color: e.target.value })}
                  className="w-full h-6 border border-gray-300 rounded cursor-pointer"
                />
              </div>

              {/* Estilo de fuente */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Estilo de fuente</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => onUpdateElement(selectedElement.id, { 
                      fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' 
                    })}
                    className={`px-2 py-1 rounded border text-xs font-bold ${
                      selectedElement.fontWeight === 'bold' 
                        ? 'bg-orange-100 border-orange-300 text-orange-700' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Bold className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onUpdateElement(selectedElement.id, { 
                      fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
                    })}
                    className={`px-2 py-1 rounded border text-xs italic ${
                      selectedElement.fontStyle === 'italic' 
                        ? 'bg-orange-100 border-orange-300 text-orange-700' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Italic className="h-3 w-3" />
                  </button>
                </div>
                <label className="flex items-center gap-1 text-xs mt-1">
                  <input
                    type="checkbox"
                    checked={selectedElement.canChangeFontAlignment !== false}
                    onChange={(e) => onUpdateElement(selectedElement.id, { canChangeFontAlignment: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                  />
                  Permitir cambiar alineación
                </label>
              </div>

              {/* Tamaño de fuente */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tamaño de fuente</label>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={selectedElement.minFontSize || 8}
                    onChange={(e) => onUpdateElement(selectedElement.id, { minFontSize: parseInt(e.target.value) || 8 })}
                    className="px-1 py-1 border border-gray-300 rounded text-center"
                  />
                  <input
                    type="number"
                    value={selectedElement.fontSize || 16}
                    onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 16 })}
                    className="px-1 py-1 border border-gray-300 rounded text-center"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={selectedElement.maxFontSize || 200}
                    onChange={(e) => onUpdateElement(selectedElement.id, { maxFontSize: parseInt(e.target.value) || 200 })}
                    className="px-1 py-1 border border-gray-300 rounded text-center"
                  />
                </div>
              </div>

              {/* Alineación */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alineación</label>
                <div className="grid grid-cols-4 gap-1">
                  <button
                    onClick={() => onUpdateElement(selectedElement.id, { textAlign: 'left' })}
                    className={`p-1 rounded border text-xs ${
                      selectedElement.textAlign === 'left' 
                        ? 'bg-orange-100 border-orange-300 text-orange-700' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    title="Izquierda"
                  >
                    <AlignLeft className="h-3 w-3 mx-auto" />
                  </button>
                  <button
                    onClick={() => onUpdateElement(selectedElement.id, { textAlign: 'center' })}
                    className={`p-1 rounded border text-xs ${
                      selectedElement.textAlign === 'center' 
                        ? 'bg-orange-100 border-orange-300 text-orange-700' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    title="Centro"
                  >
                    <AlignCenter className="h-3 w-3 mx-auto" />
                  </button>
                  <button
                    onClick={() => onUpdateElement(selectedElement.id, { textAlign: 'right' })}
                    className={`p-1 rounded border text-xs ${
                      selectedElement.textAlign === 'right' 
                        ? 'bg-orange-100 border-orange-300 text-orange-700' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    title="Derecha"
                  >
                    <AlignRight className="h-3 w-3 mx-auto" />
                  </button>
                  <button
                    onClick={() => onUpdateElement(selectedElement.id, { textAlign: 'justify' })}
                    className={`p-1 rounded border text-xs ${
                      selectedElement.textAlign === 'justify' 
                        ? 'bg-orange-100 border-orange-300 text-orange-700' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    title="Justificado"
                  >
                    <AlignJustify className="h-3 w-3 mx-auto" />
                  </button>
                </div>
              </div>

              {/* Texto Arqueado */}
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                  <input
                    type="checkbox"
                    checked={selectedElement.curved || false}
                    onChange={(e) => onUpdateElement(selectedElement.id, { curved: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                  />
                  Texto curvo
                </label>
                {selectedElement.curved && (
                  <div className="ml-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedElement.curveRadius || 50}
                      onChange={(e) => onUpdateElement(selectedElement.id, { curveRadius: parseInt(e.target.value) })}
                      className="w-full h-1"
                    />
                    <div className="text-xs text-gray-500 text-center">{selectedElement.curveRadius || 50}%</div>
                  </div>
                )}
              </div>

              {/* Alineación vertical */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alineación vertical</label>
                <select
                  value={selectedElement.verticalAlign || 'middle'}
                  onChange={(e) => onUpdateElement(selectedElement.id, { verticalAlign: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                >
                  <option value="top">Arriba</option>
                  <option value="middle">Medio</option>
                  <option value="bottom">Abajo</option>
                </select>
              </div>

              {/* Espaciado entre letras */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Espaciado entre letras</label>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={selectedElement.minLetterSpacing || -5}
                    onChange={(e) => onUpdateElement(selectedElement.id, { minLetterSpacing: parseInt(e.target.value) || -5 })}
                    className="px-1 py-1 border border-gray-300 rounded text-center"
                  />
                  <input
                    type="number"
                    value={selectedElement.letterSpacing || 0}
                    onChange={(e) => onUpdateElement(selectedElement.id, { letterSpacing: parseInt(e.target.value) || 0 })}
                    className="px-1 py-1 border border-gray-300 rounded text-center"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={selectedElement.maxLetterSpacing || 20}
                    onChange={(e) => onUpdateElement(selectedElement.id, { maxLetterSpacing: parseInt(e.target.value) || 20 })}
                    className="px-1 py-1 border border-gray-300 rounded text-center"
                  />
                </div>
              </div>

              {/* Espaciado entre líneas */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Espaciado entre líneas</label>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={selectedElement.minLineSpacing || 0.5}
                    step="0.1"
                    onChange={(e) => onUpdateElement(selectedElement.id, { minLineSpacing: parseFloat(e.target.value) || 0.5 })}
                    className="px-1 py-1 border border-gray-300 rounded text-center"
                  />
                  <input
                    type="number"
                    value={selectedElement.lineSpacing || 1.2}
                    step="0.1"
                    onChange={(e) => onUpdateElement(selectedElement.id, { lineSpacing: parseFloat(e.target.value) || 1.2 })}
                    className="px-1 py-1 border border-gray-300 rounded text-center"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={selectedElement.maxLineSpacing || 3}
                    step="0.1"
                    onChange={(e) => onUpdateElement(selectedElement.id, { maxLineSpacing: parseFloat(e.target.value) || 3 })}
                    className="px-1 py-1 border border-gray-300 rounded text-center"
                  />
                </div>
              </div>

              {/* Configuraciones adicionales */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedElement.autoUppercase || false}
                    onChange={(e) => onUpdateElement(selectedElement.id, { autoUppercase: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                  />
                  Mayúsculas automáticas
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedElement.printable !== false}
                    onChange={(e) => onUpdateElement(selectedElement.id, { printable: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                  />
                  Imprimible
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedElement.includeInThumbnail !== false}
                    onChange={(e) => onUpdateElement(selectedElement.id, { includeInThumbnail: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                  />
                  Incluir en miniatura
                </label>
              </div>

              {/* Información del elemento */}
              <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 space-y-1">
                <div>Caracteres: {selectedElement.text?.length || 0}</div>
                <div>Familia: {selectedElement.fontFamily || 'Arial'}</div>
                <div>Tamaño: {selectedElement.fontSize || 16}px</div>
              </div>
            </div>
          )}

          {/* Instructions when no text selected */}
          {(!selectedElement || selectedElement.type !== 'text') && (
            <div className="text-center py-8 text-gray-500">
              <Type className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Agrega un texto o selecciona uno existente para ver las opciones de configuración</p>
            </div>
          )}
        </div>
      ) : activeTab === 'images' ? (
        /* Images Tab - Simple image addition */
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Agregar imagen */}
          <div>
            <button
              onClick={() => {
                const newImageElement = {
                  id: `image_${Date.now()}`,
                  type: 'image',
                  x: 50,
                  y: 50,
                  width: 200,
                  height: 200,
                  rotation: 0,
                  locked: false,
                  visible: true,
                  printable: true,
                  src: null,
                  canMove: true,
                  canResize: true,
                  canRotate: true,
                  canDelete: true,
                  maintainAspectRatio: true
                }
                onAddElement(newImageElement)
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Imagen
            </button>
          </div>

          {/* Instructions when no image selected */}
          <div className="text-center py-8 text-gray-500">
            <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Haz clic en "Agregar Imagen" para crear un nuevo elemento de imagen</p>
            <p className="text-xs mt-2">Después selecciona el elemento en el canvas para configurarlo en el panel derecho</p>
          </div>
        </div>
      ) : (
        /* Shapes Tab */
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar formas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Todas las categorías</option>
              {getCategories().map((category) => (
                <option key={category} value={category}>
                  {shapeCategories.find(c => c.category === category)?.label || category}
                </option>
              ))}
            </select>
          </div>

          {/* Loading state */}
          {shapesLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-sm">Cargando formas...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shapes className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No se encontraron formas</p>
              <p className="text-xs mt-2">Ve a Herramientas → Formas para administrar tu galería</p>
            </div>
          ) : (
            /* Shapes Grid */
            <div className="grid grid-cols-2 gap-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleAddElement(template)}
                >
                  <div className="aspect-square bg-white rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    {template.data.fileType === 'image/svg+xml' ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="max-w-full max-h-full object-contain p-2"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                    ) : (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                    )}
                    <Shapes className="h-8 w-8 text-gray-400" style={{ display: 'none' }} />
                  </div>
                  <h4 className="text-xs font-medium text-gray-900 truncate" title={template.name}>
                    {template.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {shapeCategories.find(c => c.category === template.category)?.label || template.category}
                    </span>
                    {template.data.isMask && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Máscara</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}