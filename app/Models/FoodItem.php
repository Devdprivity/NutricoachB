<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FoodItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'calories_per_100g',
        'protein_per_100g',
        'carbs_per_100g',
        'fat_per_100g',
        'fiber_per_100g',
        'sugar_per_100g',
        'sodium_per_100g',
        'unit',
        'is_cooked',
        'cooking_method',
        'tags',
        'is_active',
    ];

    protected $casts = [
        'calories_per_100g' => 'integer',
        'protein_per_100g' => 'decimal:2',
        'carbs_per_100g' => 'decimal:2',
        'fat_per_100g' => 'decimal:2',
        'fiber_per_100g' => 'decimal:2',
        'sugar_per_100g' => 'decimal:2',
        'sodium_per_100g' => 'decimal:2',
        'is_cooked' => 'boolean',
        'tags' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Relación con datos nutricionales
     */
    public function nutritionalData(): HasMany
    {
        return $this->hasMany(NutritionalData::class);
    }

    /**
     * Scope para alimentos activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para buscar por categoría
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope para buscar por nombre
     */
    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
    }

    /**
     * Calcular valores nutricionales para una cantidad específica
     */
    public function calculateNutritionForQuantity(float $quantity): array
    {
        $multiplier = $quantity / 100; // asumiendo que la cantidad está en gramos

        return [
            'calories' => (int) round($this->calories_per_100g * $multiplier),
            'protein' => round($this->protein_per_100g * $multiplier, 2),
            'carbs' => round($this->carbs_per_100g * $multiplier, 2),
            'fat' => round($this->fat_per_100g * $multiplier, 2),
            'fiber' => round($this->fiber_per_100g * $multiplier, 2),
            'sugar' => round($this->sugar_per_100g * $multiplier, 2),
            'sodium' => round($this->sodium_per_100g * $multiplier, 2),
        ];
    }

    /**
     * Obtener alimentos por etiquetas
     */
    public function scopeByTags($query, array $tags)
    {
        return $query->where(function ($q) use ($tags) {
            foreach ($tags as $tag) {
                $q->orWhereJsonContains('tags', $tag);
            }
        });
    }

    /**
     * Obtener alimentos ricos en proteína
     */
    public function scopeHighProtein($query)
    {
        return $query->where('protein_per_100g', '>=', 20);
    }

    /**
     * Obtener alimentos bajos en carbohidratos
     */
    public function scopeLowCarb($query)
    {
        return $query->where('carbs_per_100g', '<=', 10);
    }

    /**
     * Obtener alimentos saludables
     */
    public function scopeHealthy($query)
    {
        return $query->whereJsonContains('tags', 'healthy');
    }
}