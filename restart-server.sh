#!/bin/bash

echo "🔄 REINICIANDO SERVIDOR PARA APLICAR CAMBIOS DE RATE LIMITING"
echo "=" 
echo ""

# Verificar si hay un proceso de Next.js ejecutándose
PID=$(lsof -ti:3000)

if [ ! -z "$PID" ]; then
    echo "🛑 Deteniendo servidor existente en puerto 3000 (PID: $PID)..."
    kill -9 $PID
    sleep 2
    echo "✅ Servidor detenido"
else
    echo "ℹ️  No hay servidor ejecutándose en puerto 3000"
fi

echo ""
echo "🔧 CONFIGURACIONES APLICADAS:"
echo "   ✅ Rate limiting deshabilitado para auth en desarrollo"
echo "   ✅ Límites más permisivos para todas las rutas"
echo "   ✅ NODE_ENV configurado como development"
echo ""
echo "🚀 Iniciando servidor..."

# Iniciar el servidor
NODE_ENV=development npm run dev

echo ""
echo "🎉 Servidor iniciado!"
echo "📍 Accede a: http://147.93.53.104:3000/auth/signin"
echo "🔑 Credenciales: admin@lovilike.es / Admin123!Lovilike"