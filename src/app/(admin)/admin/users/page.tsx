"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Settings,
  Key,
  MoreVertical,
  UserCog
} from "lucide-react"

interface UserAccount {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'employee' | 'customer'
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  avatar?: string
  phone?: string
  lastLogin?: string
  createdAt: string
  permissions: string[]
  department?: string
  position?: string
  twoFactorEnabled: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserAccount[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserAccount[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showNewUserModal, setShowNewUserModal] = useState(false)

  // Mock data
  useEffect(() => {
    const mockUsers: UserAccount[] = [
      {
        id: "USER-001",
        email: "admin@lovilike.es",
        firstName: "María",
        lastName: "García",
        role: "admin",
        status: "active",
        phone: "+34 666 123 456",
        lastLogin: "2025-06-13T14:30:00Z",
        createdAt: "2024-01-15T10:00:00Z",
        permissions: ["all"],
        department: "Administración",
        position: "Administradora General",
        twoFactorEnabled: true
      },
      {
        id: "USER-002",
        email: "carlos.lopez@lovilike.es",
        firstName: "Carlos",
        lastName: "López",
        role: "manager",
        status: "active",
        phone: "+34 677 234 567",
        lastLogin: "2025-06-13T12:15:00Z",
        createdAt: "2024-02-20T09:30:00Z",
        permissions: ["finances", "inventory", "orders"],
        department: "Operaciones",
        position: "Gerente de Operaciones",
        twoFactorEnabled: true
      },
      {
        id: "USER-003",
        email: "ana.martinez@lovilike.es",
        firstName: "Ana",
        lastName: "Martínez",
        role: "employee",
        status: "active",
        phone: "+34 688 345 678",
        lastLogin: "2025-06-13T09:45:00Z",
        createdAt: "2024-03-10T11:20:00Z",
        permissions: ["orders", "customers", "inventory"],
        department: "Atención al Cliente",
        position: "Especialista en Soporte",
        twoFactorEnabled: false
      },
      {
        id: "USER-004",
        email: "david.ruiz@lovilike.es",
        firstName: "David",
        lastName: "Ruiz",
        role: "employee",
        status: "active",
        phone: "+34 699 456 789",
        lastLogin: "2025-06-12T16:20:00Z",
        createdAt: "2024-04-05T14:45:00Z",
        permissions: ["production", "inventory"],
        department: "Producción",
        position: "Técnico de Producción",
        twoFactorEnabled: false
      },
      {
        id: "USER-005",
        email: "laura.silva@lovilike.es",
        firstName: "Laura",
        lastName: "Silva",
        role: "manager",
        status: "inactive",
        phone: "+34 610 567 890",
        lastLogin: "2025-06-01T10:30:00Z",
        createdAt: "2024-01-30T13:15:00Z",
        permissions: ["marketing", "content"],
        department: "Marketing",
        position: "Gerente de Marketing",
        twoFactorEnabled: true
      },
      {
        id: "USER-006",
        email: "miguel.torres@lovilike.es",
        firstName: "Miguel",
        lastName: "Torres",
        role: "employee",
        status: "suspended",
        phone: "+34 621 678 901",
        lastLogin: "2025-05-28T15:45:00Z",
        createdAt: "2024-05-12T12:00:00Z",
        permissions: ["inventory"],
        department: "Almacén",
        position: "Operario de Almacén",
        twoFactorEnabled: false
      },
      {
        id: "USER-007",
        email: "sofia.mendez@lovilike.es",
        firstName: "Sofía",
        lastName: "Méndez",
        role: "employee",
        status: "pending",
        createdAt: "2025-06-10T16:30:00Z",
        permissions: [],
        department: "Diseño",
        position: "Diseñadora Gráfica",
        twoFactorEnabled: false
      }
    ]
    
    setUsers(mockUsers)
    setFilteredUsers(mockUsers)
    setIsLoading(false)
  }, [])

  // Filtrar usuarios
  useEffect(() => {
    let filtered = users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
      const matchesSearch = 
        fullName.includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.department?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.position?.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesRole = selectedRole === "all" || user.role === selectedRole
      const matchesStatus = selectedStatus === "all" || user.status === selectedStatus
      
      return matchesSearch && matchesRole && matchesStatus
    })
    
    setFilteredUsers(filtered)
  }, [users, searchTerm, selectedRole, selectedStatus])

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: "Administrador", color: "bg-red-100 text-red-800", icon: ShieldCheck },
      manager: { label: "Gerente", color: "bg-blue-100 text-blue-800", icon: Shield },
      employee: { label: "Empleado", color: "bg-green-100 text-green-800", icon: User },
      customer: { label: "Cliente", color: "bg-gray-100 text-gray-800", icon: User }
    }
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.employee
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Activo", color: "bg-green-100 text-green-800", icon: CheckCircle },
      inactive: { label: "Inactivo", color: "bg-yellow-100 text-yellow-800", icon: Clock },
      suspended: { label: "Suspendido", color: "bg-red-100 text-red-800", icon: XCircle },
      pending: { label: "Pendiente", color: "bg-blue-100 text-blue-800", icon: AlertCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateStats = () => {
    const total = users.length
    const active = users.filter(u => u.status === 'active').length
    const admins = users.filter(u => u.role === 'admin').length
    const managers = users.filter(u => u.role === 'manager').length
    const employees = users.filter(u => u.role === 'employee').length
    const twoFactorEnabled = users.filter(u => u.twoFactorEnabled).length
    
    return { total, active, admins, managers, employees, twoFactorEnabled }
  }

  const stats = calculateStats()

  const handleActivateUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: 'active' as const } : user
    ))
    toast.success("Usuario activado")
  }

  const handleSuspendUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: 'suspended' as const } : user
    ))
    toast.success("Usuario suspendido")
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      setUsers(users.filter(user => user.id !== userId))
      toast.success("Usuario eliminado")
    }
  }

  const handleResetPassword = (userId: string) => {
    // Simular envío de email de reset
    toast.success("Email de restablecimiento enviado")
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
            <p className="text-gray-600">Administra cuentas de usuario y permisos</p>
          </div>
          <Button 
            onClick={() => setShowNewUserModal(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gerentes</p>
                <p className="text-2xl font-bold text-blue-600">{stats.managers}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Empleados</p>
                <p className="text-2xl font-bold text-green-600">{stats.employees}</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">2FA Activo</p>
                <p className="text-2xl font-bold text-purple-600">{stats.twoFactorEnabled}</p>
                <p className="text-xs text-gray-500">
                  {((stats.twoFactorEnabled / stats.total) * 100).toFixed(0)}%
                </p>
              </div>
              <Key className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, email, departamento o posición..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Administrador</option>
                <option value="manager">Gerente</option>
                <option value="employee">Empleado</option>
                <option value="customer">Cliente</option>
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="suspended">Suspendido</option>
                <option value="pending">Pendiente</option>
              </select>
              
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando usuarios...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
              <p className="text-gray-600">No se encontraron usuarios que coincidan con los filtros.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Usuario</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Rol</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Departamento</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Último Acceso</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">2FA</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-medium">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-3 h-3" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          {user.department && (
                            <p className="font-medium text-gray-900">{user.department}</p>
                          )}
                          {user.position && (
                            <p className="text-sm text-gray-600">{user.position}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {user.lastLogin ? (
                          <span className="text-sm text-gray-600">{formatDateTime(user.lastLogin)}</span>
                        ) : (
                          <span className="text-sm text-gray-400">Nunca</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {user.twoFactorEnabled ? (
                            <CheckCircle className="w-4 h-4 text-green-600" title="2FA activado" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" title="2FA desactivado" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" title="Ver perfil">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" title="Editar usuario">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="Restablecer contraseña"
                            onClick={() => handleResetPassword(user.id)}
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          {user.status === 'active' ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSuspendUser(user.id)}
                              title="Suspender usuario"
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                          ) : user.status === 'suspended' || user.status === 'inactive' ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleActivateUser(user.id)}
                              title="Activar usuario"
                              className="text-green-600 hover:text-green-700"
                            >
                              <UserCheck className="w-4 h-4" />
                            </Button>
                          ) : null}
                          {user.role !== 'admin' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Eliminar usuario"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
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

      {/* Información adicional */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuración de Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <p className="font-medium text-yellow-800">Autenticación de Dos Factores</p>
                <p className="text-sm text-yellow-700">
                  {stats.twoFactorEnabled} de {stats.total} usuarios ({((stats.twoFactorEnabled / stats.total) * 100).toFixed(0)}%)
                </p>
              </div>
              <Key className="w-8 h-8 text-yellow-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="font-medium text-green-800">Usuarios Activos</p>
                <p className="text-sm text-green-700">{stats.active} usuarios con acceso al sistema</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Invitar Nuevo Usuario
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Gestionar Permisos
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Key className="w-4 h-4 mr-2" />
              Políticas de Contraseña
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Enviar Notificación Masiva
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}