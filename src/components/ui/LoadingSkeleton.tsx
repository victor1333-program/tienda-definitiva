import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  )
}

export function ProductListSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="flex items-start gap-6 p-6">
        <Skeleton className="w-32 h-32 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex justify-between items-center mt-4">
            <Skeleton className="h-6 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 pb-6 border-b">
      <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <Skeleton className="w-8 h-8" />
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40 bg-white/20" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-20 bg-white/20" />
            <Skeleton className="h-8 w-20 bg-white/20" />
            <Skeleton className="h-10 w-10 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  )
}