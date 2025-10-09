"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"
import { SubscriptionPlanConfig } from "@/lib/subscriptions/types"
import { getFeaturesList } from "@/lib/subscriptions/features"

interface PlanCardProps {
  plan: SubscriptionPlanConfig
  isPopular?: boolean
  onSelect?: () => void
  billingCycle?: 'monthly' | 'yearly'
  showFeatures?: number
}

export default function PlanCard({ 
  plan, 
  isPopular = false, 
  onSelect, 
  billingCycle = 'monthly',
  showFeatures = 5 
}: PlanCardProps) {
  const features = getFeaturesList(plan.features)
  const yearlyPrice = plan.price * 12 * 0.8 // 20% discount for yearly
  const displayPrice = billingCycle === 'yearly' ? yearlyPrice / 12 : plan.price
  
  const getColorClass = (color?: string) => {
    switch (color) {
      case 'blue': return 'from-blue-400 to-blue-600'
      case 'orange': return 'from-orange-400 to-orange-600'
      case 'purple': return 'from-purple-400 to-purple-600'
      case 'green': return 'from-green-400 to-green-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  return (
    <Card 
      className={`relative transition-all duration-300 hover:shadow-xl cursor-pointer ${
        isPopular || plan.isPopular ? 'border-orange-500 shadow-lg scale-105' : ''
      }`}
      onClick={onSelect}
    >
      {(isPopular || plan.isPopular) && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-orange-500 text-white px-4 py-1 flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Más Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className={`bg-gradient-to-r ${getColorClass(plan.highlightColor)} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold`}>
          {plan.name.charAt(0)}
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
            por {plan.billingCycle === 'monthly' ? 'mes' : plan.billingCycle}
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

        {/* Características principales */}
        <div className="space-y-3 mb-6">
          {features.slice(0, showFeatures).map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              {feature.included ? (
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded flex-shrink-0" />
              )}
              <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                <span className="font-medium">{feature.name}:</span> {feature.value}
              </span>
            </div>
          ))}
          
          {features.length > showFeatures && (
            <div className="text-sm text-gray-500 italic">
              +{features.length - showFeatures} características más
            </div>
          )}
        </div>

        {/* Botón de acción */}
        <Button 
          className={`w-full ${
            isPopular || plan.isPopular
              ? 'bg-orange-600 hover:bg-orange-700' 
              : 'bg-gray-900 hover:bg-gray-800'
          }`}
          size="lg"
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.()
          }}
        >
          Elegir Plan
        </Button>
      </CardContent>
    </Card>
  )
}