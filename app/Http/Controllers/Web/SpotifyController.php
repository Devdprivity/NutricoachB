<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\MusicActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class SpotifyController extends Controller
{
    private string $clientId;
    private string $clientSecret;
    private string $redirectUri;

    public function __construct()
    {
        $this->clientId = env('SPOTIFY_CLIENT_ID', '');
        $this->clientSecret = env('SPOTIFY_CLIENT_SECRET', '');
        $this->redirectUri = env('SPOTIFY_REDIRECT_URI', config('app.url') . '/spotify/callback');
    }

    /**
     * Redirigir a Spotify para autenticación
     */
    public function redirectToSpotify()
    {
        // Validar que las credenciales estén configuradas
        if (empty($this->clientId) || empty($this->clientSecret)) {
            return redirect()->route('dashboard')
                ->with('error', 'Spotify no está configurado. Por favor, contacta al administrador.');
        }

        $scopes = [
            'user-read-currently-playing',
            'user-read-playback-state',
            'user-modify-playback-state',
            'user-read-recently-played',
            'streaming',
            'user-read-email',
            'user-read-private',
        ];

        $query = http_build_query([
            'client_id' => $this->clientId,
            'response_type' => 'code',
            'redirect_uri' => $this->redirectUri,
            'scope' => implode(' ', $scopes),
            'show_dialog' => true,
        ]);

        return redirect('https://accounts.spotify.com/authorize?' . $query);
    }

    /**
     * Callback de Spotify
     */
    public function handleSpotifyCallback(Request $request)
    {
        $code = $request->get('code');

        if (!$code) {
            return redirect()->route('dashboard')->with('error', 'Error al conectar con Spotify');
        }

        try {
            $response = Http::asForm()->post('https://accounts.spotify.com/api/token', [
                'grant_type' => 'authorization_code',
                'code' => $code,
                'redirect_uri' => $this->redirectUri,
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
            ]);

            if ($response->successful()) {
                $data = $response->json();

                $user = $request->user();
                $user->update([
                    'spotify_access_token' => $data['access_token'],
                    'spotify_refresh_token' => $data['refresh_token'],
                    'spotify_token_expires_at' => now()->addSeconds($data['expires_in']),
                ]);

                // Obtener perfil de Spotify
                $profileResponse = Http::withToken($data['access_token'])
                    ->get('https://api.spotify.com/v1/me');

                if ($profileResponse->successful()) {
                    $profile = $profileResponse->json();
                    $user->update(['spotify_id' => $profile['id']]);
                }

                return redirect()->route('dashboard')->with('success', '¡Spotify conectado exitosamente!');
            }
        } catch (\Exception $e) {
            return redirect()->route('dashboard')->with('error', 'Error al conectar con Spotify');
        }

        return redirect()->route('dashboard')->with('error', 'Error al conectar con Spotify');
    }

    /**
     * Desconectar Spotify
     */
    public function disconnect(Request $request)
    {
        $user = $request->user();
        $user->update([
            'spotify_id' => null,
            'spotify_access_token' => null,
            'spotify_refresh_token' => null,
            'spotify_token_expires_at' => null,
        ]);

        return redirect()->back()->with('success', 'Spotify desconectado');
    }

    /**
     * Obtener token actualizado (refresh si es necesario)
     */
    private function getValidToken(Request $request): ?string
    {
        $user = $request->user();

        if (!$user->spotify_access_token) {
            return null;
        }

        // Si el token ha expirado, refrescarlo
        if ($user->spotify_token_expires_at && $user->spotify_token_expires_at->isPast()) {
            return $this->refreshAccessToken($user);
        }

        return $user->spotify_access_token;
    }

    /**
     * Refrescar access token
     */
    private function refreshAccessToken($user): ?string
    {
        try {
            $response = Http::asForm()->post('https://accounts.spotify.com/api/token', [
                'grant_type' => 'refresh_token',
                'refresh_token' => $user->spotify_refresh_token,
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
            ]);

            if ($response->successful()) {
                $data = $response->json();

                $user->update([
                    'spotify_access_token' => $data['access_token'],
                    'spotify_token_expires_at' => now()->addSeconds($data['expires_in']),
                ]);

                return $data['access_token'];
            }
        } catch (\Exception $e) {
            // Token refresh failed
        }

        return null;
    }

    /**
     * Obtener lo que está reproduciéndose actualmente
     */
    public function getCurrentlyPlaying(Request $request)
    {
        $token = $this->getValidToken($request);

        if (!$token) {
            return response()->json(['error' => 'Spotify no conectado'], 401);
        }

        try {
            $response = Http::withToken($token)
                ->get('https://api.spotify.com/v1/me/player/currently-playing');

            if ($response->successful() && $response->json()) {
                $data = $response->json();
                $user = $request->user();

                // Guardar actividad si el usuario tiene compartir activado
                if ($user->spotify_share_listening && isset($data['item'])) {
                    $this->saveCurrentActivity($user, $data);
                }

                return response()->json($data);
            }

            return response()->json(['is_playing' => false]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener reproducción'], 500);
        }
    }

    /**
     * Guardar actividad musical actual
     */
    private function saveCurrentActivity($user, $spotifyData)
    {
        if (!isset($spotifyData['item'])) {
            return;
        }

        $track = $spotifyData['item'];
        $trackId = $track['id'];

        // Verificar si ya existe una actividad reciente para este track
        $existingActivity = MusicActivity::where('user_id', $user->id)
            ->where('track_id', $trackId)
            ->where('is_playing', true)
            ->whereNull('ended_at')
            ->first();

        if ($existingActivity) {
            // Actualizar progreso
            $existingActivity->update([
                'progress_ms' => $spotifyData['progress_ms'] ?? 0,
                'is_playing' => $spotifyData['is_playing'] ?? true,
            ]);
        } else {
            // Marcar actividad anterior como terminada
            MusicActivity::where('user_id', $user->id)
                ->where('is_playing', true)
                ->whereNull('ended_at')
                ->update([
                    'is_playing' => false,
                    'ended_at' => now(),
                ]);

            // Crear nueva actividad
            MusicActivity::create([
                'user_id' => $user->id,
                'track_id' => $trackId,
                'track_name' => $track['name'],
                'artist_name' => $track['artists'][0]['name'] ?? 'Unknown',
                'album_name' => $track['album']['name'] ?? null,
                'album_image_url' => $track['album']['images'][0]['url'] ?? null,
                'track_url' => $track['external_urls']['spotify'] ?? null,
                'duration_ms' => $track['duration_ms'] ?? 0,
                'progress_ms' => $spotifyData['progress_ms'] ?? 0,
                'is_playing' => $spotifyData['is_playing'] ?? true,
                'started_at' => now(),
            ]);
        }
    }

    /**
     * Obtener actividad musical de amigos
     */
    public function getFriendsListening(Request $request)
    {
        $user = $request->user();

        // Obtener IDs de amigos (usuarios que sigue)
        $friendIds = $user->following()->pluck('users.id');

        // Obtener actividad musical actual de amigos
        $friendsListening = MusicActivity::whereIn('user_id', $friendIds)
            ->where('is_playing', true)
            ->whereNull('ended_at')
            ->with('user:id,name,avatar')
            ->latest('started_at')
            ->get();

        return response()->json($friendsListening);
    }

    /**
     * Alternar compartir escucha
     */
    public function toggleShareListening(Request $request)
    {
        $user = $request->user();
        $user->update([
            'spotify_share_listening' => !$user->spotify_share_listening,
        ]);

        return response()->json([
            'spotify_share_listening' => $user->spotify_share_listening,
        ]);
    }

    /**
     * Controles de reproducción
     */
    public function play(Request $request)
    {
        $token = $this->getValidToken($request);

        if (!$token) {
            return response()->json(['error' => 'Spotify no conectado'], 401);
        }

        $response = Http::withToken($token)->put('https://api.spotify.com/v1/me/player/play');

        return response()->json(['success' => $response->successful()]);
    }

    public function pause(Request $request)
    {
        $token = $this->getValidToken($request);

        if (!$token) {
            return response()->json(['error' => 'Spotify no conectado'], 401);
        }

        $response = Http::withToken($token)->put('https://api.spotify.com/v1/me/player/pause');

        return response()->json(['success' => $response->successful()]);
    }

    public function next(Request $request)
    {
        $token = $this->getValidToken($request);

        if (!$token) {
            return response()->json(['error' => 'Spotify no conectado'], 401);
        }

        $response = Http::withToken($token)->post('https://api.spotify.com/v1/me/player/next');

        return response()->json(['success' => $response->successful()]);
    }

    public function previous(Request $request)
    {
        $token = $this->getValidToken($request);

        if (!$token) {
            return response()->json(['error' => 'Spotify no conectado'], 401);
        }

        $response = Http::withToken($token)->post('https://api.spotify.com/v1/me/player/previous');

        return response()->json(['success' => $response->successful()]);
    }
}
