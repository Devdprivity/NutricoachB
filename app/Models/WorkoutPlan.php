<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkoutPlan extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'difficulty',
        'duration_weeks',
        'schedule',
        'goal',
        'is_active',
        'is_public',
        'times_completed',
    ];

    protected $casts = [
        'schedule' => 'array',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
        'times_completed' => 'integer',
        'duration_weeks' => 'integer',
    ];

    /**
     * Usuario propietario del plan
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Ejercicios del plan
     */
    public function exercises(): HasMany
    {
        return $this->hasMany(WorkoutExercise::class)->orderBy('order');
    }

    /**
     * Registros/logs de entrenamientos
     */
    public function logs(): HasMany
    {
        return $this->hasMany(WorkoutLog::class);
    }

    /**
     * Scope para planes activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para planes públicos
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope por dificultad
     */
    public function scopeByDifficulty($query, string $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }

    /**
     * Incrementar contador de completados
     */
    public function incrementCompleted(): void
    {
        $this->increment('times_completed');
    }

    /**
     * Obtener progreso del plan (% completado hoy)
     */
    public function getTodayProgressAttribute(): float
    {
        $today = now()->toDateString();
        $totalExercises = $this->exercises()->count();

        if ($totalExercises === 0) {
            return 0;
        }

        $completedToday = WorkoutLog::where('workout_plan_id', $this->id)
            ->whereDate('date', $today)
            ->where('completed', true)
            ->distinct('workout_exercise_id')
            ->count('workout_exercise_id');

        return round(($completedToday / $totalExercises) * 100, 1);
    }
}
