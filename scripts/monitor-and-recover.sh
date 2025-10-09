#!/bin/bash

# Script de monitoreo y auto-recuperación para Tienda Definitiva
# Se ejecuta cada 5 minutos para verificar el estado de la aplicación

set -e

# Configuración
PROJECT_NAME="tienda-definitiva"
PROJECT_DIR="/home/developer/lovilike-dev"
LOG_FILE="$PROJECT_DIR/logs/monitor.log"
HEALTH_URL="http://localhost:3000/api/health"
MAX_RETRIES=3
RETRY_DELAY=10

# Función para log con timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Función para verificar si PM2 está corriendo
check_pm2_running() {
    pm2 list | grep -q "$PROJECT_NAME" && pm2 list | grep "$PROJECT_NAME" | grep -q "online"
}

# Función para verificar la salud de la aplicación
check_app_health() {
    local retry_count=0
    
    while [[ $retry_count -lt $MAX_RETRIES ]]; do
        if curl -s --max-time 10 "$HEALTH_URL" > /dev/null 2>&1; then
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        if [[ $retry_count -lt $MAX_RETRIES ]]; then
            log "⚠️  Health check falló (intento $retry_count/$MAX_RETRIES), reintentando en ${RETRY_DELAY}s..."
            sleep $RETRY_DELAY
        fi
    done
    
    return 1
}

# Función para verificar uso de memoria
check_memory_usage() {
    local memory_usage
    memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    
    if (( $(echo "$memory_usage > 90.0" | bc -l) )); then
        log "⚠️  Uso de memoria alto: ${memory_usage}%"
        return 1
    fi
    
    return 0
}

# Función para verificar espacio en disco
check_disk_space() {
    local disk_usage
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [[ $disk_usage -gt 90 ]]; then
        log "⚠️  Espacio en disco bajo: ${disk_usage}% usado"
        # Limpiar logs antiguos
        find "$PROJECT_DIR/logs" -name "*.log" -mtime +7 -delete 2>/dev/null || true
        return 1
    fi
    
    return 0
}

# Función para reiniciar la aplicación
restart_application() {
    log "🔄 Reiniciando aplicación..."
    
    cd "$PROJECT_DIR"
    
    # Detener aplicación
    pm2 stop "$PROJECT_NAME" 2>/dev/null || true
    
    # Esperar
    sleep 5
    
    # Limpiar procesos zombie
    pkill -f "node.*server.js" 2>/dev/null || true
    pkill -f "next" 2>/dev/null || true
    
    # Reiniciar con PM2
    pm2 start ecosystem.config.js --env production
    
    # Esperar que arranque
    sleep 10
    
    if check_app_health; then
        log "✅ Aplicación reiniciada exitosamente"
        return 0
    else
        log "❌ Fallo al reiniciar aplicación"
        return 1
    fi
}

# Función para enviar notificación (placeholder para futuras mejoras)
send_notification() {
    local message="$1"
    # Aquí se puede agregar envío de email, Slack, etc.
    log "📢 Notificación: $message"
}

# Función principal de monitoreo
main() {
    log "🔍 Iniciando monitoreo de Tienda Definitiva..."
    
    # Verificar que el directorio del proyecto existe
    if [[ ! -d "$PROJECT_DIR" ]]; then
        log "❌ Directorio del proyecto no encontrado: $PROJECT_DIR"
        exit 1
    fi
    
    # Crear directorio de logs si no existe
    mkdir -p "$PROJECT_DIR/logs"
    
    # Verificar si PM2 está corriendo
    if ! check_pm2_running; then
        log "⚠️  PM2 no está corriendo o aplicación no está online"
        restart_application
        return
    fi
    
    # Verificar salud de la aplicación
    if ! check_app_health; then
        log "❌ Health check falló después de $MAX_RETRIES intentos"
        send_notification "Aplicación no responde - reiniciando"
        restart_application
        return
    fi
    
    # Verificar recursos del sistema
    if ! check_memory_usage; then
        log "⚠️  Problema de memoria detectado"
        pm2 restart "$PROJECT_NAME" --update-env
    fi
    
    if ! check_disk_space; then
        log "⚠️  Problema de espacio en disco detectado"
    fi
    
    # Verificar logs de errores recientes
    if [[ -f "$PROJECT_DIR/logs/error.log" ]]; then
        local recent_errors
        recent_errors=$(tail -50 "$PROJECT_DIR/logs/error.log" | grep -c "$(date '+%Y-%m-%d')" || echo "0")
        
        if [[ $recent_errors -gt 10 ]]; then
            log "⚠️  Muchos errores detectados hoy: $recent_errors"
            send_notification "Alto número de errores detectados: $recent_errors"
        fi
    fi
    
    log "✅ Monitoreo completado - todo funcionando correctamente"
}

# Ejecutar función principal
main "$@"