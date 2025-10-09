"use client"

import { X, Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import { useCartStore } from "@/lib/store"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
// import { StockReservationStatus } from "@/components/cart/StockReservationStatus"
import Link from "next/link"

export default function CartSidebar() {
  const { 
    items, 
    isOpen, 
    toggleCart, 
    removeItem, 
    updateQuantity, 
    getTotalPrice,
    clearCart 
  } = useCartStore()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={toggleCart}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Carrito de Compras</h2>
          <button 
            onClick={toggleCart}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Tu carrito está vacío</p>
              <p className="text-sm mt-2">¡Añade algunos productos para empezar!</p>
            </div>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                  {/* Image placeholder */}
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.name}</h3>
                    {item.variant && (
                      <p className="text-xs text-gray-500">Variante: {item.variant}</p>
                    )}
                    {item.size && (
                      <p className="text-xs text-gray-500">Talla: {item.size}</p>
                    )}
                    {item.color && (
                      <p className="text-xs text-gray-500">Color: {item.color}</p>
                    )}
                    {item.isCustomized && (
                      <p className="text-xs text-purple-600 font-medium">✨ Personalizado</p>
                    )}
                    <p className="text-sm font-semibold text-primary-500">
                      {formatPrice(item.price)}
                    </p>
                    
                    {/* Stock reservation status */}
                    <div className="mt-2">
                      {/* <StockReservationStatus item={item} compact={true} /> */}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-1 hover:bg-red-100 rounded text-red-500 ml-auto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center font-semibold">
                <span>Total:</span>
                <span className="text-lg text-primary-500">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
              
              <div className="space-y-2">
                <Link href="/carrito" onClick={toggleCart}>
                  <Button className="w-full">
                    Ver Carrito Completo
                  </Button>
                </Link>
                <Link href="/checkout" onClick={toggleCart}>
                  <Button variant="outline" className="w-full">
                    Proceder al Checkout
                  </Button>
                </Link>
                <p className="text-xs text-center text-gray-500">
                  ¿Tienes un código de descuento? Añádelo en el carrito
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}