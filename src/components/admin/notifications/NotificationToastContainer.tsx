'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import NotificationToast from './NotificationToast'
import { Notification } from '@/hooks/useNotifications'

interface ToastNotification extends Notification {
  toastId: string
  autoClose?: boolean
  duration?: number
}

interface NotificationToastContextType {
  showToast: (notification: Notification, options?: { autoClose?: boolean, duration?: number }) => void
  removeToast: (toastId: string) => void
  clearAll: () => void
}

const NotificationToastContext = createContext<NotificationToastContextType | null>(null)

export function useNotificationToast() {
  const context = useContext(NotificationToastContext)
  if (!context) {
    throw new Error('useNotificationToast must be used within NotificationToastProvider')
  }
  return context
}

interface NotificationToastProviderProps {
  children: ReactNode
  maxToasts?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function NotificationToastProvider({ 
  children, 
  maxToasts = 5,
  position = 'top-right'
}: NotificationToastProviderProps) {
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const showToast = useCallback((
    notification: Notification, 
    options: { autoClose?: boolean, duration?: number } = {}
  ) => {
    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: ToastNotification = {
      ...notification,
      toastId,
      autoClose: options.autoClose ?? true,
      duration: options.duration ?? 5000
    }

    setToasts(prev => {
      const updated = [newToast, ...prev]
      // Limitar el número máximo de toasts
      return updated.slice(0, maxToasts)
    })
  }, [maxToasts])

  const removeToast = useCallback((toastId: string) => {
    setToasts(prev => prev.filter(toast => toast.toastId !== toastId))
  }, [])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }

  const contextValue = {
    showToast,
    removeToast,
    clearAll
  }

  if (!isMounted) {
    return (
      <NotificationToastContext.Provider value={contextValue}>
        {children}
      </NotificationToastContext.Provider>
    )
  }

  return (
    <NotificationToastContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <div className={`fixed ${positionClasses[position]} z-[9999] pointer-events-none`}>
          <div className="flex flex-col gap-3">
            {toasts.map((toast) => (
              <div key={toast.toastId} className="pointer-events-auto">
                <NotificationToast
                  notification={toast}
                  onClose={() => removeToast(toast.toastId)}
                  autoClose={toast.autoClose}
                  duration={toast.duration}
                />
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </NotificationToastContext.Provider>
  )
}

// Hook para mostrar notificaciones toast específicas
export function useNotificationActions() {
  const { showToast } = useNotificationToast()

  const showSuccess = useCallback((title: string, message: string) => {
    showToast({
      id: `success-${Date.now()}`,
      type: 'SYSTEM_ALERT',
      title,
      message,
      priority: 'LOW',
      isRead: false,
      createdAt: new Date().toISOString()
    }, { duration: 3000 })
  }, [showToast])

  const showError = useCallback((title: string, message: string) => {
    showToast({
      id: `error-${Date.now()}`,
      type: 'SYSTEM_ALERT',
      title,
      message,
      priority: 'HIGH',
      isRead: false,
      createdAt: new Date().toISOString()
    }, { duration: 7000 })
  }, [showToast])

  const showWarning = useCallback((title: string, message: string) => {
    showToast({
      id: `warning-${Date.now()}`,
      type: 'SYSTEM_ALERT',
      title,
      message,
      priority: 'MEDIUM',
      isRead: false,
      createdAt: new Date().toISOString()
    }, { duration: 5000 })
  }, [showToast])

  const showInfo = useCallback((title: string, message: string) => {
    showToast({
      id: `info-${Date.now()}`,
      type: 'SYSTEM_ALERT',
      title,
      message,
      priority: 'LOW',
      isRead: false,
      createdAt: new Date().toISOString()
    }, { duration: 4000 })
  }, [showToast])

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToast
  }
}