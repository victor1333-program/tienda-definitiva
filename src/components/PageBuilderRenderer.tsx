"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Import module components
import HeroBannerModule from "@/components/modules/HeroBannerModule"
import FeaturedCategoriesModule from "@/components/modules/FeaturedCategoriesModule"
import FeaturedProductsModule from "@/components/modules/FeaturedProductsModule"
import TestimonialsModule from "@/components/modules/TestimonialsModule"
import RichTextModule from "@/components/modules/RichTextModule"
import NewsletterModule from "@/components/modules/NewsletterModule"
import ContactFormModule from "@/components/modules/ContactFormModule"
import GalleryModule from "@/components/modules/GalleryModule"

// Module type definitions
interface BaseModule {
  id: string
  type: string
  isVisible: boolean
  order: number
}

interface HeroBannerModule extends BaseModule {
  type: 'hero-banner'
  properties: {
    backgroundImage: string
    title: string
    subtitle: string
    buttonText: string
    buttonLink: string
    height: 'small' | 'medium' | 'large' | 'full'
    textAlign: 'left' | 'center' | 'right'
    overlay: number
    textColor?: string
    buttonStyle?: 'primary' | 'secondary' | 'outline'
    showButton?: boolean
  }
}

interface FeaturedCategoriesModule extends BaseModule {
  type: 'featured-categories'
  properties: {
    title: string
    subtitle: string
    categories: string[]
    columns: 2 | 3 | 4
    showDescription: boolean
    style: 'cards' | 'overlay' | 'minimal'
    maxCategories?: number
  }
}

interface FeaturedProductsModule extends BaseModule {
  type: 'featured-products'
  properties: {
    title: string
    subtitle: string
    productIds: string[]
    layout: 'carousel' | 'grid'
    itemsPerRow: 2 | 3 | 4 | 5
    showPrice: boolean
    showAddToCart: boolean
    showRating?: boolean
    maxProducts?: number
    sortBy?: 'manual' | 'price-asc' | 'price-desc' | 'name'
  }
}

interface TestimonialsModule extends BaseModule {
  type: 'testimonials'
  properties: {
    title: string
    subtitle: string
    testimonials: Array<{
      id: string
      name: string
      role: string
      company: string
      avatar: string
      rating: number
      content: string
    }>
    layout: 'cards' | 'carousel' | 'masonry'
    showRating: boolean
    showAvatar: boolean
    columns: 1 | 2 | 3
    maxTestimonials?: number
  }
}

interface RichTextModule extends BaseModule {
  type: 'rich-text'
  properties: {
    content: string
    width: 'narrow' | 'normal' | 'wide' | 'full'
    textAlign: 'left' | 'center' | 'right'
    padding: 'none' | 'small' | 'medium' | 'large'
    backgroundColor?: string
  }
}

interface NewsletterModule extends BaseModule {
  type: 'newsletter'
  properties: {
    title: string
    subtitle: string
    placeholder: string
    buttonText: string
    successMessage: string
    backgroundColor?: string
    style: 'simple' | 'centered' | 'split'
    includePrivacyText: boolean
  }
}

interface ContactFormModule extends BaseModule {
  type: 'contact-form'
  properties: {
    title: string
    subtitle: string
    layout: 'form-only' | 'form-with-info' | 'split'
    contactInfo?: {
      email: string
      phone: string
      address: string
    }
    showMap: boolean
    mapUrl?: string
    requiredFields: string[]
  }
}

interface GalleryModule extends BaseModule {
  type: 'gallery'
  properties: {
    title: string
    subtitle: string
    images: Array<{
      id: string
      src: string
      alt: string
      title?: string
      category?: string
    }>
    layout: 'grid' | 'masonry' | 'carousel'
    columns: 2 | 3 | 4 | 5
    showCategories: boolean
    enableLightbox: boolean
    aspectRatio: 'square' | 'portrait' | 'landscape' | 'auto'
    gap: 'small' | 'medium' | 'large'
  }
}

type PageModule = 
  | HeroBannerModule 
  | FeaturedCategoriesModule 
  | FeaturedProductsModule 
  | TestimonialsModule 
  | RichTextModule 
  | NewsletterModule 
  | ContactFormModule 
  | GalleryModule

interface PageBuilderRendererProps {
  pageId?: string // Si no se proporciona, se usa la página principal
}

export default function PageBuilderRenderer({ pageId = 'homepage' }: PageBuilderRendererProps) {
  const [modules, setModules] = useState<PageModule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        console.log('🌐 PageBuilderRenderer: Fetching page data for', pageId)
        
        // Obtener configuración desde la API
        const response = await fetch('/api/content/pages/homepage')
        
        if (!response.ok) {
          throw new Error('Failed to fetch page data')
        }
        
        const data = await response.json()
        console.log('📥 PageBuilderRenderer: Received data:', data)
        
        if (data.success && data.data && data.data.modules) {
          // Convertir módulos del formato PageBuilder al formato PageBuilderRenderer
          const convertedModules: PageModule[] = data.data.modules.map((module: any) => ({
            id: module.id,
            type: module.type,
            isVisible: module.isVisible,
            order: module.order,
            properties: module.props // props -> properties
          }))
          
          console.log('🔄 PageBuilderRenderer: Converted modules:', convertedModules)
          setModules(convertedModules)
        } else {
          console.log('📭 PageBuilderRenderer: No modules found, using empty array')
          setModules([])
        }
      } catch (error) {
        console.error('💥 PageBuilderRenderer: Error fetching page data:', error)
        setError('Error al cargar la página')
      } finally {
        setLoading(false)
      }
    }

    fetchPageData()
  }, [pageId])

  const renderModule = (module: PageModule) => {
    console.log('🎨 PageBuilderRenderer: Rendering module:', module)
    
    if (!module.isVisible) {
      console.log('🚫 PageBuilderRenderer: Module not visible, skipping:', module.id)
      return null
    }

    switch (module.type) {
      case 'hero-banner':
        return (
          <HeroBannerModule
            key={module.id}
            {...module.properties}
          />
        )
      
      case 'featured-categories':
        return (
          <FeaturedCategoriesModule
            key={module.id}
            {...module.properties}
          />
        )
      
      case 'featured-products':
        return (
          <FeaturedProductsModule
            key={module.id}
            {...module.properties}
          />
        )
      
      case 'testimonials':
        return (
          <TestimonialsModule
            key={module.id}
            {...module.properties}
          />
        )
      
      case 'rich-text':
        return (
          <RichTextModule
            key={module.id}
            {...module.properties}
          />
        )
      
      case 'newsletter':
        return (
          <NewsletterModule
            key={module.id}
            {...module.properties}
          />
        )
      
      case 'contact-form':
        return (
          <ContactFormModule
            key={module.id}
            {...module.properties}
          />
        )
      
      case 'gallery':
        return (
          <GalleryModule
            key={module.id}
            {...module.properties}
          />
        )
      
      case 'top-sellers':
        console.log('🎯 PageBuilderRenderer: Rendering top-sellers (using FeaturedProductsModule)')
        return (
          <FeaturedProductsModule
            key={module.id}
            {...module.properties}
          />
        )
      
      case 'why-choose-us':
        console.log('🏆 PageBuilderRenderer: Rendering why-choose-us (placeholder)')
        return (
          <div key={module.id} className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-8 rounded-lg my-8">
            <h2 className="text-2xl font-bold mb-4">{module.properties.title || 'Por qué elegirnos'}</h2>
            <p className="text-lg">{module.properties.subtitle || 'Próximamente: módulo de ventajas competitivas'}</p>
          </div>
        )
      
      case 'video-section':
        console.log('🎬 PageBuilderRenderer: Rendering video-section (placeholder)')
        return (
          <div key={module.id} className="bg-gray-50 border border-gray-200 text-gray-700 px-6 py-8 rounded-lg my-8">
            <h2 className="text-2xl font-bold mb-4">{module.properties.title || 'Video Promocional'}</h2>
            <p className="text-lg">{module.properties.subtitle || 'Próximamente: módulo de video embebido'}</p>
          </div>
        )
      
      case 'contact-info':
        console.log('📍 PageBuilderRenderer: Rendering contact-info (using ContactFormModule)')
        return (
          <ContactFormModule
            key={module.id}
            {...module.properties}
          />
        )
      
      default:
        console.warn(`🚨 PageBuilderRenderer: Unknown module type: ${module.type}`)
        console.warn('🚨 PageBuilderRenderer: Module data:', module)
        return (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded my-4">
            <strong>Módulo desconocido:</strong> {module.type}
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // Ordenar módulos por orden
  const sortedModules = [...modules].sort((a, b) => a.order - b.order)

  return (
    <div className="w-full">
      {sortedModules.map(renderModule)}
    </div>
  )
}