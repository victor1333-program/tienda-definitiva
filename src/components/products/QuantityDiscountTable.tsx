"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Package } from 'lucide-react';

interface QuantityDiscount {
  id: string;
  minQuantity: number;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  ruleName: string;
  ruleDescription: string;
}

interface QuantityDiscountTableProps {
  productId: string;
  className?: string;
}

export function QuantityDiscountTable({ productId, className = "" }: QuantityDiscountTableProps) {
  const [discounts, setDiscounts] = useState<QuantityDiscount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuantityDiscounts();
  }, [productId]);

  const fetchQuantityDiscounts = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/quantity-discounts`);
      if (response.ok) {
        const data = await response.json();
        setDiscounts(data);
      }
    } catch (error) {
      console.error('Error al obtener descuentos por cantidad:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDiscount = (discount: QuantityDiscount) => {
    if (discount.discountType === 'PERCENTAGE') {
      return `${discount.discountValue}% de descuento`;
    } else {
      return `${formatPrice(discount.discountValue)} de descuento`;
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (discounts.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-green-600" />
          Descuentos por Cantidad
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {discounts.map((discount, index) => (
            <div key={discount.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-900">
                    {discount.minQuantity}+ unidades
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {discount.ruleDescription}
                </Badge>
              </div>
              <div className="text-right">
                <span className="text-green-700 font-semibold">
                  {formatDiscount(discount)}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 flex items-start gap-2">
            <TrendingDown className="w-4 h-4 mt-0.5" />
            Los descuentos se aplican automáticamente en productos personalizados al alcanzar la cantidad mínima.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}