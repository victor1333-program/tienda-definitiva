'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  ArrowLeft,
  Edit3,
  Trash2,
  Package,
  ShoppingCart,
  Calendar,
  Eye,
  EyeOff,
  ExternalLink,
  TrendingUp,
  AlertTriangle
} from "lucide-react"

interface Material {
  id: string
  name: string
  currentStock: number
  minimumStock: number
  movements: Array<{
    id: string
    type: string
    quantity: number
    createdAt: string
  }>
}

interface PurchaseOrder {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  createdAt: string
}

interface SupplierDetails {
  id: string
  name: string
  contactName?: string
  email?: string
  phone?: string
  address?: string
  website?: string
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  materials: Material[]
  purchaseOrders: PurchaseOrder[]
  _count: {
    materials: number
    purchaseOrders: number
  }
}

export default function SupplierDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [supplier, setSupplier] = useState<SupplierDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showMaterials, setShowMaterials] = useState(false)
  const [showPurchaseOrders, setShowPurchaseOrders] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadSupplier()
    }
  }, [params.id])

  const loadSupplier = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/suppliers/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setSupplier(data)
      } else {
        toast.error('Error al cargar el proveedor')
        router.push('/admin/suppliers')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar el proveedor')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSupplier = async () => {
    if (!supplier) return

    if (!confirm(`¿Estás seguro de que quieres eliminar el proveedor "${supplier.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/suppliers/${supplier.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Proveedor eliminado correctamente')
        router.push('/admin/suppliers')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar proveedor')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar proveedor')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando proveedor...</p>
        </div>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Proveedor no encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">
          El proveedor que buscas no existe o ha sido eliminado.
        </p>
        <Button className="mt-4" onClick={() => router.push('/admin/suppliers')}>
          Volver a Proveedores
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/suppliers')}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
              <Badge className={supplier.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {supplier.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">
              Información detallada del proveedor
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/suppliers/${supplier.id}/edit`)}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={deleteSupplier}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materiales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplier._count.materials}</div>
            <p className="text-xs text-muted-foreground">
              Materiales suministrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes de Compra</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplier._count.purchaseOrders}</div>
            <p className="text-xs text-muted-foreground">
              Total de órdenes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {supplier.materials.filter(m => m.currentStock <= m.minimumStock).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Materiales con stock bajo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividad</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {supplier.materials.reduce((sum, m) => sum + m.movements.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Movimientos recientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Información del Proveedor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {supplier.contactName && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Persona de Contacto</p>
                    <p className="text-sm text-gray-600">{supplier.contactName}</p>
                  </div>
                </div>
              )}
              
              {supplier.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <a 
                      href={`mailto:${supplier.email}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {supplier.email}
                    </a>
                  </div>
                </div>
              )}
              
              {supplier.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Teléfono</p>
                    <a 
                      href={`tel:${supplier.phone}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {supplier.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {supplier.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sitio Web</p>
                    <a 
                      href={supplier.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {supplier.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fechas</p>
                  <p className="text-sm text-gray-600">
                    Creado: {new Date(supplier.createdAt).toLocaleDateString('es-ES')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Actualizado: {new Date(supplier.updatedAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {supplier.address && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Dirección</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{supplier.address}</p>
                </div>
              </div>
            </div>
          )}

          {supplier.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Notas</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{supplier.notes}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Materials */}
      {supplier.materials.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Materiales ({supplier.materials.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMaterials(!showMaterials)}
              >
                {showMaterials ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Mostrar
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {showMaterials && (
            <CardContent>
              <div className="space-y-3">
                {supplier.materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{material.name}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>Stock: {material.currentStock}</span>
                        <span>Mínimo: {material.minimumStock}</span>
                        {material.currentStock <= material.minimumStock && (
                          <Badge className="bg-red-100 text-red-800">Stock Bajo</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {material.movements.length} movimientos
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Purchase Orders */}
      {supplier.purchaseOrders.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Órdenes de Compra Recientes ({supplier.purchaseOrders.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPurchaseOrders(!showPurchaseOrders)}
              >
                {showPurchaseOrders ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Mostrar
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {showPurchaseOrders && (
            <CardContent>
              <div className="space-y-3">
                {supplier.purchaseOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">#{order.orderNumber}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        €{order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}