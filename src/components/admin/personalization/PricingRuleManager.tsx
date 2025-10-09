"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Package, Search, MapPin, Target, Percent } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
}

interface PricingRuleItem {
  id?: string;
  type: 'SIDE' | 'AREA' | 'QUANTITY_DISCOUNT';
  sideId?: string;
  printAreaId?: string;
  price?: number;
  minQuantity?: number;
  discountType?: 'FIXED' | 'PERCENTAGE';
  discountValue?: number;
  side?: ProductSide;
  printArea?: PrintArea;
}

interface QuantityDiscount {
  id?: string;
  minQuantity: number;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
}

interface PricingRuleManagerProps {
  rule: PricingRule | null;
  products: Product[];
  onSave: (ruleData: Partial<PricingRule>) => void;
  onCancel: () => void;
}

export function PricingRuleManager({ rule, products, onSave, onCancel }: PricingRuleManagerProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productId: '',
    isActive: true,
  });
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pricingRules, setPricingRules] = useState<PricingRuleItem[]>([]);
  const [quantityDiscounts, setQuantityDiscounts] = useState<QuantityDiscount[]>([]);
  const [productSearchValue, setProductSearchValue] = useState('');
  const [showProductList, setShowProductList] = useState(false);

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        description: rule.description,
        productId: rule.productId,
        isActive: rule.isActive,
      });
      
      if (Array.isArray(products)) {
        const product = products.find(p => p.id === rule.productId);
        if (product) {
          setSelectedProduct(product);
          setProductSearchValue(product.name);
        }
      }
      
      setPricingRules(rule.rules || []);
      setQuantityDiscounts(rule.quantityDiscounts || []);
    }
  }, [rule, products]);

  useEffect(() => {
    if (formData.productId && Array.isArray(products)) {
      const product = products.find(p => p.id === formData.productId);
      setSelectedProduct(product || null);
    }
  }, [formData.productId, products]);

  const filteredProducts = useMemo(() => {
    // Asegurar que products sea un array
    if (!Array.isArray(products)) {
      return [];
    }
    
    if (productSearchValue.trim() === '') {
      // Si no hay búsqueda, mostrar todos los productos personalizables
      return products.filter(product => product.isPersonalizable);
    }
    // Si hay búsqueda, filtrar por nombre
    return products.filter(product =>
      product.name.toLowerCase().includes(productSearchValue.toLowerCase()) &&
      product.isPersonalizable
    );
  }, [products, productSearchValue]);

  const addPricingRule = (type: 'SIDE' | 'AREA' | 'QUANTITY_DISCOUNT') => {
    const newRule: PricingRuleItem = {
      type,
      ...(type === 'QUANTITY_DISCOUNT' ? {
        minQuantity: 1,
        discountType: 'PERCENTAGE' as const,
        discountValue: 0,
      } : {
        price: 0,
      }),
    };
    setPricingRules([...pricingRules, newRule]);
  };

  const updatePricingRule = (index: number, field: keyof PricingRuleItem, value: any) => {
    const updatedRules = [...pricingRules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    
    if (field === 'type') {
      // Reset related fields when type changes
      updatedRules[index].sideId = undefined;
      updatedRules[index].printAreaId = undefined;
      updatedRules[index].price = undefined;
      updatedRules[index].minQuantity = undefined;
      updatedRules[index].discountType = undefined;
      updatedRules[index].discountValue = undefined;
      
      // Set default values based on new type
      if (value === 'QUANTITY_DISCOUNT') {
        updatedRules[index].minQuantity = 1;
        updatedRules[index].discountType = 'PERCENTAGE';
        updatedRules[index].discountValue = 0;
      } else {
        updatedRules[index].price = 0;
      }
    }
    
    setPricingRules(updatedRules);
  };

  const removePricingRule = (index: number) => {
    setPricingRules(pricingRules.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('La descripción es requerida');
      return;
    }
    
    if (!formData.productId) {
      toast.error('Debe seleccionar un producto');
      return;
    }

    // Separar reglas de personalización y descuentos por cantidad
    const rules = pricingRules.filter(rule => rule.type !== 'QUANTITY_DISCOUNT');
    const quantityDiscountsFromRules = pricingRules
      .filter(rule => rule.type === 'QUANTITY_DISCOUNT')
      .map(rule => ({
        minQuantity: rule.minQuantity!,
        discountType: rule.discountType!,
        discountValue: rule.discountValue!,
      }));

    const ruleData: Partial<PricingRule> = {
      ...formData,
      rules,
      quantityDiscounts: quantityDiscountsFromRules,
    };

    onSave(ruleData);
  };

  const getSideOptions = () => {
    if (!selectedProduct) return [];
    return selectedProduct.sides || [];
  };

  const getAllAreaOptions = () => {
    if (!selectedProduct) return [];
    return selectedProduct.sides?.flatMap(side => 
      side.printAreas?.map(area => ({
        ...area,
        sideName: side.displayName || side.name,
      })) || []
    ) || [];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la Regla</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Regla de Personalización Camisetas"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="isActive">Estado</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <span className="text-sm text-gray-600">
              {formData.isActive ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción del Precio</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Ej: Personalización Espalda - aparecerá en el desglose del precio"
          rows={3}
          required
        />
        <p className="text-xs text-gray-500">
          Esta descripción aparecerá en el desglose de precios del checkout
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="product">Producto a Enlazar</Label>
        <div className="relative space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar productos personalizables..."
              value={productSearchValue}
              onChange={(e) => setProductSearchValue(e.target.value)}
              onFocus={() => setShowProductList(true)}
              onBlur={() => {
                // Delay hiding to allow clicking on items
                setTimeout(() => setShowProductList(false), 200);
              }}
              className="pl-10"
            />
          </div>
          
          {showProductList && (
            <div className="absolute top-full left-0 right-0 border rounded-md max-h-64 overflow-auto bg-white shadow-lg z-50 mt-1">
              {filteredProducts.length > 0 ? (
                <div className="p-1">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer rounded"
                      onClick={() => {
                        setSelectedProduct(product);
                        setFormData({ ...formData, productId: product.id });
                        setProductSearchValue(product.name);
                        setShowProductList(false);
                      }}
                    >
                      <Package className="w-4 h-4 text-gray-600" />
                      <span className="flex-1">{product.name}</span>
                      <Badge variant="outline" className="text-xs">
                        Personalizable
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {products.length === 0 ? (
                    <div>
                      <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>Cargando productos...</p>
                    </div>
                  ) : (
                    <div>
                      <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No se encontraron productos personalizables</p>
                      <p className="text-xs mt-1">Verifica que el producto tenga personalización habilitada</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {selectedProduct && (
            <div className="flex items-center space-x-2 p-2 bg-blue-50 border border-blue-200 rounded">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800 font-medium">{selectedProduct.name}</span>
              <Badge variant="outline" className="text-xs bg-blue-100">
                Seleccionado
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedProduct(null);
                  setFormData({ ...formData, productId: '' });
                  setProductSearchValue('');
                }}
                className="ml-auto text-blue-600 hover:text-blue-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Busca y selecciona un producto personalizable para configurar sus reglas de precios
        </p>
      </div>

      {selectedProduct && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Configurar Reglas</CardTitle>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addPricingRule('SIDE')}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Aplicar a Lado
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addPricingRule('AREA')}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Aplicar a Área
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addPricingRule('QUANTITY_DISCOUNT')}
                >
                  <Percent className="w-4 h-4 mr-2" />
                  Descuento por Cantidad
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pricingRules.map((rule, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {rule.type === 'SIDE' && <Target className="w-4 h-4 text-blue-600" />}
                    {rule.type === 'AREA' && <MapPin className="w-4 h-4 text-green-600" />}
                    {rule.type === 'QUANTITY_DISCOUNT' && <Percent className="w-4 h-4 text-purple-600" />}
                    <h4 className="font-medium">
                      {rule.type === 'SIDE' && 'Aplicar a Lado'}
                      {rule.type === 'AREA' && 'Aplicar a Área'}
                      {rule.type === 'QUANTITY_DISCOUNT' && 'Descuento por Cantidad'}
                    </h4>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePricingRule(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {rule.type === 'SIDE' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Lado del Producto</Label>
                      <Select
                        value={rule.sideId || ''}
                        onValueChange={(value) => updatePricingRule(index, 'sideId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar lado" />
                        </SelectTrigger>
                        <SelectContent 
                          className="z-[60]"
                          position="popper"
                          sideOffset={4}
                        >
                          {getSideOptions().map((side) => (
                            <SelectItem key={side.id} value={side.id}>
                              <div className="flex items-center space-x-2">
                                <Target className="w-4 h-4" />
                                <span>{side.displayName || side.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Precio Adicional (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={rule.price || 0}
                        onChange={(e) => updatePricingRule(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}

                {rule.type === 'AREA' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Área del Producto</Label>
                      <Select
                        value={rule.printAreaId || ''}
                        onValueChange={(value) => updatePricingRule(index, 'printAreaId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar área" />
                        </SelectTrigger>
                        <SelectContent 
                          className="z-[60]"
                          position="popper"
                          sideOffset={4}
                        >
                          {getAllAreaOptions().map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span>{area.displayName || area.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {(area as any).sideName}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Precio Adicional (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={rule.price || 0}
                        onChange={(e) => updatePricingRule(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}

                {rule.type === 'QUANTITY_DISCOUNT' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Cantidad Mínima</Label>
                      <Input
                        type="number"
                        min="1"
                        value={rule.minQuantity || 1}
                        onChange={(e) => updatePricingRule(index, 'minQuantity', parseInt(e.target.value) || 1)}
                        placeholder="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Descuento</Label>
                      <Select
                        value={rule.discountType || 'PERCENTAGE'}
                        onValueChange={(value: 'FIXED' | 'PERCENTAGE') => updatePricingRule(index, 'discountType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent 
                          className="z-[60]"
                          position="popper"
                          sideOffset={4}
                        >
                          <SelectItem value="PERCENTAGE">Porcentaje (%)</SelectItem>
                          <SelectItem value="FIXED">Precio Fijo (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Valor del Descuento {rule.discountType === 'PERCENTAGE' ? '(%)' : '(€)'}
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max={rule.discountType === 'PERCENTAGE' ? '100' : undefined}
                        value={rule.discountValue || 0}
                        onChange={(e) => updatePricingRule(index, 'discountValue', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {pricingRules.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">
                  Selecciona una opción arriba para empezar a configurar las reglas de precios
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}


      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {rule ? 'Actualizar' : 'Crear'} Regla
        </Button>
      </div>
    </form>
  );
}