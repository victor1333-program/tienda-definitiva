'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import {
  Settings,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Copy,
  Trash2,
  Layers,
  FileText,
  Wrench,
  Package,
  Download,
  BookOpen
} from "lucide-react"

interface WorkshopProcess {
  id: string
  name: string
  description: string
  productId: string
  productName: string
  category: string
  difficulty: string
  estimatedTime: number
  stepCount: number
  materialCount: number
  equipmentCount: number
  createdAt: string
  tags: string[]
}

export default function WorkshopPage() {
  const router = useRouter()
  const [processes, setProcesses] = useState<WorkshopProcess[]>([])
  const [filteredProcesses, setFilteredProcesses] = useState<WorkshopProcess[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProcesses()
  }, [])

  useEffect(() => {
    filterProcesses()
  }, [processes, searchTerm, categoryFilter, difficultyFilter])

  const loadProcesses = async () => {
    try {
      const response = await fetch('/api/workshop/processes')
      if (response.ok) {
        const data = await response.json()
        setProcesses(data)
      }
    } catch (error) {
      console.error('Error loading processes:', error)
      toast.error('Error al cargar procesos')
    } finally {
      setIsLoading(false)
    }
  }

  const filterProcesses = () => {
    let filtered = processes

    if (searchTerm) {
      filtered = filtered.filter(process => 
        process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(process => process.category === categoryFilter)
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(process => process.difficulty === difficultyFilter)
    }

    setFilteredProcesses(filtered)
  }

  const duplicateProcess = async (processId: string) => {
    try {
      const response = await fetch(`/api/workshop/processes/${processId}/duplicate`, {
        method: 'POST'
      })
      if (response.ok) {
        toast.success('Proceso duplicado exitosamente')
        loadProcesses()
      }
    } catch (error) {
      toast.error('Error al duplicar proceso')
    }
  }


  const deleteProcess = async (processId: string) => {
    // Usar toast para confirmar - más user-friendly
    const confirmDelete = () => {
      toast.custom((t) => (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-md">
          <h3 className="font-medium text-gray-900 mb-2">¿Eliminar proceso?</h3>
          <p className="text-sm text-gray-600 mb-4">Esta acción no se puede deshacer.</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                toast.dismiss(t.id)
              }}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id)
                proceedWithDelete()
              }}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      ), { duration: Infinity })
    }

    const proceedWithDelete = async () => {
      try {
        const response = await fetch(`/api/workshop/processes/${processId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          toast.success('Proceso eliminado exitosamente')
          loadProcesses()
        } else {
          toast.error('Error al eliminar proceso')
        }
      } catch (error) {
        toast.error('Error al eliminar proceso')
      }
    }

    confirmDelete()
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HARD': return 'bg-orange-100 text-orange-800'
      case 'EXPERT': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'Fácil'
      case 'MEDIUM': return 'Medio'
      case 'HARD': return 'Difícil'
      case 'EXPERT': return 'Experto'
      default: return difficulty
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DTF_PRINTING': return <FileText className="w-4 h-4" />
      case 'SUBLIMATION': return <FileText className="w-4 h-4" />
      case 'LASER_CUTTING': return <Layers className="w-4 h-4" />
      case 'VINYL_CUTTING': return <Layers className="w-4 h-4" />
      case 'ASSEMBLY': return <Wrench className="w-4 h-4" />
      case 'PACKAGING': return <Package className="w-4 h-4" />
      default: return <Settings className="w-4 h-4" />
    }
  }

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'DTF_PRINTING', label: 'Impresión DTF' },
    { value: 'SUBLIMATION', label: 'Sublimación' },
    { value: 'LASER_CUTTING', label: 'Corte Láser' },
    { value: 'VINYL_CUTTING', label: 'Corte Vinilo' },
    { value: 'EMBROIDERY', label: 'Bordado' },
    { value: 'ASSEMBLY', label: 'Ensamblaje' },
    { value: 'FINISHING', label: 'Acabados' },
    { value: 'QUALITY_CONTROL', label: 'Control Calidad' },
    { value: 'PACKAGING', label: 'Empaquetado' },
    { value: 'DESIGN', label: 'Diseño' },
    { value: 'OTHER', label: 'Otros' }
  ]

  const difficulties = [
    { value: 'all', label: 'Todas las dificultades' },
    { value: 'EASY', label: 'Fácil' },
    { value: 'MEDIUM', label: 'Medio' },
    { value: 'HARD', label: 'Difícil' },
    { value: 'EXPERT', label: 'Experto' }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando procesos del taller...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔧 Taller - Base de Conocimiento</h1>
          <p className="text-gray-600 mt-1">
            Base de datos de procesos de producción para nuestros productos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push('/admin/workshop/processes')}>
            <BookOpen className="w-4 h-4 mr-2" />
            Lista Completa
          </Button>
          <Button onClick={() => router.push('/admin/workshop/processes/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proceso
          </Button>
        </div>
      </div>

      {/* Simple Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Procesos</p>
                <p className="text-2xl font-bold text-gray-900">{processes.length}</p>
                <p className="text-xs text-gray-500 mt-1">Procesos documentados</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productos Cubiertos</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Set(processes.map(p => p.productId)).size}
                </p>
                <p className="text-xs text-gray-500 mt-1">Productos con procesos definidos</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar procesos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>

            <Button variant="outline" onClick={loadProcesses}>
              <Download className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Processes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProcesses.map((process) => (
          <Card key={process.id} className="relative hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getCategoryIcon(process.category)}
                    {process.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{process.productName}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={getDifficultyColor(process.difficulty)}>
                    {getDifficultyLabel(process.difficulty)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{process.description}</p>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-600">Pasos</p>
                  <p className="font-semibold">{process.stepCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Materiales</p>
                  <p className="font-semibold">{process.materialCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Tiempo Est.</p>
                  <p className="font-semibold">{process.estimatedTime}h</p>
                </div>
              </div>

              {process.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {process.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {process.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{process.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push(`/admin/workshop/processes/${process.id}`)}
                    title="Ver proceso"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push(`/admin/workshop/processes/${process.id}/edit`)}
                    title="Editar proceso"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => duplicateProcess(process.id)}
                    title="Duplicar proceso"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => deleteProcess(process.id)}
                    className="text-red-600 hover:bg-red-50"
                    title="Eliminar proceso"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProcesses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay procesos
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || categoryFilter !== 'all' || difficultyFilter !== 'all' 
                ? 'No se encontraron procesos con los filtros aplicados'
                : 'Comienza creando tu primer proceso de producción'
              }
            </p>
            {!searchTerm && categoryFilter === 'all' && difficultyFilter === 'all' && (
              <Button onClick={() => router.push('/admin/workshop/processes/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Proceso
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}