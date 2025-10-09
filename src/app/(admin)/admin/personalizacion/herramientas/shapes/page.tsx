"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { 
  Upload, 
  Trash2, 
  Edit, 
  Search, 
  Plus, 
  Shapes, 
  Star,
  Grid3x3,
  Package,
  Eye,
  Ban,
  Tag,
  Settings,
  FolderOpen
} from "lucide-react"
import toast from "react-hot-toast"

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

interface Category {
  category: string
  label: string
  count: number
  isPredefined: boolean
}

const predefinedCategories = [
  { category: 'geometricas', label: 'Geométricas' },
  { category: 'decorativas', label: 'Decorativas' },
  { category: 'letras', label: 'Letras' },
  { category: 'marcos', label: 'Marcos' },
  { category: 'naturaleza', label: 'Naturaleza' },
  { category: 'general', label: 'General' }
]

export default function ShapesPage() {
  const [shapes, setShapes] = useState<Shape[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showMasksOnly, setShowMasksOnly] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("formas")
  const [editingShape, setEditingShape] = useState<Shape | null>(null)

  // Formulario de nueva forma
  const [formData, setFormData] = useState({
    name: "",
    category: "general",
    isMask: true, // Por defecto habilitado como máscara
    tags: "",
    file: null as File | null
  })

  // Formulario de edición
  const [editFormData, setEditFormData] = useState({
    name: "",
    category: "",
    tags: ""
  })

  // Formulario de nueva categoría
  const [newCategoryName, setNewCategoryName] = useState("")

  useEffect(() => {
    fetchShapes()
    fetchCategories()
  }, [])

  const fetchShapes = async () => {
    try {
      const response = await fetch('/api/personalization/shapes')
      if (response.ok) {
        const data = await response.json()
        setShapes(data)
      }
    } catch (error) {
      console.error('Error fetching shapes:', error)
      toast.error('Error al cargar formas')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/personalization/shapes/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        // Si falla, usar categorías predefinidas
        const defaultCategories = predefinedCategories.map(cat => ({
          ...cat,
          count: 0,
          isPredefined: true
        }))
        setCategories(defaultCategories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      // En caso de error, usar categorías predefinidas
      const defaultCategories = predefinedCategories.map(cat => ({
        ...cat,
        count: 0,
        isPredefined: true
      }))
      setCategories(defaultCategories)
    }
  }

  const handleUpload = async () => {
    if (!formData.file) {
      toast.error('Por favor selecciona un archivo')
      return
    }

    const form = new FormData()
    form.append('file', formData.file)
    form.append('name', formData.name || formData.file.name)
    form.append('category', formData.category)
    form.append('isMask', formData.isMask.toString())
    form.append('tags', formData.tags)

    try {
      const response = await fetch('/api/personalization/shapes', {
        method: 'POST',
        body: form
      })

      if (response.ok) {
        toast.success('Forma subida exitosamente')
        setIsUploadModalOpen(false)
        setFormData({
          name: "",
          category: "general",
          isMask: true,
          tags: "",
          file: null
        })
        fetchShapes()
        fetchCategories()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al subir forma')
      }
    } catch (error) {
      console.error('Error uploading shape:', error)
      toast.error('Error al subir forma')
    }
  }

  const handleEdit = (shape: Shape) => {
    setEditingShape(shape)
    setEditFormData({
      name: shape.name,
      category: shape.category,
      tags: shape.tags.join(', ')
    })
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingShape) return

    try {
      const response = await fetch(`/api/personalization/shapes/${editingShape.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editFormData.name,
          category: editFormData.category,
          tags: editFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      })

      if (response.ok) {
        toast.success('Forma actualizada exitosamente')
        setIsEditModalOpen(false)
        setEditingShape(null)
        fetchShapes()
        fetchCategories()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al actualizar forma')
      }
    } catch (error) {
      console.error('Error updating shape:', error)
      toast.error('Error al actualizar forma')
    }
  }

  const handleDelete = async (shapeId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta forma?')) {
      return
    }

    try {
      const response = await fetch(`/api/personalization/shapes/${shapeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Forma eliminada exitosamente')
        fetchShapes()
        fetchCategories()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar forma')
      }
    } catch (error) {
      console.error('Error deleting shape:', error)
      toast.error('Error al eliminar forma')
    }
  }

  const handleToggleMask = async (shape: Shape) => {
    try {
      const response = await fetch(`/api/personalization/shapes/${shape.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: shape.name,
          category: shape.category,
          tags: shape.tags,
          isMask: !shape.isMask
        })
      })

      if (response.ok) {
        toast.success(`Forma ${!shape.isMask ? 'habilitada' : 'deshabilitada'} como máscara`)
        fetchShapes()
      } else {
        toast.error('Error al actualizar forma')
      }
    } catch (error) {
      console.error('Error updating shape:', error)
      toast.error('Error al actualizar forma')
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Por favor ingresa un nombre para la categoría')
      return
    }

    try {
      const response = await fetch('/api/personalization/shapes/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newCategoryName })
      })

      if (response.ok) {
        const newCategory = await response.json()
        
        // Agregar la nueva categoría al estado local
        setCategories(prevCategories => [...prevCategories, newCategory])
        
        toast.success('Categoría creada exitosamente')
        setIsCategoryModalOpen(false)
        setNewCategoryName("")
        
        // Actualizar el formulario para usar la nueva categoría
        setFormData(prev => ({ ...prev, category: newCategory.category }))
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear categoría')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Error al crear categoría')
    }
  }

  const handleDeleteCategory = async (categoryToDelete: string) => {
    // Verificar si la categoría tiene formas
    const categoryWithShapes = categories.find(cat => cat.category === categoryToDelete)
    if (categoryWithShapes && categoryWithShapes.count > 0) {
      toast.error(`No se puede eliminar la categoría "${categoryWithShapes.label}" porque contiene ${categoryWithShapes.count} forma(s)`)
      return
    }

    if (!confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoryWithShapes?.label}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/personalization/shapes/categories/${categoryToDelete}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remover la categoría del estado local
        setCategories(prevCategories => 
          prevCategories.filter(cat => cat.category !== categoryToDelete)
        )
        toast.success('Categoría eliminada exitosamente')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar categoría')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Error al eliminar categoría')
    }
  }

  const filteredShapes = shapes.filter(shape => {
    const matchesSearch = shape.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shape.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || shape.category === selectedCategory
    const matchesMask = !showMasksOnly || shape.isMask
    
    return matchesSearch && matchesCategory && matchesMask
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando formas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formas y Máscaras</h1>
          <p className="text-gray-600 mt-1">
            Gestiona la galería de formas que tus clientes pueden usar para decorar productos
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setActiveTab("categorias")}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Gestionar Categorías
          </Button>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Subir Forma
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="formas">Formas</TabsTrigger>
          <TabsTrigger value="categorias">Categorías</TabsTrigger>
        </TabsList>
        
        <TabsContent value="formas" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Formas</CardTitle>
                <Shapes className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shapes.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Máscaras Activas</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {shapes.filter(s => s.isMask).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                <Grid3x3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usos Totales</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {shapes.reduce((sum, shape) => sum + shape._count.usages, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar formas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.category} value={cat.category}>
                        {cat.label} ({cat.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="masks-only"
                    checked={showMasksOnly}
                    onCheckedChange={setShowMasksOnly}
                  />
                  <Label htmlFor="masks-only">Solo máscaras</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shapes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredShapes.map((shape) => (
              <Card key={shape.id} className="relative group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  {/* Shape Preview */}
                  <div className="aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {shape.fileType === 'image/svg+xml' ? (
                      <div className="w-full h-full flex items-center justify-center p-2">
                        <img
                          src={shape.fileUrl}
                          alt={shape.name}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'block';
                          }}
                        />
                        <Shapes className="h-12 w-12 text-gray-400" style={{ display: 'none' }} />
                      </div>
                    ) : (
                      <img
                        src={shape.fileUrl}
                        alt={shape.name}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                    )}
                    <Shapes className="h-12 w-12 text-gray-400" style={{ display: 'none' }} />
                  </div>

                  {/* Shape Info */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm truncate" title={shape.name}>
                      {shape.name}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant={shape.isMask ? "default" : "secondary"} className="text-xs">
                        {shape.isMask ? "Máscara" : "Forma"}
                      </Badge>
                    </div>

                    <div className="text-xs text-gray-500">
                      {categories.find(c => c.category === shape.category)?.label || shape.category}
                    </div>

                    {shape._count.usages > 0 && (
                      <div className="text-xs text-green-600">
                        {shape._count.usages} uso(s)
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-2 border-t">
                      <button
                        onClick={() => handleToggleMask(shape)}
                        className={`p-1.5 rounded-full transition-colors ${
                          shape.isMask 
                            ? 'text-red-600 hover:bg-red-100' 
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={shape.isMask ? "Desactivar como máscara" : "Activar como máscara"}
                      >
                        {shape.isMask ? <Ban className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>

                      <button
                        onClick={() => handleEdit(shape)}
                        className="p-1.5 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Editar forma"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(shape.id)}
                        className="p-1.5 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                        title="Eliminar forma"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredShapes.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Shapes className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron formas</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedCategory !== "all" || showMasksOnly
                    ? "Prueba ajustando los filtros de búsqueda"
                    : "Comienza subiendo tu primera forma"
                  }
                </p>
                {!searchTerm && selectedCategory === "all" && !showMasksOnly && (
                  <Button onClick={() => setIsUploadModalOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Forma
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categorias" className="space-y-6">
          {/* Categories Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestión de Categorías</CardTitle>
                  <CardDescription>
                    Administra las categorías para organizar tus formas
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCategoryModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Categoría
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.category} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{category.label}</h3>
                        {!category.isPredefined && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.category)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {category.count} forma(s)
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant={category.isPredefined ? "default" : "secondary"}>
                          {category.isPredefined ? "Predefinida" : "Personalizada"}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          {category.category}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subir Nueva Forma</DialogTitle>
            <DialogDescription>
              Sube archivos PNG o SVG para crear formas que tus clientes puedan usar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Archivo (PNG o SVG)</Label>
              <Input
                id="file"
                type="file"
                accept=".png,.svg"
                onChange={(e) => setFormData({
                  ...formData,
                  file: e.target.files?.[0] || null
                })}
              />
            </div>

            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nombre de la forma"
              />
            </div>

            <div>
              <Label htmlFor="category">Categoría</Label>
              <div className="flex gap-2">
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="flex-1 h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsCategoryModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="decorativa, estrella, navidad"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="noMask"
                checked={!formData.isMask}
                onCheckedChange={(checked) => setFormData({...formData, isMask: !checked})}
              />
              <Label htmlFor="noMask">No usar como máscara</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={!formData.file}>
              Subir Forma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Forma</DialogTitle>
            <DialogDescription>
              Modifica el nombre, categoría y etiquetas de la forma
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                placeholder="Nombre de la forma"
              />
            </div>

            <div>
              <Label htmlFor="edit-category">Categoría</Label>
              <select 
                value={editFormData.category} 
                onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {categories.map((cat) => (
                  <option key={cat.category} value={cat.category}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="edit-tags">Etiquetas (separadas por comas)</Label>
              <Input
                id="edit-tags"
                value={editFormData.tags}
                onChange={(e) => setEditFormData({...editFormData, tags: e.target.value})}
                placeholder="decorativa, estrella, navidad"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Categoría</DialogTitle>
            <DialogDescription>
              Crea una nueva categoría para organizar tus formas
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Nombre de la categoría</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="ej: Animales, Deportes, etc."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim()}>
              Crear Categoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}