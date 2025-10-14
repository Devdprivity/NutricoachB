<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NutritionalData extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'food_item_id',
        'consumption_date',
        'meal_type',
        'quantity',
        'unit',
        'calories',
        'protein',
        'carbs',
        'fat',
        'fiber',
        'sugar',
        'sodium',
        'notes',
        'mood',
        'energy_level',
        'hunger_level',
        'was_planned',
        'context',
    ];

    protected $casts = [
        'consumption_date' => 'date',
        'quantity' => 'decimal:2',
        'calories' => 'integer',
        'protein' => 'decimal:2',
        'carbs' => 'decimal:2',
        'fat' => 'decimal:2',
        'fiber' => 'decimal:2',
        'sugar' => 'decimal:2',
        'sodium' => 'decimal:2',
        'energy_level' => 'integer',
        'hunger_level' => 'integer',
        'was_planned' => 'boolean',
        'context' => 'array',
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
     * Scope para datos de un usuario específico
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope para datos de una fecha específica
     */
    public function scopeForDate($query, $date)
    {
        return $query->whereDate('consumption_date', $date);
    }

    /**
     * Scope para datos de un rango de fechas
     */
    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('consumption_date', [$startDate, $endDate]);
    }

    /**
     * Scope para un tipo de comida específico
     */
    public function scopeForMealType($query, $mealType)
    {
        return $query->where('meal_type', $mealType);
    }

    /**
     * Obtener resumen nutricional diario
     */
    public static function getDailySummary($userId, $date)
    {
        return self::forUser($userId)
            ->forDate($date)
            ->selectRaw('
                SUM(calories) as total_calories,
                SUM(protein) as total_protein,
                SUM(carbs) as total_carbs,
                SUM(fat) as total_fat,
                SUM(fiber) as total_fiber,
                SUM(sugar) as total_sugar,
                SUM(sodium) as total_sodium,
                COUNT(*) as total_entries
            ')
            ->first();
    }

    /**
     * Obtener resumen por tipo de comida
     */
    public static function getMealTypeSummary($userId, $date)
    {
        return self::forUser($userId)
            ->forDate($date)
            ->selectRaw('
                meal_type,
                SUM(calories) as calories,
                SUM(protein) as protein,
                SUM(carbs) as carbs,
                SUM(fat) as fat,
                COUNT(*) as entries
            ')
            ->groupBy('meal_type')
            ->get();
    }

    /**
     * Evaluar adherencia a objetivos (código de colores)
     */
    public function evaluateAdherence($userProfile): array
    {
        $dailySummary = self::getDailySummary($this->user_id, $this->consumption_date);
        
        if (!$dailySummary || !$userProfile) {
            return ['status' => 'unknown', 'message' => 'Datos insuficientes'];
        }

        $calorieDiff = abs($dailySummary->total_calories - $userProfile->daily_calorie_goal);
        $proteinDiff = abs($dailySummary->total_protein - $userProfile->protein_goal);
        $carbsDiff = abs($dailySummary->total_carbs - $userProfile->carbs_goal);
        $fatDiff = abs($dailySummary->total_fat - $userProfile->fat_goal);

        // Criterios de evaluación
        $calorieTolerance = 100;
        $macroTolerance = 15;

        if ($calorieDiff <= $calorieTolerance && 
            $proteinDiff <= $macroTolerance && 
            $carbsDiff <= $macroTolerance && 
            $fatDiff <= $macroTolerance) {
            return ['status' => 'green', 'message' => 'Dentro del rango objetivo'];
        } elseif ($calorieDiff <= 200 && 
                  $proteinDiff <= 25 && 
                  $carbsDiff <= 25 && 
                  $fatDiff <= 25) {
            return ['status' => 'yellow', 'message' => 'Ligeramente fuera del rango'];
        } else {
            return ['status' => 'red', 'message' => 'Significativamente fuera del rango'];
        }
    }
}