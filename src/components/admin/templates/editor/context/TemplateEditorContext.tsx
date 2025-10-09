"use client"

import React, { createContext, useContext, useReducer, useCallback } from 'react'

// Tipos para el estado del editor
export interface TemplateElement {
  id: string
  type: 'text' | 'image' | 'shape'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
  opacity: number
  zIndex: number
  isLocked: boolean
  isVisible: boolean
  
  // Propiedades específicas de texto
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  fill?: string
  textAlign?: string
  
  // Propiedades específicas de imagen
  src?: string
  crossOrigin?: string
  
  // Propiedades específicas de forma
  shapeType?: string
  fillColor?: string
  strokeColor?: string
  strokeWidth?: number
}

export interface TemplateEditorState {
  // Estado del canvas
  zoom: number
  canvasWidth: number
  canvasHeight: number
  
  // Elementos
  elements: TemplateElement[]
  selectedElementIds: string[]
  
  // Herramientas
  activeTool: 'select' | 'text' | 'image' | 'shape'
  
  // Historial
  history: TemplateElement[][]
  historyIndex: number
  
  // Estado de la UI
  showGrid: boolean
  showRulers: boolean
  snapToGrid: boolean
  
  // Estado de guardado
  hasUnsavedChanges: boolean
  isSaving: boolean
  
  // Librerías
  isImageLibraryOpen: boolean
  isShapesLibraryOpen: boolean
  isElementsLibraryOpen: boolean
}

type TemplateEditorAction =
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_CANVAS_SIZE'; payload: { width: number; height: number } }
  | { type: 'ADD_ELEMENT'; payload: TemplateElement }
  | { type: 'UPDATE_ELEMENT'; payload: { id: string; updates: Partial<TemplateElement> } }
  | { type: 'DELETE_ELEMENT'; payload: string }
  | { type: 'SELECT_ELEMENTS'; payload: string[] }
  | { type: 'SET_ACTIVE_TOOL'; payload: TemplateEditorState['activeTool'] }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_RULERS' }
  | { type: 'TOGGLE_SNAP_TO_GRID' }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'MARK_SAVED' }
  | { type: 'MARK_UNSAVED' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_TO_HISTORY' }
  | { type: 'TOGGLE_IMAGE_LIBRARY' }
  | { type: 'TOGGLE_SHAPES_LIBRARY' }
  | { type: 'TOGGLE_ELEMENTS_LIBRARY' }
  | { type: 'SET_ELEMENTS'; payload: TemplateElement[] }

const initialState: TemplateEditorState = {
  zoom: 1,
  canvasWidth: 800,
  canvasHeight: 600,
  elements: [],
  selectedElementIds: [],
  activeTool: 'select',
  history: [[]],
  historyIndex: 0,
  showGrid: false,
  showRulers: false,
  snapToGrid: true,
  hasUnsavedChanges: false,
  isSaving: false,
  isImageLibraryOpen: false,
  isShapesLibraryOpen: false,
  isElementsLibraryOpen: false,
}

function templateEditorReducer(state: TemplateEditorState, action: TemplateEditorAction): TemplateEditorState {
  switch (action.type) {
    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.1, Math.min(5, action.payload)) }
    
    case 'SET_CANVAS_SIZE':
      return { 
        ...state, 
        canvasWidth: action.payload.width, 
        canvasHeight: action.payload.height 
      }
    
    case 'ADD_ELEMENT':
      const newElement = {
        ...action.payload,
        zIndex: Math.max(...state.elements.map(e => e.zIndex), 0) + 1
      }
      return {
        ...state,
        elements: [...state.elements, newElement],
        selectedElementIds: [newElement.id],
        hasUnsavedChanges: true
      }
    
    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map(el =>
          el.id === action.payload.id
            ? { ...el, ...action.payload.updates }
            : el
        ),
        hasUnsavedChanges: true
      }
    
    case 'DELETE_ELEMENT':
      return {
        ...state,
        elements: state.elements.filter(el => el.id !== action.payload),
        selectedElementIds: state.selectedElementIds.filter(id => id !== action.payload),
        hasUnsavedChanges: true
      }
    
    case 'SELECT_ELEMENTS':
      return { ...state, selectedElementIds: action.payload }
    
    case 'SET_ACTIVE_TOOL':
      return { ...state, activeTool: action.payload }
    
    case 'TOGGLE_GRID':
      return { ...state, showGrid: !state.showGrid }
    
    case 'TOGGLE_RULERS':
      return { ...state, showRulers: !state.showRulers }
    
    case 'TOGGLE_SNAP_TO_GRID':
      return { ...state, snapToGrid: !state.snapToGrid }
    
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload }
    
    case 'MARK_SAVED':
      return { ...state, hasUnsavedChanges: false }
    
    case 'MARK_UNSAVED':
      return { ...state, hasUnsavedChanges: true }
    
    case 'SAVE_TO_HISTORY':
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push([...state.elements])
      return {
        ...state,
        history: newHistory.slice(-50), // Mantener solo últimas 50 entradas
        historyIndex: Math.min(newHistory.length - 1, 49)
      }
    
    case 'UNDO':
      if (state.historyIndex > 0) {
        const previousIndex = state.historyIndex - 1
        return {
          ...state,
          elements: [...state.history[previousIndex]],
          historyIndex: previousIndex,
          hasUnsavedChanges: true
        }
      }
      return state
    
    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        const nextIndex = state.historyIndex + 1
        return {
          ...state,
          elements: [...state.history[nextIndex]],
          historyIndex: nextIndex,
          hasUnsavedChanges: true
        }
      }
      return state
    
    case 'TOGGLE_IMAGE_LIBRARY':
      return { 
        ...state, 
        isImageLibraryOpen: !state.isImageLibraryOpen,
        isShapesLibraryOpen: false,
        isElementsLibraryOpen: false
      }
    
    case 'TOGGLE_SHAPES_LIBRARY':
      return { 
        ...state, 
        isShapesLibraryOpen: !state.isShapesLibraryOpen,
        isImageLibraryOpen: false,
        isElementsLibraryOpen: false
      }
    
    case 'TOGGLE_ELEMENTS_LIBRARY':
      return { 
        ...state, 
        isElementsLibraryOpen: !state.isElementsLibraryOpen,
        isImageLibraryOpen: false,
        isShapesLibraryOpen: false
      }
    
    case 'SET_ELEMENTS':
      return { ...state, elements: action.payload }
    
    default:
      return state
  }
}

interface TemplateEditorContextType {
  state: TemplateEditorState
  dispatch: React.Dispatch<TemplateEditorAction>
  
  // Acciones complejas
  addElement: (element: Omit<TemplateElement, 'id' | 'zIndex'>) => string
  updateElement: (id: string, updates: Partial<TemplateElement>) => void
  deleteElement: (id: string) => void
  selectElements: (ids: string[]) => void
  duplicateElement: (id: string) => void
  moveElement: (id: string, deltaX: number, deltaY: number) => void
  resizeElement: (id: string, width: number, height: number) => void
  
  // Acciones de canvas
  setZoom: (zoom: number) => void
  resetZoom: () => void
  
  // Acciones de historial
  undo: () => void
  redo: () => void
  saveToHistory: () => void
  
  // Getters
  getSelectedElements: () => TemplateElement[]
  getElementById: (id: string) => TemplateElement | undefined
}

const TemplateEditorContext = createContext<TemplateEditorContextType | null>(null)

export function TemplateEditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(templateEditorReducer, initialState)
  
  // Generar ID único para elementos
  const generateId = useCallback(() => {
    return `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])
  
  const addElement = useCallback((elementData: Omit<TemplateElement, 'id' | 'zIndex'>) => {
    const id = generateId()
    dispatch({
      type: 'ADD_ELEMENT',
      payload: { ...elementData, id, zIndex: 0 }
    })
    return id
  }, [generateId])
  
  const updateElement = useCallback((id: string, updates: Partial<TemplateElement>) => {
    dispatch({ type: 'UPDATE_ELEMENT', payload: { id, updates } })
  }, [])
  
  const deleteElement = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ELEMENT', payload: id })
  }, [])
  
  const selectElements = useCallback((ids: string[]) => {
    dispatch({ type: 'SELECT_ELEMENTS', payload: ids })
  }, [])
  
  const duplicateElement = useCallback((id: string) => {
    const element = state.elements.find(el => el.id === id)
    if (element) {
      const newElement = {
        ...element,
        x: element.x + 20,
        y: element.y + 20
      }
      addElement(newElement)
    }
  }, [state.elements, addElement])
  
  const moveElement = useCallback((id: string, deltaX: number, deltaY: number) => {
    const element = state.elements.find(el => el.id === id)
    if (element) {
      updateElement(id, {
        x: element.x + deltaX,
        y: element.y + deltaY
      })
    }
  }, [state.elements, updateElement])
  
  const resizeElement = useCallback((id: string, width: number, height: number) => {
    updateElement(id, { width, height })
  }, [updateElement])
  
  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom })
  }, [])
  
  const resetZoom = useCallback(() => {
    dispatch({ type: 'SET_ZOOM', payload: 1 })
  }, [])
  
  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' })
  }, [])
  
  const redo = useCallback(() => {
    dispatch({ type: 'REDO' })
  }, [])
  
  const saveToHistory = useCallback(() => {
    dispatch({ type: 'SAVE_TO_HISTORY' })
  }, [])
  
  const getSelectedElements = useCallback(() => {
    return state.elements.filter(el => state.selectedElementIds.includes(el.id))
  }, [state.elements, state.selectedElementIds])
  
  const getElementById = useCallback((id: string) => {
    return state.elements.find(el => el.id === id)
  }, [state.elements])
  
  const contextValue: TemplateEditorContextType = {
    state,
    dispatch,
    addElement,
    updateElement,
    deleteElement,
    selectElements,
    duplicateElement,
    moveElement,
    resizeElement,
    setZoom,
    resetZoom,
    undo,
    redo,
    saveToHistory,
    getSelectedElements,
    getElementById
  }
  
  return (
    <TemplateEditorContext.Provider value={contextValue}>
      {children}
    </TemplateEditorContext.Provider>
  )
}

export function useTemplateEditor() {
  const context = useContext(TemplateEditorContext)
  if (!context) {
    throw new Error('useTemplateEditor must be used within a TemplateEditorProvider')
  }
  return context
}