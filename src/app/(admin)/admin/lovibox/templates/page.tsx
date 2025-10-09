"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Box, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  Calendar,
  Package,
  TrendingUp,
  Image,
  Clock
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Template {
  id: string;
  name: string;
  slug: string;
  description?: string;
  level: string;
  theme: string;
  month?: number;
  year?: number;
  image?: string;
  status: string;
  isActive: boolean;
  basicPrice: number;
  premiumPrice: number;
  vipPrice: number;
  productionStartDate?: string;
  shippingStartDate?: string;
  createdAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  products: Array<{
    id: string;
    quantity: number;
    isMainProduct: boolean;
    product: {
      id: string;
      name: string;
      images: string;
      basePrice: number;
    };
  }>;
  _count: {
    deliveries: number;
    productionTasks: number;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    level: 'ALL',
    theme: 'ALL',
    status: 'ALL',
    year: 'ALL',
    page: 1
  });

  useEffect(() => {
    fetchTemplates();
  }, [filters]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.level && filters.level !== 'ALL') params.append('level', filters.level);
      if (filters.theme && filters.theme !== 'ALL') params.append('theme', filters.theme);
      if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.year && filters.year !== 'ALL') params.append('year', filters.year);
      params.append('page', filters.page.toString());
      params.append('limit', '12');

      const response = await fetch(`/api/lovibox/templates?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este template?')) {
      return;
    }

    try {
      const response = await fetch(`/api/lovibox/templates/${templateId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchTemplates(); // Refrescar lista
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'PLANNING': return 'bg-blue-100 text-blue-800';
      case 'DESIGN': return 'bg-purple-100 text-purple-800';
      case 'PRODUCTION': return 'bg-yellow-100 text-yellow-800';
      case 'READY': return 'bg-green-100 text-green-800';
      case 'SHIPPING': return 'bg-orange-100 text-orange-800';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Borrador';
      case 'PLANNING': return 'Planificando';
      case 'DESIGN': return 'Diseño';
      case 'PRODUCTION': return 'Producción';
      case 'READY': return 'Listo';
      case 'SHIPPING': return 'Enviando';
      case 'COMPLETED': return 'Completado';
      case 'CANCELED': return 'Cancelado';
      default: return status;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BASIC': return 'bg-pink-100 text-pink-800';
      case 'PREMIUM': return 'bg-yellow-100 text-yellow-800';
      case 'VIP': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelName = (level: string) => {
    switch (level) {
      case 'BASIC': return 'Básica';
      case 'PREMIUM': return 'Premium';
      case 'VIP': return 'VIP';
      default: return level;
    }
  };

  const getThemeLabel = (theme: string) => {
    const themes: Record<string, string> = {
      'ROMANTIC': 'Romántico',
      'FAMILY': 'Familiar',
      'FRIENDSHIP': 'Amistad',
      'CELEBRATION': 'Celebración',
      'SEASONAL': 'Estacional',
      'WELLNESS': 'Bienestar',
      'CREATIVE': 'Creativo',
      'GOURMET': 'Gourmet',
      'ADVENTURE': 'Aventura',
      'CUSTOM': 'Personalizado'
    };
    return themes[theme] || theme;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  const parseImages = (imagesString: string) => {
    try {
      const images = JSON.parse(imagesString);
      return Array.isArray(images) ? images[0] : null;
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Box className="h-8 w-8 text-orange-500" />
            Templates de Cajas
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona los templates de cajas misteriosas temáticas para cada mes
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/lovibox/templates/new">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Template
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar templates..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              />
            </div>
            
            <Select
              value={filters.level}
              onValueChange={(value) => setFilters(prev => ({ ...prev, level: value, page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los niveles</SelectItem>
                <SelectItem value="BASIC">Básica</SelectItem>
                <SelectItem value="PREMIUM">Premium</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.theme}
              onValueChange={(value) => setFilters(prev => ({ ...prev, theme: value, page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los temas</SelectItem>
                <SelectItem value="ROMANTIC">Romántico</SelectItem>
                <SelectItem value="FAMILY">Familiar</SelectItem>
                <SelectItem value="FRIENDSHIP">Amistad</SelectItem>
                <SelectItem value="CELEBRATION">Celebración</SelectItem>
                <SelectItem value="SEASONAL">Estacional</SelectItem>
                <SelectItem value="WELLNESS">Bienestar</SelectItem>
                <SelectItem value="CREATIVE">Creativo</SelectItem>
                <SelectItem value="GOURMET">Gourmet</SelectItem>
                <SelectItem value="ADVENTURE">Aventura</SelectItem>
                <SelectItem value="CUSTOM">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="DRAFT">Borrador</SelectItem>
                <SelectItem value="PLANNING">Planificando</SelectItem>
                <SelectItem value="DESIGN">Diseño</SelectItem>
                <SelectItem value="PRODUCTION">Producción</SelectItem>
                <SelectItem value="READY">Listo</SelectItem>
                <SelectItem value="SHIPPING">Enviando</SelectItem>
                <SelectItem value="COMPLETED">Completado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.year}
              onValueChange={(value) => setFilters(prev => ({ ...prev, year: value, page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los años</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setFilters({ search: '', level: 'ALL', theme: 'ALL', status: 'ALL', year: 'ALL', page: 1 })}
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid de templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Imagen del template */}
              <div className="relative h-48 bg-gradient-to-br from-orange-100 to-pink-100">
                {template.image ? (
                  <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Image className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge className={getStatusColor(template.status)}>
                    {getStatusLabel(template.status)}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge className={getLevelColor(template.level)}>
                    {getLevelName(template.level)}
                  </Badge>
                </div>
                {!template.isActive && (
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="secondary">Inactivo</Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Título y descripción */}
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                    {template.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {template.month && template.year && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {getMonthName(template.month)} {template.year}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {template.products.length} productos
                    </div>
                  </div>

                  {/* Tema */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{getThemeLabel(template.theme)}</Badge>
                  </div>

                  {/* Precios */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-pink-50 rounded">
                      <div className="font-medium">{formatCurrency(template.basicPrice)}</div>
                      <div className="text-xs text-gray-600">Básica</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <div className="font-medium">{formatCurrency(template.premiumPrice)}</div>
                      <div className="text-xs text-gray-600">Premium</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-medium">{formatCurrency(template.vipPrice)}</div>
                      <div className="text-xs text-gray-600">VIP</div>
                    </div>
                  </div>

                  {/* Estadísticas */}
                  <div className="flex justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {template._count.deliveries} entregas
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {template._count.productionTasks} tareas
                    </div>
                  </div>

                  {/* Fechas importantes */}
                  {(template.productionStartDate || template.shippingStartDate) && (
                    <div className="space-y-1 text-xs text-gray-600">
                      {template.productionStartDate && (
                        <div>Producción: {format(new Date(template.productionStartDate), 'dd/MM/yyyy')}</div>
                      )}
                      {template.shippingStartDate && (
                        <div>Envío: {format(new Date(template.shippingStartDate), 'dd/MM/yyyy')}</div>
                      )}
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/lovibox/templates/${template.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/lovibox/templates/${template.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {templates.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Box className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay templates</h3>
            <p className="text-gray-600 mb-4">
              No se encontraron templates con los filtros aplicados.
            </p>
            <Button asChild>
              <Link href="/admin/lovibox/templates/new">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Template
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Paginación */}
      {pagination.pages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div className="text-sm text-gray-600">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} templates
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Siguiente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}