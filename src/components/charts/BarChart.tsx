'use client'

import { useEffect, useRef } from 'react'

interface DataPoint {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: DataPoint[]
  title?: string
  height?: number
  showValues?: boolean
  formatType?: 'currency' | 'number' | 'percentage' | 'units'
}

export default function BarChart({
  data,
  title,
  height = 250,
  showValues = true,
  formatType = 'number'
}: BarChartProps) {
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
      case 'units':
        return `${value} unidades`
      case 'number':
      default:
        return value.toLocaleString('es-ES')
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set up dimensions
    const padding = 50
    const chartWidth = canvas.width - (padding * 2)
    const chartHeight = canvas.height - (padding * 2)

    // Find max value
    const maxValue = Math.max(...data.map(d => d.value))
    const barWidth = chartWidth / data.length * 0.8
    const barSpacing = chartWidth / data.length * 0.2

    // Draw bars
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight
      const x = padding + (index * (barWidth + barSpacing)) + (barSpacing / 2)
      const y = padding + chartHeight - barHeight

      // Draw bar
      ctx.fillStyle = item.color || '#f97316'
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw value on top of bar
      if (showValues) {
        ctx.fillStyle = '#374151'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(
          formatValue(item.value),
          x + barWidth / 2,
          y - 5
        )
      }

      // Draw label at bottom
      ctx.fillStyle = '#6b7280'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      
      // Split long labels into multiple lines
      const maxLabelWidth = barWidth + barSpacing
      const words = item.label.split(' ')
      let line = ''
      let lineY = canvas.height - 30
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width
        
        if (testWidth > maxLabelWidth && n > 0) {
          ctx.fillText(line, x + barWidth / 2, lineY)
          line = words[n] + ' '
          lineY += 12
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, x + barWidth / 2, lineY)
    })

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1

    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()

      // Y-axis labels
      const value = maxValue - (maxValue / 5) * i
      ctx.fillStyle = '#6b7280'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(formatValue(value), padding - 10, y + 4)
    }

  }, [data, height, showValues, formatType])

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      )}
      <canvas
        ref={canvasRef}
        width={600}
        height={height}
        className="w-full border border-gray-200 rounded-lg bg-white"
      />
    </div>
  )
}