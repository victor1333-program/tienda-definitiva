'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Upload,
  FileText,
  Image,
  Video,
  Package,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  Target,
  Layers
} from "lucide-react"

interface ProcessStep {
  id: string
  stepNumber: number
  title: string
  description: string
  estimatedTime: number
  instructions: string
  imageUrls: string[]
  videoUrls: string[]
  fileUrls: string[]
  isOptional: boolean
  requiresQC: boolean
  safetyNotes: string
}

interface MaterialRequirement {
  id: string
  materialId?: string
  name: string
  quantity: number
  unit: string
  description: string
  isOptional: boolean
}

interface EquipmentRequirement {
  id: string
  name: string
  description: string
  isRequired: boolean
  specifications: string
}

interface Product {
  id: string
  name: string
  sku: string
  description: string
  slug: string
}

export default function NewWorkshopProcessPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState('producto')
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productId: '',
    category: 'OTHER',
    difficulty: 'MEDIUM',
    estimatedTime: 0,
    tags: [] as string[],
    notes: '',
    designFiles: [] as string[],
    instructionFiles: [] as string[],
    referenceImages: [] as string[]
  })

  const [steps, setSteps] = useState<ProcessStep[]>([])
  const [materials, setMaterials] = useState<MaterialRequirement[]>([])
  const [equipment, setEquipment] = useState<EquipmentRequirement[]>([])
  const [newTag, setNewTag] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Development helper function
  const fillTestData = () => {
    if (process.env.NODE_ENV === 'development') {
      setFormData(prev => ({
        ...prev,
        name: 'Proceso de Prueba',
        description: 'Descripción de prueba para el proceso',
        category: 'DTF_PRINTING',
        estimatedTime: 60
      }))
      // Auto-select first product if available
      if (products.length > 0 && !selectedProduct) {
        selectProduct(products[0])
      }
    }
  }

  // Load products
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
        setFilteredProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  // Filter products based on search
  useEffect(() => {
    if (!productSearch.trim()) {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.sku.toLowerCase().includes(productSearch.toLowerCase())
      )
      setFilteredProducts(filtered)
    }
  }, [productSearch, products])

  const validateForm = () => {
    const errors: string[] = []
    
    if (!formData.name.trim()) {
      errors.push('name')
    }
    if (!formData.description.trim()) {
      errors.push('description')
    }
    if (!selectedProduct) {
      errors.push('product')
    }
    
    setValidationErrors(errors)
    
    if (errors.length > 0) {
      console.log('Validation errors:', errors)
      // Scroll to the first error
      const firstError = errors[0]
      if (firstError === 'name' || firstError === 'description') {
        setActiveTab('configuracion')
      } else if (firstError === 'product') {
        setActiveTab('producto')
      }
    }
    
    return errors.length === 0
  }

  // Clear validation errors when fields are filled
  const clearValidationError = (field: string) => {
    setValidationErrors(prev => prev.filter(error => error !== field))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('=== FORM SUBMIT STARTED ===')
    console.log('Form data:', formData)
    console.log('Selected product:', selectedProduct)
    console.log('Steps:', steps)
    console.log('Materials:', materials)
    console.log('Equipment:', equipment)
    
    if (!validateForm()) {
      console.log('Validation failed, showing toast error')
      toast.error('Completa todos los campos requeridos')
      return
    }

    console.log('Validation passed, starting process creation...')
    setIsLoading(true)
    toast.loading('Creando proceso...', { id: 'creating-process' })
    
    try {
      const processData = {
        name: formData.name,
        description: formData.description,
        productId: selectedProduct!.id,
        category: formData.category,
        difficulty: formData.difficulty,
        estimatedTime: formData.estimatedTime,
        tags: formData.tags,
        notes: formData.notes,
        designFiles: formData.designFiles,
        instructionFiles: formData.instructionFiles,
        referenceImages: formData.referenceImages,
        steps,
        materialRequirements: materials,
        equipmentRequirements: equipment
      }

      console.log('Sending process data:', processData)

      const response = await fetch('/api/workshop/processes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processData)
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers))
      
      let responseData
      try {
        const responseText = await response.text()
        console.log('Raw response text:', responseText)
        
        if (responseText) {
          responseData = JSON.parse(responseText)
        } else {
          responseData = { error: 'Respuesta vacía del servidor' }
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError)
        responseData = { error: 'Respuesta inválida del servidor' }
      }
      
      console.log('Parsed response data:', responseData)

      if (response.ok) {
        toast.success('Proceso creado exitosamente', { id: 'creating-process' })
        router.push('/admin/workshop/processes')
      } else {
        console.error('Error response:', responseData)
        const errorMessage = responseData?.error || `Error ${response.status}: ${response.statusText}`
        toast.error(errorMessage, { id: 'creating-process' })
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al crear el proceso', { id: 'creating-process' })
    } finally {
      setIsLoading(false)
    }
  }

  const selectProduct = (product: Product) => {
    setSelectedProduct(product)
    setFormData(prev => ({ ...prev, productId: product.id }))
    setProductSearch(product.name)
    setShowProductDropdown(false)
    clearValidationError('product')
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addStep = () => {
    const newStep: ProcessStep = {
      id: Date.now().toString(),
      stepNumber: steps.length + 1,
      title: '',
      description: '',
      estimatedTime: 0,
      instructions: '',
      imageUrls: [],
      videoUrls: [],
      fileUrls: [],
      isOptional: false,
      requiresQC: false,
      safetyNotes: ''
    }
    setSteps([...steps, newStep])
  }

  const updateStep = (stepId: string, field: keyof ProcessStep, value: any) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, [field]: value } : step
    ))
  }

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId))
  }

  const addMaterial = () => {
    const newMaterial: MaterialRequirement = {
      id: Date.now().toString(),
      name: '',
      quantity: 0,
      unit: 'unidades',
      description: '',
      isOptional: false
    }
    setMaterials([...materials, newMaterial])
  }

  const updateMaterial = (materialId: string, field: keyof MaterialRequirement, value: any) => {
    setMaterials(materials.map(material => 
      material.id === materialId ? { ...material, [field]: value } : material
    ))
  }

  const removeMaterial = (materialId: string) => {
    setMaterials(materials.filter(material => material.id !== materialId))
  }

  const addEquipment = () => {
    const newEquipment: EquipmentRequirement = {
      id: Date.now().toString(),
      name: '',
      description: '',
      isRequired: true,
      specifications: ''
    }
    setEquipment([...equipment, newEquipment])
  }

  const updateEquipment = (equipmentId: string, field: keyof EquipmentRequirement, value: any) => {
    setEquipment(equipment.map(eq => 
      eq.id === equipmentId ? { ...eq, [field]: value } : eq
    ))
  }

  const removeEquipment = (equipmentId: string) => {
    setEquipment(equipment.filter(eq => eq.id !== equipmentId))
  }

  const handleFileUpload = async (file: File, category: 'designFiles' | 'instructionFiles' | 'referenceImages') => {
    if (!file) return
    
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Map category to upload type
      const typeMap = {
        'designFiles': 'design',
        'instructionFiles': 'instruction', 
        'referenceImages': 'reference'
      }
      
      formData.append('type', typeMap[category])
      
      console.log('Uploading file:', file.name, 'type:', typeMap[category])
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const { url } = await response.json()
        console.log('Upload successful, URL:', url)
        
        setFormData(prev => ({
          ...prev,
          [category]: [...prev[category], url]
        }))
        
        toast.success('Archivo subido exitosamente')
      } else {
        const errorData = await response.json()
        console.error('Upload failed:', errorData)
        throw new Error(errorData.error || 'Error al subir archivo')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error(error instanceof Error ? error.message : 'Error al subir el archivo')
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (category: 'designFiles' | 'instructionFiles' | 'referenceImages', index: number) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }))
  }

  const difficulties = [
    { value: 'EASY', label: 'Fácil' },
    { value: 'MEDIUM', label: 'Medio' },
    { value: 'HARD', label: 'Difícil' },
    { value: 'EXPERT', label: 'Experto' }
  ]

  const categories = [
    { value: 'DTF_PRINTING', label: 'Impresión DTF' },
    { value: 'SUBLIMATION', label: 'Sublimación' },
    { value: 'LASER_CUTTING', label: 'Corte láser' },
    { value: 'VINYL_CUTTING', label: 'Corte de vinilo' },
    { value: 'EMBROIDERY', label: 'Bordado' },
    { value: 'ASSEMBLY', label: 'Ensamblaje' },
    { value: 'FINISHING', label: 'Acabados' },
    { value: 'QUALITY_CONTROL', label: 'Control de calidad' },
    { value: 'PACKAGING', label: 'Empaquetado' },
    { value: 'DESIGN', label: 'Diseño' },
    { value: 'OTHER', label: 'Otros' }
  ]

  const units = [
    'unidades', 'gramos', 'kilogramos', 'mililitros', 'litros', 
    'metros', 'centímetros', 'hojas', 'rollos'
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🔧 Nuevo Proceso</h1>
            <p className="text-gray-600 mt-1">
              Crea un nuevo proceso de producción paso a paso
            </p>
          </div>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <Button
            type="button"
            onClick={fillTestData}
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-300"
          >
            Rellenar datos de prueba
          </Button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'producto', label: 'Producto', icon: Package },
            { id: 'configuracion', label: 'Configuración', icon: Settings },
            { id: 'pasos', label: 'Pasos', icon: Layers },
            { id: 'materiales', label: 'Materiales', icon: Wrench },
            { id: 'equipamiento', label: 'Equipamiento', icon: Target }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Producto Tab */}
        {activeTab === 'producto' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Seleccionar Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar producto por nombre o SKU..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value)
                    setShowProductDropdown(true)
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  className={`w-full ${validationErrors.includes('product') ? 'border-red-500 bg-red-50' : ''}`}
                />
                {validationErrors.includes('product') && (
                  <p className="text-red-500 text-sm mt-1">Selecciona un producto</p>
                )}
                
                {showProductDropdown && filteredProducts.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => selectProduct(product)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50"
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedProduct && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Producto seleccionado:</span>
                  </div>
                  <p className="mt-1 text-green-700">{selectedProduct.name}</p>
                  <p className="text-sm text-green-600">SKU: {selectedProduct.sku}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Configuración Tab */}
        {activeTab === 'configuracion' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración del Proceso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Proceso *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                    if (e.target.value.trim()) clearValidationError('name')
                  }}
                  placeholder="Nombre descriptivo del proceso..."
                  className={`${validationErrors.includes('name') ? 'border-red-500 bg-red-50' : ''}`}
                  required
                />
                {validationErrors.includes('name') && (
                  <p className="text-red-500 text-sm mt-1">El nombre del proceso es requerido</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Proceso *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, description: e.target.value }))
                    if (e.target.value.trim()) clearValidationError('description')
                  }}
                  placeholder="Describe el proceso de producción..."
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    validationErrors.includes('description') ? 'border-red-500 bg-red-50' : ''
                  }`}
                  required
                />
                {validationErrors.includes('description') && (
                  <p className="text-red-500 text-sm mt-1">La descripción del proceso es requerida</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría del Proceso
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dificultad
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {difficulties.map(diff => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo Estimado (minutos)
                  </label>
                  <Input
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 0 }))}
                    placeholder="60"
                    min="0"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiquetas
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Agregar etiqueta..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notas importantes, consideraciones especiales..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* File Upload Sections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Design Files */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Archivos de Diseño
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="designFiles"
                      multiple
                      accept=".pdf,.ai,.psd,.svg,.png,.jpg,.jpeg,"
                      onChange={(e) => {
                        if (e.target.files) {
                          Array.from(e.target.files).forEach(file => 
                            handleFileUpload(file, 'designFiles')
                          )
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="designFiles"
                      className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-gray-700"
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-sm">Subir archivos</span>
                    </label>
                  </div>
                  <div className="mt-2 space-y-1">
                    {formData.designFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm truncate">{file.split('/').pop()}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('designFiles', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instruction Files */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Archivos de Instrucciones
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="instructionFiles"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        if (e.target.files) {
                          Array.from(e.target.files).forEach(file => 
                            handleFileUpload(file, 'instructionFiles')
                          )
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="instructionFiles"
                      className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-gray-700"
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-sm">Subir archivos</span>
                    </label>
                  </div>
                  <div className="mt-2 space-y-1">
                    {formData.instructionFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm truncate">{file.split('/').pop()}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('instructionFiles', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reference Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Image className="w-4 h-4 inline mr-1" />
                    Imágenes de Referencia
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="referenceImages"
                      multiple
                      accept=".png,.jpg,.jpeg,.gif,.webp"
                      onChange={(e) => {
                        if (e.target.files) {
                          Array.from(e.target.files).forEach(file => 
                            handleFileUpload(file, 'referenceImages')
                          )
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="referenceImages"
                      className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-gray-700"
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-sm">Subir imágenes</span>
                    </label>
                  </div>
                  <div className="mt-2 space-y-1">
                    {formData.referenceImages.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm truncate">{file.split('/').pop()}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('referenceImages', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {isUploading && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-blue-700">Subiendo archivo...</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pasos Tab */}
        {activeTab === 'pasos' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Pasos del Proceso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button type="button" onClick={addStep} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Paso
              </Button>

              {steps.map((step, index) => (
                <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Paso {index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título del Paso
                      </label>
                      <Input
                        value={step.title}
                        onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                        placeholder="Título descriptivo..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiempo Estimado (min)
                      </label>
                      <Input
                        type="number"
                        value={step.estimatedTime}
                        onChange={(e) => updateStep(step.id, 'estimatedTime', parseInt(e.target.value) || 0)}
                        placeholder="15"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={step.description}
                      onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                      placeholder="Descripción detallada del paso..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instrucciones Detalladas
                    </label>
                    <textarea
                      value={step.instructions}
                      onChange={(e) => updateStep(step.id, 'instructions', e.target.value)}
                      placeholder="Instrucciones paso a paso..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={step.isOptional}
                        onChange={(e) => updateStep(step.id, 'isOptional', e.target.checked)}
                        className="mr-2"
                      />
                      Paso opcional
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={step.requiresQC}
                        onChange={(e) => updateStep(step.id, 'requiresQC', e.target.checked)}
                        className="mr-2"
                      />
                      Requiere control de calidad
                    </label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Materiales Tab */}
        {activeTab === 'materiales' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Materiales Requeridos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button type="button" onClick={addMaterial} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Material
              </Button>

              {materials.map((material) => (
                <div key={material.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Material</h4>
                    <Button
                      type="button"
                      onClick={() => removeMaterial(material.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Material
                      </label>
                      <Input
                        value={material.name}
                        onChange={(e) => updateMaterial(material.id, 'name', e.target.value)}
                        placeholder="Ej: Vinilo adhesivo..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad
                      </label>
                      <Input
                        type="number"
                        value={material.quantity}
                        onChange={(e) => updateMaterial(material.id, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="1.5"
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unidad
                      </label>
                      <select
                        value={material.unit}
                        onChange={(e) => updateMaterial(material.id, 'unit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <Input
                      value={material.description}
                      onChange={(e) => updateMaterial(material.id, 'description', e.target.value)}
                      placeholder="Especificaciones del material..."
                    />
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={material.isOptional}
                        onChange={(e) => updateMaterial(material.id, 'isOptional', e.target.checked)}
                        className="mr-2"
                      />
                      Material opcional
                    </label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Equipamiento Tab */}
        {activeTab === 'equipamiento' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Equipamiento Necesario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button type="button" onClick={addEquipment} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Equipamiento
              </Button>

              {equipment.map((eq) => (
                <div key={eq.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Equipamiento</h4>
                    <Button
                      type="button"
                      onClick={() => removeEquipment(eq.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Equipamiento
                      </label>
                      <Input
                        value={eq.name}
                        onChange={(e) => updateEquipment(eq.id, 'name', e.target.value)}
                        placeholder="Ej: Plotter de corte..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <Input
                        value={eq.description}
                        onChange={(e) => updateEquipment(eq.id, 'description', e.target.value)}
                        placeholder="Descripción del equipamiento..."
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Especificaciones
                    </label>
                    <textarea
                      value={eq.specifications}
                      onChange={(e) => updateEquipment(eq.id, 'specifications', e.target.value)}
                      placeholder="Especificaciones técnicas, configuraciones necesarias..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={eq.isRequired}
                        onChange={(e) => updateEquipment(eq.id, 'isRequired', e.target.checked)}
                        className="mr-2"
                      />
                      Equipamiento obligatorio
                    </label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Validation Summary */}
        {validationErrors.length > 0 && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">Faltan campos requeridos:</p>
              <ul className="text-sm text-red-600 list-disc list-inside">
                {validationErrors.includes('name') && <li>Nombre del proceso</li>}
                {validationErrors.includes('description') && <li>Descripción del proceso</li>}
                {validationErrors.includes('product') && <li>Producto seleccionado</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading || isUploading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando...
              </>
            ) : isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Subiendo archivos...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Crear Proceso
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}