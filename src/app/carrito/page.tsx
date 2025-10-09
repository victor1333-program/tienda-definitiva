'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  ArrowLeft,
  Package,
  Truck,
  Gift,
  Tag,
  AlertCircle,
  Heart,
  Eye
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store'
import { formatPrice, SHIPPING_COSTS } from '@/lib/utils'
import { WhatsAppCartButton } from '@/components/WhatsAppButton'

export default function CartPage() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    getTotalPrice, 
    getTotalItems,
    clearCart 
  } = useCartStore()
  
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<{
    id: string
    code: string
    name: string
    type: string
    value: number
    isPercentage: boolean
    discountAmount: number
  } | null>(null)
  const [discountLoading, setDiscountLoading] = useState(false)

  const subtotal = getTotalPrice()
  const discountAmount = appliedDiscount?.discountAmount || 0
  const freeShippingThreshold = 30
  const hasShippingDiscount = appliedDiscount?.type === 'FREE_SHIPPING'
  const shippingCost = (subtotal >= freeShippingThreshold || hasShippingDiscount) ? 0 : SHIPPING_COSTS.STANDARD
  const total = subtotal - discountAmount + shippingCost

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error('Introduce un código de descuento')
      return
    }

    setDiscountLoading(true)
    try {
      const response = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode.toUpperCase(),
          cartTotal: subtotal,
          cartItems: getTotalItems()
        })
      })

      const data = await response.json()

      if (data.valid && data.discount) {
        // Para descuentos de envío gratis, necesitamos calcular el ahorro
        if (data.discount.type === 'FREE_SHIPPING') {
          const currentShippingCost = (subtotal >= freeShippingThreshold) ? 0 : SHIPPING_COSTS.STANDARD
          data.discount.discountAmount = currentShippingCost
        }
        
        setAppliedDiscount(data.discount)
        setDiscountCode('')
        
        // Mensaje personalizado según el tipo de descuento
        if (data.discount.type === 'FREE_SHIPPING') {
          toast.success(`¡Envío gratis aplicado! Ahorras ${formatPrice(data.discount.discountAmount)}`)
        } else {
          toast.success(`¡Código aplicado! ${data.discount.name} - Ahorras ${formatPrice(data.discount.discountAmount)}`)
        }
      } else {
        toast.error(data.error || 'Código de descuento no válido')
      }
    } catch (error) {
      console.error('Error validating discount:', error)
      toast.error('Error al verificar el código de descuento')
    } finally {
      setDiscountLoading(false)
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setDiscountCode('')
    toast.success('Código de descuento eliminado')
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId)
      return
    }
    updateQuantity(itemId, newQuantity)
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Tu carrito está vacío
            </h1>
            <p className="text-gray-600 mb-6">
              ¡Añade algunos productos increíbles y empieza a personalizar!
            </p>
            <div className="space-y-3">
              <Link href="/productos">
                <Button className="w-full">
                  <Package className="w-4 h-4 mr-2" />
                  Explorar Productos
                </Button>
              </Link>
              <Link href="/personalizador">
                <Button variant="outline" className="w-full">
                  🎨 Crear Diseño Personalizado
                </Button>
              </Link>
            </div>
          </div>
        </div>
    )
  }

  return (
    <div className="bg-gray-50">
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/productos" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-500 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Seguir comprando
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
              <p className="text-gray-600">{getTotalItems()} artículo{getTotalItems() !== 1 ? 's' : ''} en tu carrito</p>
            </div>
            <Button 
              variant="outline" 
              onClick={clearCart}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Vaciar carrito
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Shipping Notice */}
            {subtotal < freeShippingThreshold && (
              <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      ¡Envío gratis desde {formatPrice(freeShippingThreshold)}!
                    </p>
                    <p className="text-xs text-blue-700">
                      Te faltan {formatPrice(freeShippingThreshold - subtotal)} para el envío gratuito
                    </p>
                  </div>
                </div>
                <div className="mt-2 bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }}
                  />
                </div>
              </Card>
            )}

            {/* Items List */}
            <Card className="p-6">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-6 border-b last:border-b-0">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-lg mb-1">
                            {item.name}
                          </h3>
                          
                          {/* Product Variants */}
                          <div className="space-y-1 mb-2">
                            {item.variant && (
                              <p className="text-sm text-gray-600">Variante: {item.variant}</p>
                            )}
                            {item.size && (
                              <p className="text-sm text-gray-600">Talla: {item.size}</p>
                            )}
                            {item.color && (
                              <p className="text-sm text-gray-600">Color: {item.color}</p>
                            )}
                          </div>

                          {/* Special Badges */}
                          {item.isCustomized && (
                            <Badge className="bg-purple-100 text-purple-800 mb-2">
                              ✨ Personalizado
                            </Badge>
                          )}

                          {/* Price */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl font-bold text-primary-600">
                              {formatPrice(item.price)}
                            </span>
                            <span className="text-sm text-gray-500">por unidad</span>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-2 hover:bg-gray-50 rounded-l-lg"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-2 hover:bg-gray-50 rounded-r-lg"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <span className="text-sm text-gray-500">
                              Total: <span className="font-medium text-gray-900">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Item Actions */}
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar del carrito"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Añadir a favoritos"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          {item.isCustomized && (
                            <button
                              className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Ver diseño personalizado"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recommended Products */}
            <Card className="p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Productos recomendados
              </h3>
              <div className="text-center py-8 text-gray-500">
                <Gift className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">
                  ¡Añade productos complementarios a tu pedido!
                </p>
                <Link href="/productos" className="text-primary-600 hover:text-primary-700 text-sm">
                  Ver productos recomendados
                </Link>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Resumen del Pedido
              </h3>

              {/* Discount Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de descuento
                </label>
                <div className="flex gap-2">
                  <Input
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Ej: BIENVENIDO10"
                    disabled={!!appliedDiscount}
                    className={appliedDiscount ? 'bg-green-50 border-green-200' : ''}
                  />
                  {appliedDiscount ? (
                    <Button 
                      variant="outline" 
                      onClick={handleRemoveDiscount}
                      className="text-red-600 hover:bg-red-50 border-red-200"
                      title="Quitar descuento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleApplyDiscount}
                      disabled={discountLoading || !discountCode.trim()}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {discountLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        'Aplicar'
                      )}
                    </Button>
                  )}
                </div>
                
                {/* Success message */}
                {appliedDiscount && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 flex items-center gap-2 font-medium">
                      <Tag className="w-4 h-4" />
                      ¡{appliedDiscount.name} aplicado!
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Código: {appliedDiscount.code}
                    </p>
                  </div>
                )}

                {/* Helper text */}
                {!appliedDiscount && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      ¿Tienes un código promocional? Ingrésalo aquí
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <button
                        onClick={() => setDiscountCode('BIENVENIDO10')}
                        className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                      >
                        BIENVENIDO10
                      </button>
                      <button
                        onClick={() => setDiscountCode('ENVIOGRATIS')}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        ENVIOGRATIS
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({getTotalItems()} artículo{getTotalItems() !== 1 ? 's' : ''}):</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                {appliedDiscount && appliedDiscount.type !== 'FREE_SHIPPING' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">
                      Descuento {appliedDiscount.isPercentage ? `(${appliedDiscount.value}%)` : ''} ({appliedDiscount.code}):
                    </span>
                    <span className="text-green-600 font-medium">-{formatPrice(appliedDiscount.discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span>Envío:</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-medium">
                        {hasShippingDiscount ? (
                          <span className="flex items-center gap-1">
                            Gratis <Tag className="w-3 h-3" /> {appliedDiscount?.code}
                          </span>
                        ) : (
                          'Gratis'
                        )}
                      </span>
                    ) : (
                      <span className="font-medium">{formatPrice(shippingCost)}</span>
                    )}
                  </span>
                </div>

                {/* Savings summary */}
                {appliedDiscount && (discountAmount > 0 || hasShippingDiscount) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between text-sm text-green-700">
                      <span className="font-medium">💰 Total ahorrado:</span>
                      <span className="font-bold">
                        {formatPrice(
                          (appliedDiscount.type === 'FREE_SHIPPING' ? appliedDiscount.discountAmount : discountAmount) +
                          (hasShippingDiscount && appliedDiscount.discountAmount > 0 ? appliedDiscount.discountAmount : 0)
                        )}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total a pagar:</span>
                    <span className="text-primary-600">{formatPrice(total)}</span>
                  </div>
                  {appliedDiscount && (
                    <p className="text-xs text-green-600 text-right mt-1">
                      Precio original: {formatPrice(subtotal + (hasShippingDiscount ? 0 : SHIPPING_COSTS.STANDARD))}
                    </p>
                  )}
                </div>
              </div>

              {/* Checkout Button */}
              <Link href="/checkout">
                <Button className="w-full mb-3" size="lg">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Proceder al Checkout
                </Button>
              </Link>

              {/* WhatsApp Alternative */}
              <WhatsAppCartButton 
                className="w-full mb-4" 
                size="lg"
              />

              {/* Security Info */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Compra 100% segura</span>
                </div>
                <p className="text-xs text-gray-500">
                  Pago seguro con SSL. Tus datos están protegidos.
                </p>
              </div>

              {/* Payment Methods */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 text-center mb-2">
                  Métodos de pago aceptados:
                </p>
                <div className="flex justify-center gap-2">
                  <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center text-xs">💳</div>
                  <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center text-xs">🏦</div>
                  <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center text-xs">💰</div>
                </div>
              </div>
            </Card>

            {/* Help */}
            <Card className="p-6 mt-6">
              <h4 className="font-medium text-gray-900 mb-3">¿Necesitas ayuda?</h4>
              <div className="space-y-2 text-sm">
                <a href="tel:611066997" className="block text-primary-600 hover:text-primary-700">
                  📞 611 066 997
                </a>
                <a href="mailto:info@lovilike.es" className="block text-primary-600 hover:text-primary-700">
                  ✉️ info@lovilike.es
                </a>
                <Link href="/contacto" className="block text-primary-600 hover:text-primary-700">
                  💬 Formulario de contacto
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      </div>
  )
}