"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Save, User, CreditCard, Calendar, Gift } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface SubscriptionForm {
  customerId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  level: string;
  frequency: string;
  startDate: string;
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
  giftMessage?: string;
}

export default function NewSubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SubscriptionForm>({
    customerId: '',
    customerEmail: '',
    customerName: '',
    customerPhone: '',
    level: 'BASIC',
    frequency: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'España'
    },
    preferences: {
      colors: [],
      themes: [],
      excludeCategories: []
    },
    giftMessage: ''
  });

  const levelPrices = {
    BASIC: 24.99,
    PREMIUM: 39.99,
    VIP: 59.99
  };

  const availableColors = [
    'Rojo', 'Azul', 'Verde', 'Rosa', 'Negro', 'Blanco', 'Morado', 'Naranja'
  ];

  const availableThemes = [
    'ROMANTIC', 'FAMILY', 'FRIENDSHIP', 'CELEBRATION', 'SEASONAL', 'WELLNESS'
  ];

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
    } else if (field.startsWith('preferences.')) {
      const prefField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefField]: value
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
      const response = await fetch('/api/lovibox/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          monthlyPrice: levelPrices[formData.level as keyof typeof levelPrices]
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear la suscripción');
      }

      const result = await response.json();
      toast.success('Suscripción creada exitosamente');
      router.push(`/admin/lovibox/subscriptions/${result.subscription.id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear la suscripción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/lovibox/subscriptions">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Gift className="h-8 w-8 text-orange-500" />
            Nueva Suscripción
          </h1>
          <p className="text-gray-600 mt-1">
            Crear una nueva suscripción a cajas misteriosas
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  Fecha de inicio
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dirección de Envío */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          </CardContent>
        </Card>

        {/* Preferencias */}
        <Card>
          <CardHeader>
            <CardTitle>Preferencias Personales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje de regalo (opcional)
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
            {loading ? 'Creando...' : 'Crear Suscripción'}
          </Button>
          <Link href="/admin/lovibox/subscriptions">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}