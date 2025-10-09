'use client'

import { useState } from 'react'
import { Settings, Bell, Mail, Volume2, Package, AlertTriangle, MessageSquare, Cog } from 'lucide-react'
import { useNotificationSettings } from '@/hooks/useNotifications'

export default function NotificationSettings() {
  const { settings, isLoading, updateSettings } = useNotificationSettings()
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleToggle = async (key: keyof typeof settings) => {
    setIsSaving(true)
    
    const newValue = !settings[key]
    const success = await updateSettings({ [key]: newValue })
    
    if (success) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    }
    
    setIsSaving(false)
  }

  const settingsGroups = [
    {
      title: 'Canales de notificación',
      icon: Bell,
      settings: [
        { key: 'email' as const, label: 'Notificaciones por email', icon: Mail },
        { key: 'browser' as const, label: 'Notificaciones del navegador', icon: Bell },
        { key: 'sound' as const, label: 'Sonidos de notificación', icon: Volume2 }
      ]
    },
    {
      title: 'Tipos de notificaciones',
      icon: Cog,
      settings: [
        { key: 'newOrders' as const, label: 'Nuevos pedidos', icon: Package },
        { key: 'stockAlerts' as const, label: 'Alertas de stock bajo', icon: AlertTriangle },
        { key: 'customerMessages' as const, label: 'Mensajes de clientes', icon: MessageSquare },
        { key: 'systemAlerts' as const, label: 'Alertas del sistema', icon: Cog }
      ]
    }
  ]

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          Configuración de Notificaciones
        </h2>
      </div>

      {showSuccess && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg">
          Configuración guardada correctamente
        </div>
      )}

      <div className="space-y-8">
        {settingsGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <group.icon className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">{group.title}</h3>
            </div>

            <div className="space-y-3">
              {group.settings.map((setting) => (
                <div
                  key={setting.key}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <setting.icon className="w-5 h-5 text-gray-600" />
                    <div>
                      <label
                        htmlFor={setting.key}
                        className="font-medium text-gray-900 cursor-pointer"
                      >
                        {setting.label}
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id={setting.key}
                        type="checkbox"
                        checked={settings[setting.key]}
                        onChange={() => handleToggle(setting.key)}
                        disabled={isLoading || isSaving}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">
          Información sobre las notificaciones
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Las notificaciones por email se envían a tu dirección registrada</li>
          <li>• Las notificaciones del navegador requieren permisos del navegador</li>
          <li>• Los sonidos solo funcionan cuando el sitio está activo</li>
          <li>• Puedes personalizar qué tipos de eventos quieres recibir</li>
        </ul>
      </div>

      {/* Botón de prueba */}
      <div className="mt-6 pt-6 border-t">
        <button
          onClick={() => {
            // Aquí se podría enviar una notificación de prueba
            console.log('Enviando notificación de prueba...')
          }}
          disabled={isLoading || isSaving}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? 'Guardando...' : 'Enviar notificación de prueba'}
        </button>
      </div>
    </div>
  )
}