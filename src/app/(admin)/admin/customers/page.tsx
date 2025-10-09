"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { 
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  ShoppingBag,
  Star,
  TrendingUp,
  Eye,
  Edit,
  RefreshCw,
  Award,
  Target,
  MessageSquare,
  AlertCircle,
  Activity,
  DollarSign
} from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  createdAt: string
  updatedAt: string
  addresses?: Array<{
    id: string
    street: string
    city: string
    postalCode: string
    country: string
    isDefault: boolean
  }>
  orders?: Array<{
    id: string
    orderNumber: string
    status: string
    totalAmount: number
    createdAt: string
  }>
  _count?: {
    orders: number
    addresses: number
  }
  // CRM Analytics fields
  totalSpent?: number
  averageOrderValue?: number
  lastOrderDate?: string
  customerLifetimeValue?: number
  loyaltyPoints?: number
  segment?: 'VIP' | 'FREQUENT' | 'REGULAR' | 'NEW' | 'INACTIVE'
  riskScore?: number
  satisfaction?: number
  acquisitionChannel?: string
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSegment, setSelectedSegment] = useState('all')
  const [activeTab, setActiveTab] = useState('customers')
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    active: 0,
    vip: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    retentionRate: 0,
    churnRate: 0
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        console.log('👥 Customers data received:', data)
        
        // Process customers with CRM analytics
        const customersArray = Array.isArray(data) ? data : (data.customers || [])
        const processedCustomers = customersArray.map((customer: any) => ({
          ...customer,
          totalSpent: customer.orders?.reduce((sum: number, order: any) => 
            sum + (order.status === 'DELIVERED' ? order.totalAmount : 0), 0) || 0,
          averageOrderValue: customer.orders?.length > 0 ? 
            (customer.orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0) / customer.orders.length) : 0,
          lastOrderDate: customer.orders?.[0]?.createdAt,
          customerLifetimeValue: calculateCLV(customer),
          segment: determineSegment(customer),
          riskScore: calculateRiskScore(customer),
          satisfaction: Math.floor(Math.random() * 5) + 1, // Mock data
          acquisitionChannel: ['Organic', 'Social Media', 'Email', 'Referral'][Math.floor(Math.random() * 4)]
        }))

        setCustomers(processedCustomers)
        calculateStats(processedCustomers)
      } else {
        toast.error('Error al cargar clientes')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar clientes')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateCLV = (customer: any) => {
    const totalSpent = customer.orders?.reduce((sum: number, order: any) => 
      sum + (order.status === 'DELIVERED' ? order.totalAmount : 0), 0) || 0
    const orderFrequency = customer.orders?.length || 0
    const customerAge = new Date().getTime() - new Date(customer.createdAt).getTime()
    const monthsActive = Math.max(1, customerAge / (1000 * 60 * 60 * 24 * 30))
    
    if (orderFrequency === 0) return 0
    
    const monthlyValue = totalSpent / monthsActive
    const predictedLifespan = 24 // 2 years average
    
    return monthlyValue * predictedLifespan
  }

  const determineSegment = (customer: any): Customer['segment'] => {
    const totalSpent = customer.orders?.reduce((sum: number, order: any) => 
      sum + (order.status === 'DELIVERED' ? order.totalAmount : 0), 0) || 0
    const orderCount = customer.orders?.length || 0
    const daysSinceLastOrder = customer.orders?.[0] ? 
      (new Date().getTime() - new Date(customer.orders[0].createdAt).getTime()) / (1000 * 60 * 60 * 24) : 999

    if (totalSpent > 1000 && orderCount > 5) return 'VIP'
    if (orderCount > 3 && daysSinceLastOrder < 60) return 'FREQUENT'
    if (orderCount > 0 && daysSinceLastOrder < 180) return 'REGULAR'
    if (orderCount === 0 || daysSinceLastOrder < 30) return 'NEW'
    return 'INACTIVE'
  }

  const calculateRiskScore = (customer: any) => {
    const daysSinceLastOrder = customer.orders?.[0] ? 
      (new Date().getTime() - new Date(customer.orders[0].createdAt).getTime()) / (1000 * 60 * 60 * 24) : 999
    
    if (daysSinceLastOrder > 365) return 90
    if (daysSinceLastOrder > 180) return 70
    if (daysSinceLastOrder > 90) return 50
    if (daysSinceLastOrder > 30) return 30
    return 10
  }

  const calculateStats = (customers: Customer[]) => {
    const total = customers.length
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const newCustomers = customers.filter(c => new Date(c.createdAt) > thirtyDaysAgo).length
    const activeCustomers = customers.filter(c => c.segment !== 'INACTIVE').length
    const vipCustomers = customers.filter(c => c.segment === 'VIP').length
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
    const avgOrderValue = customers.length > 0 ? 
      customers.reduce((sum, c) => sum + (c.averageOrderValue || 0), 0) / customers.length : 0

    setStats({
      total,
      new: newCustomers,
      active: activeCustomers,
      vip: vipCustomers,
      totalRevenue,
      averageOrderValue: avgOrderValue,
      retentionRate: total > 0 ? (activeCustomers / total) * 100 : 0,
      churnRate: total > 0 ? ((total - activeCustomers) / total) * 100 : 0
    })
  }

  // Filter customers
  useEffect(() => {
    let filtered = customers
    
    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    if (selectedSegment !== 'all') {
      filtered = filtered.filter(customer => customer.segment === selectedSegment)
    }
    
    setFilteredCustomers(filtered)
  }, [customers, searchTerm, selectedSegment])

  const getSegmentColor = (segment?: string) => {
    switch (segment) {
      case 'VIP': return 'bg-purple-100 text-purple-800'
      case 'FREQUENT': return 'bg-blue-100 text-blue-800'
      case 'REGULAR': return 'bg-green-100 text-green-800'
      case 'NEW': return 'bg-yellow-100 text-yellow-800'
      case 'INACTIVE': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800'
    if (score > 70) return 'bg-red-100 text-red-800'
    if (score > 40) return 'bg-orange-100 text-orange-800'
    return 'bg-green-100 text-green-800'
  }

  // Prepare chart data
  const segmentData = [
    { label: 'VIP', value: customers.filter(c => c.segment === 'VIP').length, color: '#8b5cf6' },
    { label: 'Frecuentes', value: customers.filter(c => c.segment === 'FREQUENT').length, color: '#3b82f6' },
    { label: 'Regulares', value: customers.filter(c => c.segment === 'REGULAR').length, color: '#10b981' },
    { label: 'Nuevos', value: customers.filter(c => c.segment === 'NEW').length, color: '#f59e0b' },
    { label: 'Inactivos', value: customers.filter(c => c.segment === 'INACTIVE').length, color: '#6b7280' }
  ].filter(item => item.value > 0)

  const channelData = [
    { label: 'Orgánico', value: customers.filter(c => c.acquisitionChannel === 'Organic').length, color: '#10b981' },
    { label: 'Redes Sociales', value: customers.filter(c => c.acquisitionChannel === 'Social Media').length, color: '#3b82f6' },
    { label: 'Email', value: customers.filter(c => c.acquisitionChannel === 'Email').length, color: '#8b5cf6' },
    { label: 'Referidos', value: customers.filter(c => c.acquisitionChannel === 'Referral').length, color: '#f59e0b' }
  ].filter(item => item.value > 0)

  const clvData = customers
    .sort((a, b) => (b.customerLifetimeValue || 0) - (a.customerLifetimeValue || 0))
    .slice(0, 10)
    .map(c => ({
      label: c.name.substring(0, 15) + '...',
      value: c.customerLifetimeValue || 0,
      color: c.segment === 'VIP' ? '#8b5cf6' : '#3b82f6'
    }))

  const tabs = [
    { id: 'customers', label: 'Clientes', icon: <Users className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'segments', label: 'Segmentos', icon: <Target className="w-4 h-4" /> }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando CRM avanzado...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👥 CRM Avanzado</h1>
          <p className="text-gray-600 mt-1">
            Gestión inteligente de relaciones con clientes y análisis predictivo
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadCustomers}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => router.push('/admin/customers/new')}>
            <UserPlus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>


      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <>
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Ingresos Totales</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-gray-900">
                  €{stats.totalRevenue.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Valor total de clientes
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Clientes Activos</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {stats.retentionRate.toFixed(1)}% tasa de retención
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Clientes VIP</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-purple-600">{stats.vip}</div>
                <p className="text-xs text-gray-600 mt-1">
                  Clientes de alto valor
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Ticket Promedio</CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingBag className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-orange-600">
                  €{stats.averageOrderValue.toFixed(0)}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Valor promedio por pedido
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
                      placeholder="Buscar por nombre, email o teléfono..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedSegment}
                    onChange={(e) => setSelectedSegment(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">Todos los segmentos</option>
                    <option value="VIP">VIP</option>
                    <option value="FREQUENT">Frecuentes</option>
                    <option value="REGULAR">Regulares</option>
                    <option value="NEW">Nuevos</option>
                    <option value="INACTIVE">Inactivos</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customers List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clientes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'No se encontraron clientes con ese término de búsqueda' : 'Comienza agregando clientes a tu base de datos'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{customer.name}</h3>
                          <Badge className={getSegmentColor(customer.segment)}>
                            {customer.segment}
                          </Badge>
                          {customer.riskScore && customer.riskScore > 70 && (
                            <Badge className={getRiskColor(customer.riskScore)}>
                              Riesgo: {customer.riskScore}%
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{customer.email}</span>
                          </div>
                          
                          {customer.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <ShoppingBag className="w-4 h-4" />
                            <span>{customer._count?.orders || 0} pedidos</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>€{(customer.totalSpent || 0).toFixed(0)} gastados</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>CLV: €{(customer.customerLifetimeValue || 0).toFixed(0)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            <span>Satisfacción: {customer.satisfaction}/5</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Canal: {customer.acquisitionChannel}</span>
                          <span>Registrado: {new Date(customer.createdAt).toLocaleDateString('es-ES')}</span>
                          {customer.lastOrderDate && (
                            <span>Último pedido: {new Date(customer.lastOrderDate).toLocaleDateString('es-ES')}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Métricas Clave de CRM</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Tasa de Retención</span>
                <span className="text-lg font-bold text-green-600">{stats.retentionRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Tasa de Abandono</span>
                <span className="text-lg font-bold text-red-600">{stats.churnRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Nuevos Clientes (30d)</span>
                <span className="text-lg font-bold text-blue-600">{stats.new}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">CLV Promedio</span>
                <span className="text-lg font-bold text-purple-600">
                  €{customers.length > 0 ? (customers.reduce((sum, c) => sum + (c.customerLifetimeValue || 0), 0) / customers.length).toFixed(0) : 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Recomendadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border-l-4 border-red-500 bg-red-50">
                <h4 className="font-medium text-red-800">Clientes en Riesgo</h4>
                <p className="text-sm text-red-700">
                  {customers.filter(c => (c.riskScore || 0) > 70).length} clientes con alto riesgo de abandono
                </p>
                <Button size="sm" className="mt-2">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Ver Detalles
                </Button>
              </div>

              <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                <h4 className="font-medium text-orange-800">Oportunidades de Upsell</h4>
                <p className="text-sm text-orange-700">
                  {customers.filter(c => c.segment === 'FREQUENT').length} clientes frecuentes para promocionar
                </p>
                <Button size="sm" className="mt-2">
                  <Target className="w-4 h-4 mr-2" />
                  Crear Campaña
                </Button>
              </div>

              <div className="p-3 border-l-4 border-green-500 bg-green-50">
                <h4 className="font-medium text-green-800">Clientes VIP</h4>
                <p className="text-sm text-green-700">
                  {stats.vip} clientes VIP generan el mayor valor
                </p>
                <Button size="sm" className="mt-2">
                  <Award className="w-4 h-4 mr-2" />
                  Programa Exclusivo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Segments Tab */}
      {activeTab === 'segments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { segment: 'VIP', count: customers.filter(c => c.segment === 'VIP').length, color: 'purple', description: 'Clientes de alto valor con múltiples compras' },
              { segment: 'FREQUENT', count: customers.filter(c => c.segment === 'FREQUENT').length, color: 'blue', description: 'Clientes que compran regularmente' },
              { segment: 'REGULAR', count: customers.filter(c => c.segment === 'REGULAR').length, color: 'green', description: 'Clientes con compras ocasionales' },
              { segment: 'NEW', count: customers.filter(c => c.segment === 'NEW').length, color: 'yellow', description: 'Clientes recién registrados' },
              { segment: 'INACTIVE', count: customers.filter(c => c.segment === 'INACTIVE').length, color: 'gray', description: 'Clientes sin actividad reciente' }
            ].map((item) => (
              <Card key={item.segment} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{item.segment}</span>
                    <Badge className={`bg-${item.color}-100 text-${item.color}-800`}>
                      {item.count}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Valor Total:</span>
                      <span className="font-medium">
                        €{customers.filter(c => c.segment === item.segment)
                          .reduce((sum, c) => sum + (c.totalSpent || 0), 0).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>CLV Promedio:</span>
                      <span className="font-medium">
                        €{customers.filter(c => c.segment === item.segment).length > 0 ?
                          (customers.filter(c => c.segment === item.segment)
                            .reduce((sum, c) => sum + (c.customerLifetimeValue || 0), 0) / 
                           customers.filter(c => c.segment === item.segment).length).toFixed(0) : 0}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-4">
                    Ver Clientes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}