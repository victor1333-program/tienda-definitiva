# 🚀 Guía de Inicio Automático - Tienda Definitiva

## ✅ Sistema Configurado Exitosamente

Tu aplicación **Tienda Definitiva** ahora está configurada para funcionar de forma completamente automática.

## 🔧 Componentes Instalados

### 1. **PM2 - Gestor de Procesos**
- ✅ Instalado y configurado
- ✅ 2 instancias en modo cluster
- ✅ Auto-restart en caso de fallos
- ✅ Logs centralizados
- ✅ Monitoreo de memoria y CPU

### 2. **Systemd - Inicio Automático del Sistema**
- ✅ Servicio `pm2-root` configurado
- ✅ Arranque automático al reiniciar el servidor
- ✅ Integración completa con el sistema operativo

### 3. **Cron - Monitoreo Automático**
- ✅ Verificación cada 5 minutos
- ✅ Auto-recuperación en caso de fallos
- ✅ Limpieza automática de logs a las 2:00 AM

### 4. **Scripts de Gestión**
- ✅ `auto-start.sh` - Inicio completo del sistema
- ✅ `quick-build.sh` - Build optimizado
- ✅ `monitor-and-recover.sh` - Monitoreo y recuperación
- ✅ `pre-start-health-check.sh` - Verificaciones pre-arranque

## 🎯 Estado Actual

```
✅ Aplicación ONLINE en puerto 3000
✅ 2 instancias ejecutándose en modo cluster
✅ PM2 configurado para auto-arranque
✅ Monitoreo automático cada 5 minutos
✅ Logs organizados y rotación automática
```

## 📋 Comandos Útiles

### Ver Estado
```bash
pm2 status                    # Estado de procesos
pm2 monit                     # Monitor en tiempo real
pm2 logs tienda-definitiva    # Ver logs en tiempo real
```

### Gestión
```bash
pm2 restart tienda-definitiva # Reiniciar aplicación
pm2 stop tienda-definitiva    # Detener aplicación
pm2 start tienda-definitiva   # Iniciar aplicación
pm2 reload tienda-definitiva  # Reload sin downtime
```

### Logs
```bash
pm2 logs --lines 50           # Ver últimas 50 líneas
pm2 flush                     # Limpiar todos los logs
tail -f logs/monitor.log      # Monitoreo en tiempo real
```

### Scripts Útiles
```bash
./auto-start.sh               # Inicio completo del sistema
./quick-build.sh              # Build rápido
./scripts/monitor-and-recover.sh # Verificación manual
```

## 🔍 Monitoreo Automático

### Verificaciones cada 5 minutos:
- ✅ Estado de PM2 y procesos
- ✅ Health check HTTP (puerto 3000)
- ✅ Uso de memoria del sistema
- ✅ Espacio disponible en disco
- ✅ Logs de errores recientes

### Auto-recuperación:
- 🔄 Reinicio automático si la app no responde
- 🔄 Restart si uso de memoria > 90%
- 🔄 Limpieza de logs antiguos
- 🔄 Notificaciones de problemas

## 📊 Configuración de Cluster

```javascript
instances: 2              // 2 instancias para estabilidad
max_memory_restart: '1G'  // Restart si excede 1GB
restart_delay: 5000       // 5 segundos entre restarts
max_restarts: 15          // Máximo 15 restarts por hora
min_uptime: '30s'         // Mínimo 30s para considerar estable
```

## 📁 Ubicación de Archivos

```
/home/developer/lovilike-dev/
├── ecosystem.config.js           # Configuración PM2
├── auto-start.sh                 # Script inicio automático
├── quick-build.sh                # Build optimizado
├── logs/                         # Directorio de logs
│   ├── error.log                # Logs de errores
│   ├── out.log                  # Logs de salida
│   ├── combined.log             # Logs combinados
│   ├── monitor.log              # Logs de monitoreo
│   └── cron.log                 # Logs de cron
└── scripts/
    ├── monitor-and-recover.sh    # Monitoreo y recuperación
    └── pre-start-health-check.sh # Verificaciones pre-arranque
```

## 🔧 Configuración de Cron

```bash
# Monitoreo cada 5 minutos
*/5 * * * * /home/developer/lovilike-dev/scripts/monitor-and-recover.sh >> /home/developer/lovilike-dev/logs/cron.log 2>&1

# Limpieza de logs a las 2:00 AM
0 2 * * * /usr/lib/node_modules/pm2/bin/pm2 flush >> /home/developer/lovilike-dev/logs/cron.log 2>&1
```

## ⚡ Beneficios del Sistema

### 🛡️ Alta Disponibilidad
- **Zero Downtime**: Reloads sin interrumpir el servicio
- **Auto-Recovery**: Recuperación automática de fallos
- **Cluster Mode**: Múltiples instancias para estabilidad

### 📈 Performance
- **Load Balancing**: Distribución automática de carga
- **Memory Management**: Gestión inteligente de memoria
- **Process Optimization**: Optimización automática de procesos

### 🔍 Monitoreo
- **Health Checks**: Verificaciones de salud automáticas
- **Log Management**: Gestión centralizada de logs
- **Alert System**: Sistema de alertas y notificaciones

### 🔄 Mantenimiento
- **Auto-Updates**: Aplicación de updates sin downtime
- **Log Rotation**: Rotación automática de logs
- **Resource Cleanup**: Limpieza automática de recursos

## 🚨 Solución de Problemas

### Si la aplicación no responde:
```bash
pm2 restart tienda-definitiva
```

### Si PM2 no arranca:
```bash
pm2 resurrect
pm2 start ecosystem.config.js --env production
```

### Si hay problemas con systemd:
```bash
sudo systemctl status pm2-root
sudo systemctl restart pm2-root
```

### Verificar logs de problemas:
```bash
tail -f logs/error.log
tail -f logs/monitor.log
```

## 🎉 ¡Sistema Listo!

Tu aplicación **Tienda Definitiva** ahora funcionará de forma completamente automática:

- ✅ **Inicio automático** al encender el servidor
- ✅ **Monitoreo 24/7** con auto-recuperación
- ✅ **Alta disponibilidad** con múltiples instancias
- ✅ **Gestión inteligente** de recursos y logs
- ✅ **Zero maintenance** - funciona sin intervención manual

---

**¡Tu tienda online está ahora SIEMPRE disponible!** 🚀