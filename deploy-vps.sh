#!/bin/bash

# 🚀 Script de Deployment Completo para VPS Hostinger
# Ejecutar en el VPS: bash deploy-vps.sh

set -e  # Parar si hay errores

echo "🚀 Iniciando deployment en VPS Hostinger..."

# Variables (modificar según tu configuración)
APP_NAME="lovilike-app"
APP_DIR="/home/appuser/app"
DOMAIN="tu-dominio.com"
DB_NAME="lovilike_db"
DB_USER="lovilike_user"
DB_PASS="tu_password_seguro"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Verificar que estamos en el directorio correcto
print_message "Verificando directorio de aplicación..."
if [ ! -d "$APP_DIR" ]; then
    print_error "Directorio $APP_DIR no existe"
    exit 1
fi

cd $APP_DIR

# 2. Actualizar código desde Git (si está configurado)
if [ -d ".git" ]; then
    print_message "Actualizando código desde Git..."
    git pull origin main
else
    print_warning "No es un repositorio Git. Asegúrate de que el código esté actualizado."
fi

# 3. Instalar dependencias
print_message "Instalando dependencias..."
npm install --production=false

# 4. Generar Prisma Client
print_message "Generando Prisma Client..."
npx prisma generate

# 5. Ejecutar migraciones de base de datos
print_message "Ejecutando migraciones de base de datos..."
npx prisma db push

# 6. Build de la aplicación
print_message "Construyendo aplicación..."
npm run build

# 7. Configurar PM2 si no está corriendo
print_message "Configurando PM2..."
if pm2 list | grep -q "$APP_NAME"; then
    print_message "Reiniciando aplicación existente..."
    pm2 restart $APP_NAME
else
    print_message "Iniciando nueva aplicación..."
    pm2 start ecosystem.config.js --env production
fi

# 8. Guardar configuración PM2
pm2 save
pm2 startup

# 9. Verificar estado de la aplicación
print_message "Verificando estado de la aplicación..."
pm2 status
pm2 logs $APP_NAME --lines 10

# 10. Verificar que Nginx esté corriendo
print_message "Verificando Nginx..."
if systemctl is-active --quiet nginx; then
    print_message "Nginx está corriendo correctamente"
    systemctl reload nginx
else
    print_warning "Nginx no está corriendo. Iniciando..."
    systemctl start nginx
    systemctl enable nginx
fi

# 11. Verificar conexión a base de datos
print_message "Verificando conexión a base de datos..."
if npx prisma db seed > /dev/null 2>&1; then
    print_message "Conexión a base de datos OK"
else
    print_warning "No se pudo ejecutar el seed (posiblemente la BD ya tiene datos)"
fi

# 12. Verificar que la aplicación responde
print_message "Verificando que la aplicación responde..."
sleep 5
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_message "✅ Aplicación funcionando en puerto 3000"
else
    print_error "❌ La aplicación no responde en puerto 3000"
    pm2 logs $APP_NAME --lines 20
fi

# 13. Mostrar resumen
echo ""
echo "🎉 ¡Deployment completado!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Aplicación: $APP_NAME"
echo "📁 Directorio: $APP_DIR"
echo "🌐 Dominio: https://$DOMAIN"
echo "🔧 Estado PM2: $(pm2 list | grep $APP_NAME | awk '{print $10}')"
echo "📊 Logs: pm2 logs $APP_NAME"
echo "🔄 Reiniciar: pm2 restart $APP_NAME"
echo "🛑 Parar: pm2 stop $APP_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configurar SSL con certbot si no está hecho"
echo "2. Configurar variables de entorno en .env"
echo "3. Verificar que el dominio apunte al VPS"
echo "4. Probar la aplicación en https://$DOMAIN"
echo ""