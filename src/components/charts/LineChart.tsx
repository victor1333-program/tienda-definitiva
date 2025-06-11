'use client'

import { useEffect, useRef } from 'react'

interface DataPoint {
  date: string
  value: number
  label?: string
}

interface LineChartProps {
  data: DataPoint[]
  title?: string
  color?: string
  height?: number
  showGrid?: boolean
  formatType?: 'currency' | 'number' | 'percentage'
}

export default function LineChart({
  data,
  title,
  color = '#f97316',
  height = 200,
  showGrid = true,
  formatType = 'number'
}: LineChartProps) {
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
    const padding = 40
    const chartWidth = canvas.width - (padding * 2)
    const chartHeight = canvas.height - (padding * 2)

    // Find min and max values
    const values = data.map(d => d.value)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const valueRange = maxValue - minValue || 1

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1

      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(padding + chartWidth, y)
        ctx.stroke()
      }

      // Vertical grid lines
      const stepX = chartWidth / (data.length - 1 || 1)
      for (let i = 0; i < data.length; i++) {
        const x = padding + stepX * i
        ctx.beginPath()
        ctx.moveTo(x, padding)
        ctx.lineTo(x, padding + chartHeight)
        ctx.stroke()
      }
    }

    // Draw line
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.beginPath()

    data.forEach((point, index) => {
      const x = padding + (chartWidth / (data.length - 1 || 1)) * index
      const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw points
    ctx.fillStyle = color
    data.forEach((point, index) => {
      const x = padding + (chartWidth / (data.length - 1 || 1)) * index
      const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Draw labels
    ctx.fillStyle = '#6b7280'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'

    // X-axis labels (dates)
    data.forEach((point, index) => {
      const x = padding + (chartWidth / (data.length - 1 || 1)) * index
      const date = new Date(point.date)
      const label = date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit' 
      })
      ctx.fillText(label, x, canvas.height - 10)
    })

    // Y-axis labels (values)
    ctx.textAlign = 'right'
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (valueRange / 5) * (5 - i)
      const y = padding + (chartHeight / 5) * i + 4
      ctx.fillText(formatValue(value), padding - 10, y)
    }

  }, [data, color, height, showGrid, formatType])

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