<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecipeIngredient extends Model
{
    protected $fillable = [
        'recipe_id',
        'name',
        'quantity',
        'unit',
        'notes',
        'order',
    ];

    protected $casts = [
        'quantity' => 'float',
        'order' => 'integer',
    ];

    /**
     * Receta a la que pertenece el ingrediente
     */
    public function recipe(): BelongsTo
    {
        return $this->belongsTo(Recipe::class);
    }
}
