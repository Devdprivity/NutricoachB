# Instrucciones para el Backend Laravel - Autenticación Móvil

## Problema actual

Cuando el usuario hace login desde la app móvil de React Native, después de autenticarse con Google, el backend lo redirige al dashboard web en lugar de volver a la app móvil.

## Solución requerida

El backend debe detectar si la petición de autenticación viene de la app móvil y, en ese caso, redirigir de vuelta a la app con un deep link en lugar de redirigir al dashboard web.

## Cambios necesarios en el código Laravel

### 1. Modificar el endpoint `/auth/google`

El endpoint debe guardar en la sesión que la petición viene de móvil:

```php
// routes/web.php o en el controlador correspondiente
Route::get('/auth/google', function (Request $request) {
    // Guardar el redirect_uri en la sesión si viene de móvil
    if ($request->has('redirect_uri')) {
        session(['oauth_redirect_uri' => $request->input('redirect_uri')]);
        session(['is_mobile' => $request->has('mobile')]);
    }

    return Socialite::driver('google')
        ->redirect();
});
```

**URL que recibirá desde la app móvil:**
```
https://nutricoachb-main-2vd5yx.laravel.cloud/auth/google?mobile=true&redirect_uri=nutricoach://auth/callback
```

### 2. Modificar el endpoint `/auth/google/callback`

El callback debe verificar si la sesión indica que es una petición móvil y actuar en consecuencia:

```php
Route::get('/auth/google/callback', function (Request $request) {
    try {
        $googleUser = Socialite::driver('google')->user();

        // Crear o actualizar usuario
        $user = User::updateOrCreate(
            ['email' => $googleUser->email],
            [
                'name' => $googleUser->name,
                'google_id' => $googleUser->id,
                'avatar' => $googleUser->avatar,
            ]
        );

        // ===== IMPORTANTE: Detectar si es móvil =====
        $isMobile = session('is_mobile', false);
        $redirectUri = session('oauth_redirect_uri');

        if ($isMobile && $redirectUri) {
            // FLUJO MÓVIL

            // Generar token para la app móvil
            $token = $user->createToken('mobile-app')->plainTextToken;

            // Preparar datos del usuario
            $userData = urlencode(json_encode([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
            ]));

            // Limpiar sesión
            session()->forget(['oauth_redirect_uri', 'is_mobile']);

            // Redirigir a la app móvil con el token
            return redirect("{$redirectUri}?token={$token}&user={$userData}");
        }

        // FLUJO WEB (comportamiento actual)
        Auth::login($user);
        return redirect('/dashboard');

    } catch (Exception $e) {
        Log::error('Google OAuth Error: ' . $e->getMessage());

        // Si hay error y es móvil, redirigir a la app con error
        if (session('is_mobile') && session('oauth_redirect_uri')) {
            $redirectUri = session('oauth_redirect_uri');
            session()->forget(['oauth_redirect_uri', 'is_mobile']);
            return redirect("{$redirectUri}?error=auth_failed");
        }

        return redirect('/login')->with('error', 'Error al autenticar con Google');
    }
});
```

## URLs y esquema de redirección

### URLs que la app móvil usa:

1. **Inicia OAuth**:
   ```
   https://nutricoachb-main-2vd5yx.laravel.cloud/auth/google?mobile=true&redirect_uri=nutricoach://auth/callback
   ```

2. **Backend redirige a Google**: (esto ya funciona)
   ```
   https://accounts.google.com/o/oauth2/v2/auth?...
   ```

3. **Google callback al backend**: (esto ya funciona)
   ```
   https://nutricoachb-main-2vd5yx.laravel.cloud/auth/google/callback?code=...
   ```

4. **Backend debe redirigir a la app**: (ESTO ES LO QUE FALTA)
   ```
   nutricoach://auth/callback?token={TOKEN}&user={USER_JSON}
   ```

## Ejemplo de URL de redirección completa

```
nutricoach://auth/callback?token=1|AbCdEf123456789&user=%7B%22id%22%3A1%2C%22name%22%3A%22John%20Doe%22%2C%22email%22%3A%22john%40example.com%22%2C%22avatar%22%3A%22https%3A%2F%2Fexample.com%2Favatar.jpg%22%7D
```

Nota: El parámetro `user` es el JSON del usuario URL-encoded.

## Endpoints adicionales necesarios para la app

La app móvil también necesita estos endpoints (probablemente ya los tienes):

### 1. GET `/api/user` (protegido con Sanctum)
Retorna los datos del usuario autenticado:

```php
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

### 2. POST `/api/logout` (protegido con Sanctum)
Cierra sesión y revoca el token:

```php
Route::middleware('auth:sanctum')->post('/logout', function (Request $request) {
    $request->user()->currentAccessToken()->delete();
    return response()->json(['message' => 'Logged out successfully']);
});
```

## Configuración de CORS (si no está ya configurada)

Para que la app móvil pueda hacer peticiones al API:

```php
// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'auth/*'],
    'allowed_origins' => ['*'],
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
];
```

## Testing desde el backend

Para probar que funciona, puedes simular la petición móvil desde el navegador:

1. Abre en el navegador:
   ```
   https://nutricoachb-main-2vd5yx.laravel.cloud/auth/google?mobile=true&redirect_uri=nutricoach://auth/callback
   ```

2. Completa el login de Google

3. Deberías ver que el navegador intenta redirigir a `nutricoach://auth/callback?token=...`
   (El navegador mostrará un error porque no tiene la app instalada, pero eso confirma que funciona)

## Logs útiles para debugging

Agrega estos logs temporalmente para verificar que todo funciona:

```php
Log::info('OAuth Google - Inicio', [
    'is_mobile' => $request->has('mobile'),
    'redirect_uri' => $request->input('redirect_uri'),
]);

Log::info('OAuth Google - Callback', [
    'session_is_mobile' => session('is_mobile'),
    'session_redirect_uri' => session('oauth_redirect_uri'),
]);
```

## Resumen

El cambio principal es:
1. Guardar en sesión cuando viene `mobile=true` y el `redirect_uri`
2. En el callback, verificar la sesión
3. Si es móvil: generar token y redirigir a `nutricoach://auth/callback?token=...`
4. Si es web: mantener el comportamiento actual (login y redirigir a dashboard)

¿Alguna duda? La app móvil ya está lista y solo espera que el backend haga la redirección correcta.
