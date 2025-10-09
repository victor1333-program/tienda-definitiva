"use client"

import { sanitizeHTML } from '@/lib/html-sanitizer'

interface RichTextProps {
  content: string
  width: 'narrow' | 'normal' | 'wide' | 'full'
  textAlign: 'left' | 'center' | 'right'
  padding: 'none' | 'small' | 'medium' | 'large'
  backgroundColor?: string
}

export default function RichTextModule(props: RichTextProps) {
  const widthClasses = {
    narrow: 'max-w-2xl',
    normal: 'max-w-4xl',
    wide: 'max-w-6xl',
    full: 'max-w-none'
  }

  const textAlignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const paddingClasses = {
    none: 'py-0',
    small: 'py-8',
    medium: 'py-16',
    large: 'py-24'
  }

  return (
    <section 
      className={`px-4 sm:px-6 lg:px-8 ${paddingClasses[props.padding]}`}
      style={{ backgroundColor: props.backgroundColor || 'transparent' }}
    >
      <div className={`mx-auto ${widthClasses[props.width]} ${textAlignClasses[props.textAlign]}`}>
        <div 
          className="prose prose-lg prose-orange max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(props.content) }}
        />
      </div>
    </section>
  )
}