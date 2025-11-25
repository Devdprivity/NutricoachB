# 🚀 Configuración de Dokploy para gidia.app

## ⚠️ Importante: Variables de Entorno Sensibles

**NUNCA** uses `ARG` o `ENV` en el Dockerfile para secretos. Todas las variables sensibles deben configurarse en **Dokploy** como variables de entorno del contenedor en tiempo de ejecución.

## 📋 Variables de Entorno Requeridas en Dokploy

Configura estas variables en la sección **Environment Variables** de tu aplicación en Dokploy:

### 🔐 Variables Sensibles (OBLIGATORIAS)

```env
# Laravel
APP_KEY=base64:tu_app_key_aqui
APP_ENV=production
APP_DEBUG=false
APP_URL=https://www.gidia.app

# Base de Datos PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=tu_host_postgresql
DB_PORT=5432
DB_DATABASE=tu_base_de_datos
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña

# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_REDIRECT_URI=https://www.gidia.app/auth/google/callback

# Stripe
STRIPE_KEY=pk_live_tu_stripe_public_key
STRIPE_SECRET=sk_live_tu_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# AI APIs
GEMINI_API_KEY=tu_gemini_api_key
OPENAI_API_KEY=sk-tu_openai_api_key

# Spotify (opcional)
SPOTIFY_CLIENT_ID=tu_spotify_client_id
SPOTIFY_CLIENT_SECRET=tu_spotify_client_secret

# Email (Hostinger SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_USERNAME=info@gidia.app
MAIL_PASSWORD=tu_contraseña_email
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=info@gidia.app
MAIL_FROM_NAME="${APP_NAME}"
```

### ⚙️ Variables Opcionales

```env
# Cache y Queue
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database

# Ejecutar migraciones automáticamente (RECOMENDADO para primera vez)
RUN_MIGRATIONS=true

# Driver de sesiones (file = archivos, database = base de datos)
# Usa 'file' si la tabla sessions no existe aún
SESSION_DRIVER=file

# Iniciar queue worker (opcional, o usar supervisor separado)
START_QUEUE_WORKER=false
```

## 🔧 Pasos de Configuración en Dokploy

### 1. Crear la Aplicación

1. Ve a **Applications** → **New Application**
2. Selecciona **Dockerfile** como método de build
3. Conecta tu repositorio de GitHub/GitLab

### 2. Configurar Variables de Entorno

1. Ve a la sección **Environment Variables**
2. Agrega **TODAS** las variables sensibles listadas arriba
3. **NO** las agregues en el Dockerfile

### 3. Generar APP_KEY

Si no tienes un `APP_KEY`, ejecuta esto localmente o en Dokploy:

```bash
php artisan key:generate --show
```

Copia el valor y agrégalo como variable de entorno `APP_KEY` en Dokploy.

### 4. Configurar Build Settings

En Dokploy, configura:

- **Docker Build Stage**: `runner` (Dokploy busca este stage por defecto, o usar `production`)
- **Build Command**: (dejar vacío, el Dockerfile lo maneja)
- **Start Command**: (dejar vacío, el Dockerfile usa el CMD por defecto)
- **Port**: `80`

### 5. Configurar Base de Datos

1. Crea una base de datos PostgreSQL en Dokploy o usa una externa
2. Configura las variables `DB_*` con los valores correctos
3. Asegúrate de que `DB_HOST` no sea `localhost` (usa la IP o hostname real)

### 6. Ejecutar Migraciones

Puedes ejecutar migraciones de dos formas:

**Opción A: Automáticamente** (recomendado para primera vez)
- Agrega `RUN_MIGRATIONS=true` a las variables de entorno
- Las migraciones se ejecutarán al iniciar el contenedor

**Opción B: Manualmente**
- Conecta por SSH al contenedor
- Ejecuta: `php artisan migrate --force`

### 7. Crear Storage Symlink

El script de entrada (`entrypoint.sh`) crea automáticamente el symlink de storage.

Si necesitas hacerlo manualmente:
```bash
php artisan storage:link
```

## 🐛 Solución de Problemas

### Error 500: APP_KEY no configurado

**Solución**: Agrega `APP_KEY` en las variables de entorno de Dokploy y reinicia el contenedor.

### Error 500: Base de datos no conecta

**Solución**: 
- Verifica que `DB_HOST` no sea `localhost` (usa la IP real)
- Verifica que las credenciales sean correctas
- Verifica que el firewall permita conexiones desde Dokploy

### Error: Variables de entorno no disponibles

**Solución**: 
- Asegúrate de que las variables estén en **Environment Variables** de Dokploy, no en el Dockerfile
- Reinicia el contenedor después de agregar variables

### Advertencias de seguridad sobre ARG/ENV

**Solución**: 
- El Dockerfile actual **NO** usa ARG o ENV para secretos
- Todas las variables sensibles se pasan en tiempo de ejecución
- Si Dokploy aún muestra advertencias, verifica que no haya un Dockerfile antiguo en cache

## ✅ Checklist de Deployment

- [ ] Todas las variables sensibles configuradas en Dokploy (no en Dockerfile)
- [ ] `APP_KEY` generado y configurado
- [ ] Base de datos PostgreSQL creada y accesible
- [ ] Variables `DB_*` configuradas correctamente
- [ ] `APP_URL` configurado con el dominio correcto
- [ ] Migraciones ejecutadas
- [ ] Storage symlink creado
- [ ] Queue worker configurado (si es necesario)
- [ ] SSL/HTTPS configurado en Dokploy

## 📚 Recursos Adicionales

- [Documentación de Dokploy](https://dokploy.com/docs)
- [Laravel Deployment](https://laravel.com/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

