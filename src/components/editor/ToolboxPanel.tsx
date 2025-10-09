"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import fetcher from "@/lib/fetcher"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Type, 
  Image, 
  Square, 
  Circle, 
  Triangle, 
  Upload,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline
} from "lucide-react"
import { toast } from "react-hot-toast"

interface PrintArea {
  id: string
  name: string
  allowText: boolean
  allowImages: boolean
  allowShapes: boolean
  allowClipart: boolean
}

interface ToolboxPanelProps {
  selectedArea: PrintArea | null
  onToolSelect: (tool: string) => void
  productId: string
  onOpenImageLibrary?: () => void
  onOpenShapesLibrary?: () => void
}

export default function ToolboxPanel({ selectedArea, onToolSelect, productId, onOpenImageLibrary, onOpenShapesLibrary }: ToolboxPanelProps) {
  const [activeCategory, setActiveCategory] = useState<'text' | 'images' | 'shapes' | 'colors'>('text')
  const [textOptions, setTextOptions] = useState({
    fontSize: 24,
    fontFamily: 'Arial',
    color: '#000000',
    bold: false,
    italic: false,
    underline: false,
    align: 'left'
  })

  // Check if product has linked content for images
  const { data: linkedContentData } = useSWR(
    `/api/products/${productId}/personalization-linked-content`,
    fetcher,
    { revalidateOnFocus: false }
  )

  const hasLinkedImages = linkedContentData?.hasLinkedContent || false

  const handleAddText = () => {
    if (!selectedArea?.allowText) {
      toast.error('No se permite agregar texto en esta área')
      return
    }

    const canvas = (window as any).zakekeCanvas
    if (canvas) {
      canvas.addText('Nuevo Texto')
    }
    onToolSelect('text')
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedArea?.allowImages) {
      toast.error('No se permite agregar imágenes en esta área')
      return
    }

    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const canvas = (window as any).zakekeCanvas
        if (canvas && e.target?.result) {
          canvas.addImage(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
    onToolSelect('image')
  }

  const handleAddShape = (shapeType: 'rect' | 'circle' | 'triangle') => {
    if (!selectedArea?.allowShapes) {
      toast.error('No se permite agregar formas en esta área')
      return
    }

    const canvas = (window as any).zakekeCanvas
    if (canvas) {
      canvas.addShape(shapeType)
    }
    onToolSelect('shape')
  }

  // This function is no longer needed here since we're moving the modal up

  const categories = [
    { id: 'text', name: 'Texto', icon: Type, enabled: selectedArea?.allowText },
    { id: 'images', name: 'Imágenes', icon: Image, enabled: selectedArea?.allowImages && hasLinkedImages },
    { id: 'shapes', name: 'Formas', icon: Square, enabled: selectedArea?.allowShapes },
    { id: 'colors', name: 'Colores', icon: Palette, enabled: true }
  ]

  return (
    <div className="p-4 space-y-4">
      {!selectedArea ? (
        <div className="text-center py-8">
          <Type className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Selecciona un área de impresión para ver las herramientas disponibles</p>
        </div>
      ) : (
        <>
          {/* Category Tabs */}
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as any)}
                disabled={!category.enabled}
                className={`p-3 rounded-lg border-2 transition-all ${
                  activeCategory === category.id
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : category.enabled
                    ? 'border-gray-200 hover:border-gray-300 text-gray-700'
                    : 'border-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <category.icon className="h-5 w-5 mx-auto mb-1" />
                <div className="text-xs font-medium">{category.name}</div>
              </button>
            ))}
          </div>

          <Separator />

          {/* Text Tools */}
          {activeCategory === 'text' && selectedArea.allowText && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Herramientas de Texto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleAddText}
                  className="w-full"
                  size="sm"
                >
                  <Type className="h-4 w-4 mr-2" />
                  Agregar Texto
                </Button>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Tamaño de Fuente</Label>
                    <Input
                      type="number"
                      value={textOptions.fontSize}
                      onChange={(e) => setTextOptions({...textOptions, fontSize: parseInt(e.target.value)})}
                      className="h-8"
                      min={8}
                      max={72}
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Familia de Fuente</Label>
                    <select 
                      value={textOptions.fontFamily}
                      onChange={(e) => setTextOptions({...textOptions, fontFamily: e.target.value})}
                      className="w-full h-8 px-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs">Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={textOptions.color}
                        onChange={(e) => setTextOptions({...textOptions, color: e.target.value})}
                        className="h-8 w-16 p-1"
                      />
                      <Input
                        type="text"
                        value={textOptions.color}
                        onChange={(e) => setTextOptions({...textOptions, color: e.target.value})}
                        className="h-8 flex-1 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Estilo</Label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setTextOptions({...textOptions, bold: !textOptions.bold})}
                        className={`p-2 rounded border ${
                          textOptions.bold ? 'bg-orange-500 text-white' : 'bg-white'
                        }`}
                      >
                        <Bold className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setTextOptions({...textOptions, italic: !textOptions.italic})}
                        className={`p-2 rounded border ${
                          textOptions.italic ? 'bg-orange-500 text-white' : 'bg-white'
                        }`}
                      >
                        <Italic className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setTextOptions({...textOptions, underline: !textOptions.underline})}
                        className={`p-2 rounded border ${
                          textOptions.underline ? 'bg-orange-500 text-white' : 'bg-white'
                        }`}
                      >
                        <Underline className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Alineación</Label>
                    <div className="flex gap-1">
                      {[
                        { value: 'left', icon: AlignLeft },
                        { value: 'center', icon: AlignCenter },
                        { value: 'right', icon: AlignRight }
                      ].map(({ value, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => setTextOptions({...textOptions, align: value})}
                          className={`p-2 rounded border flex-1 ${
                            textOptions.align === value ? 'bg-orange-500 text-white' : 'bg-white'
                          }`}
                        >
                          <Icon className="h-3 w-3 mx-auto" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Image Tools */}
          {activeCategory === 'images' && selectedArea.allowImages && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Herramientas de Imagen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-orange-500 transition-colors">
                      <Upload className="h-6 w-6 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Subir Imagen</span>
                    </div>
                  </Label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div>
                  <Label className="text-xs">Imágenes del Producto</Label>
                  <Button
                    onClick={() => onOpenImageLibrary?.()}
                    className="w-full mt-2"
                    variant="outline"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Abrir Biblioteca de Imágenes
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    {hasLinkedImages ? 
                      'Selecciona de las imágenes vinculadas a este producto' :
                      'No hay imágenes vinculadas'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shape Tools */}
          {activeCategory === 'shapes' && selectedArea.allowShapes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Herramientas de Formas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs">Biblioteca de Formas</Label>
                  <Button
                    onClick={() => onOpenShapesLibrary?.()}
                    className="w-full mt-2"
                    variant="outline"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Abrir Biblioteca de Formas
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Selecciona de una amplia variedad de formas prediseñadas
                  </p>
                </div>

                <Separator />

                <div>
                  <Label className="text-xs">Formas Básicas</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Button
                      variant="outline"
                      onClick={() => handleAddShape('rect')}
                      className="aspect-square p-2"
                    >
                      <Square className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAddShape('circle')}
                      className="aspect-square p-2"
                    >
                      <Circle className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAddShape('triangle')}
                      className="aspect-square p-2"
                    >
                      <Triangle className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Color Tools */}
          {activeCategory === 'colors' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Paleta de Colores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    '#000000', '#ffffff', '#ff6b35', '#4a90e2', 
                    '#7ed321', '#f5a623', '#d0021b', '#9013fe',
                    '#50e3c2', '#b8e986', '#4a4a4a', '#9b9b9b',
                    '#bd10e0', '#b13fc9', '#1976d2', '#388e3c'
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        // Apply color to selected object
                        const canvas = (window as any).zakekeCanvas?.canvas
                        if (canvas) {
                          const activeObject = canvas.getActiveObject()
                          if (activeObject) {
                            activeObject.set('fill', color)
                            canvas.renderAll()
                          }
                        }
                      }}
                      className="aspect-square rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}