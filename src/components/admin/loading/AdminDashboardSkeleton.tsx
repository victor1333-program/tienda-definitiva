"use client"

import React, { memo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface AdminDashboardSkeletonProps {
  showMetrics?: boolean
  showCharts?: boolean
  showRecentActivity?: boolean
}

const AdminDashboardSkeleton = memo<AdminDashboardSkeletonProps>(({ 
  showMetrics = true,
  showCharts = true,
  showRecentActivity = true
}) => {
  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      {showMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-blue-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-6 bg-gray-300 rounded animate-pulse w-1/2" />
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <div className="h-3 bg-green-200 rounded animate-pulse w-12" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Gráficos */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico principal */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-48" />
                <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-100 rounded animate-pulse flex items-end justify-center space-x-2 p-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-blue-200 rounded-t animate-pulse"
                    style={{ 
                      height: `${20 + Math.random() * 60}%`,
                      width: '20px'
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gráfico secundario */}
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-40" />
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-100 rounded animate-pulse flex items-center justify-center">
                <div className="relative">
                  <div className="h-40 w-40 bg-gray-200 rounded-full animate-pulse" />
                  <div className="absolute inset-4 bg-white rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actividad reciente */}
      {showRecentActivity && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de actividad */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
                <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                    </div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Panel lateral */}
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-28" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-3 border rounded">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                    <div className="flex justify-between items-center mt-2">
                      <div className="h-3 bg-blue-200 rounded animate-pulse w-12" />
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
})

AdminDashboardSkeleton.displayName = 'AdminDashboardSkeleton'

export default AdminDashboardSkeleton