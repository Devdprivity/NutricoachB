<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MealPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'meal_type',
        'food_item_id',
        'planned_quantity',
        'planned_unit',
        'planned_calories',
        'planned_protein',
        'planned_carbs',
        'planned_fat',
        'is_completed',
        'completed_at',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'planned_quantity' => 'decimal:2',
        'planned_calories' => 'integer',
        'planned_protein' => 'decimal:2',
        'planned_carbs' => 'decimal:2',
        'planned_fat' => 'decimal:2',
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    /**
     * Relación con el usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación con el alimento
     */
    public function foodItem(): BelongsTo
    {
        return $this->belongsTo(FoodItem::class);
    }

    /**
     * Scope para planes de un usuario específico
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope para planes de una fecha específica
     */
    public function scopeForDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }

    /**
     * Scope para planes completados
     */
    public function scopeCompleted($query)
    {
        return $query->where('is_completed', true);
    }

    /**
     * Scope para planes pendientes
     */
    public function scopePending($query)
    {
        return $query->where('is_completed', false);
    }

    /**
     * Scope para un tipo específico de comida
     */
    public function scopeForMealType($query, $mealType)
    {
        return $query->where('meal_type', $mealType);
    }

    /**
     * Marcar como completado
     */
    public function markAsCompleted()
    {
        $this->update([
            'is_completed' => true,
            'completed_at' => now()
        ]);
    }

    /**
     * Obtener resumen de plan diario
     */
    public static function getDailyPlanSummary($userId, $date)
    {
        return self::forUser($userId)
            ->forDate($date)
            ->selectRaw('
                SUM(planned_calories) as total_planned_calories,
                SUM(planned_protein) as total_planned_protein,
                SUM(planned_carbs) as total_planned_carbs,
                SUM(planned_fat) as total_planned_fat,
                COUNT(*) as total_planned_meals,
                SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_meals
            ')
            ->first();
    }

    /**
     * Calcular porcentaje de completitud del plan
     */
    public function getCompletionPercentage(): float
    {
        $totalMeals = self::forUser($this->user_id)
                          ->forDate($this->date)
                          ->count();
        
        $completedMeals = self::forUser($this->user_id)
                             ->forDate($this->date)
                             ->completed()
                             ->count();

        return $totalMeals > 0 ? round(($completedMeals / $totalMeals) * 100, 1) : 0;
    }
}