"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  CreditCard,
  Shield,
  Check,
  AlertCircle,
  Lock,
  Package,
  Calendar,
  User,
  Mail,
  Phone
} from "lucide-react"
import { getPlan } from "@/lib/subscriptions/plans"
import { getFeaturesList } from "@/lib/subscriptions/features"
import { toast } from "react-hot-toast"

interface CheckoutFormData {
  billingInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
    country: string
  }
  paymentInfo: {
    cardNumber: string
    expiryDate: string
    cvv: string
    cardName: string
  }
  preferences: {
    themes: string[]
    notes: string
  }
}

export default function CheckoutPage({ params }: { params: { planId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  const billingCycle = searchParams.get('billing') as 'monthly' | 'yearly' || 'monthly'
  const plan = getPlan(params.planId)

  const [formData, setFormData] = useState<CheckoutFormData>({
    billingInfo: {
      firstName: '',
      lastName: '',
      email: session?.user?.email || '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'España'
    },
    paymentInfo: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: ''
    },
    preferences: {
      themes: [],
      notes: ''
    }
  })

  useEffect(() => {
    if (session?.user?.email) {
      setFormData(prev => ({
        ...prev,
        billingInfo: {
          ...prev.billingInfo,
          email: session.user.email!,
          firstName: session.user.name?.split(' ')[0] || '',
          lastName: session.user.name?.split(' ').slice(1).join(' ') || ''
        }
      }))
    }
  }, [session])

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Plan no encontrado</h2>
            <p className="text-gray-600 mb-4">El plan de suscripción que buscas no existe.</p>
            <Link href="/suscripciones/lovibox">
              <Button>Ver Planes Disponibles</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push(`/auth/signin?callbackUrl=/suscripciones/lovibox/checkout/${params.planId}?billing=${billingCycle}`)
    return null
  }

  const features = getFeaturesList(plan.features)
  const yearlyPrice = plan.price * 12 * 0.8
  const displayPrice = billingCycle === 'yearly' ? yearlyPrice / 12 : plan.price
  const totalPrice = billingCycle === 'yearly' ? yearlyPrice : plan.price

  const handleInputChange = (section: keyof CheckoutFormData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        const billing = formData.billingInfo
        return !!(billing.firstName && billing.lastName && billing.email && billing.address && billing.city && billing.postalCode)
      case 2:
        const payment = formData.paymentInfo
        return !!(payment.cardNumber && payment.expiryDate && payment.cvv && payment.cardName)
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    } else {
      toast.error('Por favor completa todos los campos requeridos')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(2)) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    setIsLoading(true)
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Crear suscripción
      const response = await fetch('/api/subscriptions/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscriptionPlanId: plan.id,
          billingCycle,
          metadata: {
            billingInfo: formData.billingInfo,
            preferences: formData.preferences,
            checkoutDate: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al procesar la suscripción')
      }

      const subscription = await response.json()
      
      toast.success('¡Suscripción creada exitosamente!')
      router.push(`/suscripciones/success?subscriptionId=${subscription.id}`)
    } catch (error) {
      console.error('Error creating subscription:', error)
      toast.error(error instanceof Error ? error.message : 'Error al procesar la suscripción')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/suscripciones/lovibox">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a planes
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              <span className="font-semibold">Checkout - {plan.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {[
                    { step: 1, title: 'Información', icon: User },
                    { step: 2, title: 'Pago', icon: CreditCard },
                    { step: 3, title: 'Confirmación', icon: Check }
                  ].map(({ step, title, icon: Icon }) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        currentStep >= step ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`ml-2 font-medium ${
                        currentStep >= step ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {title}
                      </span>
                      {step < 3 && (
                        <div className={`w-12 h-1 mx-4 ${
                          currentStep > step ? 'bg-orange-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step Content */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información de Facturación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nombre *</Label>
                      <Input
                        id="firstName"
                        value={formData.billingInfo.firstName}
                        onChange={(e) => handleInputChange('billingInfo', 'firstName', e.target.value)}
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellidos *</Label>
                      <Input
                        id="lastName"
                        value={formData.billingInfo.lastName}
                        onChange={(e) => handleInputChange('billingInfo', 'lastName', e.target.value)}
                        placeholder="Tus apellidos"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.billingInfo.email}
                        onChange={(e) => handleInputChange('billingInfo', 'email', e.target.value)}
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={formData.billingInfo.phone}
                        onChange={(e) => handleInputChange('billingInfo', 'phone', e.target.value)}
                        placeholder="+34 600 000 000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Dirección *</Label>
                    <Input
                      id="address"
                      value={formData.billingInfo.address}
                      onChange={(e) => handleInputChange('billingInfo', 'address', e.target.value)}
                      placeholder="Calle, número, piso..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Ciudad *</Label>
                      <Input
                        id="city"
                        value={formData.billingInfo.city}
                        onChange={(e) => handleInputChange('billingInfo', 'city', e.target.value)}
                        placeholder="Madrid"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Código Postal *</Label>
                      <Input
                        id="postalCode"
                        value={formData.billingInfo.postalCode}
                        onChange={(e) => handleInputChange('billingInfo', 'postalCode', e.target.value)}
                        placeholder="28001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">País</Label>
                      <Input
                        id="country"
                        value={formData.billingInfo.country}
                        onChange={(e) => handleInputChange('billingInfo', 'country', e.target.value)}
                        placeholder="España"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Información de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Pago 100% seguro</p>
                      <p className="text-blue-700">Tus datos están protegidos con encriptación SSL</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cardName">Nombre en la tarjeta *</Label>
                    <Input
                      id="cardName"
                      value={formData.paymentInfo.cardName}
                      onChange={(e) => handleInputChange('paymentInfo', 'cardName', e.target.value)}
                      placeholder="Como aparece en tu tarjeta"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber">Número de tarjeta *</Label>
                    <Input
                      id="cardNumber"
                      value={formData.paymentInfo.cardNumber}
                      onChange={(e) => handleInputChange('paymentInfo', 'cardNumber', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Fecha de vencimiento *</Label>
                      <Input
                        id="expiryDate"
                        value={formData.paymentInfo.expiryDate}
                        onChange={(e) => handleInputChange('paymentInfo', 'expiryDate', e.target.value)}
                        placeholder="MM/AA"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        value={formData.paymentInfo.cvv}
                        onChange={(e) => handleInputChange('paymentInfo', 'cvv', e.target.value)}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  {/* Preferencias Lovibox */}
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="font-semibold mb-4">Personaliza tu Lovibox</h3>
                    <div>
                      <Label htmlFor="notes">Cuéntanos tus gustos y preferencias</Label>
                      <textarea
                        id="notes"
                        value={formData.preferences.notes}
                        onChange={(e) => handleInputChange('preferences', 'notes', e.target.value)}
                        placeholder="Ej: Me encantan los colores pastel, no me gustan los productos con glitter, prefiero artículos útiles para el hogar..."
                        rows={3}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Confirmar Suscripción
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">Todo listo para confirmar</span>
                    </div>
                    <p className="text-green-700 text-sm">
                      Revisa los detalles de tu suscripción antes de finalizar.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Información de entrega</h4>
                      <div className="text-sm text-gray-600">
                        <p>{formData.billingInfo.firstName} {formData.billingInfo.lastName}</p>
                        <p>{formData.billingInfo.address}</p>
                        <p>{formData.billingInfo.postalCode} {formData.billingInfo.city}</p>
                        <p>{formData.billingInfo.country}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Método de pago</h4>
                      <div className="text-sm text-gray-600">
                        <p>**** **** **** {formData.paymentInfo.cardNumber.slice(-4)}</p>
                        <p>{formData.paymentInfo.cardName}</p>
                      </div>
                    </div>

                    {formData.preferences.notes && (
                      <div>
                        <h4 className="font-semibold mb-2">Tus preferencias</h4>
                        <p className="text-sm text-gray-600">{formData.preferences.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Anterior
              </Button>
              
              {currentStep < 3 ? (
                <Button onClick={nextStep}>
                  Siguiente
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Confirmar Suscripción
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{plan.name}</h3>
                      <p className="text-sm text-gray-600">Suscripción Lovibox</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Plan mensual</span>
                      <span>€{plan.price.toFixed(2)}</span>
                    </div>
                    
                    {billingCycle === 'yearly' && (
                      <>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Descuento anual (20%)</span>
                          <span>-€{(plan.price * 12 * 0.2).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Facturación</span>
                          <span>Anual</span>
                        </div>
                      </>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>€{totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="text-xs text-gray-500">
                    {billingCycle === 'yearly' ? 'Facturado anualmente' : 'Facturado mensualmente'}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Incluye:</h4>
                    {features.slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{feature.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Primera entrega</span>
                    </div>
                    <p>En 7-10 días hábiles después de confirmar tu suscripción</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}