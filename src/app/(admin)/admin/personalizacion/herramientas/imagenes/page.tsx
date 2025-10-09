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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Upload, 
  Trash2, 
  Edit, 
  Search, 
  Plus, 
  Image as ImageIcon, 
  Star,
  Grid3x3,
  Package,
  Eye,
  Ban,
  Tag,
  Settings,
  FolderOpen,
  Link as LinkIcon,
  TreeDeciduous,
  Folder,
  ChevronDown,
  ChevronRight,
  ArrowUp
} from "lucide-react"
import toast from "react-hot-toast"
import AddCategoryModal from "@/components/admin/personalization/AddCategoryModal"
import AddCategoryToMacroModal from "@/components/admin/personalization/AddCategoryToMacroModal"
import UploadImageToCategoryModal from "@/components/admin/personalization/UploadImageToCategoryModal"
import UniversalProductLinkModal from "@/components/admin/personalization/UniversalProductLinkModal"

interface ImageGallery {
  id: string
  name: string
  categoryId?: string
  macroCategoryId?: string
  fileUrl: string
  thumbnailUrl?: string
  isActive: boolean
  tags: string[]
  isFromLibrary: boolean
  fileType?: string
  fileSize?: number
  width?: number
  height?: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
  category?: {
    id: string
    slug: string
    name: string
    macroCategory?: {
      id: string
      slug: string
      name: string
    }
  }
  macroCategory?: {
    id: string
    slug: string
    name: string
  }
  _count: {
    usages: number
    linkedProducts: number
  }
}

interface MacroCategory {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  sortOrder: number
  isActive: boolean
  totalImages: number
  totalCategories: number
  categories: Category[]
}

interface Category {
  id: string
  slug: string
  name: string
  description?: string
  macroCategoryId?: string
  macroCategory?: {
    id: string
    slug: string
    name: string
  }
  sortOrder: number
  isActive: boolean
  imageCount: number
  createdAt: string
  updatedAt: string
}

export default function ImagenesPage() {
  const [images, setImages] = useState<ImageGallery[]>([])
  const [macroCategories, setMacroCategories] = useState<MacroCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMacroCategory, setSelectedMacroCategory] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [activeTab, setActiveTab] = useState("imagenes")
  const [expandedMacroCategories, setExpandedMacroCategories] = useState<Set<string>>(new Set())

  // Modales
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
  const [isAddCategoryToMacroModalOpen, setIsAddCategoryToMacroModalOpen] = useState(false)
  const [isUploadToCategoryModalOpen, setIsUploadToCategoryModalOpen] = useState(false)
  const [isUniversalLinkModalOpen, setIsUniversalLinkModalOpen] = useState(false)

  // Estados de formularios
  const [editingImage, setEditingImage] = useState<ImageGallery | null>(null)
  const [selectedMacroForCategory, setSelectedMacroForCategory] = useState<MacroCategory | null>(null)
  const [selectedCategoryForUpload, setSelectedCategoryForUpload] = useState<Category | null>(null)
  const [universalLinkItem, setUniversalLinkItem] = useState<{
    id: string
    name: string
    type: "macrocategory" | "category" | "image"
  } | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

  // Formulario de nueva imagen
  const [formData, setFormData] = useState({
    name: "",
    macroCategoryId: "none",
    categoryId: "none",
    isActive: true,
    isPublic: true,
    tags: "",
    files: null as FileList | null
  })

  // Formulario de edición
  const [editFormData, setEditFormData] = useState({
    name: "",
    macroCategoryId: "none",
    categoryId: "none",
    tags: "",
    isActive: true,
    isPublic: true
  })

  useEffect(() => {
    fetchImages()
    fetchMacroCategories()
    fetchCategories()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/personalization/images')
      if (response.ok) {
        const data = await response.json()
        setImages(data)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
      toast.error('Error al cargar imágenes')
    } finally {
      setLoading(false)
    }
  }

  const fetchMacroCategories = async () => {
    try {
      const response = await fetch('/api/personalization/images/macro-categories')
      if (response.ok) {
        const data = await response.json()
        // Macrocategorías cargadas exitosamente
        setMacroCategories(data)
      } else {
        console.error('Error en respuesta de macrocategorías:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching macro categories:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/personalization/images/categories')
      if (response.ok) {
        const data = await response.json()
        // Categorías cargadas exitosamente
        setCategories(data)
      } else {
        console.error('Error en respuesta de categorías:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setCategoriesLoading(false)
    }
  }

  const refreshData = () => {
    fetchImages()
    fetchMacroCategories()
    fetchCategories()
  }

  const handleUpload = async () => {
    if (!formData.files || formData.files.length === 0) {
      toast.error('Por favor selecciona al menos una imagen')
      return
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp']
    const invalidFiles = Array.from(formData.files).filter(file => !validTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
      toast.error('Solo se permiten archivos de imagen (PNG, JPG, GIF, WEBP, SVG, BMP)')
      return
    }

    const form = new FormData()
    
    Array.from(formData.files).forEach((file) => {
      form.append(`files`, file)
    })
    
    if (formData.macroCategoryId && formData.macroCategoryId !== "none") {
      form.append('macroCategoryId', formData.macroCategoryId)
    }
    if (formData.categoryId && formData.categoryId !== "none") {
      form.append('categoryId', formData.categoryId)
    }
    form.append('isActive', formData.isActive.toString())
    form.append('isPublic', formData.isPublic.toString())
    form.append('tags', formData.tags)
    form.append('baseName', formData.name)

    try {
      const response = await fetch('/api/personalization/images', {
        method: 'POST',
        body: form
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`${result.uploaded} imagen(es) subida(s) exitosamente`)
        setIsUploadModalOpen(false)
        resetUploadForm()
        refreshData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al subir imágenes')
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Error al subir imágenes')
    }
  }

  const resetUploadForm = () => {
    setFormData({
      name: "",
      macroCategoryId: "none",
      categoryId: "none",
      isActive: true,
      isPublic: true,
      tags: "",
      files: null
    })
    setSelectedFiles(null)
  }

  const handleEdit = (image: ImageGallery) => {
    setEditingImage(image)
    setEditFormData({
      name: image.name,
      macroCategoryId: image.macroCategoryId || "none",
      categoryId: image.categoryId || "none",
      tags: image.tags.join(', '),
      isActive: image.isActive,
      isPublic: image.isPublic
    })
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingImage) return

    try {
      const response = await fetch(`/api/personalization/images/${editingImage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editFormData.name,
          macroCategoryId: editFormData.macroCategoryId === "none" ? null : editFormData.macroCategoryId,
          categoryId: editFormData.categoryId === "none" ? null : editFormData.categoryId,
          tags: editFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          isActive: editFormData.isActive,
          isPublic: editFormData.isPublic
        })
      })

      if (response.ok) {
        toast.success('Imagen actualizada exitosamente')
        setIsEditModalOpen(false)
        setEditingImage(null)
        refreshData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al actualizar imagen')
      }
    } catch (error) {
      console.error('Error updating image:', error)
      toast.error('Error al actualizar imagen')
    }
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return
    }

    try {
      const response = await fetch(`/api/personalization/images/${imageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Imagen eliminada exitosamente')
        refreshData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar imagen')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Error al eliminar imagen')
    }
  }

  const handleUniversalLink = (item: { id: string; name: string; type: "macrocategory" | "category" | "image" }) => {
    setUniversalLinkItem(item)
    setIsUniversalLinkModalOpen(true)
  }

  const handleAddCategoryToMacro = (macroCategory: MacroCategory) => {
    setSelectedMacroForCategory(macroCategory)
    setIsAddCategoryToMacroModalOpen(true)
  }

  const handleUploadToCategory = (category: Category) => {
    setSelectedCategoryForUpload(category)
    setIsUploadToCategoryModalOpen(true)
  }

  const toggleMacroCategory = (macroId: string) => {
    const newExpanded = new Set(expandedMacroCategories)
    if (newExpanded.has(macroId)) {
      newExpanded.delete(macroId)
    } else {
      newExpanded.add(macroId)
    }
    setExpandedMacroCategories(newExpanded)
  }

  const filteredImages = images.filter(image => {
    const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesMacroCategory = selectedMacroCategory === "all" || 
                                image.macroCategoryId === selectedMacroCategory ||
                                image.category?.macroCategory?.id === selectedMacroCategory
    
    const matchesCategory = selectedCategory === "all" || image.categoryId === selectedCategory
    
    const matchesActive = !showActiveOnly || image.isActive
    
    return matchesSearch && matchesMacroCategory && matchesCategory && matchesActive
  })

  const getCategoriesForMacroCategory = (macroCategoryId: string) => {
    return categories.filter(cat => cat.macroCategoryId === macroCategoryId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando imágenes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Imágenes y Galerías Prediseñadas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona la galería de imágenes prediseñadas que tus clientes pueden usar para personalizar productos
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
            Subir Imágenes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="imagenes">Imágenes</TabsTrigger>
          <TabsTrigger value="categorias">Categorías</TabsTrigger>
        </TabsList>
        
        <TabsContent value="imagenes" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Imágenes</CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{images.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activas</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {images.filter(img => img.isActive).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Macrocategorías</CardTitle>
                <TreeDeciduous className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{macroCategories.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usos Totales</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {images.reduce((sum, image) => sum + image._count.usages, 0)}
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
                      placeholder="Buscar imágenes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedMacroCategory} onValueChange={setSelectedMacroCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Macrocategoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las macrocategorías</SelectItem>
                    {macroCategories.map((macro) => (
                      <SelectItem key={macro.id} value={macro.id}>
                        {macro.name} ({macro.totalImages})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name} ({cat.imageCount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active-only"
                    checked={showActiveOnly}
                    onCheckedChange={setShowActiveOnly}
                  />
                  <Label htmlFor="active-only">Solo activas</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredImages.map((image) => (
              <Card key={image.id} className="relative group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  {/* Image Preview */}
                  <div className="aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img
                      src={image.thumbnailUrl || image.fileUrl}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'block';
                      }}
                    />
                    <ImageIcon className="h-12 w-12 text-gray-400" style={{ display: 'none' }} />
                  </div>

                  {/* Image Info */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm truncate" title={image.name}>
                      {image.name}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant={image.isActive ? "default" : "secondary"} className="text-xs">
                        {image.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                      {!image.isPublic && (
                        <Badge variant="outline" className="text-xs">
                          Privada
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      {image.category?.name || image.macroCategory?.name || 'Sin categoría'}
                    </div>

                    {(image._count.usages > 0 || image._count.linkedProducts > 0) && (
                      <div className="flex gap-2 text-xs">
                        {image._count.usages > 0 && (
                          <span className="text-green-600">{image._count.usages} uso(s)</span>
                        )}
                        {image._count.linkedProducts > 0 && (
                          <span className="text-blue-600">{image._count.linkedProducts} producto(s)</span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-2 border-t">
                      <button
                        onClick={() => handleUniversalLink({ id: image.id, name: image.name, type: "image" })}
                        className="p-1.5 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Vincular a productos"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleEdit(image)}
                        className="p-1.5 rounded-full text-orange-600 hover:bg-orange-100 transition-colors"
                        title="Editar imagen"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(image.id)}
                        className="p-1.5 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron imágenes</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedMacroCategory !== "all" || selectedCategory !== "all" || showActiveOnly
                    ? "Prueba ajustando los filtros de búsqueda"
                    : "Comienza subiendo tu primera imagen"
                  }
                </p>
                {!searchTerm && selectedMacroCategory === "all" && selectedCategory === "all" && !showActiveOnly && (
                  <Button onClick={() => setIsUploadModalOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Imágenes
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categorias" className="space-y-6">
          {/* Categories Tree View */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestión de Categorías</CardTitle>
                  <CardDescription>
                    Administra las macrocategorías y categorías en vista de árbol
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddCategoryModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Categoría
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {macroCategories.map((macroCategory) => (
                  <div key={macroCategory.id} className="border rounded-lg">
                    <Collapsible
                      open={expandedMacroCategories.has(macroCategory.id)}
                      onOpenChange={() => toggleMacroCategory(macroCategory.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center gap-3">
                            {expandedMacroCategories.has(macroCategory.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <TreeDeciduous className="h-5 w-5 text-orange-600" />
                            <div>
                              <h3 className="font-semibold">{macroCategory.name}</h3>
                              <p className="text-sm text-gray-600">
                                {macroCategory.totalCategories} categoría(s) • {macroCategory.totalImages} imagen(es)
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant={macroCategory.isActive ? "default" : "secondary"} className="text-xs">
                              {macroCategory.isActive ? 'Activa' : 'Inactiva'}
                            </Badge>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleUniversalLink({ 
                                  id: macroCategory.id, 
                                  name: macroCategory.name, 
                                  type: "macrocategory" 
                                })
                              }}
                              className="p-1.5 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Vincular a productos"
                            >
                              <LinkIcon className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAddCategoryToMacro(macroCategory)
                              }}
                              className="p-1.5 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                              title="Agregar categoría"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                // handleEditMacroCategory(macroCategory)
                              }}
                              className="p-1.5 rounded-full text-orange-600 hover:bg-orange-100 transition-colors"
                              title="Editar macrocategoría"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                // handleDeleteMacroCategory(macroCategory.id)
                              }}
                              className="p-1.5 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                              title="Eliminar macrocategoría"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="pl-8 pr-4 pb-4">
                          {getCategoriesForMacroCategory(macroCategory.id).map((category) => (
                            <div key={category.id} className="flex items-center justify-between py-2 border-l-2 border-gray-200 pl-4 ml-2">
                              <div className="flex items-center gap-3">
                                <Folder className="h-4 w-4 text-blue-600" />
                                <div>
                                  <h4 className="font-medium">{category.name}</h4>
                                  <p className="text-sm text-gray-600">
                                    {category.imageCount} imagen(es)
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge variant={category.isActive ? "default" : "secondary"} className="text-xs">
                                  {category.isActive ? 'Activa' : 'Inactiva'}
                                </Badge>
                                
                                <button
                                  onClick={() => handleUniversalLink({ 
                                    id: category.id, 
                                    name: category.name, 
                                    type: "category" 
                                  })}
                                  className="p-1.5 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                                  title="Vincular a productos"
                                >
                                  <LinkIcon className="h-4 w-4" />
                                </button>
                                
                                <button
                                  onClick={() => handleUploadToCategory(category)}
                                  className="p-1.5 rounded-full text-purple-600 hover:bg-purple-100 transition-colors"
                                  title="Subir imagen a esta categoría"
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </button>
                                
                                <button
                                  onClick={() => {
                                    // handleEditCategory(category)
                                  }}
                                  className="p-1.5 rounded-full text-orange-600 hover:bg-orange-100 transition-colors"
                                  title="Editar categoría"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                
                                <button
                                  onClick={() => {
                                    // handleDeleteCategory(category.id)
                                  }}
                                  className="p-1.5 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                                  title="Eliminar categoría"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          
                          {getCategoriesForMacroCategory(macroCategory.id).length === 0 && (
                            <div className="text-center py-4 text-gray-500 border-l-2 border-gray-200 pl-4 ml-2">
                              <Folder className="h-6 w-6 mx-auto mb-2" />
                              <p className="text-sm">No hay categorías en esta macrocategoría</p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                                onClick={() => handleAddCategoryToMacro(macroCategory)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Agregar categoría
                              </Button>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ))}
                
                {macroCategories.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <TreeDeciduous className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hay macrocategorías</h3>
                    <p className="mb-4">Comienza creando tu primera macrocategoría</p>
                    <Button onClick={() => setIsAddCategoryModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Macrocategoría
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subir Nuevas Imágenes</DialogTitle>
            <DialogDescription>
              Sube archivos de imagen para crear una galería
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="files">Archivos de Imagen</Label>
              <Input
                id="files"
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.gif,.webp,.svg,.bmp"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    files: e.target.files
                  })
                  setSelectedFiles(e.target.files)
                }}
              />
              {selectedFiles && selectedFiles.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {selectedFiles.length} archivo(s) seleccionado(s)
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="baseName">Nombre Base (opcional)</Label>
              <Input
                id="baseName"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Si se deja vacío, se usará el nombre del archivo"
              />
            </div>

            <div>
              <Label htmlFor="macroCategory">Macrocategoría</Label>
              {categoriesLoading ? (
                <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  Cargando macrocategorías...
                </div>
              ) : (
                <Select 
                  value={formData.macroCategoryId} 
                  onValueChange={(value) => {
                    setFormData({...formData, macroCategoryId: value, categoryId: "none"})
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar macrocategoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin macrocategoría</SelectItem>
                    {macroCategories.map((macro) => (
                      <SelectItem key={macro.id} value={macro.id}>
                        {macro.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label htmlFor="category">Categoría</Label>
              {categoriesLoading ? (
                <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  Cargando categorías...
                </div>
              ) : (
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(value) => setFormData({...formData, categoryId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin categoría</SelectItem>
                    {categories
                      .filter(cat => formData.macroCategoryId === "none" || cat.macroCategoryId === formData.macroCategoryId)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name} {cat.macroCategory && `(${cat.macroCategory.name})`}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="animales, perros, mascotas"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: !!checked})}
                />
                <Label htmlFor="isActive">Activar imágenes</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({...formData, isPublic: !!checked})}
                />
                <Label htmlFor="isPublic">Públicas</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={!formData.files || formData.files.length === 0}>
              Subir Imágenes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Imagen</DialogTitle>
            <DialogDescription>
              Modifica la información de la imagen
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                placeholder="Nombre de la imagen"
              />
            </div>

            <div>
              <Label htmlFor="edit-macroCategory">Macrocategoría</Label>
              {categoriesLoading ? (
                <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  Cargando macrocategorías...
                </div>
              ) : (
                <Select 
                  value={editFormData.macroCategoryId} 
                  onValueChange={(value) => {
                    setEditFormData({...editFormData, macroCategoryId: value, categoryId: "none"})
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar macrocategoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin macrocategoría</SelectItem>
                    {macroCategories.map((macro) => (
                      <SelectItem key={macro.id} value={macro.id}>
                        {macro.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label htmlFor="edit-category">Categoría</Label>
              {categoriesLoading ? (
                <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  Cargando categorías...
                </div>
              ) : (
                <Select 
                  value={editFormData.categoryId} 
                  onValueChange={(value) => setEditFormData({...editFormData, categoryId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin categoría</SelectItem>
                    {categories
                      .filter(cat => editFormData.macroCategoryId === "none" || cat.macroCategoryId === editFormData.macroCategoryId)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name} {cat.macroCategory && `(${cat.macroCategory.name})`}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label htmlFor="edit-tags">Etiquetas (separadas por comas)</Label>
              <Input
                id="edit-tags"
                value={editFormData.tags}
                onChange={(e) => setEditFormData({...editFormData, tags: e.target.value})}
                placeholder="animales, perros, mascotas"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isActive"
                  checked={editFormData.isActive}
                  onCheckedChange={(checked) => setEditFormData({...editFormData, isActive: !!checked})}
                />
                <Label htmlFor="edit-isActive">Imagen activa</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isPublic"
                  checked={editFormData.isPublic}
                  onCheckedChange={(checked) => setEditFormData({...editFormData, isPublic: !!checked})}
                />
                <Label htmlFor="edit-isPublic">Imagen pública</Label>
              </div>
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

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        macroCategories={macroCategories}
        onSuccess={refreshData}
      />

      {/* Add Category to Macro Modal */}
      <AddCategoryToMacroModal
        isOpen={isAddCategoryToMacroModalOpen}
        onClose={() => {
          setIsAddCategoryToMacroModalOpen(false)
          setSelectedMacroForCategory(null)
        }}
        macroCategory={selectedMacroForCategory}
        onSuccess={refreshData}
      />

      {/* Upload to Category Modal */}
      <UploadImageToCategoryModal
        isOpen={isUploadToCategoryModalOpen}
        onClose={() => {
          setIsUploadToCategoryModalOpen(false)
          setSelectedCategoryForUpload(null)
        }}
        category={selectedCategoryForUpload}
        onSuccess={refreshData}
      />

      {/* Universal Link Modal */}
      <UniversalProductLinkModal
        isOpen={isUniversalLinkModalOpen}
        onClose={() => {
          setIsUniversalLinkModalOpen(false)
          setUniversalLinkItem(null)
        }}
        item={universalLinkItem}
        onSuccess={refreshData}
      />
    </div>
  )
}