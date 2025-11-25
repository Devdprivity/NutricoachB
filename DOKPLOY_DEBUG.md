# 🐛 Guía de Debug en Dokploy

## 📋 Cómo Ver los Logs en Dokploy

### 1. **Logs de la Aplicación**

En Dokploy, ve a tu aplicación y haz clic en **"Logs"** o **"View Logs"**. Ahí verás:

- Logs de PHP-FPM
- Logs de Nginx
- Logs de Laravel (si están configurados)
- Salida del script `entrypoint.sh`

### 2. **Logs de Laravel**

Los logs de Laravel se guardan en:
```
/var/www/html/storage/logs/laravel.log
```

Para verlos en Dokploy:

1. Ve a tu aplicación en Dokploy
2. Haz clic en **"Terminal"** o **"SSH"**
3. Ejecuta:
```bash
tail -f storage/logs/laravel.log
```

O para ver los últimos 100 líneas:
```bash
tail -n 100 storage/logs/laravel.log
```

### 3. **Logs de PHP-FPM**

Los logs de PHP-FPM están en:
```
/var/log/php-fpm.log
```

Para verlos:
```bash
tail -f /var/log/php-fpm.log
```

### 4. **Logs de Nginx**

Los logs de Nginx están en:
```
/var/log/nginx/error.log
/var/log/nginx/access.log
```

Para verlos:
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

## 🔍 Diagnóstico de Error 500

### Paso 1: Verificar Variables de Entorno

En Dokploy, verifica que todas estas variables estén configuradas:

```bash
# Conecta por SSH y ejecuta:
env | grep -E "APP_|DB_|GOOGLE_|STRIPE_|CLOUDINARY_"
```

### Paso 2: Verificar APP_KEY

El error más común es `APP_KEY` no configurado:

```bash
php artisan tinker
>>> config('app.key')
```

Si retorna `null` o está vacío, necesitas configurar `APP_KEY` en Dokploy.

### Paso 3: Verificar Conexión a Base de Datos

```bash
php artisan db:show
```

O probar conexión manual:
```bash
php artisan tinker
>>> DB::connection()->getPdo();
```

### Paso 4: Verificar Permisos

```bash
ls -la storage/
ls -la bootstrap/cache/
```

Deben tener permisos `755` y pertenecer a `www-data`.

### Paso 5: Verificar Logs de Laravel

```bash
tail -n 50 storage/logs/laravel.log
```

Busca errores específicos como:
- `SQLSTATE[HY000]` - Error de base de datos
- `No application encryption key` - APP_KEY faltante
- `Class not found` - Problema de autoload
- `Permission denied` - Problema de permisos

## 🛠️ Comandos Útiles de Debug

### Limpiar Cache y Reconstruir

```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Verificar Configuración

```bash
php artisan config:show
php artisan route:list
php artisan about
```

### Verificar Variables de Entorno

```bash
php artisan tinker
>>> env('APP_KEY')
>>> env('DB_HOST')
>>> env('DB_DATABASE')
```

### Verificar Storage Symlink

```bash
ls -la public/storage
```

Debe ser un symlink a `../storage/app/public`.

### Verificar Base de Datos

```bash
php artisan migrate:status
php artisan db:show
```

## 🚨 Errores Comunes y Soluciones

### Error: "relation 'sessions' does not exist"

**Causa**: La tabla `sessions` no existe en PostgreSQL porque las migraciones no se han ejecutado.

**Solución 1 - Rápida (Sesiones por archivo)**:
En Dokploy, agrega esta variable de entorno:
```
SESSION_DRIVER=file
```
Luego reinicia el contenedor.

**Solución 2 - Permanente (Crear tabla sessions)**:
1. En Dokploy, asegúrate de tener `RUN_MIGRATIONS=true`
2. O ejecuta manualmente por SSH:
```bash
php artisan migrate --force
```

La tabla `sessions` se creará automáticamente con la migración `0001_01_01_000000_create_users_table.php`.

### Error: "No application encryption key has been specified"

**Solución**: Configura `APP_KEY` en Dokploy:
```bash
php artisan key:generate --show
```
Copia el valor y agrégalo como variable de entorno `APP_KEY` en Dokploy.

### Error: "SQLSTATE[HY000] [2002] Connection refused"

**Solución**: 
- Verifica que `DB_HOST` no sea `localhost` (usa la IP o hostname real)
- Verifica credenciales de base de datos
- Verifica que el firewall permita conexiones

### Error: "The stream or file could not be opened"

**Solución**: 
```bash
chown -R www-data:www-data storage bootstrap/cache
chmod -R 755 storage bootstrap/cache
```

### Error: "Route [login] not defined"

**Solución**: 
```bash
php artisan route:clear
php artisan route:cache
```

### Error: "Class 'X' not found"

**Solución**: 
```bash
composer dump-autoload
php artisan config:clear
php artisan config:cache
```

## 📊 Verificar Estado de la Aplicación

### Comando Completo de Diagnóstico

```bash
echo "=== APP_KEY ==="
php artisan tinker --execute="echo config('app.key') ? 'SET' : 'NOT SET';"

echo "=== Database ==="
php artisan db:show

echo "=== Storage Permissions ==="
ls -la storage/ | head -5
ls -la bootstrap/cache/ | head -5

echo "=== Storage Symlink ==="
ls -la public/storage

echo "=== Recent Logs ==="
tail -n 20 storage/logs/laravel.log

echo "=== PHP-FPM Status ==="
ps aux | grep php-fpm

echo "=== Nginx Status ==="
ps aux | grep nginx
```

## 🔐 Habilitar Debug Temporalmente

Para ver errores detallados, configura en Dokploy:

```
APP_DEBUG=true
APP_ENV=local
```

**⚠️ IMPORTANTE**: Desactiva `APP_DEBUG` en producción después de debuggear.

## 📞 Obtener Ayuda

Si el problema persiste, comparte:

1. Últimas 50 líneas de `storage/logs/laravel.log`
2. Salida de `php artisan about`
3. Variables de entorno (sin valores sensibles)
4. Salida de `php artisan db:show`
5. Permisos de `storage/` y `bootstrap/cache/`

