# Implementación de Autenticación Móvil - Completada

## ✅ Cambios Implementados

### 1. SocialController - Flujo Móvil/Web

Se actualizó `app/Http/Controllers/Auth/SocialController.php` para detectar y manejar peticiones desde la app móvil.

#### Método `redirectToGoogle()`
- Detecta si viene `?mobile=true&redirect_uri=nutricoach://auth/callback`
- Guarda en sesión: `oauth_redirect_uri` y `is_mobile`
- Logs para debugging

#### Método `handleGoogleCallback()`
- Detecta si la sesión indica flujo móvil
- **Si es móvil:**
  - Genera token Sanctum
  - Prepara datos del usuario en JSON
  - Redirige a deep link: `nutricoach://auth/callback?token=xxx&user=xxx`
- **Si es web:**
  - Login tradicional con sesión
  - Redirige al dashboard

### 2. API Logout Endpoint

Agregado en `routes/api.php`:

```
POST /api/logout
Authorization: Bearer {token}
```

Respuesta:
```json
{
  "message": "Logged out successfully"
}
```

### 3. Migración Users - Password Nullable

El campo `password` ahora es nullable para permitir usuarios de OAuth sin contraseña.

### 4. Migración Sanctum - Personal Access Tokens

Se publicó la migración de Sanctum para crear la tabla `personal_access_tokens` necesaria para los tokens de autenticación móvil.

Archivo: `database/migrations/2025_10_14_175230_create_personal_access_tokens_table.php`

Esta tabla almacena:
- Token único para cada dispositivo
- Información del usuario (tokenable)
- Capacidades del token (abilities)
- Fecha de último uso y expiración

## 🔗 URLs y Flujo

### Desde la App Móvil:

1. **App abre URL:**
   ```
   https://nutricoachb-main-2vd5yx.laravel.cloud/auth/google?mobile=true&redirect_uri=nutricoach://auth/callback
   ```

2. **Backend redirige a Google** (automático)

3. **Google callback al backend** (automático)

4. **Backend redirige a app con deep link:**
   ```
   nutricoach://auth/callback?token={TOKEN}&user={USER_JSON}
   ```

### Desde Web:

1. Usuario accede a `/auth/google` (sin parámetros móvil)
2. Se autentica con Google
3. Backend hace login de sesión tradicional
4. Redirige a `/dashboard`

## 📊 Endpoints API Disponibles

### GET `/api/user`
Obtiene datos del usuario autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "Usuario",
  "email": "usuario@example.com",
  "avatar": "https://...",
  "created_at": "2025-01-01T00:00:00.000000Z"
}
```

### POST `/api/logout`
Cierra sesión y revoca el token actual.

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "message": "Logged out successfully"
}
```

### Todos los endpoints existentes en `/api/*`
La app móvil puede consumir todos los endpoints documentados en `API_DOCUMENTATION.md` usando el token recibido.

## 🧪 Testing

### Probar desde Navegador (simular móvil):

```
https://nutricoachb-main-2vd5yx.laravel.cloud/auth/google?mobile=true&redirect_uri=nutricoach://auth/callback
```

El navegador mostrará error al intentar abrir `nutricoach://` (porque no tiene la app instalada), pero eso confirma que el backend está funcionando correctamente.

### Logs para Verificar:

Revisar en Laravel Cloud:
```bash
tail -f storage/logs/laravel.log
```

Verás:
- `OAuth Google - Inicio desde móvil`
- `OAuth Google - Callback`
- `OAuth Google - Redirigiendo a móvil`

## 🔒 Seguridad

- Token Sanctum es único por dispositivo
- El token se puede revocar con `/api/logout`
- Password aleatorio generado para usuarios OAuth
- Deep link solo se usa cuando viene `mobile=true`

## ✅ Checklist de Implementación

- [x] Detectar parámetro `mobile=true`
- [x] Guardar `redirect_uri` en sesión
- [x] Generar token Sanctum para móvil
- [x] Redirigir con deep link
- [x] Endpoint `/api/logout`
- [x] Password nullable en users
- [x] Logs para debugging
- [x] Manejo de errores para móvil
- [x] Migración de Sanctum `personal_access_tokens`

## 🚀 Listo para Deploy

El código está listo. Solo necesitas:

1. Commit los cambios
2. Push a GitHub
3. Laravel Cloud hará deploy automático
4. La app móvil ya está esperando este comportamiento

## 📝 Notas

- El flujo web NO se ve afectado y sigue funcionando igual
- La app móvil debe tener configurado el deep link `nutricoach://`
- El token tiene duración ilimitada por defecto (configurable en Sanctum)
