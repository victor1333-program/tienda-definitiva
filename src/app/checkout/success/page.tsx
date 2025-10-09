'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Package, 
  Truck, 
  CreditCard,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Download,
  Share2,
  Home,
  ShoppingCart
} from 'lucide-react'
import Link from 'next/link'
import { formatPrice, formatDate, COMPANY_INFO } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  shippingCost: number
  subtotal: number
  createdAt: string
  estimatedDelivery: string
  customerInfo: {
    name: string
    email: string
    phone: string
  }
  shippingMethod: string
  paymentMethod: string
  shippingAddress?: {
    address: string
    city: string
    postalCode: string
    province: string
  }
  items: {
    id: string
    name: string
    variant?: string
    quantity: number
    price: number
    isCustomized?: boolean
  }[]
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const testMode = searchParams.get('testMode') === 'true'
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}`)
      if (!response.ok) throw new Error('Pedido no encontrado')
      
      const data = await response.json()
      setOrder(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPaymentMethodName = (method: string) => {
    const methods = {
      'card': 'Tarjeta de crédito/débito',
      'transfer': 'Transferencia bancaria',
      'paypal': 'PayPal',
      'cash': 'Pago al recibir'
    }
    return methods[method as keyof typeof methods] || method
  }

  const getShippingMethodName = (method: string) => {
    const methods = {
      'pickup': 'Recogida en tienda',
      'standard': 'Envío estándar',
      'express': 'Envío urgente'
    }
    return methods[method as keyof typeof methods] || method
  }

  const getStatusBadge = (status: string) => {
    const statuses = {
      'pending': { label: 'Pendiente', variant: 'secondary' as const },
      'confirmed': { label: 'Confirmado', variant: 'default' as const },
      'processing': { label: 'En Producción', variant: 'default' as const },
      'shipped': { label: 'Enviado', variant: 'default' as const },
      'delivered': { label: 'Entregado', variant: 'default' as const }
    }
    const statusInfo = statuses[status as keyof typeof statuses] || { label: status, variant: 'secondary' as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Pedido no encontrado</h1>
            <p className="text-gray-600 mb-6">
              No pudimos encontrar el pedido solicitado.
            </p>
            <Link href="/productos">
              <Button>Volver a la tienda</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-4 py-8">
        {/* Test Mode Banner */}
        {testMode && (
          <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">🧪</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">
                  Modo Prueba Activo
                </h3>
                <div className="mt-1 text-sm text-orange-700">
                  <p>Este pedido fue procesado en <strong>modo simulación</strong>. No se ha realizado ningún cobro real.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {testMode ? '🧪 ¡Simulación completada!' : '¡Pedido realizado con éxito!'}
          </h1>
          <p className="text-gray-600 text-lg">
            {testMode 
              ? `Pago simulado procesado. Tu pedido de prueba #${order.orderNumber} ha sido creado.`
              : `Gracias por tu compra. Tu pedido #${order.orderNumber} ha sido confirmado.`
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Información del Pedido
                </h2>
                {getStatusBadge(order.status)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Detalles del pedido</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Número de pedido:</span>
                      <span className="font-medium">{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha del pedido:</span>
                      <span>{formatDate(new Date(order.createdAt))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Método de pago:</span>
                      <span>{getPaymentMethodName(order.paymentMethod)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Método de envío:</span>
                      <span>{getShippingMethodName(order.shippingMethod)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Entrega estimada</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{order.estimatedDelivery}</span>
                  </div>
                  {order.shippingAddress ? (
                    <div className="space-y-1 text-sm">
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>{order.shippingAddress.address}</p>
                          <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                          <p>{order.shippingAddress.province}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm">
                      <div className="flex items-start gap-2 text-gray-600">
                        <Package className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Recogida en tienda</p>
                          <p>{COMPANY_INFO.address}</p>
                          <p>{COMPANY_INFO.postalCode} {COMPANY_INFO.city}</p>
                          <p>Teléfono: {COMPANY_INFO.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Order Items */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Productos Pedidos
              </h2>
              
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 py-4 border-b last:border-b-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      {item.variant && (
                        <p className="text-sm text-gray-600">Variante: {item.variant}</p>
                      )}
                      {item.isCustomized && (
                        <Badge className="bg-purple-100 text-purple-800 text-xs mt-1">
                          ✨ Personalizado
                        </Badge>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-600">Cantidad: {item.quantity}</span>
                        <span className="text-sm font-medium text-primary-600">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="border-t pt-4 mt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Envío:</span>
                    <span>{order.shippingCost === 0 ? 'Gratis' : formatPrice(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span className="text-primary-600">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Information */}
            {order.paymentMethod === 'transfer' && (
              <Card className="p-6 bg-blue-50 border-blue-200">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">
                  Información de Pago
                </h2>
                <div className="space-y-3">
                  <p className="text-blue-800">
                    Has seleccionado pago por transferencia bancaria. Por favor, realiza la transferencia con los siguientes datos:
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Titular:</span>
                        <span className="font-medium">{COMPANY_INFO.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IBAN:</span>
                        <span className="font-medium">ES12 1234 5678 9012 3456 7890</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Importe:</span>
                        <span className="font-medium text-primary-600">{formatPrice(order.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Concepto:</span>
                        <span className="font-medium">Pedido {order.orderNumber}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700">
                    ⚠️ Tu pedido se procesará una vez confirmemos el pago de la transferencia.
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Acciones</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Factura
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir Pedido
                </Button>
                <Link href="/productos" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Seguir Comprando
                  </Button>
                </Link>
                <Link href="/" className="block">
                  <Button className="w-full justify-start">
                    <Home className="w-4 h-4 mr-2" />
                    Volver al Inicio
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">¿Necesitas ayuda?</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-primary-500" />
                  <div>
                    <p className="font-medium">Teléfono</p>
                    <a href={`tel:${COMPANY_INFO.phone}`} className="text-primary-600 hover:text-primary-700">
                      {COMPANY_INFO.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-primary-500" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary-600 hover:text-primary-700">
                      {COMPANY_INFO.email}
                    </a>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Te mantendremos informado sobre el estado de tu pedido por email y SMS.
              </p>
            </Card>

            {/* Order Tracking */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Seguimiento</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Pedido confirmado</p>
                    <p className="text-gray-500">{formatDate(new Date(order.createdAt))}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-500">En producción</p>
                    <p className="text-gray-400">Pendiente</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Truck className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-500">
                      {order.shippingMethod === 'pickup' ? 'Listo para recoger' : 'Enviado'}
                    </p>
                    <p className="text-gray-400">Pendiente</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Special Offers */}
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">¡Comparte tu experiencia!</h3>
              <p className="text-sm text-purple-700 mb-4">
                Comparte una foto de tu producto personalizado en redes sociales y obtén un 10% de descuento en tu próximo pedido.
              </p>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                Compartir Ahora
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}