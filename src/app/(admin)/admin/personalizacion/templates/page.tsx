"use client"

import { useState, useEffect, Suspense } from "react"
import TemplateEditor from "@/components/admin/templates/TemplateEditor"
import TemplatePreviewRenderer from "@/components/templates/TemplatePreviewRenderer"
import TemplatePreview from "@/components/common/TemplatePreview"
import { 
  Layout, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Settings,
  Grid3x3,
  List,
  Star,
  CheckCircle,
  AlertCircle,
  X,
  Package,
  Tags,
  Image,
  Power,
  PowerOff,
  ArrowLeft,
  ChevronRight,
  Users,
  Calendar,
  TrendingUp
} from "lucide-react"

interface Template {
  id: string
  name: string
  description?: string
  category: string
  subcategory?: string
  thumbnailUrl: string
  previewUrl?: string
  productTypes: string[]
  templateData: any
  allowTextEdit: boolean
  allowColorEdit: boolean
  allowImageEdit: boolean
  editableAreas: string[]
  isPremium: boolean
  isActive: boolean
  isPublic: boolean
  isDefaultForAllVariants: boolean
  usageCount: number
  rating?: number
  createdBy?: string
  createdAt: string
  updatedAt: string
}

interface ProductWithTemplates {
  id: string
  name: string
  description?: string
  basePrice: number
  images: string[]
  isPersonalizable: boolean
  createdAt: string
  templatesCount: number
  activeTemplatesCount: number
  hasDefaultTemplate: boolean
  defaultTemplateName?: string
  templates: Template[]
  sidesCount: number
  areasCount: number
  hasPersonalizationAreas: boolean
}

interface Category {
  id: string
  name: string
  subcategories: string[]
}

export default function TemplatesPage() {
  // Estados para la vista de productos
  const [productsWithTemplates, setProductsWithTemplates] = useState<ProductWithTemplates[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Estados para la vista de plantillas de un producto específico
  const [selectedProduct, setSelectedProduct] = useState<ProductWithTemplates | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [templateSearchTerm, setTemplateSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Estados para el editor
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [selectedProductId, setSelectedProductId] = useState("")
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [selectedCategoryName, setSelectedCategoryName] = useState("")
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const [categories] = useState<Category[]>([
    {
      id: "1",
      name: "Ropa",
      subcategories: ["Camisetas", "Hoodies", "Chaquetas"]
    },
    {
      id: "2", 
      name: "Accesorios",
      subcategories: ["Gorras", "Bolsas", "Tazas"]
    },
    {
      id: "3",
      name: "Geométricas",
      subcategories: ["Círculos", "Rectángulos", "Triángulos"]
    },
    {
      id: "4",
      name: "Decorativas", 
      subcategories: ["Estrellas", "Corazones", "Flores"]
    },
    {
      id: "5",
      name: "Letras",
      subcategories: ["Alfabeto", "Números", "Símbolos"]
    },
    {
      id: "6",
      name: "Marcos",
      subcategories: ["Bordes", "Marcos decorativos", "Esquinas"]
    },
    {
      id: "7",
      name: "Naturaleza",
      subcategories: ["Plantas", "Animales", "Paisajes"]
    }
  ])

  useEffect(() => {
    loadProductsWithTemplates()
  }, [])

  const loadProductsWithTemplates = async () => {
    try {
      setLoadingProducts(true)
      
      // En desarrollo, usar endpoint sin autenticación para evitar problemas de sesión
      const endpoint = process.env.NODE_ENV === 'development' 
        ? '/api/admin/products-with-templates-dev'
        : '/api/admin/products-with-templates'
      
      const response = await fetch(endpoint, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data)
        if (data.success) {
          console.log('Products loaded:', data.products)
          setProductsWithTemplates(data.products || [])
        }
      } else {
        console.error('Error loading products with templates:', response.statusText, response.status)
      }
    } catch (error) {
      console.error('Error loading products with templates:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleProductClick = (product: ProductWithTemplates) => {
    console.log('handleProductClick called with product:', {
      id: product.id,
      name: product.name,
      templatesCount: product.templatesCount,
      activeTemplatesCount: product.activeTemplatesCount,
      templates: product.templates,
      templatesLength: product.templates?.length || 0
    })
    setSelectedProduct(product)
    setTemplates(product.templates)
    setSelectedProductId(product.id)
  }

  const handleBackToProducts = () => {
    setSelectedProduct(null)
    setTemplates([])
    setSelectedProductId("")
    setTemplateSearchTerm("")
    setSelectedCategory("all")
  }

  const handleCreateTemplate = () => {
    if (!selectedProduct || !newTemplateName.trim() || !selectedCategoryName) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    console.log('🎬 handleCreateTemplate - selectedProduct:', selectedProduct?.id)
    console.log('🎬 handleCreateTemplate - selectedProductId state:', selectedProductId)

    // Asegurar que selectedProductId esté establecido
    if (!selectedProductId && selectedProduct) {
      setSelectedProductId(selectedProduct.id)
    }

    setIsEditMode(false)
    setEditingTemplate(null)
    setShowCreateModal(false)
    setShowTemplateEditor(true)
  }

  const toggleTemplateStatus = async (id: string) => {
    try {
      const template = templates.find(t => t.id === id)
      if (!template) return

      const response = await fetch('/api/personalization/templates', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          id,
          isActive: !template.isActive
        })
      })

      if (response.ok) {
        setTemplates(prev => prev.map(t => 
          t.id === id 
            ? { ...t, isActive: !t.isActive }
            : t
        ))
        // Actualizar también el producto seleccionado
        if (selectedProduct) {
          const updatedTemplates = selectedProduct.templates.map(t => 
            t.id === id ? { ...t, isActive: !t.isActive } : t
          )
          setSelectedProduct({
            ...selectedProduct,
            templates: updatedTemplates,
            activeTemplatesCount: updatedTemplates.filter(t => t.isActive).length
          })
        }
      } else {
        const errorData = await response.json()
        alert(`Error al cambiar estado: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error toggling template status:', error)
      alert('Error al cambiar el estado de la plantilla')
    }
  }

  const toggleDefaultForAllVariants = async (id: string) => {
    try {
      const template = templates.find(t => t.id === id)
      if (!template) return

      const response = await fetch('/api/personalization/templates', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          id,
          isDefaultForAllVariants: !template.isDefaultForAllVariants
        })
      })

      if (response.ok) {
        setTemplates(prev => prev.map(t => 
          t.id === id 
            ? { ...t, isDefaultForAllVariants: !t.isDefaultForAllVariants }
            : t
        ))
        // Actualizar también el producto seleccionado
        if (selectedProduct) {
          const updatedTemplates = selectedProduct.templates.map(t => 
            t.id === id ? { ...t, isDefaultForAllVariants: !t.isDefaultForAllVariants } : t
          )
          const hasDefault = updatedTemplates.some(t => t.isDefaultForAllVariants)
          const defaultTemplate = updatedTemplates.find(t => t.isDefaultForAllVariants)
          
          setSelectedProduct({
            ...selectedProduct,
            templates: updatedTemplates,
            hasDefaultTemplate: hasDefault,
            defaultTemplateName: defaultTemplate?.name || null
          })
        }
        alert(`Plantilla ${!template.isDefaultForAllVariants ? 'configurada como' : 'removida de'} predeterminada para todas las variantes`)
      } else {
        const errorData = await response.json()
        alert(`Error al cambiar configuración: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error toggling default for all variants:', error)
      alert('Error al cambiar la configuración de plantilla predeterminada')
    }
  }

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setIsEditMode(true)
    setNewTemplateName(template.name)
    setSelectedCategoryName(template.category)
    setShowTemplateEditor(true)
  }

  const handleSaveTemplate = async (templateData: any) => {
    try {
      const url = '/api/personalization/templates'
      const method = isEditMode ? 'PATCH' : 'POST'
      
      const payload = {
        ...(isEditMode && { id: editingTemplate?.id }),
        name: templateData.name,
        description: isEditMode 
          ? editingTemplate?.description || `Plantilla para ${selectedProduct?.name}`
          : `Plantilla creada para ${selectedProduct?.name}`,
        category: templateData.category,
        subcategory: templateData.subcategory || null,
        thumbnailUrl: templateData.thumbnailUrl || '',
        previewUrl: templateData.previewUrl || null,
        productTypes: [selectedProduct?.name.toLowerCase()],
        templateData: templateData.elements || templateData,
        allowTextEdit: templateData.allowTextEdit,
        allowColorEdit: templateData.allowColorEdit,
        allowImageEdit: templateData.allowImageEdit,
        editableAreas: templateData.editableAreas,
        restrictions: templateData.restrictions,
        isPremium: isEditMode ? editingTemplate?.isPremium : false,
        isPublic: isEditMode ? editingTemplate?.isPublic : true,
        isDefaultForAllVariants: isEditMode ? editingTemplate?.isDefaultForAllVariants : false
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          if (isEditMode) {
            setTemplates(prev => prev.map(t => 
              t.id === editingTemplate?.id ? data.template : t
            ))
            alert('Plantilla actualizada correctamente')
          } else {
            setTemplates(prev => [data.template, ...prev])
            alert('Plantilla creada correctamente')
          }
          
          setShowTemplateEditor(false)
          setSelectedProductId("")
          setNewTemplateName("")
          setSelectedCategoryName("")
          setEditingTemplate(null)
          setIsEditMode(false)
          
          // Recargar datos del producto
          loadProductsWithTemplates()
        } else {
          alert(`Error: ${data.error || 'Error desconocido al guardar la plantilla'}`)
        }
      } else {
        const errorData = await response.json()
        alert(`Error al ${isEditMode ? 'actualizar' : 'crear'} la plantilla: ${errorData.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} template:`, error)
      alert(`Error al ${isEditMode ? 'actualizar' : 'crear'} la plantilla`)
    }
  }

  // Función para obtener la imagen del producto para una plantilla
  const getProductImageForTemplate = (template: Template): string => {
    console.log('getProductImageForTemplate called with:', {
      templateId: template.id,
      templateName: template.name,
      thumbnailUrl: template.thumbnailUrl,
      selectedProduct: selectedProduct ? {
        id: selectedProduct.id,
        name: selectedProduct.name,
        images: selectedProduct.images
      } : null
    });

    // Primero buscar si la plantilla tiene una imagen válida (no base64)
    if (template.thumbnailUrl && typeof template.thumbnailUrl === 'string' && !template.thumbnailUrl.startsWith('data:')) {
      console.log('Using template thumbnail:', template.thumbnailUrl);
      return template.thumbnailUrl
    }
    
    // Si no, buscar la imagen del producto seleccionado
    if (selectedProduct && selectedProduct.images && Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0) {
      const firstImage = selectedProduct.images[0];
      if (firstImage && typeof firstImage === 'string') {
        console.log('Using selected product image:', firstImage);
        return firstImage
      }
    }
    
    // Usar imagen placeholder de categoría que sabemos que existe
    console.log('Using placeholder image');
    return '/images/placeholder-category.jpg'
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) {
      return
    }

    try {
      const response = await fetch(`/api/personalization/templates?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setTemplates(prev => prev.filter(template => template.id !== id))
        alert('Plantilla eliminada correctamente')
        // Recargar datos del producto
        loadProductsWithTemplates()
      } else {
        const errorData = await response.json()
        alert(`Error al eliminar: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Error al eliminar la plantilla')
    }
  }

  const duplicateTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/personalization/templates/${id}/duplicate`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTemplates(prev => [data.template, ...prev])
          alert('Plantilla duplicada correctamente')
          // Recargar datos del producto
          loadProductsWithTemplates()
        }
      } else {
        const errorData = await response.json()
        alert(`Error al duplicar: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error duplicating template:', error)
      alert('Error al duplicar la plantilla')
    }
  }

  // Filtros para productos
  const filteredProducts = (productsWithTemplates || []).filter(product =>
    product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filtros para plantillas
  const filteredTemplates = (templates || []).filter(template => {
    const matchesSearch = template?.name?.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
                         template?.description?.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
                         template?.category?.toLowerCase().includes(templateSearchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || template?.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (!selectedProduct) {
    // Vista de productos con plantillas
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Plantillas por Producto</h1>
            <p className="text-gray-600 mt-1">
              Selecciona un producto para gestionar sus plantillas prediseñadas
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Productos con Plantillas</p>
                <p className="text-xl font-semibold text-gray-900">{(productsWithTemplates || []).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Layout className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Plantillas</p>
                <p className="text-xl font-semibold text-gray-900">
                  {(productsWithTemplates || []).reduce((acc, p) => acc + (p?.templatesCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Plantillas Activas</p>
                <p className="text-xl font-semibold text-gray-900">
                  {(productsWithTemplates || []).reduce((acc, p) => acc + (p?.activeTemplatesCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Con Predeterminadas</p>
                <p className="text-xl font-semibold text-gray-900">
                  {(productsWithTemplates || []).filter(p => p?.hasDefaultTemplate === true).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        {loadingProducts ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Cargando productos...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500">No se encontraron productos con plantillas</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plantillas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Áreas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Predeterminada
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                              <Package className="h-5 w-5 text-orange-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              €{product.basePrice}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {product.templatesCount}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({product.activeTemplatesCount} activas)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {product.areasCount || 0}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({product.sidesCount || 0} lados)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.activeTemplatesCount > 0
                            ? 'bg-green-100 text-green-800'
                            : product.hasPersonalizationAreas
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.activeTemplatesCount > 0 
                            ? 'Con plantillas activas' 
                            : product.hasPersonalizationAreas
                            ? 'Con áreas configuradas'
                            : 'Sin configuración'
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.hasDefaultTemplate ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-gray-600">
                              {product.defaultTemplateName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Sin predeterminada</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleProductClick(product)}
                          className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-900 transition-colors"
                        >
                          Ver plantillas
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Vista de plantillas del producto seleccionado
  return (
    <div className="p-6 space-y-6">
      {/* Header con navegación */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToProducts}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a productos
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Plantillas de {selectedProduct.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona las plantillas prediseñadas para este producto
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <Tags className="h-4 w-4" />
            Categorías
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nueva Plantilla
          </button>
        </div>
      </div>

      {/* Stats Cards del producto */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Layout className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Plantillas</p>
              <p className="text-xl font-semibold text-gray-900">{(templates || []).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Activas</p>
              <p className="text-xl font-semibold text-gray-900">
                {(templates || []).filter(t => t?.isActive === true).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Premium</p>
              <p className="text-xl font-semibold text-gray-900">
                {(templates || []).filter(t => t?.isPremium === true).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Usos Totales</p>
              <p className="text-xl font-semibold text-gray-900">
                {(templates || []).reduce((acc, t) => acc + (t?.usageCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar plantillas..."
                value={templateSearchTerm}
                onChange={(e) => setTemplateSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid/List */}
      {loadingTemplates ? (
        <div className="text-center py-8">
          <div className="text-gray-500">Cargando plantillas...</div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-8">
          <Layout className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <div className="text-gray-500">No se encontraron plantillas para este producto</div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {filteredTemplates.map((template) => (
            <div key={template.id} className={`bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg ${viewMode === 'list' ? 'flex' : ''}`}>
              {/* Template Preview */}
              <div className={`relative bg-gray-50 rounded-lg overflow-hidden ${viewMode === 'list' ? 'w-20 h-20 flex-shrink-0' : 'w-full h-48'}`}>
                {template.templateData ? (
                  <TemplatePreview
                    imageUrl={getProductImageForTemplate(template)}
                    templateData={template.templateData}
                    className="w-full h-full"
                    maxWidth={viewMode === 'list' ? 80 : 192}
                    maxHeight={viewMode === 'list' ? 80 : 192}
                    showElementBorders={false}
                    interactive={false}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <Layout className="h-8 w-8 text-orange-600" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {template.isPremium && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Premium
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {template.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                  {template.isDefaultForAllVariants && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1 fill-yellow-600" />
                      Predeterminada
                    </span>
                  )}
                </div>
              </div>

              {/* Template Info */}
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className={`${viewMode === 'list' ? 'flex items-center justify-between' : 'space-y-3'}`}>
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span className="bg-gray-100 px-2 py-1 rounded">{template.category}</span>
                      {template.subcategory && (
                        <span className="bg-gray-100 px-2 py-1 rounded">{template.subcategory}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Usos: {template.usageCount}</span>
                      {template.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{template.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Editable Features */}
                    <div className="flex items-center gap-2 mt-2">
                      {template.allowTextEdit && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Texto</span>
                      )}
                      {template.allowImageEdit && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Imagen</span>
                      )}
                      {template.allowColorEdit && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Color</span>
                      )}
                    </div>

                    {/* Default for All Variants */}
                    {template.isActive && (
                      <div className="flex items-center gap-2 mt-3 p-2 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          id={`default-${template.id}`}
                          checked={template.isDefaultForAllVariants}
                          onChange={() => toggleDefaultForAllVariants(template.id)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label 
                          htmlFor={`default-${template.id}`}
                          className="text-xs text-gray-700 font-medium cursor-pointer"
                        >
                          Predeterminado en todas las variantes
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={`flex gap-2 ${viewMode === 'list' ? 'flex-col' : 'justify-between items-center mt-4'}`}>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelectedTemplate(template)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Vista previa"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => duplicateTemplate(template.id)}
                        className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                        title="Duplicar"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleTemplateStatus(template.id)}
                        className={`p-2 transition-colors ${
                          template.isActive 
                            ? 'text-green-600 hover:text-green-700' 
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                        title={template.isActive ? 'Desactivar plantilla' : 'Activar plantilla'}
                      >
                        {template.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/35 backdrop-blur-sm z-[100]">
          <div className="bg-white p-3 rounded-xl shadow-2xl w-80 max-w-xs mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Nueva Plantilla</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto Seleccionado
                </label>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">{selectedProduct.name}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Plantilla
                </label>
                <input
                  type="text"
                  placeholder="Ej: Diseño Básico"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select 
                  value={selectedCategoryName}
                  onChange={(e) => setSelectedCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Seleccione una categoría...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateTemplate}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Crear Plantilla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/35 backdrop-blur-sm z-[100]">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full mx-4 ml-60 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Vista Previa: {selectedTemplate.name}
              </h2>
              <button 
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Información de la Plantilla</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Categoría:</span>
                    <span className="ml-2 font-medium">{selectedTemplate.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Subcategoría:</span>
                    <span className="ml-2 font-medium">{selectedTemplate.subcategory || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Usos:</span>
                    <span className="ml-2 font-medium">{selectedTemplate.usageCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Calificación:</span>
                    <span className="ml-2 font-medium">{selectedTemplate.rating || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">Configuración de Edición</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Edición de texto</span>
                    <span className={`text-sm font-medium ${selectedTemplate.allowTextEdit ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedTemplate.allowTextEdit ? 'Permitido' : 'Bloqueado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Edición de imagen</span>
                    <span className={`text-sm font-medium ${selectedTemplate.allowImageEdit ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedTemplate.allowImageEdit ? 'Permitido' : 'Bloqueado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Edición de color</span>
                    <span className={`text-sm font-medium ${selectedTemplate.allowColorEdit ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedTemplate.allowColorEdit ? 'Permitido' : 'Bloqueado'}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-sm text-gray-600">Áreas editables:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedTemplate.editableAreas && selectedTemplate.editableAreas.length > 0 ? (
                      selectedTemplate.editableAreas.map((area, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {area}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">Sin áreas editables definidas</span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-sm text-gray-600">Tipos de producto:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedTemplate.productTypes && selectedTemplate.productTypes.length > 0 ? (
                      selectedTemplate.productTypes.map((type, index) => (
                        <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {type}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">Sin tipos de producto definidos</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <CategoryManagementModal 
          categories={categories}
          setCategories={() => {}} // Read-only para esta implementación
          onClose={() => setShowCategoryModal(false)}
        />
      )}

      {/* Template Editor */}
      {showTemplateEditor && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando editor...</p>
            </div>
          </div>
        }>
          <TemplateEditor
            isOpen={showTemplateEditor}
            onClose={() => {
              setShowTemplateEditor(false)
              setSelectedProductId("")
              setNewTemplateName("")
              setSelectedCategoryName("")
              setEditingTemplate(null)
              setIsEditMode(false)
            }}
            productId={selectedProductId}
            templateName={newTemplateName}
            category={selectedCategoryName}
            onSave={handleSaveTemplate}
            isEditMode={isEditMode}
            existingTemplateData={editingTemplate}
          />
        </Suspense>
      )}
    </div>
  )
}

// Category Management Modal Component
function CategoryManagementModal({ 
  categories, 
  setCategories, 
  onClose 
}: {
  categories: Category[]
  setCategories: (categories: Category[]) => void
  onClose: () => void
}) {
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newSubcategory, setNewSubcategory] = useState("")
  const [addingSubcategoryTo, setAddingSubcategoryTo] = useState<string | null>(null)

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return
    
    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      subcategories: []
    }
    
    setCategories([...categories, newCategory])
    setNewCategoryName("")
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
  }

  const handleSaveEdit = () => {
    if (!editingCategory || !editingCategory.name.trim()) return
    
    setCategories(categories.map(cat => 
      cat.id === editingCategory.id ? editingCategory : cat
    ))
    setEditingCategory(null)
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      setCategories(categories.filter(cat => cat.id !== categoryId))
    }
  }

  const handleAddSubcategory = (categoryId: string) => {
    if (!newSubcategory.trim()) return
    
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, subcategories: [...cat.subcategories, newSubcategory.trim()] }
        : cat
    ))
    setNewSubcategory("")
    setAddingSubcategoryTo(null)
  }

  const handleDeleteSubcategory = (categoryId: string, subcategoryIndex: number) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { 
            ...cat, 
            subcategories: cat.subcategories.filter((_, index) => index !== subcategoryIndex)
          }
        : cat
    ))
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/35 backdrop-blur-sm z-[100]">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full mx-4 ml-60 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Categorías</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add New Category */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Agregar Nueva Categoría</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nombre de la categoría"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button
              onClick={handleAddCategory}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                {editingCategory?.id === category.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Subcategories */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Subcategorías:</span>
                  <button
                    onClick={() => setAddingSubcategoryTo(category.id)}
                    className="text-orange-600 hover:text-orange-700 text-sm"
                  >
                    + Agregar
                  </button>
                </div>
                
                {addingSubcategoryTo === category.id && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Nombre de la subcategoría"
                      value={newSubcategory}
                      onChange={(e) => setNewSubcategory(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSubcategory(category.id)}
                    />
                    <button
                      onClick={() => handleAddSubcategory(category.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setAddingSubcategoryTo(null)
                        setNewSubcategory("")
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {category.subcategories.map((subcategory, index) => (
                    <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
                      <span>{subcategory}</span>
                      <button
                        onClick={() => handleDeleteSubcategory(category.id, index)}
                        className="text-red-500 hover:text-red-700 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {category.subcategories.length === 0 && (
                    <span className="text-sm text-gray-400">Sin subcategorías</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button 
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}