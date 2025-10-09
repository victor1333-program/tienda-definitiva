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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Heart, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Pause,
  Play,
  X,
  ArrowUpDown,
  Calendar,
  User,
  Mail,
  Phone
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Subscription {
  id: string;
  level: string;
  frequency: string;
  status: string;
  monthlyPrice: number;
  nextBillingDate: string;
  startDate: string;
  totalBoxesReceived: number;
  totalAmountPaid: number;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  deliveries: Array<{
    id: string;
    status: string;
    scheduledDate: string;
    deliveredDate?: string;
  }>;
  _count: {
    deliveries: number;
    payments: number;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
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
    status: 'ALL',
    page: 1
  });

  useEffect(() => {
    fetchSubscriptions();
  }, [filters]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.level && filters.level !== 'ALL') params.append('level', filters.level);
      if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
      params.append('page', filters.page.toString());
      params.append('limit', '25');

      const response = await fetch(`/api/lovibox/subscriptions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (subscriptionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/lovibox/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchSubscriptions(); // Refrescar lista
      }
    } catch (error) {
      console.error('Error updating subscription status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-gray-100 text-gray-800';
      case 'PENDING_PAYMENT': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activa';
      case 'PAUSED': return 'Pausada';
      case 'CANCELED': return 'Cancelada';
      case 'EXPIRED': return 'Expirada';
      case 'PENDING_PAYMENT': return 'Pendiente Pago';
      case 'PENDING_ACTIVATION': return 'Pendiente Activación';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="h-8 w-8 text-orange-500" />
            Gestión de Suscripciones
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona todas las suscripciones de cajas misteriosas y su estado
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/lovibox/subscriptions/new">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Suscripción
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por email o nombre..."
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
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="ACTIVE">Activa</SelectItem>
                <SelectItem value="PAUSED">Pausada</SelectItem>
                <SelectItem value="CANCELED">Cancelada</SelectItem>
                <SelectItem value="EXPIRED">Expirada</SelectItem>
                <SelectItem value="PENDING_PAYMENT">Pendiente Pago</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setFilters({ search: '', level: 'ALL', status: 'ALL', page: 1 })}
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de suscripciones */}
      <Card>
        <CardHeader>
          <CardTitle>
            Suscripciones ({pagination.total})
          </CardTitle>
          <CardDescription>
            Lista de todas las suscripciones con su información principal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Próximo Cobro</TableHead>
                    <TableHead>Entregas</TableHead>
                    <TableHead>Total Pagado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {subscription.customer.name || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {subscription.customer.email}
                          </div>
                          {subscription.customer.phone && (
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {subscription.customer.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getLevelColor(subscription.level)}>
                          {getLevelName(subscription.level)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(subscription.status)}>
                          {getStatusLabel(subscription.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(subscription.monthlyPrice)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {subscription.frequency === 'MONTHLY' ? 'mensual' : subscription.frequency.toLowerCase()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {format(new Date(subscription.nextBillingDate), 'dd MMM yyyy', { locale: es })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{subscription.totalBoxesReceived}</div>
                          <div className="text-sm text-gray-600">
                            {subscription._count.deliveries} programadas
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(subscription.totalAmountPaid)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {subscription._count.payments} pagos
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Ver Detalles */}
                          <Link href={`/admin/lovibox/subscriptions/${subscription.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver detalles">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {/* Editar */}
                          <Link href={`/admin/lovibox/subscriptions/${subscription.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {/* Pausar/Reactivar */}
                          {subscription.status === 'ACTIVE' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700" 
                              onClick={() => handleStatusChange(subscription.id, 'PAUSED')}
                              title="Pausar suscripción"
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          {subscription.status === 'PAUSED' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700" 
                              onClick={() => handleStatusChange(subscription.id, 'ACTIVE')}
                              title="Reactivar suscripción"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Cancelar */}
                          {subscription.status !== 'CANCELED' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700" 
                              onClick={() => handleStatusChange(subscription.id, 'CANCELED')}
                              title="Cancelar suscripción"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {subscriptions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron suscripciones con los filtros aplicados
                </div>
              )}
            </div>
          )}

          {/* Paginación */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} suscripciones
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}