<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgressPhoto extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'image_path',
        'weight',
        'body_fat_percentage',
        'measurements',
        'notes',
        'visibility',
        'is_baseline',
    ];

    protected $casts = [
        'date' => 'date',
        'weight' => 'decimal:2',
        'body_fat_percentage' => 'decimal:2',
        'measurements' => 'array',
        'is_baseline' => 'boolean',
    ];

    /**
     * Relación con el usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Obtener URL de la imagen
     */
    public function getImageUrlAttribute(): string
    {
        return asset('storage/' . $this->image_path);
    }

    /**
     * Calcular días desde la foto baseline
     */
    public function getDaysSinceBaselineAttribute(): ?int
    {
        $baseline = self::where('user_id', $this->user_id)
            ->where('is_baseline', true)
            ->first();

        if (!$baseline) {
            return null;
        }

        return $baseline->date->diffInDays($this->date);
    }

    /**
     * Calcular cambio de peso desde baseline
     */
    public function getWeightChangeAttribute(): ?float
    {
        if (!$this->weight) {
            return null;
        }

        $baseline = self::where('user_id', $this->user_id)
            ->where('is_baseline', true)
            ->first();

        if (!$baseline || !$baseline->weight) {
            return null;
        }

        return round($this->weight - $baseline->weight, 2);
    }
}
