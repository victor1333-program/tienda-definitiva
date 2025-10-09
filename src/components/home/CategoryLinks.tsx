'use client'

import { useState, memo, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Users, Baby, Heart, Shirt, Gift, Camera } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  icon: React.ReactNode
  color: string
  bgGradient: string
  textColor: string
  productCount: number
  isPopular?: boolean
}

const categories: Category[] = [
  {
    id: '1',
    name: 'Bodas',
    slug: 'bodas',
    description: 'Detalles únicos para el día más especial',
    image: '/images/categories/bodas-category.jpg',
    icon: <Heart className="w-6 h-6" />,
    color: 'bg-pink-500',
    bgGradient: 'from-pink-500 to-rose-600',
    textColor: 'text-pink-600',
    productCount: 247,
    isPopular: true
  },
  {
    id: '2',
    name: 'Baby Shower',
    slug: 'baby-shower',
    description: 'Celebra la llegada del bebé con estilo',
    image: '/images/categories/baby-shower-category.jpg',
    icon: <Baby className="w-6 h-6" />,
    color: 'bg-blue-500',
    bgGradient: 'from-blue-500 to-cyan-600',
    textColor: 'text-blue-600',
    productCount: 189,
    isPopular: true
  },
  {
    id: '3',
    name: 'Comuniones',
    slug: 'comuniones',
    description: 'Recuerdos sagrados y especiales',
    image: '/images/categories/comuniones-category.jpg',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-purple-500',
    bgGradient: 'from-purple-500 to-indigo-600',
    textColor: 'text-purple-600',
    productCount: 156,
  },
  {
    id: '4',
    name: 'Textil Personalizado',
    slug: 'textil',
    description: 'Camisetas, hoodies y más con tu estilo',
    image: '/images/categories/textil-category.jpg',
    icon: <Shirt className="w-6 h-6" />,
    color: 'bg-orange-500',
    bgGradient: 'from-orange-500 to-red-600',
    textColor: 'text-orange-600',
    productCount: 312,
    isPopular: true
  },
  {
    id: '5',
    name: 'Regalos Únicos',
    slug: 'regalos',
    description: 'Para esos momentos que merecen algo especial',
    image: '/images/categories/regalos-category.jpg',
    icon: <Gift className="w-6 h-6" />,
    color: 'bg-green-500',
    bgGradient: 'from-green-500 to-emerald-600',
    textColor: 'text-green-600',
    productCount: 203,
  },
  {
    id: '6',
    name: 'Foto Regalos',
    slug: 'foto-regalos',
    description: 'Tus recuerdos convertidos en regalos',
    image: '/images/categories/foto-regalos-category.jpg',
    icon: <Camera className="w-6 h-6" />,
    color: 'bg-teal-500',
    bgGradient: 'from-teal-500 to-blue-600',
    textColor: 'text-teal-600',
    productCount: 178,
  }
]

const CategoryLinks = memo(function CategoryLinks() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  
  const categoriesWithStats = useMemo(() => 
    categories.map(cat => ({
      ...cat,
      isHovered: hoveredCategory === cat.id
    })), [hoveredCategory]
  )

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-orange-500"></div>
            <span className="text-orange-600 font-semibold text-sm uppercase tracking-wider">
              Explora Nuestras Categorías
            </span>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-orange-500"></div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Encuentra lo que <span className="text-orange-600">Buscas</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Descubre nuestra amplia gama de productos personalizados organizados por ocasiones especiales. 
            Cada categoría está cuidadosamente curada para hacer de tu evento algo único.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card 
                className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer relative h-80"
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-product.png'
                    }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.bgGradient} opacity-60 group-hover:opacity-70 transition-opacity duration-300`}></div>
                </div>

                {/* Popular Badge */}
                {category.isPopular && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      🔥 POPULAR
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between p-6 text-white">
                  {/* Top Section */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 group-hover:bg-white/30 transition-colors duration-300">
                        {category.icon}
                      </div>
                      <div className="text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        {category.productCount} productos
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-yellow-300 transition-colors duration-300">
                      {category.name}
                    </h3>
                    
                    <p className="text-white/90 leading-relaxed group-hover:text-white transition-colors duration-300">
                      {category.description}
                    </p>
                  </div>

                  {/* Bottom Section */}
                  <div className="flex items-center justify-between">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-white font-semibold">Explorar categoría</span>
                    </div>
                    
                    <div className={`bg-white/20 backdrop-blur-sm rounded-full p-2 group-hover:bg-white group-hover:text-gray-900 transition-all duration-300 ${
                      hoveredCategory === category.id ? 'translate-x-1' : ''
                    }`}>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-2xl p-8 border border-orange-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿No encuentras lo que buscas?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Tenemos muchas más categorías y productos. Explora nuestro catálogo completo 
              o contáctanos para crear algo completamente personalizado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/catalog">
                <div className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 inline-flex items-center gap-2">
                  Ver Catálogo Completo
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
              <Link href="/contact">
                <div className="border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 inline-flex items-center gap-2">
                  Proyecto Personalizado
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

export default CategoryLinks