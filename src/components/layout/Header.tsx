"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Menu, X, ShoppingCart, User, LogOut, UserCircle, Heart, Search } from "lucide-react"
import { useCartStore } from "@/lib/store"
import { useWishlist } from "@/components/ui/Wishlist"
import { NotificationCenter } from "@/components/ui/PushNotifications"
import { Button } from "@/components/ui/button"
import { HeaderLogo } from "@/components/ui/Logo"
import AuthModal from "@/components/auth/AuthModal"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')
  const { data: session, status } = useSession()
  const { getTotalItems, toggleCart } = useCartStore()
  const { getWishlistCount } = useWishlist()

  const categories = [
    { name: "Bodas & Eventos", href: "/categoria/bodas-eventos" },
    { name: "Comuniones & Bautizos", href: "/categoria/comuniones-bautizos" },
    { name: "Baby Shower & Nacimiento", href: "/categoria/baby-shower" },
    { name: "Textil Personalizado", href: "/categoria/textil-personalizado" },
    { name: "Tazas & Accesorios", href: "/categoria/tazas-accesorios" },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/productos?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const openLoginModal = () => {
    setAuthModalMode('login')
    setShowAuthModal(true)
  }

  const openRegisterModal = () => {
    setAuthModalMode('register')
    setShowAuthModal(true)
  }

  return (
    <header className="bg-white shadow-2xl sticky top-0 z-50">
      {/* Top bar con efecto brillante */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white py-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-8 text-sm font-semibold">
            <span className="flex items-center gap-2 hover:scale-105 transition-transform">
              📞 <a href="tel:611066997" className="hover:underline" aria-label="Llamar al teléfono 611 066 997">611 066 997</a>
            </span>
            <span className="flex items-center gap-2 hover:scale-105 transition-transform">
              ✉️ <a href="mailto:info@lovilike.es" className="hover:underline" aria-label="Enviar email a info@lovilike.es">info@lovilike.es</a>
            </span>
            <span className="flex items-center gap-2 hover:scale-105 transition-transform">
              🚛 Entrega Gratis en compras superiores a 50€
            </span>
            <span className="flex items-center gap-2 hover:scale-105 transition-transform">
              ⚡ Entrega 24h con envío Express
            </span>
          </div>
        </div>
      </div>

      {/* Main header mejorado */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-24">
            {/* Logo Principal */}
            <HeaderLogo />

            {/* Desktop Navigation mejorado */}
            <nav className="hidden md:flex items-center space-x-2" role="navigation" aria-label="Navegación principal">
              <Link href="/" className="text-black hover:text-orange-500 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold">
                🏠 Inicio
              </Link>
              <div className="relative group">
                <button 
                  className="text-black hover:text-orange-500 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold flex items-center gap-2"
                  aria-expanded="false"
                  aria-haspopup="true"
                  aria-label="Menú de productos"
                  onMouseEnter={(e) => e.currentTarget.setAttribute('aria-expanded', 'true')}
                  onMouseLeave={(e) => e.currentTarget.setAttribute('aria-expanded', 'false')}
                >
                  🛍️ Productos
                  <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 w-80 bg-orange-500 shadow-2xl rounded-2xl border border-orange-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 overflow-hidden z-50" role="menu" aria-label="Categorías de productos">
                  <div className="p-2">
                    {categories.map((category, index) => (
                      <Link
                        key={category.href}
                        href={category.href}
                        className="flex items-center gap-3 px-4 py-3 text-white hover:bg-orange-600 rounded-xl transition-all duration-300 group/item"
                        role="menuitem"
                        aria-label={`Ir a ${category.name}`}
                      >
                        <span className="text-2xl group-hover/item:scale-110 transition-transform duration-300" aria-hidden="true">
                          {index === 0 ? '💍' : index === 1 ? '🎉' : index === 2 ? '👶' : index === 3 ? '👕' : '☕'}
                        </span>
                        <div>
                          <div className="font-semibold text-white">{category.name}</div>
                          <div className="text-xs text-white/80">Calidad premium</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <Link href="/personalizador" className="text-black hover:text-orange-500 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold">
                🎨 Personalizar
              </Link>
              <Link href="/contacto" className="text-black hover:text-orange-500 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold">
                📞 Contacto
              </Link>
            </nav>

            {/* Buscador inteligente */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
              <form onSubmit={handleSearch} className="relative w-full" role="search" aria-label="Buscar productos">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-4 text-black bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  aria-label="Campo de búsqueda"
                  aria-describedby="search-help"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
                <div id="search-help" className="sr-only">Escriba términos de búsqueda para encontrar productos</div>
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  aria-label="Realizar búsqueda"
                >
                  Buscar
                </button>
              </form>
            </div>

            {/* Right side icons mejorados */}
            <div className="flex items-center space-x-3">
              {/* Wishlist */}
              <Link href="/favoritos" aria-label={`Lista de favoritos${getWishlistCount() > 0 ? ` (${getWishlistCount()} artículos)` : ''}`}>
                <button className="group relative bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-all duration-300 hover:scale-110">
                  <Heart className="w-6 h-6 text-black group-hover:text-pink-500 transition-colors" aria-hidden="true" />
                  {getWishlistCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg" aria-label={`${getWishlistCount()} artículos en favoritos`}>
                      {getWishlistCount()}
                    </span>
                  )}
                </button>
              </Link>
              {/* Cart mejorado */}
              <button 
                onClick={toggleCart} 
                className="group relative bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-all duration-300 hover:scale-110"
                aria-label={`Abrir carrito${getTotalItems() > 0 ? ` (${getTotalItems()} artículos)` : ''}`}
              >
                <ShoppingCart className="w-6 h-6 text-black group-hover:text-orange-500 transition-colors" aria-hidden="true" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg" aria-label={`${getTotalItems()} artículos en carrito`}>
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {/* Notifications */}
              <NotificationCenter />

              {/* User menu mejorado */}
              {status === "loading" ? (
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
              ) : session?.user ? (
                <div className="relative group">
                  <button 
                    className="flex items-center space-x-3 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                    aria-expanded="false"
                    aria-haspopup="true"
                    aria-label="Menú de usuario"
                    onMouseEnter={(e) => e.currentTarget.setAttribute('aria-expanded', 'true')}
                    onMouseLeave={(e) => e.currentTarget.setAttribute('aria-expanded', 'false')}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-gray-900">
                      {session.user.name?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-black">
                      {session.user.name || 'Mi Cuenta'}
                    </span>
                    <svg className="w-4 h-4 text-black group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full right-0 w-56 bg-orange-500 shadow-2xl rounded-2xl border border-orange-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 overflow-hidden mt-2 z-50" role="menu" aria-label="Menú de usuario">
                    <div className="p-2">
                      <Link href="/perfil" className="flex items-center gap-3 px-4 py-3 text-white hover:bg-orange-600 rounded-xl transition-all duration-300 group/item" role="menuitem">
                        <User className="w-5 h-5 text-white group-hover/item:scale-110 transition-all" aria-hidden="true" />
                        <span className="font-semibold">Mi Perfil</span>
                      </Link>
                      <Link href="/perfil/pedidos" className="flex items-center gap-3 px-4 py-3 text-white hover:bg-orange-600 rounded-xl transition-all duration-300 group/item" role="menuitem">
                        <ShoppingCart className="w-5 h-5 text-white group-hover/item:scale-110 transition-all" aria-hidden="true" />
                        <span className="font-semibold">Mis Pedidos</span>
                      </Link>
                      <div className="h-px bg-orange-600 my-2"></div>
                      <button 
                        onClick={() => signOut()}
                        className="flex items-center gap-3 w-full px-4 py-3 text-white hover:bg-red-500 rounded-xl transition-all duration-300 group/item"
                        role="menuitem"
                        aria-label="Cerrar sesión"
                      >
                        <LogOut className="w-5 h-5 text-white group-hover/item:scale-110 transition-all" aria-hidden="true" />
                        <span className="font-semibold">Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={openLoginModal}
                    className="text-black hover:text-orange-500 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold"
                    aria-label="Abrir modal de inicio de sesión"
                  >
                    Iniciar Sesión
                  </button>
                  <button 
                    onClick={openRegisterModal}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-2 rounded-xl font-bold hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 hover:scale-105 shadow-lg"
                    aria-label="Abrir modal de registro"
                  >
                    Registrarse
                  </button>
                </div>
              )}
              
              {/* Mobile menu button mejorado */}
              <button
                className="md:hidden bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-all duration-300 hover:scale-110"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-black" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6 text-black" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu mejorado */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white" id="mobile-menu">
              {/* Buscador móvil */}
              <div className="p-4 border-b border-gray-200">
                <form onSubmit={handleSearch} className="relative" role="search" aria-label="Buscar productos en móvil">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-10 pr-16 text-black bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    aria-label="Campo de búsqueda móvil"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" aria-hidden="true" />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    aria-label="Buscar productos"
                  >
                    Buscar
                  </button>
                </form>
              </div>
              
              <nav className="py-6 px-4 space-y-3" role="navigation" aria-label="Navegación móvil">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 text-black hover:bg-gray-100 rounded-xl transition-all duration-300 font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🏠 Inicio
                </Link>
                
                <div className="text-gray-600 text-sm font-semibold px-4 py-2">Productos:</div>
                {categories.map((category, index) => (
                  <Link
                    key={category.href}
                    href={category.href}
                    className="flex items-center gap-3 px-4 py-3 text-black hover:bg-gray-100 rounded-xl transition-all duration-300 font-semibold ml-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-xl" aria-hidden="true">
                      {index === 0 ? '💍' : index === 1 ? '🎉' : index === 2 ? '👶' : index === 3 ? '👕' : '☕'}
                    </span>
                    {category.name}
                  </Link>
                ))}
                
                <Link
                  href="/personalizador"
                  className="flex items-center gap-3 px-4 py-3 text-black hover:bg-gray-100 rounded-xl transition-all duration-300 font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🎨 Personalizar
                </Link>
                <Link
                  href="/contacto"
                  className="flex items-center gap-3 px-4 py-3 text-black hover:bg-gray-100 rounded-xl transition-all duration-300 font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  📞 Contacto
                </Link>
                
                {!session?.user && (
                  <div className="pt-4 space-y-3">
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false)
                        openLoginModal()
                      }}
                      className="w-full text-black hover:text-orange-500 px-4 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold border border-gray-300"
                    >
                      Iniciar Sesión
                    </button>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false)
                        openRegisterModal()
                      }}
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-4 py-3 rounded-xl font-bold hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 shadow-lg"
                    >
                      Registrarse
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        defaultMode={authModalMode}
      />
    </header>
  )
}