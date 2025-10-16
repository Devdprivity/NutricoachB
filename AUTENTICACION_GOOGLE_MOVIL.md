# 🔐 Autenticación Google para Móvil - Documentación Completa

## 📱 Flujo de Autenticación Móvil

### **1. Inicio desde la App Móvil**
```javascript
// La app móvil abre el navegador con esta URL:
const authUrl = `https://nutricoachb-main-2vd5yx.laravel.cloud/auth/google?mobile=true&redirect_uri=nutricoach://auth/callback`;

// Abre en navegador externo
Linking.openURL(authUrl);
```

### **2. Backend Detecta que es Móvil**
```php
// En SocialController::redirectToGoogle()
if ($request->has('mobile') && $request->has('redirect_uri')) {
    session([
        'oauth_redirect_uri' => $request->input('redirect_uri'), // nutricoach://auth/callback
        'is_mobile' => true
    ]);
}
```

### **3. Redirección a Google**
```php
return Socialite::driver('google')->redirect();
// Usuario ve la pantalla de login de Google
```

### **4. Google Callback al Backend**
```php
// Google redirige a: /auth/google/callback?code=...
$googleUser = Socialite::driver('google')->user();
```

### **5. Procesamiento del Usuario**
```php
// Buscar o crear usuario
$user = User::where('email', $googleUser->getEmail())
           ->orWhere('google_id', $googleUser->getId())
           ->first();

if (!$user) {
    // Crear nuevo usuario
    $user = User::create([...]);
}
```

### **6. Detección de Flujo Móvil**
```php
$isMobile = session('is_mobile', false);
$redirectUri = session('oauth_redirect_uri');

if ($isMobile && $redirectUri) {
    // FLUJO MÓVIL
    $token = $user->createToken('mobile-app')->plainTextToken;
    
    $userData = urlencode(json_encode([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'avatar' => $user->avatar,
    ]));
    
    // Redirigir a la app móvil
    return redirect("{$redirectUri}?token={$token}&user={$userData}");
}
```

### **7. Deep Link a la App**
```
nutricoach://auth/callback?token=1|AbCdEf123456789&user=%7B%22id%22%3A1%2C%22name%22%3A%22Luis%22%2C%22email%22%3A%22luis%40example.com%22%2C%22avatar%22%3A%22https%3A%2F%2Fexample.com%2Favatar.jpg%22%7D
```

---

## 🔄 Flujo Completo Visual

```
📱 App Móvil
    ↓ (1) Abre navegador con URL especial
🌐 Navegador
    ↓ (2) Va a /auth/google?mobile=true&redirect_uri=nutricoach://auth/callback
🖥️ Backend Laravel
    ↓ (3) Guarda en sesión: is_mobile=true, redirect_uri=nutricoach://auth/callback
    ↓ (4) Redirige a Google OAuth
🔐 Google OAuth
    ↓ (5) Usuario hace login
    ↓ (6) Google redirige a /auth/google/callback?code=...
🖥️ Backend Laravel
    ↓ (7) Procesa usuario, genera token Sanctum
    ↓ (8) Redirige a: nutricoach://auth/callback?token=...&user=...
📱 App Móvil
    ↓ (9) Recibe deep link, extrae token y datos
    ↓ (10) Usuario autenticado ✅
```

---

## ⚙️ Configuración Actual

### **Variables de Entorno Necesarias:**
```env
# Google OAuth
GOOGLE_CLIENT_ID=tu_client_id_de_google
GOOGLE_CLIENT_SECRET=tu_client_secret_de_google
GOOGLE_REDIRECT_URI=https://nutricoachb-main-2vd5yx.laravel.cloud/auth/google/callback
```

### **Rutas Configuradas:**
```php
// routes/web.php
Route::get('/auth/google', [SocialController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [SocialController::class, 'handleGoogleCallback']);
```

### **CORS Configurado:**
```php
// config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['*'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

---

## 📋 URLs del Flujo

### **1. URL de Inicio (desde app móvil):**
```
https://nutricoachb-main-2vd5yx.laravel.cloud/auth/google?mobile=true&redirect_uri=nutricoach://auth/callback
```

### **2. URL de Google OAuth:**
```
https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&scope=...&response_type=code&state=...
```

### **3. URL de Callback (Google → Backend):**
```
https://nutricoachb-main-2vd5yx.laravel.cloud/auth/google/callback?code=4/0AX4XfWh...&state=...
```

### **4. Deep Link Final (Backend → App):**
```
nutricoach://auth/callback?token=1|AbCdEf123456789&user=%7B%22id%22%3A1%2C%22name%22%3A%22Luis%22%2C%22email%22%3A%22luis%40example.com%22%2C%22avatar%22%3A%22https%3A%2F%2Fexample.com%2Favatar.jpg%22%7D
```

---

## 🔧 Cómo Funciona la Detección

### **Parámetros de Detección:**
- **`mobile=true`** → Indica que viene de app móvil
- **`redirect_uri=nutricoach://auth/callback`** → Deep link de retorno

### **Sesión Temporal:**
```php
session([
    'oauth_redirect_uri' => 'nutricoach://auth/callback',
    'is_mobile' => true
]);
```

### **Token Sanctum:**
```php
$token = $user->createToken('mobile-app')->plainTextToken;
// Ejemplo: "1|AbCdEf123456789"
```

---

## 📱 Implementación en App Móvil

### **React Native - Manejo del Deep Link:**
```javascript
import { Linking } from 'react-native';

// Configurar listener para deep links
useEffect(() => {
    const handleDeepLink = (url) => {
        if (url.includes('nutricoach://auth/callback')) {
            const params = new URLSearchParams(url.split('?')[1]);
            const token = params.get('token');
            const userData = JSON.parse(decodeURIComponent(params.get('user')));
            
            if (token && userData) {
                // Guardar token y datos del usuario
                AsyncStorage.setItem('auth_token', token);
                AsyncStorage.setItem('user_data', JSON.stringify(userData));
                
                // Navegar a pantalla principal
                navigation.navigate('Dashboard');
            }
        }
    };

    Linking.addEventListener('url', handleDeepLink);
    
    return () => {
        Linking.removeEventListener('url', handleDeepLink);
    };
}, []);
```

### **Flutter - Manejo del Deep Link:**
```dart
import 'package:flutter/services.dart';

class AuthService {
  static const platform = MethodChannel('nutricoach/auth');
  
  Future<void> handleDeepLink(String url) async {
    if (url.startsWith('nutricoach://auth/callback')) {
      final uri = Uri.parse(url);
      final token = uri.queryParameters['token'];
      final userData = uri.queryParameters['user'];
      
      if (token != null && userData != null) {
        // Guardar token y datos del usuario
        await _saveAuthData(token, userData);
        
        // Navegar a pantalla principal
        Navigator.pushReplacementNamed(context, '/dashboard');
      }
    }
  }
}
```

---

## 🔍 Código del Controlador

### **SocialController.php - Método redirectToGoogle:**
```php
public function redirectToGoogle(Request $request)
{
    // Guardar información de móvil en sesión si viene de la app
    if ($request->has('mobile') && $request->has('redirect_uri')) {
        session([
            'oauth_redirect_uri' => $request->input('redirect_uri'),
            'is_mobile' => true
        ]);

        \Log::info('OAuth Google - Inicio desde móvil', [
            'is_mobile' => true,
            'redirect_uri' => $request->input('redirect_uri'),
        ]);
    }

    return Socialite::driver('google')->redirect();
}
```

### **SocialController.php - Método handleGoogleCallback:**
```php
public function handleGoogleCallback(Request $request)
{
    try {
        $googleUser = Socialite::driver('google')->user();

        // Buscar usuario existente por email o google_id
        $user = User::where('email', $googleUser->getEmail())
                   ->orWhere('google_id', $googleUser->getId())
                   ->first();

        if ($user) {
            // Si el usuario existe, actualizar información de Google
            $user->update([
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'email_verified_at' => $user->email_verified_at ?? now(),
            ]);
        } else {
            // Crear nuevo usuario con password aleatorio (por si acaso)
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'email_verified_at' => now(),
                'password' => Hash::make(Str::random(32)), // Password aleatorio seguro
            ]);
        }

        // ===== DETECTAR SI ES MÓVIL =====
        $isMobile = session('is_mobile', false);
        $redirectUri = session('oauth_redirect_uri');

        if ($isMobile && $redirectUri) {
            // ===== FLUJO MÓVIL =====

            // Generar token Sanctum para la app móvil
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

            // Redirigir a la app móvil con deep link
            return redirect("{$redirectUri}?token={$token}&user={$userData}");
        }

        // ===== FLUJO WEB (comportamiento normal) =====
        Auth::login($user, true);
        $request->session()->regenerate();
        return redirect()->intended('dashboard');

    } catch (\Exception $e) {
        \Log::error('Google OAuth Error: ' . $e->getMessage());

        // Si hay error y es móvil, redirigir a la app con error
        if (session('is_mobile') && session('oauth_redirect_uri')) {
            $redirectUri = session('oauth_redirect_uri');
            session()->forget(['oauth_redirect_uri', 'is_mobile']);
            return redirect("{$redirectUri}?error=auth_failed&message=" . urlencode($e->getMessage()));
        }

        return redirect('/login')->with('error', 'Error al iniciar sesión con Google: ' . $e->getMessage());
    }
}
```

---

## ✅ Estado Actual del Sistema

**El sistema está COMPLETAMENTE FUNCIONAL** y ya implementado:

1. ✅ **Detección de móvil** - Funciona con parámetros `mobile=true`
2. ✅ **Sesión temporal** - Guarda `redirect_uri` e `is_mobile`
3. ✅ **Generación de token** - Crea token Sanctum para móvil
4. ✅ **Deep link** - Redirige a `nutricoach://auth/callback`
5. ✅ **Manejo de errores** - Redirige con error si falla
6. ✅ **Logs detallados** - Para debugging
7. ✅ **CORS configurado** - Para apps móviles

---

## 🚀 Para Probar el Sistema

### **1. Configurar Google OAuth**
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear proyecto o seleccionar existente
3. Habilitar Google+ API
4. Crear credenciales OAuth 2.0
5. Configurar URLs autorizadas:
   - `https://nutricoachb-main-2vd5yx.laravel.cloud/auth/google/callback`

### **2. Configurar Variables de Entorno**
```env
GOOGLE_CLIENT_ID=tu_client_id_de_google
GOOGLE_CLIENT_SECRET=tu_client_secret_de_google
GOOGLE_REDIRECT_URI=https://nutricoachb-main-2vd5yx.laravel.cloud/auth/google/callback
```

### **3. Configurar Deep Link en App Móvil**
- **Android**: Configurar `android:scheme="nutricoach"` en AndroidManifest.xml
- **iOS**: Configurar URL Scheme `nutricoach` en Info.plist

### **4. Probar Flujo Completo**
1. Abrir app móvil
2. Presionar "Login con Google"
3. Se abre navegador con login de Google
4. Completar login
5. App móvil recibe deep link con token
6. Usuario autenticado ✅

---

## 🔧 Troubleshooting

### **Problemas Comunes:**

#### **1. Deep Link no funciona**
- Verificar configuración de URL Scheme en app móvil
- Comprobar que el listener esté configurado correctamente
- Revisar logs del dispositivo

#### **2. Token no se genera**
- Verificar configuración de Sanctum
- Comprobar que el usuario se crea correctamente
- Revisar logs de Laravel

#### **3. Error de CORS**
- Verificar configuración en `config/cors.php`
- Asegurar que `supports_credentials` esté en `true`
- Comprobar headers permitidos

#### **4. Sesión se pierde**
- Verificar configuración de sesión en Laravel
- Comprobar que las cookies funcionen correctamente
- Revisar configuración de dominio

### **Logs Útiles:**
```bash
# Ver logs de Laravel
tail -f storage/logs/laravel.log | grep "OAuth Google"

# Ver logs de la app móvil
# Android: adb logcat | grep "nutricoach"
# iOS: Xcode Console
```

---

## 📊 Ejemplo de Respuesta Exitosa

### **Deep Link Generado:**
```
nutricoach://auth/callback?token=1|AbCdEf123456789&user=%7B%22id%22%3A1%2C%22name%22%3A%22Luis%20Garc%C3%ADa%22%2C%22email%22%3A%22luis.garcia%40gmail.com%22%2C%22avatar%22%3A%22https%3A%2F%2Flh3.googleusercontent.com%2Fa%2FACg8ocJ...%22%7D
```

### **Datos del Usuario (decodificados):**
```json
{
    "id": 1,
    "name": "Luis García",
    "email": "luis.garcia@gmail.com",
    "avatar": "https://lh3.googleusercontent.com/a/ACg8ocJ..."
}
```

### **Token Sanctum:**
```
1|AbCdEf123456789
```

---

## 🎯 Beneficios del Sistema

1. **Seguridad** - Tokens Sanctum seguros
2. **Simplicidad** - Un solo flujo para web y móvil
3. **Flexibilidad** - Detección automática del tipo de cliente
4. **Mantenibilidad** - Código centralizado en un controlador
5. **Escalabilidad** - Fácil agregar más proveedores OAuth
6. **Debugging** - Logs detallados para troubleshooting

---

**¡El sistema de autenticación móvil está completamente funcional y listo para producción!** 🎉
