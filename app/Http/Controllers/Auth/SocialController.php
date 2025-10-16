<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialController extends Controller
{
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

                \Log::info('OAuth Google - Usuario actualizado', [
                    'user_id' => $user->id,
                    'avatar' => $user->avatar,
                    'google_id' => $user->google_id,
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

                \Log::info('OAuth Google - Nuevo usuario creado', [
                    'user_id' => $user->id,
                    'avatar' => $user->avatar,
                    'google_id' => $user->google_id,
                ]);
            }

            // ===== DETECTAR SI ES MÓVIL =====
            $isMobile = session('is_mobile', false);
            $redirectUri = session('oauth_redirect_uri');

            \Log::info('OAuth Google - Callback', [
                'session_is_mobile' => $isMobile,
                'session_redirect_uri' => $redirectUri,
            ]);

            if ($isMobile && $redirectUri) {
                // ===== FLUJO MÓVIL =====

                // Generar token Sanctum para la app móvil
                $token = $user->createToken('mobile-app')->plainTextToken;

                // Preparar datos del usuario (sin escapar slashes)
                $userData = urlencode(json_encode([
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                ], JSON_UNESCAPED_SLASHES));

                // Construir URL completa del deep link
                $deepLinkUrl = "{$redirectUri}?token={$token}&user={$userData}";

                \Log::info('OAuth Google - Redirigiendo a móvil', [
                    'redirect_uri' => $redirectUri,
                    'deep_link_url' => $deepLinkUrl,
                    'user_id' => $user->id,
                    'avatar' => $user->avatar,
                    'name' => $user->name,
                    'token_length' => strlen($token),
                ]);

                // Limpiar sesión
                session()->forget(['oauth_redirect_uri', 'is_mobile']);

                // Escapar el deep link URL para JavaScript (evitar problemas con comillas y caracteres especiales)
                $deepLinkUrlEscaped = htmlspecialchars($deepLinkUrl, ENT_QUOTES, 'UTF-8');
                $deepLinkUrlJson = json_encode($deepLinkUrl);

                // Retornar HTML simple con meta refresh y JavaScript para deep link
                $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Autenticación exitosa</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }
        .container { padding: 2rem; }
        .spinner {
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        a { color: white; text-decoration: underline; margin-top: 1rem; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <h1>Autenticación exitosa</h1>
        <p>Redirigiendo a la aplicación...</p>
        <a href="{$deepLinkUrlEscaped}" id="manualLink" style="display:none;">Toca aquí si no redirige automáticamente</a>
    </div>
    <script>
        (function() {
            var deepLinkUrl = {$deepLinkUrlJson};
            console.log('Intentando redirigir a:', deepLinkUrl);

            // Intentar redirección inmediata
            window.location.href = deepLinkUrl;

            // Mostrar enlace manual después de 2 segundos
            setTimeout(function() {
                document.getElementById('manualLink').style.display = 'inline-block';
            }, 2000);

            // Intentar cerrar ventana después de 3 segundos
            setTimeout(function() {
                try {
                    window.close();
                } catch(e) {
                    console.log('No se puede cerrar la ventana');
                }
            }, 3000);
        })();
    </script>
</body>
</html>
HTML;

                return response($html, 200)->header('Content-Type', 'text/html');
            }

            // ===== FLUJO WEB (comportamiento normal) =====

            // Autenticar al usuario con remember=true para persistir sesión
            Auth::login($user, true);

            // Regenerar sesión para evitar problemas de seguridad
            $request->session()->regenerate();

            // Redirigir al dashboard
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
}