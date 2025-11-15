<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MusicActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

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
     * Obtener estado de conexión de Spotify
     */
    public function status(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'connected' => $user->hasSpotifyConnected(),
            'spotify_id' => $user->spotify_id,
            'share_listening' => $user->spotify_share_listening ?? false,
        ]);
    }

    /**
     * Obtener URL de autorización de Spotify
     */
    public function getAuthUrl(Request $request)
    {
        // Validar que las credenciales estén configuradas
        if (empty($this->clientId) || empty($this->clientSecret)) {
            return response()->json([
                'error' => 'Spotify no está configurado. Por favor, contacta al administrador.',
            ], 500);
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

        $state = bin2hex(random_bytes(16));
        $request->session()->put('spotify_state', $state);

        $query = http_build_query([
            'client_id' => $this->clientId,
            'response_type' => 'code',
            'redirect_uri' => $this->redirectUri,
            'scope' => implode(' ', $scopes),
            'state' => $state,
            'show_dialog' => true,
        ]);

        return response()->json([
            'auth_url' => 'https://accounts.spotify.com/authorize?' . $query,
        ]);
    }

    /**
     * Conectar Spotify con código de autorización
     */
    public function connect(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $code = $request->input('code');

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

                return response()->json([
                    'success' => true,
                    'message' => 'Spotify conectado exitosamente',
                    'spotify_id' => $user->spotify_id,
                ]);
            }

            return response()->json([
                'success' => false,
                'error' => 'Error al conectar con Spotify',
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al conectar con Spotify: ' . $e->getMessage(),
            ], 500);
        }
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
            'spotify_share_listening' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Spotify desconectado exitosamente',
        ]);
    }

    /**
     * Obtener token actualizado (refresh si es necesario)
     */
    private function getValidToken($user): ?string
    {
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
            \Log::error('Error refreshing Spotify token: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Obtener lo que está reproduciéndose actualmente
     */
    public function getCurrentlyPlaying(Request $request)
    {
        $user = $request->user();
        $token = $this->getValidToken($user);

        if (!$token) {
            return response()->json(['error' => 'Spotify no conectado'], 401);
        }

        try {
            $response = Http::withToken($token)
                ->get('https://api.spotify.com/v1/me/player/currently-playing');

            if ($response->successful() && $response->json()) {
                $data = $response->json();

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
     * Obtener historial de actividad musical
     */
    public function getActivityHistory(Request $request)
    {
        $user = $request->user();
        $limit = $request->input('limit', 50);
        $hours = $request->input('hours', 24);

        $activities = MusicActivity::where('user_id', $user->id)
            ->recent($hours)
            ->with('user:id,name,avatar')
            ->latest('started_at')
            ->limit($limit)
            ->get();

        return response()->json($activities);
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
     * Controles de reproducción - Play
     */
    public function play(Request $request)
    {
        $user = $request->user();
        $token = $this->getValidToken($user);

        if (!$token) {
            return response()->json(['error' => 'Spotify no conectado'], 401);
        }

        $response = Http::withToken($token)->put('https://api.spotify.com/v1/me/player/play');

        return response()->json(['success' => $response->successful()]);
    }

    /**
     * Controles de reproducción - Pause
     */
    public function pause(Request $request)
    {
        $user = $request->user();
        $token = $this->getValidToken($user);

        if (!$token) {
            return response()->json(['error' => 'Spotify no conectado'], 401);
        }

        $response = Http::withToken($token)->put('https://api.spotify.com/v1/me/player/pause');

        return response()->json(['success' => $response->successful()]);
    }

    /**
     * Controles de reproducción - Next
     */
    public function next(Request $request)
    {
        $user = $request->user();
        $token = $this->getValidToken($user);

        if (!$token) {
            return response()->json(['error' => 'Spotify no conectado'], 401);
        }

        $response = Http::withToken($token)->post('https://api.spotify.com/v1/me/player/next');

        return response()->json(['success' => $response->successful()]);
    }

    /**
     * Controles de reproducción - Previous
     */
    public function previous(Request $request)
    {
        $user = $request->user();
        $token = $this->getValidToken($user);

        if (!$token) {
            return response()->json(['error' => 'Spotify no conectado'], 401);
        }

        $response = Http::withToken($token)->post('https://api.spotify.com/v1/me/player/previous');

        return response()->json(['success' => $response->successful()]);
    }

    /**
     * Obtener recientemente reproducido
     */
    public function getRecentlyPlayed(Request $request)
    {
        $user = $request->user();
        $token = $this->getValidToken($user);

        if (!$token) {
            return response()->json(['error' => 'Spotify no conectado'], 401);
        }

        $limit = $request->input('limit', 20);

        try {
            $response = Http::withToken($token)
                ->get('https://api.spotify.com/v1/me/player/recently-played', [
                    'limit' => $limit,
                ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json(['error' => 'Error al obtener recientemente reproducido'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener recientemente reproducido'], 500);
        }
    }
}

