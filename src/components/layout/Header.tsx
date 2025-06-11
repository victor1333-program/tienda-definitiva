"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Menu, X, ShoppingCart, User, LogOut, UserCircle } from "lucide-react"
import { useCartStore } from "@/lib/store"
import { Button } from "@/components/ui/Button"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const { getTotalItems, toggleCart } = useCartStore()

  const categories = [
    { name: "Textiles DTF", href: "/categoria/textiles-dtf" },
    { name: "Sublimación", href: "/categoria/sublimacion" },
    { name: "Corte Láser", href: "/categoria/corte-laser" },
    { name: "Eventos Especiales", href: "/categoria/eventos-especiales" },
    { name: "Empresas", href: "/categoria/empresas" },
  ]

  return (
    <header className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 shadow-2xl sticky top-0 z-50 backdrop-blur-md">
      {/* Top bar con efecto brillante */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white py-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm font-semibold">
            <span className="flex items-center gap-2 hover:scale-105 transition-transform">
              📞 <a href="tel:611066997" className="hover:underline">611 066 997</a>
            </span>
            <span className="flex items-center gap-2 hover:scale-105 transition-transform">
              ✉️ <a href="mailto:info@lovilike.es" className="hover:underline">info@lovilike.es</a>
            </span>
            <span className="flex items-center gap-2 hover:scale-105 transition-transform">
              📍 Hellín, Albacete
            </span>
          </div>
        </div>
      </div>

      {/* Main header mejorado */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo mejorado */}
            <Link href="/" className="group flex items-center hover:scale-105 transition-all duration-300">
              <div className="relative">
                <div className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-white to-yellow-300 bg-clip-text text-transparent group-hover:from-yellow-200 group-hover:to-orange-200 transition-all duration-300">
                  Lovilike
                </div>
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
              <div className="ml-3 text-lg font-bold text-white/90 group-hover:text-white transition-colors">
                ✨ Personalizados
              </div>
            </Link>

            {/* Desktop Navigation mejorado */}
            <nav className="hidden md:flex items-center space-x-2">
              <Link href="/" className="text-white hover:text-yellow-300 px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 font-semibold">
                🏠 Inicio
              </Link>
              <div className="relative group">
                <button className="text-white hover:text-yellow-300 px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 font-semibold flex items-center gap-2">
                  🛍️ Productos
                  <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 w-80 bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 overflow-hidden">
                  <div className="p-2">
                    {categories.map((category, index) => (
                      <Link
                        key={category.href}
                        href={category.href}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-primary-500 hover:to-secondary-500 hover:text-white rounded-xl transition-all duration-300 group/item"
                      >
                        <span className="text-2xl group-hover/item:scale-110 transition-transform duration-300">
                          {index === 0 ? '👕' : index === 1 ? '☕' : '⚡'}
                        </span>
                        <div>
                          <div className="font-semibold">{category.name}</div>
                          <div className="text-xs opacity-75">Calidad premium</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <Link href="/personalizador" className="text-white hover:text-yellow-300 px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 font-semibold">
                🎨 Personalizar
              </Link>
              <Link href="/contacto" className="text-white hover:text-yellow-300 px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 font-semibold">
                📞 Contacto
              </Link>
            </nav>

            {/* Right side icons mejorados */}
            <div className="flex items-center space-x-3">
              {/* Cart mejorado */}
              <button 
                onClick={toggleCart} 
                className="group relative bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all duration-300 hover:scale-110"
              >
                <ShoppingCart className="w-6 h-6 text-white group-hover:text-yellow-300 transition-colors" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {/* User menu mejorado */}
              {status === "loading" ? (
                <div className="w-12 h-12 bg-white/20 rounded-xl animate-pulse" />
              ) : session?.user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-gray-900">
                      {session.user.name?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-white">
                      {session.user.name || 'Mi Cuenta'}
                    </span>
                    <svg className="w-4 h-4 text-white group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full right-0 w-56 bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 overflow-hidden mt-2">
                    <div className="p-2">
                      <Link href="/perfil" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-primary-500 hover:to-secondary-500 hover:text-white rounded-xl transition-all duration-300 group/item">
                        <User className="w-5 h-5 group-hover/item:scale-110 transition-transform" />
                        <span className="font-semibold">Mi Perfil</span>
                      </Link>
                      <Link href="/perfil/pedidos" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-primary-500 hover:to-secondary-500 hover:text-white rounded-xl transition-all duration-300 group/item">
                        <ShoppingCart className="w-5 h-5 group-hover/item:scale-110 transition-transform" />
                        <span className="font-semibold">Mis Pedidos</span>
                      </Link>
                      <div className="h-px bg-gray-200 my-2"></div>
                      <button 
                        onClick={() => signOut()}
                        className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 group/item"
                      >
                        <LogOut className="w-5 h-5 group-hover/item:scale-110 transition-transform" />
                        <span className="font-semibold">Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/signin">
                    <button className="text-white hover:text-yellow-300 px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 font-semibold">
                      Iniciar Sesión
                    </button>
                  </Link>
                  <Link href="/auth/register">
                    <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-2 rounded-xl font-bold hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 hover:scale-105 shadow-lg">
                      Registrarse
                    </button>
                  </Link>
                </div>
              )}
              
              {/* Mobile menu button mejorado */}
              <button
                className="md:hidden bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all duration-300 hover:scale-110"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu mejorado */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-white/20 bg-white/5 backdrop-blur-lg">
              <nav className="py-6 px-4 space-y-3">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-xl transition-all duration-300 font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🏠 Inicio
                </Link>
                
                <div className="text-white/70 text-sm font-semibold px-4 py-2">Productos:</div>
                {categories.map((category, index) => (
                  <Link
                    key={category.href}
                    href={category.href}
                    className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-xl transition-all duration-300 font-semibold ml-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-xl">
                      {index === 0 ? '👕' : index === 1 ? '☕' : '⚡'}
                    </span>
                    {category.name}
                  </Link>
                ))}
                
                <Link
                  href="/personalizador"
                  className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-xl transition-all duration-300 font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🎨 Personalizar
                </Link>
                <Link
                  href="/contacto"
                  className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-xl transition-all duration-300 font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  📞 Contacto
                </Link>
                
                {!session?.user && (
                  <div className="pt-4 space-y-3">
                    <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full text-white hover:text-yellow-300 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-300 font-semibold border border-white/20">
                        Iniciar Sesión
                      </button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-4 py-3 rounded-xl font-bold hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 shadow-lg">
                        Registrarse
                      </button>
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}