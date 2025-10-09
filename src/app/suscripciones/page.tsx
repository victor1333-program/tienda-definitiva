"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  Building, 
  ArrowRight, 
  Star,
  Check,
  Gift,
  Users,
  Clock,
  Heart
} from "lucide-react"
import { subscriptionTypes } from "@/lib/subscriptions/plans"

export default function SuscripcionesPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Descubre nuestras 
            <span className="text-orange-600"> Suscripciones</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Productos personalizados entregados en tu puerta cada mes. 
            Elige la experiencia perfecta para ti o tu empresa.
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="ml-2">Más de 2,000 clientes satisfechos</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Tipos de Suscripción */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {subscriptionTypes.map(type => (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                selectedType === type.id ? 'ring-2 ring-orange-500' : ''
              }`}
              onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    type.id === 'lovibox' 
                      ? 'bg-orange-100 text-orange-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {type.id === 'lovibox' ? (
                      <Package className="w-8 h-8" />
                    ) : (
                      <Building className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{type.name}</CardTitle>
                    <p className="text-gray-600">{type.description}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {type.id === 'lovibox' ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-orange-600" />
                      <span>Productos únicos cada mes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-orange-600" />
                      <span>100% personalizable</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <span>Entrega puntual garantizada</span>
                    </div>
                    <div className="mt-6">
                      <div className="text-sm text-gray-500 mb-2">Desde</div>
                      <div className="text-3xl font-bold text-orange-600">€19.99<span className="text-lg text-gray-500">/mes</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span>Soluciones empresariales</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-blue-600" />
                      <span>Productos promocionales</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-blue-600" />
                      <span>Gestión dedicada</span>
                    </div>
                    <div className="mt-6">
                      <div className="text-sm text-gray-500 mb-2">Desde</div>
                      <div className="text-3xl font-bold text-blue-600">€99.99<span className="text-lg text-gray-500">/mes</span></div>
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <Link href={`/suscripciones/${type.slug}`}>
                    <Button 
                      className={`w-full ${
                        type.id === 'lovibox' 
                          ? 'bg-orange-600 hover:bg-orange-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      Ver Planes
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Características Generales */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8">
            ¿Por qué elegir nuestras suscripciones?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Calidad Garantizada</h3>
              <p className="text-gray-600">
                Todos nuestros productos pasan rigurosos controles de calidad
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Personalización Total</h3>
              <p className="text-gray-600">
                Adapta cada producto a tus gustos y necesidades específicas
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Flexibilidad Total</h3>
              <p className="text-gray-600">
                Pausa, modifica o cancela tu suscripción cuando quieras
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-4">¿Listo para empezar?</h2>
          <p className="text-gray-600 mb-8">
            Únete a miles de clientes que ya disfrutan de nuestras suscripciones
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/suscripciones/lovibox">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                Explorar Lovibox
              </Button>
            </Link>
            <Link href="/suscripciones/empresas">
              <Button size="lg" variant="outline">
                Soluciones Empresas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}