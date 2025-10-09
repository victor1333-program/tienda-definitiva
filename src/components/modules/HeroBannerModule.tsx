"use client"

import Link from "next/link"
import Image from "next/image"

interface HeroBannerProps {
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

export default function HeroBannerModule(props: HeroBannerProps) {
  const heightClasses = {
    small: 'h-80',
    medium: 'h-96',
    large: 'h-[32rem]',
    full: 'h-screen'
  }

  const textAlignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const buttonStyleClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary', 
    outline: 'border-2 border-white text-white hover:bg-white hover:text-gray-900'
  }

  return (
    <section 
      className={`relative ${heightClasses[props.height]} overflow-hidden`}
    >
      {/* Background Image */}
      {props.backgroundImage && (
        <div className="absolute inset-0">
          <Image
            src={props.backgroundImage}
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Overlay */}
      {props.overlay > 0 && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: props.overlay }}
        />
      )}

      {/* Content */}
      <div className={`relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8`}>
        <div className={`max-w-4xl w-full ${textAlignClasses[props.textAlign]}`}>
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            style={{ color: props.textColor || '#ffffff' }}
          >
            {props.title}
          </h1>
          
          {props.subtitle && (
            <p 
              className="text-lg md:text-xl lg:text-2xl mb-8 opacity-90 max-w-3xl mx-auto"
              style={{ color: props.textColor || '#ffffff' }}
            >
              {props.subtitle}
            </p>
          )}

          {(props.showButton ?? true) && props.buttonText && props.buttonLink && (
            <div className={props.textAlign === 'center' ? 'flex justify-center' : props.textAlign === 'right' ? 'flex justify-end' : ''}>
              <Link 
                href={props.buttonLink}
                className={`
                  inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 hover:transform hover:scale-105
                  ${buttonStyleClasses[props.buttonStyle || 'primary']}
                `}
              >
                {props.buttonText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}