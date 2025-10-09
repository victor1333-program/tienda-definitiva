#!/bin/bash
echo "🚀 Iniciando Lovilike 2.0 en modo desarrollo..."

# Iniciar base de datos (si usas Docker)
# docker-compose up -d postgres

# Ejecutar migraciones
npx prisma db push

# Generar cliente Prisma
npx prisma generate

# Iniciar servidor de desarrollo
npm run dev