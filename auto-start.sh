#!/bin/bash

# Script de inicio automático para Tienda Definitiva
# Este script configura e inicia el proyecto con PM2

set -e

echo "🚀 Configurando inicio automático de Tienda Definitiva..."

# Función para log con timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Cambiar al directorio del proyecto
cd /home/developer/lovilike-dev

log "📁 Directorio de trabajo: $(pwd)"

# Detener procesos existentes si los hay
log "🛑 Deteniendo procesos existentes..."
pm2 stop tienda-definitiva 2>/dev/null || true
pm2 delete tienda-definitiva 2>/dev/null || true

# Limpiar procesos zombie
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "next" 2>/dev/null || true

# Esperar un momento para que se liberen los recursos
sleep 3

# Verificar que el build esté actualizado
log "🔨 Verificando build del proyecto..."
if [[ ! -d ".next" ]] || [[ ! -f ".next/BUILD_ID" ]]; then
    log "📦 Construyendo proyecto..."
    npm run build
fi

# Generar cliente Prisma si es necesario
if [[ -f "prisma/schema.prisma" ]]; then
    log "🗄️  Generando cliente Prisma..."
    npx prisma generate
fi

# Crear directorio de logs si no existe
mkdir -p logs

# Iniciar con PM2 usando la configuración de ecosystem
log "🚀 Iniciando aplicación con PM2..."
pm2 start ecosystem.config.js --env production

# Guardar la configuración de PM2 para auto-arranque
log "💾 Guardando configuración de PM2..."
pm2 save

# Mostrar estado
log "📊 Estado actual de PM2:"
pm2 status

log "✅ Configuración de inicio automático completada!"
log "🌟 La aplicación se iniciará automáticamente al reiniciar el servidor"
log "📋 Comandos útiles:"
log "   - Ver estado: pm2 status"
log "   - Ver logs: pm2 logs tienda-definitiva"
log "   - Reiniciar: pm2 restart tienda-definitiva"
log "   - Detener: pm2 stop tienda-definitiva"
log "   - Monitorear: pm2 monit"

echo "🎉 ¡Tienda Definitiva configurada para inicio automático!"