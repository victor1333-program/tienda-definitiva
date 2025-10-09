#!/bin/bash

echo "🚀 INICIANDO SERVIDOR LOVILIKE CON VARIABLES DE ENTORNO"
echo "======================================================"

# Cargar variables de entorno
export DATABASE_URL="postgresql://developer:dev123@localhost:5432/lovilike_dev"
export NEXTAUTH_URL="http://147.93.53.104:3000"
export NEXTAUTH_SECRET="dev-secret-lovilike-2024"
export NODE_ENV="development"
export NEXT_TELEMETRY_DISABLED=1

# Variables de empresa
export COMPANY_NAME="Lovilike Personalizados"
export COMPANY_CIF="77598953N"
export COMPANY_ADDRESS="Calle Antonio López del Oro, 7"
export COMPANY_POSTAL_CODE="02400"
export COMPANY_CITY="Hellín"
export COMPANY_PROVINCE="Albacete"
export COMPANY_PHONE="611066997"
export COMPANY_EMAIL="info@lovilike.es"

echo "✅ Variables de entorno cargadas:"
echo "   NEXTAUTH_URL: $NEXTAUTH_URL"
echo "   NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:0:10}..."
echo "   NODE_ENV: $NODE_ENV"
echo ""

# Verificar que el puerto esté libre
PORT=3000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Puerto $PORT está ocupado, terminando procesos..."
    kill -9 $(lsof -ti:$PORT) 2>/dev/null || true
    sleep 3
fi

# Terminar cualquier proceso Next.js existente
pkill -f "next dev" 2>/dev/null || true
sleep 2

echo "🔄 Iniciando servidor Next.js en puerto $PORT..."
export PORT=3000
npm run dev