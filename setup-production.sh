#!/bin/bash
# Script para configurar repositorio y entorno de producción

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

log "🚀 Configurando repositorio y entorno de producción para Lovilike..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecuta desde el directorio raíz del proyecto."
    exit 1
fi

# Crear backup si no existe
if [ ! -f "../lovilike-backup-"*".tar.gz" ]; then
    log "📦 Creando backup de seguridad..."
    tar -czf "../lovilike-backup-$(date +%Y%m%d-%H%M%S).tar.gz" .
    log "✅ Backup creado"
fi

# Configurar Git si no está configurado
if [ ! -d ".git" ]; then
    log "🔧 Inicializando repositorio Git..."
    git init
    
    # Configurar usuario si no está configurado
    if ! git config user.name >/dev/null 2>&1; then
        read -p "📝 Introduce tu nombre para Git: " git_name
        git config user.name "$git_name"
    fi
    
    if ! git config user.email >/dev/null 2>&1; then
        read -p "📧 Introduce tu email para Git: " git_email
        git config user.email "$git_email"
    fi
fi

# Crear .gitignore si no existe
if [ ! -f ".gitignore" ]; then
    log "📄 Creando .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next/
out/

# Logs
logs
*.log

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Database
*.db
*.sqlite

# Uploads
uploads/
temp/

# Docker
.dockerignore

# Backups
backups/
*.backup

# SSL certificates
certbot/
nginx/logs/
*.pem
EOF
fi

# Agregar todos los archivos
log "📁 Agregando archivos al repositorio..."
git add .

# Hacer commit si hay cambios
if ! git diff --staged --quiet; then
    log "💾 Creando commit..."
    git commit -m "🚀 Versión lista para producción - Sistema completo

✅ Sistema de personalización implementado y optimizado
✅ Vulnerabilidades de seguridad corregidas
✅ Configuración Docker para producción lista
✅ Scripts de despliegue automático incluidos
✅ Configuración SSL y Nginx preparada
✅ APIs implementadas y funcionando
✅ Optimizaciones de rendimiento aplicadas

🎯 Lista para desplegar en www.lovilike.es"
else
    log "ℹ️ No hay cambios nuevos para hacer commit"
fi

# Solicitar URL del repositorio remoto
echo ""
warning "🔗 CONFIGURACIÓN DEL REPOSITORIO REMOTO"
echo "Para conectar con tu repositorio remoto (GitHub, GitLab, etc.):"
echo ""
echo "1. Crea un repositorio en tu plataforma preferida"
echo "2. Copia la URL del repositorio"
echo ""
read -p "🌐 URL del repositorio remoto (o presiona Enter para omitir): " repo_url

if [ ! -z "$repo_url" ]; then
    # Verificar si ya existe el remote origin
    if git remote get-url origin >/dev/null 2>&1; then
        log "🔄 Actualizando remote origin..."
        git remote set-url origin "$repo_url"
    else
        log "➕ Agregando remote origin..."
        git remote add origin "$repo_url"
    fi
    
    log "📤 Subiendo al repositorio remoto..."
    if git push -u origin main 2>/dev/null || git push -u origin master 2>/dev/null; then
        log "✅ Código subido exitosamente al repositorio remoto"
    else
        warning "⚠️ No se pudo subir automáticamente. Verifica la URL y permisos."
        echo "Puedes intentar manualmente:"
        echo "  git push -u origin main"
    fi
else
    log "⏭️ Configuración de repositorio remoto omitida"
fi

echo ""
log "🎉 ¡Configuración completada!"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. En tu servidor de producción, ejecuta:"
echo "   git clone $repo_url lovilike-production"
echo "   cd lovilike-production"
echo ""
echo "2. Configura las variables de entorno:"
echo "   cp .env.production .env.local"
echo "   nano .env.local"
echo ""
echo "3. Ejecuta el despliegue:"
echo "   ./deploy.sh"
echo ""
echo "📦 Backup disponible en: ../lovilike-backup-*.tar.gz"