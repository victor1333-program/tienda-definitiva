import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

interface ToastProps {
  title?: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  onClose?: () => void
  className?: string
}

export function Toast({ 
  title, 
  description, 
  type = 'info', 
  onClose, 
  className 
}: ToastProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />
  }

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  return (
    <div className={cn(
      'max-w-sm w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border',
      styles[type],
      className
    )}>
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icons[type]}
          </div>
          <div className="ml-3 flex-1">
            {title && (
              <p className="text-sm font-medium">
                {title}
              </p>
            )}
            {description && (
              <p className={cn(
                "mt-1 text-sm",
                title ? "opacity-90" : ""
              )}>
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      {onClose && (
        <div className="flex border-l border-gray-200">
          <button
            onClick={onClose}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}