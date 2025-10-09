'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Star,
  StarOff,
  CheckCircle,
  XCircle,
  Filter,
  RefreshCw
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

interface ProductDesignVariant {
  id: string;
  name: string;
  slug: string;
  sku: string;
  thumbnailUrl?: string;
  basePrice: number;
  designSurcharge: number;
  totalPrice: number;
  isActive: boolean;
  featured: boolean;
  designComplexity: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'PREMIUM';
  salesCount: number;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
  };
  template?: {
    id: string;
    name: string;
    category: string;
  };
  creator?: {
    name: string;
    email: string;
  };
  categories: Array<{
    category: {
      name: string;
      slug: string;
    };
  }>;
}

interface DesignVariantManagerProps {
  productId?: string;
  showCreateButton?: boolean;
  showBulkActions?: boolean;
}

export default function DesignVariantManager({ 
  productId, 
  showCreateButton = true,
  showBulkActions = true 
}: DesignVariantManagerProps) {
  const [variants, setVariants] = useState<ProductDesignVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    complexity: 'all',
    sortBy: 'createdAt'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    variantId?: string;
    variantName?: string;
  }>({ open: false });

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
        ...(productId && { productId }),
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.complexity !== 'all' && { complexity: filters.complexity })
      });

      const response = await fetch(`/api/admin/design-variants?${params}`);
      const data = await response.json();

      if (response.ok) {
        setVariants(data.designVariants);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || 'Error al cargar variantes');
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
      toast.error('Error al cargar variantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [filters, pagination.page, productId]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVariants(variants.map(v => v.id));
    } else {
      setSelectedVariants([]);
    }
  };

  const handleSelectVariant = (variantId: string, checked: boolean) => {
    if (checked) {
      setSelectedVariants(prev => [...prev, variantId]);
    } else {
      setSelectedVariants(prev => prev.filter(id => id !== variantId));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedVariants.length === 0) {
      toast.error('Selecciona al menos una variante');
      return;
    }

    try {
      const response = await fetch('/api/admin/design-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          variantIds: selectedVariants
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Acción ejecutada correctamente');
        setSelectedVariants([]);
        fetchVariants();
      } else {
        toast.error(data.error || 'Error al ejecutar acción');
      }
    } catch (error) {
      console.error('Error in bulk action:', error);
      toast.error('Error al ejecutar acción');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      const response = await fetch(`/api/design-variants/${variantId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Variante eliminada correctamente');
        fetchVariants();
      } else {
        toast.error(data.error || 'Error al eliminar variante');
      }
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast.error('Error al eliminar variante');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Variantes de Diseño</h2>
          <p className="text-gray-600">
            Gestiona los diseños personalizados de tus productos
          </p>
        </div>
        {showCreateButton && (
          <Button asChild>
            <Link href={productId ? `/admin/products/${productId}/design-variants/new` : '/admin/design-variants/new'}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Variante
            </Link>
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar variantes..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.complexity} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, complexity: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Complejidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="SIMPLE">Simple</SelectItem>
                <SelectItem value="MEDIUM">Medio</SelectItem>
                <SelectItem value="COMPLEX">Complejo</SelectItem>
                <SelectItem value="PREMIUM">Premium</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.sortBy} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Fecha creación</SelectItem>
                <SelectItem value="name">Nombre</SelectItem>
                <SelectItem value="salesCount">Ventas</SelectItem>
                <SelectItem value="basePrice">Precio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Acciones masivas */}
      {showBulkActions && selectedVariants.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {selectedVariants.length} variante(s) seleccionada(s)
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('bulk-activate')}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Activar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('bulk-deactivate')}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Desactivar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('bulk-feature')}
                >
                  <Star className="w-4 h-4 mr-1" />
                  Destacar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleBulkAction('bulk-delete')}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Variantes ({pagination.total})</CardTitle>
            <CardDescription>
              Lista de todas las variantes de diseño
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchVariants}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {showBulkActions && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedVariants.length === variants.length && variants.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead>Diseño</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Complejidad</TableHead>
                <TableHead>Ventas</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={showBulkActions ? 9 : 8} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : variants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showBulkActions ? 9 : 8} className="text-center py-8">
                    No hay variantes de diseño
                  </TableCell>
                </TableRow>
              ) : (
                variants.map((variant) => (
                  <TableRow key={variant.id}>
                    {showBulkActions && (
                      <TableCell>
                        <Checkbox
                          checked={selectedVariants.includes(variant.id)}
                          onCheckedChange={(checked) => 
                            handleSelectVariant(variant.id, checked as boolean)
                          }
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {variant.thumbnailUrl ? (
                          <Image
                            src={variant.thumbnailUrl}
                            alt={variant.name}
                            width={40}
                            height={40}
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-xs text-gray-500">IMG</span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{variant.name}</div>
                          <div className="text-sm text-gray-500">{variant.sku}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{variant.product.name}</div>
                        <div className="text-sm text-gray-500">
                          {variant.categories.map(cat => cat.category.name).join(', ')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">€{variant.totalPrice.toFixed(2)}</div>
                        {variant.designSurcharge > 0 && (
                          <div className="text-sm text-gray-500">
                            Base: €{variant.basePrice.toFixed(2)} + €{variant.designSurcharge.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={variant.isActive ? "default" : "secondary"}>
                          {variant.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {variant.featured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getComplexityColor(variant.designComplexity)}>
                        {variant.designComplexity}
                      </Badge>
                    </TableCell>
                    <TableCell>{variant.salesCount}</TableCell>
                    <TableCell>
                      {new Date(variant.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/design-variants/${variant.slug}`} target="_blank">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver en tienda
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/design-variants/${variant.id}/edit`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteDialog({
                              open: true,
                              variantId: variant.id,
                              variantName: variant.name
                            })}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Paginación */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} resultados
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar variante?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la variante "{deleteDialog.variantName}".
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.variantId) {
                  handleDeleteVariant(deleteDialog.variantId);
                  setDeleteDialog({ open: false });
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}