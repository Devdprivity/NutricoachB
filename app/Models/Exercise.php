<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'difficulty',
        'calories_per_minute',
        'image_url',
        'video_url',
        'muscles_worked',
        'instructions',
        'equipment',
        'duration_minutes',
    ];

    protected $casts = [
        'calories_per_minute' => 'decimal:2',
        'duration_minutes' => 'integer',
    ];

    /**
     * Relación con registros de ejercicios
     */
    public function logs(): HasMany
    {
        return $this->hasMany(ExerciseLog::class);
    }

    /**
     * Estimación de calorías para una duración específica
     */
    public function estimateCalories(int $minutes): int
    {
        return $this->calories_per_minute * $minutes;
    }

    /**
     * Obtener ejercicios por categoría
     */
    public static function byCategory(string $category)
    {
        return static::where('category', $category)->get();
    }

    /**
     * Obtener ejercicios por dificultad
     */
    public static function byDifficulty(string $difficulty)
    {
        return static::where('difficulty', $difficulty)->get();
    }
}
