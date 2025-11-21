"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  BarChart3,
  FileImage,
  UserCircle,
  Home,
  ChevronDown,
  LogOut,
  Palette,
  Truck,
  CreditCard,
  PieChart,
  FileText,
  Layers,
  Building2,
  Factory,
  Calculator,
  Package2,
  Target,
  TrendingUp,
  Receipt,
  BookOpen,
  Mail,
  Menu,
  Layout,
  Brush,
  Tag,
  Gift,
  Heart,
  Calendar,
  Box,
  Wand2,
  Image,
  Grid3x3,
  Shapes,
  Type,
  Printer,
  Wrench
} from "lucide-react"

export default function AdminSidebar() {
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Auto-expand menu based on current path
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pathname.startsWith("/admin/products") || pathname.startsWith("/admin/categories") || pathname.startsWith("/admin/inventory") || pathname.startsWith("/admin/suppliers")) {
        setExpandedMenus(prev => prev.includes("productos") ? prev : [...prev, "productos"])
      } else if (pathname.startsWith("/admin/personalizacion") || pathname.startsWith("/admin/design-variants")) {
        setExpandedMenus(prev => prev.includes("personalizacion") ? prev : [...prev, "personalizacion"])
      } else if (pathname.startsWith("/admin/production")) {
        setExpandedMenus(prev => prev.includes("produccion") ? prev : [...prev, "produccion"])
      } else if (pathname.startsWith("/admin/finances")) {
        setExpandedMenus(prev => prev.includes("finanzas") ? prev : [...prev, "finanzas"])
      } else if (pathname.startsWith("/admin/settings") || pathname.startsWith("/admin/email-system")) {
        setExpandedMenus(prev => prev.includes("configuracion") ? prev : [...prev, "configuracion"])
      }
      // Lovibox/Suscripciones comentado temporalmente
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname])

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => {
      const newMenus = prev.includes(menu) 
        ? prev.filter(m => m !== menu)
        : [...prev, menu]
      return newMenus
    })
  }

  const handleLogout = async () => {
    setShowLogoutModal(false)
    await signOut({ callbackUrl: "/auth/signin" })
  }

  const getLinkClass = (path: string) =>
    `flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 text-sm ${
      pathname === path
        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
        : "text-gray-600 hover:bg-orange-50 hover:text-orange-700"
    }`

  const getParentLinkClass = (basePath: string) =>
    `flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 text-sm ${
      pathname.startsWith(basePath)
        ? "bg-orange-50 text-orange-700 border border-orange-200"
        : "text-gray-600 hover:bg-orange-50 hover:text-orange-700"
    }`

  return (
    <>
      <aside className="w-56 bg-white border-r border-gray-200 h-screen flex flex-col shadow-lg fixed left-0 top-0 z-50 admin-sidebar">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg overflow-hidden">
              <img 
                src="/img/Social_Logo.png" 
                alt="Lovilike Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">Lovilike</h2>
              <p className="text-xs text-gray-500 font-medium">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db #f3f4f6'
        }}>
          <Link href="/admin" className={getLinkClass("/admin")}>
            <Home className="h-5 w-5" />
            Dashboard
          </Link>

          <Link href="/admin/orders" className={getLinkClass("/admin/orders")}>
            <ShoppingCart className="h-5 w-5" />
            Pedidos
          </Link>

          {/* Productos Menu */}
          <div>
            <button
              onClick={() => toggleMenu("productos")}
              className={`w-full ${getParentLinkClass("/admin/products")} justify-between`}
            >
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5" />
                Productos
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                expandedMenus.includes("productos") ? "rotate-180" : ""
              }`} />
            </button>
            
            {expandedMenus.includes("productos") && (
              <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-3">
                <Link href="/admin/products" className={getLinkClass("/admin/products")}>
                  <Package className="h-4 w-4" />
                  Productos
                </Link>
                <Link href="/admin/categories" className={getLinkClass("/admin/categories")}>
                  <Layers className="h-4 w-4" />
                  Categorías
                </Link>
                <Link href="/admin/inventory" className={getLinkClass("/admin/inventory")}>
                  <Package2 className="h-4 w-4" />
                  Inventario
                </Link>
                <Link href="/admin/suppliers" className={getLinkClass("/admin/suppliers")}>
                  <Building2 className="h-4 w-4" />
                  Proveedores
                </Link>
              </div>
            )}
          </div>

          {/* Personalización Zakeke Menu */}
          <div>
            <button
              onClick={() => toggleMenu("personalizacion")}
              className={`w-full ${getParentLinkClass("/admin/personalizacion")} justify-between`}
            >
              <div className="flex items-center gap-3">
                <Wand2 className="h-5 w-5" />
                Personalización
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                expandedMenus.includes("personalizacion") ? "rotate-180" : ""
              }`} />
            </button>
            
            {expandedMenus.includes("personalizacion") && (
              <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-3">
                <Link href="/admin/personalizacion/productos" className={getLinkClass("/admin/personalizacion/productos")}>
                  <Package className="h-4 w-4" />
                  Productos Personalizables
                </Link>
                <Link href="/admin/personalizacion/metodos-impresion" className={getLinkClass("/admin/personalizacion/metodos-impresion")}>
                  <Printer className="h-4 w-4" />
                  Métodos de Impresión
                </Link>
                <Link href="/admin/personalizacion/herramientas" className={getLinkClass("/admin/personalizacion/herramientas")}>
                  <Wrench className="h-4 w-4" />
                  Herramientas
                </Link>
                <Link href="/admin/personalizacion/pedidos" className={getLinkClass("/admin/personalizacion/pedidos")}>
                  <ShoppingCart className="h-4 w-4" />
                  Pedidos
                </Link>
                <Link href="/admin/design-variants" className={getLinkClass("/admin/design-variants")}>
                  <Brush className="h-4 w-4" />
                  Variantes de Diseño
                </Link>
              </div>
            )}
          </div>

          {/* Suscripciones Menu - COMENTADO: Se implementará más adelante */}
          {/* <div>
            <button
              onClick={() => toggleMenu("lovibox")}
              className={`w-full ${getParentLinkClass("/admin/lovibox")} justify-between`}
            >
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5" />
                Suscripciones
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                expandedMenus.includes("lovibox") ? "rotate-180" : ""
              }`} />
            </button>

            {expandedMenus.includes("lovibox") && (
              <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-3">
                <Link href="/admin/lovibox" className={getLinkClass("/admin/lovibox")}>
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link href="/admin/lovibox/subscriptions" className={getLinkClass("/admin/lovibox/subscriptions")}>
                  <Heart className="h-4 w-4" />
                  Suscripciones
                </Link>
                <Link href="/admin/lovibox/templates" className={getLinkClass("/admin/lovibox/templates")}>
                  <Box className="h-4 w-4" />
                  Templates
                </Link>
                <Link href="/admin/lovibox/deliveries" className={getLinkClass("/admin/lovibox/deliveries")}>
                  <Truck className="h-4 w-4" />
                  Entregas
                </Link>
                <Link href="/admin/lovibox/analytics" className={getLinkClass("/admin/lovibox/analytics")}>
                  <TrendingUp className="h-4 w-4" />
                  Analytics
                </Link>
              </div>
            )}
          </div> */}

          {/* Producción Menu */}
          <div>
            <button
              onClick={() => toggleMenu("produccion")}
              className={`w-full ${getParentLinkClass("/admin/production")} justify-between`}
            >
              <div className="flex items-center gap-3">
                <Factory className="h-5 w-5" />
                Producción
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                expandedMenus.includes("produccion") ? "rotate-180" : ""
              }`} />
            </button>
            
            {expandedMenus.includes("produccion") && (
              <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-3">
                <Link href="/admin/production/board" className={getLinkClass("/admin/production/board")}>
                  <Layers className="h-4 w-4" />
                  Tablero
                </Link>
                <Link href="/admin/workshop" className={getLinkClass("/admin/workshop")}>
                  <Settings className="h-4 w-4" />
                  Taller
                </Link>
                <Link href="/admin/production/materials" className={getLinkClass("/admin/production/materials")}>
                  <Package2 className="h-4 w-4" />
                  Materiales
                </Link>
                <Link href="/admin/production/cost-calculator" className={getLinkClass("/admin/production/cost-calculator")}>
                  <Calculator className="h-4 w-4" />
                  Calc. Costes
                </Link>
              </div>
            )}
          </div>


          <Link href="/admin/email-system" className={getLinkClass("/admin/email-system")}>
            <Mail className="h-5 w-5" />
            Sistema Email
          </Link>

          <Link href="/admin/content/menus" className={getLinkClass("/admin/content/menus")}>
            <Menu className="h-5 w-5" />
            Menús
          </Link>

          {/* Clientes */}
          <Link href="/admin/customers" className={getLinkClass("/admin/customers")}>
            <Users className="h-5 w-5" />
            Clientes
          </Link>

          <Link href="/admin/discounts" className={getLinkClass("/admin/discounts")}>
            <Tag className="h-5 w-5" />
            Descuentos
          </Link>

          {/* Finanzas Menu */}
          <div>
            <button
              onClick={() => toggleMenu("finanzas")}
              className={`w-full ${getParentLinkClass("/admin/finances")} justify-between`}
            >
              <div className="flex items-center gap-3">
                <PieChart className="h-5 w-5" />
                Finanzas
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                expandedMenus.includes("finanzas") ? "rotate-180" : ""
              }`} />
            </button>
            
            {expandedMenus.includes("finanzas") && (
              <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-3">
                <Link href="/admin/invoices" className={getLinkClass("/admin/invoices")}>
                  <Receipt className="h-4 w-4" />
                  Facturas
                </Link>
                <Link href="/admin/finances/quotes" className={getLinkClass("/admin/finances/quotes")}>
                  <FileText className="h-4 w-4" />
                  Presupuestos
                </Link>
                <Link href="/admin/finances/balance" className={getLinkClass("/admin/finances/balance")}>
                  <BookOpen className="h-4 w-4" />
                  Balance
                </Link>
              </div>
            )}
          </div>

          {/* Configuración Menu */}
          <div>
            <button
              onClick={() => toggleMenu("configuracion")}
              className={`w-full ${getParentLinkClass("/admin/settings")} justify-between`}
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5" />
                Configuración
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                expandedMenus.includes("configuracion") ? "rotate-180" : ""
              }`} />
            </button>
            
            {expandedMenus.includes("configuracion") && (
              <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-3">
                <Link href="/admin/settings/general" className={getLinkClass("/admin/settings/general")}>
                  <Settings className="h-4 w-4" />
                  General
                </Link>
                <Link href="/admin/settings/billing" className={getLinkClass("/admin/settings/billing")}>
                  <Receipt className="h-4 w-4" />
                  Facturación
                </Link>
                <Link href="/admin/settings/payment-methods" className={getLinkClass("/admin/settings/payment-methods")}>
                  <CreditCard className="h-4 w-4" />
                  Métodos Pago
                </Link>
                <Link href="/admin/settings/shipping" className={getLinkClass("/admin/settings/shipping")}>
                  <Truck className="h-4 w-4" />
                  Métodos Envío
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-gray-200">
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-2 px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/35 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl text-center max-w-sm mx-4">
            <div className="mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <LogOut className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">¿Cerrar sesión?</h2>
              <p className="text-gray-600 mt-2">Se cerrará tu sesión en el panel de administración.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleLogout} 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Sí, cerrar
              </button>
              <button 
                onClick={() => setShowLogoutModal(false)} 
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}