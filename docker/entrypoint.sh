#!/bin/sh
set -e

echo "🚀 Starting Laravel application..."

# Verificar variables críticas
echo "📋 Checking environment variables..."
if [ -z "$APP_KEY" ]; then
    echo "❌ ERROR: APP_KEY is not set!"
    echo "   Please set APP_KEY in Dokploy environment variables"
    exit 1
fi

if [ -z "$DB_HOST" ] || [ -z "$DB_DATABASE" ] || [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ]; then
    echo "⚠️  WARNING: Database credentials not fully configured"
    echo "   DB_HOST: ${DB_HOST:-NOT SET}"
    echo "   DB_DATABASE: ${DB_DATABASE:-NOT SET}"
    echo "   DB_USERNAME: ${DB_USERNAME:-NOT SET}"
    echo "   DB_PASSWORD: ${DB_PASSWORD:+SET (hidden)}${DB_PASSWORD:-NOT SET}"
fi

# Verificar permisos de storage
echo "🔐 Checking storage permissions..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true
chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache || true

# Esperar a que la base de datos esté lista (opcional)
if [ "$WAIT_FOR_DB" = "true" ]; then
    echo "⏳ Waiting for database..."
    until php artisan db:show 2>/dev/null | grep -q "Database:"; do
        echo "   Waiting for database connection..."
        sleep 2
    done
    echo "✅ Database is ready"
fi

# Ejecutar migraciones (solo si no se han ejecutado)
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "🗄️ Running migrations..."
    php artisan migrate --force || {
        echo "❌ Migration failed! Check database connection and credentials"
        exit 1
    }
fi

# Limpiar cache antes de cachear (por si hay cambios)
echo "🧹 Clearing old cache..."
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Limpiar y cachear configuración
echo "📦 Optimizing application..."
php artisan config:cache || {
    echo "❌ Config cache failed! Check your .env or environment variables"
    echo "   Common issues:"
    echo "   - APP_KEY not set"
    echo "   - Invalid database credentials"
    echo "   - Missing required environment variables"
    exit 1
}

php artisan route:cache || {
    echo "⚠️  Route cache failed (non-critical)"
}

php artisan view:cache || {
    echo "⚠️  View cache failed (non-critical)"
}

# Crear symlink de storage si no existe
if [ ! -L public/storage ]; then
    echo "🔗 Creating storage symlink..."
    php artisan storage:link || {
        echo "⚠️  Storage symlink failed (may already exist)"
    }
fi

# Verificar que los directorios críticos existen
echo "📁 Verifying critical directories..."
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/bootstrap/cache

# Mostrar información de debug (solo si APP_DEBUG=true)
if [ "$APP_DEBUG" = "true" ]; then
    echo "🐛 Debug mode enabled"
    echo "   APP_ENV: ${APP_ENV:-not set}"
    echo "   APP_URL: ${APP_URL:-not set}"
    echo "   DB_CONNECTION: ${DB_CONNECTION:-not set}"
fi

# Iniciar supervisor para queue workers (opcional)
if [ "$START_QUEUE_WORKER" = "true" ]; then
    echo "👷 Starting queue worker..."
    supervisorctl start laravel-worker:* || echo "⚠️  Queue worker not configured"
fi

echo "✅ Application ready!"

# Ejecutar el comando principal
exec "$@"

