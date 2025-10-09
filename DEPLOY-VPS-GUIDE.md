# 🖥️ Guía Completa de Deployment en VPS Hostinger

## 📋 **Pre-requisitos**

### 1. **VPS Hostinger Configurado:**
- Ubuntu 20.04+ o Debian 11+
- Al menos 2GB RAM
- Acceso SSH como root
- Dominio apuntando al VPS

### 2. **Servicios Necesarios:**
- **Cloudinary** para imágenes
- **Email SMTP** (puede usar el de Hostinger)

---

## 🚀 **Proceso de Deployment Paso a Paso**

### **Paso 1: Conectar al VPS**

```bash
# Conectar por SSH
ssh root@tu-ip-vps

# O con usuario no root
ssh usuario@tu-ip-vps
```

### **Paso 2: Configuración Inicial del Servidor**

```bash
# Ejecutar script de configuración
curl -o vps-setup.sh https://raw.githubusercontent.com/tu-repo/setup.sh
chmod +x vps-setup.sh
sudo bash vps-setup.sh
```

**O manualmente:**

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Instalar PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Instalar herramientas
apt-get install -y git curl wget vim nginx ufw certbot python3-certbot-nginx

# Instalar PM2
npm install -g pm2

# Configurar firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 3000
ufw --force enable
```

### **Paso 3: Configurar PostgreSQL**

```bash
# Cambiar a usuario postgres
sudo -u postgres psql

# Ejecutar en PostgreSQL:
CREATE USER lovilike_user WITH PASSWORD 'tu_password_super_seguro';
CREATE DATABASE lovilike_db OWNER lovilike_user;
GRANT ALL PRIVILEGES ON DATABASE lovilike_db TO lovilike_user;
GRANT ALL ON SCHEMA public TO lovilike_user;

# Verificar conexión
\\q

# Probar conexión
psql -h localhost -U lovilike_user -d lovilike_db
```

### **Paso 4: Crear Usuario de Aplicación**

```bash
# Crear usuario sin permisos de root
useradd -m -s /bin/bash appuser
usermod -aG sudo appuser

# Cambiar a usuario appuser
su - appuser

# Crear directorios
mkdir -p ~/app
mkdir -p ~/logs
```

### **Paso 5: Subir Código de la Aplicación**

**Opción A - Git (Recomendado):**

```bash
# En tu máquina local, subir a GitHub
git add .
git commit -m "Preparado para deployment VPS"
git push origin main

# En el VPS
cd /home/appuser/app
git clone https://github.com/tu-usuario/tienda-definitiva.git .
```

**Opción B - SCP:**

```bash
# En tu máquina local
scp -r /mnt/c/Users/Victor/Desktop/proyectos/tienda-definitiva/* appuser@tu-ip:/home/appuser/app/
```

### **Paso 6: Configurar Variables de Entorno**

```bash
# En el VPS, crear archivo .env
cd /home/appuser/app
nano .env
```

**Contenido del .env:**

```env
# Base de datos
DATABASE_URL="postgresql://lovilike_user:tu_password@localhost:5432/lovilike_db"

# NextAuth
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="tu-secreto-super-seguro-64-caracteres-minimo"

# Cloudinary
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"

# Email
EMAIL_FROM="noreply@tu-dominio.com"
EMAIL_SERVER_HOST="smtp.hostinger.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="tu-email@tu-dominio.com"
EMAIL_SERVER_PASSWORD="tu-password"

# App
NEXT_PUBLIC_APP_NAME="Lovilike Personalizados"
NEXT_PUBLIC_APP_URL="https://tu-dominio.com"
NODE_ENV="production"
```

### **Paso 7: Instalar y Configurar Aplicación**

```bash
# Instalar dependencias
npm install

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma db push

# Ejecutar seed (opcional)
npm run db:seed

# Build para producción
npm run build

# Probar que funciona
npm start
```

### **Paso 8: Configurar PM2**

```bash
# Iniciar con PM2
pm2 start ecosystem.config.js --env production

# Guardar configuración
pm2 save

# Auto-iniciar PM2 al reiniciar servidor
pm2 startup
# Ejecutar el comando que aparece en pantalla

# Verificar estado
pm2 status
pm2 logs lovilike-app
```

### **Paso 9: Configurar Nginx**

```bash
# Copiar configuración Nginx
sudo cp nginx.conf /etc/nginx/sites-available/lovilike

# Activar sitio
sudo ln -s /etc/nginx/sites-available/lovilike /etc/nginx/sites-enabled/

# Desactivar sitio por defecto
sudo rm /etc/nginx/sites-enabled/default

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### **Paso 10: Configurar SSL con Let's Encrypt**

```bash
# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Configurar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Paso 11: Verificación Final**

```bash
# Verificar servicios
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Verificar logs
pm2 logs lovilike-app
sudo tail -f /var/log/nginx/lovilike_access.log

# Probar aplicación
curl -I https://tu-dominio.com
```

---

## 🔧 **Comandos Útiles para Gestión**

### **PM2:**
```bash
pm2 restart lovilike-app    # Reiniciar aplicación
pm2 stop lovilike-app       # Parar aplicación
pm2 logs lovilike-app       # Ver logs
pm2 monit                   # Monitor en tiempo real
pm2 reload all              # Reload sin downtime
```

### **Nginx:**
```bash
sudo nginx -t                    # Probar configuración
sudo systemctl reload nginx     # Recargar configuración
sudo systemctl restart nginx    # Reiniciar Nginx
```

### **PostgreSQL:**
```bash
sudo -u postgres psql                    # Acceder a PostgreSQL
pg_dump -U lovilike_user lovilike_db > backup.sql  # Backup
```

### **Aplicación:**
```bash
# Actualizar aplicación
git pull origin main
npm install
npx prisma db push
npm run build
pm2 restart lovilike-app
```

---

## 🚨 **Troubleshooting**

### **Error: No se puede conectar a la base de datos**
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar conexión
psql -h localhost -U lovilike_user -d lovilike_db

# Ver logs de PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-13-main.log
```

### **Error: Aplicación no responde**
```bash
# Ver logs de PM2
pm2 logs lovilike-app

# Verificar puerto
netstat -tlnp | grep 3000

# Reiniciar aplicación
pm2 restart lovilike-app
```

### **Error: Nginx 502 Bad Gateway**
```bash
# Verificar que la aplicación esté corriendo
pm2 status

# Verificar configuración Nginx
sudo nginx -t

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

### **Error: SSL no funciona**
```bash
# Verificar certificado
sudo certbot certificates

# Renovar certificado
sudo certbot renew

# Verificar configuración SSL
sudo nginx -t
```

---

## 📊 **Monitoring y Mantenimiento**

### **Configurar Monitoring Básico:**
```bash
# Instalar htop para monitoring
sudo apt install htop

# Ver uso de recursos
htop
free -h
df -h

# Ver logs del sistema
sudo journalctl -f
```

### **Backup Automático:**
```bash
# Crear script de backup
nano /home/appuser/backup.sh
```

**Contenido del backup.sh:**
```bash
#!/bin/bash
DATE=$(date +"%Y%m%d_%H%M%S")
pg_dump -U lovilike_user lovilike_db > /home/appuser/backups/db_backup_$DATE.sql
tar -czf /home/appuser/backups/app_backup_$DATE.tar.gz /home/appuser/app
find /home/appuser/backups -name "*.sql" -mtime +7 -delete
find /home/appuser/backups -name "*.tar.gz" -mtime +7 -delete
```

```bash
# Hacer ejecutable y programar
chmod +x /home/appuser/backup.sh
crontab -e
# Agregar: 0 2 * * * /home/appuser/backup.sh
```

---

## ✅ **Checklist Final**

- [ ] VPS configurado con Node.js, PostgreSQL, Nginx
- [ ] Usuario appuser creado
- [ ] Código subido y dependencias instaladas
- [ ] Variables de entorno configuradas
- [ ] Base de datos configurada y migrada
- [ ] Aplicación construida y funcionando
- [ ] PM2 configurado y auto-inicio habilitado
- [ ] Nginx configurado como proxy reverso
- [ ] SSL configurado con Let's Encrypt
- [ ] Dominio apuntando al VPS
- [ ] Firewall configurado
- [ ] Backup automático configurado
- [ ] Monitoring básico funcionando

---

## 📞 **Soporte y Recursos**

- **Logs de aplicación:** `pm2 logs lovilike-app`
- **Logs de Nginx:** `/var/log/nginx/`
- **Logs del sistema:** `sudo journalctl -f`
- **Documentación PM2:** [https://pm2.keymetrics.io/](https://pm2.keymetrics.io/)
- **Documentación Nginx:** [https://nginx.org/en/docs/](https://nginx.org/en/docs/)

¡Tu aplicación Next.js estará corriendo en producción en tu VPS Hostinger! 🚀