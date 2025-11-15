<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Activity extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'description',
        'data',
        'image_url',
        'visibility',
        'likes_count',
        'comments_count',
    ];

    protected $casts = [
        'data' => 'array',
        'likes_count' => 'integer',
        'comments_count' => 'integer',
    ];

    /**
     * Usuario que creó la actividad
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Likes de la actividad
     */
    public function likes(): HasMany
    {
        return $this->hasMany(ActivityLike::class);
    }

    /**
     * Verificar si un usuario ha dado like a esta actividad
     */
    public function isLikedBy(?User $user): bool
    {
        if (!$user) {
            return false;
        }

        return $this->likes()->where('user_id', $user->id)->exists();
    }

    /**
     * Scope para actividades públicas
     */
    public function scopePublic($query)
    {
        return $query->where('visibility', 'public');
    }

    /**
     * Scope para actividades de seguidores
     */
    public function scopeFollowersOnly($query)
    {
        return $query->where('visibility', 'followers');
    }

    /**
     * Scope para ordenar por más recientes
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Scope para feed de un usuario (sus actividades + actividades de quien sigue)
     */
    public function scopeFeedFor($query, User $user)
    {
        $followingIds = $user->following()->pluck('following_id')->toArray();
        $followingIds[] = $user->id; // Incluir actividades del propio usuario

        return $query->whereIn('user_id', $followingIds)
            ->where(function ($q) use ($user) {
                $q->where('visibility', 'public')
                    ->orWhere(function ($subQ) use ($user) {
                        $subQ->where('visibility', 'followers')
                            ->whereIn('user_id', $user->following()->pluck('following_id'));
                    })
                    ->orWhere('user_id', $user->id); // Siempre ver propias actividades
            });
    }
}
