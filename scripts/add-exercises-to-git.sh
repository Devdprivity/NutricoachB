#!/bin/bash

# Script para agregar ejercicios al repositorio Git

echo "📦 Agregando ejercicios al repositorio Git..."

# Verificar que existe la carpeta
if [ ! -d "storage/app/public/exercises" ]; then
    echo "❌ No se encontró la carpeta storage/app/public/exercises"
    echo "   Ejecuta primero: php artisan exercises:download-gifs"
    exit 1
fi

# Verificar que existe metadata.json
if [ ! -f "storage/app/public/exercises/metadata.json" ]; then
    echo "❌ No se encontró metadata.json"
    echo "   Ejecuta primero: php artisan exercises:download-gifs"
    exit 1
fi

# Contar archivos
GIF_COUNT=$(find storage/app/public/exercises -name "*.gif" | wc -l)
echo "📊 Encontrados:"
echo "   - $GIF_COUNT archivos GIF"
echo "   - 1 archivo metadata.json"
echo ""

# Agregar al repositorio
echo "➕ Agregando archivos a Git..."
git add storage/app/public/exercises/

# Mostrar estado
echo ""
echo "✅ Archivos agregados. Estado:"
git status --short storage/app/public/exercises/ | head -10

echo ""
echo "📝 Para completar, ejecuta:"
echo "   git commit -m 'Add exercise GIFs and metadata'"
echo "   git push"

