'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Plus, 
  Star,
  ShoppingCart,
  Eye,
  Zap
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductDesignVariant {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl?: string;
  basePrice: number;
  designSurcharge: number;
  totalPrice: number;
  featured: boolean;
  designComplexity: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'PREMIUM';
  allowCustomization: boolean;
  customizationPrice?: number;
  salesCount: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  isPersonalizable: boolean;
}

interface DesignVariantSelectorProps {
  productId: string;
  product?: Product;
  designVariants?: ProductDesignVariant[];
  selectedDesignId?: string;
  onDesignSelect?: (designId: string) => void;
  onCreateNew?: () => void;
  showCreateButton?: boolean;
  maxDisplay?: number;
  className?: string;
}

export default function DesignVariantSelector({
  productId,
  product,
  designVariants: propVariants,
  selectedDesignId,
  onDesignSelect,
  onCreateNew,
  showCreateButton = true,
  maxDisplay = 6,
  className = ''
}: DesignVariantSelectorProps) {
  const [variants, setVariants] = useState<ProductDesignVariant[]>(propVariants || []);
  const [loading, setLoading] = useState(!propVariants);
  const [productData, setProductData] = useState<Product | null>(product || null);

  useEffect(() => {
    if (!propVariants || !product) {
      loadData();
    }
  }, [productId, propVariants, product]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}/design-variants`);
      const data = await response.json();
      
      if (response.ok) {
        setVariants(data.designVariants || []);
        setProductData(data.product);
      }
    } catch (error) {
      console.error('Error loading design variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplexityColor = (complexity: string) => {
    const colors = {
      SIMPLE: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      COMPLEX: 'bg-orange-100 text-orange-800',
      PREMIUM: 'bg-purple-100 text-purple-800'
    };
    return colors[complexity as keyof typeof colors] || colors.SIMPLE;
  };

  const handleDesignSelect = (designId: string) => {
    if (onDesignSelect) {
      onDesignSelect(designId);
    }
  };

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      // Redirigir al editor por defecto
      window.location.href = `/editor/${productId}`;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Diseños Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Cargando diseños...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!productData?.isPersonalizable) {
    return null;
  }

  const displayVariants = variants.slice(0, maxDisplay);
  const hasMore = variants.length > maxDisplay;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Diseños Disponibles
        </CardTitle>
        <CardDescription>
          Elige un diseño existente o crea uno personalizado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {variants.length === 0 ? (
          <div className="text-center py-8">
            <Palette className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Sin diseños disponibles</h3>
            <p className="text-gray-600 mb-4">
              Sé el primero en crear un diseño para este producto
            </p>
            {showCreateButton && (
              <Button onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Diseño
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Grid de diseños */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {displayVariants.map((variant) => (
                <div
                  key={variant.id}
                  className={`relative group cursor-pointer rounded-lg border-2 transition-all ${
                    selectedDesignId === variant.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleDesignSelect(variant.id)}
                >
                  {/* Imagen del diseño */}
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    {variant.thumbnailUrl ? (
                      <Image
                        src={variant.thumbnailUrl}
                        alt={variant.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Palette className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {variant.featured && (
                      <Badge className="bg-yellow-500 text-white text-xs">
                        <Star className="w-3 h-3" />
                      </Badge>
                    )}
                    <Badge className={`${getComplexityColor(variant.designComplexity)} text-xs`}>
                      <Zap className="w-3 h-3 mr-1" />
                      {variant.designComplexity}
                    </Badge>
                  </div>

                  {/* Información */}
                  <div className="p-3 space-y-2">
                    <h4 className="font-medium text-sm line-clamp-2">{variant.name}</h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-green-600">
                          €{variant.totalPrice.toFixed(2)}
                        </span>
                        {variant.designSurcharge > 0 && (
                          <span className="text-xs text-gray-500 block">
                            +€{variant.designSurcharge.toFixed(2)} diseño
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {variant.salesCount} vendidos
                      </div>
                    </div>

                    {variant.allowCustomization && (
                      <div className="text-xs text-blue-600">
                        ✨ Personalizable
                        {variant.customizationPrice && (
                          <span> (+€{variant.customizationPrice.toFixed(2)})</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Overlay de selección */}
                  {selectedDesignId === variant.id && (
                    <div className="absolute inset-0 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Badge className="bg-blue-500 text-white">
                        Seleccionado
                      </Badge>
                    </div>
                  )}

                  {/* Acciones al hover */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                    <Button size="sm" variant="secondary" asChild>
                      <Link href={`/design-variants/${variant.slug}`} target="_blank">
                        <Eye className="w-3 h-3" />
                      </Link>
                    </Button>
                    {variant.allowCustomization && (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/editor/${productId}?template=${variant.id}`;
                        }}
                      >
                        <Palette className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Botón para crear nuevo */}
            {showCreateButton && (
              <>
                <Separator />
                <Button
                  variant="outline"
                  onClick={handleCreateNew}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Diseño Personalizado
                </Button>
              </>
            )}

            {/* Enlace para ver todos */}
            {hasMore && (
              <div className="text-center">
                <Link 
                  href={`/productos/${productData?.slug}?tab=designs`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Ver todos los diseños ({variants.length})
                </Link>
              </div>
            )}

            {/* Información del diseño seleccionado */}
            {selectedDesignId && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                {(() => {
                  const selectedVariant = variants.find(v => v.id === selectedDesignId);
                  return selectedVariant ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{selectedVariant.name}</h4>
                        <Badge className={getComplexityColor(selectedVariant.designComplexity)}>
                          {selectedVariant.designComplexity}
                        </Badge>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Precio base:</span>
                          <span>€{selectedVariant.basePrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Diseño:</span>
                          <span>€{selectedVariant.designSurcharge.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span className="text-green-600">€{selectedVariant.totalPrice.toFixed(2)}</span>
                        </div>
                        
                        {selectedVariant.allowCustomization && selectedVariant.customizationPrice && (
                          <div className="text-xs text-blue-600 mt-2">
                            + €{selectedVariant.customizationPrice.toFixed(2)} si personalizas más
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" asChild className="flex-1">
                          <Link href={`/design-variants/${selectedVariant.slug}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalles
                          </Link>
                        </Button>
                        
                        {selectedVariant.allowCustomization && (
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => window.location.href = `/editor/${productId}?template=${selectedVariant.id}`}
                          >
                            <Palette className="w-4 h-4 mr-1" />
                            Personalizar
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}