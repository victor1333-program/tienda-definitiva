import React, { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface WishlistButtonProps {
  productId: string
  variant?: 'default' | 'large'
  className?: string
}

export function WishlistButton({ 
  productId, 
  variant = 'default',
  className 
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkWishlistStatus()
  }, [productId])

  const checkWishlistStatus = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setIsInWishlist(wishlist.includes(productId))
  }

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsLoading(true)
    
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
      
      if (isInWishlist) {
        const updatedWishlist = wishlist.filter((id: string) => id !== productId)
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
        setIsInWishlist(false)
        toast.success('Eliminado de favoritos')
      } else {
        const updatedWishlist = [...wishlist, productId]
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
        setIsInWishlist(true)
        toast.success('Añadido a favoritos')
      }
      
      // Dispatch custom event for wishlist updates
      window.dispatchEvent(new CustomEvent('wishlistUpdated'))
      
    } catch (error) {
      toast.error('Error al actualizar favoritos')
    } finally {
      setIsLoading(false)
    }
  }

  const buttonSize = variant === 'large' ? 'w-12 h-12' : 'w-10 h-10'
  const iconSize = variant === 'large' ? 'w-6 h-6' : 'w-4 h-4'

  return (
    <button
      onClick={toggleWishlist}
      disabled={isLoading}
      className={cn(
        buttonSize,
        'rounded-full flex items-center justify-center transition-all duration-200',
        'border-2 shadow-lg hover:scale-110 active:scale-95',
        isInWishlist 
          ? 'bg-red-500 border-red-500 text-white hover:bg-red-600' 
          : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500',
        isLoading && 'opacity-50 cursor-not-allowed',
        className
      )}
      title={isInWishlist ? 'Eliminar de favoritos' : 'Añadir a favoritos'}
    >
      <Heart 
        className={cn(
          iconSize,
          'transition-all duration-200',
          isInWishlist ? 'fill-current' : ''
        )} 
      />
    </button>
  )
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([])

  useEffect(() => {
    // Load wishlist from localStorage
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setWishlist(savedWishlist)

    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      const updatedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
      setWishlist(updatedWishlist)
    }

    window.addEventListener('wishlistUpdated', handleWishlistUpdate)
    
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate)
    }
  }, [])

  return {
    wishlist,
    isInWishlist: (productId: string) => wishlist.includes(productId),
    getWishlistCount: () => wishlist.length
  }
}