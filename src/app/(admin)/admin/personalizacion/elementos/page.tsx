"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Search, Plus, Trash2, Eye, Edit, Settings, Type, Image as ImageIcon, Shapes, Star, FileImage, Copy } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "react-hot-toast"

interface Product {
  id: string
  name: string
  slug: string
}

interface ProductSide {
  id: string
  name: string
  product: Product
}

interface PrintArea {
  id: string
  name: string
  printingMethod: string
  allowText: boolean
  allowImages: boolean
  allowShapes: boolean
  allowClipart: boolean
  side: ProductSide
}

interface DesignElement {
  id: string
  type: 'TEXT' | 'IMAGE' | 'SHAPE' | 'CLIPART' | 'SVG'
  content: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
  opacity: number
  style: Record<string, any>
  zIndex: number
  isLocked: boolean
  isVisible: boolean
  createdAt: string
  printArea: PrintArea
  orderItem?: {
    id: string
    orderId: string
  }
}

const ELEMENT_TYPES = [
  { value: 'TEXT', label: 'Texto', icon: Type, color: 'bg-blue-100 text-blue-700' },
  { value: 'IMAGE', label: 'Imagen', icon: ImageIcon, color: 'bg-green-100 text-green-700' },
  { value: 'SHAPE', label: 'Forma', icon: Shapes, color: 'bg-purple-100 text-purple-700' },
  { value: 'CLIPART', label: 'Clipart', icon: Star, color: 'bg-orange-100 text-orange-700' },
  { value: 'SVG', label: 'SVG', icon: FileImage, color: 'bg-indigo-100 text-indigo-700' }
]

export default function ElementosPersonalizacion() {
  const [elements, setElements] = useState<DesignElement[]>([])
  const [printAreas, setPrintAreas] = useState<PrintArea[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedArea, setSelectedArea] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("list")

  // Form for new element
  const [showNewElementForm, setShowNewElementForm] = useState(false)
  const [newElementData, setNewElementData] = useState({
    printAreaId: "",
    type: "TEXT" as const,
    content: "",
    x: 50,
    y: 50,
    width: 200,
    height: 50,
    rotation: 0,
    opacity: 1,
    style: {} as Record<string, any>,
    zIndex: 0,
    isVisible: true,
    isLocked: false
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch all design elements
      const elementsResponse = await fetch('/api/personalization/elements')
      if (elementsResponse.ok) {
        const elementsData = await elementsResponse.json()
        setElements(elementsData.data || [])
      }

      // Fetch all print areas for the filter
      const areasResponse = await fetch('/api/personalization/areas')
      if (areasResponse.ok) {
        const areasData = await areasResponse.json()
        setPrintAreas(areasData.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateElement = async () => {
    if (!newElementData.printAreaId || !newElementData.content.trim()) {
      toast.error('Área de impresión y contenido son requeridos')
      return
    }

    try {
      const response = await fetch('/api/personalization/elements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newElementData)
      })

      if (response.ok) {
        const data = await response.json()
        setElements(prev => [...prev, data.data])
        setNewElementData({
          printAreaId: "",
          type: "TEXT",
          content: "",
          x: 50,
          y: 50,
          width: 200,
          height: 50,
          rotation: 0,
          opacity: 1,
          style: {},
          zIndex: 0,
          isVisible: true,
          isLocked: false
        })
        setShowNewElementForm(false)
        toast.success('Elemento creado exitosamente')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear el elemento')
      }
    } catch (error) {
      console.error('Error creating element:', error)
      toast.error('Error al crear el elemento')
    }
  }

  const handleDeleteElement = async (elementId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este elemento?')) return

    try {
      const response = await fetch(`/api/personalization/elements/${elementId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setElements(prev => prev.filter(element => element.id !== elementId))
        toast.success('Elemento eliminado exitosamente')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar el elemento')
      }
    } catch (error) {
      console.error('Error deleting element:', error)
      toast.error('Error al eliminar el elemento')
    }
  }

  const handleDuplicateElement = async (element: DesignElement) => {
    const duplicatedData = {
      printAreaId: element.printArea.id,
      type: element.type,
      content: element.content,
      x: element.x + 10,
      y: element.y + 10,
      width: element.width,
      height: element.height,
      rotation: element.rotation,
      scaleX: element.scaleX,
      scaleY: element.scaleY,
      opacity: element.opacity,
      style: element.style,
      zIndex: element.zIndex + 1,
      isVisible: element.isVisible,
      isLocked: false
    }

    try {
      const response = await fetch('/api/personalization/elements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatedData)
      })

      if (response.ok) {
        const data = await response.json()
        setElements(prev => [...prev, data.data])
        toast.success('Elemento duplicado exitosamente')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al duplicar el elemento')
      }
    } catch (error) {
      console.error('Error duplicating element:', error)
      toast.error('Error al duplicar el elemento')
    }
  }

  // Filter elements
  const filteredElements = elements.filter(element => {
    const matchesSearch = element.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         element.printArea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         element.printArea.side.product.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === "all" || element.type === selectedType
    const matchesArea = selectedArea === "all" || element.printArea.id === selectedArea

    return matchesSearch && matchesType && matchesArea
  })

  // Group by type for stats
  const elementsByType = ELEMENT_TYPES.map(type => ({
    ...type,
    count: elements.filter(el => el.type === type.value).length
  }))

  const getElementIcon = (type: string) => {
    const elementType = ELEMENT_TYPES.find(t => t.value === type)
    return elementType?.icon || Type
  }

  const getElementColor = (type: string) => {
    const elementType = ELEMENT_TYPES.find(t => t.value === type)
    return elementType?.color || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/personalizacion">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Cargando elementos...</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando elementos de diseño...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/personalizacion">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Elementos de Personalización</h1>
          <p className="text-gray-600 mt-1">Gestiona los elementos de diseño creados en las áreas de personalización</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{elements.length}</div>
            <div className="text-sm text-gray-600">Total Elementos</div>
          </CardContent>
        </Card>
        {elementsByType.map((type) => {
          const Icon = type.icon
          return (
            <Card key={type.value}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="text-2xl font-bold">{type.count}</div>
                <div className="text-sm text-gray-600">{type.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lista de Elementos</TabsTrigger>
          <TabsTrigger value="create">Crear Elemento</TabsTrigger>
        </TabsList>

        {/* Elements List Tab */}
        <TabsContent value="list" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Buscar por contenido, área o producto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="type">Tipo de Elemento</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      {ELEMENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="area">Área de Impresión</Label>
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las áreas</SelectItem>
                      {printAreas.map(area => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.side.product.name} - {area.side.name} - {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Elements Grid */}
          {filteredElements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredElements.map((element) => {
                const Icon = getElementIcon(element.type)
                return (
                  <Card key={element.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${getElementColor(element.type)}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {element.type === 'TEXT' ? element.content.substring(0, 20) + (element.content.length > 20 ? '...' : '') : `${element.type} Element`}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {element.printArea.side.product.name}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicateElement(element)}
                            title="Duplicar"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteElement(element.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm space-y-1">
                        <p><strong>Área:</strong> {element.printArea.name}</p>
                        <p><strong>Lado:</strong> {element.printArea.side.name}</p>
                        <p><strong>Posición:</strong> ({Math.round(element.x)}, {Math.round(element.y)})</p>
                        <p><strong>Tamaño:</strong> {Math.round(element.width)}x{Math.round(element.height)}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {element.orderItem && (
                          <Badge variant="outline" className="text-xs">
                            Pedido: {element.orderItem.orderId.slice(-8)}
                          </Badge>
                        )}
                        {element.isLocked && <Badge variant="outline" className="text-xs">Bloqueado</Badge>}
                        {!element.isVisible && <Badge variant="secondary" className="text-xs">Oculto</Badge>}
                        <Badge variant="outline" className="text-xs">
                          Z: {element.zIndex}
                        </Badge>
                      </div>

                      {element.type === 'TEXT' && (
                        <div className="p-2 bg-gray-50 rounded text-sm">
                          "{element.content}"
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron elementos</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedType !== "all" || selectedArea !== "all" 
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "Aún no hay elementos de diseño creados"}
                </p>
                {(!searchTerm && selectedType === "all" && selectedArea === "all") && (
                  <Button onClick={() => setActiveTab("create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Elemento
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Create Element Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Elemento</CardTitle>
              <CardDescription>
                Agrega un nuevo elemento de diseño a un área de impresión específica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="elementArea">Área de Impresión *</Label>
                  <Select 
                    value={newElementData.printAreaId} 
                    onValueChange={(value) => setNewElementData(prev => ({ ...prev, printAreaId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un área..." />
                    </SelectTrigger>
                    <SelectContent>
                      {printAreas.map(area => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.side.product.name} - {area.side.name} - {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="elementType">Tipo de Elemento *</Label>
                  <Select 
                    value={newElementData.type} 
                    onValueChange={(value: any) => setNewElementData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ELEMENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="elementContent">Contenido *</Label>
                <Textarea
                  id="elementContent"
                  value={newElementData.content}
                  onChange={(e) => setNewElementData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={
                    newElementData.type === 'TEXT' ? 'Ingresa el texto...' :
                    newElementData.type === 'IMAGE' ? 'URL de la imagen...' :
                    newElementData.type === 'SVG' ? 'Código SVG...' :
                    'Contenido del elemento...'
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="elementX">Posición X</Label>
                  <Input
                    id="elementX"
                    type="number"
                    value={newElementData.x}
                    onChange={(e) => setNewElementData(prev => ({ ...prev, x: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="elementY">Posición Y</Label>
                  <Input
                    id="elementY"
                    type="number"
                    value={newElementData.y}
                    onChange={(e) => setNewElementData(prev => ({ ...prev, y: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="elementWidth">Ancho</Label>
                  <Input
                    id="elementWidth"
                    type="number"
                    value={newElementData.width}
                    onChange={(e) => setNewElementData(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="elementHeight">Alto</Label>
                  <Input
                    id="elementHeight"
                    type="number"
                    value={newElementData.height}
                    onChange={(e) => setNewElementData(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="elementRotation">Rotación (grados)</Label>
                  <Input
                    id="elementRotation"
                    type="number"
                    value={newElementData.rotation}
                    onChange={(e) => setNewElementData(prev => ({ ...prev, rotation: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="elementOpacity">Opacidad</Label>
                  <Input
                    id="elementOpacity"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={newElementData.opacity}
                    onChange={(e) => setNewElementData(prev => ({ ...prev, opacity: parseFloat(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="elementZIndex">Índice Z</Label>
                  <Input
                    id="elementZIndex"
                    type="number"
                    value={newElementData.zIndex}
                    onChange={(e) => setNewElementData(prev => ({ ...prev, zIndex: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="elementVisible"
                    checked={newElementData.isVisible}
                    onCheckedChange={(checked) => setNewElementData(prev => ({ ...prev, isVisible: checked }))}
                  />
                  <Label htmlFor="elementVisible">Visible</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateElement}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Elemento
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setNewElementData({
                      printAreaId: "",
                      type: "TEXT",
                      content: "",
                      x: 50,
                      y: 50,
                      width: 200,
                      height: 50,
                      rotation: 0,
                      opacity: 1,
                      style: {},
                      zIndex: 0,
                      isVisible: true,
                      isLocked: false
                    })
                  }}
                >
                  Limpiar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}