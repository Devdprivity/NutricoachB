<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MusicActivity extends Model
{
    protected $table = 'music_activity';

    protected $fillable = [
        'user_id',
        'music_provider', // 'spotify', 'youtube_music', 'apple_music'
        'track_id',
        'track_name',
        'artist_name',
        'album_name',
        'album_image_url',
        'track_url',
        'duration_ms',
        'progress_ms',
        'is_playing',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'is_playing' => 'boolean',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'duration_ms' => 'integer',
        'progress_ms' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope para actividad actualmente reproduciéndose
     */
    public function scopePlaying($query)
    {
        return $query->where('is_playing', true)
            ->whereNull('ended_at');
    }

    /**
     * Scope para actividad reciente
     */
    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
    }

    /**
     * Scope para filtrar por proveedor de música
     */
    public function scopeProvider($query, string $provider)
    {
        return $query->where('music_provider', $provider);
    }

    /**
     * Scope para Spotify
     */
    public function scopeSpotify($query)
    {
        return $query->where('music_provider', 'spotify');
    }

    /**
     * Scope para YouTube Music
     */
    public function scopeYouTubeMusic($query)
    {
        return $query->where('music_provider', 'youtube_music');
    }

    /**
     * Scope para Apple Music
     */
    public function scopeAppleMusic($query)
    {
        return $query->where('music_provider', 'apple_music');
    }
}
