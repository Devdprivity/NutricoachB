<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
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
        'google_id',
        'avatar',
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

    /**
     * Obtener contador de usuarios que sigue
     */
    public function getFollowingCountAttribute(): int
    {
        return $this->following()->count();
    }
}
