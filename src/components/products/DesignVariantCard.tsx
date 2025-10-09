'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Eye,
  Palette,
  Zap
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

interface ProductDesignVariant {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl?: string;
  basePrice: number;
  designSurcharge: number;
  totalPrice?: number;
  featured: boolean;
  designComplexity: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'PREMIUM';
  allowCustomization: boolean;
  customizationPrice?: number;
  product: {
    id: string;
    name: string;
    slug: string;
    stock: number;
    variants: Array<{
      id: string;
      size?: string;
      colorName?: string;
      stock: number;
    }>;
  };
  categories?: Array<{
    category: {
      name: string;
      slug: string;
    };
  }>;
  salesCount?: number;
}

interface DesignVariantCardProps {
  designVariant: ProductDesignVariant;
  showBaseProduct?: boolean;
  size?: 'small' | 'medium' | 'large';
  onAddToCart?: (variantId: string) => void;
  onCustomize?: (variantId: string) => void;
  className?: string;
}

export default function DesignVariantCard({
  designVariant,
  showBaseProduct = true,
  size = 'medium',
  onAddToCart,
  onCustomize,
  className = ''
}: DesignVariantCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalPrice = designVariant.totalPrice || 
    (designVariant.basePrice + designVariant.designSurcharge);
  
  const availableStock = designVariant.product.variants.reduce(
    (sum, variant) => sum + variant.stock, 
    0
  );

  const hasStock = availableStock > 0;

  const getComplexityIcon = () => {
    switch (designVariant.designComplexity) {
      case 'SIMPLE':
        return <Zap className="w-3 h-3" />;
      case 'MEDIUM':
        return <Zap className="w-3 h-3" />;
      case 'COMPLEX':
        return <Zap className="w-3 h-3" />;
      case 'PREMIUM':
        return <Star className="w-3 h-3" />;
      default:
        return <Zap className="w-3 h-3" />;
    }
  };

  const getComplexityColor = () => {
    const colors = {
      SIMPLE: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      COMPLEX: 'bg-orange-100 text-orange-800',
      PREMIUM: 'bg-purple-100 text-purple-800'
    };
    return colors[designVariant.designComplexity];
  };

  const handleQuickAdd = async () => {
    if (!hasStock) {
      toast.error('Sin stock disponible');
      return;
    }

    setLoading(true);
    try {
      // Si solo hay una variante disponible, añadirla directamente
      const availableVariants = designVariant.product.variants.filter(v => v.stock > 0);
      
      if (availableVariants.length === 1) {
        if (onAddToCart) {
          onAddToCart(availableVariants[0].id);
        } else {
          // Lógica por defecto para añadir al carrito
          const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              designVariantId: designVariant.id,
              productId: designVariant.product.id,
              variantId: availableVariants[0].id,
              quantity: 1
            })
          });

          if (response.ok) {
            toast.success('Añadido al carrito');
          } else {
            toast.error('Error al añadir al carrito');
          }
        }
      } else {
        // Redirigir a la página del diseño para seleccionar variante
        window.location.href = `/design-variants/${designVariant.slug}`;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error al añadir al carrito');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomize = () => {
    if (onCustomize) {
      onCustomize(designVariant.id);
    } else {
      window.location.href = `/editor/${designVariant.product.id}?template=${designVariant.id}`;
    }
  };

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    // Aquí podrías añadir lógica para guardar favoritos
  };

  const cardSizes = {
    small: {
      container: 'w-full max-w-sm',
      image: 'h-32',
      title: 'text-sm',
      price: 'text-base',
      button: 'text-xs px-2 py-1'
    },
    medium: {
      container: 'w-full max-w-sm',
      image: 'h-48',
      title: 'text-base',
      price: 'text-lg',
      button: 'text-sm px-3 py-2'
    },
    large: {
      container: 'w-full max-w-md',
      image: 'h-64',
      title: 'text-lg',
      price: 'text-xl',
      button: 'text-base px-4 py-2'
    }
  };

  const currentSize = cardSizes[size];

  return (
    <Card className={`${currentSize.container} group hover:shadow-lg transition-all duration-300 ${className}`}>
      <CardContent className="p-0">
        {/* Imagen del diseño */}
        <div className="relative overflow-hidden rounded-t-lg">
          <Link href={`/design-variants/${designVariant.slug}`}>
            {designVariant.thumbnailUrl ? (
              <Image
                src={designVariant.thumbnailUrl}
                alt={designVariant.name}
                width={400}
                height={300}
                className={`w-full ${currentSize.image} object-cover group-hover:scale-105 transition-transform duration-300`}
              />
            ) : (
              <div className={`w-full ${currentSize.image} bg-gray-200 flex items-center justify-center`}>
                <Palette className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </Link>

          {/* Badges superpuestos */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {designVariant.featured && (
              <Badge className="bg-yellow-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                Destacado
              </Badge>
            )}
            <Badge className={getComplexityColor()}>
              {getComplexityIcon()}
              <span className="ml-1 capitalize">{designVariant.designComplexity.toLowerCase()}</span>
            </Badge>
          </div>

          {/* Botón de favoritos */}
          <button
            onClick={handleToggleLike}
            className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors"
          >
            <Heart 
              className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </button>

          {/* Acciones rápidas al hacer hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button size="sm" variant="secondary" asChild>
              <Link href={`/design-variants/${designVariant.slug}`}>
                <Eye className="w-4 h-4 mr-1" />
                Ver
              </Link>
            </Button>
            {designVariant.allowCustomization && (
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleCustomize}
              >
                <Palette className="w-4 h-4 mr-1" />
                Personalizar
              </Button>
            )}
          </div>

          {/* Indicador de stock */}
          {!hasStock && (
            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
              <Badge variant="destructive">Sin Stock</Badge>
            </div>
          )}
        </div>

        {/* Información del diseño */}
        <div className="p-4 space-y-3">
          {/* Título y categoría */}
          <div>
            <Link 
              href={`/design-variants/${designVariant.slug}`}
              className={`font-semibold ${currentSize.title} hover:text-blue-600 transition-colors line-clamp-2`}
            >
              {designVariant.name}
            </Link>
            {showBaseProduct && (
              <p className="text-sm text-gray-600 mt-1">
                {designVariant.product.name}
              </p>
            )}
            {designVariant.categories && designVariant.categories.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {designVariant.categories.map(cat => cat.category.name).join(', ')}
              </p>
            )}
          </div>

          {/* Precio */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`font-bold ${currentSize.price} text-green-600`}>
                €{totalPrice.toFixed(2)}
              </span>
              {designVariant.designSurcharge > 0 && (
                <span className="text-xs text-gray-500 line-through">
                  €{designVariant.basePrice.toFixed(2)}
                </span>
              )}
            </div>
            
            {designVariant.designSurcharge > 0 && (
              <p className="text-xs text-gray-600">
                Incluye diseño personalizado (+€{designVariant.designSurcharge.toFixed(2)})
              </p>
            )}

            {designVariant.allowCustomization && designVariant.customizationPrice && (
              <p className="text-xs text-blue-600">
                + €{designVariant.customizationPrice.toFixed(2)} personalización adicional
              </p>
            )}
          </div>

          {/* Stock info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {hasStock ? `${availableStock} disponibles` : 'Sin stock'}
            </span>
            {designVariant.salesCount !== undefined && (
              <span>{designVariant.salesCount} vendidos</span>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            {designVariant.allowCustomization ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleQuickAdd}
                  disabled={!hasStock || loading}
                  className="flex-1"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  {loading ? 'Añadiendo...' : 'Comprar'}
                </Button>
                <Button
                  size="sm"
                  onClick={handleCustomize}
                  className="flex-1"
                >
                  <Palette className="w-4 h-4 mr-1" />
                  Personalizar
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={handleQuickAdd}
                disabled={!hasStock || loading}
                className="w-full"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                {loading ? 'Añadiendo...' : 'Añadir al Carrito'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}