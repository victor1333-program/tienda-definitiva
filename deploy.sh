#!/bin/bash
# Script de despliegue para Lovilike.es

set -e

echo "🚀 Iniciando despliegue de Lovilike.es..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "No se encontró package.json. Ejecuta este script desde el directorio raíz del proyecto."
fi

# Verificar que Docker está instalado y funcionando
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado. Instálalo primero."
fi

if ! docker info &> /dev/null; then
    error "Docker no está corriendo. Inicia el servicio de Docker."
fi

# Verificar que docker-compose está instalado
if ! command -v docker-compose &> /dev/null; then
    error "docker-compose no está instalado. Instálalo primero."
fi

log "Verificando archivos de configuración..."

# Verificar archivos necesarios
required_files=(
    "Dockerfile"
    "docker-compose.prod.yml"
    ".env.production"
    "nginx/nginx.conf"
    "nginx/conf.d/lovilike.conf"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        error "Archivo requerido no encontrado: $file"
    fi
done

log "Todos los archivos de configuración están presentes ✓"

# Crear directorios necesarios
log "Creando directorios necesarios..."
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p nginx/logs
mkdir -p uploads
mkdir -p logs
mkdir -p backups

log "Directorios creados ✓"

# Verificar variables de entorno
log "Verificando variables de entorno..."
if [ ! -f ".env.production" ]; then
    error "Archivo .env.production no encontrado"
fi

# Verificar que las variables críticas estén configuradas
env_vars=(
    "DB_PASSWORD"
    "REDIS_PASSWORD"
    "NEXTAUTH_SECRET"
)

for var in "${env_vars[@]}"; do
    if ! grep -q "^${var}=" .env.production; then
        warning "Variable de entorno ${var} no encontrada en .env.production"
    fi
done

log "Variables de entorno verificadas ✓"

# Construir la aplicación
log "Construyendo la aplicación Next.js..."
if ! npm run build; then
    error "Fallo en la construcción de la aplicación"
fi

log "Aplicación construida exitosamente ✓"

# Detener servicios existentes (si existen)
log "Deteniendo servicios existentes..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

log "Servicios detenidos ✓"

# Construir imágenes de Docker
log "Construyendo imágenes de Docker..."
docker-compose -f docker-compose.prod.yml build --no-cache

log "Imágenes construidas ✓"

# Iniciar servicios
log "Iniciando servicios..."
docker-compose -f docker-compose.prod.yml up -d

log "Servicios iniciados ✓"

# Esperar a que los servicios estén listos
log "Esperando a que los servicios estén listos..."
sleep 30

# Verificar que los servicios están funcionando
log "Verificando estado de los servicios..."
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    error "Algunos servicios no están funcionando correctamente"
fi

log "Servicios verificados ✓"

# Mostrar estado de los servicios
log "Estado de los servicios:"
docker-compose -f docker-compose.prod.yml ps

log "🎉 ¡Despliegue completado exitosamente!"
log "La aplicación debería estar disponible en: https://www.lovilike.es"
log ""
log "Para verificar logs:"
log "  docker-compose -f docker-compose.prod.yml logs -f"
log ""
log "Para parar los servicios:"
log "  docker-compose -f docker-compose.prod.yml down"