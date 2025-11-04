"use client"

import { useState, useEffect } from "react"
import { X, Minus, Plus, Shirt } from "lucide-react"
import SizeTable, { SizeTableData } from "@/components/ui/SizeTable"

interface Variant {
  id: string
  sku: string
  size: string
  colorName: string
  colorHex: string
  stock: number
  price: number
  width: number
  height: number
}

interface SizeQuantityModalProps {
  isOpen: boolean
  onClose: () => void
  variants: Variant[]
  productName: string
  basePrice: number
  productStock?: number // Stock principal del producto (para productos sin variantes)
  productId?: string // ID del producto (para productos sin variantes)
  onAddToCart: (selectedItems: Array<{ variantId?: string; quantity: number; size: string; price: number }>) => void
}

export default function SizeQuantityModal({
  isOpen,
  onClose,
  variants,
  productName,
  basePrice,
  productStock = 0,
  productId,
  onAddToCart
}: SizeQuantityModalProps) {
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({})
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [simpleQuantity, setSimpleQuantity] = useState(1) // Para productos sin variantes

  // Detectar si el producto tiene variantes con tallas
  const hasVariants = variants && variants.length > 0

  // Reset quantities when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedQuantities({})
      setShowSizeGuide(false)
      setSimpleQuantity(1)
    }
  }, [isOpen])

  if (!isOpen) return null

  // Si no hay variantes, mostrar un selector simple
  if (!hasVariants) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Elegir cantidad
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Cantidad
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSimpleQuantity(Math.max(1, simpleQuantity - 1))}
                  disabled={simpleQuantity <= 1}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    simpleQuantity <= 1
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Minus className="w-5 h-5" />
                </button>

                <span className="text-2xl font-semibold w-16 text-center">
                  {simpleQuantity}
                </span>

                <button
                  onClick={() => setSimpleQuantity(Math.min(productStock, simpleQuantity + 1))}
                  disabled={simpleQuantity >= productStock}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    simpleQuantity >= productStock
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {productStock} disponibles
              </p>
            </div>

            {/* Summary */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-gray-900">
                  €{(basePrice * simpleQuantity).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Add to cart button */}
            <button
              onClick={() => {
                onAddToCart([{
                  variantId: undefined,
                  quantity: simpleQuantity,
                  size: 'Estándar',
                  price: basePrice
                }])
                onClose()
              }}
              disabled={productStock <= 0}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                productStock <= 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {productStock <= 0 ? 'Sin stock' : 'Añadir a la cesta'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Group variants by size
  const sizeGroups = variants.reduce((acc, variant) => {
    if (!acc[variant.size]) {
      acc[variant.size] = []
    }
    acc[variant.size].push(variant)
    return acc
  }, {} as Record<string, Variant[]>)

  // Get unique sizes and sort them
  const sizes = Object.keys(sizeGroups).sort((a, b) => {
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
    const aIndex = sizeOrder.indexOf(a)
    const bIndex = sizeOrder.indexOf(b)
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    return a.localeCompare(b)
  })

  const updateQuantity = (size: string, change: number) => {
    const currentQuantity = selectedQuantities[size] || 0
    const newQuantity = Math.max(0, currentQuantity + change)
    
    // Check stock availability
    const sizeVariants = sizeGroups[size]
    const maxStock = Math.max(...sizeVariants.map(v => v.stock))
    
    if (newQuantity <= maxStock) {
      setSelectedQuantities(prev => ({
        ...prev,
        [size]: newQuantity
      }))
    }
  }

  const getTotalItems = () => {
    return Object.values(selectedQuantities).reduce((total, quantity) => total + quantity, 0)
  }

  const getTotalPrice = () => {
    return Object.entries(selectedQuantities).reduce((total, [size, quantity]) => {
      if (quantity > 0) {
        const sizeVariants = sizeGroups[size]
        const variantPrice = sizeVariants[0]?.price || basePrice
        return total + (variantPrice * quantity)
      }
      return total
    }, 0)
  }

  const handleAddToCart = () => {
    const selectedItems = Object.entries(selectedQuantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([size, quantity]) => {
        const sizeVariants = sizeGroups[size]
        const variant = sizeVariants[0] // Take first variant for the size
        return {
          variantId: variant.id,
          quantity,
          size,
          price: variant.price || basePrice
        }
      })

    if (selectedItems.length > 0) {
      onAddToCart(selectedItems)
      onClose()
    }
  }

  // Create size table data for the guide
  const sizeTableData: SizeTableData = {
    groupName: "Camisetas",
    sizes: sizes.map(size => {
      const sizeVariants = sizeGroups[size]
      const variant = sizeVariants[0]
      return {
        name: size,
        width: variant?.width,
        length: variant?.height
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Elegir talla y cantidad
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Size guide toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowSizeGuide(!showSizeGuide)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Shirt className="w-4 h-4" />
              {showSizeGuide ? 'Ocultar' : 'Ver'} guía de tallas
            </button>
          </div>

          {/* Size guide */}
          {showSizeGuide && (
            <div className="mb-6">
              <SizeTable data={sizeTableData} />
            </div>
          )}

          {/* Size selection */}
          <div className="space-y-3 mb-6">
            {sizes.map(size => {
              const sizeVariants = sizeGroups[size]
              const maxStock = Math.max(...sizeVariants.map(v => v.stock))
              const currentQuantity = selectedQuantities[size] || 0
              const isOutOfStock = maxStock === 0

              return (
                <div
                  key={size}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    isOutOfStock 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-medium ${isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>
                      {size}
                    </span>
                    {isOutOfStock && (
                      <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                        Sin stock
                      </span>
                    )}
                    {maxStock > 0 && maxStock <= 5 && (
                      <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded">
                        Solo {maxStock} disponibles
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(size, -1)}
                      disabled={isOutOfStock || currentQuantity === 0}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                        isOutOfStock || currentQuantity === 0
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-8 text-center font-medium">
                      {currentQuantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(size, 1)}
                      disabled={isOutOfStock || currentQuantity >= maxStock}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                        isOutOfStock || currentQuantity >= maxStock
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Artículos:</span>
              <span className="font-medium">{getTotalItems()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-gray-900">
                €{getTotalPrice().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={getTotalItems() === 0}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              getTotalItems() === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {getTotalItems() === 0 ? 'Selecciona cantidad' : 'Añadir a la cesta'}
          </button>
        </div>
      </div>
    </div>
  )
}