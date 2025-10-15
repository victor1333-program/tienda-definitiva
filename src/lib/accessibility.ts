// Accessibility utilities and helpers

import { useEffect, useRef, useCallback, useState } from 'react'

// Focus management utilities
export const focusUtils = {
  /**
   * Focus trap for modal and dropdown components
   */
  createFocusTrap: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
      
      if (e.key === 'Escape') {
        const closeButton = element.querySelector('[aria-label*="cerrar"], [aria-label*="close"]') as HTMLElement
        if (closeButton) {
          closeButton.click()
        }
      }
    }

    element.addEventListener('keydown', handleTab)
    
    // Focus first element initially
    if (firstElement) {
      firstElement.focus()
    }

    return () => {
      element.removeEventListener('keydown', handleTab)
    }
  },

  /**
   * Restore focus to previously focused element
   */
  saveFocus: () => {
    const activeElement = document.activeElement as HTMLElement
    return () => {
      if (activeElement && activeElement.focus) {
        activeElement.focus()
      }
    }
  },

  /**
   * Skip to main content functionality
   */
  skipToMain: () => {
    const mainContent = document.getElementById('main-content') || 
                       document.querySelector('main') ||
                       document.querySelector('[role="main"]')
    
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView()
    }
  }
}

// Screen reader utilities
export const screenReaderUtils = {
  /**
   * Announce message to screen readers
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.textContent = message
    
    document.body.appendChild(announcer)
    
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  },

  /**
   * Update page title for screen readers
   */
  updatePageTitle: (title: string) => {
    document.title = title
    screenReaderUtils.announce(`Página cargada: ${title}`)
  }
}

// Keyboard navigation utilities
export const keyboardUtils = {
  /**
   * Handle arrow key navigation for lists and grids
   */
  createArrowNavigation: (
    container: HTMLElement,
    options: {
      selector?: string
      wrap?: boolean
      orientation?: 'horizontal' | 'vertical' | 'both'
    } = {}
  ) => {
    const {
      selector = '[role="option"], [role="menuitem"], button, a',
      wrap = true,
      orientation = 'vertical'
    } = options

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = Array.from(container.querySelectorAll(selector)) as HTMLElement[]
      const currentIndex = items.findIndex(item => item === document.activeElement)
      
      if (currentIndex === -1) return

      let nextIndex = currentIndex
      
      switch (e.key) {
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            nextIndex = currentIndex + 1
            if (wrap && nextIndex >= items.length) nextIndex = 0
            e.preventDefault()
          }
          break
          
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            nextIndex = currentIndex - 1
            if (wrap && nextIndex < 0) nextIndex = items.length - 1
            e.preventDefault()
          }
          break
          
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            nextIndex = currentIndex + 1
            if (wrap && nextIndex >= items.length) nextIndex = 0
            e.preventDefault()
          }
          break
          
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            nextIndex = currentIndex - 1
            if (wrap && nextIndex < 0) nextIndex = items.length - 1
            e.preventDefault()
          }
          break
          
        case 'Home':
          nextIndex = 0
          e.preventDefault()
          break
          
        case 'End':
          nextIndex = items.length - 1
          e.preventDefault()
          break
      }
      
      if (nextIndex !== currentIndex && items[nextIndex]) {
        items[nextIndex].focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }
}

// Color contrast utilities
export const contrastUtils = {
  /**
   * Check if color combination meets WCAG contrast requirements
   */
  getContrastRatio: (color1: string, color2: string): number => {
    const getLuminance = (color: string): number => {
      const rgb = hexToRgb(color)
      if (!rgb) return 0
      
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    }
    
    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  },

  /**
   * Check if contrast meets WCAG AA standard
   */
  meetsWCAG_AA: (color1: string, color2: string, isLargeText = false): boolean => {
    const ratio = contrastUtils.getContrastRatio(color1, color2)
    return isLargeText ? ratio >= 3 : ratio >= 4.5
  },

  /**
   * Check if contrast meets WCAG AAA standard
   */
  meetsWCAG_AAA: (color1: string, color2: string, isLargeText = false): boolean => {
    const ratio = contrastUtils.getContrastRatio(color1, color2)
    return isLargeText ? ratio >= 4.5 : ratio >= 7
  }
}

// React hooks for accessibility

/**
 * Hook for focus management in modals and overlays
 */
export function useFocusTrap(isActive: boolean) {
  const ref = useRef<HTMLElement>(null)
  const restoreFocusRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!isActive || !ref.current) return

    // Save current focus
    restoreFocusRef.current = focusUtils.saveFocus()

    // Create focus trap
    const cleanup = focusUtils.createFocusTrap(ref.current)

    return () => {
      cleanup()
      if (restoreFocusRef.current) {
        restoreFocusRef.current()
      }
    }
  }, [isActive])

  return ref
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation(
  options: {
    selector?: string
    wrap?: boolean
    orientation?: 'horizontal' | 'vertical' | 'both'
  } = {}
) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return

    return keyboardUtils.createArrowNavigation(ref.current, options)
  }, [options])

  return ref
}

/**
 * Hook for screen reader announcements
 */
export function useAnnouncer() {
  return useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    screenReaderUtils.announce(message, priority)
  }, [])
}

/**
 * Hook for skip link functionality
 */
export function useSkipLink() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip to main content with Ctrl+/
      if (e.ctrlKey && e.key === '/') {
        focusUtils.skipToMain()
        e.preventDefault()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}

/**
 * Hook for reduced motion preferences
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// ARIA utilities
export const ariaUtils = {
  /**
   * Generate unique IDs for ARIA relationships
   */
  generateId: (prefix = 'aria'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  },

  /**
   * Create describedby relationship
   */
  createDescribedBy: (elementId: string, descriptionId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      const existingDescribedBy = element.getAttribute('aria-describedby')
      const newDescribedBy = existingDescribedBy 
        ? `${existingDescribedBy} ${descriptionId}` 
        : descriptionId
      element.setAttribute('aria-describedby', newDescribedBy)
    }
  },

  /**
   * Create labelledby relationship
   */
  createLabelledBy: (elementId: string, labelId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.setAttribute('aria-labelledby', labelId)
    }
  },

  /**
   * Update live region
   */
  updateLiveRegion: (regionId: string, content: string, priority: 'polite' | 'assertive' = 'polite') => {
    const region = document.getElementById(regionId)
    if (region) {
      region.setAttribute('aria-live', priority)
      region.textContent = content
    }
  }
}

// Form accessibility utilities
export const formAccessibilityUtils = {
  /**
   * Add error announcements to form fields
   */
  announceError: (fieldId: string, errorMessage: string) => {
    const field = document.getElementById(fieldId)
    if (field) {
      field.setAttribute('aria-invalid', 'true')
      const errorId = `${fieldId}-error`
      
      // Create or update error element
      let errorElement = document.getElementById(errorId)
      if (!errorElement) {
        errorElement = document.createElement('div')
        errorElement.id = errorId
        errorElement.className = 'sr-only'
        errorElement.setAttribute('role', 'alert')
        field.parentNode?.appendChild(errorElement)
      }
      
      errorElement.textContent = errorMessage
      ariaUtils.createDescribedBy(fieldId, errorId)
    }
  },

  /**
   * Clear error announcements
   */
  clearError: (fieldId: string) => {
    const field = document.getElementById(fieldId)
    if (field) {
      field.removeAttribute('aria-invalid')
      const errorId = `${fieldId}-error`
      const errorElement = document.getElementById(errorId)
      if (errorElement) {
        errorElement.remove()
      }
    }
  }
}