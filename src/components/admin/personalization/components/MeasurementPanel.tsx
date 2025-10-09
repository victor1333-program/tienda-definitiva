"use client"

import React, { memo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Ruler, 
  Settings, 
  Trash2, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from 'lucide-react'
import { MeasurementData, MeasurementLine } from '../types/AreaEditorTypes'

interface MeasurementPanelProps {
  measurementData: MeasurementData
  measurementLines: MeasurementLine[]
  onLineDelete: (lineId: string) => void
  onPixelsPerCmChange: (pixelsPerCm: number) => void
  readonly?: boolean
}

const MeasurementPanel = memo(({
  measurementData,
  measurementLines,
  onLineDelete,
  onPixelsPerCmChange,
  readonly = false
}: MeasurementPanelProps) => {
  const [manualPixelsPerCm, setManualPixelsPerCm] = useState(
    measurementData.pixelsPerCm?.toString() || ''
  )

  const handleManualCalibration = () => {
    const value = parseFloat(manualPixelsPerCm)
    if (!isNaN(value) && value > 0) {
      onPixelsPerCmChange(value)
    }
  }

  const getCalibrationStatus = () => {
    if (!measurementData.pixelsPerCm) {
      return {
        icon: <XCircle className="w-4 h-4 text-red-500" />,
        text: 'Sin calibración',
        color: 'text-red-600 bg-red-50'
      }
    }
    
    if (measurementData.hasValidMeasurement) {
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        text: 'Calibrado correctamente',
        color: 'text-green-600 bg-green-50'
      }
    }
    
    return {
      icon: <AlertCircle className="w-4 h-4 text-yellow-500" />,
      text: 'Calibración manual',
      color: 'text-yellow-600 bg-yellow-50'
    }
  }

  const status = getCalibrationStatus()

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Ruler className="w-4 h-4" />
        <h3 className="font-semibold text-sm">Sistema de medición</h3>
      </div>

      {/* Estado de calibración */}
      <div className={`p-3 rounded-lg border ${status.color}`}>
        <div className="flex items-center gap-2 mb-2">
          {status.icon}
          <span className="text-sm font-medium">{status.text}</span>
        </div>
        {measurementData.pixelsPerCm && (
          <div className="text-xs">
            <p>Escala: {measurementData.pixelsPerCm.toFixed(2)} píxeles/cm</p>
            <p>1 cm = {measurementData.pixelsPerCm.toFixed(0)} px</p>
          </div>
        )}
      </div>

      {/* Calibración manual */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Calibración manual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Píxeles por centímetro</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={manualPixelsPerCm}
                onChange={(e) => setManualPixelsPerCm(e.target.value)}
                placeholder="ej: 37.8"
                className="h-8 text-sm flex-1"
                step="0.1"
                min="0.1"
                disabled={readonly}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualCalibration}
                disabled={readonly || !manualPixelsPerCm}
              >
                Aplicar
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ingresa la escala si conoces la medida exacta
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Líneas de medición existentes */}
      {measurementLines.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Líneas de medición ({measurementLines.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {measurementLines.map((line, index) => {
              const length = Math.sqrt(
                Math.pow(line.end.x - line.start.x, 2) + 
                Math.pow(line.end.y - line.start.y, 2)
              )
              const calculatedPixelsPerCm = length / line.realDistance

              return (
                <div key={line.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Línea {index + 1}
                      </Badge>
                      <span className="text-sm font-medium">
                        {line.realDistance} cm
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <p>{length.toFixed(0)} px → {calculatedPixelsPerCm.toFixed(2)} px/cm</p>
                      {line.label && <p>Etiqueta: {line.label}</p>}
                    </div>
                  </div>
                  {!readonly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLineDelete(line.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Instrucciones */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-600 space-y-2">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-600">1.</span>
            <p>Selecciona la herramienta "Medir" en la barra lateral</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-600">2.</span>
            <p>Dibuja una línea sobre una distancia conocida en la imagen</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-600">3.</span>
            <p>Ingresa la distancia real en centímetros</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-600">4.</span>
            <p>El sistema calculará automáticamente la escala</p>
          </div>
          
          <Separator className="my-3" />
          
          <div className="bg-blue-50 p-2 rounded">
            <p className="font-semibold text-blue-800 text-xs mb-1">💡 Consejo:</p>
            <p className="text-blue-700">
              Para obtener mayor precisión, mide sobre una regla o elemento de tamaño conocido en la imagen.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      {measurementData.pixelsPerCm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Conversiones útiles</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-600 space-y-1">
            <p>1 cm = {measurementData.pixelsPerCm.toFixed(0)} px</p>
            <p>1 mm = {(measurementData.pixelsPerCm / 10).toFixed(1)} px</p>
            <p>1 inch = {(measurementData.pixelsPerCm * 2.54).toFixed(0)} px</p>
            <p>100 px = {(100 / measurementData.pixelsPerCm).toFixed(2)} cm</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
})

MeasurementPanel.displayName = 'MeasurementPanel'

export default MeasurementPanel