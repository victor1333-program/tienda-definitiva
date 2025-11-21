# Documentación de Editores - Lovilike

## Editores Activos en Producción

### 1. ZakekeAdvancedEditor
**Ubicación:** `src/components/editor/ZakekeAdvancedEditor.tsx`
**Líneas de código:** ~5,352
**Usado en:**
- `/editor/[productId]/page.tsx` - Editor principal para clientes
- `/personalizar/[productId]/page.tsx` - Personalización de productos por clientes

**Propósito:** Editor de personalización que usan los clientes finales para diseñar productos personalizados.

**Características principales:**
- Canvas con zoom/pan
- Selector de variantes y lados del producto
- Añadir texto, imágenes, formas
- Áreas de impresión restringidas
- Cálculo de precios en tiempo real
- Exportar y añadir al carrito

---

### 2. TemplateEditor
**Ubicación:** `src/components/admin/templates/TemplateEditor.tsx`
**Líneas de código:** ~5,289
**Usado en:**
- `/admin/personalizacion/templates/page.tsx` - Gestión de plantillas (admin)

**Propósito:** Editor administrativo para crear y gestionar plantillas de diseño reutilizables.

**Características principales:**
- Crear plantillas desde cero
- Definir elementos editables
- Categorizar plantillas
- Asociar plantillas a productos
- Previsualización de plantillas
- Control de permisos (premium, público, etc.)

---

### 3. AreaEditor
**Ubicación:** `src/components/admin/personalization/AreaEditor.tsx`
**Líneas de código:** ~1,800
**Usado en:**
- `/admin/personalizacion/productos/[id]/page.tsx` - Configuración de productos
- `/admin/personalizacion/productos/[id]/variaciones/page.tsx` - Configuración de variantes

**Propósito:** Editor administrativo para definir áreas de impresión y personalización en productos.

**Características principales:**
- Definir zonas personalizables en productos
- Configurar dimensiones y posiciones
- Establecer restricciones (texto, imágenes, formas)
- Configurar métodos de impresión
- Herramientas de medición
- Sistema de coordenadas relativas

**Dependencias:**
- `hooks/useAreaEditor.ts` - Lógica del editor
- `types/AreaEditorTypes.ts` - Tipos TypeScript
- `components/AreaCanvas.tsx` - Canvas de áreas
- `components/AreaPropertiesPanel.tsx` - Panel de propiedades
- `components/AreaToolbar.tsx` - Barra de herramientas
- `components/MeasurementPanel.tsx` - Panel de mediciones

---

## Archivos Eliminados (Código duplicado sin uso)

Los siguientes archivos fueron eliminados el 18/11/2025 por ser duplicados sin referencias:

1. ❌ `ZakekeAdvancedEditorRefactored.tsx` - Versión refactorizada no utilizada
2. ❌ `AdvancedCustomizationEditor.tsx` - Editor alternativo no utilizado
3. ❌ `TemplateEditorNew.tsx` - Nueva versión no utilizada
4. ❌ `TemplateEditorModular.tsx` - Versión modular no utilizada
5. ❌ `TemplateEditorRefactored.tsx` - Versión refactorizada no utilizada
6. ❌ `AreaEditorRefactored.tsx` - Versión refactorizada no utilizada
7. ❌ `AreaShapeEditor.tsx` - Editor de formas no utilizado

**Espacio liberado:** ~10,000+ líneas de código duplicado

---

## Deuda Técnica Identificada

### Problema: Editores muy grandes
- `ZakekeAdvancedEditor.tsx`: 5,352 líneas
- `TemplateEditor.tsx`: 5,289 líneas

**Recomendación futura:** Considerar unificar los 3 editores en un solo "UnifiedEditor" con diferentes modos de operación. Esto reduciría la duplicación de código y facilitaría el mantenimiento.

**Prioridad:** BAJA - Implementar después del lanzamiento inicial

---

## Guía Rápida: ¿Qué editor modificar?

| Necesito cambiar... | Editor a modificar |
|---------------------|-------------------|
| Vista del cliente | `ZakekeAdvancedEditor.tsx` |
| Gestión de plantillas admin | `TemplateEditor.tsx` |
| Configuración de áreas de producto | `AreaEditor.tsx` |

---

**Última actualización:** 18 de Noviembre de 2025
**Mantenedor:** Equipo Lovilike
