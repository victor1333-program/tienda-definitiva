"use client"

import { useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"

interface GalleryImage {
  id: string
  src: string
  alt: string
  title?: string
  category?: string
}

interface GalleryProps {
  title: string
  subtitle: string
  images: GalleryImage[]
  layout: 'grid' | 'masonry' | 'carousel'
  columns: 2 | 3 | 4 | 5
  showCategories: boolean
  enableLightbox: boolean
  aspectRatio: 'square' | 'portrait' | 'landscape' | 'auto'
  gap: 'small' | 'medium' | 'large'
}

export default function GalleryModule(props: GalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [lightboxImage, setLightboxImage] = useState<number | null>(null)

  // Filtrar imágenes por categoría
  const filteredImages = selectedCategory === 'all' 
    ? props.images 
    : props.images.filter(img => img.category === selectedCategory)

  // Obtener categorías únicas
  const categories = ['all', ...Array.from(new Set(props.images.map(img => img.category).filter(Boolean)))]

  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
  }

  const gapClasses = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6'
  }

  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    auto: ''
  }

  const openLightbox = (index: number) => {
    if (props.enableLightbox) {
      setLightboxImage(index)
    }
  }

  const closeLightbox = () => {
    setLightboxImage(null)
  }

  const nextImage = () => {
    if (lightboxImage !== null) {
      setLightboxImage((lightboxImage + 1) % filteredImages.length)
    }
  }

  const prevImage = () => {
    if (lightboxImage !== null) {
      setLightboxImage(lightboxImage === 0 ? filteredImages.length - 1 : lightboxImage - 1)
    }
  }

  if (!filteredImages.length) {
    return null
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {props.title}
          </h2>
          {props.subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              {props.subtitle}
            </p>
          )}

          {/* Category Filter */}
          {props.showCategories && categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'Todas' : category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gallery */}
        {props.layout === 'carousel' ? (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className="flex-none w-80 snap-start group cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <div className={`relative overflow-hidden rounded-lg ${aspectClasses[props.aspectRatio]}`}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {props.enableLightbox && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
                {image.title && (
                  <p className="mt-2 text-sm font-medium text-gray-900">{image.title}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid ${gridClasses[props.columns]} ${gapClasses[props.gap]}`}>
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className="group cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <div className={`relative overflow-hidden rounded-lg ${aspectClasses[props.aspectRatio]}`}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {props.enableLightbox && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
                {image.title && (
                  <p className="mt-2 text-sm font-medium text-gray-900">{image.title}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {props.enableLightbox && lightboxImage !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <div className="relative max-w-4xl max-h-full p-4">
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation buttons */}
              {filteredImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image */}
              <div className="relative w-full h-full">
                <Image
                  src={filteredImages[lightboxImage].src}
                  alt={filteredImages[lightboxImage].alt}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Image info */}
              {filteredImages[lightboxImage].title && (
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-white text-lg font-medium">
                    {filteredImages[lightboxImage].title}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {lightboxImage + 1} de {filteredImages.length}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}