"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ColoredSwitch } from "@/components/ui/ColoredSwitch"
import { toast } from "react-hot-toast"
import { 
  Shield, 
  Save,
  Key,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Globe,
  Activity,
  FileText,
  Download,
  Upload,
  Settings,
  Smartphone,
  Mail,
  Bell,
  Info,
  Zap,
  RefreshCw,
  UserCheck,
  ShieldCheck
} from "lucide-react"

interface SecuritySettings {
  authentication: {
    requireTwoFactor: boolean
    passwordMinLength: number
    passwordRequireNumbers: boolean
    passwordRequireSymbols: boolean
    passwordRequireUppercase: boolean
    passwordExpiration: number
    sessionTimeout: number
    maxLoginAttempts: number
    lockoutDuration: number
  }
  access: {
    enableIPWhitelist: boolean
    ipWhitelist: string[]
    enableGeoBlocking: boolean
    blockedCountries: string[]
    requireSSL: boolean
    enableAPIRateLimit: boolean
    apiRateLimit: number
  }
  monitoring: {
    enableLoginAlerts: boolean
    enableSuspiciousActivityAlerts: boolean
    enableDataExportAlerts: boolean
    enablePermissionChangeAlerts: boolean
    logRetentionDays: number
  }
  backup: {
    enableAutomaticBackups: boolean
    backupFrequency: 'daily' | 'weekly' | 'monthly'
    retentionDays: number
    encryptBackups: boolean
    lastBackupDate?: string
  }
}

interface SecurityEvent {
  id: string
  type: 'login_success' | 'login_failed' | 'password_change' | 'permission_change' | 'data_export' | 'suspicious_activity'
  user: string
  description: string
  ipAddress: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'resolved' | 'investigating'
}

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings>({
    authentication: {
      requireTwoFactor: true,
      passwordMinLength: 8,
      passwordRequireNumbers: true,
      passwordRequireSymbols: true,
      passwordRequireUppercase: true,
      passwordExpiration: 90,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      lockoutDuration: 15
    },
    access: {
      enableIPWhitelist: false,
      ipWhitelist: [],
      enableGeoBlocking: false,
      blockedCountries: [],
      requireSSL: true,
      enableAPIRateLimit: true,
      apiRateLimit: 1000
    },
    monitoring: {
      enableLoginAlerts: true,
      enableSuspiciousActivityAlerts: true,
      enableDataExportAlerts: true,
      enablePermissionChangeAlerts: true,
      logRetentionDays: 90
    },
    backup: {
      enableAutomaticBackups: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      encryptBackups: true,
      lastBackupDate: "2025-06-13T02:00:00Z"
    }
  })

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [showIPInput, setShowIPInput] = useState(false)
  const [newIP, setNewIP] = useState("")

  // Mock data
  useEffect(() => {
    const mockEvents: SecurityEvent[] = [
      {
        id: "SEC-001",
        type: "login_success",
        user: "admin@lovilike.es",
        description: "Inicio de sesión exitoso",
        ipAddress: "192.168.1.100",
        timestamp: "2025-06-13T14:30:00Z",
        severity: "low",
        status: "active"
      },
      {
        id: "SEC-002",
        type: "login_failed",
        user: "unknown@test.com",
        description: "Intento de inicio de sesión fallido - credenciales incorrectas",
        ipAddress: "45.123.67.89",
        timestamp: "2025-06-13T13:45:00Z",
        severity: "medium",
        status: "investigating"
      },
      {
        id: "SEC-003",
        type: "password_change",
        user: "carlos.lopez@lovilike.es",
        description: "Contraseña cambiada exitosamente",
        ipAddress: "192.168.1.105",
        timestamp: "2025-06-13T11:20:00Z",
        severity: "low",
        status: "resolved"
      },
      {
        id: "SEC-004",
        type: "suspicious_activity",
        user: "api_user",
        description: "Múltiples intentos de acceso desde diferentes IPs",
        ipAddress: "Multiple",
        timestamp: "2025-06-13T10:15:00Z",
        severity: "high",
        status: "investigating"
      },
      {
        id: "SEC-005",
        type: "data_export",
        user: "ana.martinez@lovilike.es",
        description: "Exportación de datos de clientes",
        ipAddress: "192.168.1.110",
        timestamp: "2025-06-13T09:30:00Z",
        severity: "medium",
        status: "resolved"
      }
    ]
    
    setSecurityEvents(mockEvents)
    setIsLoading(false)
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Configuración de seguridad guardada correctamente")
      setHasChanges(false)
    } catch (error) {
      toast.error("Error al guardar la configuración")
    } finally {
      setIsLoading(false)
    }
  }

  const updateAuthSettings = (field: string, value: any) => {
    setSettings({
      ...settings,
      authentication: {
        ...settings.authentication,
        [field]: value
      }
    })
    setHasChanges(true)
  }

  const updateAccessSettings = (field: string, value: any) => {
    setSettings({
      ...settings,
      access: {
        ...settings.access,
        [field]: value
      }
    })
    setHasChanges(true)
  }

  const updateMonitoringSettings = (field: string, value: any) => {
    setSettings({
      ...settings,
      monitoring: {
        ...settings.monitoring,
        [field]: value
      }
    })
    setHasChanges(true)
  }

  const updateBackupSettings = (field: string, value: any) => {
    setSettings({
      ...settings,
      backup: {
        ...settings.backup,
        [field]: value
      }
    })
    setHasChanges(true)
  }

  const addIPToWhitelist = () => {
    if (newIP && !settings.access.ipWhitelist.includes(newIP)) {
      updateAccessSettings('ipWhitelist', [...settings.access.ipWhitelist, newIP])
      setNewIP("")
      setShowIPInput(false)
      toast.success("IP añadida a la lista blanca")
    }
  }

  const removeIPFromWhitelist = (ip: string) => {
    updateAccessSettings('ipWhitelist', settings.access.ipWhitelist.filter(item => item !== ip))
    toast.success("IP eliminada de la lista blanca")
  }

  const getEventBadge = (severity: string) => {
    const severityConfig = {
      low: { label: "Bajo", color: "bg-green-100 text-green-800" },
      medium: { label: "Medio", color: "bg-yellow-100 text-yellow-800" },
      high: { label: "Alto", color: "bg-orange-100 text-orange-800" },
      critical: { label: "Crítico", color: "bg-red-100 text-red-800" }
    }
    
    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.low
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Activo", color: "bg-blue-100 text-blue-800", icon: Activity },
      resolved: { label: "Resuelto", color: "bg-green-100 text-green-800", icon: CheckCircle },
      investigating: { label: "Investigando", color: "bg-yellow-100 text-yellow-800", icon: Eye }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
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

  const performBackup = async () => {
    toast.loading("Iniciando backup...")
    
    // Simular backup
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    updateBackupSettings('lastBackupDate', new Date().toISOString())
    toast.dismiss()
    toast.success("Backup completado exitosamente")
  }

  const calculateSecurityScore = () => {
    let score = 0
    
    // Autenticación (40 puntos)
    if (settings.authentication.requireTwoFactor) score += 15
    if (settings.authentication.passwordMinLength >= 8) score += 5
    if (settings.authentication.passwordRequireNumbers) score += 5
    if (settings.authentication.passwordRequireSymbols) score += 5
    if (settings.authentication.passwordRequireUppercase) score += 5
    if (settings.authentication.sessionTimeout <= 60) score += 5
    
    // Acceso (30 puntos)
    if (settings.access.requireSSL) score += 10
    if (settings.access.enableAPIRateLimit) score += 10
    if (settings.access.enableIPWhitelist && settings.access.ipWhitelist.length > 0) score += 10
    
    // Monitoreo (20 puntos)
    if (settings.monitoring.enableLoginAlerts) score += 5
    if (settings.monitoring.enableSuspiciousActivityAlerts) score += 5
    if (settings.monitoring.enableDataExportAlerts) score += 5
    if (settings.monitoring.enablePermissionChangeAlerts) score += 5
    
    // Backup (10 puntos)
    if (settings.backup.enableAutomaticBackups) score += 5
    if (settings.backup.encryptBackups) score += 5
    
    return score
  }

  const securityScore = calculateSecurityScore()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuración de Seguridad</h1>
            <p className="text-gray-600">Gestiona la seguridad y protección de tu tienda</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={performBackup}>
              <Download className="w-4 h-4 mr-2" />
              Backup Manual
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>
        
        {hasChanges && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">Tienes cambios sin guardar</span>
          </div>
        )}
      </div>

      {/* Puntuación de seguridad */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Puntuación de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Nivel de Seguridad</span>
                <span className="text-sm text-gray-600">{securityScore}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    securityScore >= 80 ? 'bg-green-500' :
                    securityScore >= 60 ? 'bg-yellow-500' :
                    securityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${securityScore}%` }}
                />
              </div>
            </div>
            <Badge className={`${
              securityScore >= 80 ? 'bg-green-100 text-green-800' :
              securityScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
              securityScore >= 40 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
            }`}>
              {securityScore >= 80 ? 'Excelente' :
               securityScore >= 60 ? 'Bueno' :
               securityScore >= 40 ? 'Regular' : 'Mejora Necesaria'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Autenticación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Autenticación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Autenticación de Dos Factores</Label>
                <p className="text-sm text-gray-600">Requerir 2FA para todos los usuarios</p>
              </div>
              <ColoredSwitch
                checked={settings.authentication.requireTwoFactor}
                onCheckedChange={(checked) => updateAuthSettings('requireTwoFactor', checked)}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="passwordMinLength">Longitud Mínima de Contraseña</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  min="6"
                  max="32"
                  value={settings.authentication.passwordMinLength}
                  onChange={(e) => updateAuthSettings('passwordMinLength', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="15"
                  max="480"
                  value={settings.authentication.sessionTimeout}
                  onChange={(e) => updateAuthSettings('sessionTimeout', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="maxLoginAttempts">Máx. Intentos de Login</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  min="3"
                  max="10"
                  value={settings.authentication.maxLoginAttempts}
                  onChange={(e) => updateAuthSettings('maxLoginAttempts', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="lockoutDuration">Duración Bloqueo (minutos)</Label>
                <Input
                  id="lockoutDuration"
                  type="number"
                  min="5"
                  max="60"
                  value={settings.authentication.lockoutDuration}
                  onChange={(e) => updateAuthSettings('lockoutDuration', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Requerir Números</Label>
                <ColoredSwitch
                  checked={settings.authentication.passwordRequireNumbers}
                  onCheckedChange={(checked) => updateAuthSettings('passwordRequireNumbers', checked)}
                  activeColor="green"
                  inactiveColor="gray"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Requerir Símbolos</Label>
                <ColoredSwitch
                  checked={settings.authentication.passwordRequireSymbols}
                  onCheckedChange={(checked) => updateAuthSettings('passwordRequireSymbols', checked)}
                  activeColor="green"
                  inactiveColor="gray"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Requerir Mayúsculas</Label>
                <ColoredSwitch
                  checked={settings.authentication.passwordRequireUppercase}
                  onCheckedChange={(checked) => updateAuthSettings('passwordRequireUppercase', checked)}
                  activeColor="green"
                  inactiveColor="gray"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Control de Acceso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Control de Acceso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Requerir SSL/HTTPS</Label>
                <p className="text-sm text-gray-600">Forzar conexiones seguras</p>
              </div>
              <ColoredSwitch
                checked={settings.access.requireSSL}
                onCheckedChange={(checked) => updateAccessSettings('requireSSL', checked)}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Lista Blanca de IPs</Label>
                <p className="text-sm text-gray-600">Restringir acceso por IP</p>
              </div>
              <ColoredSwitch
                checked={settings.access.enableIPWhitelist}
                onCheckedChange={(checked) => updateAccessSettings('enableIPWhitelist', checked)}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
            
            {settings.access.enableIPWhitelist && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  {!showIPInput ? (
                    <Button size="sm" onClick={() => setShowIPInput(true)}>
                      Añadir IP
                    </Button>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <Input
                        placeholder="192.168.1.100"
                        value={newIP}
                        onChange={(e) => setNewIP(e.target.value)}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={addIPToWhitelist}>
                        Añadir
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowIPInput(false)}>
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
                
                {settings.access.ipWhitelist.length > 0 && (
                  <div className="space-y-1">
                    {settings.access.ipWhitelist.map((ip) => (
                      <div key={ip} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-sm">{ip}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => removeIPFromWhitelist(ip)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Límite de API</Label>
                <p className="text-sm text-gray-600">Limitar peticiones por hora</p>
              </div>
              <ColoredSwitch
                checked={settings.access.enableAPIRateLimit}
                onCheckedChange={(checked) => updateAccessSettings('enableAPIRateLimit', checked)}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
            
            {settings.access.enableAPIRateLimit && (
              <div>
                <Label htmlFor="apiRateLimit">Peticiones por Hora</Label>
                <Input
                  id="apiRateLimit"
                  type="number"
                  min="100"
                  max="10000"
                  value={settings.access.apiRateLimit}
                  onChange={(e) => updateAccessSettings('apiRateLimit', parseInt(e.target.value))}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monitoreo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Monitoreo y Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas de Login</Label>
                <p className="text-sm text-gray-600">Notificar inicios de sesión</p>
              </div>
              <ColoredSwitch
                checked={settings.monitoring.enableLoginAlerts}
                onCheckedChange={(checked) => updateMonitoringSettings('enableLoginAlerts', checked)}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Actividad Sospechosa</Label>
                <p className="text-sm text-gray-600">Detectar comportamientos anómalos</p>
              </div>
              <ColoredSwitch
                checked={settings.monitoring.enableSuspiciousActivityAlerts}
                onCheckedChange={(checked) => updateMonitoringSettings('enableSuspiciousActivityAlerts', checked)}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Exportación de Datos</Label>
                <p className="text-sm text-gray-600">Alertar exportaciones masivas</p>
              </div>
              <ColoredSwitch
                checked={settings.monitoring.enableDataExportAlerts}
                onCheckedChange={(checked) => updateMonitoringSettings('enableDataExportAlerts', checked)}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Cambios de Permisos</Label>
                <p className="text-sm text-gray-600">Notificar modificaciones de acceso</p>
              </div>
              <ColoredSwitch
                checked={settings.monitoring.enablePermissionChangeAlerts}
                onCheckedChange={(checked) => updateMonitoringSettings('enablePermissionChangeAlerts', checked)}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
            
            <div>
              <Label htmlFor="logRetentionDays">Retención de Logs (días)</Label>
              <Input
                id="logRetentionDays"
                type="number"
                min="30"
                max="365"
                value={settings.monitoring.logRetentionDays}
                onChange={(e) => updateMonitoringSettings('logRetentionDays', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Backup y Recuperación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Backups Automáticos</Label>
                <p className="text-sm text-gray-600">Copias de seguridad programadas</p>
              </div>
              <ColoredSwitch
                checked={settings.backup.enableAutomaticBackups}
                onCheckedChange={(checked) => updateBackupSettings('enableAutomaticBackups', checked)}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
            
            {settings.backup.enableAutomaticBackups && (
              <>
                <div>
                  <Label htmlFor="backupFrequency">Frecuencia</Label>
                  <select
                    id="backupFrequency"
                    value={settings.backup.backupFrequency}
                    onChange={(e) => updateBackupSettings('backupFrequency', e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="retentionDays">Retención (días)</Label>
                  <Input
                    id="retentionDays"
                    type="number"
                    min="7"
                    max="365"
                    value={settings.backup.retentionDays}
                    onChange={(e) => updateBackupSettings('retentionDays', parseInt(e.target.value))}
                  />
                </div>
              </>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Encriptar Backups</Label>
                <p className="text-sm text-gray-600">Proteger copias de seguridad</p>
              </div>
              <ColoredSwitch
                checked={settings.backup.encryptBackups}
                onCheckedChange={(checked) => updateBackupSettings('encryptBackups', checked)}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
            
            {settings.backup.lastBackupDate && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Último Backup</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  {formatDateTime(settings.backup.lastBackupDate)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Eventos de seguridad recientes */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Eventos de Seguridad Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando eventos...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {securityEvents.map((event) => (
                <div key={event.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{event.description}</span>
                          {getEventBadge(event.severity)}
                          {getStatusBadge(event.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Usuario: {event.user}</span>
                          <span>IP: {event.ipAddress}</span>
                          <span>{formatDateTime(event.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}