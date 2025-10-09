"use client"

import { useState, useEffect, useCallback } from 'react'
import { TemplateElement, TemplateData } from '../types'

export interface UseTemplateEditorProps {
  productId: string
  templateName: string
  category: string
  isEditMode?: boolean
  existingTemplateData?: any
}

export const useTemplateEditor = ({
  productId,
  templateName,
  category,
  isEditMode = false,
  existingTemplateData = null
}: UseTemplateEditorProps) => {
  // Estado principal
  const [elements, setElements] = useState<TemplateElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [currentSide, setCurrentSide] = useState('frontal')
  const [zoom, setZoom] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos existentes si estamos en modo edición
  useEffect(() => {
    if (isEditMode && existingTemplateData) {
      try {
        const sideElements = existingTemplateData.sides?.[currentSide]?.elements || []
        setElements(sideElements)
      } catch (err) {
        console.error('Error loading existing template data:', err)
        setError('Error cargando datos existentes')
      }
    }
  }, [isEditMode, existingTemplateData, currentSide])

  // Funciones para manejar elementos
  const addElement = useCallback((element: TemplateElement) => {
    setElements(prev => [...prev, { ...element, id: `element-${Date.now()}` }])
  }, [])

  const updateElement = useCallback((elementId: string, updates: Partial<TemplateElement>) => {
    setElements(prev => 
      prev.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      )
    )
  }, [])

  const removeElement = useCallback((elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId))
    if (selectedElement === elementId) {
      setSelectedElement(null)
    }
  }, [selectedElement])

  const selectElement = useCallback((elementId: string | null) => {
    setSelectedElement(elementId)
  }, [])

  // Función para guardar template
  const saveTemplate = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const templateData: TemplateData = {
        name: templateName,
        category,
        sides: {
          [currentSide]: {
            elements,
            dimensions: { width: 400, height: 600 } // Valores por defecto
          }
        },
        metadata: {
          updatedAt: new Date().toISOString(),
          version: 1
        }
      }

      return templateData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error guardando template'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [templateName, category, currentSide, elements])

  return {
    // Estado
    elements,
    selectedElement,
    currentSide,
    zoom,
    isLoading,
    error,
    
    // Funciones
    addElement,
    updateElement,
    removeElement,
    selectElement,
    setCurrentSide,
    setZoom,
    saveTemplate,
    setError
  }
}