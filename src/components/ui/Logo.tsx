import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  textClassName?: string
  showTagline?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ 
  className, 
  textClassName, 
  showTagline = true, 
  size = 'md' 
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl'
  }

  const taglineSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  }

  return (
    <Link href="/" className={cn("group flex items-center hover:scale-105 transition-all duration-300", className)}>
      <div className="relative">
        {/* Logo Principal con mejor contraste */}
        <div className={cn(
          "font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent group-hover:from-primary-600 group-hover:to-secondary-600 transition-all duration-300 drop-shadow-lg",
          sizeClasses[size],
          textClassName
        )}>
          Lovilike
        </div>
        {/* Línea decorativa */}
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      </div>
      {showTagline && (
        <div className={cn(
          "ml-3 font-bold text-gray-800 group-hover:text-primary-600 transition-colors drop-shadow-sm",
          taglineSizeClasses[size]
        )}>
          ✨ Personalizados
        </div>
      )}
    </Link>
  )
}

// Logo para header con fondo de color
export function HeaderLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center hover:scale-105 transition-all duration-300", className)}>
      <div className="relative flex items-center">
        {/* Logo imagen real */}
        <img 
          src="/Social Logo.png" 
          alt="Lovilike Personalizados" 
          className="h-32 w-auto group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
        />
      </div>
    </Link>
  )
}

// Logo sin Link para usar dentro de otros Links
export function HeaderLogoImage({ className }: { className?: string }) {
  return (
    <div className="relative flex items-center">
      {/* Logo imagen real */}
      <img 
        src="/Social Logo.png" 
        alt="Lovilike Personalizados" 
        className={cn("h-32 w-auto group-hover:scale-110 transition-transform duration-300 drop-shadow-lg", className)}
      />
    </div>
  )
}