<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price_monthly',
        'price_yearly',
        'features',
        'max_recipes',
        'max_workout_plans',
        'max_meal_plans',
        'ai_coaching',
        'progress_analytics',
        'custom_recipes',
        'export_data',
        'priority_support',
        'is_active',
        'order',
    ];

    protected $casts = [
        'features' => 'array',
        'price_monthly' => 'float',
        'price_yearly' => 'float',
        'max_recipes' => 'integer',
        'max_workout_plans' => 'integer',
        'max_meal_plans' => 'integer',
        'ai_coaching' => 'boolean',
        'progress_analytics' => 'boolean',
        'custom_recipes' => 'boolean',
        'export_data' => 'boolean',
        'priority_support' => 'boolean',
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Suscripciones de este plan
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Usuarios con este plan
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'current_subscription_plan_id');
    }

    /**
     * Scope para planes activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('order');
    }

    /**
     * Verificar si es plan gratuito
     */
    public function isFree(): bool
    {
        return $this->slug === 'free';
    }

    /**
     * Obtener precio según ciclo
     */
    public function getPrice(string $cycle = 'monthly'): float
    {
        return $cycle === 'yearly' ? $this->price_yearly : $this->price_monthly;
    }

    /**
     * Calcular ahorro anual
     */
    public function getYearlySavingsAttribute(): float
    {
        $monthlyYearly = $this->price_monthly * 12;
        return $monthlyYearly - $this->price_yearly;
    }

    /**
     * Porcentaje de descuento anual
     */
    public function getYearlyDiscountPercentageAttribute(): float
    {
        if ($this->price_monthly == 0) {
            return 0;
        }
        $monthlyYearly = $this->price_monthly * 12;
        return round((($monthlyYearly - $this->price_yearly) / $monthlyYearly) * 100, 0);
    }
}
