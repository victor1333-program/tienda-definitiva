"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Eye, FileText, Image as ImageIcon, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "react-hot-toast"

interface DesignElement {
  id: string
  type: string
  content: string
  positioning: any
  styling: any
  printArea: {
    id: string
    name: string
    side: {
      id: string
      name: string
      image2D?: string
    }
  }
}

interface OrderItem {
  id: string
  quantity: number
  designElements: DesignElement[]
  product: {
    id: string
    name: string
    sku: string
    images?: string
  }
  variant?: {
    id: string
    name: string
  }
}

interface OrderDetails {
  id: string
  orderNumber: string
  createdAt: string
  status: string
  totalAmount: number
  orderItems: OrderItem[]
  user: {
    id: string
    name: string
    email: string
  }
}

export default function DetallesPedidoPersonalizacion() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingFiles, setDownloadingFiles] = useState<string[]>([])

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/personalization/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      } else {
        toast.error('Error al cargar los detalles del pedido')
        router.push('/admin/personalizacion/pedidos')
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      toast.error('Error al cargar los detalles del pedido')
    } finally {
      setLoading(false)
    }
  }

  const getProductImage = (product: any) => {
    try {
      if (product.images) {
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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Procesando</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completado</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCustomizedSides = (orderItems: OrderItem[]) => {
    const sidesMap = new Map<string, { side: any, elements: DesignElement[] }>()
    
    orderItems.forEach(item => {
      item.designElements.forEach(element => {
        const sideId = element.printArea.side.id
        const sideName = element.printArea.side.name
        
        if (!sidesMap.has(sideId)) {
          sidesMap.set(sideId, {
            side: element.printArea.side,
            elements: []
          })
        }
        sidesMap.get(sideId)!.elements.push(element)
      })
    })
    
    return Array.from(sidesMap.values())
  }

  const downloadFile = async (format: string, sideId: string, sideName: string) => {
    const downloadKey = `${sideId}_${format}`
    setDownloadingFiles(prev => [...prev, downloadKey])
    
    try {
      // Aquí iría la lógica real de descarga
      const response = await fetch(`/api/personalization/orders/${orderId}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          sideId,
          sideName
        })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${order?.orderNumber}_${sideName}_${format.toLowerCase()}.${format.toLowerCase()}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success(`Archivo ${format} descargado`)
      } else {
        toast.error('Error al descargar el archivo')
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      toast.error('Error al descargar el archivo')
    } finally {
      setDownloadingFiles(prev => prev.filter(key => key !== downloadKey))
    }
  }

  const downloadZip = async (sideId: string, sideName: string) => {
    const downloadKey = `${sideId}_zip`
    setDownloadingFiles(prev => [...prev, downloadKey])
    
    try {
      const response = await fetch(`/api/personalization/orders/${orderId}/download-zip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sideId,
          sideName
        })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${order?.orderNumber}_${sideName}_completo.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success(`Archivo ZIP descargado`)
      } else {
        toast.error('Error al descargar el archivo ZIP')
      }
    } catch (error) {
      console.error('Error downloading ZIP:', error)
      toast.error('Error al descargar el archivo ZIP')
    } finally {
      setDownloadingFiles(prev => prev.filter(key => key !== downloadKey))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/personalizacion/pedidos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Cargando detalles...</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/personalizacion/pedidos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Pedido no encontrado</h1>
        </div>
      </div>
    )
  }

  const customizedSides = getCustomizedSides(order.orderItems)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/personalizacion/pedidos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Detalle del pedido</h1>
          <p className="text-gray-600 mt-1">#{order.orderNumber}</p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>#{order.orderNumber}</CardTitle>
          <CardDescription>
            {format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {order.orderItems.map((item, index) => (
              <div key={item.id} className="space-y-2">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={getProductImage(item.product)}
                    alt={item.product.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">SKU del producto</p>
                  <p className="text-sm font-mono">{item.product.sku}</p>
                  <p className="text-sm text-gray-600">Cantidad</p>
                  <p className="text-sm font-semibold">{item.quantity}</p>
                  <p className="text-sm text-gray-600">Design Doc ID</p>
                  <p className="text-sm font-mono">000-4aC2stdvs0Wg1K6NvfHOhA</p>
                  <p className="text-sm text-gray-600">ID de diseño</p>
                  <p className="text-sm font-mono">100492033</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-2">Laterales personalizados</h4>
            <div className="flex flex-wrap gap-2">
              {customizedSides.map((sideData) => (
                <Badge key={sideData.side.id} variant="outline">
                  {sideData.side.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalization Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Vista previa personalización:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customizedSides.map((sideData) => (
              <div key={sideData.side.id} className="text-center">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 relative">
                  <Image
                    src={sideData.side.image2D || '/placeholder-product.png'}
                    alt={sideData.side.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                  {/* Aquí iría el overlay de la personalización */}
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <div className="text-white text-sm font-medium">
                      {sideData.elements.length} elemento(s)
                    </div>
                  </div>
                </div>
                <p className="font-medium">{sideData.side.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Download Section */}
      <Card>
        <CardHeader>
          <CardTitle>Descargue archivos individuales o un archivo ZIP que contenga todos los formatos disponibles y el resumen del pedido.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {customizedSides.map((sideData) => (
            <div key={sideData.side.id} className="border rounded-lg p-4">
              <h4 className="font-semibold mb-4">Lado {sideData.side.name}</h4>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {['SVG', 'PNG', 'PDF', 'DXF', 'DXF HQ'].map((format) => (
                  <Button
                    key={format}
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFile(format, sideData.side.id, sideData.side.name)}
                    disabled={downloadingFiles.includes(`${sideData.side.id}_${format}`)}
                  >
                    {downloadingFiles.includes(`${sideData.side.id}_${format}`) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {format}
                  </Button>
                ))}
              </div>
              
              <Button
                onClick={() => downloadZip(sideData.side.id, sideData.side.name)}
                disabled={downloadingFiles.includes(`${sideData.side.id}_zip`)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {downloadingFiles.includes(`${sideData.side.id}_zip`) ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                ) : (
                  <Package className="h-4 w-4 mr-2" />
                )}
                Archivo zip
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}