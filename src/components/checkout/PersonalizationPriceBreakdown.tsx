"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Package, Palette, TrendingDown, AlertCircle } from 'lucide-react';

interface PriceBreakdownItem {
  description: string;
  amount: number;
  type: 'base' | 'personalization' | 'discount';
}

interface PricingBreakdown {
  basePrice: number;
  personalizationPrice: number;
  quantityDiscount: number;
  finalPrice: number;
  breakdown: PriceBreakdownItem[];
}

interface PersonalizationPriceBreakdownProps {
  productId: string;
  quantity: number;
  selectedSides?: string[];
  selectedAreas?: string[];
  className?: string;
}

export function PersonalizationPriceBreakdown({
  productId,
  quantity,
  selectedSides = [],
  selectedAreas = [],
  className = ""
}: PersonalizationPriceBreakdownProps) {
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      calculatePricing();
    }
  }, [productId, quantity, selectedSides, selectedAreas]);

  const calculatePricing = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/personalization/calculate-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
          sides: selectedSides,
          areas: selectedAreas,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPricing(data);
      } else {
        throw new Error('Error al calcular el precio');
      }
    } catch (error) {
      console.error('Error al calcular precio de personalización:', error);
      setError('Error al calcular el precio');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'base':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'personalization':
        return <Palette className="w-4 h-4 text-orange-600" />;
      case 'discount':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      default:
        return <Calculator className="w-4 h-4 text-gray-600" />;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'base':
        return 'text-blue-600';
      case 'personalization':
        return 'text-orange-600';
      case 'discount':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Desglose del Precio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pricing) {
    return null;
  }

  const hasPersonalization = pricing.breakdown.some(item => item.type === 'personalization');
  const hasDiscounts = pricing.breakdown.some(item => item.type === 'discount');

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          Desglose del Precio
        </CardTitle>
        {quantity > 1 && (
          <Badge variant="outline" className="w-fit">
            {quantity} unidades
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {pricing.breakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                {getItemIcon(item.type)}
                <span className="text-sm text-gray-700">
                  {item.description}
                </span>
              </div>
              <span className={`text-sm font-medium ${getItemColor(item.type)}`}>
                {item.amount >= 0 ? '' : '-'}
                {formatPrice(Math.abs(item.amount))}
              </span>
            </div>
          ))}
        </div>

        {hasPersonalization && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Subtotal producto base:</span>
              <span className="text-sm font-medium">
                {formatPrice(pricing.basePrice * quantity)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Subtotal personalización:</span>
              <span className="text-sm font-medium text-orange-600">
                {formatPrice(pricing.personalizationPrice * quantity)}
              </span>
            </div>
          </div>
        )}

        {hasDiscounts && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Descuentos aplicados
              </span>
            </div>
            <span className="text-xs text-green-700">
              Total ahorrado: {formatPrice(pricing.quantityDiscount * quantity)}
            </span>
          </div>
        )}

        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-lg font-bold text-blue-600">
              {formatPrice(pricing.finalPrice)}
            </span>
          </div>
          {quantity > 1 && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">
                Precio por unidad:
              </span>
              <span className="text-xs text-gray-500">
                {formatPrice(pricing.finalPrice / quantity)}
              </span>
            </div>
          )}
        </div>

        {hasPersonalization && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800 flex items-start gap-2">
              <Palette className="w-3 h-3 mt-0.5 shrink-0" />
              Los precios de personalización se aplicarán automáticamente según las opciones seleccionadas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}