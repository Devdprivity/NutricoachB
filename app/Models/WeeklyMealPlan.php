<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class WeeklyMealPlan extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'start_date',
        'end_date',
        'daily_schedule',
        'target_calories',
        'target_protein_g',
        'target_carbs_g',
        'target_fat_g',
        'goal',
        'is_active',
        'is_public',
        'times_completed',
    ];

    protected $casts = [
        'daily_schedule' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
        'target_calories' => 'integer',
        'target_protein_g' => 'float',
        'target_carbs_g' => 'float',
        'target_fat_g' => 'float',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
        'times_completed' => 'integer',
    ];

    /**
     * Usuario propietario del plan
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Recetas incluidas en el plan
     */
    public function recipes(): BelongsToMany
    {
        return $this->belongsToMany(Recipe::class, 'weekly_meal_plan_recipes')
            ->withPivot('day_of_week', 'meal_type', 'servings')
            ->withTimestamps();
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
     * Scope por objetivo
     */
    public function scopeByGoal($query, string $goal)
    {
        return $query->where('goal', $goal);
    }

    /**
     * Incrementar contador de completados
     */
    public function incrementCompleted(): void
    {
        $this->increment('times_completed');
    }

    /**
     * Verificar si el plan está actualmente vigente
     */
    public function isCurrentlyActive(): bool
    {
        $today = now()->toDateString();
        return $this->is_active &&
               $this->start_date <= $today &&
               $this->end_date >= $today;
    }

    /**
     * Obtener duración del plan en días
     */
    public function getDurationDaysAttribute(): int
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }
}
