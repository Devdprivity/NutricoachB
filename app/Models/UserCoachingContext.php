<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCoachingContext extends Model
{
    protected $fillable = [
        'user_id',
        'nutrition_summary',
        'exercise_summary',
        'hydration_summary',
        'goals',
        'preferences',
        'last_coaching_summary',
        'last_updated_at',
    ];

    protected $casts = [
        'nutrition_summary' => 'array',
        'exercise_summary' => 'array',
        'hydration_summary' => 'array',
        'goals' => 'array',
        'preferences' => 'array',
        'last_updated_at' => 'datetime',
    ];

    /**
     * Relación con el usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
