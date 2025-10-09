"use client"

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Package, ShoppingCart, MapPin, Phone, Mail, Edit2, LogOut } from 'lucide-react'

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  items: any[]
}

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  })
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user) {
      fetchProfile()
      fetchOrders()
    }
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const profileData = await response.json()
        setProfile(profileData)
        setFormData({
          name: profileData.name || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          city: profileData.city || '',
          postalCode: profileData.postalCode || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/user')
      if (response.ok) {
        const ordersData = await response.json()
        setOrders(ordersData)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      'PENDING': { variant: 'secondary', label: 'Pendiente' },
      'PROCESSING': { variant: 'default', label: 'Procesando' },
      'SHIPPED': { variant: 'outline', label: 'Enviado' },
      'DELIVERED': { variant: 'default', label: 'Entregado' },
      'CANCELLED': { variant: 'destructive', label: 'Cancelado' }
    }
    
    const statusInfo = statusMap[status] || { variant: 'secondary', label: status }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando perfil...</p>
      </div>
    )
  }

  if (!session?.user || !profile) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-600">No se pudo cargar el perfil</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600 mt-1">Gestiona tu información personal y pedidos</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => signOut()}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Personal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary" />
                    <CardTitle>Información Personal</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {isEditing ? 'Cancelar' : 'Editar'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <Input
                      label="Nombre completo"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      label="Email"
                      value={profile.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <Input
                      label="Teléfono"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="612 345 678"
                    />
                    <Input
                      label="Dirección"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Calle, número, piso..."
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Ciudad"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Tu ciudad"
                      />
                      <Input
                        label="Código Postal"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="02440"
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Nombre</label>
                          <p className="text-lg font-medium">{profile.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </label>
                          <p className="text-lg">{profile.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Teléfono
                          </label>
                          <p className="text-lg">{profile.phone || 'No especificado'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Dirección
                          </label>
                          <p className="text-lg">{profile.address || 'No especificada'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Ciudad</label>
                            <p className="text-lg">{profile.city || 'No especificada'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Código Postal</label>
                            <p className="text-lg">{profile.postalCode || 'No especificado'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Resumen de Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{orders.length}</div>
                  <div className="text-sm text-gray-600">Pedidos Realizados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary">
                    {formatPrice(orders.reduce((total, order) => total + order.total, 0))}
                  </div>
                  <div className="text-sm text-gray-600">Total Gastado</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">
                    Cliente desde {formatDate(profile.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <a href="/productos">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Explorar Productos
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <a href="/contacto">
                      Contactar Soporte
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Historial de Pedidos */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Historial de Pedidos
              </CardTitle>
              <CardDescription>
                Revisa el estado de tus pedidos y su historial
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes pedidos aún</h3>
                  <p className="text-gray-600 mb-6">¡Explora nuestros productos y haz tu primer pedido!</p>
                  <Button asChild>
                    <a href="/productos">Ver Productos</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">Pedido #{order.id}</h3>
                          <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(order.status)}
                          <p className="text-lg font-bold text-primary mt-1">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                        >
                          <a href={`/perfil/pedidos/${order.id}`}>
                            Ver Detalles
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}