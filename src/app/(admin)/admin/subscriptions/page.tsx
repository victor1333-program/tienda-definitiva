"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Package,
  Plus,
  Settings,
  BarChart3,
  Calendar,
  DollarSign
} from "lucide-react"
import { subscriptionTypes, getAllPlans } from "@/lib/subscriptions/plans"

interface SubscriptionStats {
  totalSubscriptions: number
  activeSubscriptions: number
  monthlyRevenue: number
  churnRate: number
  newSubscriptionsThisMonth: number
  popularPlan: string
}

export default function SubscriptionsPage() {
  const [stats, setStats] = useState<SubscriptionStats>({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    churnRate: 0,
    newSubscriptionsThisMonth: 0,
    popularPlan: ''
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carga de estadísticas
    setTimeout(() => {
      setStats({
        totalSubscriptions: 1247,
        activeSubscriptions: 1089,
        monthlyRevenue: 28450.50,
        churnRate: 12.7,
        newSubscriptionsThisMonth: 89,
        popularPlan: 'Lovibox Premium'
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  const plans = getAllPlans()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📦 Gestión de Suscripciones</h1>
          <p className="text-gray-600 mt-1">
            Panel de control para tipos, planes y suscripciones activas
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Plan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Suscripciones Activas</p>
                <p className="text-2xl font-bold text-green-600">
                  {isLoading ? '...' : stats.activeSubscriptions.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {isLoading ? '...' : `${stats.totalSubscriptions} total`}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ingresos Mensuales</p>
                <p className="text-2xl font-bold text-blue-600">
                  {isLoading ? '...' : `€${stats.monthlyRevenue.toLocaleString()}`}
                </p>
                <p className="text-xs text-gray-500">Recurrentes</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nuevas este Mes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {isLoading ? '...' : stats.newSubscriptionsThisMonth}
                </p>
                <p className="text-xs text-green-500">+15% vs mes anterior</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tasa de Cancelación</p>
                <p className="text-2xl font-bold text-red-600">
                  {isLoading ? '...' : `${stats.churnRate}%`}
                </p>
                <p className="text-xs text-gray-500">Últimos 30 días</p>
              </div>
              <Calendar className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tipos de Suscripción */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tipos de Suscripción</CardTitle>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptionTypes.map(type => {
              const typePlans = plans.filter(plan => plan.subscriptionTypeId === type.id)
              const activeSubscriptions = type.id === 'lovibox' ? 750 : 339 // Mock data
              
              return (
                <div 
                  key={type.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{type.name}</h3>
                      <p className="text-gray-600 text-sm">{type.description}</p>
                    </div>
                    <Badge variant={type.isActive ? "default" : "secondary"}>
                      {type.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Planes</p>
                      <p className="font-medium">{typePlans.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Suscriptores</p>
                      <p className="font-medium">{activeSubscriptions}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ingresos</p>
                      <p className="font-medium">
                        €{type.id === 'lovibox' ? '18,200' : '10,250'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Ver Planes
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Suscriptores
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Planes */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Planes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Plan</th>
                  <th className="text-left py-3 px-2">Tipo</th>
                  <th className="text-left py-3 px-2">Precio</th>
                  <th className="text-left py-3 px-2">Suscriptores</th>
                  <th className="text-left py-3 px-2">Ingresos</th>
                  <th className="text-left py-3 px-2">Estado</th>
                  <th className="text-left py-3 px-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => {
                  const subscribers = Math.floor(Math.random() * 300) + 50 // Mock data
                  const revenue = subscribers * plan.price
                  
                  return (
                    <tr key={plan.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{plan.name}</span>
                          {plan.isPopular && (
                            <Badge variant="default" className="text-xs">Popular</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline">
                          {subscriptionTypes.find(t => t.id === plan.subscriptionTypeId)?.name}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-medium">€{plan.price}</span>
                        <span className="text-gray-500 text-sm">/{plan.billingCycle}</span>
                      </td>
                      <td className="py-3 px-2">{subscribers}</td>
                      <td className="py-3 px-2">€{revenue.toFixed(2)}</td>
                      <td className="py-3 px-2">
                        <Badge variant={plan.isActive ? "default" : "secondary"}>
                          {plan.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            Editar
                          </Button>
                          <Button size="sm" variant="outline">
                            Ver
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}