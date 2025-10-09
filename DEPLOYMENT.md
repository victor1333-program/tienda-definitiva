# 🚀 Guía de Despliegue - Lovilike.es

Esta guía te ayudará a desplegar tu aplicación Lovilike en producción con SSL y dominio personalizado.

## 📋 Prerrequisitos

### 1. Servidor VPS
- **Sistema Operativo**: Ubuntu 20.04+ o CentOS 7+
- **RAM**: Mínimo 2GB, recomendado 4GB+
- **Almacenamiento**: Mínimo 20GB SSD
- **Acceso**: SSH con privilegios sudo

### 2. Dominio
- Dominio `lovilike.es` configurado
- Registros DNS apuntando al servidor:
  ```
  A     lovilike.es        → IP_DEL_SERVIDOR
  A     www.lovilike.es    → IP_DEL_SERVIDOR
  ```

### 3. Software Requerido en el Servidor
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Git (si no está instalado)
sudo apt install git -y
```

## 🔧 Configuración

### 1. Clonar el Repositorio en el Servidor
```bash
# En tu servidor VPS
git clone <URL_DE_TU_REPOSITORIO> lovilike-production
cd lovilike-production
```

### 2. Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.production .env.local

# Editar con valores reales
nano .env.local
```

**Variables críticas a configurar:**
- `DATABASE_URL`: URL de tu base de datos PostgreSQL
- `NEXTAUTH_SECRET`: Cadena aleatoria segura (32+ caracteres)
- `DB_PASSWORD`: Contraseña segura para PostgreSQL
- `REDIS_PASSWORD`: Contraseña segura para Redis
- Configuración de email (SMTP)
- Configuración de pagos (Stripe/Redsys)
- Configuración de Cloudinary para imágenes

### 3. Generar Contraseñas Seguras
```bash
# Generar contraseñas aleatorias
openssl rand -base64 32  # Para NEXTAUTH_SECRET
openssl rand -base64 16  # Para DB_PASSWORD
openssl rand -base64 16  # Para REDIS_PASSWORD
```

## 🚀 Despliegue

### 1. Ejecutar Script de Despliegue
```bash
# Hacer ejecutable
chmod +x deploy.sh

# Ejecutar despliegue
./deploy.sh
```

### 2. Configurar SSL
```bash
# Hacer ejecutable
chmod +x setup-ssl.sh

# Configurar SSL con Let's Encrypt
./setup-ssl.sh
```

### 3. Verificar Despliegue
```bash
# Verificar servicios
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Verificar health check
curl https://www.lovilike.es/api/health
```

## 🔒 Configuración de Seguridad

### 1. Firewall
```bash
# Configurar UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Actualizaciones Automáticas
```bash
# Instalar unattended-upgrades
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 3. Backups Automáticos
```bash
# Crear script de backup
nano backup.sh
```

Contenido del script:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U lovilike_user lovilike_production > backups/backup_$DATE.sql
find backups/ -name "backup_*.sql" -mtime +7 -delete
```

```bash
# Hacer ejecutable y agregar a cron
chmod +x backup.sh
crontab -e
# Agregar: 0 2 * * * /path/to/lovilike-production/backup.sh
```

## 📊 Monitoreo

### 1. Logs
```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Ver logs específicos
docker-compose -f docker-compose.prod.yml logs nginx
docker-compose -f docker-compose.prod.yml logs lovilike_app
docker-compose -f docker-compose.prod.yml logs postgres
```

### 2. Métricas del Sistema
```bash
# Uso de recursos
docker stats

# Espacio en disco
df -h

# Memoria
free -h
```

### 3. Health Checks
- **Aplicación**: `https://www.lovilike.es/api/health`
- **SSL**: `https://www.ssllabs.com/ssltest/`

## 🔄 Mantenimiento

### 1. Actualizar Aplicación
```bash
# Obtener últimos cambios
git pull origin main

# Reconstruir y desplegar
./deploy.sh
```

### 2. Renovar Certificados SSL
```bash
# Los certificados se renuevan automáticamente
# Para forzar renovación:
docker-compose -f docker-compose.prod.yml run --rm certbot renew
docker-compose -f docker-compose.prod.yml restart nginx
```

### 3. Reiniciar Servicios
```bash
# Reiniciar todo
docker-compose -f docker-compose.prod.yml restart

# Reiniciar servicio específico
docker-compose -f docker-compose.prod.yml restart lovilike_app
```

## 🆘 Solución de Problemas

### 1. La aplicación no responde
```bash
# Verificar estado de contenedores
docker-compose -f docker-compose.prod.yml ps

# Ver logs para errores
docker-compose -f docker-compose.prod.yml logs lovilike_app
```

### 2. Error de SSL
```bash
# Verificar certificados
docker-compose -f docker-compose.prod.yml run --rm certbot certificates

# Reconfigurar SSL
./setup-ssl.sh
```

### 3. Error de base de datos
```bash
# Verificar conexión
docker-compose -f docker-compose.prod.yml exec postgres psql -U lovilike_user -d lovilike_production -c "SELECT 1;"

# Ver logs de PostgreSQL
docker-compose -f docker-compose.prod.yml logs postgres
```

### 4. Problemas de rendimiento
```bash
# Verificar recursos
docker stats
htop

# Limpiar logs antiguos
docker system prune -f
```

## 📞 Soporte

Para problemas técnicos:
1. Verificar logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verificar health check: `curl https://www.lovilike.es/api/health`
3. Revisar configuración DNS
4. Verificar certificados SSL

## 🎉 ¡Felicidades!

Tu aplicación Lovilike debería estar funcionando en:
- **https://www.lovilike.es**
- **https://lovilike.es** (redirige a www)

Panel de administración:
- **https://www.lovilike.es/admin**