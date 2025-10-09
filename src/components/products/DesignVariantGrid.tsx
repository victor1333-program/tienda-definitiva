'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  SortAsc
} from 'lucide-react';
import DesignVariantCard from './DesignVariantCard';

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
  categories: Array<{
    category: {
      name: string;
      slug: string;
    };
  }>;
  salesCount: number;
}

interface DesignVariantFilters {
  search: string;
  category: string;
  complexity: string;
  priceRange: [number, number];
  sortBy: string;
  showOnlyInStock: boolean;
  showOnlyCustomizable: boolean;
}

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface DesignVariantGridProps {
  designVariants?: ProductDesignVariant[];
  filters?: Partial<DesignVariantFilters>;
  onFilterChange?: (filters: Partial<DesignVariantFilters>) => void;
  pagination?: PaginationProps;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  productId?: string;
  categorySlug?: string;
  showFilters?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  gridCols?: 2 | 3 | 4 | 5;
  className?: string;
}

export default function DesignVariantGrid({
  designVariants: propVariants,
  filters: propFilters,
  onFilterChange,
  pagination: propPagination,
  onPageChange,
  loading: propLoading,
  productId,
  categorySlug,
  showFilters = true,
  viewMode = 'grid',
  onViewModeChange,
  gridCols = 4,
  className = ''
}: DesignVariantGridProps) {
  const [variants, setVariants] = useState<ProductDesignVariant[]>(propVariants || []);
  const [loading, setLoading] = useState(propLoading || false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  
  const [localFilters, setLocalFilters] = useState<DesignVariantFilters>({
    search: '',
    category: '',
    complexity: '',
    priceRange: [0, 1000],
    sortBy: 'createdAt',
    showOnlyInStock: false,
    showOnlyCustomizable: false,
    ...propFilters
  });

  const [pagination, setPagination] = useState<PaginationProps>(
    propPagination || { page: 1, limit: 12, total: 0, pages: 0 }
  );

  const [currentViewMode, setCurrentViewMode] = useState(viewMode);

  // Cargar categorías para filtros
  useEffect(() => {
    if (showFilters) {
      loadCategories();
    }
  }, [showFilters]);

  // Cargar variantes si no se proporcionan como props
  useEffect(() => {
    if (!propVariants) {
      loadVariants();
    }
  }, [localFilters, pagination.page, productId, categorySlug, propVariants]);

  // Actualizar estado local cuando cambien las props
  useEffect(() => {
    if (propVariants) {
      setVariants(propVariants);
    }
  }, [propVariants]);

  useEffect(() => {
    if (propPagination) {
      setPagination(propPagination);
    }
  }, [propPagination]);

  useEffect(() => {
    if (propLoading !== undefined) {
      setLoading(propLoading);
    }
  }, [propLoading]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadVariants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: localFilters.sortBy,
        ...(productId && { productId }),
        ...(categorySlug && { category: categorySlug }),
        ...(localFilters.search && { search: localFilters.search }),
        ...(localFilters.category && { category: localFilters.category }),
        ...(localFilters.complexity && { complexity: localFilters.complexity })
      });

      const response = await fetch(`/api/design-variants?${params}`);
      const data = await response.json();

      if (response.ok) {
        let filteredVariants = data.designVariants;

        // Aplicar filtros locales
        if (localFilters.showOnlyInStock) {
          filteredVariants = filteredVariants.filter((variant: ProductDesignVariant) => 
            variant.product.variants.some(v => v.stock > 0)
          );
        }

        if (localFilters.showOnlyCustomizable) {
          filteredVariants = filteredVariants.filter((variant: ProductDesignVariant) => 
            variant.allowCustomization
          );
        }

        // Filtro de precio
        if (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 1000) {
          filteredVariants = filteredVariants.filter((variant: ProductDesignVariant) => {
            const price = variant.totalPrice || (variant.basePrice + variant.designSurcharge);
            return price >= localFilters.priceRange[0] && price <= localFilters.priceRange[1];
          });
        }

        setVariants(filteredVariants);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error loading variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<DesignVariantFilters>) => {
    const updatedFilters = { ...localFilters, ...newFilters };
    setLocalFilters(updatedFilters);
    
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
    
    // Reset a la primera página cuando cambien los filtros
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setCurrentViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  const getGridCols = () => {
    const colsMap = {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
    };
    return colsMap[gridCols];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="space-y-2">
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Buscar diseños..."
                    value={localFilters.search}
                    onChange={(e) => handleFilterChange({ search: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select 
                  value={localFilters.category} 
                  onValueChange={(value) => handleFilterChange({ category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las categorías</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Complejidad */}
              <div className="space-y-2">
                <Label>Complejidad</Label>
                <Select 
                  value={localFilters.complexity} 
                  onValueChange={(value) => handleFilterChange({ complexity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    <SelectItem value="SIMPLE">Simple</SelectItem>
                    <SelectItem value="MEDIUM">Medio</SelectItem>
                    <SelectItem value="COMPLEX">Complejo</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenar */}
              <div className="space-y-2">
                <Label>Ordenar por</Label>
                <Select 
                  value={localFilters.sortBy} 
                  onValueChange={(value) => handleFilterChange({ sortBy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Más recientes</SelectItem>
                    <SelectItem value="name">Nombre A-Z</SelectItem>
                    <SelectItem value="price">Precio menor</SelectItem>
                    <SelectItem value="popularity">Más populares</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros adicionales */}
            <div className="mt-4 flex flex-wrap gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.showOnlyInStock}
                  onChange={(e) => handleFilterChange({ showOnlyInStock: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Solo con stock</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.showOnlyCustomizable}
                  onChange={(e) => handleFilterChange({ showOnlyCustomizable: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Solo personalizables</span>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {variants.length} diseño{variants.length !== 1 ? 's' : ''}
            {categorySlug && ` en ${categorySlug}`}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadVariants}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Controles de vista */}
        <div className="flex items-center gap-2">
          <Button
            variant={currentViewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewModeChange('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={currentViewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewModeChange('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid de productos */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Cargando diseños...</span>
        </div>
      ) : variants.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-3">
              <div className="text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-medium">No se encontraron diseños</h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros o busca con otros términos.
              </p>
              <Button 
                variant="outline" 
                onClick={() => handleFilterChange({
                  search: '',
                  category: '',
                  complexity: '',
                  showOnlyInStock: false,
                  showOnlyCustomizable: false
                })}
              >
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={currentViewMode === 'grid' ? 
            `grid ${getGridCols()} gap-6` : 
            'space-y-4'
          }>
            {variants.map((variant) => (
              <DesignVariantCard
                key={variant.id}
                designVariant={variant}
                size={currentViewMode === 'list' ? 'small' : 'medium'}
                showBaseProduct={!productId}
              />
            ))}
          </div>

          {/* Paginación */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} resultados
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                {/* Números de página */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={pagination.page === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  {pagination.pages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <Button
                        variant={pagination.page === pagination.pages ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pagination.pages)}
                      >
                        {pagination.pages}
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}