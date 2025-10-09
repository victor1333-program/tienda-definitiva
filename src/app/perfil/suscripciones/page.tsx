"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Package,
  Calendar,
  CreditCard,
  Settings,
  Pause,
  Play,
  X,
  Edit,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Crown,
  Sparkles
} from "lucide-react"
import { getFeaturesList } from "@/lib/subscriptions/features"
import { toast } from "react-hot-toast"

interface UserSubscription {
  id: string
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED' | 'PENDING'
  startsAt: string
  endsAt?: string
  nextBillingDate?: string
  autoRenew: boolean
  metadata: any
  createdAt: string
  subscriptionPlan: {
    id: string
    name: string
    price: number
    billingCycle: string
    features: any
    subscriptionType: {
      name: string
      slug: string
    }
  }
}

export default function UserSubscriptionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/perfil/suscripciones")
      return
    }

    if (status === "authenticated") {
      fetchSubscriptions()
    }
  }, [status, router])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscriptions/user')
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data)
      } else {
        toast.error('Error al cargar suscripciones')
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      toast.error('Error al cargar suscripciones')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscriptionAction = async (subscriptionId: string, action: string) => {
    setActionLoading(subscriptionId)
    try {
      const response = await fetch(`/api/subscriptions/user/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const updatedSubscription = await response.json()
        setSubscriptions(prev => 
          prev.map(sub => 
            sub.id === subscriptionId ? updatedSubscription : sub
          )
        )
        
        const actionMessages = {
          pause: 'Suscripción pausada correctamente',
          resume: 'Suscripción reanudada correctamente',
          cancel: 'Suscripción cancelada correctamente'
        }
        
        toast.success(actionMessages[action as keyof typeof actionMessages] || 'Acción completada')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al procesar la acción')
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      toast.error('Error al procesar la acción')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: 'Activa', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      PAUSED: { label: 'Pausada', color: 'bg-yellow-100 text-yellow-800', icon: Pause },
      CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: X },
      EXPIRED: { label: 'Expirada', color: 'bg-gray-100 text-gray-800', icon: Clock },
      PENDING: { label: 'Pendiente', color: 'bg-blue-100 text-blue-800', icon: Clock }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('premium')) return <Crown className="w-6 h-6" />
    if (planName.toLowerCase().includes('deluxe')) return <Sparkles className="w-6 h-6" />
    return <Package className="w-6 h-6" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus suscripciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Suscripciones</h1>
          <p className="text-gray-600">
            Gestiona tus suscripciones, cambia planes y revisa tu historial de facturación
          </p>
        </div>

        {subscriptions.length === 0 ? (
          /* No Subscriptions State */
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                No tienes suscripciones activas
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Descubre nuestros planes de suscripción y comienza a recibir productos 
                personalizados cada mes
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => router.push('/suscripciones/lovibox')}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Explorar Lovibox
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/suscripciones/empresas')}
                >
                  Soluciones Empresas
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Subscriptions List */
          <div className="space-y-6">
            {subscriptions.map((subscription) => {
              const features = getFeaturesList(subscription.subscriptionPlan.features)
              const isActive = subscription.status === 'ACTIVE'
              const isPaused = subscription.status === 'PAUSED'
              const isCancelled = subscription.status === 'CANCELLED'
              
              return (
                <Card key={subscription.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-lg">
                          {getPlanIcon(subscription.subscriptionPlan.name)}
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            {subscription.subscriptionPlan.name}
                          </CardTitle>
                          <p className="text-gray-600">
                            {subscription.subscriptionPlan.subscriptionType.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(subscription.status)}
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          €{subscription.subscriptionPlan.price}
                          <span className="text-sm font-normal text-gray-500">
                            /{subscription.subscriptionPlan.billingCycle === 'monthly' ? 'mes' : 'año'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Subscription Info */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Información</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Inicio:</span>
                            <span>{formatDate(subscription.startsAt)}</span>
                          </div>
                          {subscription.nextBillingDate && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Próxima facturación:</span>
                              <span>{formatDate(subscription.nextBillingDate)}</span>
                            </div>
                          )}
                          {subscription.endsAt && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Finaliza:</span>
                              <span>{formatDate(subscription.endsAt)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Renovación automática:</span>
                            <span>{subscription.autoRenew ? 'Sí' : 'No'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Características</h3>
                        <div className="space-y-2">
                          {features.slice(0, 4).map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>{feature.name}</span>
                            </div>
                          ))}
                          {features.length > 4 && (
                            <p className="text-xs text-gray-500">
                              +{features.length - 4} características más
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Acciones</h3>
                        <div className="space-y-2">
                          {isActive && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => handleSubscriptionAction(subscription.id, 'pause')}
                                disabled={actionLoading === subscription.id}
                              >
                                <Pause className="w-4 h-4 mr-2" />
                                Pausar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => router.push(`/perfil/suscripciones/${subscription.id}/edit`)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Cambiar Plan
                              </Button>
                            </>
                          )}
                          
                          {isPaused && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => handleSubscriptionAction(subscription.id, 'resume')}
                              disabled={actionLoading === subscription.id}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Reanudar
                            </Button>
                          )}

                          {(isActive || isPaused) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                if (confirm('¿Estás seguro de que quieres cancelar esta suscripción?')) {
                                  handleSubscriptionAction(subscription.id, 'cancel')
                                }
                              }}
                              disabled={actionLoading === subscription.id}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancelar
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Factura
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Status Messages */}
                    {isPaused && (
                      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Pause className="w-5 h-5 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Suscripción pausada</span>
                        </div>
                        <p className="text-yellow-700 text-sm mt-1">
                          Tu suscripción está pausada. No se realizarán cargos hasta que la reanudes.
                        </p>
                      </div>
                    )}

                    {isCancelled && (
                      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <X className="w-5 h-5 text-red-600" />
                          <span className="font-medium text-red-800">Suscripción cancelada</span>
                        </div>
                        <p className="text-red-700 text-sm mt-1">
                          Tu suscripción ha sido cancelada. Puedes crear una nueva cuando quieras.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}

            {/* Add New Subscription */}
            <Card className="border-dashed border-2 border-gray-300 hover:border-orange-400 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Agregar Nueva Suscripción</h3>
                <p className="text-gray-600 mb-4">
                  Explora nuestros otros planes de suscripción
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/suscripciones')}
                >
                  Ver Planes Disponibles
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}