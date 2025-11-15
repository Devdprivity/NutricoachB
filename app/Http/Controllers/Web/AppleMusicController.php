<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\MusicActivity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AppleMusicController extends Controller
{
    /**
     * Connect Apple Music (Store user token from frontend MusicKit)
     * Apple Music authentication happens in the frontend using MusicKit JS
     * The frontend sends the user token to the backend to store
     */
    public function connect(Request $request)
    {
        $request->validate([
            'user_token' => 'required|string',
            'music_user_id' => 'required|string',
        ]);

        $user = Auth::user();
        $user->update([
            'apple_music_id' => $request->music_user_id,
            'apple_music_user_token' => $request->user_token,
            'apple_music_developer_token' => config('services.apple_music.team_id'), // Store team ID for reference
            'apple_music_token_expires_at' => now()->addMonths(6), // Apple Music tokens last 6 months
            'preferred_music_service' => 'apple_music',
        ]);

        return response()->json([
            'message' => 'Apple Music connected successfully',
            'user' => $user->only(['apple_music_id', 'preferred_music_service']),
        ]);
    }

    /**
     * Disconnect Apple Music
     */
    public function disconnect()
    {
        $user = Auth::user();
        $user->update([
            'apple_music_id' => null,
            'apple_music_user_token' => null,
            'apple_music_developer_token' => null,
            'apple_music_token_expires_at' => null,
        ]);

        // If this was the preferred service, reset to null
        if ($user->preferred_music_service === 'apple_music') {
            $user->update(['preferred_music_service' => null]);
        }

        return response()->json(['message' => 'Apple Music disconnected successfully']);
    }

    /**
     * Get developer token for MusicKit initialization on frontend
     */
    public function getDeveloperToken()
    {
        // In production, you would generate a JWT token here using your Apple Music private key
        // For now, we'll return the team ID which the frontend will use
        return response()->json([
            'team_id' => config('services.apple_music.team_id'),
            'key_id' => config('services.apple_music.key_id'),
        ]);
    }

    /**
     * Save currently playing track from frontend
     * Since playback happens in the browser with MusicKit, frontend sends playing info
     */
    public function saveCurrentlyPlaying(Request $request)
    {
        $request->validate([
            'track_id' => 'required|string',
            'track_name' => 'required|string',
            'artist_name' => 'required|string',
            'album_name' => 'nullable|string',
            'album_image_url' => 'nullable|string',
            'track_url' => 'nullable|string',
            'duration_ms' => 'nullable|integer',
            'is_playing' => 'required|boolean',
        ]);

        $user = Auth::user();

        if (!$user->hasAppleMusicConnected()) {
            return response()->json(['error' => 'Apple Music not connected'], 401);
        }

        if ($request->is_playing) {
            // Mark previous activity as ended
            MusicActivity::where('user_id', $user->id)
                ->where('music_provider', 'apple_music')
                ->where('is_playing', true)
                ->whereNull('ended_at')
                ->update([
                    'is_playing' => false,
                    'ended_at' => now(),
                ]);

            // Create new activity
            MusicActivity::create([
                'user_id' => $user->id,
                'music_provider' => 'apple_music',
                'track_id' => $request->track_id,
                'track_name' => $request->track_name,
                'artist_name' => $request->artist_name,
                'album_name' => $request->album_name,
                'album_image_url' => $request->album_image_url,
                'track_url' => $request->track_url,
                'duration_ms' => $request->duration_ms,
                'is_playing' => true,
                'started_at' => now(),
            ]);
        } else {
            // Mark current activity as paused/ended
            MusicActivity::where('user_id', $user->id)
                ->where('music_provider', 'apple_music')
                ->where('is_playing', true)
                ->whereNull('ended_at')
                ->update([
                    'is_playing' => false,
                    'ended_at' => now(),
                ]);
        }

        return response()->json(['message' => 'Activity saved']);
    }

    /**
     * Get currently playing track from database
     */
    public function getCurrentlyPlaying()
    {
        $user = Auth::user();

        if (!$user->hasAppleMusicConnected()) {
            return response()->json(['error' => 'Apple Music not connected'], 401);
        }

        $activity = $user->musicActivity()
            ->where('music_provider', 'apple_music')
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
                'external_urls' => ['apple_music' => $activity->track_url],
                'duration_ms' => $activity->duration_ms,
            ],
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

        // Get their current Apple Music activity
        $friendsListening = User::whereIn('id', $followingIds)
            ->whereNotNull('apple_music_id')
            ->where('spotify_share_listening', true)
            ->with(['currentlyPlaying' => function ($query) {
                $query->where('music_provider', 'apple_music');
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

    /**
     * Get user's recent listening history
     */
    public function getRecentlyPlayed()
    {
        $user = Auth::user();

        if (!$user->hasAppleMusicConnected()) {
            return response()->json(['error' => 'Apple Music not connected'], 401);
        }

        $recentTracks = $user->musicActivity()
            ->where('music_provider', 'apple_music')
            ->orderBy('started_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($activity) {
                return [
                    'track' => [
                        'id' => $activity->track_id,
                        'name' => $activity->track_name,
                        'artists' => [['name' => $activity->artist_name]],
                        'album' => [
                            'name' => $activity->album_name,
                            'images' => [['url' => $activity->album_image_url]],
                        ],
                        'external_urls' => ['apple_music' => $activity->track_url],
                    ],
                    'played_at' => $activity->started_at->toIso8601String(),
                ];
            });

        return response()->json(['items' => $recentTracks]);
    }
}
