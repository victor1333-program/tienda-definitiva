"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ColoredSwitch } from "@/components/ui/ColoredSwitch"
import { 
  Plus, Copy, Trash2, Edit2, Eye, Download, Upload,
  Palette, Settings, Globe, Star, Check
} from "lucide-react"
import { toast } from "react-hot-toast"

interface ThemeSummary {
  id: string
  name: string
  description?: string
  primaryColor: string
  secondaryColor: string
  logoUrl?: string
  isActive: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
  websites: number // Número de sitios web que usan este tema
}

interface ThemeManagerProps {
  themes: ThemeSummary[]
  onSelectTheme: (themeId: string) => void
  onCreateTheme: () => void
  onDuplicateTheme: (themeId: string) => void
  onDeleteTheme: (themeId: string) => void
  onToggleActive: (themeId: string, isActive: boolean) => void
  onImportTheme: (file: File) => void
  onExportTheme: (themeId: string) => void
}

export default function ThemeManager({
  themes,
  onSelectTheme,
  onCreateTheme,
  onDuplicateTheme,
  onDeleteTheme,
  onToggleActive,
  onImportTheme,
  onExportTheme
}: ThemeManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated'>('updated')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTheme, setNewTheme] = useState({
    name: '',
    description: '',
    basedOn: ''
  })

  const filteredThemes = themes
    .filter(theme => 
      theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      theme.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

  const handleCreateTheme = () => {
    if (!newTheme.name.trim()) {
      toast.error('El nombre del tema es obligatorio')
      return
    }

    // Aquí se crearía el nuevo tema
    onCreateTheme()
    setNewTheme({ name: '', description: '', basedOn: '' })
    setShowCreateForm(false)
    toast.success('Nuevo tema creado')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Temas</h2>
          <p className="text-gray-600 mt-1">
            Administra los temas para diferentes marcas y sitios web
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => document.getElementById('import-file')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Tema
          </Button>
        </div>
      </div>

      {/* Input para importar archivo */}
      <input
        id="import-file"
        type="file"
        accept=".json"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onImportTheme(file)
        }}
        className="hidden"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Temas</p>
                <p className="text-2xl font-bold text-gray-900">{themes.length}</p>
              </div>
              <Palette className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Temas Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {themes.filter(t => t.isActive).length}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sitios Web</p>
                <p className="text-2xl font-bold text-purple-600">
                  {themes.reduce((acc, t) => acc + t.websites, 0)}
                </p>
              </div>
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tema por Defecto</p>
                <p className="text-sm font-bold text-orange-600">
                  {themes.find(t => t.isDefault)?.name || 'No definido'}
                </p>
              </div>
              <Star className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar temas por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="updated">Más recientes</option>
              <option value="created">Más antiguos</option>
              <option value="name">Nombre A-Z</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Formulario crear tema */}
      {showCreateForm && (
        <Card className="border-2 border-dashed border-green-300">
          <CardHeader>
            <CardTitle>➕ Crear Nuevo Tema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nombre del Tema *</Label>
                <Input
                  value={newTheme.name}
                  onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                  placeholder="Ej: Tema Premium, Marca XYZ..."
                />
              </div>
              <div>
                <Label>Basado en</Label>
                <select
                  value={newTheme.basedOn}
                  onChange={(e) => setNewTheme({ ...newTheme, basedOn: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Tema en blanco</option>
                  {themes.map(theme => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label>Descripción</Label>
              <Input
                value={newTheme.description}
                onChange={(e) => setNewTheme({ ...newTheme, description: e.target.value })}
                placeholder="Descripción opcional del tema"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateTheme}>
                Crear Tema
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de temas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredThemes.map((theme) => (
          <Card
            key={theme.id}
            className={`relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
              theme.isActive ? 'ring-2 ring-green-500' : ''
            } ${theme.isDefault ? 'ring-2 ring-orange-500' : ''}`}
            onClick={() => onSelectTheme(theme.id)}
          >
            {/* Color header */}
            <div 
              className="h-3"
              style={{
                background: `linear-gradient(90deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`
              }}
            />

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{theme.name}</CardTitle>
                  {theme.description && (
                    <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
                  )}
                </div>
                
                {/* Badges */}
                <div className="flex flex-col gap-1 ml-3">
                  {theme.isDefault && (
                    <Badge className="bg-orange-100 text-orange-800">
                      <Star className="w-3 h-3 mr-1" />
                      Por defecto
                    </Badge>
                  )}
                  {theme.isActive && (
                    <Badge className="bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      Activo
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Preview colors */}
              <div>
                <p className="text-xs text-gray-600 mb-2">Colores principales:</p>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <span className="text-xs font-mono">{theme.primaryColor}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: theme.secondaryColor }}
                    />
                    <span className="text-xs font-mono">{theme.secondaryColor}</span>
                  </div>
                </div>
              </div>

              {/* Logo preview */}
              {theme.logoUrl && (
                <div>
                  <p className="text-xs text-gray-600 mb-2">Logo:</p>
                  <img
                    src={theme.logoUrl}
                    alt={`Logo ${theme.name}`}
                    className="h-8 object-contain"
                  />
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Sitios web:</span>
                  <span className="font-semibold ml-1">{theme.websites}</span>
                </div>
                <div>
                  <span className="text-gray-500">Actualizado:</span>
                  <span className="font-semibold ml-1">
                    {new Date(theme.updatedAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div className="flex items-center">
                  <ColoredSwitch
                    checked={theme.isActive}
                    onCheckedChange={(checked) => {
                      event?.stopPropagation()
                      onToggleActive(theme.id, checked)
                    }}
                    activeColor="green"
                    inactiveColor="gray"
                  />
                  <span className="text-xs text-gray-600 ml-2">Activo</span>
                </div>

                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectTheme(theme.id)
                    }}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicateTheme(theme.id)
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onExportTheme(theme.id)
                    }}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  {!theme.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0 text-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteTheme(theme.id)
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredThemes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay temas
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'No se encontraron temas con los filtros aplicados'
                : 'Comienza creando tu primer tema personalizado'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Tema
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}