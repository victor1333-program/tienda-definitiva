'use client'

import { useState, useEffect } from 'react'
import { Star, Quote, ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface Testimonial {
  id: number
  name: string
  location: string
  avatar: string
  rating: number
  text: string
  event: string
  productType: string
  date: string
  verified: boolean
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'María García',
    location: 'Madrid, España',
    avatar: 'MG',
    rating: 5,
    text: 'Quedé absolutamente enamorada del resultado. Las tazas personalizadas para mi boda fueron perfectas, cada detalle cuidado al máximo. Mis invitados no paraban de comentar lo bonitas que eran. Sin duda volveré a comprar aquí.',
    event: 'Boda',
    productType: 'Tazas personalizadas',
    date: '2024-02-15',
    verified: true
  },
  {
    id: 2,
    name: 'Carlos Ruiz',
    location: 'Barcelona, España',
    avatar: 'CR',
    rating: 5,
    text: 'El servicio al cliente es excepcional. Me ayudaron con el diseño de las camisetas para el baby shower de mi hermana y el resultado superó todas nuestras expectativas. La calidad del textil es increíble.',
    event: 'Baby Shower',
    productType: 'Camisetas personalizadas',
    date: '2024-01-28',
    verified: true
  },
  {
    id: 3,
    name: 'Ana Martínez',
    location: 'Sevilla, España',
    avatar: 'AM',
    rating: 5,
    text: 'Los marcapáginas para la Primera Comunión de mi hijo fueron un éxito total. Todos los invitados preguntaban dónde los habíamos encargado. La entrega fue súper rápida y el empaquetado perfecto.',
    event: 'Primera Comunión',
    productType: 'Marcapáginas',
    date: '2024-03-10',
    verified: true
  },
  {
    id: 4,
    name: 'Roberto Silva',
    location: 'Valencia, España',
    avatar: 'RS',
    rating: 5,
    text: 'Increíble experiencia de principio a fin. Necesitaba un regalo único para mi novia y el puzzle personalizado con nuestra foto favorita fue perfecto. Ella lloró de emoción cuando lo vio.',
    event: 'Regalo especial',
    productType: 'Puzzle personalizado',
    date: '2024-02-28',
    verified: true
  },
  {
    id: 5,
    name: 'Laura Fernández',
    location: 'Bilbao, España',
    avatar: 'LF',
    rating: 5,
    text: 'Ya es la tercera vez que compro aquí y siempre quedo sorprendida por la calidad y atención al detalle. Esta vez fueron imanes personalizados para el bautizo de mi sobrina. ¡Perfectos!',
    event: 'Bautizo',
    productType: 'Imanes personalizados',
    date: '2024-03-05',
    verified: true
  },
  {
    id: 6,
    name: 'Diego Morales',
    location: 'Málaga, España',
    avatar: 'DM',
    rating: 5,
    text: 'El proceso de personalización es muy fácil e intuitivo. Pude ver en tiempo real cómo quedaría mi diseño. Las sudaderas para mi equipo de fútbol quedaron espectaculares. Recomiendo 100%.',
    event: 'Evento deportivo',
    productType: 'Sudaderas personalizadas',
    date: '2024-01-20',
    verified: true
  }
]

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [itemsPerView, setItemsPerView] = useState(1)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3)
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2)
      } else {
        setItemsPerView(1)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = testimonials.length - itemsPerView
        return prev >= maxIndex ? 0 : prev + 1
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, itemsPerView])

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      const maxIndex = testimonials.length - itemsPerView
      return prev <= 0 ? maxIndex : prev - 1
    })
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const maxIndex = testimonials.length - itemsPerView
      return prev >= maxIndex ? 0 : prev + 1
    })
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    })
  }

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + itemsPerView)
  if (visibleTestimonials.length < itemsPerView) {
    visibleTestimonials.push(...testimonials.slice(0, itemsPerView - visibleTestimonials.length))
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-orange-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-orange-200 rounded-full opacity-10 animate-float"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-pink-200 rounded-full opacity-10 animate-float-delay"></div>
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-blue-200 rounded-full opacity-10 animate-float"></div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-orange-500" />
            <span className="text-orange-600 font-semibold text-sm uppercase tracking-wider">
              Testimonios Reales
            </span>
            <Heart className="w-6 h-6 text-orange-500" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Lo que dicen nuestros <span className="text-orange-600">Clientes</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Más de 50,000 clientes satisfechos han confiado en nosotros para sus momentos más especiales. 
            Estas son algunas de sus experiencias reales.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className={`flex transition-transform duration-500 ease-in-out gap-6`}
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
              }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3"
                >
                  <Card className="h-full p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 shadow-lg relative overflow-hidden">
                    {/* Background Quote */}
                    <div className="absolute top-4 right-4 opacity-5">
                      <Quote className="w-16 h-16 text-orange-500" />
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className="relative">
                          <div 
                            className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-lg"
                          >
                            {testimonial.avatar}
                          </div>
                          {testimonial.verified && (
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{testimonial.name}</h4>
                          <p className="text-sm text-gray-500 mb-2">{testimonial.location}</p>
                          <div className="flex gap-1 mb-2">
                            {renderStars(testimonial.rating)}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                              {testimonial.event}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {testimonial.productType}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Testimonial Text */}
                      <blockquote className="text-gray-700 leading-relaxed mb-4 italic">
                        "{testimonial.text}"
                      </blockquote>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{formatDate(testimonial.date)}</span>
                        {testimonial.verified && (
                          <span className="flex items-center gap-1 text-green-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Verificado
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-gray-50 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 z-10 group"
            aria-label="Testimonial anterior"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-orange-600 transition-colors" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-gray-50 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 z-10 group"
            aria-label="Testimonial siguiente"
          >
            <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-orange-600 transition-colors" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: testimonials.length - itemsPerView + 1 }, (_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setIsAutoPlaying(false)
                setTimeout(() => setIsAutoPlaying(true), 10000)
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-orange-500 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ir al grupo de testimonios ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">50K+</div>
            <div className="text-gray-600 font-medium">Clientes Felices</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">4.9</div>
            <div className="text-gray-600 font-medium">Valoración Media</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">99%</div>
            <div className="text-gray-600 font-medium">Satisfacción</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">24h</div>
            <div className="text-gray-600 font-medium">Tiempo Respuesta</div>
          </div>
        </div>
      </div>
    </section>
  )
}