"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, Image as ImageIcon, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface BrokenProduct {
  id: string
  name: string
  slug: string
  isActive: boolean
  totalImages: number
  brokenImages: number
  images: string[]
  editUrl: string
  createdAt: string
  updatedAt: string
}

export default function BrokenImagesPage() {
  const [products, setProducts] = useState<BrokenProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBrokenImages = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/products/broken-images')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar productos')
      }

      setProducts(data.products)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrokenImages()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Imágenes Rotas</h1>
          <p className="text-gray-600 mt-1">
            Productos con imágenes que necesitan ser re-subidas
          </p>
        </div>
        <Button
          onClick={fetchBrokenImages}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && products.length === 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            No hay productos con imágenes rotas. Todas las imágenes están correctamente alojadas en Cloudinary.
          </AlertDescription>
        </Alert>
      )}

      {!loading && products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Productos encontrados: {products.length}
            </CardTitle>
            <CardDescription>
              Estos productos tienen imágenes guardadas localmente que necesitan ser migradas a Cloudinary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.map((product) => (
                <Card key={product.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{product.name}</h3>
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Slug: <code className="text-xs bg-gray-100 px-1 rounded">{product.slug}</code></p>
                          <p>Total de imágenes: {product.totalImages}</p>
                          <p className="text-orange-600 font-medium">
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            Imágenes rotas: {product.brokenImages}
                          </p>
                        </div>

                        <div className="mt-3 space-y-1">
                          <p className="text-xs font-medium text-gray-700">Rutas de imágenes:</p>
                          {product.images.map((img, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <ImageIcon className="h-3 w-3 text-gray-400" />
                              <code className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                                {img}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="ml-4">
                        <Link href={product.editUrl}>
                          <Button size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Editar Producto
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Cómo corregir:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                  <li>Haz clic en "Editar Producto" para ir a la página de edición</li>
                  <li>Elimina las imágenes rotas usando el botón X</li>
                  <li>Sube nuevas imágenes (se guardarán automáticamente en Cloudinary)</li>
                  <li>Guarda el producto</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Buscando productos con imágenes rotas...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
