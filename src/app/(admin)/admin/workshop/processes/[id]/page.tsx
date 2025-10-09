'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import {
  ArrowLeft,
  Edit,
  Copy,
  Play,
  Pause,
  Trash2,
  Clock,
  User,
  Package,
  FileText,
  Image,
  Video,
  Layers,
  Wrench,
  Target,
  AlertTriangle,
  CheckCircle,
  Settings,
  Download
} from "lucide-react"

interface ProcessStep {
  id: string
  stepNumber: number
  title: string
  description: string
  estimatedTime: number
  instructions: string
  imageUrls: string[]
  videoUrls: string[]
  fileUrls: string[]
  isOptional: boolean
  requiresQC: boolean
  safetyNotes: string
}

interface ProcessMaterial {
  id: string
  name: string
  quantity: number
  unit: string
  description: string
  isOptional: boolean
  material?: {
    id: string
    name: string
    sku: string
  }
}

interface ProcessEquipment {
  id: string
  name: string
  description: string
  isRequired: boolean
  specifications: any
}

interface WorkshopProcess {
  id: string
  name: string
  description: string
  productId: string
  category: string
  difficulty: string
  estimatedTime: number
  isActive: boolean
  tags: string[]
  notes: string
  designFiles: string[]
  instructionFiles: string[]
  referenceImages: string[]
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    sku: string
  }
  steps: ProcessStep[]
  materialRequirements: ProcessMaterial[]
  equipmentRequirements: ProcessEquipment[]
}

export default function WorkshopProcessPage() {
  const router = useRouter()
  const params = useParams()
  const processId = params.id as string
  
  const [process, setProcess] = useState<WorkshopProcess | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (processId) {
      loadProcess()
    }
  }, [processId])

  const loadProcess = async () => {
    try {
      const response = await fetch(`/api/workshop/processes/${processId}`)
      if (response.ok) {
        const data = await response.json()
        setProcess(data)
      } else {
        toast.error('Proceso no encontrado')
        router.push('/admin/workshop')
      }
    } catch (error) {
      console.error('Error loading process:', error)
      toast.error('Error al cargar el proceso')
      router.push('/admin/workshop')
    } finally {
      setIsLoading(false)
    }
  }

  const duplicateProcess = async () => {
    try {
      const response = await fetch(`/api/workshop/processes/${processId}/duplicate`, {
        method: 'POST'
      })
      if (response.ok) {
        toast.success('Proceso duplicado exitosamente')
        router.push('/admin/workshop')
      }
    } catch (error) {
      toast.error('Error al duplicar proceso')
    }
  }

  const toggleActiveStatus = async () => {
    if (!process) return
    
    try {
      const response = await fetch(`/api/workshop/processes/${processId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !process.isActive })
      })
      if (response.ok) {
        toast.success(`Proceso ${!process.isActive ? 'activado' : 'desactivado'}`)
        setProcess(prev => prev ? { ...prev, isActive: !prev.isActive } : null)
      }
    } catch (error) {
      toast.error('Error al cambiar estado del proceso')
    }
  }

  const deleteProcess = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proceso?')) return

    try {
      const response = await fetch(`/api/workshop/processes/${processId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        toast.success('Proceso eliminado exitosamente')
        router.push('/admin/workshop')
      }
    } catch (error) {
      toast.error('Error al eliminar proceso')
    }
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

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'DTF_PRINTING': 'Impresión DTF',
      'SUBLIMATION': 'Sublimación',
      'LASER_CUTTING': 'Corte láser',
      'VINYL_CUTTING': 'Corte de vinilo',
      'EMBROIDERY': 'Bordado',
      'ASSEMBLY': 'Ensamblaje',
      'FINISHING': 'Acabados',
      'QUALITY_CONTROL': 'Control de calidad',
      'PACKAGING': 'Empaquetado',
      'DESIGN': 'Diseño',
      'OTHER': 'Otros'
    }
    return labels[category] || category
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando proceso...</p>
        </div>
      </div>
    )
  }

  if (!process) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Proceso no encontrado</h3>
        <p className="text-gray-600 mb-4">El proceso que buscas no existe o ha sido eliminado.</p>
        <Button onClick={() => router.push('/admin/workshop')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Taller
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/workshop')}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{process.name}</h1>
            <p className="text-gray-600 mt-1">
              Proceso para {process.product.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(process.difficulty)}>
              {getDifficultyLabel(process.difficulty)}
            </Badge>
            {!process.isActive && (
              <Badge variant="secondary">Inactivo</Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/admin/workshop/processes/${process.id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" onClick={duplicateProcess}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicar
          </Button>
          <Button 
            variant={process.isActive ? "secondary" : "default"}
            onClick={toggleActiveStatus}
          >
            {process.isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {process.isActive ? 'Desactivar' : 'Activar'}
          </Button>
          <Button 
            variant="outline"
            onClick={deleteProcess}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Resumen', icon: Settings },
            { id: 'steps', label: 'Pasos', icon: Layers },
            { id: 'materials', label: 'Materiales', icon: Wrench },
            { id: 'equipment', label: 'Equipamiento', icon: Target },
            { id: 'files', label: 'Archivos', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Process Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Información del Proceso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                  <p className="text-gray-600">{process.description || 'Sin descripción'}</p>
                </div>
                
                {process.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
                    <p className="text-gray-600">{process.notes}</p>
                  </div>
                )}

                {process.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Etiquetas</h4>
                    <div className="flex flex-wrap gap-2">
                      {process.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Process Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Producto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{process.product.name}</p>
                <p className="text-sm text-gray-600">SKU: {process.product.sku || 'N/A'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Detalles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Categoría:</span>
                  <span className="font-medium">{getCategoryLabel(process.category)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tiempo estimado:</span>
                  <span className="font-medium">{process.estimatedTime}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pasos:</span>
                  <span className="font-medium">{process.steps.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Materiales:</span>
                  <span className="font-medium">{process.materialRequirements.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Equipamiento:</span>
                  <span className="font-medium">{process.equipmentRequirements.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Steps Tab */}
      {activeTab === 'steps' && (
        <div className="space-y-4">
          {process.steps.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin pasos definidos</h3>
                <p className="text-gray-600">Este proceso no tiene pasos configurados.</p>
              </CardContent>
            </Card>
          ) : (
            process.steps
              .sort((a, b) => a.stepNumber - b.stepNumber)
              .map((step, index) => (
                <Card key={step.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span className="bg-orange-100 text-orange-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                          {step.stepNumber}
                        </span>
                        {step.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {step.isOptional && (
                          <Badge variant="secondary">Opcional</Badge>
                        )}
                        {step.requiresQC && (
                          <Badge className="bg-blue-100 text-blue-800">Control de Calidad</Badge>
                        )}
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {step.estimatedTime}min
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">{step.description}</p>
                    
                    {step.instructions && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Instrucciones</h5>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{step.instructions}</p>
                        </div>
                      </div>
                    )}

                    {step.safetyNotes && (
                      <div>
                        <h5 className="font-medium text-red-800 mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Notas de Seguridad
                        </h5>
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                          <p className="text-sm text-red-700">{step.safetyNotes}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Materiales Requeridos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {process.materialRequirements.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin materiales definidos</h3>
                <p className="text-gray-600">Este proceso no tiene materiales configurados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Material</th>
                      <th className="text-left py-2">Cantidad</th>
                      <th className="text-left py-2">Unidad</th>
                      <th className="text-left py-2">Descripción</th>
                      <th className="text-left py-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {process.materialRequirements.map((material) => (
                      <tr key={material.id} className="border-b">
                        <td className="py-3">{material.name}</td>
                        <td className="py-3">{material.quantity}</td>
                        <td className="py-3">{material.unit}</td>
                        <td className="py-3">{material.description || '-'}</td>
                        <td className="py-3">
                          {material.isOptional ? (
                            <Badge variant="secondary">Opcional</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">Requerido</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Equipment Tab */}
      {activeTab === 'equipment' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Equipamiento Necesario
            </CardTitle>
          </CardHeader>
          <CardContent>
            {process.equipmentRequirements.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin equipamiento definido</h3>
                <p className="text-gray-600">Este proceso no tiene equipamiento configurado.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {process.equipmentRequirements.map((equipment) => (
                  <div key={equipment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{equipment.name}</h4>
                      {equipment.isRequired ? (
                        <Badge className="bg-red-100 text-red-800">Obligatorio</Badge>
                      ) : (
                        <Badge variant="secondary">Opcional</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{equipment.description}</p>
                    {equipment.specifications && Object.keys(equipment.specifications).length > 0 && (
                      <div className="bg-gray-50 p-3 rounded">
                        <h5 className="font-medium text-sm mb-2">Especificaciones:</h5>
                        <pre className="text-xs text-gray-700">{JSON.stringify(equipment.specifications, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Design Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Archivos de Diseño
              </CardTitle>
            </CardHeader>
            <CardContent>
              {process.designFiles.length === 0 ? (
                <p className="text-gray-600 text-sm">No hay archivos de diseño</p>
              ) : (
                <div className="space-y-2">
                  {process.designFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm flex-1">{file.split('/').pop()}</span>
                      <Button size="sm" variant="outline" onClick={() => window.open(file, '_blank')}>
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instruction Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Archivos de Instrucciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {process.instructionFiles.length === 0 ? (
                <p className="text-gray-600 text-sm">No hay archivos de instrucciones</p>
              ) : (
                <div className="space-y-2">
                  {process.instructionFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm flex-1">{file.split('/').pop()}</span>
                      <Button size="sm" variant="outline" onClick={() => window.open(file, '_blank')}>
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reference Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Imágenes de Referencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              {process.referenceImages.length === 0 ? (
                <p className="text-gray-600 text-sm">No hay imágenes de referencia</p>
              ) : (
                <div className="space-y-2">
                  {process.referenceImages.map((image, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Image className="w-4 h-4 text-gray-500" />
                      <span className="text-sm flex-1">{image.split('/').pop()}</span>
                      <Button size="sm" variant="outline" onClick={() => window.open(image, '_blank')}>
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}