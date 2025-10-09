"use client"

import { useState, useEffect } from "react"
import { Settings, Plus, Clock, CheckCircle, AlertTriangle, ExternalLink, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import useSWR from "swr"
import fetcher from "@/lib/fetcher"

interface ProductionStep {
  id?: string
  name: string
  description: string
  estimatedTime: number // in minutes
  requiredMaterials: string[]
  skillLevel: 'basic' | 'intermediate' | 'advanced'
  order: number
}

interface WorkshopProcess {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'archived'
  estimatedTime: number
  steps: Array<{
    id: string
    name: string
    description: string
    estimatedTime: number
    order: number
  }>
  createdAt: string
  updatedAt: string
}

interface ProductionManagerProps {
  productId: string
  productionSteps: ProductionStep[]
  onStepsChange?: (steps: ProductionStep[]) => void
}

export default function ProductionManager({
  productId,
  productionSteps: initialSteps = [],
  onStepsChange
}: ProductionManagerProps) {
  const [productionSteps, setProductionSteps] = useState<ProductionStep[]>(initialSteps)

  // Consultar procesos de taller para este producto
  const { data: workshopProcesses, error: workshopError } = useSWR<WorkshopProcess[]>(
    `/api/workshop/processes?productId=${productId}`,
    fetcher,
    { 
      revalidateOnFocus: false,
      errorRetryCount: 0 // No reintentar si falla la consulta
    }
  )

  const totalEstimatedTime = productionSteps.reduce((total, step) => total + step.estimatedTime, 0)
  const hasWorkshopProcesses = workshopProcesses && workshopProcesses.length > 0

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getSkillBadgeVariant = (skill: string) => {
    switch (skill) {
      case 'basic': return 'outline'
      case 'intermediate': return 'secondary'
      case 'advanced': return 'default'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Workshop Processes Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              Procesos de Taller
            </CardTitle>
            {!hasWorkshopProcesses && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href={`/admin/workshop/processes/new?productId=${productId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Proceso de Taller
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasWorkshopProcesses ? (
            <div className="space-y-4">
              {workshopProcesses.map((process) => (
                <Card key={process.id} className="border-l-4 border-l-green-500 bg-white">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Proceso de Taller
                        </Badge>
                        <h4 className="font-medium text-lg">{process.name}</h4>
                        <Badge 
                          variant={process.status === 'active' ? 'default' : 'secondary'}
                          className={process.status === 'active' ? 'bg-green-600' : ''}
                        >
                          {process.status === 'active' ? 'Activo' : 
                           process.status === 'draft' ? 'Borrador' : 'Archivado'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(process.estimatedTime)}
                        </Badge>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/workshop/processes/${process.id}/edit`}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Ver en Taller
                          </Link>
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {process.description}
                    </p>
                    
                    {process.steps && process.steps.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Pasos del proceso ({process.steps.length}):
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {process.steps.slice(0, 6).map((step, idx) => (
                            <div key={step.id} className="flex items-center gap-2 text-xs">
                              <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                                {idx + 1}
                              </Badge>
                              <span className="truncate">{step.name}</span>
                            </div>
                          ))}
                          {process.steps.length > 6 && (
                            <div className="text-xs text-gray-500">
                              +{process.steps.length - 6} pasos más...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              <div className="pt-4 border-t">
                <Button variant="outline" asChild>
                  <Link href={`/admin/workshop/processes/new?productId=${productId}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Nuevo Proceso
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="font-medium text-blue-900 mb-2">No hay procesos de taller configurados</h3>
              <p className="text-sm text-blue-700 mb-4">
                Los procesos de taller te permiten definir los pasos detallados de producción, 
                asignar trabajadores y controlar los tiempos de fabricación.
              </p>
              <p className="text-xs text-blue-600">
                Haz clic en "Nuevo Proceso de Taller" para comenzar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold text-blue-600">
                  {formatTime(totalEstimatedTime)}
                </span>
              </div>
              <p className="text-sm text-gray-600">Tiempo estimado total</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Settings className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-2xl font-bold text-green-600">
                  {productionSteps.length}
                </span>
              </div>
              <p className="text-sm text-gray-600">Pasos configurados</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-2xl font-bold text-purple-600">
                  {productionSteps.filter(s => s.skillLevel === 'advanced').length}
                </span>
              </div>
              <p className="text-sm text-gray-600">Pasos avanzados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production Steps */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>🛠️ Proceso de Producción</CardTitle>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Paso
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {productionSteps.length > 0 ? (
            <div className="space-y-4">
              {productionSteps.map((step, index) => (
                <Card key={step.id || index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-sm">
                          Paso {index + 1}
                        </Badge>
                        <h4 className="font-medium">{step.name}</h4>
                        <Badge variant={getSkillBadgeVariant(step.skillLevel)}>
                          {step.skillLevel}
                        </Badge>
                      </div>
                      <Badge variant="secondary">
                        {formatTime(step.estimatedTime)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {step.description}
                    </p>
                    
                    {step.requiredMaterials.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Materiales requeridos:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {step.requiredMaterials.map((material, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {material}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No hay pasos de producción configurados</p>
              <p className="text-sm text-gray-400">
                Define los pasos necesarios para fabricar este producto
              </p>
            </div>
          )}

          {/* Development Notice */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">🚧 En Desarrollo</h4>
                <p className="text-sm text-yellow-700">
                  El sistema completo de gestión de procesos de producción estará disponible próximamente. 
                  Incluirá: gestión de pasos, asignación de trabajadores, control de tiempo, y integración 
                  con el sistema de inventario.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}