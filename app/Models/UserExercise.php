<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserExercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'exercise_id',
        'exercise_date',
        'duration_minutes',
        'calories_burned',
        'notes',
    ];

    protected $casts = [
        'exercise_date' => 'date',
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
     * Obtener ejercicios de un usuario en una fecha
     */
    public static function forUserOnDate($userId, $date)
    {
        return static::where('user_id', $userId)
            ->whereDate('exercise_date', $date)
            ->with('exercise')
            ->get();
    }

    /**
     * Obtener total de calorías quemadas en una fecha
     */
    public static function caloriesBurnedOnDate($userId, $date)
    {
        return static::where('user_id', $userId)
            ->whereDate('exercise_date', $date)
            ->sum('calories_burned');
    }
}
