'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import {
  Building2,
  Search,
  Plus,
  Edit3,
  Eye,
  Phone,
  Mail,
  Globe,
  MapPin,
  Package,
  ShoppingCart,
  Filter,
  RefreshCw,
  Trash2
} from "lucide-react"

interface Supplier {
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
  materials?: Array<{
    id: string
    name: string
    currentStock: number
    minimumStock: number
  }>
  _count: {
    materials: number
    purchaseOrders: number
  }
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showActiveOnly, setShowActiveOnly] = useState(true)

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/suppliers')
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data)
      } else {
        toast.error('Error al cargar proveedores')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar proveedores')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter suppliers based on search and active filter
  useEffect(() => {
    let filtered = suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (supplier.contactName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesActiveFilter = showActiveOnly ? supplier.isActive : true
      
      return matchesSearch && matchesActiveFilter
    })
    
    setFilteredSuppliers(filtered)
  }, [suppliers, searchTerm, showActiveOnly])

  const deleteSupplier = async (supplierId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      return
    }

    try {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Proveedor eliminado correctamente')
        loadSuppliers()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar proveedor')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar proveedor')
    }
  }

  const stats = {
    total: suppliers.length,
    active: suppliers.filter(s => s.isActive).length,
    inactive: suppliers.filter(s => !s.isActive).length,
    totalMaterials: suppliers.reduce((sum, s) => sum + s._count.materials, 0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando proveedores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🏢 Gestión de Proveedores</h1>
          <p className="text-gray-600 mt-1">
            Administra tus proveedores y optimiza las relaciones comerciales
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadSuppliers}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => window.open('/admin/suppliers/new', '_blank')}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proveedor
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proveedores</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Proveedores registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proveedores Activos</CardTitle>
            <Badge className="bg-green-100 text-green-800">{stats.active}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              En colaboración activa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materiales Totales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMaterials}</div>
            <p className="text-xs text-muted-foreground">
              Materiales suministrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Totales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers.reduce((sum, s) => sum + s._count.purchaseOrders, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Órdenes de compra
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, contacto o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={showActiveOnly ? "default" : "outline"}
                onClick={() => setShowActiveOnly(!showActiveOnly)}
                size="sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                Solo activos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Proveedores</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay proveedores</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No se encontraron proveedores con ese término de búsqueda' : 'Comienza agregando tu primer proveedor'}
              </p>
              <Button className="mt-4" onClick={() => window.open('/admin/suppliers/new', '_blank')}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Proveedor
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                        <Badge className={supplier.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {supplier.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      {supplier.contactName && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{supplier.contactName}</span>
                        </div>
                      )}
                      
                      {supplier.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{supplier.email}</span>
                        </div>
                      )}
                      
                      {supplier.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{supplier.phone}</span>
                        </div>
                      )}
                      
                      {supplier.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <a 
                            href={supplier.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Sitio web
                          </a>
                        </div>
                      )}
                    </div>

                    {supplier.address && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{supplier.address}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>{supplier._count.materials} materiales</span>
                      <span>{supplier._count.purchaseOrders} órdenes de compra</span>
                      <span>Creado: {new Date(supplier.createdAt).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/admin/suppliers/${supplier.id}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/admin/suppliers/${supplier.id}/edit`, '_blank')}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSupplier(supplier.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}