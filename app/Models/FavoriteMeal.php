<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FavoriteMeal extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'calories',
        'protein',
        'carbs',
        'fat',
        'fiber',
        'portion_size',
        'ingredients',
        'meal_type',
        'image_path',
        'tags',
        'times_used',
        'last_used_at',
    ];

    protected $casts = [
        'calories' => 'decimal:2',
        'protein' => 'decimal:2',
        'carbs' => 'decimal:2',
        'fat' => 'decimal:2',
        'fiber' => 'decimal:2',
        'ingredients' => 'array',
        'tags' => 'array',
        'last_used_at' => 'datetime',
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
    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image_path) {
            return null;
        }

        return asset('storage/' . $this->image_path);
    }

    /**
     * Incrementar contador de uso
     */
    public function incrementUsage(): void
    {
        $this->times_used++;
        $this->last_used_at = now();
        $this->save();
    }

    /**
     * Scope para obtener favoritos más usados
     */
    public function scopeMostUsed($query)
    {
        return $query->orderBy('times_used', 'desc');
    }

    /**
     * Scope para obtener favoritos por tipo de comida
     */
    public function scopeByMealType($query, string $type)
    {
        return $query->where('meal_type', $type);
    }

    /**
     * Scope para búsqueda por nombre o tags
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhereJsonContains('tags', $search);
        });
    }
}
