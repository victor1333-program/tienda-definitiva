'use client'

import { useNotifications } from '@/hooks/useNotifications'
import { Bell } from 'lucide-react'

interface NotificationBadgeProps {
  className?: string
  showCount?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function NotificationBadge({ 
  className = '', 
  showCount = true,
  size = 'md' 
}: NotificationBadgeProps) {
  const { unreadCount, isLoading } = useNotifications({ unreadOnly: true, limit: 1 })

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }

  const badgeSizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm'
  }

  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <Bell className={`${sizeClasses[size]} text-gray-400 animate-pulse`} />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Bell className={`${sizeClasses[size]} ${unreadCount > 0 ? 'text-blue-600' : 'text-gray-600'}`} />
      {unreadCount > 0 && (
        <span className={`absolute -top-1 -right-1 bg-red-500 text-white rounded-full flex items-center justify-center font-medium ${badgeSizeClasses[size]}`}>
          {showCount ? (unreadCount > 99 ? '99+' : unreadCount) : ''}
        </span>
      )}
    </div>
  )
}