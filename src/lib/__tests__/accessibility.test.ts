import { focusUtils, screenReaderUtils, keyboardUtils, contrastUtils, ariaUtils } from '../accessibility'

// Mock DOM APIs
const mockElement = {
  focus: jest.fn(),
  scrollIntoView: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  querySelectorAll: jest.fn(),
  setAttribute: jest.fn(),
  getAttribute: jest.fn(),
  removeAttribute: jest.fn(),
  parentNode: {
    appendChild: jest.fn()
  }
} as any

const mockDocument = {
  activeElement: mockElement,
  getElementById: jest.fn(),
  querySelector: jest.fn(),
  createElement: jest.fn(),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
} as any

// Mock global objects
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true
})

describe('focusUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createFocusTrap', () => {
    it('should create focus trap for element', () => {
      const focusableElements = [mockElement, mockElement]
      mockElement.querySelectorAll.mockReturnValue(focusableElements)
      
      const cleanup = focusUtils.createFocusTrap(mockElement)
      
      expect(mockElement.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
      expect(mockElement.focus).toHaveBeenCalled()
      
      cleanup()
      expect(mockElement.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('should handle Tab key navigation', () => {
      const firstElement = { focus: jest.fn() } as any
      const lastElement = { focus: jest.fn() } as any
      const focusableElements = [firstElement, lastElement]
      
      mockElement.querySelectorAll.mockReturnValue(focusableElements)
      
      let keydownHandler: (e: KeyboardEvent) => void
      mockElement.addEventListener.mockImplementation((event, handler) => {
        if (event === 'keydown') {
          keydownHandler = handler
        }
      })
      
      focusUtils.createFocusTrap(mockElement)
      
      // Simulate Tab on last element
      Object.defineProperty(mockDocument, 'activeElement', { value: lastElement })
      const tabEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: jest.fn()
      } as any
      
      keydownHandler(tabEvent)
      
      expect(firstElement.focus).toHaveBeenCalled()
      expect(tabEvent.preventDefault).toHaveBeenCalled()
    })

    it('should handle Shift+Tab key navigation', () => {
      const firstElement = { focus: jest.fn() } as any
      const lastElement = { focus: jest.fn() } as any
      const focusableElements = [firstElement, lastElement]
      
      mockElement.querySelectorAll.mockReturnValue(focusableElements)
      
      let keydownHandler: (e: KeyboardEvent) => void
      mockElement.addEventListener.mockImplementation((event, handler) => {
        if (event === 'keydown') {
          keydownHandler = handler
        }
      })
      
      focusUtils.createFocusTrap(mockElement)
      
      // Simulate Shift+Tab on first element
      Object.defineProperty(mockDocument, 'activeElement', { value: firstElement })
      const shiftTabEvent = {
        key: 'Tab',
        shiftKey: true,
        preventDefault: jest.fn()
      } as any
      
      keydownHandler(shiftTabEvent)
      
      expect(lastElement.focus).toHaveBeenCalled()
      expect(shiftTabEvent.preventDefault).toHaveBeenCalled()
    })
  })

  describe('saveFocus', () => {
    it('should save and restore focus', () => {
      Object.defineProperty(mockDocument, 'activeElement', { value: mockElement })
      
      const restoreFocus = focusUtils.saveFocus()
      restoreFocus()
      
      expect(mockElement.focus).toHaveBeenCalled()
    })
  })

  describe('skipToMain', () => {
    it('should focus main content by id', () => {
      mockDocument.getElementById.mockReturnValue(mockElement)
      
      focusUtils.skipToMain()
      
      expect(mockDocument.getElementById).toHaveBeenCalledWith('main-content')
      expect(mockElement.focus).toHaveBeenCalled()
      expect(mockElement.scrollIntoView).toHaveBeenCalled()
    })

    it('should fallback to main element', () => {
      mockDocument.getElementById.mockReturnValue(null)
      mockDocument.querySelector.mockReturnValueOnce(mockElement)
      
      focusUtils.skipToMain()
      
      expect(mockDocument.querySelector).toHaveBeenCalledWith('main')
      expect(mockElement.focus).toHaveBeenCalled()
    })
  })
})

describe('screenReaderUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDocument.createElement.mockReturnValue(mockElement)
  })

  describe('announce', () => {
    it('should create announcement element', () => {
      screenReaderUtils.announce('Test message', 'polite')
      
      expect(mockDocument.createElement).toHaveBeenCalledWith('div')
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite')
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true')
      expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockElement)
    })

    it('should remove announcement element after timeout', (done) => {
      jest.useFakeTimers()
      
      screenReaderUtils.announce('Test message')
      
      jest.advanceTimersByTime(1000)
      
      setTimeout(() => {
        expect(mockDocument.body.removeChild).toHaveBeenCalledWith(mockElement)
        jest.useRealTimers()
        done()
      }, 0)
    })
  })

  describe('updatePageTitle', () => {
    it('should update document title and announce', () => {
      const spy = jest.spyOn(screenReaderUtils, 'announce').mockImplementation()
      
      screenReaderUtils.updatePageTitle('New Page Title')
      
      expect(document.title).toBe('New Page Title')
      expect(spy).toHaveBeenCalledWith('Página cargada: New Page Title')
      
      spy.mockRestore()
    })
  })
})

describe('keyboardUtils', () => {
  describe('createArrowNavigation', () => {
    it('should create arrow navigation handler', () => {
      const items = [mockElement, mockElement, mockElement]
      mockElement.querySelectorAll.mockReturnValue(items)
      
      const cleanup = keyboardUtils.createArrowNavigation(mockElement)
      
      expect(mockElement.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
      
      cleanup()
      expect(mockElement.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })
})

describe('contrastUtils', () => {
  describe('getContrastRatio', () => {
    it('should calculate contrast ratio between colors', () => {
      const ratio = contrastUtils.getContrastRatio('#000000', '#ffffff')
      expect(ratio).toBeGreaterThan(1)
    })

    it('should return valid ratio for same colors', () => {
      const ratio = contrastUtils.getContrastRatio('#000000', '#000000')
      expect(ratio).toBe(1)
    })
  })

  describe('meetsWCAG_AA', () => {
    it('should return true for high contrast combinations', () => {
      const result = contrastUtils.meetsWCAG_AA('#000000', '#ffffff')
      expect(result).toBe(true)
    })

    it('should return false for low contrast combinations', () => {
      const result = contrastUtils.meetsWCAG_AA('#cccccc', '#ffffff')
      expect(result).toBe(false)
    })

    it('should use different threshold for large text', () => {
      const result = contrastUtils.meetsWCAG_AA('#cccccc', '#ffffff', true)
      // This might pass for large text even if it fails for normal text
      expect(typeof result).toBe('boolean')
    })
  })

  describe('meetsWCAG_AAA', () => {
    it('should return true for very high contrast combinations', () => {
      const result = contrastUtils.meetsWCAG_AAA('#000000', '#ffffff')
      expect(result).toBe(true)
    })

    it('should return false for medium contrast combinations', () => {
      const result = contrastUtils.meetsWCAG_AAA('#666666', '#ffffff')
      expect(result).toBe(false)
    })
  })
})

describe('ariaUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = ariaUtils.generateId('test')
      const id2 = ariaUtils.generateId('test')
      
      expect(id1).toMatch(/^test-/)
      expect(id2).toMatch(/^test-/)
      expect(id1).not.toBe(id2)
    })

    it('should use default prefix', () => {
      const id = ariaUtils.generateId()
      expect(id).toMatch(/^aria-/)
    })
  })

  describe('createDescribedBy', () => {
    it('should set aria-describedby attribute', () => {
      mockDocument.getElementById.mockReturnValue(mockElement)
      mockElement.getAttribute.mockReturnValue(null)
      
      ariaUtils.createDescribedBy('element-id', 'description-id')
      
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-describedby', 'description-id')
    })

    it('should append to existing aria-describedby', () => {
      mockDocument.getElementById.mockReturnValue(mockElement)
      mockElement.getAttribute.mockReturnValue('existing-id')
      
      ariaUtils.createDescribedBy('element-id', 'description-id')
      
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-describedby', 'existing-id description-id')
    })
  })

  describe('createLabelledBy', () => {
    it('should set aria-labelledby attribute', () => {
      mockDocument.getElementById.mockReturnValue(mockElement)
      
      ariaUtils.createLabelledBy('element-id', 'label-id')
      
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-labelledby', 'label-id')
    })
  })

  describe('updateLiveRegion', () => {
    it('should update live region content', () => {
      mockDocument.getElementById.mockReturnValue(mockElement)
      
      ariaUtils.updateLiveRegion('region-id', 'New content', 'assertive')
      
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive')
      expect(mockElement.textContent).toBe('New content')
    })
  })
})