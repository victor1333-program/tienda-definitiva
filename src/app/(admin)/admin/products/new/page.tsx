"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import { 
  ArrowLeft, Save, Package, Settings, 
  CheckCircle, AlertCircle, Wand2, RefreshCw,
  FileImage, Video, FileText, Upload, X, Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import fetcher from "@/lib/fetcher"
import { toast } from "react-hot-toast"

interface MediaFile {
  id: string
  url: string
  type: 'image' | 'video' | 'document'
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // File upload refs
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    comparePrice: "",
    costPrice: "",
    sku: "",
    isActive: true,
  })

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])

  const { data: categoriesData } = useSWR("/api/categories", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
    dedupingInterval: 2000
  })
  const categories = categoriesData?.categories || []

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // Media upload functions
  const handleFileUpload = async (files: File[], type: 'image' | 'video' | 'document') => {
    setUploading(true)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'products')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          const url = data.url || data.data?.secure_url || data.secure_url
          
          if (url) {
            const newFile: MediaFile = {
              id: Date.now().toString() + Math.random(),
              url,
              type,
              name: file.name
            }
            setMediaFiles(prev => [...prev, newFile])
          } else {
            toast.error(`Error: No se obtuvo URL para ${file.name}`)
          }
        } else {
          const error = await response.json()
          toast.error(error.error || `Error al subir ${file.name}`)
        }
      }
      toast.success('Archivos subidos correctamente')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Error al subir archivos')
    } finally {
      setUploading(false)
    }
  }

  const removeMediaFile = (id: string) => {
    setMediaFiles(prev => prev.filter(file => file.id !== id))
  }

  const generateSKU = () => {
    if (!formData.name) return
    
    const namePart = formData.name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .split(' ')
      .map(word => word.substring(0, 3))
      .join('-')
      .substring(0, 10)

    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase()
    
    const generatedSKU = `${namePart}-GEN-${randomPart}`
    
    handleInputChange('sku', generatedSKU)
    toast.success('SKU generado automáticamente')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validaciones básicas
      if (!formData.name || !formData.basePrice || selectedCategories.length === 0) {
        toast.error("Por favor completa todos los campos requeridos")
        setIsLoading(false)
        return
      }

      // Generar slug automáticamente
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      // Preparar datos multimedia
      const images = mediaFiles.filter(f => f.type === 'image').map(f => f.url)
      const videos = mediaFiles.filter(f => f.type === 'video').map(f => f.url)
      const documents = mediaFiles.filter(f => f.type === 'document').map(f => f.url)

      // Preparar datos del producto base
      const productData = {
        ...formData,
        slug,
        sku: formData.sku || `PRD-${Date.now()}`,
        basePrice: parseFloat(formData.basePrice),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        categories: selectedCategories,
        images: JSON.stringify(images),
        videos: JSON.stringify(videos),
        documents: JSON.stringify(documents),
        quantityPrices: JSON.stringify([]),
        suppliers: [],
        variants: []
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        const product = await response.json()
        toast.success("Producto base creado exitosamente")
        // Redirigir a la lista de productos por ahora
        router.push("/admin/products")
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al crear el producto")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al crear el producto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/products")}
            className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📦 Nuevo Producto Base</h1>
            <p className="text-gray-600 mt-1">Crea el producto base y luego configura características específicas</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          <span>Paso 1 de 2: Producto Base</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Información Básica
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ej: Camiseta Básica Premium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción Breve
                <span className="text-xs text-gray-500 ml-2">
                  ({formData.description.length}/200 caracteres)
                </span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    handleInputChange("description", e.target.value)
                  }
                }}
                placeholder="Descripción básica del producto..."
                className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 border-gray-300 focus:ring-orange-500"
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Multimedia */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Archivos Multimedia
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Imágenes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imágenes del Producto
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => e.target.files && handleFileUpload(Array.from(e.target.files), 'image')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin inline" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <FileImage className="w-4 h-4 mr-2 inline" />
                        Subir Imágenes
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Videos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Videos del Producto
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => e.target.files && handleFileUpload(Array.from(e.target.files), 'video')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin inline" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4 mr-2 inline" />
                        Subir Videos
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Documentos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documentos/Manuales
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    ref={documentInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    multiple
                    onChange={(e) => e.target.files && handleFileUpload(Array.from(e.target.files), 'document')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => documentInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin inline" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2 inline" />
                        Subir Documentos
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview de archivos subidos */}
            {mediaFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Archivos Subidos:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {mediaFiles.map((file) => (
                    <div key={file.id} className="relative group border border-gray-200 rounded-lg p-2 hover:shadow-md transition-shadow">
                      <div className="relative">
                        {file.type === 'image' ? (
                          <>
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <div className="absolute top-1 left-1">
                              <span className="bg-gray-200 text-gray-800 text-xs px-1 py-0 rounded">
                                IMG
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                              {file.type === 'video' ? (
                                <Video className="w-6 h-6 text-gray-500" />
                              ) : (
                                <FileText className="w-6 h-6 text-gray-500" />
                              )}
                            </div>
                            <div className="absolute top-1 left-1">
                              <span className="bg-gray-200 text-gray-800 text-xs px-1 py-0 rounded">
                                {file.type === 'video' ? 'VID' : 'DOC'}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="absolute top-1 right-1">
                          <button
                            type="button"
                            onClick={() => removeMediaFile(file.id)}
                            className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        {file.type === 'image' && (
                          <button
                            type="button"
                            className="absolute bottom-1 right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate font-medium">{file.name}</p>
                      <p className="text-xs text-gray-400">{file.type.toUpperCase()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Categorías */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">🏷️ Categorías</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categorías * <span className="text-xs text-gray-500">(Selecciona una o más)</span>
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
              {categories.length > 0 ? (
                categories.map((category: any) => (
                  <label key={category.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-2">No se encontraron categorías</p>
              )}
            </div>
            {selectedCategories.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedCategories.map(catId => {
                  const category = categories.find((c: any) => c.id === catId)
                  return category ? (
                    <span key={catId} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
                      {category.name}
                    </span>
                  ) : null
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Configuración de Precios */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">💰 Configuración de Precios</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Base * <span className="text-xs text-gray-500">(€)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => handleInputChange("basePrice", e.target.value)}
                    placeholder="15.99"
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio de Comparación <span className="text-xs text-gray-500">(€)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.comparePrice}
                    onChange={(e) => handleInputChange("comparePrice", e.target.value)}
                    placeholder="19.99"
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Si se completa, el precio base aparecerá tachado en la web
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio de Coste <span className="text-xs text-gray-500">(€)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => handleInputChange("costPrice", e.target.value)}
                    placeholder="8.50"
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Para calcular márgenes de beneficio en finanzas
                </p>
              </div>
            </div>

            {/* SKU Generator */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  SKU del Producto
                </label>
                <button
                  type="button"
                  onClick={generateSKU}
                  disabled={!formData.name}
                  className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
                >
                  <Wand2 className="w-3 h-3" />
                  Generar SKU
                </button>
              </div>
              <Input
                value={formData.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                placeholder="Se generará automáticamente"
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                El SKU se genera automáticamente basado en el nombre del producto
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange("isActive", e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Producto activo (visible en la tienda)
              </label>
            </div>
          </div>
        </Card>

        {/* Próximos pasos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">¿Qué sigue después?</h4>
              <p className="text-sm text-blue-700 mb-2">
                Una vez creado el producto base, podrás configurar:
              </p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• 🎨 Personalización (editor de diseño, áreas personalizables)</li>
                <li>• 📏 Variantes (tallas, colores, materiales específicos)</li>
                <li>• 🖼️ Imágenes y multimedia</li>
                <li>• 🛠️ Procesos de producción (opcional)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Crear Producto Base
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}