<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserContext extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'context_type',
        'description',
        'stress_level',
        'energy_level',
        'mood_level',
        'additional_data',
        'affects_nutrition',
    ];

    protected $casts = [
        'date' => 'date',
        'stress_level' => 'integer',
        'energy_level' => 'integer',
        'mood_level' => 'integer',
        'additional_data' => 'array',
        'affects_nutrition' => 'boolean',
    ];

    /**
     * Relación con el usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope para contextos de un usuario específico
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope para contextos de una fecha específica
     */
    public function scopeForDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }

    /**
     * Scope para un tipo específico de contexto
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('context_type', $type);
    }

    /**
     * Obtener tolerancia ajustada por contexto
     */
    public function getAdjustedTolerance(): array
    {
        $baseTolerance = [
            'calories' => 100,
            'macros' => 15
        ];

        switch ($this->context_type) {
            case 'stressful_day':
                return [
                    'calories' => $baseTolerance['calories'] * 1.5,
                    'macros' => $baseTolerance['macros'] * 1.3
                ];
            case 'weekend':
                return [
                    'calories' => $baseTolerance['calories'] * 1.2,
                    'macros' => $baseTolerance['macros'] * 1.2
                ];
            case 'illness':
                return [
                    'calories' => $baseTolerance['calories'] * 2.0,
                    'macros' => $baseTolerance['macros'] * 1.5
                ];
            case 'travel':
                return [
                    'calories' => $baseTolerance['calories'] * 1.8,
                    'macros' => $baseTolerance['macros'] * 1.4
                ];
            default:
                return $baseTolerance;
        }
    }
}