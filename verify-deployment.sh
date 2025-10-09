#!/bin/bash

# 🔍 Script de Verificación Post-Deployment
# Ejecutar después del deployment para verificar que todo funciona

echo "🔍 Verificando deployment de Lovilike..."

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_service() {
    if systemctl is-active --quiet $1; then
        echo -e "${GREEN}✅ $1 está corriendo${NC}"
    else
        echo -e "${RED}❌ $1 no está corriendo${NC}"
    fi
}

check_port() {
    if netstat -tlnp | grep -q ":$1 "; then
        echo -e "${GREEN}✅ Puerto $1 está en uso${NC}"
    else
        echo -e "${RED}❌ Puerto $1 no está en uso${NC}"
    fi
}

check_url() {
    if curl -f -s $1 > /dev/null; then
        echo -e "${GREEN}✅ $1 responde correctamente${NC}"
    else
        echo -e "${RED}❌ $1 no responde${NC}"
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Verificando servicios del sistema..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_service "nginx"
check_service "postgresql"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Verificando puertos..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_port "80"
check_port "443"
check_port "3000"
check_port "5432"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Verificando aplicación PM2..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if pm2 list | grep -q "lovilike-app"; then
    STATUS=$(pm2 list | grep lovilike-app | awk '{print $10}')
    if [ "$STATUS" = "online" ]; then
        echo -e "${GREEN}✅ Aplicación PM2 está online${NC}"
    else
        echo -e "${RED}❌ Aplicación PM2 está $STATUS${NC}"
    fi
else
    echo -e "${RED}❌ Aplicación PM2 no encontrada${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌍 Verificando conectividad web..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_url "http://localhost:3000"
check_url "http://147.93.53.104"
check_url "https://lovilike.es"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  Verificando base de datos..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if sudo -u postgres psql -d lovilike_db -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Conexión a PostgreSQL exitosa${NC}"
else
    echo -e "${RED}❌ No se puede conectar a PostgreSQL${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Información del sistema..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "💾 Uso de memoria:"
free -h | head -2

echo ""
echo "💿 Uso de disco:"
df -h / | tail -1

echo ""
echo "🔥 Procesos PM2:"
pm2 list

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Comandos útiles:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Ver logs aplicación: pm2 logs lovilike-app"
echo "📊 Ver logs Nginx: sudo tail -f /var/log/nginx/lovilike_error.log"
echo "🔄 Reiniciar aplicación: pm2 restart lovilike-app"
echo "🔄 Recargar Nginx: sudo systemctl reload nginx"
echo "🔍 Monitor PM2: pm2 monit"
echo "📈 Estado del sistema: htop"
echo ""