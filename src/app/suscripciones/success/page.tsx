"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle,
  Package,
  Calendar,
  CreditCard,
  ArrowRight,
  Download,
  Share2,
  Star
} from "lucide-react"

interface SubscriptionData {
  id: string
  subscriptionPlan: {
    name: string
    price: number
    subscriptionType: {
      name: string
      slug: string
    }
  }
  status: string
  startsAt: string
  nextBillingDate: string
  metadata: any
}

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const subscriptionId = searchParams.get('subscriptionId')
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!subscriptionId) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/subscriptions/user/${subscriptionId}`)
        if (response.ok) {
          const data = await response.json()
          setSubscription(data)
        }
      } catch (error) {
        console.error('Error fetching subscription:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [subscriptionId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles de tu suscripción...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¡Suscripción Confirmada!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            ¡Bienvenido a la familia Lovilike! Tu suscripción ha sido activada exitosamente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-600" />
                Detalles de tu Suscripción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-semibold">{subscription.subscriptionPlan.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tipo</span>
                    <Badge variant="outline">
                      {subscription.subscriptionPlan.subscriptionType.name}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Precio</span>
                    <span className="font-semibold">€{subscription.subscriptionPlan.price}/mes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estado</span>
                    <Badge className="bg-green-100 text-green-800">
                      {subscription.status === 'ACTIVE' ? 'Activa' : subscription.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Inicio</span>
                    <span>{new Date(subscription.startsAt).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Próxima facturación</span>
                    <span>{new Date(subscription.nextBillingDate).toLocaleDateString('es-ES')}</span>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-semibold">Lovibox Premium</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estado</span>
                    <Badge className="bg-green-100 text-green-800">Activa</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Precio</span>
                    <span className="font-semibold">€34.99/mes</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Próximos Pasos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Confirmaremos tu pedido</h4>
                  <p className="text-sm text-gray-600">Recibirás un email con los detalles en los próximos minutos</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Preparamos tu primera Lovibox</h4>
                  <p className="text-sm text-gray-600">Seleccionamos productos especiales basados en tus preferencias</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Enviamos tu caja</h4>
                  <p className="text-sm text-gray-600">Tu primera Lovibox llegará en 7-10 días hábiles</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Gestionar Suscripción</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ve tu historial, cambia preferencias o pausa tu suscripción
              </p>
              <Link href="/perfil/suscripciones">
                <Button className="w-full">
                  Ir al Panel
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Descargar Recibo</h3>
              <p className="text-sm text-gray-600 mb-4">
                Descarga el comprobante de tu suscripción
              </p>
              <Button variant="outline" className="w-full">
                Descargar PDF
                <Download className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Comparte y Gana</h3>
              <p className="text-sm text-gray-600 mb-4">
                Refiere a tus amigos y consigue descuentos especiales
              </p>
              <Button variant="outline" className="w-full">
                Compartir
                <Share2 className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Social Proof */}
        <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current text-yellow-300" />
              ))}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              ¡Te has unido a más de 2,000 clientes felices!
            </h3>
            <p className="text-orange-100 mb-6">
              "Cada mes es una sorpresa maravillosa. Los productos son de excelente calidad 
              y el servicio al cliente es excepcional." - María G.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/suscripciones">
                <Button variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100">
                  Explorar más planes
                </Button>
              </Link>
              <Link href="/productos">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
                  Ver productos individuales
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}