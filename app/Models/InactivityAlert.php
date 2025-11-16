<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InactivityAlert extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'severity',
        'days_inactive',
        'last_activity_date',
        'message',
        'action_suggested',
        'is_resolved',
        'resolved_at',
        'metadata',
    ];

    protected $casts = [
        'last_activity_date' => 'date',
        'is_resolved' => 'boolean',
        'resolved_at' => 'datetime',
        'metadata' => 'array',
    ];

    // Tipos de inactividad
    public const TYPE_HYDRATION = 'hydration_inactivity';
    public const TYPE_MEAL = 'meal_inactivity';
    public const TYPE_EXERCISE = 'exercise_inactivity';
    public const TYPE_GENERAL = 'general_inactivity';
    public const TYPE_STREAK_BROKEN = 'streak_broken';

    // Niveles de severidad
    public const SEVERITY_INFO = 'info';
    public const SEVERITY_WARNING = 'warning';
    public const SEVERITY_CRITICAL = 'critical';

    // Relaciones
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes para consultas comunes
    public function scopeUnresolved($query)
    {
        return $query->where('is_resolved', false);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Métodos de utilidad
    public function resolve(): bool
    {
        $this->is_resolved = true;
        $this->resolved_at = now();
        return $this->save();
    }

    public function isCritical(): bool
    {
        return $this->severity === self::SEVERITY_CRITICAL;
    }

    public function isWarning(): bool
    {
        return $this->severity === self::SEVERITY_WARNING;
    }

    public function isInfo(): bool
    {
        return $this->severity === self::SEVERITY_INFO;
    }
}
