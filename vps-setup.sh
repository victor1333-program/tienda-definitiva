#!/bin/bash

# 🚀 Script de configuración para VPS Hostinger
# Ejecutar como root: bash vps-setup.sh

echo "🚀 Configurando VPS para Next.js + PostgreSQL..."

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Instalar herramientas esenciales
apt-get install -y git curl wget vim nginx ufw

# Instalar PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Instalar PM2 para gestión de procesos
npm install -g pm2

# Configurar firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 3000
ufw --force enable

# Crear usuario para la aplicación
useradd -m -s /bin/bash appuser
usermod -aG sudo appuser

echo "✅ VPS configurado correctamente!"
echo "📝 Próximos pasos:"
echo "1. Configurar PostgreSQL"
echo "2. Configurar Nginx"
echo "3. Subir aplicación"
echo "4. Configurar SSL"