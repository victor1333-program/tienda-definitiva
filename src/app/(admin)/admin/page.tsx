import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  Palette,
  ArrowUpIcon,
  ArrowDownIcon,
  Calendar,
  BarChart3,
  PieChart,
  TrendingDown,
  DollarSign,
  Eye,
  Filter
} from "lucide-react"
import LineChart from "@/components/charts/LineChart"
import BarChart from "@/components/charts/BarChart"
import DonutChart from "@/components/charts/DonutChart"

async function getDashboardStats() {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      
      // Analytics data
      revenueLastMonth,
      ordersLastMonth,
      customersLastWeek,
      revenueYesterday,
      ordersYesterday,
      
      // Chart data
      dailyRevenue,
      topProducts,
      ordersByStatus,
      productsByCategory
    ] = await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.order.count(),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.order.aggregate({
        where: { status: "DELIVERED" },
        _sum: { totalAmount: true }
      }),
      db.order.count({ where: { status: "PENDING" } }),
      db.productVariant.count({ where: { stock: { lte: 5 } } }),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          orderItems: {
            include: { product: true }
          }
        }
      }),
      
      // Previous month data for comparison
      db.order.aggregate({
        where: { 
          status: "DELIVERED",
          createdAt: { gte: thirtyDaysAgo }
        },
        _sum: { totalAmount: true }
      }),
      db.order.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      db.user.count({
        where: { 
          role: "CUSTOMER",
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      db.order.aggregate({
        where: { 
          status: "DELIVERED",
          createdAt: { gte: yesterday }
        },
        _sum: { totalAmount: true }
      }),
      db.order.count({
        where: { createdAt: { gte: yesterday } }
      }),
      
      // Chart data queries
      db.order.findMany({
        where: {
          status: "DELIVERED",
          createdAt: { gte: sevenDaysAgo }
        },
        select: {
          createdAt: true,
          totalAmount: true
        }
      }),
      
      // Top products
      db.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        _count: { productId: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),
      
      // Orders by status
      db.order.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      
      // Products by category (usando la nueva estructura)
      db.productCategory.groupBy({
        by: ['categoryId'],
        _count: { categoryId: true },
        where: {
          product: {
            isActive: true
          }
        }
      })
    ])

    // Process daily revenue data
    const revenueByDay: { [key: string]: number } = {}
    dailyRevenue.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0]
      revenueByDay[dateKey] = (revenueByDay[dateKey] || 0) + order.totalAmount
    })

    const dailyRevenueChart = Object.entries(revenueByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({
        date,
        value: amount
      }))

    // Process top products
    const topProductsData = await Promise.all(
      topProducts.map(async (item) => {
        const product = await db.product.findUnique({
          where: { id: item.productId },
          select: { name: true }
        })
        return {
          label: product?.name || 'Producto Desconocido',
          value: item._sum.quantity || 0,
          color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
        }
      })
    )

    // Process orders by status
    const statusColors: { [key: string]: string } = {
      'PENDING': '#f59e0b',
      'CONFIRMED': '#3b82f6',
      'IN_PRODUCTION': '#8b5cf6',
      'SHIPPED': '#06b6d4',
      'DELIVERED': '#10b981',
      'CANCELLED': '#ef4444'
    }

    const ordersByStatusChart = ordersByStatus.map(item => ({
      label: item.status,
      value: item._count.status,
      color: statusColors[item.status] || '#6b7280'
    }))

    // Calculate percentage changes
    const revenueChange = revenueLastMonth._sum.totalAmount ? 
      ((totalRevenue - (revenueLastMonth._sum.totalAmount || 0)) / (revenueLastMonth._sum.totalAmount || 1)) * 100 : 0
    
    const ordersChange = ordersLastMonth ? 
      ((totalOrders - ordersLastMonth) / ordersLastMonth) * 100 : 0

    return {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      
      // Analytics
      revenueChange,
      ordersChange,
      customersLastWeek,
      revenueYesterday: revenueYesterday._sum.totalAmount || 0,
      ordersYesterday,
      
      // Chart data
      dailyRevenueChart,
      topProductsData,
      ordersByStatusChart
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      lowStockProducts: 0,
      recentOrders: [],
      revenueChange: 0,
      ordersChange: 0,
      customersLastWeek: 0,
      revenueYesterday: 0,
      ordersYesterday: 0,
      dailyRevenueChart: [],
      topProductsData: [],
      ordersByStatusChart: []
    }
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            📊 Dashboard Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            ¡Bienvenido, {session?.user?.name}! Analiza el rendimiento de Lovilike Personalizados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Últimos 30 días
          </Badge>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Vista detallada
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Ingresos Totales
            </CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</div>
            <div className="flex items-center mt-2">
              {stats.revenueChange >= 0 ? (
                <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(stats.revenueChange).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs mes anterior</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Ayer: {formatPrice(stats.revenueYesterday)}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Pedidos
            </CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingCart className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
            <div className="flex items-center mt-2">
              {stats.ordersChange >= 0 ? (
                <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stats.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(stats.ordersChange).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs mes anterior</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Ayer: {stats.ordersYesterday} pedidos
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Clientes Activos
            </CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</div>
            <div className="flex items-center mt-2">
              <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm font-medium text-green-600">
                +{stats.customersLastWeek}
              </span>
              <span className="text-xs text-gray-500 ml-2">esta semana</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Base de clientes total
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Productos Activos
            </CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-sm font-medium text-blue-600">
                Catálogo activo
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Productos disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Ingresos Últimos 7 Días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={stats.dailyRevenueChart}
              title="Evolución de Ingresos"
              color="#3b82f6"
              formatType="currency"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Estados de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={stats.ordersByStatusChart}
              title="Distribución por Estado"
              size={180}
              formatType="orders"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Productos Más Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={stats.topProductsData}
                title="Top 5 Productos por Ventas"
                formatType="units"
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Métricas Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Ticket Promedio</p>
                  <p className="text-lg font-bold text-blue-600">
                    {stats.totalOrders > 0 ? formatPrice(stats.totalRevenue / stats.totalOrders) : formatPrice(0)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-400" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Conversión</p>
                  <p className="text-lg font-bold text-green-600">
                    {stats.totalCustomers > 0 ? ((stats.totalOrders / stats.totalCustomers) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Productos por Cliente</p>
                  <p className="text-lg font-bold text-purple-600">
                    {stats.totalCustomers > 0 ? (stats.totalProducts / stats.totalCustomers).toFixed(1) : 0}
                  </p>
                </div>
                <Package className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alertas y Acciones Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-500" />
              Pedidos Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {stats.pendingOrders}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Pedidos esperando confirmación o procesamiento
            </p>
            {stats.pendingOrders > 0 && (
              <Button asChild>
                <Link href="/admin/pedidos?status=PENDING">
                  Ver Pedidos Pendientes
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 mb-2">
              {stats.lowStockProducts}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Productos con stock menor a 5 unidades
            </p>
            {stats.lowStockProducts > 0 && (
              <Button variant="outline" asChild>
                <Link href="/admin/productos/inventario?lowStock=true">
                  Revisar Inventario
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pedidos Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">
                        {order.user?.name || order.customerName}
                      </p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'IN_PRODUCTION' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(order.totalAmount)}</p>
                    <p className="text-sm text-gray-600">
                      {order.orderItems.length} producto(s)
                    </p>
                  </div>
                </div>
              ))}
              <div className="text-center">
                <Button variant="outline" asChild>
                  <Link href="/admin/pedidos">Ver Todos los Pedidos</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay pedidos recientes</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="h-20 flex-col">
              <Link href="/admin/productos/nuevo">
                <Package className="w-8 h-8 mb-2" />
                Agregar Producto
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/admin/pedidos/nuevo">
                <ShoppingCart className="w-8 h-8 mb-2" />
                Crear Pedido
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/admin/diseños/nuevo">
                <Palette className="w-8 h-8 mb-2" />
                Nuevo Diseño
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}