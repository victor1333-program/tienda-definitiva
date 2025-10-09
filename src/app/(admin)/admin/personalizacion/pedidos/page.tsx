"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Eye, Download, Calendar, Package, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface DesignElement {
  id: string
  type: string
  content: string
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

interface PersonalizationOrder {
  id: string
  orderNumber: string
  createdAt: string
  status: string
  orderItems: OrderItem[]
  user: {
    id: string
    name: string
    email: string
  }
}

export default function PedidosPersonalizacion() {
  const router = useRouter()
  const [orders, setOrders] = useState<PersonalizationOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredOrders, setFilteredOrders] = useState<PersonalizationOrder[]>([])

  useEffect(() => {
    fetchPersonalizationOrders()
  }, [])

  useEffect(() => {
    const filtered = orders.filter(order => 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredOrders(filtered)
  }, [orders, searchTerm])

  const fetchPersonalizationOrders = async () => {
    try {
      const response = await fetch('/api/personalization/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching personalization orders:', error)
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

  const getOrderPersonalizationPreview = (orderItems: OrderItem[]) => {
    const allSides = new Set<string>()
    const sideImages: { [key: string]: string } = {}
    
    orderItems.forEach(item => {
      item.designElements.forEach(element => {
        const sideName = element.printArea.side.name
        allSides.add(sideName)
        if (element.printArea.side.image2D && !sideImages[sideName]) {
          sideImages[sideName] = element.printArea.side.image2D
        }
      })
    })

    return Array.from(allSides).slice(0, 3).map(sideName => ({
      name: sideName,
      image: sideImages[sideName] || '/placeholder-product.png'
    }))
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Pedidos de Personalización</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pedidos de Personalización</h1>
          <p className="text-gray-600 mt-1">
            Gestiona y descarga archivos listos para imprimir
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por pedido, cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{filteredOrders.length}</p>
                <p className="text-sm text-gray-600">Total Pedidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredOrders.filter(order => order.status.toLowerCase() === 'pending').length}
                </p>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Download className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredOrders.filter(order => order.status.toLowerCase() === 'processing').length}
                </p>
                <p className="text-sm text-gray-600">Procesando</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredOrders.reduce((total, order) => 
                    total + order.orderItems.reduce((itemTotal, item) => 
                      itemTotal + item.designElements.length, 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Diseños</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos con Personalización</CardTitle>
          <CardDescription>
            Lista de todos los pedidos que contienen productos personalizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay pedidos de personalización
              </h3>
              <p className="text-gray-600">
                Los pedidos con productos personalizados aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      {/* Order Info */}
                      <div className="lg:col-span-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-gray-600">
                            {format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                          </p>
                          <p className="text-sm font-medium">{order.user.name}</p>
                        </div>
                      </div>

                      {/* Products Preview */}
                      <div className="lg:col-span-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Productos:</p>
                          <div className="space-y-2">
                            {order.orderItems.map((item) => (
                              <div key={item.id} className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                  <Image
                                    src={getProductImage(item.product)}
                                    alt={item.product.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{item.product.name}</p>
                                  <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Personalization Preview */}
                      <div className="lg:col-span-3">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Vista previa:</p>
                          <div className="flex gap-2">
                            {getOrderPersonalizationPreview(order.orderItems).map((preview, index) => (
                              <div key={index} className="relative">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                  <Image
                                    src={preview.image}
                                    alt={preview.name}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded">
                                  {preview.name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-2">
                        <div className="flex flex-col gap-2">
                          <Button asChild size="sm" className="w-full">
                            <Link href={`/admin/personalizacion/pedidos/${order.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Descargar Todo
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}