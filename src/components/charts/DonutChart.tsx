'use client'

import { useEffect, useRef } from 'react'

interface DataPoint {
  label: string
  value: number
  color: string
  percentage?: number
}

interface DonutChartProps {
  data: DataPoint[]
  title?: string
  size?: number
  innerRadius?: number
  showLegend?: boolean
  showPercentages?: boolean
  formatType?: 'currency' | 'number' | 'percentage' | 'orders'
}

export default function DonutChart({
  data,
  title,
  size = 200,
  innerRadius = 0.5,
  showLegend = true,
  showPercentages = true,
  formatType = 'number'
}: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const formatValue = (value: number): string => {
    switch (formatType) {
      case 'currency':
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR'
        }).format(value)
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'orders':
        return `${value} pedidos`
      case 'number':
      default:
        return value.toLocaleString('es-ES')
    }
  }

  // Calculate percentages
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const processedData = data.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0 || total === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set up dimensions
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10
    const innerRadiusSize = radius * innerRadius

    let currentAngle = -Math.PI / 2 // Start from top

    // Draw segments
    processedData.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI

      // Draw outer arc
      ctx.fillStyle = item.color
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.arc(centerX, centerY, innerRadiusSize, currentAngle + sliceAngle, currentAngle, true)
      ctx.closePath()
      ctx.fill()

      // Draw border
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw percentage text
      if (showPercentages && item.percentage > 5) {
        const textAngle = currentAngle + sliceAngle / 2
        const textRadius = (radius + innerRadiusSize) / 2
        const textX = centerX + Math.cos(textAngle) * textRadius
        const textY = centerY + Math.sin(textAngle) * textRadius

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${item.percentage.toFixed(0)}%`, textX, textY)
      }

      currentAngle += sliceAngle
    })

    // Draw center circle
    ctx.fillStyle = '#f9fafb'
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerRadiusSize, 0, 2 * Math.PI)
    ctx.fill()

    // Draw total in center
    ctx.fillStyle = '#374151'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Total', centerX, centerY - 8)
    
    ctx.font = '14px sans-serif'
    ctx.fillText(formatValue(total), centerX, centerY + 8)

  }, [data, total, size, innerRadius, showPercentages, formatType])

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      )}
      
      <div className="flex items-center gap-6">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="flex-shrink-0"
        />
        
        {showLegend && (
          <div className="flex-1">
            <div className="space-y-2">
              {processedData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 truncate">
                        {item.label}
                      </span>
                      <span className="text-sm font-medium text-gray-900 ml-2">
                        {formatValue(item.value)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}