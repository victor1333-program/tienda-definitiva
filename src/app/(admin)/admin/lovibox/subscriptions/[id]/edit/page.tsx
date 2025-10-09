"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, User, CreditCard, MapPin } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface SubscriptionForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  level: string;
  frequency: string;
  monthlyPrice: number;
  nextBillingDate: string;
  status: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  giftMessage?: string;
}

export default function EditSubscriptionPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<SubscriptionForm>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    level: 'BASIC',
    frequency: 'MONTHLY',
    monthlyPrice: 24.99,
    nextBillingDate: '',
    status: 'ACTIVE',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'España'
    },
    giftMessage: ''
  });

  const levelPrices = {
    BASIC: 24.99,
    PREMIUM: 39.99,
    VIP: 59.99
  };

  useEffect(() => {
    if (params.id) {
      fetchSubscription();
    }
  }, [params.id]);

  useEffect(() => {
    // Actualizar precio cuando cambia el nivel
    const newPrice = levelPrices[formData.level as keyof typeof levelPrices];
    if (newPrice && newPrice !== formData.monthlyPrice) {
      setFormData(prev => ({ ...prev, monthlyPrice: newPrice }));
    }
  }, [formData.level]);

  const fetchSubscription = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch(`/api/lovibox/subscriptions/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        const subscription = data.subscription;
        
        setFormData({
          customerName: subscription.customer.name,
          customerEmail: subscription.customer.email,
          customerPhone: subscription.customer.phone || '',
          level: subscription.level,
          frequency: subscription.frequency,
          monthlyPrice: subscription.monthlyPrice,
          nextBillingDate: subscription.nextBillingDate.split('T')[0],
          status: subscription.status,
          shippingAddress: subscription.shippingAddress,
          giftMessage: subscription.giftMessage || ''
        });
      } else {
        toast.error('Suscripción no encontrada');
        router.push('/admin/lovibox/subscriptions');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Error al cargar la suscripción');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('shippingAddress.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.customerEmail || !formData.customerName) {
      toast.error('Email y nombre del cliente son requeridos');
      return;
    }

    if (!formData.shippingAddress.street || !formData.shippingAddress.city) {
      toast.error('Dirección de envío es requerida');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/lovibox/subscriptions/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar la suscripción');
      }

      toast.success('Suscripción actualizada exitosamente');
      router.push(`/admin/lovibox/subscriptions/${params.id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar la suscripción');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/lovibox/subscriptions/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Editar Suscripción
          </h1>
          <p className="text-gray-600 mt-1">
            Modificar los detalles de la suscripción
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo *
                </label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Nombre del cliente"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  placeholder="cliente@email.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <Input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                placeholder="+34 XXX XXX XXX"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Suscripción */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Configuración de Suscripción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de Suscripción
                </label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => handleInputChange('level', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASIC">Básica - €{levelPrices.BASIC}/mes</SelectItem>
                    <SelectItem value="PREMIUM">Premium - €{levelPrices.PREMIUM}/mes</SelectItem>
                    <SelectItem value="VIP">VIP - €{levelPrices.VIP}/mes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia
                </label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => handleInputChange('frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Mensual</SelectItem>
                    <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                    <SelectItem value="YEARLY">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Activa</SelectItem>
                    <SelectItem value="PAUSED">Pausada</SelectItem>
                    <SelectItem value="CANCELED">Cancelada</SelectItem>
                    <SelectItem value="PENDING_PAYMENT">Pendiente Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Próximo cobro
                </label>
                <Input
                  type="date"
                  value={formData.nextBillingDate}
                  onChange={(e) => handleInputChange('nextBillingDate', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio mensual (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.monthlyPrice}
                  onChange={(e) => handleInputChange('monthlyPrice', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dirección de Envío */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Dirección de Envío
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección *
              </label>
              <Input
                value={formData.shippingAddress.street}
                onChange={(e) => handleInputChange('shippingAddress.street', e.target.value)}
                placeholder="Calle, número, piso..."
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </label>
                <Input
                  value={formData.shippingAddress.city}
                  onChange={(e) => handleInputChange('shippingAddress.city', e.target.value)}
                  placeholder="Ciudad"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provincia
                </label>
                <Input
                  value={formData.shippingAddress.state}
                  onChange={(e) => handleInputChange('shippingAddress.state', e.target.value)}
                  placeholder="Provincia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal
                </label>
                <Input
                  value={formData.shippingAddress.zipCode}
                  onChange={(e) => handleInputChange('shippingAddress.zipCode', e.target.value)}
                  placeholder="CP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País
                </label>
                <Input
                  value={formData.shippingAddress.country}
                  onChange={(e) => handleInputChange('shippingAddress.country', e.target.value)}
                  placeholder="País"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mensaje de Regalo */}
        <Card>
          <CardHeader>
            <CardTitle>Mensaje de Regalo</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje especial (opcional)
              </label>
              <textarea
                value={formData.giftMessage}
                onChange={(e) => handleInputChange('giftMessage', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={3}
                placeholder="Mensaje especial para las cajas..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
          <Link href={`/admin/lovibox/subscriptions/${params.id}`}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}