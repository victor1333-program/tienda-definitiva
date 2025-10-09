# 🚀 Tienda Definitiva - Versión VPS

Esta es la versión optimizada de Tienda Definitiva preparada específicamente para deploy en VPS.

## 📋 Requisitos del Servidor

### Sistema Operativo
- Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- Mínimo 2GB RAM (recomendado 4GB)
- Mínimo 20GB almacenamiento
- Conexión a internet estable

### Software Requerido
- Node.js 18+ 
- npm 8+
- PostgreSQL 14+ (o SQLite para desarrollo)
- Nginx
- PM2 (se instala automáticamente)
- Git (opcional, para actualizaciones)

## 🛠️ Instalación Rápida

### 1. Preparar el servidor
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Instalar Nginx
sudo apt install nginx -y

# Instalar PM2 globalmente
sudo npm install -g pm2
```

### 2. Configurar base de datos (PostgreSQL)
```bash
sudo -u postgres psql
CREATE DATABASE tienda_definitiva;
CREATE USER tienda_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE tienda_definitiva TO tienda_user;
\q
```

### 3. Subir el proyecto
```bash
# Opción A: Desde Git
git clone https://github.com/tu-usuario/tienda-definitiva.git
cd tienda-definitiva

# Opción B: Subir archivos manualmente
# Usar SCP, SFTP o panel de control del VPS
```

### 4. Deploy automático
```bash
# Ejecutar script de deploy
./deploy-vps.sh

# Seguir las instrucciones en pantalla
# El script configurará todo automáticamente
```

## ⚙️ Configuración Manual (Opcional)

### Variables de Entorno (.env.production)
```bash
# Base de datos
DATABASE_URL="postgresql://tienda_user:tu_password@localhost:5432/tienda_definitiva"

# NextAuth
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="tu-secret-muy-seguro-de-32-caracteres-minimo"

# Sitio
NEXT_PUBLIC_SITE_URL="https://tu-dominio.com"

# Email (opcional)
EMAIL_FROM="noreply@tu-dominio.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email@gmail.com"
SMTP_PASSWORD="tu-password-de-aplicacion"

# Cloudinary (opcional)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### Configuración de Nginx
```bash
# Copiar configuración
sudo cp nginx-site.conf /etc/nginx/sites-available/tienda-definitiva
sudo ln -s /etc/nginx/sites-available/tienda-definitiva /etc/nginx/sites-enabled/

# Editar servidor_name con tu dominio
sudo nano /etc/nginx/sites-available/tienda-definitiva

# Verificar y reiniciar
sudo nginx -t
sudo systemctl restart nginx
```

### SSL con Certbot (Recomendado)
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

## 🔧 Gestión de la Aplicación

### Comandos PM2
```bash
pm2 status                    # Ver estado
pm2 logs tienda-definitiva    # Ver logs
pm2 restart tienda-definitiva # Reiniciar
pm2 stop tienda-definitiva    # Parar
pm2 delete tienda-definitiva  # Eliminar
pm2 monit                     # Monitor interactivo
```

### Scripts Incluidos
```bash
./start.sh      # Iniciar aplicación
./monitor.sh    # Monitorear estado
./deploy-vps.sh # Re-deploy completo
```

### Actualizar la Aplicación
```bash
# Si usas Git
git pull origin main
./deploy-vps.sh

# Si subes archivos manualmente
# 1. Reemplazar archivos
# 2. Ejecutar ./deploy-vps.sh
```

## 📊 Monitoreo y Logs

### Ubicación de Logs
- **PM2**: `logs/`
- **Nginx**: `/var/log/nginx/`
- **Sistema**: `/var/log/syslog`

### Comandos de Monitoreo
```bash
# Estado de servicios
sudo systemctl status nginx
sudo systemctl status postgresql

# Uso de recursos
htop
df -h
free -h

# Logs en tiempo real
tail -f logs/combined.log
sudo tail -f /var/log/nginx/access.log
```

## 🔒 Seguridad

### Configuraciones Incluidas
✅ Headers de seguridad configurados
✅ Rate limiting activado
✅ Archivos sensibles protegidos
✅ Compresión gzip habilitada
✅ SSL/TLS recomendado

### Configuraciones Adicionales Recomendadas
```bash
# Firewall básico
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Fail2ban para proteger SSH
sudo apt install fail2ban -y

# Actualizaciones automáticas
sudo apt install unattended-upgrades -y
```

## 🚨 Solución de Problemas

### La aplicación no inicia
```bash
# Verificar logs
pm2 logs tienda-definitiva

# Verificar variables de entorno
cat .env.production

# Verificar conexión a BD
npx prisma db push
```

### Error de conexión a BD
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Verificar conexión
psql postgresql://tienda_user:password@localhost:5432/tienda_definitiva
```

### Nginx no sirve el sitio
```bash
# Verificar configuración
sudo nginx -t

# Verificar estado
sudo systemctl status nginx

# Verificar logs
sudo tail -f /var/log/nginx/error.log
```

### Problemas de rendimiento
```bash
# Monitorear recursos
./monitor.sh

# Verificar memoria
pm2 monit

# Optimizar base de datos
npx prisma db seed
```

## 📞 Soporte

### Información de Debug
```bash
# Información del sistema
cat /etc/os-release
node --version
npm --version
pm2 --version

# Estado de la aplicación
./monitor.sh

# Logs completos
pm2 logs tienda-definitiva --lines 50
```

### Archivos de Configuración Importantes
- `.env.production` - Variables de entorno
- `ecosystem.config.js` - Configuración PM2
- `nginx-site.conf` - Configuración Nginx
- `DEPLOY-GUIDE.md` - Guía detallada (generada tras deploy)

## 🔄 Backup y Restauración

### Backup de Base de Datos
```bash
# Crear backup
pg_dump tienda_definitiva > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql tienda_definitiva < backup_20240101.sql
```

### Backup de Archivos
```bash
# Backup completo (excluyendo node_modules)
tar -czf backup_$(date +%Y%m%d).tar.gz --exclude='node_modules' --exclude='.next' .
```

---

## 🎉 ¡Listo!

Tu aplicación está preparada para producción. Después del deploy:

1. ✅ Edita `.env.production` con tus valores
2. ✅ Configura tu dominio en Nginx
3. ✅ Ejecuta `./start.sh`
4. ✅ Configura SSL con Certbot
5. ✅ Monitorea con `./monitor.sh`

**¡Tu tienda online estará funcionando!** 🚀