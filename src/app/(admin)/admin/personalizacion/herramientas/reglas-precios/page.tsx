"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, Package, Settings, Search } from 'lucide-react';
import { PricingRuleManager } from '@/components/admin/personalization/PricingRuleManager';

interface Product {
  id: string;
  name: string;
  slug: string;
  isPersonalizable: boolean;
  sides: ProductSide[];
}

interface ProductSide {
  id: string;
  name: string;
  displayName?: string;
  printAreas: PrintArea[];
}

interface PrintArea {
  id: string;
  name: string;
  displayName?: string;
}

interface PricingRule {
  id: string;
  name: string;
  description: string;
  productId: string;
  product: Product;
  isActive: boolean;
  rules: PricingRuleItem[];
  quantityDiscounts: QuantityDiscount[];
  createdAt: string;
  updatedAt: string;
}

interface PricingRuleItem {
  id: string;
  type: 'SIDE' | 'AREA';
  sideId?: string;
  printAreaId?: string;
  price: number;
  side?: ProductSide;
  printArea?: PrintArea;
}

interface QuantityDiscount {
  id: string;
  minQuantity: number;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
}

export default function PricingRulesPage() {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPricingRules();
    fetchProducts();
  }, []);

  const fetchPricingRules = async () => {
    try {
      const response = await fetch('/api/personalization/pricing-rules');
      if (response.ok) {
        const data = await response.json();
        setPricingRules(data);
      }
    } catch (error) {
      console.error('Error al obtener reglas de precios:', error);
      toast.error('Error al cargar las reglas de precios');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/personalizable');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setProducts([]);
    }
  };

  const handleSaveRule = async (ruleData: Partial<PricingRule>) => {
    try {
      const url = selectedRule
        ? `/api/personalization/pricing-rules/${selectedRule.id}`
        : '/api/personalization/pricing-rules';
      
      const method = selectedRule ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ruleData),
      });

      if (response.ok) {
        toast.success(selectedRule ? 'Regla actualizada exitosamente' : 'Regla creada exitosamente');
        fetchPricingRules();
        setIsDialogOpen(false);
        setSelectedRule(null);
      } else {
        throw new Error('Error al guardar la regla');
      }
    } catch (error) {
      console.error('Error al guardar regla:', error);
      toast.error('Error al guardar la regla');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta regla?')) return;

    try {
      const response = await fetch(`/api/personalization/pricing-rules/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Regla eliminada exitosamente');
        fetchPricingRules();
      } else {
        throw new Error('Error al eliminar la regla');
      }
    } catch (error) {
      console.error('Error al eliminar regla:', error);
      toast.error('Error al eliminar la regla');
    }
  };

  const filteredRules = pricingRules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reglas de Precios</h1>
          <p className="text-gray-600">Gestiona las reglas de precios para personalizaciones</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedRule(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Regla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedRule ? 'Editar Regla de Precios' : 'Nueva Regla de Precios'}
              </DialogTitle>
            </DialogHeader>
            <PricingRuleManager
              rule={selectedRule}
              products={products}
              onSave={handleSaveRule}
              onCancel={() => {
                setIsDialogOpen(false);
                setSelectedRule(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar reglas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredRules.length} reglas
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredRules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reglas de precios</h3>
                <p className="text-gray-600 text-center mb-4">
                  Crea tu primera regla de precios para gestionar los costos de personalización
                </p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Regla
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredRules.map((rule) => (
              <Card key={rule.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      <CardDescription>
                        {rule.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRule(rule);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Producto: <span className="font-medium">{rule.product.name}</span>
                      </span>
                    </div>

                    {rule.rules.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Reglas de Personalización</h4>
                        <div className="space-y-2">
                          {rule.rules.map((ruleItem) => (
                            <div key={ruleItem.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {ruleItem.type === 'SIDE' ? 'Lado' : 'Área'}
                                </Badge>
                                <span className="text-sm">
                                  {ruleItem.type === 'SIDE' 
                                    ? ruleItem.side?.displayName || ruleItem.side?.name
                                    : ruleItem.printArea?.displayName || ruleItem.printArea?.name
                                  }
                                </span>
                              </div>
                              <span className="text-sm font-medium">
                                {formatPrice(ruleItem.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {rule.quantityDiscounts.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Descuentos por Cantidad</h4>
                        <div className="space-y-2">
                          {rule.quantityDiscounts.map((discount) => (
                            <div key={discount.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                              <span className="text-sm">
                                {discount.minQuantity}+ unidades
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                {discount.discountType === 'PERCENTAGE' 
                                  ? `${discount.discountValue}% descuento`
                                  : `${formatPrice(discount.discountValue)} descuento`
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}