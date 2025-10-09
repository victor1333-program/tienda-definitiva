"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Settings,
  Store,
  CreditCard,
  Truck,
  Receipt,
  Bell,
  Shield,
  Zap,
  Mail,
  Globe,
  Database,
  Users,
  FileText,
  Lock,
  Cloud,
  Palette,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Calendar,
  BarChart3,
  Package
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SettingsSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
  status: 'configured' | 'partial' | 'pending'
  priority: 'high' | 'medium' | 'low'
  category: 'store' | 'business' | 'integrations' | 'security' | 'advanced'
}

export default function SettingsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const settingsSections: SettingsSection[] = [
    // Store Configuration
    {
      id: 'general',
      title: 'Configuración General',
      description: 'Información básica de la tienda, datos de contacto y configuración regional',
      icon: <Store className="w-5 h-5" />,
      href: '/admin/settings/general',
      status: 'configured',
      priority: 'high',
      category: 'store'
    },
    {
      id: 'appearance',
      title: 'Apariencia y Branding',
      description: 'Logo, colores, tipografías y personalización visual de la tienda',
      icon: <Palette className="w-5 h-5" />,
      href: '/admin/settings/appearance',
      status: 'partial',
      priority: 'medium',
      category: 'store'
    },
    {
      id: 'catalog',
      title: 'Configuración de Catálogo',
      description: 'Gestión de categorías, atributos de productos y configuración de inventario',
      icon: <Package className="w-5 h-5" />,
      href: '/admin/settings/catalog',
      status: 'configured',
      priority: 'high',
      category: 'store'
    },

    // Business Operations
    {
      id: 'payment-methods',
      title: 'Métodos de Pago',
      description: 'Configurar Stripe, PayPal, Redsys, transferencias y otros métodos de pago',
      icon: <CreditCard className="w-5 h-5" />,
      href: '/admin/settings/payment-methods',
      status: 'configured',
      priority: 'high',
      category: 'business'
    },
    {
      id: 'shipping',
      title: 'Envíos y Logística',
      description: 'Métodos de envío, zonas de entrega, tarifas y transportistas',
      icon: <Truck className="w-5 h-5" />,
      href: '/admin/settings/shipping',
      status: 'configured',
      priority: 'high',
      category: 'business'
    },
    {
      id: 'taxes',
      title: 'Impuestos y Facturación',
      description: 'Configuración de IVA, tipos impositivos y facturación automática',
      icon: <Receipt className="w-5 h-5" />,
      href: '/admin/settings/taxes',
      status: 'configured',
      priority: 'high',
      category: 'business'
    },
    {
      id: 'production',
      title: 'Configuración de Producción',
      description: 'Workflow de producción, equipamiento, materiales y tiempos',
      icon: <Settings className="w-5 h-5" />,
      href: '/admin/settings/production',
      status: 'pending',
      priority: 'medium',
      category: 'business'
    },

    // Integrations
    {
      id: 'email',
      title: 'Configuración de Email',
      description: 'SMTP, plantillas de email, notificaciones automáticas',
      icon: <Mail className="w-5 h-5" />,
      href: '/admin/settings/email',
      status: 'configured',
      priority: 'high',
      category: 'integrations'
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Alertas, recordatorios y configuración de notificaciones push',
      icon: <Bell className="w-5 h-5" />,
      href: '/admin/settings/notifications',
      status: 'partial',
      priority: 'medium',
      category: 'integrations'
    },
    {
      id: 'integrations',
      title: 'Integraciones de Terceros',
      description: 'APIs, webhooks, Cloudinary, analytics y otras integraciones',
      icon: <Zap className="w-5 h-5" />,
      href: '/admin/settings/integrations',
      status: 'partial',
      priority: 'medium',
      category: 'integrations'
    },
    {
      id: 'analytics',
      title: 'Analytics y Seguimiento',
      description: 'Google Analytics, Facebook Pixel, métricas de conversión',
      icon: <BarChart3 className="w-5 h-5" />,
      href: '/admin/settings/analytics',
      status: 'pending',
      priority: 'low',
      category: 'integrations'
    },

    // Security
    {
      id: 'security',
      title: 'Seguridad y Permisos',
      description: 'Gestión de usuarios, roles, permisos y políticas de seguridad',
      icon: <Shield className="w-5 h-5" />,
      href: '/admin/settings/security',
      status: 'configured',
      priority: 'high',
      category: 'security'
    },
    {
      id: 'privacy',
      title: 'Privacidad y GDPR',
      description: 'Políticas de privacidad, cookies, consentimientos y cumplimiento legal',
      icon: <Lock className="w-5 h-5" />,
      href: '/admin/settings/privacy',
      status: 'pending',
      priority: 'medium',
      category: 'security'
    },

    // Advanced
    {
      id: 'backup',
      title: 'Backup y Restauración',
      description: 'Configuración de copias de seguridad automáticas y restauración',
      icon: <Cloud className="w-5 h-5" />,
      href: '/admin/settings/backup',
      status: 'pending',
      priority: 'medium',
      category: 'advanced'
    },
    {
      id: 'api',
      title: 'API y Webhooks',
      description: 'Configuración de API keys, webhooks y acceso programático',
      icon: <Globe className="w-5 h-5" />,
      href: '/admin/settings/api',
      status: 'pending',
      priority: 'low',
      category: 'advanced'
    },
    {
      id: 'database',
      title: 'Base de Datos',
      description: 'Mantenimiento, optimización y configuración de base de datos',
      icon: <Database className="w-5 h-5" />,
      href: '/admin/settings/database',
      status: 'pending',
      priority: 'low',
      category: 'advanced'
    },
    {
      id: 'localization',
      title: 'Localización e Idiomas',
      description: 'Idiomas, traducciones, monedas y configuración regional',
      icon: <Globe className="w-5 h-5" />,
      href: '/admin/settings/localization',
      status: 'pending',
      priority: 'low',
      category: 'advanced'
    }
  ]

  const categories = [
    { id: 'all', label: 'Todas las Secciones', count: settingsSections.length },
    { id: 'store', label: 'Configuración de Tienda', count: settingsSections.filter(s => s.category === 'store').length },
    { id: 'business', label: 'Operaciones de Negocio', count: settingsSections.filter(s => s.category === 'business').length },
    { id: 'integrations', label: 'Integraciones', count: settingsSections.filter(s => s.category === 'integrations').length },
    { id: 'security', label: 'Seguridad', count: settingsSections.filter(s => s.category === 'security').length },
    { id: 'advanced', label: 'Configuración Avanzada', count: settingsSections.filter(s => s.category === 'advanced').length }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'configured':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Configurado</Badge>
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><AlertTriangle className="w-3 h-3 mr-1" />Parcial</Badge>
      case 'pending':
        return <Badge variant="outline"><Calendar className="w-3 h-3 mr-1" />Pendiente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Alta</Badge>
      case 'medium':
        return <Badge variant="default" className="text-xs">Media</Badge>
      case 'low':
        return <Badge variant="secondary" className="text-xs">Baja</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{priority}</Badge>
    }
  }

  const filteredSections = selectedCategory === 'all' 
    ? settingsSections 
    : settingsSections.filter(section => section.category === selectedCategory)

  const stats = {
    configured: settingsSections.filter(s => s.status === 'configured').length,
    partial: settingsSections.filter(s => s.status === 'partial').length,
    pending: settingsSections.filter(s => s.status === 'pending').length,
    highPriority: settingsSections.filter(s => s.priority === 'high' && s.status !== 'configured').length
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">⚙️ Configuración de la Tienda</h1>
          <p className="text-gray-600 mt-1">
            Gestiona todos los aspectos de configuración de tu tienda de personalización
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Exportar Configuración
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Asistente de Configuración
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Configurado</p>
                <p className="text-2xl font-bold text-green-600">{stats.configured}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Parcial</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.partial}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendiente</p>
                <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alta Prioridad</p>
                <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                {category.label}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map((section) => (
          <Card key={section.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {getStatusBadge(section.status)}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {section.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {getPriorityBadge(section.priority)}
                  <Badge variant="outline" className="text-xs capitalize">
                    {section.category}
                  </Badge>
                </div>
                <Link href={section.href}>
                  <Button size="sm" variant="ghost">
                    Configurar
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4" />
                <span className="font-medium">Configuración Inicial</span>
              </div>
              <span className="text-sm text-gray-600 text-left">
                Guía paso a paso para configurar tu tienda
              </span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                <span className="font-medium">Backup Completo</span>
              </div>
              <span className="text-sm text-gray-600 text-left">
                Crear copia de seguridad de toda la configuración
              </span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Verificar Estado</span>
              </div>
              <span className="text-sm text-gray-600 text-left">
                Comprobar que toda la configuración es correcta
              </span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" />
                <span className="font-medium">Plantillas</span>
              </div>
              <span className="text-sm text-gray-600 text-left">
                Aplicar configuraciones predefinidas
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}