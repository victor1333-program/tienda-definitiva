'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import TemplateLibrary from './TemplateLibrary'

interface Template {
  id: string
  name: string
  description?: string
  elements: any[]
  canvasSize: { width: number; height: number }
  canvasBackground: string
  category: string
  tags: string[]
}

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: Template) => void
}

export default function TemplateSelector({ 
  isOpen, 
  onClose, 
  onSelectTemplate 
}: TemplateSelectorProps) {
  const handleTemplateSelect = (template: Template) => {
    onSelectTemplate(template)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Seleccionar Plantilla
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
          <TemplateLibrary 
            onSelectTemplate={handleTemplateSelect}
            showActions={false}
            selectionMode={true}
          />
        </div>
      </div>
    </div>
  )
}