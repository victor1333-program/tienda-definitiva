"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Grid3X3 } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  image?: string
  description?: string
}

interface FeaturedCategoriesProps {
  title: string
  subtitle: string
  categories: string[] // Array de IDs de categorías
  columns: 2 | 3 | 4
  showDescription: boolean
  style: 'cards' | 'overlay' | 'minimal'
  maxCategories?: number
}

export default function FeaturedCategoriesModule(props: FeaturedCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const allCategories = await response.json()
          const selectedCategories = allCategories.filter((cat: Category) => 
            props.categories.includes(cat.id)
          )
          setCategories(selectedCategories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    if (props.categories.length > 0) {
      fetchCategories()
    } else {
      setLoading(false)
    }
  }, [props.categories])

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-8"></div>
            <div className={`grid gap-6 ${
              props.columns === 2 ? 'grid-cols-2' :
              props.columns === 3 ? 'grid-cols-3' :
              'grid-cols-4'
            }`}>
              {[...Array(props.columns * 2)].map((_, i) => (
                <div key={i} className="bg-gray-300 aspect-square rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!categories.length) {
    return null
  }

  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  const displayedCategories = categories.slice(0, props.maxCategories || 8)

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {props.title}
          </h2>
          {props.subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {props.subtitle}
            </p>
          )}
        </div>

        {/* Categories Grid */}
        <div className={`grid gap-6 ${gridClasses[props.columns]}`}>
          {displayedCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categoria/${category.slug}`}
              className="group block"
            >
              {props.style === 'cards' ? (
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:transform group-hover:scale-105">
                  <div className="aspect-square overflow-hidden">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                        <Grid3X3 className="w-16 h-16 text-orange-500" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    {props.showDescription && category.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              ) : props.style === 'overlay' ? (
                <div className="relative aspect-square overflow-hidden rounded-xl group-hover:transform group-hover:scale-105 transition-all duration-300">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200"></div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
                    <div className="p-6 text-white">
                      <h3 className="text-xl font-semibold mb-2">
                        {category.name}
                      </h3>
                      {props.showDescription && category.description && (
                        <p className="text-sm opacity-90 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Minimal style
                <div className="text-center group-hover:transform group-hover:scale-105 transition-all duration-300">
                  <div className="aspect-square overflow-hidden rounded-xl mb-4">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                        <Grid3X3 className="w-12 h-12 text-orange-500" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  {props.showDescription && category.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}