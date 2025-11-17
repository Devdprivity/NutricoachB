#!/bin/bash

# Script para empaquetar y preparar ejercicios para subir al servidor

echo "📦 Empaquetando ejercicios..."

# Verificar que existe la carpeta
if [ ! -d "storage/app/public/exercises" ]; then
    echo "❌ No se encontró la carpeta storage/app/public/exercises"
    echo "   Ejecuta primero: php artisan exercises:download-gifs"
    exit 1
fi

# Crear directorio de salida si no existe
mkdir -p deploy

# Empaquetar
cd storage/app/public
tar -czf ../../../deploy/exercises.tar.gz exercises/
cd ../../..

echo "✅ Archivo creado: deploy/exercises.tar.gz"
echo ""
echo "📤 Para subir al servidor:"
echo "   1. Sube deploy/exercises.tar.gz al servidor"
echo "   2. En el servidor, ejecuta:"
echo "      cd /var/www/html/storage/app/public"
echo "      tar -xzf exercises.tar.gz"
echo "      chmod -R 755 exercises/"
echo "      php artisan exercises:check-status"

