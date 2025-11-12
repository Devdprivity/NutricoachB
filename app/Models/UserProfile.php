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
        'body_frame',
        'body_type',
        'wrist_circumference',
        'waist_circumference',
        'hip_circumference',
        'neck_circumference',
        'body_fat_percentage',
        'muscle_mass_percentage',
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
        'wrist_circumference' => 'decimal:2',
        'waist_circumference' => 'decimal:2',
        'hip_circumference' => 'decimal:2',
        'neck_circumference' => 'decimal:2',
        'body_fat_percentage' => 'decimal:2',
        'muscle_mass_percentage' => 'decimal:2',
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

    /**
     * Calcular contextura física automáticamente basada en circunferencia de muñeca
     * Método: r-value (ratio muñeca/altura)
     */
    public function calculateBodyFrame(): ?string
    {
        if (!$this->wrist_circumference || !$this->height) {
            return null;
        }

        // r-value = altura (cm) / circunferencia muñeca (cm)
        $rValue = $this->height / $this->wrist_circumference;

        // Rangos según género
        if ($this->gender === 'male') {
            if ($rValue > 10.4) {
                return 'small';
            } elseif ($rValue >= 9.6 && $rValue <= 10.4) {
                return 'medium';
            } else {
                return 'large';
            }
        } else { // female
            if ($rValue > 11.0) {
                return 'small';
            } elseif ($rValue >= 10.1 && $rValue <= 11.0) {
                return 'medium';
            } else {
                return 'large';
            }
        }
    }

    /**
     * Estimar porcentaje de grasa corporal usando método US Navy
     */
    public function estimateBodyFat(): ?float
    {
        if (!$this->waist_circumference || !$this->neck_circumference || !$this->height) {
            return null;
        }

        if ($this->gender === 'male') {
            // Fórmula US Navy para hombres
            $bodyFat = 495 / (1.0324 - 0.19077 * log10($this->waist_circumference - $this->neck_circumference)
                        + 0.15456 * log10($this->height)) - 450;
        } else {
            // Para mujeres necesitamos también la circunferencia de cadera
            if (!$this->hip_circumference) {
                return null;
            }

            // Fórmula US Navy para mujeres
            $bodyFat = 495 / (1.29579 - 0.35004 * log10($this->waist_circumference + $this->hip_circumference - $this->neck_circumference)
                        + 0.22100 * log10($this->height)) - 450;
        }

        return round($bodyFat, 2);
    }

    /**
     * Calcular ratio cintura/cadera (WHR)
     */
    public function getWaistToHipRatioAttribute(): ?float
    {
        if (!$this->waist_circumference || !$this->hip_circumference) {
            return null;
        }

        return round($this->waist_circumference / $this->hip_circumference, 2);
    }

    /**
     * Categoría del ratio cintura/cadera
     */
    public function getWhrCategoryAttribute(): ?string
    {
        $whr = $this->waist_to_hip_ratio;

        if (!$whr) {
            return null;
        }

        if ($this->gender === 'male') {
            if ($whr < 0.90) {
                return 'low_risk';
            } elseif ($whr <= 0.99) {
                return 'moderate_risk';
            } else {
                return 'high_risk';
            }
        } else { // female
            if ($whr < 0.80) {
                return 'low_risk';
            } elseif ($whr <= 0.85) {
                return 'moderate_risk';
            } else {
                return 'high_risk';
            }
        }
    }

    /**
     * Obtener rango de peso ideal según contextura física
     */
    public function getIdealWeightRange(): ?array
    {
        if (!$this->height) {
            return null;
        }

        // Peso ideal base según fórmula de Devine
        $heightInInches = $this->height / 2.54;

        if ($this->gender === 'male') {
            $idealWeight = 50 + 2.3 * ($heightInInches - 60);
        } else {
            $idealWeight = 45.5 + 2.3 * ($heightInInches - 60);
        }

        // Ajustar según contextura física
        $bodyFrame = $this->body_frame ?? $this->calculateBodyFrame();

        $adjustments = [
            'small' => ['min' => 0.90, 'max' => 1.00],
            'medium' => ['min' => 0.95, 'max' => 1.05],
            'large' => ['min' => 1.00, 'max' => 1.10],
        ];

        $adjustment = $adjustments[$bodyFrame] ?? $adjustments['medium'];

        return [
            'min' => round($idealWeight * $adjustment['min'], 2),
            'max' => round($idealWeight * $adjustment['max'], 2),
            'frame' => $bodyFrame,
        ];
    }

    /**
     * Obtener descripción de la contextura física
     */
    public function getBodyFrameDescriptionAttribute(): ?string
    {
        $frame = $this->body_frame ?? $this->calculateBodyFrame();

        if (!$frame) {
            return null;
        }

        $descriptions = [
            'small' => 'Contextura delgada - estructura ósea fina',
            'medium' => 'Contextura media - estructura ósea promedio',
            'large' => 'Contextura robusta - estructura ósea amplia',
        ];

        return $descriptions[$frame] ?? null;
    }

    /**
     * Obtener descripción del tipo de cuerpo
     */
    public function getBodyTypeDescriptionAttribute(): ?string
    {
        if (!$this->body_type) {
            return null;
        }

        $descriptions = [
            'ectomorph' => 'Ectomorfo - metabolismo rápido, dificulta ganar peso',
            'mesomorph' => 'Mesomorfo - estructura atlética, gana músculo fácilmente',
            'endomorph' => 'Endomorfo - metabolismo lento, tendencia a ganar peso',
        ];

        return $descriptions[$this->body_type] ?? null;
    }

    /**
     * Obtener categoría de grasa corporal
     */
    public function getBodyFatCategoryAttribute(): ?string
    {
        $bodyFat = $this->body_fat_percentage ?? $this->estimateBodyFat();

        if (!$bodyFat) {
            return null;
        }

        if ($this->gender === 'male') {
            if ($bodyFat < 6) {
                return 'essential';
            } elseif ($bodyFat < 14) {
                return 'athletes';
            } elseif ($bodyFat < 18) {
                return 'fitness';
            } elseif ($bodyFat < 25) {
                return 'average';
            } else {
                return 'obese';
            }
        } else { // female
            if ($bodyFat < 14) {
                return 'essential';
            } elseif ($bodyFat < 21) {
                return 'athletes';
            } elseif ($bodyFat < 25) {
                return 'fitness';
            } elseif ($bodyFat < 32) {
                return 'average';
            } else {
                return 'obese';
            }
        }
    }
}