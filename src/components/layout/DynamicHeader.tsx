"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { 
  ChevronDown, 
  Search, 
  Heart, 
  ShoppingCart, 
  Bell,
  User,
  Phone,
  Mail,
  Truck,
  Menu,
  X,
  Home,
  Package,
  ExternalLink,
  Palette
} from "lucide-react"
import { useCartStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import AuthModal from "@/components/auth/AuthModal"

interface MenuItem {
  id: string
  label: string
  url?: string
  linkType: string
  target: string
  categoryId?: string
  productId?: string
  pageType?: string
  parentId?: string
  sortOrder: number
  isActive: boolean
  icon?: string
  badge?: string
  children?: MenuItem[]
  category?: {
    id: string
    name: string
    slug: string
  }
  product?: {
    id: string
    name: string
    slug: string
  }
}

interface Menu {
  id: string
  name: string
  slug: string
  location: string
  isActive: boolean
  items: MenuItem[]
}

const iconMap: { [key: string]: any } = {
  Home, Package, Phone, Mail, User, Palette, ChevronDown, ChevronRight: ChevronDown,
  ExternalLink, ShoppingCart, Menu, X, Search, Heart, Bell, Truck
}

export default function DynamicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const { data: session } = useSession()
  const { getTotalItems, toggleCart } = useCartStore()

  // Cargar menú dinámico
  useEffect(() => {
    fetch('/api/menus?location=HEADER')
      .then(res => res.json())
      .then(menus => {
        if (menus && menus.length > 0) {
          setMenuItems(menus[0].items || [])
        }
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error loading menu:', error)
        setIsLoading(false)
      })
  }, [])

  const buildMenuTree = (items: MenuItem[]): MenuItem[] => {
    const itemMap = new Map<string, MenuItem>()
    const rootItems: MenuItem[] = []

    // Crear mapa de items
    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] })
    })

    // Construir árbol
    items.forEach(item => {
      const mappedItem = itemMap.get(item.id)!
      if (item.parentId) {
        const parent = itemMap.get(item.parentId)
        if (parent) {
          parent.children!.push(mappedItem)
        }
      } else {
        rootItems.push(mappedItem)
      }
    })

    return rootItems.sort((a, b) => a.sortOrder - b.sortOrder)
  }

  const getItemUrl = (item: MenuItem): string => {
    switch (item.linkType) {
      case 'HOME':
        return '/'
      case 'CATEGORY':
        return item.category ? `/categories/${item.category.slug}` : '#'
      case 'PRODUCT':
        return item.product ? `/products/${item.product.slug}` : '#'
      case 'PAGE':
        // Mapear pageTypes a URLs
        const pageUrls: { [key: string]: string } = {
          'HOME': '/',
          'ABOUT': '/about',
          'CONTACT': '/contact',
          'CUSTOMIZER': '/customizer',
          'CATALOG': '/catalog',
          'TERMS': '/terms',
          'PRIVACY': '/privacy',
          'FAQ': '/faq',
          'BLOG': '/blog',
          'GALLERY': '/gallery',
          'SERVICES': '/services'
        }
        return pageUrls[item.pageType || ''] || '#'
      case 'CUSTOMIZER':
        return '/customizer'
      case 'EXTERNAL':
      case 'CUSTOM':
        return item.url || '#'
      default:
        return '#'
    }
  }

  const getItemIcon = (item: MenuItem) => {
    const IconComponent = iconMap[item.icon || 'Package']
    return IconComponent || Package
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/productos?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const renderMenuItem = (item: MenuItem, isMobile: boolean = false) => {
    const Icon = getItemIcon(item)
    const hasChildren = item.children && item.children.length > 0
    const url = getItemUrl(item)

    if (isMobile) {
      return (
        <div key={item.id} className="border-b border-gray-100">
          <Link 
            href={url}
            className="flex items-center justify-between py-3 px-4 text-gray-700 hover:text-orange-600 transition-colors"
            target={item.target === 'BLANK' ? '_blank' : '_self'}
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            {hasChildren && <ChevronDown className="w-4 h-4" />}
          </Link>
          {hasChildren && (
            <div className="pl-8 pb-2">
              {item.children!.filter(child => child.isActive).map(child => (
                <Link
                  key={child.id}
                  href={getItemUrl(child)}
                  className="block py-2 px-4 text-sm text-gray-600 hover:text-orange-600"
                  target={child.target === 'BLANK' ? '_blank' : '_self'}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div key={item.id} className="relative group">
        <Link 
          href={url}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-orange-600 transition-colors font-medium"
          target={item.target === 'BLANK' ? '_blank' : '_self'}
        >
          <Icon className="w-4 h-4" />
          {item.label}
          {item.badge && (
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
          {hasChildren && <ChevronDown className="w-4 h-4 ml-1" />}
          {item.target === 'BLANK' && <ExternalLink className="w-3 h-3" />}
        </Link>
        
        {hasChildren && (
          <div className="absolute top-full left-0 bg-white shadow-lg border rounded-lg py-2 mt-1 min-w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            {item.children!.filter(child => child.isActive).map(child => {
              const ChildIcon = getItemIcon(child)
              return (
                <Link
                  key={child.id}
                  href={getItemUrl(child)}
                  className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                  target={child.target === 'BLANK' ? '_blank' : '_self'}
                >
                  <ChildIcon className="w-4 h-4" />
                  <span>{child.label}</span>
                  {child.badge && (
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      {child.badge}
                    </span>
                  )}
                  {child.target === 'BLANK' && <ExternalLink className="w-3 h-3 ml-auto" />}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const menuTree = buildMenuTree(menuItems.filter(item => item.isActive))

  return (
    <header className="sticky top-0 z-50 bg-white shadow-lg">
      {/* Barra superior */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="flex items-center space-x-6 text-gray-600">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+34 123 456 789</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>info@lovilike.es</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Truck className="w-4 h-4" />
              <span>Envío gratis a partir de 50€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación principal */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              LoviLike
            </span>
          </Link>

          {/* Navegación desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            {isLoading ? (
              <div className="flex space-x-4">
                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              menuTree.map(item => renderMenuItem(item))
            )}
          </nav>

          {/* Barra de búsqueda */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </form>
          </div>

          {/* Iconos de acción */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <button className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors">
              <Heart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                0
              </span>
            </button>

            {/* Carrito */}
            <button 
              onClick={toggleCart}
              className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {getTotalItems()}
              </span>
            </button>

            {/* Notificaciones */}
            <button className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            {/* Usuario */}
            <div className="relative">
              {session ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden md:block">{session.user?.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full bg-white shadow-lg border rounded-lg py-2 mt-1 min-w-48 z-10">
                      <Link href="/profile" className="block px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50">
                        Mi Perfil
                      </Link>
                      <Link href="/orders" className="block px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50">
                        Mis Pedidos
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAuthModalMode('login')
                      setShowAuthModal(true)
                    }}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setAuthModalMode('register')
                      setShowAuthModal(true)
                    }}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Registrarse
                  </Button>
                </div>
              )}
            </div>

            {/* Menú móvil */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="py-4">
            {/* Búsqueda móvil */}
            <div className="px-4 mb-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </form>
            </div>

            {/* Navegación móvil */}
            <nav>
              {isLoading ? (
                <div className="px-4 space-y-3">
                  <div className="w-full h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-full h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-full h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                menuTree.map(item => renderMenuItem(item, true))
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Modal de autenticación */}
      {showAuthModal && (
        <AuthModal
          mode={authModalMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={setAuthModalMode}
        />
      )}
    </header>
  )
}