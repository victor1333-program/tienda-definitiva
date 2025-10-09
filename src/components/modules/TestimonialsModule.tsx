"use client"

import Image from "next/image"
import { Star, Quote } from "lucide-react"

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  avatar: string
  rating: number
  content: string
}

interface TestimonialsProps {
  title: string
  subtitle: string
  testimonials: Testimonial[]
  layout: 'cards' | 'carousel' | 'masonry'
  showRating: boolean
  showAvatar: boolean
  columns: 1 | 2 | 3
  maxTestimonials?: number
}

export default function TestimonialsModule(props: TestimonialsProps) {
  const displayedTestimonials = props.testimonials.slice(0, props.maxTestimonials || 6)

  if (!displayedTestimonials.length) {
    return null
  }

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
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
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {props.subtitle}
            </p>
          )}
        </div>

        {/* Testimonials */}
        <div className={`${
          props.layout === 'carousel' 
            ? 'flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory'
            : `grid gap-6 ${gridClasses[props.columns]}`
        }`}>
          {displayedTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`group ${
                props.layout === 'carousel' ? 'flex-none w-80 snap-start' : ''
              }`}
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 h-full">
                {/* Quote icon */}
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-orange-500 opacity-50" />
                </div>

                {/* Content */}
                <blockquote className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                {/* Rating */}
                {props.showRating && (
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${
                          star <= testimonial.rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  {props.showAvatar && testimonial.avatar && (
                    <div className="flex-shrink-0">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">
                      {testimonial.role}{testimonial.company && ` en ${testimonial.company}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show more button for cards layout */}
        {props.layout === 'cards' && props.testimonials.length > (props.maxTestimonials || 6) && (
          <div className="text-center mt-12">
            <button className="inline-flex items-center px-6 py-3 text-lg font-semibold text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              Ver Más Testimonios
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}