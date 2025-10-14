<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalDisclaimer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'disclaimer_text',
        'is_accepted',
        'accepted_at',
        'ip_address',
        'user_agent',
        'version',
    ];

    protected $casts = [
        'is_accepted' => 'boolean',
        'accepted_at' => 'datetime',
    ];

    /**
     * Relación con el usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope para disclaimers de un usuario específico
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope para disclaimers aceptados
     */
    public function scopeAccepted($query)
    {
        return $query->where('is_accepted', true);
    }

    /**
     * Scope para disclaimers no aceptados
     */
    public function scopeNotAccepted($query)
    {
        return $query->where('is_accepted', false);
    }

    /**
     * Scope para una versión específica
     */
    public function scopeForVersion($query, $version)
    {
        return $query->where('version', $version);
    }

    /**
     * Verificar si el usuario ha aceptado el disclaimer actual
     */
    public static function hasAcceptedCurrentVersion($userId, $version = '1.0'): bool
    {
        return self::forUser($userId)
                  ->forVersion($version)
                  ->accepted()
                  ->exists();
    }

    /**
     * Obtener el último disclaimer aceptado
     */
    public static function getLastAccepted($userId)
    {
        return self::forUser($userId)
                  ->accepted()
                  ->orderBy('accepted_at', 'desc')
                  ->first();
    }
}