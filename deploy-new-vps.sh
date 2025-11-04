#!/bin/bash

# Script de despliegue automatizado para nuevo VPS
# Este script debe ejecutarse en el NUEVO servidor VPS

set -e  # Salir si hay algún error

echo "=== Iniciando despliegue de Lovilike en nuevo VPS ==="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
PROJECT_DIR="/home/developer/lovilike-dev"
BACKUP_FILE="backups/lovilike_dev_backup.sql"
DB_NAME="lovilike_db"
DB_USER="lovilike_user"

# Función para mostrar mensajes
print_step() {
    echo -e "${GREEN}==>${NC} $1"
}

print_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}ADVERTENCIA:${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "No se encuentra el directorio del proyecto en $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# 1. Verificar dependencias del sistema
print_step "Verificando dependencias del sistema..."

if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL no está instalado"
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    print_error "PM2 no está instalado. Instalar con: sudo npm install -g pm2"
    exit 1
fi

if ! command -v nginx &> /dev/null; then
    print_warning "Nginx no está instalado (opcional pero recomendado)"
fi

print_step "Todas las dependencias están instaladas ✓"

# 2. Verificar archivo .env.local
print_step "Verificando configuración..."

if [ ! -f ".env.local" ]; then
    print_error "No se encuentra el archivo .env.local"
    echo "Por favor, copia .env.example a .env.local y configura tus valores:"
    echo "  cp .env.example .env.local"
    echo "  nano .env.local"
    exit 1
fi

print_step "Archivo .env.local encontrado ✓"

# 3. Instalar dependencias
print_step "Instalando dependencias de Node.js..."
npm install

# 4. Restaurar base de datos
print_step "¿Deseas restaurar la base de datos desde el backup? (s/n)"
read -r restore_db

if [ "$restore_db" = "s" ] || [ "$restore_db" = "S" ]; then
    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "No se encuentra el archivo de backup en $BACKUP_FILE"
        exit 1
    fi
    
    print_step "Restaurando base de datos..."
    echo "Ingresa la contraseña de PostgreSQL para el usuario $DB_USER:"
    read -s DB_PASSWORD
    
    # Verificar conexión
    PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null
    
    if [ $? -eq 0 ]; then
        print_step "Conexión a base de datos exitosa"
        PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f $BACKUP_FILE
        print_step "Base de datos restaurada exitosamente ✓"
    else
        print_error "No se pudo conectar a la base de datos"
        exit 1
    fi
else
    print_warning "Saltando restauración de base de datos"
fi

# 5. Ejecutar migraciones de Prisma (si existen)
print_step "Ejecutando migraciones de Prisma..."
npx prisma generate
npx prisma db push --skip-generate || print_warning "No se pudieron ejecutar las migraciones"

# 6. Construir el proyecto
print_step "Construyendo el proyecto para producción..."
npm run build

if [ $? -eq 0 ]; then
    print_step "Build completado exitosamente ✓"
else
    print_error "Falló el build del proyecto"
    exit 1
fi

# 7. Configurar PM2
print_step "Configurando PM2..."

# Detener instancia existente si existe
pm2 delete lovilike-production 2>/dev/null || true

# Iniciar con PM2
pm2 start ecosystem.config.js

# Guardar configuración de PM2
pm2 save

print_step "PM2 configurado exitosamente ✓"

# 8. Verificar que la aplicación está corriendo
print_step "Verificando que la aplicación está corriendo..."
sleep 3

if pm2 list | grep -q "lovilike-production.*online"; then
    print_step "Aplicación corriendo exitosamente ✓"
else
    print_error "La aplicación no está corriendo. Verifica los logs con: pm2 logs"
    exit 1
fi

# 9. Configurar inicio automático
print_step "¿Deseas configurar PM2 para inicio automático del sistema? (s/n)"
read -r setup_startup

if [ "$setup_startup" = "s" ] || [ "$setup_startup" = "S" ]; then
    print_step "Configurando inicio automático..."
    pm2 startup
    echo ""
    print_warning "Ejecuta el comando mostrado arriba con sudo si es necesario"
fi

# Finalización
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ¡Despliegue completado exitosamente!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Pasos siguientes:"
echo "  1. Verificar logs: pm2 logs lovilike-production"
echo "  2. Ver estado: pm2 status"
echo "  3. Configurar Nginx (ver MIGRATION.md)"
echo "  4. Configurar SSL con Certbot (ver MIGRATION.md)"
echo "  5. Probar la aplicación en tu navegador"
echo ""
echo "Para más información, consulta MIGRATION.md"
echo ""
