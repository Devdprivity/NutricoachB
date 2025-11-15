<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Recipe extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'category',
        'prep_time_minutes',
        'cook_time_minutes',
        'servings',
        'difficulty',
        'instructions',
        'image_url',
        'is_public',
        'calories_per_serving',
        'protein_g',
        'carbs_g',
        'fat_g',
        'fiber_g',
        'times_cooked',
        'rating',
    ];

    protected $casts = [
        'instructions' => 'array',
        'is_public' => 'boolean',
        'prep_time_minutes' => 'integer',
        'cook_time_minutes' => 'integer',
        'servings' => 'integer',
        'calories_per_serving' => 'integer',
        'protein_g' => 'float',
        'carbs_g' => 'float',
        'fat_g' => 'float',
        'fiber_g' => 'float',
        'times_cooked' => 'integer',
        'rating' => 'float',
    ];

    /**
     * Usuario creador de la receta
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Ingredientes de la receta
     */
    public function ingredients(): HasMany
    {
        return $this->hasMany(RecipeIngredient::class)->orderBy('order');
    }

    /**
     * Planes semanales que incluyen esta receta
     */
    public function weeklyMealPlans(): BelongsToMany
    {
        return $this->belongsToMany(WeeklyMealPlan::class, 'weekly_meal_plan_recipes')
            ->withPivot('day_of_week', 'meal_type', 'servings')
            ->withTimestamps();
    }

    /**
     * Scope para recetas públicas
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope por categoría
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope por dificultad
     */
    public function scopeByDifficulty($query, string $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }

    /**
     * Incrementar contador de veces cocinada
     */
    public function incrementTimesCooked(): void
    {
        $this->increment('times_cooked');
    }

    /**
     * Obtener tiempo total de preparación
     */
    public function getTotalTimeAttribute(): int
    {
        return ($this->prep_time_minutes ?? 0) + ($this->cook_time_minutes ?? 0);
    }
}
