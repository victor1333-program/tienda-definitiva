"use client"

import React, { memo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface AdminTableSkeletonProps {
  rows?: number
  columns?: number
  showHeader?: boolean
  showPagination?: boolean
  showFilters?: boolean
}

const AdminTableSkeleton = memo<AdminTableSkeletonProps>(({ 
  rows = 10, 
  columns = 5, 
  showHeader = true,
  showPagination = true,
  showFilters = true
}) => {
  return (
    <div className="space-y-6">
      {/* Filtros de tabla */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="h-10 bg-gray-200 rounded-md flex-1 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded-md w-32 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded-md w-24 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla principal */}
      <Card>
        {showHeader && (
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="h-8 bg-gray-200 rounded-md w-48 animate-pulse" />
              <div className="h-10 bg-blue-200 rounded-md w-32 animate-pulse" />
            </div>
          </CardHeader>
        )}
        
        <CardContent className="p-0">
          <div className="overflow-hidden">
            {/* Encabezados de tabla */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-5 gap-4 p-4">
                {Array.from({ length: columns }).map((_, i) => (
                  <div 
                    key={i} 
                    className="h-5 bg-gray-300 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Filas de tabla */}
            <div className="divide-y divide-gray-200">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50">
                  {Array.from({ length: columns }).map((_, colIndex) => {
                    // Primera columna más ancha (nombre/título)
                    if (colIndex === 0) {
                      return (
                        <div key={colIndex} className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                          <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                        </div>
                      )
                    }
                    
                    // Última columna (acciones)
                    if (colIndex === columns - 1) {
                      return (
                        <div key={colIndex} className="flex gap-2">
                          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                        </div>
                      )
                    }
                    
                    // Columnas normales
                    return (
                      <div 
                        key={colIndex} 
                        className={`h-4 bg-gray-200 rounded animate-pulse ${
                          colIndex === 1 ? 'w-1/2' : 'w-3/4'
                        }`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paginación */}
      {showPagination && (
        <div className="flex justify-between items-center">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={i} 
                className="h-10 w-10 bg-gray-200 rounded animate-pulse" 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

AdminTableSkeleton.displayName = 'AdminTableSkeleton'

export default AdminTableSkeleton