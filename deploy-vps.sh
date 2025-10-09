#!/bin/bash

# 🚀 Script de Deploy Automatizado para VPS
# Uso: ./deploy-vps.sh

set -e  # Parar si hay errores

echo "🚀 Iniciando deploy en VPS..."

# Variables de configuración
APP_NAME="tienda-definitiva"
NODE_VERSION="18"
NGINX_SITE="tienda-definitiva"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones para logs
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "No se encontró package.json. ¿Estás en el directorio correcto?"
    exit 1
fi

# Crear directorios necesarios
log_step "Creando directorios necesarios..."
mkdir -p logs
mkdir -p public/uploads/{design,instruction,reference}

# 1. Actualizar código (si es un repo git)
if [ -d ".git" ]; then
    log_step "Actualizando código desde Git..."
    git pull origin main || log_warn "No se pudo actualizar desde Git"
fi

# 2. Limpiar instalación anterior
log_step "Limpiando instalación anterior..."
rm -rf node_modules
rm -rf .next
npm cache clean --force

# 3. Instalar dependencias
log_step "Instalando dependencias..."
npm ci --only=production

# 4. Configurar variables de entorno
if [ ! -f ".env.production" ]; then
    log_warn "Archivo .env.production no encontrado"
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env.production
        log_info "Creado .env.production desde el ejemplo"
        log_warn "¡IMPORTANTE! Edita .env.production con tus valores reales antes de continuar"
        echo "Presiona Enter para continuar o Ctrl+C para cancelar..."
        read
    else
        log_error "No se encontró .env.production.example"
        exit 1
    fi
fi

# 5. Configurar base de datos
log_step "Configurando base de datos..."
npx prisma generate

# Solo hacer push si no hay el flag --skip-db
if [ "$1" != "--skip-db" ]; then
    npx prisma db push
    log_info "Base de datos actualizada"
else
    log_warn "Saltando actualización de base de datos"
fi

# 6. Build de la aplicación
log_step "Construyendo aplicación..."
NODE_ENV=production npm run build

if [ $? -ne 0 ]; then
    log_error "Error en el build. Verifica los errores arriba."
    exit 1
fi

# 7. Verificar/Instalar PM2
if ! command -v pm2 &> /dev/null; then
    log_step "Instalando PM2..."
    npm install -g pm2
fi

# 8. Configurar PM2
log_step "Configurando PM2..."

# Detener app anterior si existe
pm2 delete $APP_NAME 2>/dev/null || true

# 9. Crear configuración de Nginx
log_step "Creando configuración de Nginx..."
cat > nginx-site.conf << EOF
server {
    listen 80;
    server_name _;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=static:10m rate=30r/s;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60;
        proxy_connect_timeout 60;
        proxy_send_timeout 60;
    }

    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files with caching
    location /_next/static {
        alias \$(pwd)/.next/static;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Uploads directory
    location /uploads {
        alias \$(pwd)/public/uploads;
        expires 30d;
        access_log off;
        add_header Cache-Control "public";
    }

    # Images and assets
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|avif)\$ {
        root \$(pwd)/public;
        expires 30d;
        access_log off;
        add_header Cache-Control "public";
    }

    # Deny access to sensitive files
    location ~ /\.(env|git) {
        deny all;
        return 404;
    }
}
EOF

# 10. Crear script de inicio
log_step "Creando script de inicio..."
cat > start.sh << EOF
#!/bin/bash
export NODE_ENV=production
export PORT=3000

# Cargar variables de entorno
if [ -f .env.production ]; then
    set -a
    source .env.production
    set +a
fi

# Iniciar con PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
EOF

chmod +x start.sh

# 11. Crear script de monitoreo
cat > monitor.sh << EOF
#!/bin/bash
echo "🔍 Estado de la aplicación:"
echo "=========================="
pm2 status
echo ""
echo "📊 Uso de memoria:"
echo "=================="
pm2 monit --no-interaction | head -20
echo ""
echo "📝 Logs recientes:"
echo "=================="
pm2 logs $APP_NAME --lines 10 --nostream
EOF

chmod +x monitor.sh

# 12. Verificaciones finales
log_step "Realizando verificaciones finales..."

# Verificar archivos críticos
critical_files=("server.js" "package.json" "ecosystem.config.js" ".env.production")
for file in "${critical_files[@]}"; do
    if [ ! -f "$file" ]; then
        log_error "Archivo crítico faltante: $file"
        exit 1
    fi
done

# Verificar build
if [ ! -d ".next" ]; then
    log_error "El directorio .next no fue creado. Build falló."
    exit 1
fi

# 13. Crear documentación de deploy
cat > DEPLOY-GUIDE.md << EOF
# Guía de Deploy - Tienda Definitiva

## 🚀 Aplicación desplegada exitosamente

### 📋 Información del Deploy
- **Aplicación**: $APP_NAME
- **Node.js**: v$NODE_VERSION
- **Fecha**: $(date)
- **Usuario**: $(whoami)
- **Directorio**: $(pwd)

### 🔧 Comandos útiles

#### PM2 (Gestión de procesos)
\`\`\`bash
pm2 status                      # Ver estado
pm2 logs $APP_NAME              # Ver logs en tiempo real
pm2 restart $APP_NAME           # Reiniciar app
pm2 stop $APP_NAME              # Parar app
pm2 delete $APP_NAME            # Eliminar app
pm2 monit                       # Monitor interactivo
\`\`\`

#### Scripts incluidos
\`\`\`bash
./start.sh                      # Iniciar aplicación
./monitor.sh                    # Monitorear estado
./deploy-vps.sh --skip-db       # Re-deploy sin DB
\`\`\`

#### Nginx
\`\`\`bash
sudo systemctl restart nginx    # Reiniciar Nginx
sudo nginx -t                   # Verificar configuración
sudo systemctl status nginx     # Ver estado
\`\`\`

#### Base de datos
\`\`\`bash
npx prisma studio               # Abrir interfaz web
npx prisma db push              # Actualizar esquema
npx prisma generate             # Regenerar cliente
\`\`\`

### 📁 Estructura de archivos
- \`logs/\` - Logs de la aplicación
- \`public/uploads/\` - Archivos subidos
- \`.next/\` - Build de producción
- \`nginx-site.conf\` - Configuración de Nginx
- \`.env.production\` - Variables de entorno

### 🔒 Configuración de seguridad
- Headers de seguridad configurados
- Rate limiting habilitado
- Archivos sensibles protegidos
- Compresión gzip activada

### 📞 Soporte
Si necesitas ayuda, revisa:
1. Logs: \`pm2 logs $APP_NAME\`
2. Estado: \`./monitor.sh\`
3. Configuración: \`.env.production\`

### 🔄 Actualizar la aplicación
\`\`\`bash
git pull origin main            # Actualizar código
./deploy-vps.sh                 # Re-deploy completo
\`\`\`
EOF

# Éxito!
echo ""
echo "🎉 ¡Deploy completado exitosamente!"
echo "========================================"
echo ""
log_info "✅ Aplicación construida y lista"
log_info "✅ Configuración PM2 preparada"
log_info "✅ Configuración Nginx creada"
log_info "✅ Scripts de gestión creados"
log_info "✅ Documentación generada"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ejecutar: ./start.sh"
echo "2. Configurar Nginx con: nginx-site.conf"
echo "3. Configurar SSL (certbot)"
echo "4. Verificar con: ./monitor.sh"
echo ""
echo "📖 Lee DEPLOY-GUIDE.md para más información"
echo ""
log_info "🚀 ¡Tu aplicación está lista para producción!"