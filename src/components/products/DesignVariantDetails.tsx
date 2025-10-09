'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Palette, 
  Star,
  Check,
  Zap,
  ArrowLeft,
  Plus,
  Minus
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import DesignVariantCard from './DesignVariantCard';

interface ProductDesignVariant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  images: string;
  thumbnailUrl?: string;
  basePrice: number;
  designSurcharge: number;
  totalPrice: number;
  comparePrice?: number;
  featured: boolean;
  designComplexity: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'PREMIUM';
  allowCustomization: boolean;
  customizationPrice?: number;
  salesCount: number;
  marketingTags: string[];
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    variants: Array<{
      id: string;
      sku: string;
      size?: string;
      colorName?: string;
      colorHex?: string;
      stock: number;
      price?: number;
    }>;
  };
  template?: {
    id: string;
    name: string;
    category: string;
    allowTextEdit: boolean;
    allowColorEdit: boolean;
    allowImageEdit: boolean;
  };
  categories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  relatedVariants?: Array<{
    id: string;
    name: string;
    slug: string;
    thumbnailUrl?: string;
    basePrice: number;
    designSurcharge: number;
    featured: boolean;
  }>;
}

interface DesignVariantDetailsProps {
  designVariant: ProductDesignVariant;
}

export default function DesignVariantDetails({ designVariant }: DesignVariantDetailsProps) {
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const images = JSON.parse(designVariant.images || '[]');
  const displayImages = images.length > 0 ? images : (designVariant.thumbnailUrl ? [designVariant.thumbnailUrl] : []);

  const availableVariants = designVariant.product.variants.filter(v => v.stock > 0);
  const selectedVariantData = availableVariants.find(v => v.id === selectedVariant);
  const totalStock = availableVariants.reduce((sum, v) => sum + v.stock, 0);

  const getComplexityColor = () => {
    const colors = {
      SIMPLE: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      COMPLEX: 'bg-orange-100 text-orange-800',
      PREMIUM: 'bg-purple-100 text-purple-800'
    };
    return colors[designVariant.designComplexity];
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Selecciona una talla y color');
      return;
    }

    setAddingToCart(true);
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designVariantId: designVariant.id,
          productId: designVariant.product.id,
          variantId: selectedVariant,
          quantity
        })
      });

      if (response.ok) {
        toast.success('Añadido al carrito');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al añadir al carrito');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error al añadir al carrito');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleCustomize = () => {
    window.location.href = `/editor/${designVariant.product.id}?template=${designVariant.id}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: designVariant.name,
          text: designVariant.shortDescription || designVariant.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const canAddToCart = selectedVariant && selectedVariantData && selectedVariantData.stock >= quantity;

  return (
    <div className="container mx-auto py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-gray-900">Inicio</Link>
        <span>/</span>
        <Link href="/productos" className="hover:text-gray-900">Productos</Link>
        <span>/</span>
        <Link 
          href={`/productos/${designVariant.product.slug}`} 
          className="hover:text-gray-900"
        >
          {designVariant.product.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{designVariant.name}</span>
      </div>

      {/* Botón volver */}
      <Button variant="outline" asChild className="mb-6">
        <Link href={`/productos/${designVariant.product.slug}`}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al producto
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <div className="space-y-4">
          {/* Imagen principal */}
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            {displayImages.length > 0 ? (
              <Image
                src={displayImages[selectedImageIndex]}
                alt={designVariant.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Palette className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {displayImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {displayImages.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${designVariant.name} ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {designVariant.featured && (
                <Badge className="bg-yellow-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Destacado
                </Badge>
              )}
              <Badge className={getComplexityColor()}>
                <Zap className="w-3 h-3 mr-1" />
                {designVariant.designComplexity}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{designVariant.name}</h1>
            <p className="text-gray-600 mb-4">
              Diseño personalizado para {designVariant.product.name}
            </p>

            {designVariant.shortDescription && (
              <p className="text-lg text-gray-700 mb-4">
                {designVariant.shortDescription}
              </p>
            )}

            {/* Categorías */}
            {designVariant.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {designVariant.categories.map((cat) => (
                  <Link
                    key={cat.category.id}
                    href={`/categoria/${cat.category.slug}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    #{cat.category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Precio */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-green-600">
                €{designVariant.totalPrice.toFixed(2)}
              </span>
              {designVariant.comparePrice && (
                <span className="text-xl text-gray-500 line-through">
                  €{designVariant.comparePrice.toFixed(2)}
                </span>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              <div>Precio base del producto: €{designVariant.basePrice.toFixed(2)}</div>
              {designVariant.designSurcharge > 0 && (
                <div>Diseño personalizado: +€{designVariant.designSurcharge.toFixed(2)}</div>
              )}
              {designVariant.allowCustomization && designVariant.customizationPrice && (
                <div className="text-blue-600">
                  Personalización adicional: +€{designVariant.customizationPrice.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Selector de variantes */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium mb-2 block">
                Talla y Color *
              </Label>
              <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona talla y color" />
                </SelectTrigger>
                <SelectContent>
                  {availableVariants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      <div className="flex items-center gap-2">
                        {variant.colorHex && (
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: variant.colorHex }}
                          />
                        )}
                        <span>
                          {variant.size && `Talla ${variant.size}`}
                          {variant.size && variant.colorName && ' - '}
                          {variant.colorName}
                        </span>
                        <span className="text-gray-500">({variant.stock} disponibles)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cantidad */}
            <div>
              <Label className="text-base font-medium mb-2 block">
                Cantidad
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!selectedVariantData || quantity >= selectedVariantData.stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {selectedVariantData && (
                <p className="text-sm text-gray-600 mt-1">
                  Máximo disponible: {selectedVariantData.stock}
                </p>
              )}
            </div>
          </div>

          {/* Stock info */}
          <div className="flex items-center gap-4 text-sm">
            <div className={`flex items-center gap-1 ${totalStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full ${totalStock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              {totalStock > 0 ? `${totalStock} disponibles` : 'Sin stock'}
            </div>
            <div className="text-gray-600">
              {designVariant.salesCount} vendidos
            </div>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button 
                onClick={handleAddToCart}
                disabled={!canAddToCart || addingToCart}
                className="flex-1"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {addingToCart ? 'Añadiendo...' : 'Añadir al Carrito'}
              </Button>
              
              <Button variant="outline" onClick={() => setIsLiked(!isLiked)} size="lg">
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              
              <Button variant="outline" onClick={handleShare} size="lg">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {designVariant.allowCustomization && (
              <Button 
                variant="outline" 
                onClick={handleCustomize}
                className="w-full"
                size="lg"
              >
                <Palette className="w-5 h-5 mr-2" />
                Personalizar Este Diseño
                {designVariant.customizationPrice && (
                  <span className="ml-1">
                    (+€{designVariant.customizationPrice.toFixed(2)})
                  </span>
                )}
              </Button>
            )}
          </div>

          {/* Tags de marketing */}
          {designVariant.marketingTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {designVariant.marketingTags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs con información adicional */}
      <div className="mt-12">
        <Tabs defaultValue="description" className="space-y-6">
          <TabsList>
            <TabsTrigger value="description">Descripción</TabsTrigger>
            <TabsTrigger value="template">Plantilla</TabsTrigger>
            <TabsTrigger value="care">Cuidados</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <Card>
              <CardHeader>
                <CardTitle>Descripción del Diseño</CardTitle>
              </CardHeader>
              <CardContent>
                {designVariant.description ? (
                  <div className="prose max-w-none">
                    {designVariant.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No hay descripción disponible.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="template">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Plantilla</CardTitle>
              </CardHeader>
              <CardContent>
                {designVariant.template ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Plantilla: {designVariant.template.name}</h4>
                      <p className="text-gray-600">Categoría: {designVariant.template.category}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Opciones de personalización:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className={`flex items-center gap-2 ${designVariant.template.allowTextEdit ? 'text-green-600' : 'text-gray-400'}`}>
                          <Check className="w-4 h-4" />
                          <span>Editar texto</span>
                        </div>
                        <div className={`flex items-center gap-2 ${designVariant.template.allowColorEdit ? 'text-green-600' : 'text-gray-400'}`}>
                          <Check className="w-4 h-4" />
                          <span>Cambiar colores</span>
                        </div>
                        <div className={`flex items-center gap-2 ${designVariant.template.allowImageEdit ? 'text-green-600' : 'text-gray-400'}`}>
                          <Check className="w-4 h-4" />
                          <span>Editar imágenes</span>
                        </div>
                        <div className={`flex items-center gap-2 ${designVariant.allowCustomization ? 'text-green-600' : 'text-gray-400'}`}>
                          <Check className="w-4 h-4" />
                          <span>Personalizable</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Diseño creado desde cero sin plantilla base.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="care">
            <Card>
              <CardHeader>
                <CardTitle>Cuidados del Producto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Instrucciones de lavado:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Lavar a máquina a 30°C máximo</li>
                      <li>No usar lejía</li>
                      <li>Planchar del revés a temperatura media</li>
                      <li>No lavar en seco</li>
                      <li>Secar colgado, evitar secadora</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Cuidado del diseño:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Lavar del revés para proteger el diseño</li>
                      <li>Evitar suavizantes que puedan dañar la impresión</li>
                      <li>No frotar directamente sobre el diseño</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reseñas de Clientes</CardTitle>
                <CardDescription>
                  Opiniones sobre este diseño específico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    Las reseñas estarán disponibles próximamente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diseños relacionados */}
      {designVariant.relatedVariants && designVariant.relatedVariants.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Otros Diseños de {designVariant.product.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {designVariant.relatedVariants.map((variant) => (
              <DesignVariantCard
                key={variant.id}
                designVariant={{
                  ...variant,
                  totalPrice: variant.basePrice + variant.designSurcharge,
                  designComplexity: 'MEDIUM' as const,
                  allowCustomization: false,
                  product: designVariant.product,
                  categories: []
                }}
                size="medium"
                showBaseProduct={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-medium ${className}`}>{children}</label>;
}