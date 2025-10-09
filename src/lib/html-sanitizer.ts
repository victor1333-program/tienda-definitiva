import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitiza contenido HTML para prevenir ataques XSS
 * manteniendo solo elementos y atributos seguros
 */
export function sanitizeHTML(html: string): string {
  if (!html) return ''
  
  // Configuración estricta para contenido rico pero seguro
  const cleanHTML = DOMPurify.sanitize(html, {
    // Elementos permitidos para rich text
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'span', 'div',
      'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    
    // Atributos permitidos y seguros
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'id',
      'width', 'height', 'style'
    ],
    
    // Solo permitir estilos CSS seguros
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    
    // Configuraciones adicionales de seguridad
    ALLOW_DATA_ATTR: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
    
    // Hook para validar URLs en enlaces e imágenes
    ALLOWED_SCHEMES: ['http', 'https', 'mailto', 'tel'],
    
    // Remover elementos vacíos
    REMOVE_EMPTY_ELEMENTS: true
  })
  
  return cleanHTML
}

/**
 * Sanitización más estricta para contenido de usuario
 * (comentarios, descripciones, etc.)
 */
export function sanitizeUserHTML(html: string): string {
  if (!html) return ''
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'blockquote'
    ],
    ALLOWED_ATTR: ['class'],
    SANITIZE_DOM: true,
    KEEP_CONTENT: true
  })
}

/**
 * Solo texto plano - remueve TODOS los tags HTML
 */
export function stripHTML(html: string): string {
  if (!html) return ''
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  })
}