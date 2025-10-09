// Constantes para el editor Zakeke
export const DEFAULT_CANVAS_SIZE = {
  width: 800,
  height: 600
}

export const DEFAULT_ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5]

export const DEFAULT_FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Georgia',
  'Palatino',
  'Garamond',
  'Comic Sans MS',
  'Trebuchet MS',
  'Arial Black',
  'Impact',
  'Open Sans',
  'Roboto',
  'Lato',
  'Montserrat',
  'Source Sans Pro',
  'Oswald',
  'Raleway',
  'PT Sans'
]

export const DEFAULT_FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 84, 96]

export const DEFAULT_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#800000', '#008000', '#000080', '#800080', '#808000', '#008080', '#808080', '#C0C0C0',
  '#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'
]

export const SHAPE_TYPES = [
  { id: 'rectangle', name: 'Rectángulo', icon: 'Square' },
  { id: 'circle', name: 'Círculo', icon: 'Circle' },
  { id: 'triangle', name: 'Triángulo', icon: 'Triangle' },
  { id: 'star', name: 'Estrella', icon: 'Star' },
  { id: 'heart', name: 'Corazón', icon: 'Heart' },
  { id: 'hexagon', name: 'Hexágono', icon: 'Hexagon' },
  { id: 'pentagon', name: 'Pentágono', icon: 'Pentagon' }
]

export const TOOLBAR_TOOLS = [
  { id: 'select', name: 'Seleccionar', icon: 'Cursor', shortcut: 'V' },
  { id: 'text', name: 'Texto', icon: 'Type', shortcut: 'T' },
  { id: 'image', name: 'Imagen', icon: 'ImageIcon', shortcut: 'I' },
  { id: 'shape', name: 'Formas', icon: 'Shapes', shortcut: 'S' }
]

export const EDITOR_KEYBINDINGS = {
  UNDO: ['ctrl+z', 'cmd+z'],
  REDO: ['ctrl+y', 'cmd+y', 'ctrl+shift+z', 'cmd+shift+z'],
  COPY: ['ctrl+c', 'cmd+c'],
  PASTE: ['ctrl+v', 'cmd+v'],
  DELETE: ['delete', 'backspace'],
  SELECT_ALL: ['ctrl+a', 'cmd+a'],
  DESELECT: ['escape'],
  ZOOM_IN: ['ctrl++', 'cmd++'],
  ZOOM_OUT: ['ctrl+-', 'cmd+-'],
  ZOOM_FIT: ['ctrl+0', 'cmd+0'],
  SAVE: ['ctrl+s', 'cmd+s']
}

export const PRINT_AREA_CONSTRAINTS = {
  MIN_WIDTH: 10,
  MIN_HEIGHT: 10,
  MAX_WIDTH: 1000,
  MAX_HEIGHT: 1000,
  DEFAULT_WIDTH: 200,
  DEFAULT_HEIGHT: 200
}

export const ELEMENT_CONSTRAINTS = {
  MIN_FONT_SIZE: 8,
  MAX_FONT_SIZE: 200,
  MIN_SIZE: 10,
  MAX_SIZE: 2000,
  MIN_OPACITY: 0,
  MAX_OPACITY: 100,
  MIN_ROTATION: 0,
  MAX_ROTATION: 360
}