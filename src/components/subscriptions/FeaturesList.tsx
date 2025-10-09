"use client"

import { Check, X } from "lucide-react"
import { SubscriptionFeatures } from "@/lib/subscriptions/types"
import { getFeaturesList } from "@/lib/subscriptions/features"

interface FeaturesListProps {
  features: SubscriptionFeatures
  showAll?: boolean
  className?: string
}

export default function FeaturesList({ features, showAll = false, className = "" }: FeaturesListProps) {
  const featuresList = getFeaturesList(features)
  const displayFeatures = showAll ? featuresList : featuresList.slice(0, 8)
  
  return (
    <div className={`space-y-3 ${className}`}>
      {displayFeatures.map((feature, index) => (
        <div key={index} className="flex items-start gap-3">
          {feature.included ? (
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <span className={`text-sm font-medium ${
              feature.included ? 'text-gray-900' : 'text-gray-400'
            }`}>
              {feature.name}
            </span>
            <div className={`text-xs ${
              feature.included ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {feature.value}
            </div>
          </div>
        </div>
      ))}
      
      {!showAll && featuresList.length > 8 && (
        <div className="text-sm text-gray-500 italic pt-2 border-t">
          +{featuresList.length - 8} características adicionales
        </div>
      )}
    </div>
  )
}