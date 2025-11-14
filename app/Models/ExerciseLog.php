<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExerciseLog extends Model
{
    protected $fillable = [
        'user_id',
        'exercise_id',
        'date',
        'start_time',
        'end_time',
        'duration_minutes',
        'calories_burned',
        'intensity',
        'notes',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'duration_minutes' => 'integer',
        'calories_burned' => 'decimal:2',
        'intensity' => 'integer',
    ];

    /**
     * Relación con el usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación con el ejercicio
     */
    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }

    /**
     * Calcular calorías quemadas basándose en el ejercicio y duración
     */
    public function calculateCaloriesBurned(): float
    {
        return $this->exercise->calories_per_minute * $this->duration_minutes;
    }
}
