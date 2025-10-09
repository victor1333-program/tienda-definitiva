# 🚀 Tienda Definitiva - Versión para Hosting VPS

Esta es la versión preparada específicamente para deployment en VPS Hostinger con las siguientes optimizaciones:

## 🔧 Configuraciones para Producción

### ✅ Base de Datos
- **PostgreSQL** en lugar de SQLite
- Schema optimizado para producción
- Variables de entorno configuradas

### ✅ Servidor
- **Standalone mode** habilitado en Next.js
- Servidor Node.js personalizado (`server.js`)
- Configuración PM2 para gestión de procesos

### ✅ Proxy Reverso
- Configuración Nginx optimizada
- SSL/HTTPS ready
- Caching de archivos estáticos

### ✅ Scripts de Deployment
- `vps-setup.sh` - Configuración completa del servidor
- `deploy-vps.sh` - Script de deployment automatizado
- Guía completa en `DEPLOY-VPS-GUIDE.md`

## 🚀 Proceso de Deployment

### 1. Configurar VPS (ejecutar como root)
```bash
curl -o vps-setup.sh https://tu-repo/vps-setup.sh
chmod +x vps-setup.sh
sudo bash vps-setup.sh
```

### 2. Subir código al VPS
```bash
# Opción A: Git (recomendado)
git clone https://github.com/tu-usuario/tienda-definitiva2.git /home/appuser/app

# Opción B: SCP
scp -r tienda-definitiva2/* appuser@tu-ip:/home/appuser/app/
```

### 3. Configurar variables de entorno
```bash
cd /home/appuser/app
cp .env.example .env
nano .env  # Configurar con tus datos reales
```

### 4. Ejecutar deployment
```bash
bash deploy-vps.sh
```

### 5. Configurar dominio y SSL
```bash
# Actualizar nginx.conf con tu dominio
sudo cp nginx.conf /etc/nginx/sites-available/lovilike
sudo ln -s /etc/nginx/sites-available/lovilike /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Configurar SSL
sudo certbot --nginx -d lovilike.es -d www.lovilike.es
```

## 📋 Variables de Entorno Requeridas

Ver `.env.example` para la lista completa. Las principales son:

```env
DATABASE_URL="postgresql://lovilike_user:password@localhost:5432/lovilike_db"
NEXTAUTH_URL="https://lovilike.es"
NEXTAUTH_SECRET="secreto-super-seguro"
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"
```

## 🔍 Verificación

Una vez completado el deployment:

1. **Verificar servicios:**
   ```bash
   pm2 status
   sudo systemctl status nginx
   sudo systemctl status postgresql
   ```

2. **Verificar aplicación:**
   ```bash
   curl -I https://lovilike.es
   ```

3. **Ver logs:**
   ```bash
   pm2 logs lovilike-app
   sudo tail -f /var/log/nginx/lovilike_error.log
   ```

## 🛠️ Gestión Post-Deployment

### Actualizar aplicación
```bash
cd /home/appuser/app
git pull origin main
npm install
npx prisma db push
npm run build
pm2 restart lovilike-app
```

### Backup de base de datos
```bash
pg_dump -U lovilike_user lovilike_db > backup_$(date +%Y%m%d).sql
```

### Monitoring
```bash
pm2 monit  # Monitor en tiempo real
htop       # Recursos del sistema
```

## 📞 Soporte

- **IP VPS:** 147.93.53.104
- **Dominio:** lovilike.es
- **Logs aplicación:** `pm2 logs lovilike-app`
- **Logs Nginx:** `/var/log/nginx/lovilike_error.log`

---

**Nota:** Esta versión está optimizada específicamente para producción en VPS. El proyecto original en `tienda-definitiva` permanece intacto para desarrollo local.