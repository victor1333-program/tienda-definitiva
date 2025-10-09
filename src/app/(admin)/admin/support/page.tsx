"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  Search,
  HelpCircle,
  FileText,
  Video,
  Users,
  Zap,
  Shield,
  Truck,
  CreditCard,
  Package,
  Settings,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Filter,
  Calendar,
  User,
  Tag
} from "lucide-react"

interface SupportTicket {
  id: string
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  customerName: string
  customerEmail: string
  createdAt: string
  updatedAt: string
  assignedTo?: string
  responses: number
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showNewTicketModal, setShowNewTicketModal] = useState(false)

  // Datos de ejemplo para tickets
  useEffect(() => {
    const mockTickets: SupportTicket[] = [
      {
        id: "TICK-001",
        subject: "Problema con personalización de camiseta",
        description: "No puedo cambiar el color de la camiseta en el personalizador",
        status: "open",
        priority: "medium",
        category: "Productos",
        customerName: "Ana García",
        customerEmail: "ana@ejemplo.com",
        createdAt: "2025-06-10T10:30:00Z",
        updatedAt: "2025-06-10T10:30:00Z",
        responses: 0
      },
      {
        id: "TICK-002",
        subject: "Pedido no recibido",
        description: "Hice un pedido hace una semana y aún no lo he recibido",
        status: "in_progress",
        priority: "high",
        category: "Envíos",
        customerName: "Carlos López",
        customerEmail: "carlos@ejemplo.com",
        createdAt: "2025-06-09T15:20:00Z",
        updatedAt: "2025-06-11T09:15:00Z",
        assignedTo: "María Rodríguez",
        responses: 3
      },
      {
        id: "TICK-003",
        subject: "Error en el pago",
        description: "El pago fue rechazado pero se descontó de mi cuenta",
        status: "resolved",
        priority: "urgent",
        category: "Pagos",
        customerName: "Laura Martín",
        customerEmail: "laura@ejemplo.com",
        createdAt: "2025-06-08T12:10:00Z",
        updatedAt: "2025-06-12T14:30:00Z",
        assignedTo: "David Sánchez",
        responses: 5
      },
      {
        id: "TICK-004",
        subject: "Consulta sobre devolución",
        description: "¿Puedo devolver un producto personalizado?",
        status: "closed",
        priority: "low",
        category: "Devoluciones",
        customerName: "Roberto Silva",
        customerEmail: "roberto@ejemplo.com",
        createdAt: "2025-06-07T16:45:00Z",
        updatedAt: "2025-06-12T11:20:00Z",
        assignedTo: "Ana Morales",
        responses: 2
      }
    ]
    
    setTickets(mockTickets)
    setFilteredTickets(mockTickets)
    setIsLoading(false)
  }, [])

  // Filtrar tickets
  useEffect(() => {
    let filtered = tickets.filter(ticket => {
      const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === "all" || ticket.status === selectedStatus
      const matchesPriority = selectedPriority === "all" || ticket.priority === selectedPriority
      
      return matchesSearch && matchesStatus && matchesPriority
    })
    
    setFilteredTickets(filtered)
  }, [tickets, searchTerm, selectedStatus, selectedPriority])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: "Abierto", color: "bg-blue-100 text-blue-800" },
      in_progress: { label: "En Proceso", color: "bg-yellow-100 text-yellow-800" },
      resolved: { label: "Resuelto", color: "bg-green-100 text-green-800" },
      closed: { label: "Cerrado", color: "bg-gray-100 text-gray-800" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: "Baja", color: "bg-gray-100 text-gray-800" },
      medium: { label: "Media", color: "bg-blue-100 text-blue-800" },
      high: { label: "Alta", color: "bg-orange-100 text-orange-800" },
      urgent: { label: "Urgente", color: "bg-red-100 text-red-800" }
    }
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    urgent: tickets.filter(t => t.priority === 'urgent').length
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Centro de Soporte Admin</h1>
        <p className="text-gray-600">Gestiona tickets y consultas de soporte</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <HelpCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Abiertos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Proceso</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resueltos</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgentes</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <Zap className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por ticket, cliente o asunto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Todos los estados</option>
                <option value="open">Abierto</option>
                <option value="in_progress">En Proceso</option>
                <option value="resolved">Resuelto</option>
                <option value="closed">Cerrado</option>
              </select>
              
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Todas las prioridades</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
              
              <Button 
                onClick={() => setShowNewTicketModal(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Nuevo Ticket
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets de Soporte ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tickets</h3>
              <p className="text-gray-600">No se encontraron tickets que coincidan con los filtros.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Asunto</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Prioridad</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Categoría</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Asignado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm">{ticket.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{ticket.subject}</p>
                          <p className="text-sm text-gray-600 truncate max-w-xs">{ticket.description}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{ticket.customerName}</p>
                          <p className="text-sm text-gray-600">{ticket.customerEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="py-3 px-4">
                        {getPriorityBadge(ticket.priority)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{ticket.category}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        {ticket.assignedTo ? (
                          <span className="text-sm">{ticket.assignedTo}</span>
                        ) : (
                          <span className="text-sm text-gray-400">Sin asignar</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(ticket.createdAt)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-medium">Base de Conocimiento</h3>
                <p className="text-sm text-gray-600">Gestionar FAQs y artículos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-medium">Agentes de Soporte</h3>
                <p className="text-sm text-gray-600">Gestionar equipo de soporte</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-medium">Reportes</h3>
                <p className="text-sm text-gray-600">Estadísticas de soporte</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}