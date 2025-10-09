"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Package, Grid3x3, Palette, FileImage, TrendingUp, Users, Printer } from "lucide-react"
import Link from "next/link"

export default function PersonalizacionDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSides: 0,
    totalAreas: 0,
    totalTemplates: 0,
    todayOrders: 0,
    totalDesigns: 0
  })

  const quickActions = [
    {
      title: "Configurar Producto",
      description: "Agregar lados y áreas de impresión a un producto",
      href: "/admin/personalizacion/productos",
      icon: Package,
      color: "bg-blue-500"
    },
    {
      title: "Editor Visual",
      description: "Crear diseños con el editor visual avanzado",
      href: "/admin/personalizacion/editor",
      icon: Palette,
      color: "bg-purple-500"
    },
    {
      title: "Crear Template",
      description: "Diseñar templates reutilizables",
      href: "/admin/personalizacion/templates/nuevo",
      icon: FileImage,
      color: "bg-green-500"
    },
    {
      title: "Gestionar Áreas",
      description: "Configurar áreas de impresión y métodos",
      href: "/admin/personalizacion/lados",
      icon: Grid3x3,
      color: "bg-orange-500"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Personalización</h1>
          <p className="text-gray-600 mt-1">Sistema Visual de Personalización estilo Zakeke</p>
        </div>
        <Button asChild>
          <Link href="/admin/personalizacion/editor">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Diseño
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Configurados</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Con personalización activa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lados & Áreas</CardTitle>
            <Grid3x3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSides}/{stats.totalAreas}</div>
            <p className="text-xs text-muted-foreground">Lados / Áreas de impresión</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <FileImage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTemplates}</div>
            <p className="text-xs text-muted-foreground">Diseños predefinidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">Con personalización</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href={action.href}>
                <CardHeader className="pb-3">
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-2`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{action.description}</CardDescription>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Sistema Information */}
      <Card>
        <CardHeader>
          <CardTitle>Acerca del Sistema de Personalización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900">Estructura de Productos</h3>
              <p className="text-sm text-blue-700">Producto → Lados → Áreas de Impresión</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Palette className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-900">Editor Visual</h3>
              <p className="text-sm text-purple-700">Herramientas avanzadas de diseño</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Printer className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-900">Métodos de Impresión</h3>
              <p className="text-sm text-green-700">DTG, Sublimación, Bordado, etc.</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Características del Sistema:</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <li>✅ Editor visual multi-layer</li>
              <li>✅ Múltiples lados por producto</li>
              <li>✅ Áreas de impresión configurables</li>
              <li>✅ Templates reutilizables</li>
              <li>✅ Métodos de impresión específicos</li>
              <li>✅ Generación de archivos print-ready</li>
              <li>✅ Pricing automático por área</li>
              <li>✅ Control de herramientas por área</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}