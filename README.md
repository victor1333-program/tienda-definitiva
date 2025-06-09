# Tienda Definitiva

E-commerce moderno construido con Next.js, TypeScript y Prisma.

## Características

- 🛍️ Gestión de productos y catálogo
- 📦 Sistema de pedidos y ventas
- 📊 Dashboard administrativo
- 💰 Sistema de facturación
- 📱 Responsive design
- 🔐 Seguridad y autenticación
- 📚 Documentación completa

## Tecnologías

- Next.js 13+ con App Router
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Shadcn UI
- React Hook Form
- Zod

## Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno:
   ```bash
   cp .env.example .env
   ```
4. Inicializa la base de datos:
   ```bash
   npx prisma migrate dev
   ```
5. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Estructura del Proyecto

```
tienda-definitiva/
├── public/
│   ├── logo.png
│   └── uploads/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── admin/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       └── ... (secciones admin)
│   ├── components/
│   │   ├── layout/
│   │   ├── sidebar/
│   │   ├── forms/
│   │   ├── ui/
│   │   └── icons/
│   ├── lib/
│   ├── types/
│   ├── hooks/
│   └── styles/
│       └── globals.css
└── ... (archivos de configuración)
```

## Contribución

1. Crea una rama para tu feature:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
2. Commit tus cambios:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
3. Push a la rama:
   ```bash
   git push origin feature/AmazingFeature
   ```

## Licencia

MIT
