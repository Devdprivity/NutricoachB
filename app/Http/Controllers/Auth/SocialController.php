<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
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

                // Enviar email de bienvenida (en cola)
                Mail::to($user->email)->send(new WelcomeMail($user));
                
                \Log::info('OAuth Google - Email de bienvenida enviado a cola', [
                    'user_id' => $user->id,
                    'email' => $user->email,
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

                // Redirigir con 302 al deep link
                // WebBrowser.openAuthSessionAsync() captura este redirect automáticamente
                return redirect()->away($deepLinkUrl);
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