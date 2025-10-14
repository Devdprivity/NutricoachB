<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserMuscleFatigue extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'muscle_group',
        'last_worked_date',
        'intensity_level',
    ];

    protected $casts = [
        'last_worked_date' => 'date',
    ];

    /**
     * Relación con el usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Obtener días desde que se trabajó el músculo
     */
    public function getDaysSinceWorked(): int
    {
        return Carbon::parse($this->last_worked_date)->diffInDays(now());
    }

    /**
     * Verificar si el músculo está descansado (>48 horas)
     */
    public function isRested(): bool
    {
        return $this->getDaysSinceWorked() >= 2;
    }

    /**
     * Obtener músculos descansados para un usuario
     */
    public static function getRestedMuscles($userId)
    {
        return static::where('user_id', $userId)
            ->whereDate('last_worked_date', '<=', now()->subDays(2))
            ->pluck('muscle_group');
    }

    /**
     * Registrar trabajo muscular
     */
    public static function recordWorkout($userId, $muscleGroup, $intensityLevel = 3)
    {
        return static::updateOrCreate(
            [
                'user_id' => $userId,
                'muscle_group' => $muscleGroup,
            ],
            [
                'last_worked_date' => now(),
                'intensity_level' => $intensityLevel,
            ]
        );
    }
}
