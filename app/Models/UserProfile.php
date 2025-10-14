<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'height',
        'weight',
        'age',
        'gender',
        'activity_level',
        'daily_calorie_goal',
        'protein_goal',
        'carbs_goal',
        'fat_goal',
        'water_goal',
        'target_weight',
        'target_date',
        'medical_conditions',
        'dietary_restrictions',
        'is_medically_supervised',
    ];

    protected $casts = [
        'height' => 'decimal:2',
        'weight' => 'decimal:2',
        'target_weight' => 'decimal:2',
        'target_date' => 'date',
        'is_medically_supervised' => 'boolean',
    ];

    /**
     * Relación con el usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calcular IMC
     */
    public function getBmiAttribute(): ?float
    {
        if (!$this->height || !$this->weight) {
            return null;
        }

        $heightInMeters = $this->height / 100;
        return round($this->weight / ($heightInMeters * $heightInMeters), 2);
    }

    /**
     * Obtener categoría de IMC
     */
    public function getBmiCategoryAttribute(): ?string
    {
        $bmi = $this->bmi;
        
        if (!$bmi) {
            return null;
        }

        if ($bmi < 18.5) {
            return 'underweight';
        } elseif ($bmi < 25) {
            return 'normal';
        } elseif ($bmi < 30) {
            return 'overweight';
        } else {
            return 'obese';
        }
    }

    /**
     * Calcular calorías basales (BMR)
     */
    public function calculateBmr(): ?int
    {
        if (!$this->height || !$this->weight || !$this->age || !$this->gender) {
            return null;
        }

        // Fórmula Mifflin-St Jeor
        if ($this->gender === 'male') {
            return (int) (10 * $this->weight + 6.25 * $this->height - 5 * $this->age + 5);
        } else {
            return (int) (10 * $this->weight + 6.25 * $this->height - 5 * $this->age - 161);
        }
    }

    /**
     * Calcular calorías totales diarias (TDEE)
     */
    public function calculateTdee(): ?int
    {
        $bmr = $this->calculateBmr();
        
        if (!$bmr) {
            return null;
        }

        $activityMultipliers = [
            'sedentary' => 1.2,
            'light' => 1.375,
            'moderate' => 1.55,
            'active' => 1.725,
            'very_active' => 1.9,
        ];

        $multiplier = $activityMultipliers[$this->activity_level] ?? 1.55;
        
        return (int) ($bmr * $multiplier);
    }
}