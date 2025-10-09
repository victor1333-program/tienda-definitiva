#!/bin/bash

# Script para configurar SSL con Let's Encrypt para los dominios

set -e

echo "🔐 Configurando SSL con Let's Encrypt para los dominios..."

# Función para log con timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Verificar que los dominios apunten al servidor
log "🔍 Verificando que los dominios apunten a este servidor..."

# Obtener IP IPv4 del servidor
SERVER_IP=$(curl -s -4 ifconfig.me || curl -s -4 ipinfo.io/ip || curl -s -4 icanhazip.com)
log "📍 IP del servidor: $SERVER_IP"

# Verificar DNS de lovilike.com
log "🔍 Verificando DNS de lovilike.com..."
COM_IP=$(nslookup lovilike.com 8.8.8.8 | grep -A1 "Name:" | tail -1 | awk '{print $2}' || echo "")
if [[ "$COM_IP" == "$SERVER_IP" ]]; then
    log "✅ lovilike.com apunta correctamente a $SERVER_IP"
    SETUP_COM=true
else
    log "⚠️  lovilike.com no apunta a este servidor (apunta a: $COM_IP)"
    SETUP_COM=false
fi

# Verificar DNS de lovilike.es
log "🔍 Verificando DNS de lovilike.es..."
ES_IP=$(nslookup lovilike.es 8.8.8.8 | grep -A1 "Name:" | tail -1 | awk '{print $2}' || echo "")
if [[ "$ES_IP" == "$SERVER_IP" ]]; then
    log "✅ lovilike.es apunta correctamente a $SERVER_IP"
    SETUP_ES=true
else
    log "⚠️  lovilike.es no apunta a este servidor (apunta a: $ES_IP)"
    SETUP_ES=false
fi

# Configurar SSL para dominios que apunten correctamente
if [[ "$SETUP_COM" == true ]]; then
    log "🔐 Configurando SSL para lovilike.com..."
    certbot --nginx -d lovilike.com -d www.lovilike.com --non-interactive --agree-tos --email admin@lovilike.com --redirect
    if [[ $? -eq 0 ]]; then
        log "✅ SSL configurado exitosamente para lovilike.com"
    else
        log "❌ Error configurando SSL para lovilike.com"
    fi
fi

if [[ "$SETUP_ES" == true ]]; then
    log "🔐 Configurando SSL para lovilike.es..."
    certbot --nginx -d lovilike.es -d www.lovilike.es --non-interactive --agree-tos --email admin@lovilike.es --redirect
    if [[ $? -eq 0 ]]; then
        log "✅ SSL configurado exitosamente para lovilike.es"
    else
        log "❌ Error configurando SSL para lovilike.es"
    fi
fi

# Configurar renovación automática
log "🔄 Configurando renovación automática de SSL..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Verificar que el timer esté activo
if systemctl is-active --quiet certbot.timer; then
    log "✅ Timer de renovación automática activado"
else
    log "⚠️  Error activando timer de renovación automática"
fi

# Probar renovación
log "🧪 Probando renovación de certificados..."
certbot renew --dry-run

# Recargar Nginx
log "🔄 Recargando configuración de Nginx..."
nginx -t && systemctl reload nginx

log "✅ Configuración SSL completada!"
log "📋 Resumen:"
log "   - lovilike.com: $([ "$SETUP_COM" == true ] && echo "SSL configurado" || echo "Pendiente - verificar DNS")"
log "   - lovilike.es: $([ "$SETUP_ES" == true ] && echo "SSL configurado" || echo "Pendiente - verificar DNS")"
log "   - Renovación automática: Activada"

echo "🎉 ¡SSL configurado correctamente!"