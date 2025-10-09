'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Eye,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  Plus,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface DashboardStats {
  totalSales: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  revenueChange: number
  ordersChange: number
  customersChange: number
  productsChange: number
  monthlyRevenue: Array<{ month: string; value: number }>
  recentOrders: Array<{
    id: string
    customer: string
    total: number
    status: string
    date: string
  }>
  topProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
  }>
  lowStock: Array<{
    id: string
    name: string
    stock: number
    minStock: number
  }>
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchDashboardStats()
  }, [timeRange])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard/stats?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // Mock data for demonstration
        setStats({
          totalSales: 24680.50,
          totalOrders: 145,
          totalCustomers: 89,
          totalProducts: 23,
          revenueChange: 12.5,
          ordersChange: 8.3,
          customersChange: 15.2,
          productsChange: 4.3,
          monthlyRevenue: [
            { month: 'Ene', value: 12000 },
            { month: 'Feb', value: 15000 },
            { month: 'Mar', value: 18000 },
            { month: 'Abr', value: 22000 },
            { month: 'May', value: 25000 },
            { month: 'Jun', value: 24680 }
          ],
          recentOrders: [
            { id: '001', customer: 'María García', total: 89.99, status: 'completed', date: '2024-06-15' },
            { id: '002', customer: 'Juan Pérez', total: 156.50, status: 'processing', date: '2024-06-15' },
            { id: '003', customer: 'Ana López', total: 234.00, status: 'shipped', date: '2024-06-14' },
            { id: '004', customer: 'Carlos Ruiz', total: 67.25, status: 'pending', date: '2024-06-14' },
            { id: '005', customer: 'Laura Martín', total: 198.75, status: 'completed', date: '2024-06-13' }
          ],
          topProducts: [
            { id: '1', name: 'Taza Personalizada Boda', sales: 45, revenue: 719.55 },
            { id: '2', name: 'Álbum Comunión', sales: 23, revenue: 689.77 },
            { id: '3', name: 'Camiseta Personalizada', sales: 38, revenue: 721.62 },
            { id: '4', name: 'Marco Foto Personalizado', sales: 19, revenue: 456.25 }
          ],
          lowStock: [
            { id: '1', name: 'Taza Cerámica Blanca', stock: 3, minStock: 10 },
            { id: '2', name: 'Camiseta Algodón M', stock: 5, minStock: 15 },
            { id: '3', name: 'Papel Foto Premium', stock: 2, minStock: 20 }
          ]
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3" />
      case 'processing': return <Clock className="w-3 h-3" />
      case 'shipped': return <Package className="w-3 h-3" />
      case 'pending': return <AlertCircle className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  const exportDashboardData = () => {
    if (!stats) {
      alert('No hay datos para exportar')
      return
    }

    const data = {
      resumen: {
        ventasTotales: stats.totalSales,
        totalPedidos: stats.totalOrders,
        totalClientes: stats.totalCustomers,
        totalProductos: stats.totalProducts,
        fechaExportacion: new Date().toLocaleDateString('es-ES'),
        rangoTiempo: timeRange
      },
      ventasMensuales: stats.monthlyRevenue,
      pedidosRecientes: stats.recentOrders,
      productosTopVentas: stats.topProducts,
      stockBajo: stats.lowStock
    }

    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-orange-500" />
            Dashboard Lovilike
          </h1>
          <p className="text-gray-600 text-sm">
            Bienvenido de vuelta, {session?.user?.name || 'Administrador'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
          
          <Button
            onClick={fetchDashboardStats}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
          
          <Button 
            size="sm" 
            className="bg-orange-500 hover:bg-orange-600"
            onClick={exportDashboardData}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{stats?.totalSales?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">
                    +{stats?.revenueChange || 0}%
                  </span>
                  <span className="text-sm text-gray-500">vs mes anterior</span>
                </div>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">
                    +{stats?.ordersChange || 0}%
                  </span>
                  <span className="text-sm text-gray-500">vs mes anterior</span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalCustomers || 0}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">
                    +{stats?.customersChange || 0}%
                  </span>
                  <span className="text-sm text-gray-500">vs mes anterior</span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productos</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">
                    +{stats?.productsChange || 0}%
                  </span>
                  <span className="text-sm text-gray-500">vs mes anterior</span>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" />
              Evolución de Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {stats?.monthlyRevenue?.map((item, index) => {
                const maxValue = Math.max(...(stats?.monthlyRevenue?.map(r => r.value) || [1]))
                return (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <div 
                      className="bg-orange-500 rounded-t-sm w-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                      style={{ height: `${(item.value / maxValue) * 200}px` }}
                      title={`${item.month}: €${item.value?.toLocaleString() || '0'}`}
                    ></div>
                    <span className="text-xs text-gray-600 font-medium">{item.month}</span>
                  </div>
                )
              }) || []}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Promedio mensual</span>
                <span className="font-semibold">
                  €{stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 
                    ? Math.round(stats.monthlyRevenue.reduce((acc, curr) => acc + curr.value, 0) / stats.monthlyRevenue.length).toLocaleString()
                    : '0'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-500" />
                Pedidos Recientes
              </CardTitle>
              <Link href="/admin/orders">
                <Button variant="outline" size="sm">
                  Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentOrders?.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-orange-600">#{order.id}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">€{order.total?.toFixed(2) || '0.00'}</p>
                    <Badge className={`${getStatusColor(order.status)} text-xs flex items-center gap-1`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Productos Más Vendidos
              </CardTitle>
              <Link href="/admin/products">
                <Button variant="outline" size="sm">
                  Gestionar <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.topProducts?.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} unidades vendidas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">€{product.revenue?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-gray-500">ingresos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Stock Bajo
              </CardTitle>
              <Link href="/admin/inventory">
                <Button variant="outline" size="sm">
                  Ver inventario <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {(stats?.lowStock?.length || 0) === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600">¡Todo el stock está en niveles óptimos!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.lowStock?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-red-600">
                        Solo {item.stock} unidades (mín: {item.minStock})
                      </p>
                    </div>
                    <Button size="sm" className="bg-red-500 hover:bg-red-600">
                      <Plus className="w-4 h-4 mr-1" />
                      Reponer
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link href="/admin/products/new" className="group">
              <div className="p-4 border border-orange-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all duration-200 text-center">
                <Package className="w-8 h-8 text-orange-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Nuevo Producto</p>
              </div>
            </Link>
            
            <Link href="/admin/orders" className="group">
              <div className="p-4 border border-blue-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 text-center">
                <ShoppingCart className="w-8 h-8 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Ver Pedidos</p>
              </div>
            </Link>
            
            <Link href="/admin/customers" className="group">
              <div className="p-4 border border-green-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all duration-200 text-center">
                <Users className="w-8 h-8 text-green-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Clientes</p>
              </div>
            </Link>
            
            <Link href="/admin/designs/editor" className="group">
              <div className="p-4 border border-purple-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all duration-200 text-center">
                <PieChart className="w-8 h-8 text-purple-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Editor Diseños</p>
              </div>
            </Link>
            
            <Link href="/admin/performance" className="group">
              <div className="p-4 border border-yellow-200 rounded-lg hover:border-yellow-500 hover:shadow-md transition-all duration-200 text-center">
                <BarChart3 className="w-8 h-8 text-yellow-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Analytics</p>
              </div>
            </Link>
            
            <Link href="/admin/settings" className="group">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-500 hover:shadow-md transition-all duration-200 text-center">
                <Activity className="w-8 h-8 text-gray-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Configuración</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}