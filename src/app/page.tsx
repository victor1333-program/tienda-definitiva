import { ArrowRight, Star, Truck, Shield, Palette, Zap, Heart, Trophy, Sparkles, Phone, Mail } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const categories = [
    {
      name: "🎨 Textiles DTF",
      description: "Camisetas, sudaderas y textiles con la mejor calidad DTF del mercado",
      icon: "👕",
      href: "/categoria/textiles-dtf",
      gradient: "from-orange-500 to-red-500"
    },
    {
      name: "☕ Sublimación",
      description: "Tazas, cojines y productos únicos con colores vibrantes",
      icon: "🏆",
      href: "/categoria/sublimacion", 
      gradient: "from-blue-500 to-purple-500"
    },
    {
      name: "⚡ Corte Láser",
      description: "Precisión absoluta en madera, acrílico y más materiales",
      icon: "🔥",
      href: "/categoria/corte-laser",
      gradient: "from-green-500 to-teal-500"
    }
  ]

  const features = [
    {
      icon: <Sparkles className="w-12 h-12 text-white" />,
      title: "✨ Diseños Únicos",
      description: "Tu imaginación es el límite. Creamos exactamente lo que sueñas.",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: <Trophy className="w-12 h-12 text-white" />,
      title: "🏆 Calidad Premium",
      description: "Solo usamos los mejores materiales y tecnología de vanguardia.",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Zap className="w-12 h-12 text-white" />,
      title: "⚡ Súper Rápido",
      description: "¡En 24-48h tienes tu pedido listo! O recógelo gratis en tienda.",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      icon: <Heart className="w-12 h-12 text-white" />,
      title: "💙 100% Garantizado",
      description: "Si no te encanta, te devolvemos el dinero sin preguntas.",
      gradient: "from-red-500 to-pink-500"
    }
  ]

  const testimonials = [
    {
      name: "María García",
      text: "¡Increíble calidad! Mi camiseta personalizada quedó perfecta. Volveré seguro.",
      rating: 5,
      location: "Hellín"
    },
    {
      name: "Carlos Ruiz", 
      text: "El servicio es excepcional. Muy rápidos y profesionales. Totalmente recomendado.",
      rating: 5,
      location: "Albacete"
    },
    {
      name: "Ana López",
      text: "Las tazas sublimadas para mi negocio quedaron espectaculares. ¡Gracias!",
      rating: 5,
      location: "Tobarra"
    }
  ]

  return (
    <div className="overflow-hidden">
      {/* Hero Section - Rediseñado completamente */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 text-white overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-300 rounded-full animate-bounce-gentle"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-pink-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-300 rounded-full animate-bounce-gentle" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 right-10 w-28 h-28 bg-green-300 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight">
                ¡HAZ TUS IDEAS 
                <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-pulse">
                  REALIDAD! ✨
                </span>
              </h1>
              
              <p className="text-xl md:text-3xl mb-12 text-white font-medium max-w-4xl mx-auto">
                🔥 <strong className="text-yellow-200">Los mejores en personalización</strong> en Hellín, Albacete<br/>
                <span className="text-yellow-300 font-bold">DTF • Sublimación • Corte Láser</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                <Link
                  href="/personalizador"
                  className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/25 inline-flex items-center justify-center"
                >
                  <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                  ¡PERSONALIZAR AHORA!
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link
                  href="/productos"
                  className="group border-4 border-white text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white hover:text-primary-600 transition-all duration-300 shadow-2xl backdrop-blur-sm"
                >
                  Ver Productos 🛍️
                </Link>
              </div>
              
              {/* Badges de credibilidad */}
              <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white">
                  ⭐ +500 clientes felices
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white">
                  🚀 Entrega en 24-48h
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white">
                  💯 Garantía total
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Onda decorativa */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-20 text-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* Urgency Bar */}
      <section className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 animate-pulse">
        <div className="container mx-auto px-4 text-center">
          <p className="font-bold text-lg">
            🔥 ¡OFERTA LIMITADA! 🔥 Envío GRATIS en pedidos +50€ este mes
          </p>
        </div>
      </section>

      {/* Categories Section - Rediseñado */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-6xl font-black text-gray-800 mb-6">
              🎯 Nuestras <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">Especialidades</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Tecnología de última generación para resultados <strong className="text-primary-600">espectaculares</strong>
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link
                key={category.href}
                href={category.href}
                className="group relative bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-slide-up"
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                
                <div className="relative p-8 text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-700 mb-6">
                    {category.description}
                  </p>
                  <div className="inline-flex items-center text-primary-600 font-semibold group-hover:text-secondary-600">
                    Explorar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Rediseñado */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              💎 ¿Por qué somos los <span className="text-yellow-300">MEJORES?</span>
            </h2>
            <p className="text-xl text-gray-200">
              No es casualidad que nos elijan una y otra vez
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group text-center animate-slide-up"
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${feature.gradient} mx-auto mb-6 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-2xl`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-white group-hover:text-yellow-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-200 group-hover:text-white transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Nueva */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              🗣️ Lo que dicen nuestros <span className="text-yellow-300">CLIENTES</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 animate-slide-up"
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-300 fill-current" />
                  ))}
                </div>
                <p className="text-lg mb-4 italic text-white">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl mr-3 text-white">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-200">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Rediseñado */}
      <section className="relative py-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-7xl font-black mb-6 animate-bounce-gentle">
            🚀 ¡EMPEZEMOS YA!
          </h2>
          <p className="text-xl md:text-2xl mb-8 font-medium text-white">
            Tu proyecto personalizado te está esperando ⏰
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Link
              href="/contacto"
              className="group bg-white text-gray-900 px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all duration-300 shadow-2xl inline-flex items-center justify-center"
            >
              <Mail className="w-6 h-6 mr-3" />
              CONTACTAR AHORA
            </Link>
            <a
              href="tel:611066997"
              className="group border-4 border-white text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white hover:text-orange-500 transition-all duration-300 inline-flex items-center justify-center"
            >
              <Phone className="w-6 h-6 mr-3 group-hover:animate-bounce" />
              611 066 997
            </a>
          </div>
          
          <p className="text-lg font-semibold text-white">
            📍 Hellín, Albacete • 🕒 Lun-Vie: 9:00-18:00
          </p>
        </div>
      </section>
    </div>
  )
}
