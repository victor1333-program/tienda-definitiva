'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Menu as MenuIcon,
  Navigation,
  Globe,
  Smartphone,
  Settings,
  Link2,
  Home,
  Package,
  ExternalLink,
  ChevronDown,
  GripVertical
} from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
}

interface MenuItem {
  id: string
  label: string
  linkType: string
  url: string
  target: string
  categoryId?: string
  productId?: string
  pageType?: string
  parentId?: string
  isActive: boolean
  icon?: string
  badge?: string
  title?: string
  description?: string
  sortOrder: number
  children?: MenuItem[]
}

export default function NewMenuPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    location: 'HEADER',
    maxDepth: 3,
    showOnMobile: true,
    sortOrder: 0
  })

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Auto-generate slug from name
    if (formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name])

  const loadData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products')
      ])

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(Array.isArray(categoriesData) ? categoriesData : categoriesData.categories || [])
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(Array.isArray(productsData) ? productsData : productsData.products || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('El nombre del menú es requerido')
      return
    }
    
    if (!formData.slug.trim()) {
      toast.error('El slug del menú es requerido')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/content/menus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          items: menuItems
        })
      })

      if (response.ok) {
        const menu = await response.json()
        toast.success('Menú creado exitosamente')
        router.push(`/admin/content/menus/${menu.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear el menú')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al crear el menú')
    } finally {
      setIsLoading(false)
    }
  }

  const addMenuItem = () => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      label: '',
      linkType: 'CUSTOM',
      url: '',
      target: 'SELF',
      isActive: true,
      sortOrder: menuItems.length + 1
    }
    setMenuItems([...menuItems, newItem])
  }

  const updateMenuItem = (itemId: string, updates: Partial<MenuItem>) => {
    setMenuItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    )
  }

  const removeMenuItem = (itemId: string) => {
    setMenuItems(items => items.filter(item => item.id !== itemId))
  }

  const generateUrl = (item: MenuItem) => {
    switch (item.linkType) {
      case 'HOME':
        return '/'
      case 'CATEGORY':
        if (item.categoryId) {
          const category = categories.find(c => c.id === item.categoryId)
          return category ? `/category/${category.slug}` : ''
        }
        return ''
      case 'PRODUCT':
        if (item.productId) {
          const product = products.find(p => p.id === item.productId)
          return product ? `/product/${product.slug}` : ''
        }
        return ''
      case 'PAGE':
        switch (item.pageType) {
          case 'ABOUT': return '/about'
          case 'CONTACT': return '/contact'
          case 'TERMS': return '/terms'
          case 'PRIVACY': return '/privacy'
          case 'FAQ': return '/faq'
          case 'BLOG': return '/blog'
          case 'GALLERY': return '/gallery'
          case 'SERVICES': return '/services'
          default: return ''
        }
      default:
        return item.url
    }
  }

  const locations = [
    { value: 'HEADER', label: 'Header Principal' },
    { value: 'FOOTER', label: 'Footer' },
    { value: 'SIDEBAR', label: 'Barra Lateral' },
    { value: 'MOBILE', label: 'Menú Móvil' },
    { value: 'BREADCRUMB', label: 'Breadcrumbs' },
    { value: 'CATEGORY', label: 'Menú de Categorías' }
  ]

  const linkTypes = [
    { value: 'CUSTOM', label: 'URL Personalizada' },
    { value: 'HOME', label: 'Página de Inicio' },
    { value: 'CATEGORY', label: 'Categoría' },
    { value: 'PRODUCT', label: 'Producto' },
    { value: 'PAGE', label: 'Página Interna' },
    { value: 'EXTERNAL', label: 'Enlace Externo' }
  ]

  const pageTypes = [
    { value: 'ABOUT', label: 'Sobre Nosotros' },
    { value: 'CONTACT', label: 'Contacto' },
    { value: 'TERMS', label: 'Términos y Condiciones' },
    { value: 'PRIVACY', label: 'Política de Privacidad' },
    { value: 'FAQ', label: 'Preguntas Frecuentes' },
    { value: 'BLOG', label: 'Blog' },
    { value: 'GALLERY', label: 'Galería' },
    { value: 'SERVICES', label: 'Servicios' }
  ]

  const targets = [
    { value: 'SELF', label: 'Misma ventana' },
    { value: 'BLANK', label: 'Nueva ventana' },
    { value: 'PARENT', label: 'Ventana padre' },
    { value: 'TOP', label: 'Ventana superior' }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🧭 Nuevo Menú</h1>
            <p className="text-gray-600 mt-1">
              Crea un nuevo menú de navegación para el sitio web
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Menú *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Menú Principal"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="menu-principal"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Identificador único del menú (se genera automáticamente)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del menú..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {locations.map(location => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profundidad Máxima
                </label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.maxDepth}
                  onChange={(e) => setFormData({ ...formData, maxDepth: parseInt(e.target.value) || 3 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orden
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.showOnMobile}
                  onChange={(e) => setFormData({ ...formData, showOnMobile: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Mostrar en dispositivos móviles</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MenuIcon className="w-5 h-5" />
                Elementos del Menú ({menuItems.length})
              </CardTitle>
              <Button type="button" onClick={addMenuItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Elemento
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {menuItems.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <h4 className="font-medium text-gray-900">Elemento {index + 1}</h4>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeMenuItem(item.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Etiqueta *
                    </label>
                    <Input
                      value={item.label}
                      onChange={(e) => updateMenuItem(item.id, { label: e.target.value })}
                      placeholder="Ej: Inicio, Productos, Contacto"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Enlace
                    </label>
                    <select
                      value={item.linkType}
                      onChange={(e) => updateMenuItem(item.id, { linkType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {linkTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dynamic URL/Target based on link type */}
                {item.linkType === 'CUSTOM' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Personalizada
                    </label>
                    <Input
                      value={item.url}
                      onChange={(e) => updateMenuItem(item.id, { url: e.target.value })}
                      placeholder="/mi-pagina-personalizada"
                    />
                  </div>
                )}

                {item.linkType === 'EXTERNAL' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Externa
                    </label>
                    <Input
                      value={item.url}
                      onChange={(e) => updateMenuItem(item.id, { url: e.target.value })}
                      placeholder="https://ejemplo.com"
                    />
                  </div>
                )}

                {item.linkType === 'CATEGORY' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={item.categoryId || ''}
                      onChange={(e) => updateMenuItem(item.id, { categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Seleccionar categoría...</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {item.linkType === 'PRODUCT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Producto
                    </label>
                    <select
                      value={item.productId || ''}
                      onChange={(e) => updateMenuItem(item.id, { productId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Seleccionar producto...</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {item.linkType === 'PAGE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Página Interna
                    </label>
                    <select
                      value={item.pageType || ''}
                      onChange={(e) => updateMenuItem(item.id, { pageType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Seleccionar página...</option>
                      {pageTypes.map(page => (
                        <option key={page.value} value={page.value}>
                          {page.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Show generated URL */}
                {item.linkType !== 'HOME' && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Generada
                    </label>
                    <code className="text-sm text-gray-600">
                      {generateUrl(item) || 'Configurar enlace para generar URL'}
                    </code>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Abrir en
                    </label>
                    <select
                      value={item.target}
                      onChange={(e) => updateMenuItem(item.id, { target: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {targets.map(target => (
                        <option key={target.value} value={target.value}>
                          {target.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.isActive}
                        onChange={(e) => updateMenuItem(item.id, { isActive: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Elemento activo</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icono (opcional)
                    </label>
                    <Input
                      value={item.icon || ''}
                      onChange={(e) => updateMenuItem(item.id, { icon: e.target.value })}
                      placeholder="home, package, users..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Badge (opcional)
                    </label>
                    <Input
                      value={item.badge || ''}
                      onChange={(e) => updateMenuItem(item.id, { badge: e.target.value })}
                      placeholder="Nuevo, Hot, Sale..."
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {menuItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MenuIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay elementos definidos. Comienza agregando el primer elemento del menú.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                * Los campos marcados son requeridos
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !formData.name.trim() || !formData.slug.trim()}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Crear Menú
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}