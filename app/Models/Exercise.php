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
        'type',
        'muscle',
        'equipment',
        'difficulty',
        'instructions',
        'image_url',
        'calories_per_minute',
    ];

    /**
     * Relación con ejercicios de usuarios
     */
    public function userExercises(): HasMany
    {
        return $this->hasMany(UserExercise::class);
    }

    /**
     * Estimación de calorías para una duración específica
     */
    public function estimateCalories(int $minutes): int
    {
        return $this->calories_per_minute * $minutes;
    }

    /**
     * Obtener ejercicios por grupo muscular
     */
    public static function byMuscle(string $muscle)
    {
        return static::where('muscle', $muscle)->get();
    }

    /**
     * Obtener ejercicios por dificultad
     */
    public static function byDifficulty(string $difficulty)
    {
        return static::where('difficulty', $difficulty)->get();
    }

    /**
     * Obtener ejercicios por tipo
     */
    public static function byType(string $type)
    {
        return static::where('type', $type)->get();
    }
}
