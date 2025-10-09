"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import useSWR, { mutate as globalMutate } from "swr"
import { 
  ArrowLeft, Save, Settings, Package, FileImage, 
  Cog, CheckCircle, AlertTriangle, Info, Tags, Palette
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import fetcher from "@/lib/fetcher"
import { toast } from "react-hot-toast"
import AdvancedVariantsManager from "@/components/admin/products/AdvancedVariantsManager"
import MediaManager from "@/components/admin/products/MediaManager"
import ProductionManager from "@/components/admin/products/ProductionManager"
import GeneralProductEditor from "@/components/admin/products/GeneralProductEditor"
import BrandStockManager from "@/components/admin/inventory/BrandStockManager"
import PersonalizationSummary from "@/components/admin/products/PersonalizationSummary"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const [activeTab, setActiveTab] = useState("general")
  const [currentProduct, setCurrentProduct] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [variantGroups, setVariantGroups] = useState([])
  const [variantCombinations, setVariantCombinations] = useState([])
  // Estados para controlar el guardado de variantes
  const [lastSaveTime, setLastSaveTime] = useState(0)
  const [pendingSave, setPendingSave] = useState(false)

  const { data: productData, error, mutate } = useSWR(
    productId ? `/api/products/${productId}` : null, 
    fetcher
  )

  const product = productData?.product || productData

  // Inicializar el producto actual cuando se carga
  useEffect(() => {
    if (product && !currentProduct) {
      setCurrentProduct(product)
    }
  }, [product, currentProduct])

  // Cargar variantes existentes cuando se carga el producto
  useEffect(() => {
    if (productId) {
      loadExistingVariants()
    }
  }, [productId])

  const loadExistingVariants = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/variants`)
      if (response.ok) {
        const data = await response.json()
        // Por ahora, los grupos y combinaciones estarán vacíos
        // En el futuro podrías reconstruirlos desde las variantes existentes
        setVariantGroups(data.groups || [])
        setVariantCombinations(data.combinations || [])
      }
    } catch (error) {
      console.error('Error loading existing variants:', error)
    }
  }

  // Render condicional después de todos los hooks
  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar el producto</h1>
          <p className="text-gray-600 mb-4">No se pudo encontrar el producto solicitado.</p>
          <Button asChild>
            <Link href="/admin/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Productos
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!productData) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Función para limpiar datos antes de enviar
  const cleanProductData = (productData) => {
    // Procesar categorías correctamente
    let processedCategories = []
    if (productData.categories && Array.isArray(productData.categories)) {
      // Si las categorías son objetos completos, extraer solo los IDs
      processedCategories = productData.categories.map(cat => {
        if (typeof cat === 'string') {
          return cat // Ya es un ID
        } else if (cat && cat.categoryId) {
          return cat.categoryId // Es un objeto ProductCategory
        } else if (cat && cat.id) {
          return cat.id // Es un objeto Category
        }
        return null
      }).filter(Boolean)
    }
    
    console.log('🧹 Procesando categorías:', {
      original: productData.categories,
      processed: processedCategories
    })
    
    // Crear una copia limpia solo con los campos necesarios
    const cleanData = {
      id: productData.id,
      name: productData.name,
      sku: productData.sku,
      slug: productData.slug,
      description: productData.description,
      basePrice: productData.basePrice,
      comparePrice: productData.comparePrice,
      costPrice: productData.costPrice,
      materialType: productData.materialType,
      isActive: productData.isActive,
      featured: productData.featured,
      topSelling: productData.topSelling,
      metaTitle: productData.metaTitle,
      metaDescription: productData.metaDescription,
      // Campos de stock
      stock: productData.stock,
      minStock: productData.minStock,
      trackInventory: productData.trackInventory,
      // Categorías procesadas como array de IDs
      categories: processedCategories.length > 0 ? processedCategories : undefined
    }
    
    // Remover valores undefined para evitar problemas
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === undefined) {
        delete cleanData[key]
      }
    })
    
    return cleanData
  }

  // Calcular stock principal basado en variantes
  const calculateMainStock = () => {
    if (product?.variants && product.variants.length > 0) {
      // Si hay variantes, sumar el stock de todas
      const totalVariantStock = product.variants.reduce((total, variant) => {
        return total + (variant.stock || 0)
      }, 0)
      console.log('📊 Calculando stock de variantes:', {
        variants: product.variants.map(v => ({ id: v.id, stock: v.stock })),
        total: totalVariantStock
      })
      return totalVariantStock
    } else {
      // Si no hay variantes, usar el stock manual
      return currentProduct?.stock || 0
    }
  }

  // Función unificada para guardar toda la configuración del producto
  const handleSaveAllConfiguration = async () => {
    if (!currentProduct) {
      toast.error('No hay datos del producto para guardar')
      return
    }

    setIsSaving(true)
    try {
      // Calcular el stock principal correcto
      const calculatedStock = calculateMainStock()
      
      // Combinar datos del producto actual con cualquier cambio pendiente
      const mergedProductData = {
        ...product, // Datos originales frescos del SWR
        ...currentProduct, // Cambios locales (incluyendo stock, etc)
        // Asegurar que los campos críticos no se pierdan
        id: productId,
        featured: currentProduct.featured ?? product.featured ?? false,
        topSelling: currentProduct.topSelling ?? product.topSelling ?? false,
        isActive: currentProduct.isActive ?? product.isActive ?? true,
        // Stock calculado automáticamente
        stock: calculatedStock
      }
      
      console.log('💾 Guardando configuración completa:', mergedProductData)
      
      // Limpiar los datos antes de enviar
      const productData = cleanProductData(mergedProductData)
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        toast.success('Configuración guardada exitosamente')
        // Actualizar los datos en SWR
        mutate()
        // Invalidar caché de productos con delay
        setTimeout(() => {
          globalMutate('/api/products')
        }, 1000)
        // Actualizar estado local con los datos guardados
        setCurrentProduct(mergedProductData)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al guardar la configuración')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  // Función para manejar cambios en el producto
  const handleProductChange = (updatedProduct) => {
    // Verificar si es un evento o un producto
    if (updatedProduct && typeof updatedProduct === 'object' && updatedProduct.target) {
      console.log('⚠️ Se recibió un evento en lugar de producto:', updatedProduct)
      return
    }
    console.log('Producto actualizado:', updatedProduct)
    setCurrentProduct(updatedProduct)
  }

  // Función para manejar cambios en las variantes (sin auto-guardado)
  const handleVariantsChange = (groups, combinations) => {
    console.log('🎯 handleVariantsChange called with:', { groups: groups.length, combinations: combinations.length })
    
    // Solo marcar como pendiente si realmente hay cambios
    const hasChanges = 
      JSON.stringify(groups) !== JSON.stringify(variantGroups) ||
      JSON.stringify(combinations) !== JSON.stringify(variantCombinations)
    
    setVariantGroups(groups)
    setVariantCombinations(combinations)
    
    // Solo marcar como pendiente si hay cambios reales y no estamos guardando
    if (hasChanges && !isSaving) {
      console.log('🎯 Marking as pending - real changes detected')
      setPendingSave(true)
    } else {
      console.log('🎯 No real changes or currently saving - not marking as pending')
    }
  }
  
  // Función para guardar variantes manualmente
  const handleSaveVariants = async () => {
    console.log('🎯 handleSaveVariants called')
    console.log('🎯 Current state:', {
      variantCombinations: variantCombinations.length,
      variantGroups: variantGroups.length,
      productId
    })
    
    // Permitir guardar grupos incluso sin combinaciones
    if (variantGroups.length === 0) {
      console.log('🎯 No groups to save')
      toast.error('No hay grupos de variantes para guardar')
      return
    }
    
    // Evitar guardados duplicados muy rápidos
    const now = Date.now()
    if (now - lastSaveTime < 2000) {
      console.log('🎯 Skipping save - too frequent')
      return
    }
    
    setIsSaving(true)
    
    try {
      console.log('🎯 Preparing to send POST request...')
      console.log('🎯 Groups to send:', JSON.stringify(variantGroups, null, 2))
      console.log('🎯 Combinations to send:', JSON.stringify(variantCombinations, null, 2))
      
      const response = await fetch(`/api/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groups: variantGroups,
          combinations: variantCombinations
        })
      })
      
      console.log('🎯 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🎯 Variants saved successfully:', data)
        
        // Mensaje adaptativo según si hay combinaciones o solo grupos
        const successMessage = data.variantsCreated > 0 
          ? `Variantes guardadas: ${data.variantsCreated} combinaciones creadas`
          : `Configuración guardada: ${data.groupsSaved} grupos guardados`
        
        toast.success(successMessage)
        setLastSaveTime(now)
        setPendingSave(false) // Solo marcar como guardado si fue exitoso
        
        // Asegurar que se mantenga como guardado después de posibles re-renders
        setTimeout(() => {
          setPendingSave(false)
        }, 100)
        
        // Actualizar datos del producto para refrescar las variantes en otras partes
        mutate()
      } else {
        const errorData = await response.json()
        console.log('🎯 Error response:', errorData)
        toast.error(`Error al guardar variantes: ${errorData.error || 'Error desconocido'}`)
        // No cambiar pendingSave si falla - mantener true
      }
    } catch (error) {
      console.error('🎯 Error saving variants:', error)
      toast.error('Error al guardar variantes')
      // No cambiar pendingSave si falla - mantener true
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">✏️ Configurar Producto</h1>
            <p className="text-gray-600 mt-1">
              Configura las características avanzadas de "{product.name}"
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={product.isActive ? "default" : "secondary"}>
            {product.isActive ? "Activo" : "Inactivo"}
          </Badge>
          <span className="text-sm text-gray-500">ID: {product.id}</span>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">✅ Producto Base Completado</h4>
              <p className="text-sm text-blue-700">
                Ahora puedes configurar las características avanzadas usando las pestañas de abajo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="personalization" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Personalización
          </TabsTrigger>
          <TabsTrigger value="variants" className="flex items-center gap-2">
            <Cog className="w-4 h-4" />
            Variantes
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <FileImage className="w-4 h-4" />
            Multimedia
          </TabsTrigger>
          <TabsTrigger value="production" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Producción
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>📦 Información General del Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <GeneralProductEditor 
                product={currentProduct || product}
                onProductChange={handleProductChange}
                calculateMainStock={calculateMainStock}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personalization Tab */}
        <TabsContent value="personalization">
          <PersonalizationSummary 
            productId={productId}
            productName={product.name}
          />
        </TabsContent>

        {/* Variants Tab */}
        <TabsContent value="variants">
          <Card>
            <CardHeader>
              <CardTitle>📏 Sistema Avanzado de Variantes</CardTitle>
            </CardHeader>
            <CardContent>
              <AdvancedVariantsManager
                productId={productId}
                initialGroups={variantGroups}
                initialCombinations={variantCombinations}
                basePrice={product.basePrice}
                onVariantsChange={handleVariantsChange}
                onSaveVariants={handleSaveVariants}
                isSaving={isSaving}
                hasUnsavedChanges={pendingSave}
              />
            </CardContent>
          </Card>
        </TabsContent>


        {/* Media Tab */}
        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>🖼️ Gestión de Multimedia</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaManager
                productId={productId}
                media={(() => {
                  try {
                    const images = JSON.parse(product.images || '[]')
                    return images.map((url: string, index: number) => ({
                      url,
                      type: 'image' as const,
                      name: `Imagen ${index + 1}`,
                      order: index
                    }))
                  } catch {
                    return []
                  }
                })()}
                onMediaChange={async (media) => {
                  try {
                    toast.loading('Guardando cambios de medios...')
                    
                    // Separar los medios por tipo
                    const images = media.filter(m => m.type === 'image').map(m => m.url)
                    const videos = media.filter(m => m.type === 'video').map(m => m.url)
                    const documents = media.filter(m => m.type === 'document').map(m => m.url)
                    
                    const response = await fetch(`/api/products/${productId}`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ 
                        images: JSON.stringify(images),
                        videos: JSON.stringify(videos),
                        documents: JSON.stringify(documents)
                      })
                    })

                    if (response.ok) {
                      toast.success('Medios actualizados exitosamente')
                      // Actualizar el estado local con SWR
                      mutate()
                    } else {
                      const result = await response.json()
                      console.error('Error del servidor:', result)
                      toast.error(result.error || 'Error guardando medios')
                    }
                  } catch (error) {
                    console.error('Error saving media:', error)
                    toast.error('Error guardando medios')
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Production Tab */}
        <TabsContent value="production">
          <Card>
            <CardHeader>
              <CardTitle>🛠️ Procesos de Producción</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductionManager
                productId={productId}
                productionSteps={product?.workshopProcesses || []}
                onStepsChange={async (steps) => {
                  try {
                    toast.loading('Guardando pasos de producción...')
                    
                    const response = await fetch(`/api/products/${productId}/production-steps`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ steps })
                    })

                    const result = await response.json()
                    
                    if (result.success) {
                      toast.success('Pasos de producción guardados exitosamente')
                      // Actualizar el estado local
                      if (setProduct && product) {
                        setProduct({
                          ...product,
                          workshopProcesses: result.steps
                        })
                      }
                    } else {
                      toast.error(result.error || 'Error guardando pasos de producción')
                    }
                  } catch (error) {
                    console.error('Error saving production steps:', error)
                    toast.error('Error guardando pasos de producción')
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/products">
            Volver a Productos
          </Link>
        </Button>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleSaveAllConfiguration}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </div>
  )
}