# 🚀 Guía de Deployment en Hostinger

## 📋 **Pre-requisitos**

### 1. **Cuenta Hostinger con:**
- Plan Business o superior (que soporte Node.js)
- Dominio configurado
- Acceso al panel de control

### 2. **Servicios Externos Configurados:**
- **Cloudinary** para imágenes
- **Base de datos PostgreSQL** (disponible en Hostinger)
- **Email SMTP** (usar el de Hostinger)

---

## 🛠️ **Pasos de Deployment**

### **Paso 1: Preparar la Base de Datos**

1. **Crear BD PostgreSQL en Hostinger:**
   - Ve a Panel de Control → Bases de Datos → PostgreSQL
   - Crea nueva base de datos: `lovilike_db`
   - Anota: usuario, contraseña, host, puerto

2. **Configurar Prisma para PostgreSQL:**
   ```bash
   # En tu máquina local, cambiar DATABASE_URL
   DATABASE_URL="postgresql://usuario:password@host:puerto/lovilike_db"
   ```

### **Paso 2: Configurar Variables de Entorno**

En el panel de Hostinger → Node.js → Variables de Entorno:

```
DATABASE_URL=postgresql://usuario:password@host:puerto/lovilike_db
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=secreto-super-seguro-64-caracteres-minimo
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
EMAIL_FROM=noreply@tu-dominio.com
EMAIL_SERVER_HOST=smtp.hostinger.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=tu-email@tu-dominio.com
EMAIL_SERVER_PASSWORD=tu-password
NEXT_PUBLIC_APP_NAME=Lovilike Personalizados
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### **Paso 3: Subir Código**

**Opción A - Git (Recomendado):**
1. Sube el código a GitHub/GitLab
2. En Hostinger: conecta repositorio
3. Configura auto-deploy

**Opción B - Archivo ZIP:**
1. Excluir carpetas: `.next`, `node_modules`, `prisma/dev.db`
2. Subir ZIP al File Manager
3. Extraer en carpeta public_html

### **Paso 4: Configurar Node.js en Hostinger**

1. Panel de Control → Node.js
2. **Node.js Version:** 18.x o superior
3. **Startup File:** `server.js`
4. **Application Root:** `/public_html` (o carpeta donde esté el proyecto)

### **Paso 5: Scripts de Build**

Crear `server.js` en raíz del proyecto:

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(\`> Ready on http://\${hostname}:\${port}\`)
  })
})
```

### **Paso 6: Build y Deploy**

En terminal de Hostinger o local:

```bash
# Instalar dependencias
npm install

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma db push

# Hacer seed (opcional)
npm run db:seed

# Build para producción
npm run build

# Iniciar aplicación
npm start
```

---

## 🔧 **Configuraciones Específicas**

### **Base de Datos PostgreSQL**
- Hostinger proporciona PostgreSQL gratis
- Usar conexión SSL en producción
- Hacer backup regular

### **Email SMTP**
- Usar servidor SMTP de Hostinger
- Configurar SPF y DKIM records
- Host: `smtp.hostinger.com`

### **SSL Certificate**
- Hostinger proporciona SSL gratis
- Verificar que HTTPS funcione
- Actualizar URLs en variables de entorno

---

## 🚨 **Checklist Final**

- [ ] Variables de entorno configuradas
- [ ] Base de datos PostgreSQL creada
- [ ] Prisma migraciones ejecutadas
- [ ] Build sin errores
- [ ] SSL certificate activo
- [ ] Dominio apuntando correctamente
- [ ] Email funcionando
- [ ] Cloudinary configurado
- [ ] NextAuth funcionando

---

## 🐛 **Troubleshooting**

### Error: "Database connection failed"
- Verificar DATABASE_URL
- Comprobar credenciales PostgreSQL
- Verificar que BD existe

### Error: "Module not found"
- Ejecutar `npm install` en producción
- Verificar que todas las dependencias estén en `dependencies`

### Error: "NextAuth configuration"
- Verificar NEXTAUTH_URL y NEXTAUTH_SECRET
- Asegurarse que el dominio sea correcto

### Error: "Images not loading"
- Verificar configuración Cloudinary
- Comprobar variables de entorno
- Revisar next.config.ts

---

## 📞 **Soporte**

Si tienes problemas:
1. Revisar logs en Panel Hostinger
2. Verificar variables de entorno
3. Comprobar configuración DNS
4. Contactar soporte Hostinger si es necesario