# 🧪 GUÍA DE TESTING - LOVILIKE PRODUCCIÓN

## Estado Actual de la Base de Datos

✅ **Base de datos limpia y lista para testing de producción**

### 🔑 Credenciales de Administrador
```
Email: admin@lovilike.es
Password: Admin123!Lovilike
```

> ⚠️ **IMPORTANTE**: Cambia esta contraseña después del primer login

### 📊 Estado Actual del Sistema

- **👤 Usuarios**: 1 (solo administrador)
- **📦 Productos**: 13 productos activos
- **🏷️ Variantes**: 46 variantes con stock
- **📁 Categorías**: 8 categorías organizadas
- **🛒 Órdenes**: 0 (limpio para testing)
- **🎨 Diseños**: 0 (limpio para testing)
- **📋 Stock total**: 680 unidades distribuidas

## 🛍️ Productos Disponibles para Testing

### 🎽 Textiles DTF
- **Camiseta Básica DTF**: 350 unidades (14 variantes)
  - Tallas: XS, S, M, L, XL
  - Colores: Blanco, Negro, Azul Marino, Rojo
- **Sudadera con Capucha Premium**: 60 unidades (6 variantes)
  - Colores: Gris Jaspeado, Azul Oscuro

### 🏢 Productos Empresariales
- **Polo Empresarial Bordado**: 80 unidades (8 variantes)
  - Tallas: S, M, L, XL
  - Colores: Azul Marino, Blanco

### ☕ Sublimación
- **Taza Mágica Personalizada**: 30 unidades (2 variantes)
- **Taza Cerámica Clásica**: 15 unidades
- **Taza Día del Padre**: 15 unidades

### ✂️ Corte Láser
- **Llaveros Personalizados**: 40 unidades (4 variantes)
  - Redondos: 4cm y 5cm diámetro
  - Rectangulares: 6x3cm y 8x4cm
- **Invitaciones de Boda**: 10 unidades (2 variantes)

### 🎁 Otros Productos
- **Cuadro Personalizado MDF**: 30 unidades (3 tamaños)
- **Funda Móvil**: 30 unidades (iPhone/Samsung)
- **Imán Corazón Boda**: 20 unidades

## 🎯 Plan de Testing Recomendado

### Fase 1: Testing Básico de Funcionalidad
1. **Login Administrador**
   - Acceder con credenciales proporcionadas
   - Cambiar contraseña
   - Verificar panel de administración

2. **Testing de Productos**
   - Visualizar catálogo público
   - Verificar que se muestran productos activos
   - Comprobar variantes y precios
   - Verificar imágenes de productos

3. **Sistema de Usuarios**
   - Crear cuenta de cliente de prueba
   - Verificar proceso de registro
   - Testear login/logout

### Fase 2: Testing de Carrito y Pedidos
1. **Funcionalidad de Carrito**
   - Añadir productos al carrito
   - Modificar cantidades
   - Eliminar productos
   - Verificar cálculos de precios

2. **Proceso de Checkout**
   - Información de cliente
   - Dirección de envío
   - Método de pago (simulado)
   - Confirmación de pedido

3. **Gestión de Pedidos (Admin)**
   - Ver pedidos desde panel admin
   - Cambiar estados de pedidos
   - Generar reportes básicos

### Fase 3: Testing de Personalización
1. **Editor de Diseños**
   - Probar editor con diferentes productos
   - Añadir texto personalizado
   - Subir imágenes
   - Guardar diseños

2. **Plantillas Zakeke**
   - Verificar plantillas disponibles
   - Personalizar plantillas existentes
   - Previsualizar resultados

### Fase 4: Testing Administrativo
1. **Gestión de Inventario**
   - Modificar stock de productos
   - Crear nuevas variantes
   - Gestionar categorías

2. **Sistema de Descuentos**
   - Verificar descuentos existentes:
     - `BIENVENIDO10` (10% descuento)
     - `ENVIOGRATIS` (envío gratuito)
   - Crear nuevos descuentos
   - Aplicar descuentos en pedidos

3. **Configuraciones del Sistema**
   - Revisar configuraciones generales
   - Configurar métodos de envío
   - Configurar gateways de pago

## 🔧 Herramientas de Testing Disponibles

### Scripts de Utilidad
```bash
# Verificar estado actual
node scripts/clean-for-production.js --check

# Re-configurar stock si es necesario
node scripts/add-basic-stock.js

# Analizar datos actuales
node scripts/analyze-current-data.js
```

### Endpoints API para Testing
- **Productos**: `GET /api/products/public`
- **Categorías**: `GET /api/categories`
- **Carrito**: `POST /api/cart` (requiere autenticación)
- **Órdenes**: `GET /api/orders` (requiere autenticación admin)

## 📋 Checklist de Testing

### ✅ Funcionalidades Básicas
- [ ] Login administrador funciona
- [ ] Catálogo público se muestra correctamente
- [ ] Registro de usuarios funciona
- [ ] Carrito funciona (añadir/quitar productos)
- [ ] Checkout completo funciona
- [ ] Gestión de pedidos desde admin

### ✅ Funcionalidades Avanzadas
- [ ] Editor de personalización funciona
- [ ] Plantillas Zakeke cargan correctamente
- [ ] Sistema de descuentos funciona
- [ ] Gestión de inventario funciona
- [ ] Reportes y estadísticas funcionan
- [ ] Sistema de notificaciones funciona

### ✅ Performance y UX
- [ ] Tiempos de carga aceptables
- [ ] Responsive design funciona en móvil
- [ ] Navegación intuitiva
- [ ] Mensajes de error claros
- [ ] Confirmaciones de acciones

### ✅ Seguridad
- [ ] Rutas admin protegidas
- [ ] Validación de formularios funciona
- [ ] Sanitización de inputs
- [ ] Autenticación robusta

## 🐛 Problemas Conocidos y Limitaciones

1. **Sistema de Pagos**: Actualmente en modo simulación
2. **Emails**: Configurar SMTP para testing de notificaciones
3. **Imágenes**: Verificar subida y procesamiento de imágenes
4. **WhatsApp**: Configurar credenciales para testing completo

## 🚀 Próximos Pasos Después del Testing

1. **Configuración de Producción**
   - Configurar dominio y SSL
   - Configurar SMTP real
   - Configurar gateway de pago real
   - Configurar backup automático

2. **Contenido**
   - Añadir productos reales
   - Configurar stock real
   - Crear contenido marketing (blog, páginas)
   - Configurar SEO

3. **Monitoreo**
   - Configurar analytics
   - Configurar logs de errores
   - Configurar alertas de stock
   - Configurar backup regular

## 📞 Soporte

Para problemas durante el testing:
1. Revisar logs del navegador (F12 > Console)
2. Verificar estado con scripts de verificación
3. Consultar documentación de APIs
4. Reportar bugs encontrados con detalles específicos

---

**¡La base de datos está limpia y lista para testing intensivo! 🚀**