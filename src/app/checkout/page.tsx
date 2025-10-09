'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  User, 
  MapPin, 
  Truck, 
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Package,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  Gift
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store'
import { useStockReservation } from '@/hooks/useStockReservation'
import { formatPrice, SHIPPING_COSTS, COMPANY_INFO } from '@/lib/utils'

interface CustomerInfo {
  name: string
  email: string
  phone: string
  dni?: string
  isCompany: boolean
  companyName?: string
  companyVat?: string
}

interface ShippingAddress {
  address: string
  city: string
  postalCode: string
  province: string
  country: string
  notes?: string
}

interface BillingAddress extends ShippingAddress {
  sameAsShipping: boolean
}

type ShippingMethod = 'pickup' | 'standard' | 'express'
type PaymentMethod = 'card' | 'transfer' | 'paypal' | 'cash'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart, getUnreservedItems } = useCartStore()
  const { releaseStock, getSessionId } = useStockReservation()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [testMode, setTestMode] = useState(false)
  const [stockValidationError, setStockValidationError] = useState<string | null>(null)
  
  // Form data
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    dni: '',
    isCompany: false,
    companyName: '',
    companyVat: ''
  })
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address: '',
    city: '',
    postalCode: '',
    province: '',
    country: 'España',
    notes: ''
  })
  
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    ...shippingAddress,
    sameAsShipping: true
  })
  
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)

  const steps = [
    { number: 1, title: 'Información Personal', icon: <User className="w-5 h-5" /> },
    { number: 2, title: 'Dirección de Envío', icon: <MapPin className="w-5 h-5" /> },
    { number: 3, title: 'Método de Envío', icon: <Truck className="w-5 h-5" /> },
    { number: 4, title: 'Pago', icon: <CreditCard className="w-5 h-5" /> },
    { number: 5, title: 'Confirmar Pedido', icon: <CheckCircle className="w-5 h-5" /> }
  ]

  const shippingOptions = [
    {
      id: 'pickup' as ShippingMethod,
      name: 'Recogida en tienda',
      description: 'Recoge tu pedido gratis en nuestra tienda de Hellín',
      price: SHIPPING_COSTS.PICKUP,
      estimatedDays: '3-5 días laborables',
      icon: <Package className="w-5 h-5" />
    },
    {
      id: 'standard' as ShippingMethod,
      name: 'Envío estándar',
      description: 'Envío a domicilio por mensajería',
      price: SHIPPING_COSTS.STANDARD,
      estimatedDays: '5-7 días laborables',
      icon: <Truck className="w-5 h-5" />
    },
    {
      id: 'express' as ShippingMethod,
      name: 'Envío urgente',
      description: 'Entrega rápida en 24-48h',
      price: SHIPPING_COSTS.EXPRESS,
      estimatedDays: '1-2 días laborables',
      icon: <Calendar className="w-5 h-5" />
    }
  ]

  const paymentOptions = [
    {
      id: 'card' as PaymentMethod,
      name: 'Tarjeta de crédito/débito',
      description: 'Pago seguro con tarjeta',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      id: 'transfer' as PaymentMethod,
      name: 'Transferencia bancaria',
      description: 'Pago por transferencia (envío tras confirmar pago)',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      id: 'paypal' as PaymentMethod,
      name: 'PayPal',
      description: 'Pago rápido y seguro con PayPal',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      id: 'cash' as PaymentMethod,
      name: 'Pago al recibir',
      description: 'Solo disponible para recogida en tienda',
      icon: <CreditCard className="w-5 h-5" />,
      disabled: shippingMethod !== 'pickup'
    }
  ]

  // Load test mode status
  useEffect(() => {
    const loadTestMode = async () => {
      try {
        const response = await fetch('/api/settings/test-mode')
        if (response.ok) {
          const data = await response.json()
          setTestMode(data.testMode)
        }
      } catch (error) {
        console.error('Error loading test mode:', error)
      }
    }
    loadTestMode()
  }, [])

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      toast.error('Tu carrito está vacío')
      router.push('/productos')
    }
  }, [items, router])

  // Calculate totals
  const subtotal = getTotalPrice()
  const shippingCost = shippingMethod === 'pickup' ? 0 : SHIPPING_COSTS[shippingMethod.toUpperCase() as keyof typeof SHIPPING_COSTS]
  const total = subtotal + shippingCost

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const validateStockReservations = async (): Promise<boolean> => {
    setStockValidationError(null)
    
    const unreservedItems = getUnreservedItems()
    if (unreservedItems.length > 0) {
      const itemNames = unreservedItems.map(item => item.name).join(', ')
      setStockValidationError(`Los siguientes productos no tienen stock reservado: ${itemNames}`)
      toast.error('Algunos productos no tienen stock reservado')
      return false
    }

    // Validar que todas las reservas siguen siendo válidas
    for (const item of items) {
      if (item.variantId) {
        try {
          const response = await fetch(`/api/stock/available?variantId=${item.variantId}&sessionId=${getSessionId()}`)
          const stockInfo = await response.json()
          
          if (!response.ok) continue
          
          if (stockInfo.availableStock < item.quantity) {
            setStockValidationError(`Stock insuficiente para ${item.name}`)
            toast.error(`Stock insuficiente para ${item.name}`)
            return false
          }
        } catch (error) {
          console.error('Error validating stock:', error)
        }
      }
    }

    return true
  }

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
          toast.error('Por favor, completa todos los campos obligatorios')
          return false
        }
        if (customerInfo.isCompany && (!customerInfo.companyName || !customerInfo.companyVat)) {
          toast.error('Por favor, completa los datos de la empresa')
          return false
        }
        return true
      
      case 2:
        if (shippingMethod !== 'pickup') {
          if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.province) {
            toast.error('Por favor, completa la dirección de envío')
            return false
          }
        }
        return true
      
      case 4:
        if (!paymentMethod) {
          toast.error('Por favor, selecciona un método de pago')
          return false
        }
        return true
      
      case 5:
        if (!acceptTerms || !acceptPrivacy) {
          toast.error('Debes aceptar los términos y condiciones y la política de privacidad')
          return false
        }
        return true
      
      default:
        return true
    }
  }

  const handleSubmitOrder = async () => {
    if (!validateCurrentStep()) return
    
    // Validar reservas de stock antes de proceder
    const stockValidation = await validateStockReservations()
    if (!stockValidation) return
    
    setLoading(true)
    
    try {
      // 1. Crear el pedido
      const orderData = {
        customerInfo,
        shippingAddress: shippingMethod === 'pickup' ? null : shippingAddress,
        billingAddress: billingAddress.sameAsShipping ? shippingAddress : billingAddress,
        shippingMethod,
        paymentMethod,
        items,
        subtotal,
        shippingCost,
        total,
        specialInstructions,
        acceptTerms,
        acceptPrivacy
      }

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!orderResponse.ok) throw new Error('Error al crear el pedido')

      const order = await orderResponse.json()
      
      // 2. Verificar si el modo prueba está activo
      const testModeResponse = await fetch('/api/settings/test-mode')
      const testModeData = await testModeResponse.json()
      
      if (testModeData.testMode) {
        // Modo prueba: simular el pago
        toast.info('🧪 Procesando pago en modo prueba...')
        
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simular delay
        
        const paymentResponse = await fetch('/api/payments/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            amount: total,
            paymentMethod,
            customerEmail: customerInfo.email
          })
        })

        const paymentResult = await paymentResponse.json()
        
        if (paymentResult.success) {
          // Clear cart
          clearCart()
          
          // Redirect to success page with test mode indicator
          router.push(`/checkout/success?orderId=${order.id}&testMode=true`)
          
          toast.success('🧪 ¡Pago simulado procesado correctamente!')
        } else {
          toast.error(`❌ Error en simulación: ${paymentResult.error}`)
          return
        }
      } else {
        // Modo producción: Integración real con Redsys
        toast.info('Preparando pago con Redsys...')
        
        try {
          const redsysResponse = await fetch('/api/payments/redsys/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: order.id,
              amount: order.totalAmount,
              returnUrl: `${window.location.origin}/checkout/success?orderId=${order.id}`,
              customerEmail: user?.email,
              customerName: user?.name,
              productDescription: `Pedido ${order.orderNumber} - ${order.orderItems.length} productos`
            })
          })

          const redsysData = await redsysResponse.json()

          if (redsysData.success && redsysData.formData) {
            // Crear formulario HTML para redirigir a Redsys
            const form = document.createElement('form')
            form.method = 'POST'
            form.action = redsysData.redirectUrl
            form.style.display = 'none'

            // Añadir campos del formulario
            Object.entries(redsysData.formData).forEach(([key, value]) => {
              const input = document.createElement('input')
              input.type = 'hidden'
              input.name = key
              input.value = value as string
              form.appendChild(input)
            })

            // Añadir al DOM y enviar
            document.body.appendChild(form)
            
            // Limpiar carrito antes de redirigir
            clearCart()
            
            toast.success('🔄 Redirigiendo a Redsys...')
            
            // Pequeño delay para mostrar el mensaje
            setTimeout(() => {
              form.submit()
            }, 1000)

          } else {
            throw new Error(redsysData.error || 'Error configurando pago con Redsys')
          }

        } catch (redsysError) {
          console.error('Error with Redsys payment:', redsysError)
          toast.error('Error al procesar pago con Redsys. Inténtalo de nuevo.')
          return
        }
      }
      
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar el pedido. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return null // Will redirect in useEffect
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
                  <p>Esta compra será <strong>simulada</strong>. No se realizará ningún cobro real.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <Link href="/productos" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-500 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Seguir comprando
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {testMode ? '🧪 Finalizar Compra (Simulación)' : 'Finalizar Compra'}
          </h1>
        </div>

        {/* Stock Validation Error */}
        {stockValidationError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Error de Stock
                </h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>{stockValidationError}</p>
                  <p className="mt-2">Por favor, revisa tu carrito y reserva el stock de los productos antes de continuar.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-primary-500 border-primary-500 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-primary-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Customer Information */}
            {currentStep === 1 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Información Personal
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="customerType"
                        checked={!customerInfo.isCompany}
                        onChange={() => setCustomerInfo({...customerInfo, isCompany: false})}
                      />
                      <span>Particular</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="customerType"
                        checked={customerInfo.isCompany}
                        onChange={() => setCustomerInfo({...customerInfo, isCompany: true})}
                      />
                      <span>Empresa</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre completo *
                      </label>
                      <Input
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        placeholder="Tu nombre completo"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <Input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        placeholder="611 066 997"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        DNI/NIE
                      </label>
                      <Input
                        value={customerInfo.dni}
                        onChange={(e) => setCustomerInfo({...customerInfo, dni: e.target.value})}
                        placeholder="12345678A"
                      />
                    </div>
                  </div>

                  {customerInfo.isCompany && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de la empresa *
                        </label>
                        <Input
                          value={customerInfo.companyName}
                          onChange={(e) => setCustomerInfo({...customerInfo, companyName: e.target.value})}
                          placeholder="Nombre de tu empresa"
                          required={customerInfo.isCompany}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CIF/NIF *
                        </label>
                        <Input
                          value={customerInfo.companyVat}
                          onChange={(e) => setCustomerInfo({...customerInfo, companyVat: e.target.value})}
                          placeholder="B12345678"
                          required={customerInfo.isCompany}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Step 2: Shipping Address */}
            {currentStep === 2 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Dirección de Envío
                </h2>
                
                {shippingMethod === 'pickup' ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Recogida en tienda
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Podrás recoger tu pedido en nuestra tienda de Hellín
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 text-left">
                      <h4 className="font-medium text-gray-900 mb-2">Dirección de la tienda:</h4>
                      <p className="text-gray-600 text-sm">
                        {COMPANY_INFO.address}<br />
                        {COMPANY_INFO.postalCode} {COMPANY_INFO.city}, {COMPANY_INFO.province}<br />
                        Teléfono: {COMPANY_INFO.phone}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección completa *
                      </label>
                      <Input
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                        placeholder="Calle, número, piso, puerta..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ciudad *
                        </label>
                        <Input
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                          placeholder="Ciudad"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Código postal *
                        </label>
                        <Input
                          value={shippingAddress.postalCode}
                          onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                          placeholder="02400"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Provincia *
                        </label>
                        <Input
                          value={shippingAddress.province}
                          onChange={(e) => setShippingAddress({...shippingAddress, province: e.target.value})}
                          placeholder="Provincia"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observaciones para la entrega
                      </label>
                      <textarea
                        value={shippingAddress.notes}
                        onChange={(e) => setShippingAddress({...shippingAddress, notes: e.target.value})}
                        placeholder="Instrucciones especiales para el repartidor..."
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Step 3: Shipping Method */}
            {currentStep === 3 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Método de Envío
                </h2>
                
                <div className="space-y-4">
                  {shippingOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        shippingMethod === option.id 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={option.id}
                        checked={shippingMethod === option.id}
                        onChange={(e) => setShippingMethod(e.target.value as ShippingMethod)}
                        className="mt-1"
                      />
                      <div className="text-gray-500 mt-1">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900">{option.name}</h3>
                          <span className="font-semibold text-primary-600">
                            {option.price === 0 ? 'Gratis' : formatPrice(option.price)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{option.description}</p>
                        <p className="text-xs text-gray-500">{option.estimatedDays}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </Card>
            )}

            {/* Step 4: Payment Method */}
            {currentStep === 4 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Método de Pago
                </h2>
                
                <div className="space-y-4">
                  {paymentOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        option.disabled 
                          ? 'opacity-50 cursor-not-allowed border-gray-200' 
                          : paymentMethod === option.id 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.id}
                        checked={paymentMethod === option.id}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        disabled={option.disabled}
                        className="mt-1"
                      />
                      <div className="text-gray-500 mt-1">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{option.name}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === 'transfer' && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Datos para transferencia:</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>Titular:</strong> {COMPANY_INFO.name}</p>
                      <p><strong>IBAN:</strong> ES12 1234 5678 9012 3456 7890</p>
                      <p><strong>Concepto:</strong> Pedido + Número de pedido</p>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Step 5: Confirm Order */}
            {currentStep === 5 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Confirmar Pedido
                </h2>
                
                <div className="space-y-6">
                  {/* Special Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instrucciones especiales
                    </label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="¿Alguna instrucción especial para tu pedido?"
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-3">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-1"
                        required
                      />
                      <span className="text-sm text-gray-700">
                        Acepto los{' '}
                        <Link href="/terminos" className="text-primary-600 hover:text-primary-700">
                          términos y condiciones
                        </Link>{' '}
                        de venta *
                      </span>
                    </label>
                    
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={acceptPrivacy}
                        onChange={(e) => setAcceptPrivacy(e.target.checked)}
                        className="mt-1"
                        required
                      />
                      <span className="text-sm text-gray-700">
                        Acepto la{' '}
                        <Link href="/privacidad" className="text-primary-600 hover:text-primary-700">
                          política de privacidad
                        </Link>{' '}
                        y el tratamiento de mis datos *
                      </span>
                    </label>
                  </div>

                  {/* Order Summary Preview */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Resumen del pedido:</h4>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Envío ({shippingOptions.find(s => s.id === shippingMethod)?.name}):</span>
                        <span>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-base border-t pt-2">
                        <span>Total:</span>
                        <span className="text-primary-600">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </Button>
              
              {currentStep < 5 ? (
                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitOrder}
                  disabled={loading || !acceptTerms || !acceptPrivacy}
                  className={`flex items-center gap-2 ${testMode ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                  {testMode ? '🧪 Simular Pago' : 'Confirmar Pedido'}
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen del Pedido
              </h3>
              
              {/* Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {item.name}
                      </h4>
                      {item.variant && (
                        <p className="text-xs text-gray-500">{item.variant}</p>
                      )}
                      {item.isCustomized && (
                        <Badge className="bg-purple-100 text-purple-800 text-xs mt-1">
                          Personalizado
                        </Badge>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">Cant: {item.quantity}</span>
                        <span className="text-sm font-medium text-primary-600">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío:</span>
                  <span>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-primary-600">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Security Info */}
              <div className="mt-6 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Compra 100% segura</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}