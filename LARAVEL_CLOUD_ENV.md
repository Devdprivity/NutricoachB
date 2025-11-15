# Configuración de Variables de Entorno para Laravel Cloud

## Variables CRÍTICAS para que las cookies funcionen en Laravel Cloud

Debes agregar estas variables de entorno en el panel de Laravel Cloud:

```env
# Session Configuration
SESSION_DOMAIN=.laravel.cloud
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=*.laravel.cloud

# Spotify Configuration
SPOTIFY_CLIENT_ID=tu_client_id_aqui
SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui
SPOTIFY_REDIRECT_URI=https://nutricoachb-main-2vd5yx.laravel.cloud/spotify/callback
```

## Cómo agregar variables de entorno en Laravel Cloud:

1. Ve a [cloud.laravel.com](https://cloud.laravel.com)
2. Entra a tu proyecto `nutricoachb-main-2vd5yx`
3. Ve a la sección **"Environment"** o **"Settings"**
4. Busca **"Environment Variables"**
5. Agrega cada variable con su valor
6. Guarda los cambios
7. **Redeploy** la aplicación

## Por qué es importante:

- `SESSION_DOMAIN=.laravel.cloud` permite que las cookies funcionen en subdominios de Laravel Cloud
- `SESSION_SECURE_COOKIE=true` es obligatorio para HTTPS (Laravel Cloud usa HTTPS)
- `SESSION_SAME_SITE=lax` permite que las cookies funcionen con OAuth (Spotify)
- `SANCTUM_STATEFUL_DOMAINS` permite que Sanctum funcione correctamente

Sin estas configuraciones, las cookies serán rechazadas por el navegador y la autenticación fallará.
