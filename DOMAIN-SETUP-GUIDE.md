# 🌐 Guía de Configuración de Dominios - Lovilike

## ✅ Sistema Nginx Configurado

Tu servidor ya está configurado para servir tu aplicación **Tienda Definitiva** a través de los dominios **lovilike.com** y **lovilike.es**.

## 📊 Estado Actual

```
✅ Nginx instalado y funcionando
✅ Virtual hosts configurados para ambos dominios
✅ Proxy reverso hacia la aplicación (puerto 3000)
✅ Configuración SSL lista (Certbot instalado)
✅ Compresión Gzip activada
✅ Headers de seguridad configurados
✅ Caché de archivos estáticos optimizado
```

## 📍 Información del Servidor

- **IP del servidor**: `147.93.53.104`
- **IPv6**: `2a02:4780:28:bf4c::1`
- **Puerto HTTP**: `80`
- **Puerto HTTPS**: `443` (cuando se configure SSL)
- **Aplicación**: `localhost:3000`

## 🔧 Configuración DNS Necesaria

Para que tus dominios funcionen, necesitas configurar los siguientes registros DNS en tu proveedor de dominios:

### Para lovilike.com:
```
Tipo    Nombre              Valor
A       lovilike.com        147.93.53.104
A       www.lovilike.com    147.93.53.104
AAAA    lovilike.com        2a02:4780:28:bf4c::1
AAAA    www.lovilike.com    2a02:4780:28:bf4c::1
```

### Para lovilike.es:
```
Tipo    Nombre              Valor
A       lovilike.es         147.93.53.104
A       www.lovilike.es     147.93.53.104
AAAA    lovilike.es         2a02:4780:28:bf4c::1
AAAA    www.lovilike.es     2a02:4780:28:bf4c::1
```

## 🔐 Configuración SSL Automática

Una vez que los DNS estén propagados (puede tardar hasta 24 horas), ejecuta:

```bash
./setup-ssl.sh
```

Este script:
- ✅ Verificará que los dominios apunten al servidor
- ✅ Configurará certificados SSL con Let's Encrypt
- ✅ Activará HTTPS automáticamente
- ✅ Configurará renovación automática de certificados
- ✅ Redirigirá HTTP a HTTPS

## 📂 Archivos de Configuración

### Nginx Virtual Hosts:
- `/etc/nginx/sites-available/lovilike.com`
- `/etc/nginx/sites-available/lovilike.es`
- `/etc/nginx/sites-enabled/lovilike.com` → enlace simbólico
- `/etc/nginx/sites-enabled/lovilike.es` → enlace simbólico

### Scripts de Gestión:
- `/home/developer/lovilike-dev/setup-ssl.sh` - Configuración SSL automática

### Logs:
- `/var/log/nginx/lovilike.com.access.log`
- `/var/log/nginx/lovilike.com.error.log`
- `/var/log/nginx/lovilike.es.access.log`
- `/var/log/nginx/lovilike.es.error.log`

## ⚡ Características Configuradas

### 🚀 Performance
- **Proxy reverso** optimizado hacia Node.js
- **Compresión Gzip** para archivos estáticos
- **Caché de archivos estáticos** (1 año para assets, 30 días para imágenes)
- **Headers de caché** optimizados

### 🛡️ Seguridad
- **Headers de seguridad** configurados:
  - `X-Frame-Options: SAMEORIGIN`
  - `X-XSS-Protection: 1; mode=block`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: no-referrer-when-downgrade`
  - `Content-Security-Policy` básico

### 📁 Archivos Estáticos
- **/_next/static** → Archivos Next.js (caché 1 año)
- **/static** → Archivos públicos (caché 1 año)
- **/images** → Imágenes (caché 30 días)
- **/uploads** → Archivos subidos (caché 30 días)

## 🔍 Verificación del Sistema

### Verificar que Nginx esté funcionando:
```bash
systemctl status nginx
nginx -t
```

### Verificar configuración de sitios:
```bash
nginx -T | grep -A 10 -B 5 "lovilike"
```

### Verificar que la aplicación responda:
```bash
curl -I http://localhost:3000
curl -I http://147.93.53.104
```

### Ver logs en tiempo real:
```bash
tail -f /var/log/nginx/lovilike.com.access.log
tail -f /var/log/nginx/lovilike.es.access.log
```

## 🔧 Comandos Útiles

### Gestión de Nginx:
```bash
systemctl restart nginx       # Reiniciar Nginx
systemctl reload nginx        # Recargar configuración
nginx -t                      # Probar configuración
```

### Gestión de SSL:
```bash
./setup-ssl.sh               # Configurar SSL automáticamente
certbot certificates         # Ver certificados instalados
certbot renew                 # Renovar certificados manualmente
```

## 📋 Próximos Pasos

1. **Configurar DNS** en tu proveedor de dominios con las IPs mostradas arriba
2. **Esperar propagación DNS** (hasta 24 horas)
3. **Ejecutar setup-ssl.sh** para configurar HTTPS automáticamente
4. **Verificar funcionamiento** accediendo a tus dominios

## 🌍 URLs de Acceso

Una vez configurado el DNS:

### HTTP (temporalmente):
- http://lovilike.com
- http://www.lovilike.com
- http://lovilike.es
- http://www.lovilike.es

### HTTPS (después de SSL):
- https://lovilike.com
- https://www.lovilike.com
- https://lovilike.es
- https://www.lovilike.es

## ⚠️ Notas Importantes

1. **Propagación DNS**: Puede tardar hasta 24-48 horas en propagarse completamente
2. **SSL automático**: Solo se configurará cuando los dominios apunten correctamente al servidor
3. **Renovación SSL**: Los certificados se renovarán automáticamente cada 90 días
4. **Logs**: Revisa los logs de Nginx si hay problemas de acceso

## 🎉 ¡Todo Listo!

Tu servidor está completamente configurado para servir tu aplicación a través de tus dominios. Solo necesitas:

1. ✅ **Configurar DNS** (apuntar dominios a `147.93.53.104`)
2. ✅ **Ejecutar SSL setup** una vez propagado el DNS
3. ✅ **¡Disfrutar de tu tienda online!**

---

**Servidor**: `147.93.53.104`  
**Estado**: ✅ Listo para dominios  
**SSL**: 🔄 Pendiente de configuración DNS