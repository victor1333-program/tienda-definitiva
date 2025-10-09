"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Check,
  Star,
  Package,
  Gift,
  Palette,
  Truck,
  Users,
  Crown,
  Sparkles,
  ArrowLeft
} from "lucide-react"
import { loviboxPlans } from "@/lib/subscriptions/plans"
import { getFeaturesList } from "@/lib/subscriptions/features"

export default function LoviboxPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-400 to-blue-600'
      case 'orange': return 'from-orange-400 to-orange-600'
      case 'purple': return 'from-purple-400 to-purple-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getPlanIcon = (planSlug: string) => {
    switch (planSlug) {
      case 'esencial': return <Package className="w-6 h-6" />
      case 'premium': return <Crown className="w-6 h-6" />
      case 'deluxe': return <Sparkles className="w-6 h-6" />
      default: return <Gift className="w-6 h-6" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/suscripciones">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-r from-orange-400 to-pink-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Lovibox - Cajas Personalizadas
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Recibe productos únicos y personalizados cada mes. 
              Una experiencia de sorpresa diseñada especialmente para ti.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Billing Toggle */}
        <div className="text-center mb-12">
          <div className="inline-flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md transition-colors ${
                billingCycle === 'monthly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md transition-colors ${
                billingCycle === 'yearly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Anual
              <Badge className="ml-2 bg-green-100 text-green-800">
                Ahorra 20%
              </Badge>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {loviboxPlans.map((plan, index) => {
            const features = getFeaturesList(plan.features)
            const yearlyPrice = plan.price * 12 * 0.8 // 20% discount
            const displayPrice = billingCycle === 'yearly' ? yearlyPrice / 12 : plan.price
            
            return (
              <Card 
                key={plan.id}
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  plan.isPopular ? 'border-orange-500 shadow-lg scale-105' : ''
                } ${selectedPlan === plan.id ? 'ring-2 ring-orange-500' : ''}`}
                onClick={() => setSelectedPlan(selectedPlan === plan.id ? null : plan.id)}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-500 text-white px-4 py-1">
                      Más Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`bg-gradient-to-r ${getColorClass(plan.highlightColor || 'blue')} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white`}>
                    {getPlanIcon(plan.slug)}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </CardHeader>
                
                <CardContent>
                  {/* Precio */}
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-gray-900">
                      €{displayPrice.toFixed(2)}
                    </div>
                    <div className="text-gray-500">
                      por mes
                      {billingCycle === 'yearly' && (
                        <div className="text-sm text-green-600 font-medium">
                          (facturado anualmente)
                        </div>
                      )}
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-gray-500 line-through">
                        €{plan.price.toFixed(2)}/mes
                      </div>
                    )}
                  </div>

                  {/* Características */}
                  <div className="space-y-3 mb-6">
                    {features.slice(0, 6).map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                          {feature.name}: {feature.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Botón CTA */}
                  <Link href={`/suscripciones/lovibox/checkout/${plan.id}?billing=${billingCycle}`}>
                    <Button 
                      className={`w-full ${
                        plan.isPopular 
                          ? 'bg-orange-600 hover:bg-orange-700' 
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                      size="lg"
                    >
                      Elegir Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Comparison */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-center">Comparación Detallada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-2">Característica</th>
                    {loviboxPlans.map(plan => (
                      <th key={plan.id} className="text-center py-4 px-2">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Generar filas de características */}
                  {[
                    'Productos por caja',
                    'Nivel de personalización', 
                    'Temas disponibles',
                    'Acceso anticipado',
                    'Productos exclusivos',
                    'Soporte prioritario',
                    'Marca personalizada'
                  ].map(featureName => (
                    <tr key={featureName} className="border-b">
                      <td className="py-3 px-2 font-medium">{featureName}</td>
                      {loviboxPlans.map(plan => {
                        const planFeatures = getFeaturesList(plan.features)
                        const feature = planFeatures.find(f => f.name === featureName)
                        
                        return (
                          <td key={plan.id} className="text-center py-3 px-2">
                            {feature ? (
                              feature.included ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Check className="w-4 h-4 text-green-500" />
                                  <span className="text-sm">{feature.value}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">No incluido</span>
                              )
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Preguntas Frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-2">¿Cuándo llega mi primera caja?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Tu primera Lovibox llegará dentro de 7-10 días hábiles después de completar tu suscripción.
                </p>
                
                <h3 className="font-semibold mb-2">¿Puedo personalizar el contenido?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  ¡Por supuesto! Durante el proceso de suscripción podrás indicar tus preferencias y gustos.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">¿Puedo pausar mi suscripción?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Sí, puedes pausar tu suscripción en cualquier momento desde tu panel de usuario.
                </p>
                
                <h3 className="font-semibold mb-2">¿Hay compromiso de permanencia?</h3>
                <p className="text-gray-600 text-sm">
                  No hay compromiso mínimo. Puedes cancelar tu suscripción cuando desees.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}