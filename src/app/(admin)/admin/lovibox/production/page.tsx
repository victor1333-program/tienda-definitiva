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
  Factory, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Package,
  TrendingUp,
  Target,
  Timer
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ProductionTask {
  id: string;
  templateId: string;
  status: string;
  priority: string;
  assignedTo?: string;
  estimatedDuration: number;
  actualDuration?: number;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  notes?: string;
  blockers?: string;
  createdAt: string;
  template: {
    id: string;
    name: string;
    level: string;
    theme: string;
    month?: number;
    year?: number;
  };
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  };
}

interface ProductionStats {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageCompletionTime: number;
  productionEfficiency: number;
}

export default function ProductionPage() {
  const [tasks, setTasks] = useState<ProductionTask[]>([]);
  const [stats, setStats] = useState<ProductionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    priority: 'ALL',
    assignedTo: 'ALL'
  });

  const statusConfig = {
    PENDING: { label: 'Pendiente', color: 'bg-gray-100 text-gray-800', icon: Clock },
    IN_PROGRESS: { label: 'En Progreso', color: 'bg-blue-100 text-blue-800', icon: Play },
    REVIEW: { label: 'Revisión', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
    COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    ON_HOLD: { label: 'En Espera', color: 'bg-red-100 text-red-800', icon: Pause }
  };

  const priorityConfig = {
    LOW: { label: 'Baja', color: 'bg-gray-100 text-gray-800' },
    MEDIUM: { label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
    HIGH: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
    URGENT: { label: 'Urgente', color: 'bg-red-100 text-red-800' }
  };

  useEffect(() => {
    fetchProductionData();
  }, [filters]);

  const fetchProductionData = async () => {
    try {
      setLoading(true);
      
      // Fetch production tasks
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.priority !== 'ALL') params.append('priority', filters.priority);
      if (filters.assignedTo !== 'ALL') params.append('assignedTo', filters.assignedTo);
      
      const [tasksResponse, statsResponse] = await Promise.all([
        fetch(`/api/lovibox/production/tasks?${params}`),
        fetch('/api/lovibox/production/stats')
      ]);

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.tasks || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching production data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/lovibox/production/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchProductionData();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getProgressPercentage = (task: ProductionTask) => {
    if (task.status === 'COMPLETED') return 100;
    if (task.status === 'PENDING') return 0;
    if (task.status === 'IN_PROGRESS') return 50;
    if (task.status === 'REVIEW') return 90;
    return 25;
  };

  const isOverdue = (task: ProductionTask) => {
    return new Date(task.scheduledEnd) < new Date() && task.status !== 'COMPLETED';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Factory className="h-8 w-8 text-orange-500" />
            Centro de Producción
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión y seguimiento de la producción de cajas misteriosas
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/admin/lovibox/production/new">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/lovibox/production/calendar">
              <Calendar className="h-4 w-4 mr-2" />
              Calendario
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tareas Activas</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTasks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTasks} tareas totales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.productionEfficiency}%</div>
              <p className="text-xs text-muted-foreground">
                Promedio del mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageCompletionTime}h</div>
              <p className="text-xs text-muted-foreground">
                Por tarea completada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
              <p className="text-xs text-muted-foreground">
                Requieren atención
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar tareas por template, asignado..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas las prioridades</SelectItem>
                {Object.entries(priorityConfig).map(([priority, config]) => (
                  <SelectItem key={priority} value={priority}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setFilters({ search: '', status: 'ALL', priority: 'ALL', assignedTo: 'ALL' })}
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tareas de Producción</CardTitle>
          <CardDescription>
            Gestiona y supervisa el progreso de todas las tareas de producción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Asignado</TableHead>
                <TableHead>Programado</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const statusInfo = statusConfig[task.status as keyof typeof statusConfig];
                const priorityInfo = priorityConfig[task.priority as keyof typeof priorityConfig];
                const overdue = isOverdue(task);
                const progress = getProgressPercentage(task);

                return (
                  <TableRow key={task.id} className={overdue ? 'bg-red-50' : ''}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{task.template.name}</div>
                        <div className="text-sm text-gray-500">
                          {task.template.theme} - {task.template.level}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusInfo.color}>
                        <statusInfo.icon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityInfo.color}>
                        {priorityInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {task.assignedUser?.name || 'Sin asignar'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          {format(new Date(task.scheduledStart), 'dd MMM', { locale: es })} - 
                          {format(new Date(task.scheduledEnd), 'dd MMM', { locale: es })}
                        </div>
                        {overdue && (
                          <div className="text-red-600 font-medium">¡Atrasado!</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            task.status === 'COMPLETED' ? 'bg-green-500' : 
                            overdue ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{progress}%</div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                            disabled={task.status === 'IN_PROGRESS'}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Iniciar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                            disabled={task.status === 'COMPLETED'}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Completar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateTaskStatus(task.id, 'ON_HOLD')}
                            disabled={task.status === 'ON_HOLD'}
                          >
                            <Pause className="w-4 h-4 mr-2" />
                            Pausar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/admin/lovibox/production/tasks/${task.id}`} className="flex items-center">
                              Ver Detalles
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {tasks.length === 0 && (
            <div className="text-center py-12">
              <Factory className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tareas</h3>
              <p className="mt-1 text-sm text-gray-500">
                Las tareas de producción aparecerán aquí cuando se creen.
              </p>
              <div className="mt-6">
                <Link href="/admin/lovibox/production/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primera Tarea
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}