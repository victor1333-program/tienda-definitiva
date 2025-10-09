"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface SizeTableData {
  groupName: string
  sizes: Array<{
    name: string
    width?: number
    length?: number
  }>
}

interface SizeTableProps {
  data: SizeTableData
  className?: string
}

export default function SizeTable({ data, className = "" }: SizeTableProps) {
  if (!data.sizes.length) {
    return null
  }

  const hasWidth = data.sizes.some(size => size.width !== undefined)
  const hasLength = data.sizes.some(size => size.length !== undefined)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {/* Icono de prenda con flechas */}
          <div className="relative">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
              className="text-blue-600"
            >
              {/* Silueta de camiseta */}
              <path d="M8 3h8l2 2v16H6V5l2-2z" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M6 5l-2 2v4l2-2" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M18 5l2 2v4l-2-2" fill="none" stroke="currentColor" strokeWidth="1"/>
              {/* Cuello */}
              <path d="M10 3v2h4V3" fill="none" stroke="currentColor" strokeWidth="1"/>
            </svg>
            {/* Flecha horizontal (ancho) */}
            <svg 
              width="12" 
              height="6" 
              viewBox="0 0 12 6" 
              fill="none" 
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
            >
              <path d="M1 3h10M2 1l-2 2 2 2M10 1l2 2-2 2" stroke="#2563EB" strokeWidth="0.8" fill="none"/>
            </svg>
            {/* Flecha vertical (largo) */}
            <svg 
              width="6" 
              height="12" 
              viewBox="0 0 6 12" 
              fill="none" 
              className="absolute -right-1 top-1/2 transform -translate-y-1/2"
            >
              <path d="M3 1v10M1 2l2-2 2 2M1 10l2 2 2-2" stroke="#2563EB" strokeWidth="0.8" fill="none"/>
            </svg>
          </div>
          Guía de Tallas - {data.groupName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 font-medium bg-gray-50">Talla</th>
                {hasWidth && (
                  <th className="text-left p-3 font-medium bg-gray-50">
                    <div className="flex items-center gap-1">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-blue-500">
                        <path d="M1 3h8M2 1l-2 2 2 2M8 1l2 2-2 2" stroke="currentColor" strokeWidth="1" fill="none"/>
                      </svg>
                      Ancho (cm)
                    </div>
                  </th>
                )}
                {hasLength && (
                  <th className="text-left p-3 font-medium bg-gray-50">
                    <div className="flex items-center gap-1">
                      <svg width="6" height="10" viewBox="0 0 6 10" fill="none" className="text-green-500">
                        <path d="M3 1v8M1 2l2-2 2 2M1 8l2 2 2-2" stroke="currentColor" strokeWidth="1" fill="none"/>
                      </svg>
                      Largo (cm)
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.sizes.map((size, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium">{size.name.toUpperCase()}</td>
                  {hasWidth && (
                    <td className="p-3">
                      {size.width ? `${size.width}` : '-'}
                    </td>
                  )}
                  {hasLength && (
                    <td className="p-3">
                      {size.length ? `${size.length}` : '-'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          <p>📐 Todas las medidas están en centímetros</p>
          <p>💡 Estas medidas son aproximadas y pueden variar ligeramente</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para mostrar múltiples tablas de tallas
interface SizeTablesProps {
  tables: SizeTableData[]
  className?: string
}

export function SizeTables({ tables, className = "" }: SizeTablesProps) {
  if (!tables.length) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {tables.map((table, index) => (
        <SizeTable key={index} data={table} />
      ))}
    </div>
  )
}