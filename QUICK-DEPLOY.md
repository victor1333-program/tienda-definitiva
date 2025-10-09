# 🚀 Guía Rápida de Deployment - Lovilike

## 📋 Información del Servidor

- **IP VPS:** 147.93.53.104
- **Dominio:** lovilike.es
- **Usuario:** appuser
- **Directorio:** /home/appuser/app

## ⚡ Deployment Rápido (5 pasos)

### 1. Configurar VPS (solo primera vez)
```bash
# Conectar como root al VPS
ssh root@147.93.53.104

# Ejecutar configuración automática
curl -o vps-setup.sh https://raw.githubusercontent.com/tu-usuario/tienda-definitiva2/main/vps-setup.sh
chmod +x vps-setup.sh
bash vps-setup.sh
```

### 2. Subir código
```bash
# Cambiar a usuario appuser
su - appuser

# Clonar repositorio
git clone https://github.com/tu-usuario/tienda-definitiva2.git /home/appuser/app
cd /home/appuser/app
```

### 3. Configurar variables de entorno
```bash
# Copiar y editar archivo de configuración
cp .env.example .env
nano .env

# Cambiar estos valores obligatorios:
# - DATABASE_URL con tu password de PostgreSQL
# - NEXTAUTH_SECRET con un secreto seguro
# - CLOUDINARY_* con tus datos de Cloudinary
# - EMAIL_* con tus datos de email
```

### 4. Ejecutar deployment
```bash
# Ejecutar script de deployment automático
bash deploy-vps.sh
```

### 5. Configurar dominio y SSL
```bash
# Configurar Nginx
sudo cp nginx.conf /etc/nginx/sites-available/lovilike
sudo ln -s /etc/nginx/sites-available/lovilike /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Configurar SSL
sudo certbot --nginx -d lovilike.es -d www.lovilike.es
```

## ✅ Verificación
```bash
# Verificar que todo funciona
bash verify-deployment.sh

# Acceder a la aplicación
curl -I https://lovilike.es
```

## 🔧 Comandos Post-Deployment

### Ver estado
```bash
pm2 status
pm2 logs lovilike-app
```

### Actualizar aplicación
```bash
cd /home/appuser/app
git pull origin main
bash deploy-vps.sh
```

### Troubleshooting
```bash
# Ver logs
pm2 logs lovilike-app --lines 50
sudo tail -f /var/log/nginx/lovilike_error.log

# Reiniciar servicios
pm2 restart lovilike-app
sudo systemctl restart nginx

# Verificar puertos
netstat -tlnp | grep -E "(80|443|3000|5432)"
```

## 📞 Contacto de Soporte

Si necesitas ayuda, contacta con:
- **IP VPS:** 147.93.53.104
- **Dominio objetivo:** https://lovilike.es
- **Logs principales:** `pm2 logs lovilike-app`

---

**¡Tu tienda estará online en menos de 30 minutos!** 🎉