import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  price?: number
  currency?: string
  availability?: 'instock' | 'outofstock' | 'preorder'
}

export function generateSEO({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  price,
  currency = 'EUR',
  availability
}: SEOProps): Metadata {
  const siteName = 'Lovilike Personalizados'
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lovilike.es'
  
  const fullTitle = title ? `${title} | ${siteName}` : siteName
  const fullDescription = description || 'Los mejores productos personalizados en Hellín, Albacete. DTF, sublimación y corte láser con la mejor calidad.'
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const fullImage = image ? `${baseUrl}${image}` : `${baseUrl}/og-image.jpg`

  const metadata: Metadata = {
    title: fullTitle,
    description: fullDescription,
    keywords: [
      'personalización',
      'DTF',
      'sublimación',
      'corte láser',
      'camisetas personalizadas',
      'regalos personalizados',
      'Hellín',
      'Albacete',
      'Lovilike',
      ...keywords
    ].join(', '),
    
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: fullUrl,
      siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title || siteName
        }
      ],
      locale: 'es_ES',
      type
    },
    
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [fullImage],
      creator: '@lovilike'
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    
    alternates: {
      canonical: fullUrl
    }
  }

  // Add structured data for products
  if (type === 'product' && price) {
    metadata.other = {
      'product:price:amount': price.toString(),
      'product:price:currency': currency,
      'product:availability': availability || 'instock'
    }
  }

  return metadata
}

export function generateProductSEO(product: {
  id: string
  name: string
  description: string
  basePrice: number
  images: string[]
  category: { name: string }
  isCustomizable?: boolean
  variants?: Array<{ stock: number }>
}) {
  const inStock = product.variants?.some(v => v.stock > 0) !== false
  
  return generateSEO({
    title: product.name,
    description: `${product.description} - ${product.category.name} personalizado en Lovilike. Desde ${product.basePrice}€`,
    keywords: [
      product.name.toLowerCase(),
      product.category.name.toLowerCase(),
      product.isCustomizable ? 'personalizable' : '',
      'calidad premium',
      'envío rápido'
    ].filter(Boolean),
    image: product.images[0],
    url: `/productos/${product.id}`,
    type: 'product',
    price: product.basePrice,
    availability: inStock ? 'instock' : 'outofstock'
  })
}

export function generateCategorySEO(category: {
  name: string
  slug: string
  description?: string
  productCount?: number
}) {
  return generateSEO({
    title: `${category.name} Personalizados`,
    description: category.description || `Descubre nuestra colección de ${category.name.toLowerCase()} personalizados. ${category.productCount ? `${category.productCount} productos disponibles.` : ''} Calidad premium y entrega rápida.`,
    keywords: [
      category.name.toLowerCase(),
      'personalizado',
      'calidad premium',
      category.slug
    ],
    url: `/categoria/${category.slug}`
  })
}

// JSON-LD Structured Data
export function generateProductJsonLd(product: {
  id: string
  name: string
  description: string
  basePrice: number
  images: string[]
  category: { name: string }
  rating?: number
  reviewCount?: number
  variants?: Array<{ 
    id: string
    name: string
    price: number
    stock: number
    sku?: string
  }>
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lovilike.es'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map(img => `${baseUrl}${img}`),
    category: product.category.name,
    brand: {
      '@type': 'Brand',
      name: 'Lovilike Personalizados'
    },
    offers: product.variants?.map(variant => ({
      '@type': 'Offer',
      name: variant.name,
      price: variant.price,
      priceCurrency: 'EUR',
      availability: variant.stock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      sku: variant.sku || variant.id,
      url: `${baseUrl}/productos/${product.id}`
    })) || [{
      '@type': 'Offer',
      price: product.basePrice,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/productos/${product.id}`
    }],
    aggregateRating: product.rating && product.reviewCount ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1
    } : undefined
  }
}

export function generateBreadcrumbJsonLd(items: Array<{
  name: string
  url: string
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lovilike.es'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`
    }))
  }
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Lovilike Personalizados',
    url: 'https://lovilike.es',
    logo: 'https://lovilike.es/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+34-611-066-997',
      contactType: 'customer service',
      availableLanguage: 'Spanish'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hellín',
      addressRegion: 'Albacete',
      addressCountry: 'ES'
    },
    sameAs: [
      'https://www.instagram.com/lovilike',
      'https://www.facebook.com/lovilike'
    ]
  }
}