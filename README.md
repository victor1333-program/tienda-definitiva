# Tienda Definitiva - Sistema de E-commerce Personalizado

Una plataforma de e-commerce completa especializada en productos personalizables con sistema de personalización avanzado y gestión integral.

## 🚀 Características Principales

- **Sistema de Personalización Avanzado**: Editor visual con Fabric.js para diseños personalizados
- **Multi-Brand Stock System**: Gestión de inventario para múltiples marcas
- **Sistema de Variantes de Diseño**: Múltiples opciones de personalización por producto  
- **Panel de Administración Completo**: Gestión de productos, pedidos, inventario y más
- **Sistema de Plantillas**: Plantillas predefinidas para facilitar la personalización
- **Gestión de Usuarios**: Autenticación con NextAuth.js
- **Sistema de Notificaciones**: Alertas automáticas y WhatsApp
- **Analytics y Reportes**: Métricas de rendimiento y ventas

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15.3.3** - Framework React con SSR/SSG
- **React 18.3.1** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Framework de CSS
- **Radix UI** - Componentes de UI accesibles
- **Fabric.js** - Editor de canvas para personalización
- **Zustand** - Gestión de estado global
- **React Hook Form** - Manejo de formularios

### Backend
- **Node.js** - Runtime de JavaScript
- **Prisma** - ORM para base de datos
- **NextAuth.js** - Sistema de autenticación
- **Nodemailer** - Envío de emails
- **bcryptjs** - Encriptación de contraseñas

### Base de Datos
- **PostgreSQL/MySQL** (configurable via Prisma)

### Herramientas de Desarrollo
- **ESLint** - Linting de código
- **Jest** - Testing framework
- **tsx** - Ejecución de TypeScript

## 📁 Estructura del Proyecto

```
lovilike-dev/
├── src/
│   ├── app/                    # App Router de Next.js 15
│   │   ├── (admin)/           # Rutas protegidas de administración
│   │   │   └── admin/         # Panel de administración
│   │   │       ├── categories/
│   │   │       ├── products/
│   │   │       ├── orders/
│   │   │       ├── inventory/
│   │   │       ├── design-variants/
│   │   │       ├── templates/
│   │   │       ├── production/
│   │   │       ├── analytics/
│   │   │       └── settings/
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Endpoints de autenticación
│   │   │   ├── products/      # CRUD de productos
│   │   │   ├── orders/        # Gestión de pedidos
│   │   │   ├── personalization/ # Sistema de personalización
│   │   │   ├── design-variants/  # Variantes de diseño
│   │   │   ├── inventory/     # Gestión de inventario
│   │   │   └── admin/         # APIs administrativas
│   │   ├── auth/              # Páginas de autenticación
│   │   ├── productos/         # Catálogo de productos
│   │   ├── personalizar/      # Editor de personalización
│   │   ├── carrito/           # Carrito de compras
│   │   ├── checkout/          # Proceso de compra
│   │   └── perfil/            # Perfil de usuario
│   ├── components/            # Componentes React
│   │   ├── admin/             # Componentes administrativos
│   │   ├── editor/            # Editor de personalización
│   │   ├── products/          # Componentes de productos
│   │   ├── auth/              # Componentes de autenticación
│   │   ├── ui/                # Componentes de UI base
│   │   └── layout/            # Componentes de layout
│   ├── lib/                   # Utilidades y configuraciones
│   │   ├── auth.ts            # Configuración NextAuth
│   │   ├── db.ts              # Cliente de Prisma
│   │   ├── email.ts           # Servicio de emails
│   │   ├── utils.ts           # Utilidades generales
│   │   └── validation.ts      # Esquemas de validación
│   ├── hooks/                 # React Hooks personalizados
│   ├── types/                 # Definiciones de TypeScript
│   └── middleware.ts          # Middleware de Next.js
├── prisma/                    # Configuración de base de datos
│   ├── schema.prisma          # Esquema de la base de datos
│   ├── migrations/            # Migraciones de DB
│   └── seed.ts                # Datos de semilla
├── public/                    # Archivos estáticos
│   ├── images/                # Imágenes del sitio
│   ├── uploads/               # Archivos subidos
│   │   ├── products/          # Imágenes de productos
│   │   ├── personalization/   # Archivos de personalización
│   │   └── design-variants/   # Variantes de diseño
│   └── shapes/                # Formas para personalización
├── scripts/                   # Scripts de utilidad
├── docs/                      # Documentación
└── nginx/                     # Configuración Nginx
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Base de datos (PostgreSQL/MySQL)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd lovilike-dev
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Configurar base de datos**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

## 📋 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Construir para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Linting de código
npm run test         # Ejecutar tests
npm run type-check   # Verificar tipos TypeScript
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Push esquema a DB
npm run db:migrate   # Crear migración
npm run db:seed      # Semilla de datos
npm run db:reset     # Resetear DB y semilla
npm run db:studio    # Abrir Prisma Studio
```

## 🎨 Sistema de Personalización

### Características del Editor
- **Canvas Interactivo**: Basado en Fabric.js
- **Elementos Soportados**: Texto, imágenes, formas, SVG
- **Coordenadas Relativas**: Sistema de posicionamiento adaptativo
- **Plantillas**: Sistema de plantillas predefinidas
- **Preview en Tiempo Real**: Vista previa instantánea
- **Multi-lado**: Soporte para múltiples caras del producto

### Tipos de Personalización
- **Texto**: Fuentes personalizadas, colores, efectos
- **Imágenes**: Subida de archivos, recorte, filtros
- **Formas**: Biblioteca de formas predefinidas
- **Máscaras**: Aplicación de máscaras de recorte

## 🏪 Sistema de Productos

### Gestión de Productos
- **Productos Base**: Configuración básica del producto
- **Variantes**: Colores, tallas, materiales
- **Design Variants**: Variaciones de diseño personalizables
- **Inventario Multi-marca**: Gestión de stock por marca
- **Precios Dinámicos**: Reglas de precios configurables

### Categorías
- Sistema jerárquico de categorías
- Macro categorías para personalización
- Enlaces automáticos producto-categoría

## 👥 Sistema de Usuarios

### Roles de Usuario
- **Cliente**: Compra y personaliza productos
- **Admin**: Gestión completa del sistema
- **Editor**: Gestión de contenido y productos
- **Producción**: Gestión de pedidos y producción

### Funcionalidades
- Autenticación con NextAuth.js
- Verificación de email
- Recuperación de contraseña
- Perfil de usuario con historial de pedidos

## 📊 Panel de Administración

### Módulos Disponibles
- **Dashboard**: Métricas y estadísticas
- **Productos**: Gestión de catálogo
- **Pedidos**: Seguimiento y procesamiento
- **Inventario**: Control de stock
- **Clientes**: Gestión de usuarios
- **Analytics**: Informes y métricas
- **Configuración**: Ajustes del sistema

## 🔧 API Endpoints

### Principales Endpoints
```
GET    /api/products              # Lista de productos
POST   /api/products              # Crear producto
GET    /api/products/[id]         # Producto específico
PUT    /api/products/[id]         # Actualizar producto
DELETE /api/products/[id]         # Eliminar producto

GET    /api/orders                # Lista de pedidos
POST   /api/orders                # Crear pedido
GET    /api/orders/[id]           # Pedido específico

GET    /api/personalization/areas # Áreas de personalización
POST   /api/personalization/elements # Crear elemento
GET    /api/personalization/fonts # Fuentes disponibles

GET    /api/design-variants       # Variantes de diseño
POST   /api/design-variants       # Crear variante
GET    /api/design-variants/[id]  # Variante específica
```

## 🚀 Despliegue

### Configuración de Producción
```bash
# Construir aplicación
npm run build

# Configurar variables de entorno de producción
# Migrar base de datos
npx prisma migrate deploy

# Iniciar servidor
npm run start
```

### Docker
```bash
# Desarrollo
docker-compose -f docker-compose.dev.yml up

# Producción
docker-compose -f docker-compose.prod.yml up
```

### Nginx
Configuración incluida en `/nginx/` para reverse proxy y SSL.

## 🧪 Testing

```bash
npm run test              # Ejecutar todos los tests
npm run test:watch        # Modo watch
npm run test:coverage     # Con cobertura
npm run test:ci           # Para CI/CD
```

## 🔒 Seguridad

- Autenticación JWT con NextAuth.js
- Validación de entrada con Zod
- Sanitización HTML con DOMPurify
- Rate limiting en APIs
- Headers de seguridad configurados
- Validación de archivos subidos

## 📈 Performance

- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- Image optimization con Next.js
- Code splitting automático
- Caching estratégico
- Lazy loading de componentes

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 📞 Soporte

Para soporte técnico o consultas, contactar al equipo de desarrollo.

---

**Versión**: 0.1.0  
**Última actualización**: Octubre 2024  
**Tecnología principal**: Next.js 15 + TypeScript + Prisma
