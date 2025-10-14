<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HydrationRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'amount_ml',
        'time',
        'type',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'time' => 'datetime:H:i',
        'amount_ml' => 'integer',
    ];

    /**
     * Relación con el usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope para registros de un usuario específico
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope para registros de una fecha específica
     */
    public function scopeForDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }

    /**
     * Scope para registros de un rango de fechas
     */
    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope para un tipo específico de bebida
     */
    public function scopeForType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Obtener resumen diario de hidratación
     */
    public static function getDailySummary($userId, $date)
    {
        return self::forUser($userId)
            ->forDate($date)
            ->selectRaw('
                SUM(amount_ml) as total_amount_ml,
                COUNT(*) as total_records,
                AVG(amount_ml) as average_amount_ml
            ')
            ->first();
    }
}