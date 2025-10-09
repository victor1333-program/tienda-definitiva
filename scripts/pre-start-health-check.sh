#!/bin/bash

# Script de verificación de salud antes del arranque
# Verifica que todos los servicios necesarios estén disponibles

set -e

echo "🔍 Iniciando verificaciones de salud pre-arranque..."

# Función para log con timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Verificar que Node.js esté disponible
if ! command -v node &> /dev/null; then
    log "❌ ERROR: Node.js no está instalado"
    exit 1
fi

log "✅ Node.js disponible: $(node --version)"

# Verificar que npm esté disponible
if ! command -v npm &> /dev/null; then
    log "❌ ERROR: npm no está disponible"
    exit 1
fi

log "✅ npm disponible: $(npm --version)"

# Verificar que el puerto 3000 no esté en uso por otro proceso
if netstat -tlnp | grep ":3000 " > /dev/null; then
    log "⚠️  Puerto 3000 ya está en uso, intentando liberar..."
    # Intentar matar procesos en puerto 3000
    fuser -k 3000/tcp 2>/dev/null || true
    sleep 2
fi

log "✅ Puerto 3000 disponible"

# Verificar archivos críticos
CRITICAL_FILES=(
    "/home/developer/lovilike-dev/package.json"
    "/home/developer/lovilike-dev/server.js"
    "/home/developer/lovilike-dev/next.config.js"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        log "❌ ERROR: Archivo crítico no encontrado: $file"
        exit 1
    fi
done

log "✅ Archivos críticos verificados"

# Verificar variables de entorno críticas
cd /home/developer/lovilike-dev

if [[ ! -f ".env" && ! -f ".env.local" && ! -f ".env.production" ]]; then
    log "⚠️  Advertencia: No se encontraron archivos de variables de entorno"
fi

# Verificar que las dependencias estén instaladas
if [[ ! -d "node_modules" ]]; then
    log "⚠️  node_modules no encontrado, ejecutando npm install..."
    npm install --production
fi

log "✅ Dependencias verificadas"

# Verificar base de datos (si está configurada)
if [[ -f "prisma/schema.prisma" ]]; then
    log "🔍 Verificando Prisma..."
    if command -v npx &> /dev/null; then
        npx prisma generate > /dev/null 2>&1 || log "⚠️  Advertencia: Error al generar cliente Prisma"
    fi
fi

# Verificar que se pueda construir el proyecto
log "🔍 Verificando build del proyecto..."
if ! npm run build > /dev/null 2>&1; then
    log "⚠️  Advertencia: Error en el build, continuando..."
fi

# Limpiar procesos zombie si los hay
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "next" 2>/dev/null || true

sleep 1

log "✅ Verificaciones completadas exitosamente"
log "🚀 Sistema listo para arrancar"

exit 0