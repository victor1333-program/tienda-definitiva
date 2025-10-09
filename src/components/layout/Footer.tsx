import Link from "next/link"
import { Phone, Mail, MapPin, Clock, Star, Instagram, Facebook, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-20 w-20 h-20 bg-primary-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary-500 rounded-full animate-bounce-gentle"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info mejorado */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-4">
                <div className="text-3xl font-black bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  Lovilike
                </div>
                <div className="ml-3 text-lg font-bold text-yellow-300">
                  ✨ Personalizados
                </div>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                🔥 <strong className="text-white">Productos personalizados únicos</strong> para tus momentos especiales.<br/>
                💡 Hacemos realidad tus ideas más creativas.
              </p>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-yellow-300">5.0 • +500 clientes felices</span>
              </div>
            </div>
            
            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-3">📱 Síguenos</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-primary-500" />
                <span>611 066 997</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-primary-500" />
                <span>info@lovilike.es</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                <span>Hellín, Albacete</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-primary-500" />
                <span>Lun-Vie: 9:00-18:00</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Enlaces Rápidos</h3>
            <div className="space-y-2">
              <Link href="/categoria/bodas-eventos" className="block text-gray-300 hover:text-primary-500">
                Bodas & Eventos
              </Link>
              <Link href="/categoria/comuniones-bautizos" className="block text-gray-300 hover:text-primary-500">
                Comuniones & Bautizos
              </Link>
              <Link href="/categoria/baby-shower" className="block text-gray-300 hover:text-primary-500">
                Baby Shower
              </Link>
              <Link href="/categoria/textil-personalizado" className="block text-gray-300 hover:text-primary-500">
                Textil Personalizado
              </Link>
              <Link href="/categoria/tazas-accesorios" className="block text-gray-300 hover:text-primary-500">
                Tazas & Accesorios
              </Link>
              <Link href="/personalizador" className="block text-gray-300 hover:text-primary-500">
                Personalizar
              </Link>
              <Link href="/contacto" className="block text-gray-300 hover:text-primary-500">
                Contacto
              </Link>
            </div>
          </div>

          {/* About Us */}
          <div>
            <h3 className="font-semibold mb-4">Sobre Nosotros</h3>
            <div className="space-y-3 text-gray-300">
              <p className="text-sm leading-relaxed">
                Especializados en productos personalizados para eventos especiales y textil personalizado.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  💍 Bodas y eventos
                </div>
                <div className="flex items-center gap-2 text-sm">
                  🎉 Comuniones y bautizos
                </div>
                <div className="flex items-center gap-2 text-sm">
                  👶 Baby shower
                </div>
                <div className="flex items-center gap-2 text-sm">
                  👕 Textil personalizado
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2024 Lovilike Personalizados. Todos los derechos reservados.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacidad" className="text-gray-400 hover:text-white text-sm">
              Política de Privacidad
            </Link>
            <Link href="/terminos" className="text-gray-400 hover:text-white text-sm">
              Términos y Condiciones
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-white text-sm">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}