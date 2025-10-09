'use client'

import { useEffect, useState } from 'react'
import { X, Bell, AlertCircle, Package, User, Mail, CheckCheck } from 'lucide-react'
import { NotificationType } from '@/lib/notifications'
import { Notification } from '@/hooks/useNotifications'

const notificationIcons = {
  NEW_ORDER: Package,
  ORDER_STATUS_CHANGE: Package,
  LOW_STOCK: AlertCircle,
  NEW_CUSTOMER: User,
  PAYMENT_RECEIVED: CheckCheck,
  CONTACT_FORM: Mail,
  SYSTEM_ALERT: AlertCircle,
  REVIEW_RECEIVED: CheckCheck
}

const priorityStyles = {
  LOW: 'border-l-gray-400 bg-gray-50',
  MEDIUM: 'border-l-blue-400 bg-blue-50',
  HIGH: 'border-l-orange-400 bg-orange-50',
  URGENT: 'border-l-red-400 bg-red-50'
}

interface NotificationToastProps {
  notification: Notification
  onClose: () => void
  onAction?: () => void
  autoClose?: boolean
  duration?: number
}

export default function NotificationToast({
  notification,
  onClose,
  onAction,
  autoClose = true,
  duration = 5000
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  const IconComponent = notificationIcons[notification.type] || Bell
  const priorityStyle = priorityStyles[notification.priority] || priorityStyles.MEDIUM

  useEffect(() => {
    if (!autoClose) return

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100))
        return newProgress <= 0 ? 0 : newProgress
      })
    }, 100)

    const closeTimer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(closeTimer)
    }
  }, [autoClose, duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Esperar a que termine la animación
  }

  const handleAction = () => {
    if (onAction) {
      onAction()
    } else if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank')
    }
    handleClose()
  }

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className={`relative w-80 bg-white rounded-lg shadow-lg border border-l-4 ${priorityStyle} overflow-hidden`}>
        {/* Barra de progreso */}
        {autoClose && (
          <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full">
            <div 
              className="h-full bg-blue-500 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="p-4 pt-5">
          <div className="flex items-start gap-3">
            {/* Icono */}
            <div className={`flex-shrink-0 p-2 rounded-full ${
              notification.priority === 'URGENT' ? 'bg-red-100' :
              notification.priority === 'HIGH' ? 'bg-orange-100' :
              notification.priority === 'MEDIUM' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <IconComponent className={`w-5 h-5 ${
                notification.priority === 'URGENT' ? 'text-red-600' :
                notification.priority === 'HIGH' ? 'text-orange-600' :
                notification.priority === 'MEDIUM' ? 'text-blue-600' : 'text-gray-600'
              }`} />
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {notification.title}
                </h4>
                <button
                  onClick={handleClose}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {notification.message}
              </p>

              {/* Botones de acción */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {notification.actionUrl && (
                    <button
                      onClick={handleAction}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Ver detalles
                    </button>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    notification.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                    notification.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    notification.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {notification.priority.toLowerCase()}
                  </span>
                </div>

                <div className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}