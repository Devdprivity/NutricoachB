<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MealRecord extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'meal_type',
        'time',
        'image_path',
        'image_public_id',
        'calories',
        'protein',
        'carbs',
        'fat',
        'fiber',
        'food_items',
        'ai_description',
        'ai_analyzed',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'time' => 'datetime:H:i',
        'calories' => 'decimal:2',
        'protein' => 'decimal:2',
        'carbs' => 'decimal:2',
        'fat' => 'decimal:2',
        'fiber' => 'decimal:2',
        'ai_analyzed' => 'boolean',
    ];

    /**
     * Relación con el usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Obtener el total de calorías de macronutrientes
     */
    public function getCalculatedCaloriesAttribute(): float
    {
        return ($this->protein * 4) + ($this->carbs * 4) + ($this->fat * 9);
    }

    /**
     * Obtener porcentajes de macros
     */
    public function getMacroPercentagesAttribute(): array
    {
        $totalCals = $this->calories ?: $this->calculated_calories;

        if ($totalCals == 0) {
            return ['protein' => 0, 'carbs' => 0, 'fat' => 0];
        }

        return [
            'protein' => round((($this->protein * 4) / $totalCals) * 100, 1),
            'carbs' => round((($this->carbs * 4) / $totalCals) * 100, 1),
            'fat' => round((($this->fat * 9) / $totalCals) * 100, 1),
        ];
    }
}
