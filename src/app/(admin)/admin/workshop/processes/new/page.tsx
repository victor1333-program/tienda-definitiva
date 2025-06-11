'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
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
  estimatedCost?: number
  supplier?: string
}

interface EquipmentRequirement {
  id: string
  name: string
  description: string
  isRequired: boolean
  specifications: Record<string, any>
  settings: Record<string, any>
  alternatives: string[]
}

interface Product {
  id: string
  name: string
  personalizationType: string
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
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productId: '',
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

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    if (productSearch) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(productSearch.toLowerCase())
      )
      setFilteredProducts(filtered.slice(0, 10)) // Limit to 10 results
      setShowProductDropdown(true)
    } else {
      setFilteredProducts([])
      setShowProductDropdown(false)
    }
  }, [productSearch, products])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        // Ensure data is an array
        if (Array.isArray(data)) {
          setProducts(data)
        } else if (data.products && Array.isArray(data.products)) {
          setProducts(data.products)
        } else {
          console.error('Products data is not an array:', data)
          setProducts([])
        }
      } else {
        console.error('Failed to fetch products:', response.status)
        setProducts([])
      }
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts([])
    }
  }

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setProductSearch(product.name)
    setFormData({ ...formData, productId: product.id })
    setShowProductDropdown(false)
    
    // Auto-suggest category based on product personalization type
    if (!formData.name) {
      const processName = `Proceso de ${product.personalizationType} - ${product.name}`
      setFormData(prev => ({ ...prev, name: processName }))
    }
  }

  const handleProductSearchChange = (value: string) => {
    setProductSearch(value)
    if (!value) {
      setSelectedProduct(null)
      setFormData({ ...formData, productId: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('El nombre del proceso es requerido')
      return
    }
    
    if (!formData.productId) {
      toast.error('Debe seleccionar un producto')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/workshop/processes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          category: selectedProduct?.personalizationType || 'OTHER', // Auto-assign based on product
          steps,
          materialRequirements: materials,
          equipmentRequirements: equipment
        })
      })

      if (response.ok) {
        const process = await response.json()
        toast.success('Proceso creado exitosamente')
        router.push(`/admin/workshop/processes/${process.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear el proceso')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al crear el proceso')
    } finally {
      setIsLoading(false)
    }
  }

  const addStep = () => {
    const newStep: ProcessStep = {
      id: `step-${Date.now()}`,
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

  const updateStep = (stepId: string, updates: Partial<ProcessStep>) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ))
  }

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId))
    // Renumber remaining steps
    setSteps(currentSteps => 
      currentSteps.map((step, index) => ({
        ...step,
        stepNumber: index + 1
      }))
    )
  }

  const addMaterial = () => {
    const newMaterial: MaterialRequirement = {
      id: `material-${Date.now()}`,
      name: '',
      quantity: 1,
      unit: 'unidades',
      description: '',
      isOptional: false
    }
    setMaterials([...materials, newMaterial])
  }

  const updateMaterial = (materialId: string, updates: Partial<MaterialRequirement>) => {
    setMaterials(materials.map(material => 
      material.id === materialId ? { ...material, ...updates } : material
    ))
  }

  const removeMaterial = (materialId: string) => {
    setMaterials(materials.filter(material => material.id !== materialId))
  }

  const addEquipment = () => {
    const newEquipment: EquipmentRequirement = {
      id: `equipment-${Date.now()}`,
      name: '',
      description: '',
      isRequired: true,
      specifications: {},
      settings: {},
      alternatives: []
    }
    setEquipment([...equipment, newEquipment])
  }

  const updateEquipment = (equipmentId: string, updates: Partial<EquipmentRequirement>) => {
    setEquipment(equipment.map(eq => 
      eq.id === equipmentId ? { ...eq, ...updates } : eq
    ))
  }

  const removeEquipment = (equipmentId: string) => {
    setEquipment(equipment.filter(eq => eq.id !== equipmentId))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      })
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleFileUpload = async (file: File, type: 'design' | 'instruction' | 'reference') => {
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })

      if (response.ok) {
        const { url } = await response.json()
        
        switch (type) {
          case 'design':
            setFormData(prev => ({
              ...prev,
              designFiles: [...prev.designFiles, url]
            }))
            break
          case 'instruction':
            setFormData(prev => ({
              ...prev,
              instructionFiles: [...prev.instructionFiles, url]
            }))
            break
          case 'reference':
            setFormData(prev => ({
              ...prev,
              referenceImages: [...prev.referenceImages, url]
            }))
            break
        }
        
        toast.success('Archivo subido exitosamente')
      } else {
        toast.error('Error al subir archivo')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Error al subir archivo')
    }
  }

  const removeFile = (index: number, type: 'design' | 'instruction' | 'reference') => {
    switch (type) {
      case 'design':
        setFormData(prev => ({
          ...prev,
          designFiles: prev.designFiles.filter((_, i) => i !== index)
        }))
        break
      case 'instruction':
        setFormData(prev => ({
          ...prev,
          instructionFiles: prev.instructionFiles.filter((_, i) => i !== index)
        }))
        break
      case 'reference':
        setFormData(prev => ({
          ...prev,
          referenceImages: prev.referenceImages.filter((_, i) => i !== index)
        }))
        break
    }
  }

  const difficulties = [
    { value: 'EASY', label: 'Fácil' },
    { value: 'MEDIUM', label: 'Medio' },
    { value: 'HARD', label: 'Difícil' },
    { value: 'EXPERT', label: 'Experto' }
  ]

  const units = [
    'unidades', 'gramos', 'kilogramos', 'mililitros', 'litros', 
    'metros', 'centímetros', 'hojas', 'rollos'
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Proceso *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Impresión DTF en Camiseta"
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto *
                </label>
                <Input
                  value={productSearch}
                  onChange={(e) => handleProductSearchChange(e.target.value)}
                  placeholder="Buscar producto..."
                  required
                  onFocus={() => productSearch && setShowProductDropdown(true)}
                />
                {showProductDropdown && filteredProducts.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredProducts.map(product => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleProductSelect(product)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.personalizationType}</div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedProduct && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-800">
                        Producto seleccionado: <strong>{selectedProduct.name}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción detallada del proceso..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dificultad
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo Estimado (horas)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: parseFloat(e.target.value) || 0 })}
                  placeholder="0.0"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Agregar tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Archivos y Recursos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Design Files */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivos de Diseño (.ai, .svg, .pdf, .dxf)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  accept=".ai,.svg,.pdf,.dxf,.eps,.cdr"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'design')
                  }}
                  className="hidden"
                  id="design-upload"
                />
                <label htmlFor="design-upload" className="cursor-pointer">
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Haz clic para subir archivos de diseño o patrones de corte
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      AI, SVG, PDF, DXF, EPS, CDR hasta 10MB
                    </p>
                  </div>
                </label>
              </div>
              {formData.designFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.designFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {file.split('/').pop()}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeFile(index, 'design')}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instruction Files */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivos de Instrucciones (.pdf, .doc, .txt)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'instruction')
                  }}
                  className="hidden"
                  id="instruction-upload"
                />
                <label htmlFor="instruction-upload" className="cursor-pointer">
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Subir manuales de instrucciones o documentación
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX, TXT hasta 10MB
                    </p>
                  </div>
                </label>
              </div>
              {formData.instructionFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.instructionFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {file.split('/').pop()}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeFile(index, 'instruction')}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reference Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imágenes de Referencia (.jpg, .png, .gif)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'reference')
                  }}
                  className="hidden"
                  id="reference-upload"
                />
                <label htmlFor="reference-upload" className="cursor-pointer">
                  <div className="text-center">
                    <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Subir fotos de ejemplo o imágenes de referencia
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, GIF, WebP hasta 5MB
                    </p>
                  </div>
                </label>
              </div>
              {formData.referenceImages.length > 0 && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formData.referenceImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Referencia ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeFile(index, 'reference')}
                        className="absolute -top-1 -right-1 w-6 h-6 p-0 bg-white text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 w-5" />
                Pasos del Proceso ({steps.length})
              </CardTitle>
              <Button type="button" onClick={addStep} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Paso
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Paso {step.stepNumber}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeStep(step.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título del Paso
                    </label>
                    <Input
                      value={step.title}
                      onChange={(e) => updateStep(step.id, { title: e.target.value })}
                      placeholder="Ej: Preparar superficie"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiempo (minutos)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={step.estimatedTime}
                      onChange={(e) => updateStep(step.id, { estimatedTime: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={step.description}
                    onChange={(e) => updateStep(step.id, { description: e.target.value })}
                    placeholder="Descripción detallada del paso..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instrucciones Detalladas
                  </label>
                  <textarea
                    value={step.instructions}
                    onChange={(e) => updateStep(step.id, { instructions: e.target.value })}
                    placeholder="Instrucciones paso a paso..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={step.isOptional}
                      onChange={(e) => updateStep(step.id, { isOptional: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Paso opcional</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={step.requiresQC}
                      onChange={(e) => updateStep(step.id, { requiresQC: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Requiere control de calidad</span>
                  </label>
                </div>

                {step.requiresQC && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas de Seguridad
                    </label>
                    <Input
                      value={step.safetyNotes}
                      onChange={(e) => updateStep(step.id, { safetyNotes: e.target.value })}
                      placeholder="Precauciones y notas de seguridad..."
                    />
                  </div>
                )}
              </div>
            ))}
            
            {steps.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay pasos definidos. Comienza agregando el primer paso.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Materials */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Materiales Requeridos ({materials.length})
              </CardTitle>
              <Button type="button" onClick={addMaterial} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Material
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {materials.map((material) => (
              <div key={material.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Material</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeMaterial(material.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Material
                    </label>
                    <Input
                      value={material.name}
                      onChange={(e) => updateMaterial(material.id, { name: e.target.value })}
                      placeholder="Ej: Tinta DTF Negra"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={material.quantity}
                      onChange={(e) => updateMaterial(material.id, { quantity: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unidad
                    </label>
                    <select
                      value={material.unit}
                      onChange={(e) => updateMaterial(material.id, { unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <Input
                    value={material.description}
                    onChange={(e) => updateMaterial(material.id, { description: e.target.value })}
                    placeholder="Descripción del material..."
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={material.isOptional}
                    onChange={(e) => updateMaterial(material.id, { isOptional: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Material opcional</span>
                </label>
              </div>
            ))}
            
            {materials.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay materiales definidos. Agrega los materiales necesarios para este proceso.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Equipamiento Requerido ({equipment.length})
              </CardTitle>
              <Button type="button" onClick={addEquipment} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Equipo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {equipment.map((eq) => (
              <div key={eq.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Equipo</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeEquipment(eq.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Equipo
                    </label>
                    <Input
                      value={eq.name}
                      onChange={(e) => updateEquipment(eq.id, { name: e.target.value })}
                      placeholder="Ej: Impresora DTF"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={eq.isRequired}
                        onChange={(e) => updateEquipment(eq.id, { isRequired: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Equipo requerido</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <Input
                    value={eq.description}
                    onChange={(e) => updateEquipment(eq.id, { description: e.target.value })}
                    placeholder="Descripción del equipo..."
                  />
                </div>
              </div>
            ))}
            
            {equipment.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay equipamiento definido. Agrega los equipos necesarios para este proceso.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Notas Adicionales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales, consejos, recomendaciones..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                * Los campos marcados son requeridos
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !formData.name.trim() || !formData.productId}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Crear Proceso
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}