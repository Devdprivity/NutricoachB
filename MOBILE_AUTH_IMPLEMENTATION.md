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
- **Recupera datos de Google:**
  - Nombre del usuario
  - Email
  - Google ID
  - **Avatar (foto de perfil)**
- **Si el usuario existe:**
  - Actualiza `google_id` y `avatar` en cada login
  - Asegura que el avatar siempre esté actualizado
- **Si es usuario nuevo:**
  - Crea el usuario con todos los datos incluyendo avatar
  - Genera password aleatorio seguro
- **Si es móvil:**
  - Genera token Sanctum
  - Prepara datos del usuario en JSON (incluye avatar)
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

### 3. Migración Users - Campos OAuth

Archivo: `database/migrations/0001_01_01_000000_create_users_table.php`

Campos agregados:
- `password` - Nullable para permitir usuarios de OAuth sin contraseña
- `google_id` - ID único de Google (nullable, unique)
- `avatar` - URL de la foto de perfil de Google (nullable)

Estos campos permiten:
- Guardar la imagen de perfil del usuario desde Google
- Actualizar automáticamente el avatar en cada login
- Identificar usuarios por su Google ID

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
  "avatar": "https://lh3.googleusercontent.com/a/...",
  "google_id": "123456789",
  "email_verified_at": "2025-01-01T00:00:00.000000Z",
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z"
}
```

**Nota:** El campo `avatar` contiene la URL completa de la imagen de perfil de Google y se actualiza automáticamente en cada login.

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
- `OAuth Google - Inicio desde móvil` (con redirect_uri)
- `OAuth Google - Usuario actualizado` o `OAuth Google - Nuevo usuario creado` (con avatar, google_id)
- `OAuth Google - Callback` (con session data)
- `OAuth Google - Redirigiendo a móvil` (con user_id, avatar, name)

## 🔒 Seguridad

- Token Sanctum es único por dispositivo
- El token se puede revocar con `/api/logout`
- Password aleatorio generado para usuarios OAuth
- Deep link solo se usa cuando viene `mobile=true`
- Avatar se actualiza automáticamente en cada login (no se guarda localmente desactualizado)

## ✅ Checklist de Implementación

- [x] Detectar parámetro `mobile=true`
- [x] Guardar `redirect_uri` en sesión
- [x] Generar token Sanctum para móvil
- [x] Redirigir con deep link
- [x] Endpoint `/api/logout`
- [x] Password nullable en users
- [x] Campos `google_id` y `avatar` en users
- [x] Actualización automática del avatar en cada login
- [x] Logs para debugging (incluye avatar)
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
