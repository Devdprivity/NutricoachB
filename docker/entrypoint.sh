#!/bin/sh
set -e

echo "🚀 Starting Laravel application..."

# Esperar a que la base de datos esté lista (opcional, descomentar si es necesario)
# until php artisan db:monitor > /dev/null 2>&1; do
#   echo "⏳ Waiting for database..."
#   sleep 2
# done

# Ejecutar migraciones (solo si no se han ejecutado)
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "🗄️ Running migrations..."
    php artisan migrate --force
fi

# Limpiar y cachear configuración
echo "🧹 Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Crear symlink de storage si no existe
if [ ! -L public/storage ]; then
    echo "🔗 Creating storage symlink..."
    php artisan storage:link
fi

# Iniciar supervisor para queue workers (opcional)
if [ "$START_QUEUE_WORKER" = "true" ]; then
    echo "👷 Starting queue worker..."
    supervisorctl start laravel-worker:*
fi

echo "✅ Application ready!"

# Ejecutar el comando principal
exec "$@"

