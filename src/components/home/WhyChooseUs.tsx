'use client'

import { useState } from 'react'
import { 
  Palette, 
  Truck, 
  Shield, 
  Users, 
  Award, 
  Clock,
  Heart,
  Sparkles,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Reason {
  id: number
  icon: React.ReactNode
  title: string
  description: string
  stats?: string
  color: string
  bgGradient: string
}

const reasons: Reason[] = [
  {
    id: 1,
    icon: <Palette className="w-8 h-8" />,
    title: 'Diseños Únicos',
    description: 'Cada producto es personalizado según tus gustos y necesidades. Nuestro equipo de diseñadores te ayuda a crear algo verdaderamente especial.',
    stats: '+10,000 diseños',
    color: 'text-purple-600',
    bgGradient: 'from-purple-100 to-pink-100'
  },
  {
    id: 2,
    icon: <Award className="w-8 h-8" />,
    title: 'Calidad Premium',
    description: 'Utilizamos materiales de la más alta calidad y técnicas de impresión avanzadas para garantizar productos duraderos y hermosos.',
    stats: '5 años garantía',
    color: 'text-yellow-600',
    bgGradient: 'from-yellow-100 to-orange-100'
  },
  {
    id: 3,
    icon: <Truck className="w-8 h-8" />,
    title: 'Envío Rápido',
    description: 'Procesamos y enviamos tu pedido en tiempo récord. Envío gratuito a partir de 30€ y entrega express disponible.',
    stats: '24-48h entrega',
    color: 'text-blue-600',
    bgGradient: 'from-blue-100 to-cyan-100'
  },
  {
    id: 4,
    icon: <Users className="w-8 h-8" />,
    title: 'Atención Personal',
    description: 'Nuestro equipo te acompaña en todo el proceso. Desde la idea inicial hasta la entrega, estamos aquí para ayudarte.',
    stats: '24/7 soporte',
    color: 'text-green-600',
    bgGradient: 'from-green-100 to-emerald-100'
  },
  {
    id: 5,
    icon: <Shield className="w-8 h-8" />,
    title: 'Compra Segura',
    description: 'Garantía de satisfacción 100%. Si no quedas completamente satisfecho, te devolvemos tu dinero sin preguntas.',
    stats: '100% satisfacción',
    color: 'text-red-600',
    bgGradient: 'from-red-100 to-pink-100'
  },
  {
    id: 6,
    icon: <Clock className="w-8 h-8" />,
    title: 'Experiencia',
    description: 'Más de 10 años creando momentos especiales. Miles de clientes satisfechos nos avalan como líderes en personalización.',
    stats: '+50,000 clientes',
    color: 'text-indigo-600',
    bgGradient: 'from-indigo-100 to-purple-100'
  }
]

export default function WhyChooseUs() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-20 animate-float"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-float-delay"></div>
      <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-200 rounded-full opacity-20 animate-float"></div>
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-orange-500" />
            <span className="text-orange-600 font-semibold text-sm uppercase tracking-wider">
              Nuestra Diferencia
            </span>
            <Heart className="w-6 h-6 text-orange-500" />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            ¿Por qué elegir <span className="text-orange-600">Lovilike</span>?
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Somos más que una tienda de productos personalizados. Somos tus compañeros 
            en la creación de momentos inolvidables y recuerdos que durarán para siempre.
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {reasons.map((reason) => (
            <Card 
              key={reason.id}
              className={`group p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer bg-gradient-to-br ${reason.bgGradient} border-0 relative overflow-hidden`}
              onMouseEnter={() => setHoveredCard(reason.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 right-4 text-6xl">
                  {reason.icon}
                </div>
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl ${reason.color} bg-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {reason.icon}
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                  {reason.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 leading-relaxed mb-4 group-hover:text-gray-700 transition-colors">
                  {reason.description}
                </p>
                
                {/* Stats */}
                {reason.stats && (
                  <div className={`inline-flex items-center gap-2 ${reason.color} font-semibold text-sm bg-white px-3 py-1 rounded-full`}>
                    <Sparkles className="w-4 h-4" />
                    {reason.stats}
                  </div>
                )}
                
                {/* Hover Effect */}
                {hoveredCard === reason.id && (
                  <div className="absolute bottom-4 right-4 text-gray-400 group-hover:text-gray-600 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-12 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute top-8 right-8 w-12 h-12 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-6 left-1/3 w-8 h-8 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold text-sm uppercase tracking-wider">
                Únete a Nuestra Familia
              </span>
              <CheckCircle className="w-6 h-6" />
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              ¿Listo para crear algo especial?
            </h3>
            
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Miles de clientes ya han confiado en nosotros para sus momentos más importantes. 
              Ahora es tu turno de crear recuerdos inolvidables.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Explorar Productos
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 rounded-full font-semibold backdrop-blur-sm bg-white/10 transition-all duration-300"
              >
                Contactar Ahora
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}