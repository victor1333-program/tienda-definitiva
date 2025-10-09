"use client"

import React, { memo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface AdminPageSkeletonProps {
  showHeader?: boolean
  showStats?: boolean
  showTable?: boolean
  showActions?: boolean
  className?: string
}

const AdminPageSkeleton = memo(({
  showHeader = true,
  showStats = false,
  showTable = true,
  showActions = true,
  className = ''
}: AdminPageSkeletonProps) => {
  return (
    <div className={`space-y-6 animate-pulse ${className}`}>
      {/* Header Skeleton */}
      {showHeader && (
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          {showActions && (
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          )}
        </div>
      )}

      {/* Stats Cards Skeleton */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters/Search Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-20"></div>
          </div>
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      {showTable && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-40"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 p-3 bg-gray-50 rounded">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
              
              {/* Table Rows */}
              {[...Array(8)].map((_, i) => (
                <div key={i} className="grid grid-cols-5 gap-4 p-3 border-b">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="flex gap-1">
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 w-8 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
})

AdminPageSkeleton.displayName = 'AdminPageSkeleton'

export default AdminPageSkeleton