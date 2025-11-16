<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'address',
        'google_id',
        'avatar',
        'avatar_public_id',
        'current_subscription_plan_id',
        'is_premium',
        // Spotify
        'spotify_id',
        'spotify_access_token',
        'spotify_refresh_token',
        'spotify_token_expires_at',
        'spotify_share_listening',
        // YouTube Music
        'youtube_music_id',
        'youtube_music_access_token',
        'youtube_music_refresh_token',
        'youtube_music_token_expires_at',
        // Apple Music
        'apple_music_id',
        'apple_music_user_token',
        'apple_music_developer_token',
        'apple_music_token_expires_at',
        // Preferred music service
        'preferred_music_service',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factory_recovery_codes',
        'remember_token',
        'spotify_access_token',
        'spotify_refresh_token',
        'youtube_music_access_token',
        'youtube_music_refresh_token',
        'apple_music_user_token',
        'apple_music_developer_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_premium' => 'boolean',
            'spotify_token_expires_at' => 'datetime',
            'spotify_share_listening' => 'boolean',
            'youtube_music_token_expires_at' => 'datetime',
            'apple_music_token_expires_at' => 'datetime',
        ];
    }

    /**
     * Relación con el perfil del usuario
     */
    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    /**
     * Relación con los datos nutricionales
     */
    public function nutritionalData(): HasMany
    {
        return $this->hasMany(NutritionalData::class);
    }

    /**
     * Relación con los registros de hidratación
     */
    public function hydrationRecords(): HasMany
    {
        return $this->hasMany(HydrationRecord::class);
    }

    /**
     * Relación con los registros de comidas
     */
    public function mealRecords(): HasMany
    {
        return $this->hasMany(MealRecord::class);
    }

    /**
     * Relación con los mensajes de coaching
     */
    public function coachingMessages(): HasMany
    {
        return $this->hasMany(CoachingMessage::class);
    }

    /**
     * Relación con las alertas del usuario
     */
    public function alerts(): HasMany
    {
        return $this->hasMany(UserAlert::class);
    }

    /**
     * Relación con los contextos del usuario
     */
    public function contexts(): HasMany
    {
        return $this->hasMany(UserContext::class);
    }

    /**
     * Relación con los planes de comida
     */
    public function mealPlans(): HasMany
    {
        return $this->hasMany(MealPlan::class);
    }

    /**
     * Relación con los disclaimers médicos
     */
    public function medicalDisclaimers(): HasMany
    {
        return $this->hasMany(MedicalDisclaimer::class);
    }

    /**
     * Obtener datos nutricionales de una fecha específica
     */
    public function getNutritionalDataForDate($date)
    {
        return $this->nutritionalData()->whereDate('consumption_date', $date)->get();
    }

    /**
     * Obtener resumen nutricional diario
     */
    public function getDailyNutritionSummary($date)
    {
        return NutritionalData::getDailySummary($this->id, $date);
    }

    /**
     * Verificar si el usuario tiene perfil completo
     */
    public function hasCompleteProfile(): bool
    {
        return $this->profile &&
               $this->profile->height &&
               $this->profile->weight &&
               $this->profile->age &&
               $this->profile->gender;
    }

    // ========== RELACIONES SOCIALES ==========

    /**
     * Usuarios que este usuario sigue
     */
    public function following(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_follows', 'follower_id', 'following_id')
            ->withTimestamps();
    }

    /**
     * Usuarios que siguen a este usuario
     */
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_follows', 'following_id', 'follower_id')
            ->withTimestamps();
    }

    /**
     * Actividades del usuario
     */
    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    /**
     * Likes dados por el usuario
     */
    public function activityLikes(): HasMany
    {
        return $this->hasMany(ActivityLike::class);
    }

    /**
     * Verificar si este usuario sigue a otro usuario
     */
    public function isFollowing(User $user): bool
    {
        return $this->following()->where('following_id', $user->id)->exists();
    }

    /**
     * Verificar si este usuario es seguido por otro usuario
     */
    public function isFollowedBy(User $user): bool
    {
        return $this->followers()->where('follower_id', $user->id)->exists();
    }

    /**
     * Seguir a un usuario
     */
    public function follow(User $user): void
    {
        if (!$this->isFollowing($user) && $this->id !== $user->id) {
            $this->following()->attach($user->id);
        }
    }

    /**
     * Dejar de seguir a un usuario
     */
    public function unfollow(User $user): void
    {
        $this->following()->detach($user->id);
    }

    /**
     * Obtener contador de seguidores
     */
    public function getFollowersCountAttribute(): int
    {
        return $this->followers()->count();
    }

    // ========== RELACIONES DE SUSCRIPCIÓN ==========

    /**
     * Plan de suscripción actual
     */
    public function currentSubscriptionPlan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'current_subscription_plan_id');
    }

    /**
     * Todas las suscripciones del usuario
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Suscripción activa actual
     */
    public function activeSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->where('end_date', '>=', now())
            ->latest();
    }

    /**
     * Historial de pagos
     */
    public function paymentHistory(): HasMany
    {
        return $this->hasMany(PaymentHistory::class);
    }

    /**
     * Verificar si el usuario tiene una suscripción activa
     */
    public function hasActiveSubscription(): bool
    {
        return $this->activeSubscription()->exists();
    }

    /**
     * Verificar si el usuario es premium
     */
    public function isPremium(): bool
    {
        return $this->is_premium && $this->hasActiveSubscription();
    }

    /**
     * Verificar si puede acceder a una característica
     */
    public function canAccess(string $feature): bool
    {
        if (!$this->currentSubscriptionPlan) {
            return false;
        }

        return $this->currentSubscriptionPlan->$feature ?? false;
    }

    // ========== RELACIONES DE SPOTIFY ==========

    /**
     * Actividad musical del usuario
     */
    public function musicActivity(): HasMany
    {
        return $this->hasMany(MusicActivity::class);
    }

    /**
     * Actividad musical actual (reproduciéndose ahora)
     */
    public function currentlyPlaying(): HasOne
    {
        return $this->hasOne(MusicActivity::class)
            ->where('is_playing', true)
            ->whereNull('ended_at')
            ->latest('started_at');
    }

    /**
     * Verificar si tiene Spotify conectado
     */
    public function hasSpotifyConnected(): bool
    {
        return !is_null($this->spotify_id) && !is_null($this->spotify_access_token);
    }

    /**
     * Verificar si tiene YouTube Music conectado
     */
    public function hasYouTubeMusicConnected(): bool
    {
        return !is_null($this->youtube_music_id) && !is_null($this->youtube_music_access_token);
    }

    /**
     * Verificar si tiene Apple Music conectado
     */
    public function hasAppleMusicConnected(): bool
    {
        return !is_null($this->apple_music_id) && !is_null($this->apple_music_user_token);
    }

    /**
     * Verificar si tiene algún servicio de música conectado
     */
    public function hasAnyMusicServiceConnected(): bool
    {
        return $this->hasSpotifyConnected() ||
               $this->hasYouTubeMusicConnected() ||
               $this->hasAppleMusicConnected();
    }

    /**
     * Obtener el servicio de música activo basado en la preferencia
     */
    public function getActiveMusicService(): ?string
    {
        if ($this->preferred_music_service) {
            return $this->preferred_music_service;
        }

        // Fallback: retornar el primer servicio conectado
        if ($this->hasSpotifyConnected()) {
            return 'spotify';
        }
        if ($this->hasYouTubeMusicConnected()) {
            return 'youtube_music';
        }
        if ($this->hasAppleMusicConnected()) {
            return 'apple_music';
        }

        return null;
    }

    /**
     * Obtener contador de usuarios que sigue
     */
    public function getFollowingCountAttribute(): int
    {
        return $this->following()->count();
    }

    // ========== RELACIONES DE NOTIFICACIONES ==========

    /**
     * Notificaciones del usuario
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Notificaciones no leídas
     */
    public function unreadNotifications(): HasMany
    {
        return $this->hasMany(Notification::class)->where('is_read', false);
    }

    /**
     * Contar notificaciones no leídas
     */
    public function getUnreadNotificationsCountAttribute(): int
    {
        return $this->unreadNotifications()->count();
    }

    // ========== RELACIONES DE ALERTAS DE INACTIVIDAD ==========

    /**
     * Alertas de inactividad del usuario
     */
    public function inactivityAlerts(): HasMany
    {
        return $this->hasMany(InactivityAlert::class);
    }

    /**
     * Alertas de inactividad no resueltas
     */
    public function unresolvedInactivityAlerts(): HasMany
    {
        return $this->hasMany(InactivityAlert::class)->where('is_resolved', false);
    }
}
