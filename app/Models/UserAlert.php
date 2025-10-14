<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'severity',
        'is_active',
        'is_dismissed',
        'dismissed_at',
        'expires_at',
    ];

    protected $casts = [
        'data' => 'array',
        'is_active' => 'boolean',
        'is_dismissed' => 'boolean',
        'dismissed_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Relación con el usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope para alertas de un usuario específico
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope para alertas activas
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where('is_dismissed', false)
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    /**
     * Scope para alertas no desestimadas
     */
    public function scopeNotDismissed($query)
    {
        return $query->where('is_dismissed', false);
    }

    /**
     * Scope para un tipo específico de alerta
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope para alertas por severidad
     */
    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    /**
     * Scope para alertas no leídas
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope para alertas leídas
     */
    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    /**
     * Marcar alerta como leída
     */
    public function markAsRead()
    {
        $this->update(['read_at' => now()]);
    }

    /**
     * Desestimar alerta
     */
    public function dismiss()
    {
        $this->update([
            'is_dismissed' => true,
            'dismissed_at' => now()
        ]);
    }

    /**
     * Verificar si la alerta está activa
     */
    public function isActive(): bool
    {
        return $this->is_active && !$this->is_dismissed && 
               (is_null($this->expires_at) || $this->expires_at > now());
    }

    /**
     * Verificar si la alerta está expirada
     */
    public function isExpired(): bool
    {
        return !is_null($this->expires_at) && $this->expires_at <= now();
    }

    /**
     * Activar alerta
     */
    public function activate()
    {
        $this->update([
            'is_active' => true,
            'is_dismissed' => false,
            'dismissed_at' => null
        ]);
    }

    /**
     * Desactivar alerta
     */
    public function deactivate()
    {
        $this->update([
            'is_active' => false
        ]);
    }
}