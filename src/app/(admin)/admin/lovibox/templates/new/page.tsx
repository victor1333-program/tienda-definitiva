"use client";

import { useState, useEffect } from "react";
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
import { ArrowLeft, Save, Package, Image, Plus, X, Calendar } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  basePrice: number;
  images: string;
}

interface TemplateProduct {
  productId: string;
  quantity: number;
  isMainProduct: boolean;
}

interface TemplateForm {
  name: string;
  slug: string;
  description: string;
  level: string;
  theme: string;
  month?: number;
  year?: number;
  image?: string;
  basicPrice: number;
  premiumPrice: number;
  vipPrice: number;
  productionStartDate?: string;
  shippingStartDate?: string;
  products: TemplateProduct[];
}

export default function NewTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<TemplateForm>({
    name: '',
    slug: '',
    description: '',
    level: 'BASIC',
    theme: 'ROMANTIC',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicPrice: 24.99,
    premiumPrice: 39.99,
    vipPrice: 59.99,
    products: []
  });

  const themes = [
    { value: 'ROMANTIC', label: 'Romántico' },
    { value: 'FAMILY', label: 'Familiar' },
    { value: 'FRIENDSHIP', label: 'Amistad' },
    { value: 'CELEBRATION', label: 'Celebración' },
    { value: 'SEASONAL', label: 'Estacional' },
    { value: 'WELLNESS', label: 'Bienestar' },
    { value: 'CREATIVE', label: 'Creativo' },
    { value: 'GOURMET', label: 'Gourmet' },
    { value: 'ADVENTURE', label: 'Aventura' },
    { value: 'CUSTOM', label: 'Personalizado' }
  ];

  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Generar slug automáticamente
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    if (slug !== formData.slug) {
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100&status=active');
      if (response.ok) {
        const data = await response.json();
        setAvailableProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [
        ...prev.products,
        { productId: '', quantity: 1, isMainProduct: false }
      ]
    }));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      )
    }));
  };

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.name || !formData.description) {
      toast.error('Nombre y descripción son requeridos');
      return;
    }

    if (formData.products.length === 0) {
      toast.error('Debe agregar al menos un producto');
      return;
    }

    // Verificar que todos los productos están seleccionados
    if (formData.products.some(p => !p.productId)) {
      toast.error('Todos los productos deben estar seleccionados');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/lovibox/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear el template');
      }

      const result = await response.json();
      toast.success('Template creado exitosamente');
      router.push(`/admin/lovibox/templates/${result.template.id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear el template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/lovibox/templates">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-orange-500" />
            Nuevo Template de Caja
          </h1>
          <p className="text-gray-600 mt-1">
            Crear un nuevo template para las cajas misteriosas mensuales
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Template *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Caja San Valentín 2024"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (URL)
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="caja-san-valentin-2024"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={3}
                placeholder="Describe qué incluye esta caja y la experiencia que ofrece..."
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel Mínimo
                </label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => handleInputChange('level', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASIC">Básica</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema
                </label>
                <Select
                  value={formData.theme}
                  onValueChange={(value) => handleInputChange('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map(theme => (
                      <SelectItem key={theme.value} value={theme.value}>
                        {theme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mes
                </label>
                <Select
                  value={formData.month?.toString()}
                  onValueChange={(value) => handleInputChange('month', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año
                </label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  min={2024}
                  max={2030}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Precios */}
        <Card>
          <CardHeader>
            <CardTitle>Precios por Nivel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Básica (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.basicPrice}
                  onChange={(e) => handleInputChange('basicPrice', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Premium (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.premiumPrice}
                  onChange={(e) => handleInputChange('premiumPrice', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio VIP (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.vipPrice}
                  onChange={(e) => handleInputChange('vipPrice', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fechas Importantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Fechas de Producción y Envío
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inicio de Producción
                </label>
                <Input
                  type="date"
                  value={formData.productionStartDate}
                  onChange={(e) => handleInputChange('productionStartDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inicio de Envíos
                </label>
                <Input
                  type="date"
                  value={formData.shippingStartDate}
                  onChange={(e) => handleInputChange('shippingStartDate', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Productos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Productos Incluidos
              <Button type="button" onClick={addProduct} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.products.map((product, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <Select
                      value={product.productId}
                      onValueChange={(value) => updateProduct(index, 'productId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} - €{p.basePrice}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="Cant."
                      value={product.quantity}
                      onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value))}
                      min={1}
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={product.isMainProduct}
                      onChange={(e) => updateProduct(index, 'isMainProduct', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Principal</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeProduct(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {formData.products.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
                </div>
              )}
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
            {loading ? 'Creando...' : 'Crear Template'}
          </Button>
          <Link href="/admin/lovibox/templates">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}