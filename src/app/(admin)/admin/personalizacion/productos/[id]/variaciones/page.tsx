"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Grid3x3, Package, Eye, Save, Upload, Image as ImageIcon, Settings, Palette } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "react-hot-toast"
import AreaEditor from "@/components/admin/personalization/AreaEditor"
import VariantChangeConfirmModal from "@/components/admin/personalization/VariantChangeConfirmModal"

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
  variants?: ProductVariant[]
}

interface ProductVariant {
  id: string
  sku: string
  size?: string
  colorName?: string
  colorHex?: string
  colorDisplay?: string
  material?: string
  stock?: number
  price?: number
  isActive?: boolean
  images?: string
}

interface ProductSide {
  id: string
  name: string
  displayName?: string
  image2D?: string
  printAreas?: PrintArea[]
  variantSideImages?: Array<{
    id: string
    variantId: string
    sideId: string
    imageUrl: string
  }>
}

interface PrintArea {
  id: string
  name: string
  displayName?: string
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  realWidth?: number  // En cm
  realHeight?: number // En cm
  printingMethod: string
  allowText: boolean
  allowImages: boolean
  allowShapes: boolean
  allowClipart: boolean
  side?: {
    id: string
    name: string
    displayName?: string
    image2D?: string
  }
  variant?: ProductVariant
}

interface VariantPersonalization {
  variantId: string
  sides: Array<{
    sideId: string
    customImage?: string
    printAreas: Array<{
      areaId: string
      customImage?: string
      enabled: boolean
    }>
  }>
}

export default function VariacionesPersonalizacion() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [sides, setSides] = useState<ProductSide[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [variantPersonalizations, setVariantPersonalizations] = useState<VariantPersonalization[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingVariant, setEditingVariant] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState<string | null>(null)
  const [showAreaEditor, setShowAreaEditor] = useState(false)
  const [selectedAreaForEdit, setSelectedAreaForEdit] = useState<PrintArea | null>(null)
  const [lastToastTime, setLastToastTime] = useState<number>(0)
  
  // Estados para el modal de confirmación de cambios en variantes
  const [showVariantChangeModal, setShowVariantChangeModal] = useState(false)
  const [pendingChange, setPendingChange] = useState<{
    type: 'image' | 'area'
    description: string
    variantId: string
    sideId?: string
    file?: File
    areaData?: any
    action: () => Promise<void>
  } | null>(null)

  // Helper para mostrar toast con control de tiempo y mensaje
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const now = Date.now()
    // Solo mostrar toast si han pasado al menos 3 segundos desde el último
    // o si es un mensaje de error (los errores siempre se muestran)
    if (now - lastToastTime > 3000 || type === 'error') {
      if (type === 'success') {
        toast.success(message, {
          duration: 2000, // Duración más corta para evitar acumulación
          id: 'variant-success' // ID único para evitar duplicados
        })
      } else {
        toast.error(message, {
          duration: 3000,
          id: 'variant-error'
        })
      }
      setLastToastTime(now)
    }
  }

  useEffect(() => {
    if (productId) {
      fetchData()
    }
  }, [productId])

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchProduct(),
        fetchProductSides(),
        fetchProductVariants(),
        fetchVariantPersonalizations()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      const data = await response.json()
      
      if (response.ok) {
        setProduct(data.product || data)
      } else {
        toast.error('Error al cargar el producto')
        router.push('/admin/personalizacion/productos')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Error al cargar el producto')
    }
  }

  const fetchProductSides = async () => {
    try {
      const response = await fetch(`/api/personalization/sides?productId=${productId}&includeVariantImages=true`)
      const data = await response.json()
      
      if (response.ok) {
        setSides(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching sides:', error)
    }
  }

  const fetchProductVariants = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/variants`)
      const data = await response.json()
      
      if (response.ok) {
        setVariants(data.variants || data.data || [])
      }
    } catch (error) {
      console.error('Error fetching variants:', error)
    }
  }

  const fetchVariantPersonalizations = async () => {
    try {
      // Esta sería una nueva API endpoint para obtener personalizaciones por variante
      const response = await fetch(`/api/personalization/variants?productId=${productId}`)
      if (response.ok) {
        const data = await response.json()
        setVariantPersonalizations(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching variant personalizations:', error)
    }
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

  const getVariantImage = (variant: ProductVariant) => {
    if (variant.images) {
      try {
        const images = typeof variant.images === 'string' ? JSON.parse(variant.images) : variant.images
        if (Array.isArray(images) && images.length > 0) {
          return images[0]
        }
      } catch (error) {
        console.error('Error parsing variant images:', error)
      }
    }
    return getProductImage()
  }

  const getVariantOptions = (variant: ProductVariant) => {
    const options = []
    
    if (variant.colorName) {
      options.push(`Color: ${variant.colorName}`)
    }
    if (variant.size) {
      options.push(`Talla: ${variant.size}`)
    }
    if (variant.material) {
      options.push(`Material: ${variant.material}`)
    }
    
    if (options.length === 0) {
      return variant.sku ? `SKU: ${variant.sku}` : 'Variante básica'
    }
    
    return options.join(', ')
  }

  const getVariantDisplayName = (variant: ProductVariant) => {
    const values = []
    
    if (variant.colorName) {
      values.push(variant.colorName)
    }
    if (variant.size) {
      values.push(variant.size)
    }
    if (variant.material) {
      values.push(variant.material)
    }
    
    if (values.length === 0) {
      return variant.sku || `Variante #${variant.id.slice(-8)}`
    }
    
    return values.join(' - ')
  }

  const getAreaDimensions = (area: PrintArea) => {
    // Si hay medidas reales (en cm), usarlas. Si no, mostrar las medidas en píxeles
    if (area.realWidth && area.realHeight) {
      return `${area.realWidth.toFixed(2)} x ${area.realHeight.toFixed(2)} cm`
    }
    return `${area.width} x ${area.height} px`
  }

  const getSideImageForVariant = (side: ProductSide, variantId: string) => {
    // Buscar si hay una imagen específica para esta variante y lado
    const variantImage = side.variantSideImages?.find(
      img => img.variantId === variantId && img.sideId === side.id
    )
    
    // Si hay imagen específica, usarla; si no, usar la imagen por defecto del lado
    return variantImage?.imageUrl || side.image2D || '/placeholder-product.png'
  }

  const handleEditVariantImage = (variantId: string, sideId: string) => {
    // Crear input file oculto y activarlo
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => handleImageUpload(e, variantId, sideId)
    input.click()
  }

  const handleImageUpload = async (e: Event, variantId: string, sideId: string) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (!file) return

    const variant = variants.find(v => v.id === variantId)
    const side = sides.find(s => s.id === sideId)
    
    if (!variant || !side) return

    // Preparar la descripción del cambio
    const variantName = getVariantDisplayName(variant)
    const changeDescription = `Cambiar imagen del lado "${side.name}" para la variante ${variantName}`

    // Preparar la acción a ejecutar
    const executeImageUpload = async () => {
      const uploadKey = `${variantId}-${sideId}`
      setUploadingImage(uploadKey)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('variantId', variantId)
        formData.append('sideId', sideId)
        formData.append('productId', productId)

        const response = await fetch('/api/personalization/variant-images', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            showToast('Imagen actualizada correctamente en 1 variante')
            await fetchProductSides()
          } else {
            throw new Error(data.error || 'Error al procesar la imagen')
          }
        } else {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Error del servidor: ${response.status}`)
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al subir la imagen'
        toast.error(`Error: ${errorMessage}`)
      } finally {
        setUploadingImage(null)
      }
    }

    // Debug: mostrar información antes de abrir el modal
    console.log('🔧 Configurando modal de cambio de variantes:', {
      type: 'image',
      variantId,
      sideId,
      variantName,
      description: changeDescription,
      allVariantsCount: variants.length,
      currentVariant: variant ? {
        id: variant.id,
        sku: variant.sku,
        colorName: variant.colorName,
        size: variant.size,
        material: variant.material
      } : null
    })

    // Configurar el cambio pendiente y mostrar modal
    setPendingChange({
      type: 'image',
      description: changeDescription,
      variantId,
      sideId,
      file,
      action: executeImageUpload
    })
    setShowVariantChangeModal(true)
  }

  const handleSaveVariantPersonalization = async (variantId: string) => {
    setSaving(true)
    try {
      // Aquí implementarías la lógica para guardar la personalización de la variante
      showToast('Personalización de variante guardada')
      setEditingVariant(null)
    } catch (error) {
      console.error('Error saving variant personalization:', error)
      toast.error('Error al guardar personalización')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenAreaEditor = (area: PrintArea, variant: ProductVariant) => {
    // Encontrar el lado completo que contiene esta área
    const completeSide = sides.find(side => 
      side.printAreas && side.printAreas.some(a => a.id === area.id)
    )
    
    // Agregar información de la variante y del lado completo al área para el editor
    const areaWithVariant = {
      ...area,
      variant: variant,
      side: completeSide
    }
    setSelectedAreaForEdit(areaWithVariant)
    setShowAreaEditor(true)
  }

  const handleAreaEditorSave = async (areas: any[]) => {
    if (!selectedAreaForEdit || areas.length === 0) return

    const updatedArea = areas[0] // Asumiendo que solo editamos un área a la vez
    const variant = selectedAreaForEdit.variant

    // Preparar la acción a ejecutar
    const executeAreaUpdate = async () => {
      setSaving(true)
      try {
        const response = await fetch(`/api/personalization/areas/${selectedAreaForEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: updatedArea.name,
            x: Math.round(updatedArea.x),
            y: Math.round(updatedArea.y),
            width: Math.round(updatedArea.width),
            height: Math.round(updatedArea.height),
            rotation: Math.round(updatedArea.rotation || 0),
            realWidth: updatedArea.realWidth,
            realHeight: updatedArea.realHeight
          })
        })

        if (response.ok) {
          showToast('Área actualizada exitosamente')
          await fetchProductSides()
          setShowAreaEditor(false)
          setSelectedAreaForEdit(null)
        } else {
          throw new Error('Error al actualizar el área')
        }
      } catch (error) {
        console.error('Error saving area:', error)
        toast.error('Error al guardar los cambios del área')
      } finally {
        setSaving(false)
      }
    }
    
    if (!variant) {
      // Si no hay variante específica, ejecutar directamente
      await executeAreaUpdate()
      return
    }

    // Preparar la descripción del cambio
    const variantName = getVariantDisplayName(variant)
    const changeDescription = `Modificar área "${selectedAreaForEdit.name}" en la variante ${variantName}`

    // Configurar el cambio pendiente y mostrar modal
    setPendingChange({
      type: 'area',
      description: changeDescription,
      variantId: variant.id,
      areaData: updatedArea,
      action: executeAreaUpdate
    })
    setShowVariantChangeModal(true)
  }

  const handleVariantChangeConfirm = async (applyTo: 'current' | 'all' | 'same-size' | 'same-color' | 'same-material') => {
    if (!pendingChange) return

    console.log('🚀 INICIO handleVariantChangeConfirm:', {
      applyTo,
      currentVariantId: pendingChange.variantId,
      totalVariantsAvailable: variants.length
    })

    try {
      if (applyTo === 'current') {
        // Aplicar solo a la variante actual
        console.log('📍 Aplicando solo a variante actual')
        await pendingChange.action()
      } else {
        // Aplicar a múltiples variantes según la selección
        const targetVariants = getTargetVariants(applyTo, pendingChange.variantId)
        
        console.log('🎯 Aplicando cambios a variantes:', {
          applyTo,
          currentVariantId: pendingChange.variantId,
          targetVariants: targetVariants.map(v => ({
            id: v.id,
            sku: v.sku,
            colorName: v.colorName,
            size: v.size,
            material: v.material
          })),
          totalCount: targetVariants.length,
          changeType: pendingChange.type
        })

        // Verificar si tenemos variantes objetivo
        if (targetVariants.length === 0) {
          console.error('❌ No se encontraron variantes objetivo para:', applyTo)
          toast.error('No se encontraron variantes que coincidan con el criterio seleccionado')
          return
        }
        
        let successCount = 0
        let errorCount = 0
        
        for (const variant of targetVariants) {
          try {
            // Aplicar el cambio a cada variante individual
            if (pendingChange.type === 'image' && pendingChange.sideId && pendingChange.file) {
              await applyImageChangeToVariant(variant.id, pendingChange.sideId, pendingChange.file)
              successCount++
              console.log(`✅ Imagen aplicada exitosamente a variante ${variant.id}`)
            } else if (pendingChange.type === 'area' && pendingChange.areaData) {
              await applyAreaChangeToVariant(variant.id, pendingChange.areaData)
              successCount++
              console.log(`✅ Área aplicada exitosamente a variante ${variant.id}`)
            }
          } catch (error) {
            errorCount++
            console.error(`❌ Error aplicando cambio a variante ${variant.id}:`, error)
          }
        }
        
        if (successCount > 0) {
          const successMessage = successCount === 1 
            ? 'Imagen actualizada correctamente en 1 variante'
            : `Imágenes actualizadas correctamente en ${successCount} variantes`
          
          if (errorCount > 0) {
            showToast(`${successMessage} (${errorCount} errores)`)
          } else {
            showToast(successMessage)
          }
        } else {
          toast.error('No se pudo aplicar el cambio a ninguna variante')
        }
        
        // Recargar los datos para reflejar los cambios
        await fetchProductSides()
      }
    } catch (error) {
      console.error('Error applying changes to variants:', error)
      toast.error('Error al aplicar los cambios')
    } finally {
      setPendingChange(null)
      setShowVariantChangeModal(false)
    }
  }

  const getTargetVariants = (applyTo: string, currentVariantId: string) => {
    const currentVariant = variants.find(v => v.id === currentVariantId)
    if (!currentVariant) {
      console.error('❌ No se encontró la variante actual:', currentVariantId)
      return []
    }

    console.log('🔍 Filtrando variantes:', {
      applyTo,
      currentVariant: {
        id: currentVariant.id,
        sku: currentVariant.sku,
        colorName: currentVariant.colorName,
        size: currentVariant.size,
        material: currentVariant.material
      },
      totalVariants: variants.length
    })

    // Mostrar TODAS las variantes disponibles para debug
    console.log('📋 Todas las variantes disponibles:', variants.map(v => ({
      id: v.id,
      sku: v.sku,
      colorName: v.colorName,
      size: v.size,
      material: v.material
    })))

    let targetVariants: ProductVariant[] = []

    switch (applyTo) {
      case 'all':
        targetVariants = variants
        break
      case 'same-size':
        targetVariants = variants.filter(v => v.size === currentVariant.size)
        console.log(`🎯 Filtrando por talla "${currentVariant.size}":`, targetVariants.length, 'variantes encontradas')
        console.log('Variantes con misma talla:', targetVariants.map(v => `${v.sku} (talla: ${v.size})`))
        break
      case 'same-color':
        targetVariants = variants.filter(v => v.colorName === currentVariant.colorName)
        console.log(`🎯 Filtrando por color "${currentVariant.colorName}":`, targetVariants.length, 'variantes encontradas')
        console.log('Variantes con mismo color:', targetVariants.map(v => `${v.sku} (color: ${v.colorName})`))
        break
      case 'same-material':
        targetVariants = variants.filter(v => v.material === currentVariant.material)
        console.log(`🎯 Filtrando por material "${currentVariant.material}":`, targetVariants.length, 'variantes encontradas')
        console.log('Variantes con mismo material:', targetVariants.map(v => `${v.sku} (material: ${v.material})`))
        break
      default:
        targetVariants = [currentVariant]
        break
    }

    console.log('✅ Variantes objetivo seleccionadas:', targetVariants.map(v => ({
      id: v.id,
      sku: v.sku,
      colorName: v.colorName,
      size: v.size,
      material: v.material
    })))

    return targetVariants
  }

  const applyImageChangeToVariant = async (variantId: string, sideId: string, file: File) => {
    console.log(`📤 Subiendo imagen para variante ${variantId}, lado ${sideId}`)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('variantId', variantId)
    formData.append('sideId', sideId)
    formData.append('productId', productId)

    const response = await fetch('/api/personalization/variant-images', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || `Error del servidor: ${response.status}`
      console.error(`❌ Error al subir imagen para variante ${variantId}:`, errorMessage)
      throw new Error(`Error al aplicar imagen a variante ${variantId}: ${errorMessage}`)
    }

    const data = await response.json()
    if (!data.success) {
      console.error(`❌ La API retornó éxito = false para variante ${variantId}:`, data.error)
      throw new Error(`Error al procesar imagen para variante ${variantId}: ${data.error}`)
    }

    console.log(`✅ Imagen aplicada exitosamente a variante ${variantId}`)
    return data
  }

  const applyAreaChangeToVariant = async (variantId: string, areaData: any) => {
    // Esta función necesitaría ser implementada según tu API
    // Por ahora, aplicamos el cambio directamente al área
    if (selectedAreaForEdit) {
      const response = await fetch(`/api/personalization/areas/${selectedAreaForEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: areaData.name,
          x: Math.round(areaData.x),
          y: Math.round(areaData.y),
          width: Math.round(areaData.width),
          height: Math.round(areaData.height),
          rotation: Math.round(areaData.rotation || 0)
        })
      })

      if (!response.ok) {
        throw new Error(`Error al aplicar área a variante ${variantId}`)
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href={`/admin/personalizacion/productos/${productId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Gestión de Variaciones</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando variaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href={`/admin/personalizacion/productos/${productId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Gestión de Variaciones</h1>
          <p className="text-gray-600 mt-1">{product?.name}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/admin/personalizacion/productos/${productId}/vista-previa`}>
            <Eye className="h-4 w-4 mr-2" />
            Vista Previa
          </Link>
        </Button>
      </div>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" />
            Gestión de Variaciones con Personalización
          </CardTitle>
          <CardDescription>
            Aquí puedes personalizar cada combinación de variante del producto. Los lados ya configurados del producto principal se aplicarán a todas las variantes, pero puedes editar las imágenes específicas para cada combinación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-xl font-bold text-blue-600">{variants.length}</div>
              <p className="text-blue-700">Variaciones Totales</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-xl font-bold text-green-600">{sides.length}</div>
              <p className="text-green-700">Lados Configurados</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-xl font-bold text-orange-600">
                {sides.reduce((total, side) => total + (side.printAreas?.length || 0), 0)}
              </div>
              <p className="text-orange-700">Áreas de Impresión</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variants List */}
      {variants.length > 0 ? (
        <div className="space-y-4">
          {variants.map((variant) => (
            <Card key={variant.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={getVariantImage(variant)}
                        alt={getVariantDisplayName(variant)}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">{getVariantDisplayName(variant)}</CardTitle>
                      <CardDescription className="text-sm text-gray-600 mt-1">{getVariantOptions(variant)}</CardDescription>
                      {variant.sku && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          SKU: {variant.sku}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {variant.price && (
                      <Badge className="bg-green-100 text-green-800">
                        ${variant.price.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Lados con Personalización
                    </h4>
                    
                    {sides.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sides.map((side) => (
                          <Card key={side.id} className="bg-gray-50 border-2 hover:border-orange-200 transition-colors">
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-semibold text-gray-900">{side.name}</h5>
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    {side.printAreas?.length || 0} áreas
                                  </Badge>
                                </div>
                                
                                {/* Vista previa de la imagen */}
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-gray-700">Vista previa:</p>
                                  <div className="aspect-square bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm">
                                    <Image
                                      src={getSideImageForVariant(side, variant.id)}
                                      alt={side.name || 'Imagen del lado del producto'}
                                      width={120}
                                      height={120}
                                      className="object-cover w-full h-full"
                                    />
                                  </div>
                                </div>
                                
                                {/* Áreas de impresión con medidas */}
                                {side.printAreas && side.printAreas.length > 0 && (
                                  <div className="space-y-3">
                                    <p className="text-sm font-medium text-gray-700">Áreas de impresión:</p>
                                    <div className="space-y-2">
                                      {side.printAreas.map((area) => (
                                        <div key={area.id} className="space-y-2">
                                          <div className="flex justify-between items-center text-xs">
                                            <span className="font-medium">• {area.name}</span>
                                            <span className="bg-gray-200 px-2 py-1 rounded">
                                              {area.printingMethod}
                                            </span>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="secondary"
                                            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                            onClick={() => handleOpenAreaEditor(area, variant)}
                                          >
                                            <Grid3x3 className="h-3 w-3 mr-2" />
                                            {getAreaDimensions(area)} - Editor
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Botón para editar imagen del lado */}
                                <div className="pt-2 border-t">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full hover:bg-orange-50 hover:border-orange-300"
                                    onClick={() => handleEditVariantImage(variant.id, side.id)}
                                    disabled={uploadingImage === `${variant.id}-${side.id}`}
                                  >
                                    {uploadingImage === `${variant.id}-${side.id}` ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-600 mr-2"></div>
                                        Subiendo...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="h-3 w-3 mr-2" />
                                        Cambiar Imagen del Lado
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <Grid3x3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No hay lados configurados para este producto</p>
                        <Button asChild className="mt-2">
                          <Link href={`/admin/personalizacion/productos/${productId}`}>
                            Configurar Lados
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {editingVariant === variant.id && (
                    <div className="border-t pt-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-semibold mb-2">Editando Personalización</h5>
                        <p className="text-sm text-gray-600 mb-4">
                          Aquí puedes personalizar las imágenes específicas para esta variante.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveVariantPersonalization(variant.id)}
                            disabled={saving}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingVariant(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay variaciones configuradas
            </h3>
            <p className="text-gray-600 mb-6">
              Este producto no tiene variaciones. Para usar esta función, primero necesitas crear variaciones del producto.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link href={`/admin/products/${productId}/edit`}>
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Crear Variaciones
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/admin/personalizacion/productos/${productId}/vista-previa`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ir a Vista Previa
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {variants.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">¿Cómo funciona la personalización por variaciones?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-green-800">
              <p><strong>1. Herencia de configuración:</strong> Todas las variaciones heredan los lados y áreas de impresión del producto principal.</p>
              <p><strong>2. Personalización específica:</strong> Puedes personalizar imágenes específicas para cada combinación de variante.</p>
              <p><strong>3. Edición por lado:</strong> Cada lado puede tener una imagen diferente según la variación (ej: color de camiseta).</p>
              <p><strong>4. Áreas independientes:</strong> Las áreas de impresión mantienen su configuración pero pueden tener imágenes base diferentes.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Actions */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-gray-900">
              ¡Configuración Completada!
            </h3>
            <p className="text-gray-600">
              {variants.length > 0 
                ? `Has configurado ${variants.length} variaciones con ${sides.length} lados cada una`
                : 'La configuración está lista, puedes proceder a la vista previa'
              }
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                asChild
                size="lg"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Link href={`/admin/personalizacion/productos/${productId}/vista-previa`}>
                  <Eye className="h-5 w-5 mr-2" />
                  Ir a Vista Previa Final
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                size="lg"
                className="border-pink-300 text-pink-700 hover:bg-pink-50"
              >
                <Link href={`/admin/personalizacion/productos/${productId}`}>
                  <Palette className="h-5 w-5 mr-2" />
                  Volver a Configuración
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Editor Visual de Áreas */}
      {showAreaEditor && selectedAreaForEdit && (
        <AreaEditor
          isOpen={showAreaEditor}
          onClose={() => {
            setShowAreaEditor(false)
            setSelectedAreaForEdit(null)
          }}
          sideImage={
            selectedAreaForEdit.variant && selectedAreaForEdit.side 
              ? getSideImageForVariant(
                  // Encontrar el lado completo con las imágenes de variante
                  sides.find(s => s.id === selectedAreaForEdit.side?.id) || selectedAreaForEdit.side, 
                  selectedAreaForEdit.variant.id
                )
              : selectedAreaForEdit.side?.image2D || '/placeholder-product.png'
          }
          sideName={selectedAreaForEdit.side?.displayName || selectedAreaForEdit.side?.name || 'Lado'}
          existingAreas={[{
            id: selectedAreaForEdit.id,
            name: selectedAreaForEdit.displayName || selectedAreaForEdit.name,
            shape: 'rectangle' as const,
            x: selectedAreaForEdit.x,
            y: selectedAreaForEdit.y,
            width: selectedAreaForEdit.width,
            height: selectedAreaForEdit.height,
            rotation: selectedAreaForEdit.rotation || 0,
            realWidth: selectedAreaForEdit.realWidth,
            realHeight: selectedAreaForEdit.realHeight
          }]}
          onSave={handleAreaEditorSave}
        />
      )}

      {/* Modal de confirmación para cambios en variantes */}
      {showVariantChangeModal && pendingChange && (
        <VariantChangeConfirmModal
          isOpen={showVariantChangeModal}
          onClose={() => {
            setShowVariantChangeModal(false)
            setPendingChange(null)
          }}
          onConfirm={handleVariantChangeConfirm}
          currentVariant={variants.find(v => v.id === pendingChange.variantId)!}
          allVariants={variants}
          changeType={pendingChange.type}
          changeDescription={pendingChange.description}
        />
      )}
    </div>
  )
}