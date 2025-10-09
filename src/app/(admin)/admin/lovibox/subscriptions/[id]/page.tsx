"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  User, 
  CreditCard, 
  MapPin, 
  Package, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Pause,
  Play,
  X
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Subscription {
  id: string;
  level: string;
  frequency: string;
  status: string;
  monthlyPrice: number;
  nextBillingDate: string;
  startDate: string;
  totalBoxesReceived: number;
  totalAmountPaid: number;
  giftMessage?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences: {
    colors: string[];
    themes: string[];
    excludeCategories: string[];
  };
  deliveries: Array<{
    id: string;
    status: string;
    scheduledDate: string;
    deliveredDate?: string;
    templateId?: string;
    template?: {
      name: string;
      theme: string;
    };
  }>;
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    paymentDate: string;
    paymentMethod: string;
  }>;
}

export default function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchSubscription();
    }
  }, [params.id]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lovibox/subscriptions/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      } else {
        console.error('Subscription not found');
        router.push('/admin/lovibox/subscriptions');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/lovibox/subscriptions/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchSubscription();
      }
    } catch (error) {
      console.error('Error updating subscription status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-gray-100 text-gray-800';
      case 'PENDING_PAYMENT': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activa';
      case 'PAUSED': return 'Pausada';
      case 'CANCELED': return 'Cancelada';
      case 'EXPIRED': return 'Expirada';
      case 'PENDING_PAYMENT': return 'Pendiente Pago';
      case 'PENDING_ACTIVATION': return 'Pendiente Activación';
      default: return status;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BASIC': return 'bg-blue-100 text-blue-800';
      case 'PREMIUM': return 'bg-purple-100 text-purple-800';
      case 'VIP': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900">Suscripción no encontrada</h3>
        <p className="mt-1 text-sm text-gray-500">
          La suscripción que buscas no existe o ha sido eliminada.
        </p>
        <div className="mt-6">
          <Link href="/admin/lovibox/subscriptions">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Suscripciones
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/lovibox/subscriptions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Suscripción #{subscription.id.slice(-8)}
            </h1>
            <p className="text-gray-600 mt-1">
              Detalles completos de la suscripción
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/lovibox/subscriptions/${subscription.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          {subscription.status === 'ACTIVE' && (
            <Button 
              variant="outline" 
              onClick={() => handleStatusChange('PAUSED')}
              className="text-yellow-600 hover:text-yellow-700"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pausar
            </Button>
          )}
          {subscription.status === 'PAUSED' && (
            <Button 
              variant="outline" 
              onClick={() => handleStatusChange('ACTIVE')}
              className="text-green-600 hover:text-green-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Reactivar
            </Button>
          )}
          {subscription.status !== 'CANCELED' && (
            <Button 
              variant="outline" 
              onClick={() => handleStatusChange('CANCELED')}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* Estado y Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estado</p>
                <Badge className={getStatusColor(subscription.status)}>
                  {getStatusLabel(subscription.status)}
                </Badge>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nivel</p>
                <Badge className={getLevelColor(subscription.level)}>
                  {subscription.level}
                </Badge>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Precio Mensual</p>
                <p className="text-2xl font-bold">{formatCurrency(subscription.monthlyPrice)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pagado</p>
                <p className="text-2xl font-bold">{formatCurrency(subscription.totalAmountPaid)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información del Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Datos Personales</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Nombre:</span>
                  <span className="ml-2 font-medium">{subscription.customer.name}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{subscription.customer.email}</span>
                </div>
                {subscription.customer.phone && (
                  <div>
                    <span className="text-sm text-gray-600">Teléfono:</span>
                    <span className="ml-2 font-medium">{subscription.customer.phone}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Dirección de Envío
              </h4>
              <div className="text-sm text-gray-600">
                <p>{subscription.shippingAddress.street}</p>
                <p>{subscription.shippingAddress.city}, {subscription.shippingAddress.state}</p>
                <p>{subscription.shippingAddress.zipCode}</p>
                <p>{subscription.shippingAddress.country}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalles de Suscripción */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detalles de Suscripción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Fechas Importantes</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Inicio:</span>
                  <span className="ml-2 font-medium">
                    {format(new Date(subscription.startDate), 'dd MMM yyyy', { locale: es })}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Próximo cobro:</span>
                  <span className="ml-2 font-medium">
                    {format(new Date(subscription.nextBillingDate), 'dd MMM yyyy', { locale: es })}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Frecuencia:</span>
                  <span className="ml-2 font-medium">
                    {subscription.frequency === 'MONTHLY' ? 'Mensual' : subscription.frequency}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Estadísticas</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Cajas recibidas:</span>
                  <span className="ml-2 font-medium">{subscription.totalBoxesReceived}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Entregas programadas:</span>
                  <span className="ml-2 font-medium">{subscription.deliveries.length}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Pagos realizados:</span>
                  <span className="ml-2 font-medium">{subscription.payments.length}</span>
                </div>
              </div>
            </div>
            {subscription.giftMessage && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Mensaje de Regalo</h4>
                <p className="text-sm text-gray-600 italic">"{subscription.giftMessage}"</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Historial de Entregas */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Entregas</CardTitle>
          <CardDescription>
            Todas las entregas programadas y realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription.deliveries.length > 0 ? (
            <div className="space-y-4">
              {subscription.deliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      delivery.status === 'DELIVERED' ? 'bg-green-500' :
                      delivery.status === 'SHIPPED' ? 'bg-blue-500' :
                      delivery.status === 'PROCESSING' ? 'bg-yellow-500' :
                      'bg-gray-300'
                    }`}></div>
                    <div>
                      <p className="font-medium">
                        {delivery.template?.name || `Entrega ${delivery.id.slice(-8)}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {delivery.template?.theme}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {delivery.status === 'DELIVERED' ? 'Entregado' :
                       delivery.status === 'SHIPPED' ? 'Enviado' :
                       delivery.status === 'PROCESSING' ? 'Procesando' : 'Programado'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {delivery.deliveredDate 
                        ? format(new Date(delivery.deliveredDate), 'dd MMM yyyy', { locale: es })
                        : format(new Date(delivery.scheduledDate), 'dd MMM yyyy', { locale: es })
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay entregas programadas aún
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial de Pagos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
          <CardDescription>
            Todos los pagos realizados para esta suscripción
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription.payments.length > 0 ? (
            <div className="space-y-4">
              {subscription.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-gray-600">{payment.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {payment.status === 'COMPLETED' ? 'Completado' : payment.status}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(payment.paymentDate), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay pagos registrados aún
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}