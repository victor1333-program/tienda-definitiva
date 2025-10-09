'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ImageIcon, 
  Upload, 
  X, 
  Save, 
  ArrowLeft,
  AlertCircle,
  Tag,
  Palette,
  Settings,
  DollarSign
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  isPersonalizable: boolean;
}

interface ZakekeTemplate {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  templateData: any;
  productTypes: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface DesignVariantFormData {
  name: string;
  description: string;
  shortDescription: string;
  images: string[];
  thumbnailUrl: string;
  designSurcharge: number;
  comparePrice?: number;
  designData: any;
  designComplexity: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'PREMIUM';
  metaTitle: string;
  metaDescription: string;
  marketingTags: string[];
  allowCustomization: boolean;
  customizationPrice?: number;
  featured: boolean;
  isActive: boolean;
  isPublic: boolean;
  categoryIds: string[];
}

interface DesignVariantFormProps {
  designVariant?: any;
  productId?: string;
  templateId?: string;
  onSave?: (data: DesignVariantFormData) => void;
  onCancel?: () => void;
}

export default function DesignVariantForm({
  designVariant,
  productId,
  templateId,
  onSave,
  onCancel
}: DesignVariantFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<ZakekeTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ZakekeTemplate | null>(null);
  const [filteredTemplates, setFilteredTemplates] = useState<ZakekeTemplate[]>([]);
  
  const [formData, setFormData] = useState<DesignVariantFormData>({
    name: '',
    description: '',
    shortDescription: '',
    images: [],
    thumbnailUrl: '',
    designSurcharge: 0,
    comparePrice: undefined,
    designData: {},
    designComplexity: 'SIMPLE',
    metaTitle: '',
    metaDescription: '',
    marketingTags: [],
    allowCustomization: false,
    customizationPrice: undefined,
    featured: false,
    isActive: true,
    isPublic: true,
    categoryIds: []
  });

  const [newTag, setNewTag] = useState('');
  const [imageUpload, setImageUpload] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Cargar datos iniciales
  useEffect(() => {
    console.log('🚀 DesignVariantForm mounted, loading initial data...');
    loadInitialData();
  }, []);

  // Cargar datos del formulario si se está editando
  useEffect(() => {
    if (designVariant) {
      setFormData({
        name: designVariant.name,
        description: designVariant.description || '',
        shortDescription: designVariant.shortDescription || '',
        images: JSON.parse(designVariant.images || '[]'),
        thumbnailUrl: designVariant.thumbnailUrl || '',
        designSurcharge: designVariant.designSurcharge,
        comparePrice: designVariant.comparePrice,
        designData: designVariant.designData,
        designComplexity: designVariant.designComplexity,
        metaTitle: designVariant.metaTitle || '',
        metaDescription: designVariant.metaDescription || '',
        marketingTags: designVariant.marketingTags || [],
        allowCustomization: designVariant.allowCustomization,
        customizationPrice: designVariant.customizationPrice,
        featured: designVariant.featured,
        isActive: designVariant.isActive,
        isPublic: designVariant.isPublic,
        categoryIds: designVariant.categories?.map((cat: any) => cat.categoryId) || []
      });
      
      setSelectedProduct(designVariant.product);
      setSelectedTemplate(designVariant.template);
    }
  }, [designVariant]);

  const loadInitialData = async () => {
    try {
      console.log('🔍 Loading form data...');
      setDataLoading(true);
      
      const response = await fetch('/api/admin/design-variants/form-data', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📡 API Response data:', data);

      if (!response.ok) {
        console.error('❌ API Error:', data);
        throw new Error(data.error || 'Error al cargar datos');
      }

      const { products, templates, categories } = data.data || {};
      
      console.log('📊 Data counts:', {
        products: products?.length,
        templates: templates?.length,
        categories: categories?.length
      });
      
      setProducts(products || []);
      setTemplates(templates || []);
      setCategories(categories || []);
      
      // Inicializar filteredTemplates
      setFilteredTemplates(templates || []);

      // Si hay productId predefinido, seleccionarlo
      if (productId && products) {
        const product = products.find((p: Product) => p.id === productId);
        if (product) {
          console.log('✅ Pre-selecting product:', product.name);
          setSelectedProduct(product);
          
          // Filtrar plantillas para el producto preseleccionado
          const filtered = (templates || []).filter((template: ZakekeTemplate) => {
            // Verificar que productTypes existe y es un array
            if (!template.productTypes || !Array.isArray(template.productTypes)) {
              return false;
            }
            
            return template.productTypes.some(type => 
              type.toLowerCase().includes(product.slug.toLowerCase()) ||
              product.slug.toLowerCase().includes(type.toLowerCase()) ||
              product.name.toLowerCase().includes(type.toLowerCase()) ||
              type.toLowerCase().includes(product.name.toLowerCase())
            );
          });
          setFilteredTemplates(filtered);
        }
      }

      // Si hay templateId predefinido, seleccionarlo
      if (templateId && templates) {
        const template = templates.find((t: ZakekeTemplate) => t.id === templateId);
        if (template) {
          console.log('✅ Pre-selecting template:', template.name);
          setSelectedTemplate(template);
          setFormData(prev => ({
            ...prev,
            designData: template.templateData,
            name: prev.name || template.name
          }));
        }
      }
      
      console.log('✅ Form data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      toast.error('Error al cargar datos iniciales: ' + (error as Error).message);
    } finally {
      setDataLoading(false);
    }
  };

  // Debug: Log when activeTab changes
  useEffect(() => {
    console.log('🎯 Active tab changed to:', activeTab);
  }, [activeTab]);

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    
    // Filtrar plantillas basadas en el producto seleccionado
    if (product) {
      const filtered = templates.filter(template => {
        // Verificar que productTypes existe y es un array
        if (!template.productTypes || !Array.isArray(template.productTypes)) {
          return false;
        }
        
        return template.productTypes.some(type => 
          type.toLowerCase().includes(product.slug.toLowerCase()) ||
          product.slug.toLowerCase().includes(type.toLowerCase()) ||
          product.name.toLowerCase().includes(type.toLowerCase()) ||
          type.toLowerCase().includes(product.name.toLowerCase())
        );
      });
      setFilteredTemplates(filtered);
      console.log(`🔍 Filtered ${filtered.length} templates for product "${product.name}":`, filtered.map(t => t.name));
    } else {
      setFilteredTemplates(templates);
    }
    
    // Reset selected template cuando cambia el producto
    setSelectedTemplate(null);
    setFormData(prev => ({
      ...prev,
      designData: {},
      name: prev.name || ''
    }));
  };

  const handleTemplateChange = (templateId: string) => {
    if (templateId === 'none') {
      setSelectedTemplate(null);
      setFormData(prev => ({
        ...prev,
        designData: {},
        name: prev.name || ''
      }));
      return;
    }

    const template = filteredTemplates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
    
    if (template) {
      setFormData(prev => ({
        ...prev,
        designData: template.templateData,
        name: prev.name || template.name
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.marketingTags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        marketingTags: [...prev.marketingTags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      marketingTags: prev.marketingTags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = async (file: File) => {
    setImageUpload(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'design-variants');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      });

      const data = await response.json();

      if (response.ok) {
        const imageUrl = data.url;
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, imageUrl],
          thumbnailUrl: prev.thumbnailUrl || imageUrl
        }));
        toast.success('Imagen subida correctamente');
      } else {
        toast.error(data.error || 'Error al subir imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir imagen');
    } finally {
      setImageUpload(false);
    }
  };

  const handleRemoveImage = (imageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageToRemove),
      thumbnailUrl: prev.thumbnailUrl === imageToRemove ? 
        (prev.images.find(img => img !== imageToRemove) || '') : 
        prev.thumbnailUrl
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast.error('Selecciona un producto');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Agrega al menos una imagen');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        productId: selectedProduct.id,
        templateId: selectedTemplate?.id || null,
        basePrice: selectedProduct.basePrice
      };

      if (onSave) {
        onSave(submitData);
      } else {
        const url = designVariant 
          ? `/api/design-variants/${designVariant.id}`
          : '/api/design-variants';
        
        const method = designVariant ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        });

        const data = await response.json();

        if (response.ok) {
          toast.success(designVariant ? 'Variante actualizada' : 'Variante creada');
          if (onCancel) {
            onCancel();
          } else {
            router.push('/admin/design-variants');
          }
        } else {
          toast.error(data.error || 'Error al guardar variante');
        }
      }
    } catch (error) {
      console.error('Error saving variant:', error);
      toast.error('Error al guardar variante');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    return selectedProduct ? selectedProduct.basePrice + formData.designSurcharge : 0;
  };

  if (dataLoading) {
    console.log('📡 Still loading data, showing loading screen...');
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => onCancel ? onCancel() : router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {designVariant ? 'Editar Variante' : 'Nueva Variante de Diseño'}
              </h1>
              <p className="text-gray-600">
                Cargando datos del formulario...
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('🎨 Rendering form with data loaded. Active tab:', activeTab);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => onCancel ? onCancel() : router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {designVariant ? 'Editar Variante' : 'Nueva Variante de Diseño'}
            </h1>
            <p className="text-gray-600">
              {designVariant ? 'Modifica los datos de la variante' : 'Crea una nueva variante de diseño'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => onCancel ? onCancel() : router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="images">Imágenes</TabsTrigger>
          <TabsTrigger value="pricing">Precios</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Información Básica */}
        <TabsContent value="basic">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>
                  Datos básicos de la variante de diseño
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selección de producto */}
                {!productId && (
                  <div className="space-y-2">
                    <Label htmlFor="product">Producto Base *</Label>
                    <Select 
                      value={selectedProduct?.id || ''} 
                      onValueChange={handleProductChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - €{product.basePrice}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Selección de plantilla */}
                <div className="space-y-2">
                  <Label htmlFor="template">Plantilla (Opcional)</Label>
                  <Select 
                    value={selectedTemplate?.id || 'none'} 
                    onValueChange={handleTemplateChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una plantilla" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin plantilla</SelectItem>
                      {filteredTemplates.length === 0 && selectedProduct ? (
                        <SelectItem value="no-templates" disabled>
                          No hay plantillas para este producto
                        </SelectItem>
                      ) : (
                        filteredTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} ({template.category})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      name: e.target.value 
                    }))}
                    placeholder="Ej: Camiseta Tigre Feroz"
                    required
                  />
                </div>

                {/* Descripción corta */}
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Descripción Corta</Label>
                  <Input
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      shortDescription: e.target.value 
                    }))}
                    placeholder="Descripción breve para listados"
                  />
                </div>

                {/* Descripción completa */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción Completa</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                    placeholder="Descripción detallada del diseño..."
                    rows={4}
                  />
                </div>

                {/* Complejidad */}
                <div className="space-y-2">
                  <Label htmlFor="complexity">Complejidad del Diseño</Label>
                  <Select 
                    value={formData.designComplexity} 
                    onValueChange={(value: any) => setFormData(prev => ({ 
                      ...prev, 
                      designComplexity: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIMPLE">Simple</SelectItem>
                      <SelectItem value="MEDIUM">Medio</SelectItem>
                      <SelectItem value="COMPLEX">Complejo</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categorías y Tags</CardTitle>
                <CardDescription>
                  Organización y etiquetas para la variante
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Categorías */}
                <div className="space-y-2">
                  <Label>Categorías</Label>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label key={category.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.categoryIds.includes(category.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                categoryIds: [...prev.categoryIds, category.id]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                categoryIds: prev.categoryIds.filter(id => id !== category.id)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tags de marketing */}
                <div className="space-y-2">
                  <Label>Tags de Marketing</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Nuevo tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" onClick={handleAddTag} size="sm">
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.marketingTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Resumen de precio */}
                {selectedProduct && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Resumen de Precio</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Precio base del producto:</span>
                        <span>€{selectedProduct.basePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sobreprecio del diseño:</span>
                        <span>€{formData.designSurcharge.toFixed(2)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-medium">
                        <span>Precio total:</span>
                        <span>€{calculateTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Imágenes */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Imágenes del Diseño
              </CardTitle>
              <CardDescription>
                Sube imágenes del diseño finalizado (mockups, renders, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload de imágenes */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Sube imágenes del diseño</p>
                  <p className="text-gray-600">PNG, JPG hasta 10MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button type="button" asChild disabled={imageUpload}>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {imageUpload ? 'Subiendo...' : 'Seleccionar Imagen'}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              {/* Grid de imágenes */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={image}
                        alt={`Imagen ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setFormData(prev => ({ 
                              ...prev, 
                              thumbnailUrl: image 
                            }))}
                          >
                            Principal
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveImage(image)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {formData.thumbnailUrl === image && (
                        <Badge className="absolute top-2 left-2">Principal</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {formData.images.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto text-yellow-500 mb-2" />
                  <p className="text-gray-600">No hay imágenes. Agrega al menos una imagen.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Precios */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Configuración de Precios
              </CardTitle>
              <CardDescription>
                Define los precios y costos de la variante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Sobreprecio del diseño */}
                  <div className="space-y-2">
                    <Label htmlFor="designSurcharge">Sobreprecio del Diseño *</Label>
                    <Input
                      id="designSurcharge"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.designSurcharge}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        designSurcharge: parseFloat(e.target.value) || 0 
                      }))}
                      placeholder="0.00"
                    />
                    <p className="text-sm text-gray-600">
                      Precio adicional por el diseño personalizado
                    </p>
                  </div>

                  {/* Precio de comparación */}
                  <div className="space-y-2">
                    <Label htmlFor="comparePrice">Precio de Comparación</Label>
                    <Input
                      id="comparePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.comparePrice || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        comparePrice: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))}
                      placeholder="0.00"
                    />
                    <p className="text-sm text-gray-600">
                      Precio "antes" para mostrar descuentos
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Personalización adicional */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allowCustomization"
                        checked={formData.allowCustomization}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          allowCustomization: checked,
                          customizationPrice: checked ? prev.customizationPrice : undefined
                        }))}
                      />
                      <Label htmlFor="allowCustomization">
                        Permitir Personalización Adicional
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600">
                      Permite a los clientes personalizar este diseño
                    </p>
                  </div>

                  {formData.allowCustomization && (
                    <div className="space-y-2">
                      <Label htmlFor="customizationPrice">
                        Precio por Personalización
                      </Label>
                      <Input
                        id="customizationPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.customizationPrice || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          customizationPrice: e.target.value ? parseFloat(e.target.value) : undefined
                        }))}
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Resumen de precios */}
              {selectedProduct && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-3">Resumen de Precios</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Precio Base</p>
                      <p className="text-lg font-medium">€{selectedProduct.basePrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Sobreprecio Diseño</p>
                      <p className="text-lg font-medium text-blue-600">
                        +€{formData.designSurcharge.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Precio Final</p>
                      <p className="text-xl font-bold text-green-600">
                        €{calculateTotalPrice().toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {formData.allowCustomization && formData.customizationPrice && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        + €{formData.customizationPrice.toFixed(2)} por personalización adicional
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>Optimización SEO</CardTitle>
              <CardDescription>
                Configura los metadatos para motores de búsqueda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Título SEO</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    metaTitle: e.target.value 
                  }))}
                  placeholder="Título optimizado para SEO..."
                  maxLength={60}
                />
                <p className="text-sm text-gray-600">
                  {formData.metaTitle.length}/60 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Descripción SEO</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    metaDescription: e.target.value 
                  }))}
                  placeholder="Descripción optimizada para SEO..."
                  rows={3}
                  maxLength={155}
                />
                <p className="text-sm text-gray-600">
                  {formData.metaDescription.length}/155 caracteres
                </p>
              </div>

              {/* Vista previa */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Vista Previa en Google</h4>
                <div className="space-y-1">
                  <div className="text-blue-600 text-lg">
                    {formData.metaTitle || formData.name || 'Título de la variante'}
                  </div>
                  <div className="text-green-600 text-sm">
                    ejemplo.com/design-variants/{formData.name.toLowerCase().replace(/\s+/g, '-')}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {formData.metaDescription || formData.shortDescription || 'Descripción de la variante...'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración Avanzada
              </CardTitle>
              <CardDescription>
                Estados y configuraciones de la variante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Estados</h4>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        isActive: checked 
                      }))}
                    />
                    <Label htmlFor="isActive">Activo</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        isPublic: checked 
                      }))}
                    />
                    <Label htmlFor="isPublic">Público</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        featured: checked 
                      }))}
                    />
                    <Label htmlFor="featured">Destacado</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Información del Sistema</h4>
                  
                  {designVariant && (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">ID:</span> {designVariant.id}
                      </div>
                      <div>
                        <span className="font-medium">SKU:</span> {designVariant.sku}
                      </div>
                      <div>
                        <span className="font-medium">Slug:</span> {designVariant.slug}
                      </div>
                      <div>
                        <span className="font-medium">Creado:</span>{' '}
                        {new Date(designVariant.createdAt).toLocaleString()}
                      </div>
                      {designVariant.updatedAt !== designVariant.createdAt && (
                        <div>
                          <span className="font-medium">Actualizado:</span>{' '}
                          {new Date(designVariant.updatedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Datos del diseño (solo mostrar si existe) */}
              {formData.designData && Object.keys(formData.designData).length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Datos del Diseño</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-xs overflow-auto max-h-32">
                      {JSON.stringify(formData.designData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}