"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Plus, Trash2, Eye, Grid3x3, Settings, Package, Image as ImageIcon, Palette } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "react-hot-toast"
import AreaEditor from "@/components/admin/personalization/AreaEditor"

interface Product {
  id: string
  name: string
  images?: string
  categories?: Array<{
    category: {
      id: string
      name: string
    }
  }>
}

interface PrintArea {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  realWidth?: number
  realHeight?: number
  printingMethod: string
  allowText: boolean
  allowImages: boolean
  allowShapes: boolean
  allowClipart: boolean
  mandatoryPersonalization?: boolean
}

interface ProductSide {
  id: string
  name: string
  image2D?: string
  position?: number
  printAreas?: PrintArea[]
}

interface PrintingMethod {
  id: string
  name: string
  isActive: boolean
}

export default function ConfigurarProducto() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [sides, setSides] = useState<ProductSide[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("sides")
  
  // Ref para evitar creaciones duplicadas
  const hasAttemptedDefaultSide = useRef(false)
  
  // New side form
  const [newSideName, setNewSideName] = useState("")
  const [showNewSideForm, setShowNewSideForm] = useState(false)
  
  // Image change modal
  const [selectedSideForImage, setSelectedSideForImage] = useState<ProductSide | null>(null)
  const [newImageUrl, setNewImageUrl] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  
  // Printing methods state
  const [printingMethods, setPrintingMethods] = useState<PrintingMethod[]>([])
  const [printingMethodsLoading, setPrintingMethodsLoading] = useState(true)
  

  useEffect(() => {
    if (productId) {
      // Reset states when productId changes
      setProduct(null)
      setSides([])
      setLoading(true)
      hasAttemptedDefaultSide.current = false
      
      fetchProduct()
      fetchPrintingMethods()
    }
  }, [productId])

  // Ejecutar fetchProductSides después de cargar el producto
  useEffect(() => {
    if (product && productId) {
      fetchProductSides()
    }
  }, [product, productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      const data = await response.json()
      
      if (response.ok) {
        setProduct(data.product || data)
      } else {
        toast.error('Error al cargar el producto')
        router.push('/admin/personalizacion/productos')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Error al cargar el producto')
      setLoading(false)
    }
  }

  const fetchProductSides = async () => {
    try {
      const response = await fetch(`/api/personalization/sides?productId=${productId}`)
      const data = await response.json()
      
      if (response.ok) {
        const sidesData = data.data || []
        setSides(sidesData)
        
        // Cargar métodos de impresión existentes de las áreas
        const newPrintingMethods: Record<string, string> = {}
        sidesData.forEach((side: ProductSide) => {
          if (side.printAreas && side.printAreas.length > 0) {
            // Tomar el método de la primera área como método del lado
            newPrintingMethods[side.id] = side.printAreas[0].printingMethod || 'DTG'
          }
        })
        
        // Actualizar el estado preservando los valores locales si existen
        setPrintingMethod(prev => ({
          ...prev,
          ...newPrintingMethods
        }))
        
        // Si no hay lados y no hemos intentado crear uno aún
        if (sidesData.length === 0 && product && !hasAttemptedDefaultSide.current) {
          hasAttemptedDefaultSide.current = true
          await createDefaultFrontSide()
        }
      }
    } catch (error) {
      console.error('Error fetching sides:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrintingMethods = async () => {
    try {
      const response = await fetch('/api/printing-methods')
      const data = await response.json()
      
      if (response.ok) {
        // Filter active methods only
        const activeMethods = data.filter((method: PrintingMethod) => method.isActive)
        setPrintingMethods(activeMethods)
      } else {
        console.error('Error fetching printing methods:', data)
      }
    } catch (error) {
      console.error('Error fetching printing methods:', error)
    } finally {
      setPrintingMethodsLoading(false)
    }
  }

  const createDefaultFrontSide = async () => {
    try {
      // Obtener la primera imagen del producto
      let defaultImage = null
      if (product?.images) {
        try {
          const images = JSON.parse(product.images)
          if (images.length > 0) {
            defaultImage = images[0]
          }
        } catch (e) {
          console.error('Error parsing product images:', e)
        }
      }

      const response = await fetch('/api/personalization/sides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          name: 'FRONTAL',
          displayName: 'Frontal',
          position: 0,
          image2D: defaultImage,
          isActive: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSides([data.data])
        toast.success('¡Bienvenido! Se ha creado automáticamente el lado frontal de tu producto. Ahora puedes configurar las áreas de personalización.')
      } else {
        const errorData = await response.json()
        console.error('Error creating default side:', errorData)
        
        // Si el error es porque ya existe, simplemente recargar
        if (response.status === 409 || errorData.error?.includes('duplicate')) {
          await fetchProductSides()
        }
      }
    } catch (error) {
      console.error('Error creating default front side:', error)
    }
  }

  const handleCreateSide = async () => {
    if (!newSideName.trim()) {
      toast.error('El nombre del lado es requerido')
      return
    }

    setSaving(true)
    try {
      // Obtener la siguiente posición disponible
      const nextPosition = sides.length > 0 ? Math.max(...sides.map(s => s.position || 0)) + 1 : 0
      
      const response = await fetch('/api/personalization/sides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          name: newSideName.trim(),
          position: nextPosition,
          image2D: null
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSides(prev => [...prev, data.data].sort((a, b) => (a.position || 0) - (b.position || 0)))
        setNewSideName("")
        setShowNewSideForm(false)
        toast.success('Lado creado exitosamente')
      } else {
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type')
        })
        
        const text = await response.text()
        console.error('Response text:', text)
        
        if (text.trim().startsWith('<')) {
          toast.error(`Error del servidor (${response.status}): Página HTML devuelta en lugar de JSON`)
        } else {
          try {
            const error = JSON.parse(text)
            if (error.details && Array.isArray(error.details)) {
              // Error de validación Zod
              const validationErrors = error.details.map(d => d.message).join(', ')
              toast.error(`Error de validación: ${validationErrors}`)
            } else {
              toast.error(error.error || 'Error al crear el lado')
            }
          } catch (e) {
            toast.error(`Error del servidor (${response.status}): ${text.substring(0, 100)}`)
          }
        }
      }
    } catch (error) {
      console.error('Error creating side:', error)
      toast.error('Error al crear el lado')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSide = async (sideId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este lado?')) return

    setSaving(true)
    try {
      const response = await fetch(`/api/personalization/sides/${sideId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSides(prev => prev.filter(side => side.id !== sideId))
        toast.success('Lado eliminado exitosamente')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar el lado')
      }
    } catch (error) {
      console.error('Error deleting side:', error)
      toast.error('Error al eliminar el lado')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenImageModal = (side: ProductSide) => {
    setSelectedSideForImage(side)
    setNewImageUrl(side.image2D || "")
    setSelectedFile(null)
    setPreviewUrl(side.image2D || "")
    setIsImageModalOpen(true)
  }

  const handleCloseImageModal = () => {
    setSelectedSideForImage(null)
    setNewImageUrl("")
    setSelectedFile(null)
    setPreviewUrl("")
    setIsUploadingImage(false)
    setIsImageModalOpen(false)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setNewImageUrl("") // Clear URL when file is selected
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlChange = (url: string) => {
    setNewImageUrl(url)
    setSelectedFile(null) // Clear file when URL is entered
    setPreviewUrl(url)
  }

  const handleUpdateSideImage = async () => {
    if (!selectedSideForImage) {
      console.error('No side selected for image update')
      return
    }

    setIsUploadingImage(true)
    
    try {
      let finalImageUrl = newImageUrl

      // Si hay un archivo seleccionado, subirlo primero
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name)
        
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('folder', 'personalization')
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          finalImageUrl = uploadData.url
          console.log('File uploaded successfully:', finalImageUrl)
        } else {
          const uploadError = await uploadResponse.json()
          console.error('Upload error:', uploadError)
          toast.error('Error al subir la imagen')
          return
        }
      }

      console.log('Updating side image:', {
        sideId: selectedSideForImage.id,
        finalImageUrl: finalImageUrl
      })

      // Actualizar el lado con la URL final
      const response = await fetch(`/api/personalization/sides/${selectedSideForImage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          image2D: finalImageUrl || null
        })
      })

      console.log('API Response status:', response.status)
      
      if (response.ok) {
        const responseData = await response.json()
        console.log('API Response data:', responseData)
        
        // Actualizar el lado en el estado local
        setSides(prevSides => 
          prevSides.map(side => 
            side.id === selectedSideForImage.id 
              ? { ...side, image2D: finalImageUrl || null }
              : side
          )
        )
        toast.success('Imagen actualizada exitosamente')
        handleCloseImageModal()
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        toast.error(errorData.error || 'Error al actualizar la imagen')
      }
    } catch (error) {
      console.error('Error updating side image:', error)
      toast.error('Error al actualizar la imagen')
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Estados para el editor visual de áreas
  const [showAreaEditor, setShowAreaEditor] = useState(false)
  const [selectedSideForEditor, setSelectedSideForEditor] = useState<ProductSide | null>(null)
  
  // Estados para almacenar mediciones por lado
  const [sideMeasurements, setSideMeasurements] = useState<Record<string, any>>({})
  
  // Estados para personalización obligatoria
  const [mandatoryPersonalization, setMandatoryPersonalization] = useState<Record<string, boolean>>({})
  
  // Estados para método de impresión
  const [printingMethod, setPrintingMethod] = useState<Record<string, string>>({})

  const handleConfigureArea = async (side: ProductSide) => {
    // Abrir directamente el modal del Editor Visual de Áreas
    setSelectedSideForEditor(side)
    setShowAreaEditor(true)
  }


  const getProductImage = () => {
    try {
      if (product?.images) {
        const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
        if (Array.isArray(images) && images.length > 0) {
          return images[0]
        }
      }
    } catch (error) {
      console.error('Error parsing product images:', error)
    }
    return '/placeholder-product.png'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/personalizacion/productos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Configurando Producto...</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Producto no encontrado</h3>
        <Button asChild>
          <Link href="/admin/personalizacion/productos">
            Volver a Productos
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/personalizacion/productos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Configurar Personalización</h1>
          <p className="text-gray-600 mt-1">{product.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/editor/${productId}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Previsualizar
            </Link>
          </Button>
        </div>
      </div>



      {/* Configuration Content */}
      <div className="space-y-6">

        {/* Sides Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lados del Producto</CardTitle>
                <CardDescription>
                  Define los diferentes lados o vistas del producto que se pueden personalizar
                </CardDescription>
              </div>
              <Button 
                onClick={() => setShowNewSideForm(true)}
                disabled={showNewSideForm}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Lado
              </Button>
            </div>
          </CardHeader>
            <CardContent className="space-y-4">
              {/* New Side Form */}
              {showNewSideForm && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Lado
                        </label>
                        <Input
                          value={newSideName}
                          onChange={(e) => setNewSideName(e.target.value)}
                          placeholder="Ej: Frontal, Trasero, Lateral izquierdo..."
                          className="bg-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateSide} disabled={saving}>
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? 'Guardando...' : 'Crear Lado'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowNewSideForm(false)
                            setNewSideName("")
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Existing Sides */}
              {sides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sides.map((side) => (
                    <Card key={side.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{side.name}</CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSide(side.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {side.image2D ? (
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                            <img
                              src={side.image2D}
                              alt={side.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm">Sin imagen</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="text-sm text-gray-600">
                          {side.printAreas?.length > 0 ? (
                            <div>
                              <div>Área configurada</div>
                              {(side.printAreas[0]?.mandatoryPersonalization || mandatoryPersonalization[side.id]) && (
                                <div className="text-xs text-orange-600 font-medium mt-1">
                                  ⚠️ Personalización obligatoria
                                </div>
                              )}
                            </div>
                          ) : 'Sin área configurada'}
                        </div>
                        
                        
                        {/* Personalización obligatoria */}
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                          <Checkbox
                            id={`mandatory-${side.id}`}
                            checked={mandatoryPersonalization[side.id] || side.printAreas?.[0]?.mandatoryPersonalization || false}
                            onCheckedChange={(checked) => {
                              setMandatoryPersonalization(prev => ({
                                ...prev,
                                [side.id]: checked as boolean
                              }))
                            }}
                          />
                          <Label htmlFor={`mandatory-${side.id}`} className="text-xs font-medium">
                            Personalización obligatoria
                          </Label>
                        </div>

                        {/* Método de impresión */}
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Método de impresión</Label>
                          <Select
                            value={printingMethod[side.id] || 'DTG'}
                            onValueChange={async (value) => {
                              // Actualizar el estado local inmediatamente
                              setPrintingMethod(prev => ({
                                ...prev,
                                [side.id]: value
                              }))
                              
                              // Actualizar todas las áreas existentes de este lado
                              if (side.printAreas && side.printAreas.length > 0) {
                                try {
                                  for (const area of side.printAreas) {
                                    await fetch(`/api/personalization/areas/${area.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ printingMethod: value })
                                    })
                                  }
                                  toast.success(`Método de impresión actualizado a ${value}`)
                                  // No recargar datos inmediatamente para preservar el estado local
                                } catch (error) {
                                  console.error('Error updating printing method:', error)
                                  toast.error('Error al actualizar el método de impresión')
                                  // Revertir el estado local en caso de error
                                  setPrintingMethod(prev => {
                                    const newState = { ...prev }
                                    delete newState[side.id]
                                    return newState
                                  })
                                }
                              }
                            }}
                          >
                            <SelectTrigger className="text-xs bg-white border-gray-300">
                              <SelectValue placeholder="Seleccionar método" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-300 shadow-lg">
                              {printingMethodsLoading ? (
                                <SelectItem value="loading" disabled>Cargando métodos...</SelectItem>
                              ) : printingMethods.length === 0 ? (
                                <SelectItem value="no-methods" disabled>No hay métodos disponibles</SelectItem>
                              ) : (
                                printingMethods.map((method) => (
                                  <SelectItem key={method.id} value={method.name}>
                                    {method.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex gap-1">
                            <Button 
                              asChild 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-xs px-2"
                            >
                              <Link href={`/admin/personalizacion/productos/${productId}/sides/${side.id}?action=changeName`}>
                                <Palette className="h-3 w-3 mr-1" />
                                Nombre
                              </Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-xs px-2"
                              onClick={() => handleOpenImageModal(side)}
                            >
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Imagen
                            </Button>
                          </div>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleConfigureArea(side)}
                          >
                            <Palette className="h-4 w-4 mr-2" />
                            {side.printAreas?.length > 0 ? 'Editar Área' : 'Configurar Área'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <Grid3x3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay lados configurados</h3>
                  <p className="text-gray-600 mb-4">
                    Agrega al menos un lado del producto para poder configurar áreas de personalización
                  </p>
                  <Button onClick={() => setShowNewSideForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primer Lado
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
      </div>

      {/* Next Steps - Zakeke Style */}
      {sides.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold text-gray-900">
                ¡Perfecto! Tienes {sides.length} lado{sides.length !== 1 ? 's' : ''} configurado{sides.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-gray-600">
                {(() => {
                  const sidesWithAreas = sides.filter(side => side.printAreas?.length > 0).length;
                  return sidesWithAreas > 0 
                    ? sidesWithAreas + ' lado' + (sidesWithAreas !== 1 ? 's' : '') + ' con área configurada. '
                    : 'Configura las áreas de personalización para cada lado. ';
                })()}
                Luego puedes continuar con las variaciones o ver la vista previa.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  asChild
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Link href={`/admin/personalizacion/productos/${productId}/variaciones`}>
                    <Grid3x3 className="h-5 w-5 mr-2" />
                    Ir a Variaciones
                  </Link>
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Link href={`/admin/personalizacion/productos/${productId}/vista-previa`}>
                    <Eye className="h-5 w-5 mr-2" />
                    No ofrezco variaciones, ir a vista previa
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal para cambiar imagen */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cambiar Imagen del Lado</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Opción 1: Subir archivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subir imagen desde tu computadora
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Haz clic para seleccionar una imagen
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      JPG, PNG, WEBP (máx. 5MB)
                    </span>
                  </div>
                </label>
              </div>
              {selectedFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Archivo seleccionado: {selectedFile.name}
                </p>
              )}
            </div>

            {/* Divisor */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">o</span>
              </div>
            </div>

            {/* Opción 2: URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                O ingresa una URL de imagen
              </label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={newImageUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Vista previa */}
            {previewUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vista previa
                </label>
                <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Vista previa"
                    className="max-w-full max-h-full object-contain"
                    onError={() => {
                      setPreviewUrl("")
                      if (selectedFile) {
                        toast.error("Error al cargar la vista previa del archivo")
                      } else {
                        toast.error("URL de imagen inválida")
                      }
                    }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleCloseImageModal}
                disabled={isUploadingImage}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateSideImage}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Editor Visual de Áreas */}
      {selectedSideForEditor && (
        <AreaEditor
          isOpen={showAreaEditor}
          onClose={() => {
            setShowAreaEditor(false)
            setSelectedSideForEditor(null)
          }}
          sideImage={selectedSideForEditor.image2D || getProductImage()}
          sideName={selectedSideForEditor.name}
          existingAreas={selectedSideForEditor.printAreas?.map(area => ({
            id: area.id,
            name: area.name,
            shape: 'rectangle' as const,
            x: area.x,
            y: area.y,
            width: area.width,
            height: area.height,
            rotation: 0,
            realWidth: (area as any).realWidth,
            realHeight: (area as any).realHeight,
            isRelativeCoordinates: true,
            referenceWidth: 800,
            referenceHeight: 600
          })) || []}
          existingMeasurementData={sideMeasurements[selectedSideForEditor.id]}
          onSave={async (areas, measurementData) => {
            try {
              setSaving(true)
              
              // Guardar las mediciones para este lado
              if (measurementData && selectedSideForEditor) {
                setSideMeasurements(prev => ({
                  ...prev,
                  [selectedSideForEditor.id]: measurementData
                }))
              }
              
              // Si hay áreas existentes, eliminarlas primero
              if (selectedSideForEditor.printAreas && selectedSideForEditor.printAreas.length > 0) {
                for (const existingArea of selectedSideForEditor.printAreas) {
                  await fetch(`/api/personalization/areas/${existingArea.id}`, {
                    method: 'DELETE'
                  })
                }
              }
              
              // Crear todas las áreas nuevas
              const newAreas: PrintArea[] = []
              
              for (let i = 0; i < areas.length; i++) {
                const area = areas[i]
                const areaData = {
                  sideId: selectedSideForEditor.id,
                  name: area.name,
                  x: area.x, // No redondear para mantener precisión
                  y: area.y, // No redondear para mantener precisión
                  width: area.width, // No redondear para mantener precisión
                  height: area.height, // No redondear para mantener precisión
                  rotation: area.rotation || 0,
                  ...(area.realWidth && { realWidth: area.realWidth }),
                  ...(area.realHeight && { realHeight: area.realHeight }),
                  printingMethod: printingMethod[selectedSideForEditor.id] || 'DTG',
                  allowText: true,
                  allowImages: true,
                  allowShapes: true,
                  allowClipart: true,
                  mandatoryPersonalization: mandatoryPersonalization[selectedSideForEditor.id] || area.mandatoryPersonalization || false,
                  sortOrder: i,
                  isRelativeCoordinates: area.isRelativeCoordinates || true,
                  referenceWidth: area.referenceWidth || 800,
                  referenceHeight: area.referenceHeight || 600
                }
                
                
                const response = await fetch('/api/personalization/areas', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify(areaData)
                })
                
                if (response.ok) {
                  const data = await response.json()
                  newAreas.push({ ...data.data, mandatoryPersonalization: mandatoryPersonalization[selectedSideForEditor.id] || data.data.mandatoryPersonalization })
                } else {
                  console.error('Response failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries())
                  })
                  
                  // Intentar leer como texto primero
                  const responseText = await response.text()
                  console.error('Response text:', responseText)
                  
                  let errorData
                  try {
                    errorData = JSON.parse(responseText)
                  } catch (e) {
                    console.error('Failed to parse response as JSON:', e)
                    errorData = { error: 'Error del servidor: ' + response.status }
                  }
                  
                  console.error('Error data:', errorData)
                  throw new Error(errorData.error || 'Error del servidor: ' + response.status)
                }
              }
              
              // Actualizar el lado en el estado local con todas las áreas
              setSides(prevSides => 
                prevSides.map(side => 
                  side.id === selectedSideForEditor.id 
                    ? { ...side, printAreas: newAreas }
                    : side
                )
              )
              
              toast.success(areas.length + ' área' + (areas.length !== 1 ? 's' : '') + ' guardada' + (areas.length !== 1 ? 's' : '') + ' exitosamente')
              
              setShowAreaEditor(false)
              setSelectedSideForEditor(null)
            } catch (error) {
              console.error('Error saving area:', error)
              toast.error('Error al guardar el área')
            } finally {
              setSaving(false)
            }
          }}
        />
      )}

    </div>
  )
}