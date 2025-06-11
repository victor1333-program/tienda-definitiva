"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import { 
  ArrowLeft, Save, Settings, Package, FileImage, 
  Palette, Cog, CheckCircle, AlertTriangle, Info
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Badge } from "@/components/ui/Badge"
import fetcher from "@/lib/fetcher"
import { toast } from "react-hot-toast"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const [activeTab, setActiveTab] = useState("general")

  const { data: productData, error } = useSWR(
    productId ? `/api/products/${productId}` : null, 
    fetcher
  )

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

  const product = productData.product || productData

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
        <TabsList className="grid w-full grid-cols-4">
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
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>📦 Información General del Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Información Básica</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nombre:</strong> {product.name}</div>
                    <div><strong>SKU:</strong> {product.sku}</div>
                    <div><strong>Slug:</strong> {product.slug}</div>
                    <div><strong>Descripción:</strong> {product.description || 'Sin descripción'}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Precios</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Precio Base:</strong> €{product.basePrice}</div>
                    {product.comparePrice && (
                      <div><strong>Precio de Comparación:</strong> €{product.comparePrice}</div>
                    )}
                    {product.costPrice && (
                      <div><strong>Precio de Coste:</strong> €{product.costPrice}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-1">🚧 En Desarrollo</h4>
                    <p className="text-sm text-yellow-700">
                      La edición de información general estará disponible próximamente. 
                      Usa las otras pestañas para configurar personalización, variantes y multimedia.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personalization Tab */}
        <TabsContent value="personalization">
          <Card>
            <CardHeader>
              <CardTitle>🎨 Configuración de Personalización</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <Palette className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-blue-900 mb-2">Editor de Personalización</h3>
                <p className="text-blue-700 mb-4">
                  Configura las áreas personalizables del producto, templates y opciones de diseño.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-700">
                    🚧 Esta funcionalidad estará disponible en la próxima fase de desarrollo.
                  </p>
                </div>
                <p className="text-sm text-blue-600">
                  Incluirá: Editor visual, áreas de personalización, templates predefinidos, 
                  configuración de precios por personalización.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variants Tab */}
        <TabsContent value="variants">
          <Card>
            <CardHeader>
              <CardTitle>📏 Gestión de Variantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <Cog className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-green-900 mb-2">Variantes del Producto</h3>
                <p className="text-green-700 mb-4">
                  Gestiona tallas, colores, materiales específicos y precios por variante.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-700">
                    🚧 Esta funcionalidad estará disponible en la próxima fase de desarrollo.
                  </p>
                </div>
                <p className="text-sm text-green-600">
                  Incluirá: Gestión de tallas, selector de colores, control de stock por variante, 
                  precios diferenciados.
                </p>
              </div>
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
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Archivos Actuales</h3>
                  {product.images && JSON.parse(product.images).length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {JSON.parse(product.images).map((url: string, index: number) => (
                        <div key={index} className="border rounded-lg p-2">
                          <img 
                            src={url} 
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <p className="text-xs text-gray-500 mt-1">Imagen {index + 1}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No hay imágenes subidas</p>
                  )}
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                  <FileImage className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-purple-900 mb-2">Editor de Multimedia</h3>
                  <p className="text-purple-700 mb-4">
                    Gestiona imágenes, videos, documentos y orden de visualización.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-700">
                      🚧 El editor avanzado estará disponible en la próxima fase de desarrollo.
                    </p>
                  </div>
                  <p className="text-sm text-purple-600">
                    Incluirá: Reordenamiento drag & drop, edición de imágenes, galerías, 
                    videos interactivos.
                  </p>
                </div>
              </div>
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
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Guardar Configuración
        </Button>
      </div>
    </div>
  )
}