# Guía de Migración a Nuevo VPS

Esta guía te ayudará a migrar completamente el proyecto Lovilike a un nuevo servidor VPS, incluyendo la base de datos, configuraciones y archivos.

## Requisitos Previos en el Nuevo VPS

### 1. Software Necesario
```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar Nginx
sudo apt install -y nginx

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar Git
sudo apt install -y git

# Instalar Certbot para SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Configurar PostgreSQL

```bash
# Acceder a PostgreSQL
sudo -u postgres psql

# Crear usuario y base de datos
CREATE USER lovilike_user WITH PASSWORD 'tu_password_seguro';
CREATE DATABASE lovilike_db OWNER lovilike_user;
GRANT ALL PRIVILEGES ON DATABASE lovilike_db TO lovilike_user;
\q
```

## Pasos de Migración

### 1. Clonar el Repositorio

```bash
# Crear directorio para el proyecto
mkdir -p /home/developer
cd /home/developer

# Clonar el repositorio
git clone git@github.com:victor1333-program/tienda-definitiva.git lovilike-dev
cd lovilike-dev
```

### 2. Instalar Dependencias

```bash
# Instalar dependencias del proyecto
npm install
```

### 3. Restaurar la Base de Datos

```bash
# Restaurar el backup completo
PGPASSWORD=tu_password_seguro psql -h localhost -U lovilike_user -d lovilike_db -f backups/lovilike_dev_backup.sql

# Verificar que la restauración fue exitosa
PGPASSWORD=tu_password_seguro psql -h localhost -U lovilike_user -d lovilike_db -c "SELECT COUNT(*) FROM \"User\";"
```

### 4. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env.local

# Editar con tus valores
nano .env.local
```

**Valores importantes a configurar:**

- `DATABASE_URL`: URL de conexión a PostgreSQL
- `NEXTAUTH_URL`: Tu dominio (https://tu-dominio.com)
- `NEXTAUTH_SECRET`: Generar con `openssl rand -base64 32`
- `CLOUDINARY_*`: Credenciales de Cloudinary
- `COMPANY_*`: Información de la empresa

### 5. Construir el Proyecto

```bash
# Construir para producción
npm run build

# Verificar que no hay errores
```

### 6. Configurar PM2

```bash
# Iniciar la aplicación con PM2
pm2 start ecosystem.config.js

# Configurar PM2 para inicio automático
pm2 startup
pm2 save

# Verificar que está corriendo
pm2 status
pm2 logs lovilike-production
```

### 7. Configurar Nginx

Crear el archivo de configuración de Nginx:

```bash
sudo nano /etc/nginx/sites-available/lovilike
```

Contenido:

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activar el sitio:

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/lovilike /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 8. Configurar SSL con Certbot

```bash
# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

### 9. Configurar Firewall

```bash
# Configurar UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## Verificación Final

### 1. Verificar la Aplicación

```bash
# Verificar logs de PM2
pm2 logs lovilike-production --lines 50

# Verificar estado
pm2 status

# Verificar conexión a base de datos
pm2 logs lovilike-production | grep -i "database\|postgres\|error"
```

### 2. Verificar Nginx

```bash
# Verificar estado
sudo systemctl status nginx

# Verificar logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. Probar en el Navegador

Abrir https://tu-dominio.com y verificar:
- [ ] La página carga correctamente
- [ ] Las imágenes se muestran
- [ ] El login funciona
- [ ] Los productos se cargan
- [ ] El editor de personalización funciona

## Troubleshooting

### Problema: La aplicación no inicia

```bash
# Ver logs detallados
pm2 logs lovilike-production --lines 100

# Reiniciar aplicación
pm2 restart lovilike-production

# Ver variables de entorno
pm2 env 0
```

### Problema: Error de base de datos

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Verificar conexión
PGPASSWORD=tu_password psql -h localhost -U lovilike_user -d lovilike_db -c "SELECT 1;"

# Ver logs de PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Problema: Nginx no funciona

```bash
# Verificar configuración
sudo nginx -t

# Ver logs
sudo tail -f /var/log/nginx/error.log

# Reiniciar Nginx
sudo systemctl restart nginx
```

## Mantenimiento

### Backup Regular de Base de Datos

```bash
# Crear script de backup
nano ~/backup-db.sh
```

Contenido:

```bash
#!/bin/bash
BACKUP_DIR="/home/developer/lovilike-dev/backups"
DATE=$(date +%Y%m%d_%H%M%S)
PGPASSWORD=tu_password pg_dump -h localhost -U lovilike_user -d lovilike_db -F p -f "$BACKUP_DIR/backup_$DATE.sql"

# Mantener solo los últimos 7 backups
cd $BACKUP_DIR
ls -t backup_*.sql | tail -n +8 | xargs -r rm
```

```bash
# Hacer ejecutable
chmod +x ~/backup-db.sh

# Agregar a crontab (backup diario a las 2 AM)
crontab -e
# Agregar: 0 2 * * * /home/developer/backup-db.sh
```

### Actualizar el Código

```bash
cd /home/developer/lovilike-dev

# Descargar últimos cambios
git pull origin main

# Instalar nuevas dependencias
npm install

# Reconstruir
npm run build

# Reiniciar aplicación
pm2 restart lovilike-production
```

## Datos Importantes del Sistema Actual

- **Puerto de la aplicación**: 3000
- **Base de datos**: PostgreSQL
- **Nombre de la BD**: lovilike_dev (cambiar a lovilike_db en nuevo VPS)
- **Usuario de BD**: developer (cambiar a lovilike_user en nuevo VPS)
- **Gestor de procesos**: PM2
- **Servidor web**: Nginx
- **Certificado SSL**: Let's Encrypt (Certbot)

## Contacto

Para cualquier problema durante la migración, consultar:
- Repositorio: https://github.com/victor1333-program/tienda-definitiva
- Email: info@lovilike.es
