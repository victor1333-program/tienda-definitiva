#!/bin/bash
# Script para configurar SSL con Let's Encrypt para Lovilike.es

set -e

echo "🔒 Configurando SSL para Lovilike.es..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Configuración
DOMAIN="lovilike.es"
WWW_DOMAIN="www.lovilike.es"
EMAIL="admin@lovilike.es"  # Cambia por tu email real

log "Configurando SSL para dominios: $DOMAIN y $WWW_DOMAIN"

# Verificar que los servicios están corriendo
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    error "Los servicios no están corriendo. Ejecuta primero ./deploy.sh"
fi

# Crear directorio para certificados
mkdir -p certbot/conf
mkdir -p certbot/www

# Generar certificados DH parameters (opcional pero recomendado)
log "Generando parámetros DH (esto puede tomar varios minutos)..."
if [ ! -f "nginx/dhparam.pem" ]; then
    docker run --rm -v $(pwd)/nginx:/output alpine/openssl dhparam -out /output/dhparam.pem 2048
    log "Parámetros DH generados ✓"
else
    log "Parámetros DH ya existen ✓"
fi

# Función para verificar si el dominio apunta al servidor
check_domain() {
    local domain=$1
    log "Verificando configuración DNS para $domain..."
    
    # Obtener IP del servidor
    SERVER_IP=$(curl -s http://ipv4.icanhazip.com/ || curl -s http://ifconfig.me/)
    
    # Obtener IP del dominio
    DOMAIN_IP=$(dig +short $domain | tail -n1)
    
    if [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
        log "DNS configurado correctamente para $domain ✓"
        return 0
    else
        warning "DNS no configurado correctamente para $domain"
        warning "IP del servidor: $SERVER_IP"
        warning "IP del dominio: $DOMAIN_IP"
        return 1
    fi
}

# Verificar configuración DNS
if check_domain $DOMAIN && check_domain $WWW_DOMAIN; then
    log "Configuración DNS verificada ✓"
else
    warning "Configuración DNS no es correcta. Verifica que los dominios apunten a este servidor."
    read -p "¿Quieres continuar de todos modos? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Configuración SSL cancelada"
    fi
fi

# Obtener certificados SSL
log "Obteniendo certificados SSL de Let's Encrypt..."

# Usar staging primero para pruebas (opcional)
read -p "¿Usar servidor de staging de Let's Encrypt para pruebas? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    STAGING_FLAG="--staging"
    warning "Usando servidor de staging - los certificados NO serán válidos para producción"
else
    STAGING_FLAG=""
    log "Usando servidor de producción de Let's Encrypt"
fi

# Obtener certificados
docker-compose -f docker-compose.prod.yml run --rm certbot \
    certonly --webroot \
    --webroot-path /var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    $STAGING_FLAG \
    -d $DOMAIN \
    -d $WWW_DOMAIN

if [ $? -eq 0 ]; then
    log "Certificados SSL obtenidos exitosamente ✓"
else
    error "Fallo al obtener certificados SSL"
fi

# Habilitar configuración SSL en nginx
log "Habilitando configuración SSL en Nginx..."

# Descomentar líneas SSL en nginx.conf si están comentadas
if grep -q "#ssl_dhparam" nginx/conf.d/ssl.conf; then
    sed -i 's/#ssl_dhparam/ssl_dhparam/' nginx/conf.d/ssl.conf
    log "Configuración DH habilitada ✓"
fi

# Reiniciar nginx para aplicar certificados
log "Reiniciando Nginx..."
docker-compose -f docker-compose.prod.yml restart nginx

sleep 5

# Verificar que SSL está funcionando
log "Verificando configuración SSL..."
if curl -s -I https://$WWW_DOMAIN | grep -q "HTTP/"; then
    log "SSL configurado correctamente ✓"
else
    warning "SSL podría no estar funcionando correctamente"
fi

# Mostrar información de certificados
log "Información de certificados:"
docker-compose -f docker-compose.prod.yml run --rm certbot certificates

log "🎉 ¡SSL configurado exitosamente!"
log "Tu sitio web ahora debería estar disponible en:"
log "  https://$DOMAIN"
log "  https://$WWW_DOMAIN"
log ""
log "Los certificados se renovarán automáticamente."
log "Para forzar una renovación:"
log "  docker-compose -f docker-compose.prod.yml run --rm certbot renew"