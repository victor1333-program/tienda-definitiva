# 🚨 Sistema de Alertas Automáticas de Stock

## 📋 Descripción

El sistema de alertas automáticas de LoviLike monitorea constantemente el inventario y genera alertas cuando:

- **Materiales** tienen stock por debajo del mínimo configurado
- **Variantes de productos** tienen stock ≤ 5 unidades o stock = 0  
- **Productos base** tienen stock ≤ 5 unidades o stock = 0

## 🔧 Configuración

### 1. Variables de Entorno

Agrega esta variable a tu archivo `.env`:

```bash
# Clave secreta para el sistema de cron jobs y alertas automáticas
CRON_SECRET=lovilike-cron-2024
```

Para producción, usa una clave más segura:

```bash
CRON_SECRET=tu-clave-super-secreta-aqui
```

### 2. Ejecución Manual

Puedes generar alertas manualmente desde la interfaz de administración:

1. Ve a **Admin** → **Inventario** → **Alertas**
2. Haz clic en **"Generar Alertas"**
3. El sistema escaneará automáticamente todo el inventario

### 3. Ejecución Automática (Cron Jobs)

#### Opción A: Script Node.js

```bash
# Ejecutar cada hora
0 * * * * cd /path/to/lovilike && node scripts/auto-generate-stock-alerts.js

# Ejecutar cada 6 horas
0 */6 * * * cd /path/to/lovilike && node scripts/auto-generate-stock-alerts.js

# Ejecutar diariamente a las 8:00 AM
0 8 * * * cd /path/to/lovilike && node scripts/auto-generate-stock-alerts.js
```

#### Opción B: API Call directa

```bash
# Usando curl cada 4 horas
0 */4 * * * curl -X POST -H "Authorization: Bearer tu-clave-secreta" https://tu-dominio.com/api/stock-alerts/auto-generate
```

#### Opción C: Servicios externos (Recomendado para producción)

- **Vercel Cron Jobs**: Usa `vercel.json` para configurar cron jobs
- **GitHub Actions**: Configura workflows programados
- **Zapier/IFTTT**: Configura webhooks programados
- **cPanel Cron Jobs**: Si usas hosting compartido

## 🎯 Tipos de Alertas

### Prioridades:
- **HIGH**: Stock = 0 o stock ≤ 1
- **MEDIUM**: Stock bajo (2-5 unidades)
- **LOW**: Stock por debajo del mínimo configurado

### Tipos:
- **OUT_OF_STOCK**: Sin stock (0 unidades)
- **LOW_STOCK**: Stock bajo (1-5 unidades)

## 📊 Funcionalidades

### ✅ Auto-resolución
- Las alertas se resuelven automáticamente cuando el stock se repone
- No duplica alertas existentes del mismo tipo para el mismo item

### ✅ Actualización inteligente
- Actualiza alertas existentes si el stock cambia
- Cambia prioridad automáticamente según el nivel de stock

### ✅ Metadata completa
- Incluye información del proveedor para materiales
- Incluye detalles de variantes (talla, color, material)
- Incluye umbrales y valores actuales

## 🔍 Monitoreo

### API de Estado
```
GET /api/stock-alerts/auto-generate
```

Retorna estadísticas del sistema:
```json
{
  "status": "active",
  "lastExecution": "2024-01-01T10:00:00Z",
  "statistics": [...],
  "message": "Sistema funcionando correctamente"
}
```

### Logs del Sistema
El sistema registra todas las operaciones:
- Materiales, variantes y productos revisados
- Alertas creadas, actualizadas y resueltas
- Errores y excepciones

## 🚀 Uso en Producción

### 1. Configurar Webhook (Recomendado)

```javascript
// vercel.json para Vercel
{
  "crons": [
    {
      "path": "/api/stock-alerts/auto-generate",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### 2. Monitoreo de Salud

- Configura alertas si el endpoint falla
- Revisa logs regularmente
- Configura notificaciones por email/Slack

### 3. Optimización

- Ejecuta durante horas de baja actividad
- Ajusta frecuencia según tamaño del inventario
- Considera usar queue systems para inventarios grandes

## ⚠️ Consideraciones

1. **Frecuencia**: No ejecutar más de 1 vez por hora para evitar spam
2. **Rendimiento**: El proceso puede tomar varios segundos con inventarios grandes
3. **Autenticación**: Siempre usar la clave secreta en producción
4. **Backup**: Mantener respaldos de la configuración de cron jobs

## 🔧 Solución de Problemas

### Error 401: No autorizado
- Verifica que `CRON_SECRET` esté configurado correctamente
- Asegúrate de enviar el header `Authorization: Bearer tu-clave`

### Error 500: Error interno
- Revisa los logs del servidor
- Verifica conectividad con la base de datos
- Confirma que todas las tablas existen

### Alertas no se generan
- Verifica que haya productos con stock bajo
- Confirma que los productos estén activos (`isActive: true`)
- Revisa los umbrales configurados

## 📧 Soporte

Para soporte adicional o configuración personalizada, contacta al equipo de desarrollo.