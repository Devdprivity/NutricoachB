<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\MusicActivity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class YouTubeMusicController extends Controller
{
    private string $clientId;
    private string $clientSecret;
    private string $redirectUri;

    public function __construct()
    {
        // Usar las mismas credenciales de Google OAuth que ya están funcionando
        $this->clientId = config('services.google.client_id');
        $this->clientSecret = config('services.google.client_secret');
        // Usar el redirect URI de YouTube Music o el de Google si no está configurado
        $this->redirectUri = config('services.youtube_music.redirect_uri') 
            ?? config('app.url') . '/youtube-music/callback';
    }

    /**
     * Redirect user to YouTube OAuth authorization page
     */
    public function redirectToYouTubeMusic()
    {
        // Validar que las credenciales estén configuradas
        if (empty($this->clientId) || empty($this->clientSecret)) {
            Log::error('YouTube Music: Credenciales de Google OAuth no configuradas');
            return redirect()->route('integrations.index')
                ->with('error', 'YouTube Music no está configurado. Por favor, contacta al administrador.');
        }

        // Asegurar que el redirect URI esté configurado correctamente
        if (empty($this->redirectUri)) {
            $this->redirectUri = config('app.url') . '/youtube-music/callback';
        }

        $scopes = [
            'https://www.googleapis.com/auth/youtube',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtubepartner',
        ];

        Log::info('YouTube Music Redirect', [
            'client_id' => substr($this->clientId, 0, 10) . '...',
            'redirect_uri' => $this->redirectUri,
        ]);

        $query = http_build_query([
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'response_type' => 'code',
            'scope' => implode(' ', $scopes),
            'access_type' => 'offline',
            'prompt' => 'consent',
        ]);

        return redirect('https://accounts.google.com/o/oauth2/v2/auth?' . $query);
    }

    /**
     * Handle YouTube OAuth callback
     */
    public function handleYouTubeMusicCallback(Request $request)
    {
        $code = $request->get('code');
        $error = $request->get('error');

        if ($error) {
            Log::error('YouTube Music callback error', ['error' => $error]);
            return redirect()->route('integrations.index')
                ->with('error', 'Error al conectar con YouTube Music: ' . $error);
        }

        if (!$code) {
            Log::error('YouTube Music callback sin código');
            return redirect()->route('integrations.index')
                ->with('error', 'Error al conectar con YouTube Music: No se recibió código de autorización');
        }

        // Asegurar que el redirect URI esté configurado correctamente
        if (empty($this->redirectUri)) {
            $this->redirectUri = config('app.url') . '/youtube-music/callback';
        }

        Log::info('YouTube Music callback recibido', [
            'redirect_uri' => $this->redirectUri,
        ]);

        try {
            // Exchange code for access token
            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
                'code' => $code,
                'redirect_uri' => $this->redirectUri,
                'grant_type' => 'authorization_code',
            ]);

            if ($response->failed()) {
                Log::error('YouTube Music token exchange failed', [
                    'status' => $response->status(),
                    'response' => $response->json(),
                    'body' => $response->body(),
                ]);
                return redirect()->route('integrations.index')
                    ->with('error', 'Error al conectar con YouTube Music. Verifica que el redirect URI esté configurado en Google Cloud Console.');
            }

            $data = $response->json();

            // Get user's YouTube profile
            $userResponse = Http::withToken($data['access_token'])
                ->get('https://www.googleapis.com/youtube/v3/channels', [
                    'part' => 'snippet',
                    'mine' => 'true',
                ]);

            if ($userResponse->failed()) {
                Log::error('YouTube Music user info failed', [
                    'status' => $userResponse->status(),
                    'response' => $userResponse->json(),
                ]);
                return redirect()->route('integrations.index')
                    ->with('error', 'Error al obtener el perfil de YouTube Music');
            }

            $userData = $userResponse->json();
            $channelId = $userData['items'][0]['id'] ?? null;

            if (!$channelId) {
                Log::error('YouTube Music: No se encontró canal', ['user_data' => $userData]);
                return redirect()->route('integrations.index')
                    ->with('error', 'No se encontró canal de YouTube asociado a tu cuenta');
            }

            // Update user with YouTube Music credentials
            $user = Auth::user();
            $user->update([
                'youtube_music_id' => $channelId,
                'youtube_music_access_token' => $data['access_token'],
                'youtube_music_refresh_token' => $data['refresh_token'] ?? null,
                'youtube_music_token_expires_at' => now()->addSeconds($data['expires_in'] ?? 3600),
                'preferred_music_service' => 'youtube_music',
            ]);

            Log::info('YouTube Music conectado exitosamente', [
                'user_id' => $user->id,
                'youtube_music_id' => $channelId,
            ]);

            return redirect()->route('integrations.index')
                ->with('success', '¡YouTube Music conectado exitosamente!');
        } catch (\Exception $e) {
            Log::error('YouTube Music connection error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->route('integrations.index')
                ->with('error', 'Error al conectar con YouTube Music: ' . $e->getMessage());
        }
    }

    /**
     * Disconnect YouTube Music
     */
    public function disconnect()
    {
        $user = Auth::user();
        $user->update([
            'youtube_music_id' => null,
            'youtube_music_access_token' => null,
            'youtube_music_refresh_token' => null,
            'youtube_music_token_expires_at' => null,
        ]);

        // If this was the preferred service, reset to null
        if ($user->preferred_music_service === 'youtube_music') {
            $user->update(['preferred_music_service' => null]);
        }

        return response()->json(['message' => 'YouTube Music disconnected successfully']);
    }

    /**
     * Refresh access token if expired
     */
    private function refreshAccessToken(User $user): ?string
    {
        if (!$user->youtube_music_refresh_token) {
            return null;
        }

        try {
            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
                'refresh_token' => $user->youtube_music_refresh_token,
                'grant_type' => 'refresh_token',
            ]);

            if ($response->failed()) {
                return null;
            }

            $data = $response->json();

            $user->update([
                'youtube_music_access_token' => $data['access_token'],
                'youtube_music_token_expires_at' => now()->addSeconds($data['expires_in']),
            ]);

            return $data['access_token'];
        } catch (\Exception $e) {
            Log::error('YouTube Music token refresh failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Get valid access token (refresh if needed)
     */
    private function getValidAccessToken(User $user): ?string
    {
        if (!$user->youtube_music_access_token) {
            return null;
        }

        // Check if token is expired or will expire in next 5 minutes
        if ($user->youtube_music_token_expires_at && $user->youtube_music_token_expires_at->subMinutes(5)->isPast()) {
            return $this->refreshAccessToken($user);
        }

        return $user->youtube_music_access_token;
    }

    /**
     * Get currently playing track (Note: YouTube Music doesn't have a public API for this)
     * This is a placeholder - actual implementation would require YouTube Music Premium API
     */
    public function getCurrentlyPlaying()
    {
        $user = Auth::user();

        if (!$user->hasYouTubeMusicConnected()) {
            return response()->json(['error' => 'YouTube Music not connected'], 401);
        }

        // YouTube Music doesn't provide a public "currently playing" endpoint like Spotify
        // This would require integration with YouTube Music Premium API or alternative methods
        // For now, we'll return the last activity from database

        $activity = $user->musicActivity()
            ->where('music_provider', 'youtube_music')
            ->where('is_playing', true)
            ->latest('started_at')
            ->first();

        if (!$activity) {
            return response()->json(['is_playing' => false]);
        }

        return response()->json([
            'is_playing' => true,
            'item' => [
                'id' => $activity->track_id,
                'name' => $activity->track_name,
                'artists' => [['name' => $activity->artist_name]],
                'album' => [
                    'name' => $activity->album_name,
                    'images' => [['url' => $activity->album_image_url]],
                ],
                'external_urls' => ['youtube' => $activity->track_url],
            ],
        ]);
    }

    /**
     * Search for videos/tracks
     */
    public function search(Request $request)
    {
        $user = Auth::user();
        $accessToken = $this->getValidAccessToken($user);

        if (!$accessToken) {
            return response()->json(['error' => 'YouTube Music not connected'], 401);
        }

        $query = $request->get('q', '');

        if (empty($query)) {
            return response()->json(['videos' => ['items' => []]]);
        }

        try {
            $response = Http::withToken($accessToken)
                ->get('https://www.googleapis.com/youtube/v3/search', [
                    'part' => 'snippet',
                    'q' => $query,
                    'type' => 'video',
                    'videoCategoryId' => '10', // Music category
                    'maxResults' => 20,
                ]);

            if ($response->failed()) {
                return response()->json(['error' => 'Search failed'], 500);
            }

            return response()->json(['videos' => $response->json()]);
        } catch (\Exception $e) {
            Log::error('YouTube Music search error', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Search failed'], 500);
        }
    }

    /**
     * Play a video (Note: Actual playback control requires YouTube iframe player on frontend)
     */
    public function playVideo(Request $request)
    {
        $user = Auth::user();

        if (!$user->hasYouTubeMusicConnected()) {
            return response()->json(['error' => 'YouTube Music not connected'], 401);
        }

        $videoId = $request->input('video_id');
        $videoTitle = $request->input('title', 'Unknown');
        $artist = $request->input('artist', 'Unknown Artist');
        $thumbnail = $request->input('thumbnail', null);

        // Save activity to database
        $this->saveActivity($user, [
            'video_id' => $videoId,
            'title' => $videoTitle,
            'artist' => $artist,
            'thumbnail' => $thumbnail,
        ]);

        // Return video ID for frontend player
        return response()->json([
            'message' => 'Video queued',
            'video_id' => $videoId,
        ]);
    }

    /**
     * Get friends who are currently listening
     */
    public function getFriendsListening()
    {
        $user = Auth::user();

        // Get following users
        $followingIds = $user->following()->pluck('followed_id');

        // Get their current YouTube Music activity
        $friendsListening = User::whereIn('id', $followingIds)
            ->whereNotNull('youtube_music_id')
            ->where('spotify_share_listening', true)
            ->with(['currentlyPlaying' => function ($query) {
                $query->where('music_provider', 'youtube_music');
            }])
            ->get()
            ->filter(function ($friend) {
                return $friend->currentlyPlaying !== null;
            })
            ->map(function ($friend) {
                $activity = $friend->currentlyPlaying;
                return [
                    'user' => [
                        'id' => $friend->id,
                        'name' => $friend->name,
                        'avatar' => $friend->avatar,
                    ],
                    'track' => [
                        'name' => $activity->track_name,
                        'artist' => $activity->artist_name,
                        'album_image' => $activity->album_image_url,
                        'url' => $activity->track_url,
                    ],
                ];
            })
            ->values();

        return response()->json($friendsListening);
    }

    /**
     * Save music activity to database
     */
    private function saveActivity(User $user, array $data)
    {
        // Mark previous activity as ended
        MusicActivity::where('user_id', $user->id)
            ->where('music_provider', 'youtube_music')
            ->where('is_playing', true)
            ->whereNull('ended_at')
            ->update([
                'is_playing' => false,
                'ended_at' => now(),
            ]);

        // Create new activity
        MusicActivity::create([
            'user_id' => $user->id,
            'music_provider' => 'youtube_music',
            'track_id' => $data['video_id'],
            'track_name' => $data['title'],
            'artist_name' => $data['artist'],
            'album_image_url' => $data['thumbnail'],
            'track_url' => "https://www.youtube.com/watch?v={$data['video_id']}",
            'is_playing' => true,
            'started_at' => now(),
        ]);
    }

    /**
     * Toggle sharing listening activity
     */
    public function toggleShareListening()
    {
        $user = Auth::user();
        $newValue = !$user->spotify_share_listening;

        $user->update(['spotify_share_listening' => $newValue]);

        return response()->json([
            'sharing' => $newValue,
            'message' => $newValue ? 'Sharing enabled' : 'Sharing disabled',
        ]);
    }
}
