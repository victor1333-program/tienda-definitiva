'use client'

import { useState, useEffect, memo, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BannerSlide {
  id: number
  image: string
  title: string
  subtitle: string
  description: string
  ctaText: string
  ctaLink: string
  textColor: string
  overlay: string
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    image: '/images/categories/bodas-category.jpg',
    title: 'Bodas de Ensueño',
    subtitle: 'Personaliza cada detalle',
    description: 'Crea recuerdos únicos con nuestros productos personalizados para bodas',
    ctaText: 'Ver Productos de Bodas',
    ctaLink: '/categories/bodas',
    textColor: 'text-white',
    overlay: 'bg-gradient-to-r from-black/60 to-black/30'
  },
  {
    id: 2,
    image: '/images/categories/baby-shower-category.jpg',
    title: 'Baby Shower Mágico',
    subtitle: 'Celebra la llegada del bebé',
    description: 'Productos únicos y tiernos para celebrar la llegada de tu pequeño tesoro',
    ctaText: 'Descubrir Baby Shower',
    ctaLink: '/categories/baby-shower',
    textColor: 'text-white',
    overlay: 'bg-gradient-to-r from-pink-900/60 to-pink-700/30'
  },
  {
    id: 3,
    image: '/images/categories/comuniones-category.jpg',
    title: 'Comuniones Especiales',
    subtitle: 'Un día para recordar',
    description: 'Detalles personalizados que harán de su Primera Comunión un momento único',
    ctaText: 'Ver Comuniones',
    ctaLink: '/categories/comuniones',
    textColor: 'text-white',
    overlay: 'bg-gradient-to-r from-blue-900/60 to-blue-700/30'
  },
  {
    id: 4,
    image: '/images/categories/textil-category.jpg',
    title: 'Textil Personalizado',
    subtitle: 'Tu estilo, tu marca',
    description: 'Camisetas, hoodies y más textiles con tus diseños únicos',
    ctaText: 'Personalizar Textil',
    ctaLink: '/categories/textil',
    textColor: 'text-white',
    overlay: 'bg-gradient-to-r from-orange-900/60 to-orange-700/30'
  }
]

const HeroBanner = memo(function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [])

  const goToPrevious = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [])

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [])

  const slide = useMemo(() => bannerSlides[currentSlide], [currentSlide])

  return (
    <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0">
        {bannerSlides.map((bannerSlide, index) => (
          <div
            key={bannerSlide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={bannerSlide.image}
                alt={bannerSlide.title}
                fill
                className="object-cover"
                priority={index === 0}
                onError={(e) => {
                  // Fallback image
                  e.currentTarget.src = '/placeholder-product.png'
                }}
              />
              <div className={`absolute inset-0 ${bannerSlide.overlay}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-orange-400" />
                <span className="text-orange-400 font-medium text-sm uppercase tracking-wider">
                  {slide.subtitle}
                </span>
                <Sparkles className="w-5 h-5 text-orange-400" />
              </div>
              
              <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 ${slide.textColor} leading-tight`}>
                {slide.title}
              </h1>
              
              <p className={`text-lg md:text-xl mb-8 ${slide.textColor} opacity-90 max-w-2xl mx-auto leading-relaxed`}>
                {slide.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href={slide.ctaLink}>
                  <Button 
                    size="lg" 
                    className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    {slide.ctaText}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <Link href="/catalog">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-full backdrop-blur-sm bg-white/10 transition-all duration-300"
                  >
                    Ver Catálogo Completo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-300 group"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-300 group"
        aria-label="Slide siguiente"
      >
        <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-orange-400 scale-125' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-float hidden lg:block">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full opacity-20"></div>
      </div>
      <div className="absolute top-40 right-20 animate-float-delay hidden lg:block">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20"></div>
      </div>
      <div className="absolute bottom-32 left-20 animate-float hidden lg:block">
        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-400 rounded-full opacity-20"></div>
      </div>
    </section>
  )
})

export default HeroBanner