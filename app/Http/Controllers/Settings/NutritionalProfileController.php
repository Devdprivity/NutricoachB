<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\UserProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class NutritionalProfileController extends Controller
{
    /**
     * Show the user's nutritional profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $profile = $user->profile;

        $profileData = null;

        if ($profile) {
            $profileData = [
                'profile' => $profile,
                'bmi' => $profile->bmi,
                'bmi_category' => $profile->bmi_category,
                'bmr' => $profile->calculateBmr(),
                'tdee' => $profile->calculateTdee(),
                'body_composition' => [
                    'body_frame' => $profile->body_frame ?? $profile->calculateBodyFrame(),
                    'body_frame_description' => $profile->body_frame_description,
                    'body_type' => $profile->body_type,
                    'body_type_description' => $profile->body_type_description,
                    'body_fat_percentage' => $profile->body_fat_percentage ?? $profile->estimateBodyFat(),
                    'body_fat_category' => $profile->body_fat_category,
                    'waist_to_hip_ratio' => $profile->waist_to_hip_ratio,
                    'whr_category' => $profile->whr_category,
                    'ideal_weight_range' => $profile->getIdealWeightRange(),
                ],
            ];
        }

        return Inertia::render('settings/nutritional-profile', [
            'profileData' => $profileData,
        ]);
    }

    /**
     * Update the user's nutritional profile.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'height' => 'required|numeric|min:100|max:250',
            'weight' => 'required|numeric|min:30|max:300',
            'age' => 'required|integer|min:16|max:100',
            'gender' => ['required', Rule::in(['male', 'female', 'other'])],
            'activity_level' => ['required', Rule::in(['sedentary', 'light', 'moderate', 'active', 'very_active'])],
            'body_frame' => ['nullable', Rule::in(['small', 'medium', 'large'])],
            'body_type' => ['nullable', Rule::in(['ectomorph', 'mesomorph', 'endomorph'])],
            'wrist_circumference' => 'nullable|numeric|min:10|max:30',
            'waist_circumference' => 'nullable|numeric|min:40|max:200',
            'hip_circumference' => 'nullable|numeric|min:50|max:200',
            'neck_circumference' => 'nullable|numeric|min:20|max:60',
            'body_fat_percentage' => 'nullable|numeric|min:3|max:60',
            'muscle_mass_percentage' => 'nullable|numeric|min:20|max:70',
            'daily_calorie_goal' => 'nullable|integer|min:800|max:5000',
            'protein_goal' => 'nullable|integer|min:20|max:500',
            'carbs_goal' => 'nullable|integer|min:50|max:800',
            'fat_goal' => 'nullable|integer|min:20|max:300',
            'water_goal' => 'nullable|integer|min:1000|max:10000',
            'target_weight' => 'nullable|numeric|min:30|max:300',
            'target_date' => 'nullable|date|after:today',
            'medical_conditions' => 'nullable|string|max:1000',
            'dietary_restrictions' => 'nullable|string|max:1000',
            'is_medically_supervised' => 'nullable|boolean',
        ]);

        $user = $request->user();

        // Si no se proporcionaron metas nutricionales, calcularlas automáticamente
        if (! isset($validated['daily_calorie_goal'])) {
            $bmr = $this->calculateBmr($validated);
            $tdee = $this->calculateTdee($bmr, $validated['activity_level']);

            // Ajustar calorías si hay objetivo de peso
            $calorieGoal = $tdee;
            if (isset($validated['target_weight']) && $validated['target_weight'] < $validated['weight']) {
                $weightDiff = $validated['weight'] - $validated['target_weight'];
                $weeksToTarget = isset($validated['target_date']) ?
                    ceil((strtotime($validated['target_date']) - time()) / (7 * 24 * 60 * 60)) : 52;

                if ($weeksToTarget > 0) {
                    $weeklyDeficit = ($weightDiff * 7700) / $weeksToTarget;
                    $dailyDeficit = $weeklyDeficit / 7;
                    $calorieGoal = max($tdee - $dailyDeficit, $bmr * 1.1);
                }
            } elseif (isset($validated['target_weight']) && $validated['target_weight'] > $validated['weight']) {
                // Superávit para ganancia de peso
                $weightDiff = $validated['target_weight'] - $validated['weight'];
                $weeksToTarget = isset($validated['target_date']) ?
                    ceil((strtotime($validated['target_date']) - time()) / (7 * 24 * 60 * 60)) : 52;

                if ($weeksToTarget > 0) {
                    $weeklySurplus = ($weightDiff * 7700) / $weeksToTarget;
                    $dailySurplus = $weeklySurplus / 7;
                    $calorieGoal = $tdee + $dailySurplus;
                }
            }

            $validated['daily_calorie_goal'] = (int) $calorieGoal;

            // Calcular macronutrientes si no se proporcionaron
            if (! isset($validated['protein_goal'])) {
                $validated['protein_goal'] = (int) ($calorieGoal * 0.3 / 4);
            }
            if (! isset($validated['carbs_goal'])) {
                $validated['carbs_goal'] = (int) ($calorieGoal * 0.4 / 4);
            }
            if (! isset($validated['fat_goal'])) {
                $validated['fat_goal'] = (int) ($calorieGoal * 0.3 / 9);
            }
        }

        // Asegurar que water_goal tenga un valor por defecto
        if (! isset($validated['water_goal'])) {
            $validated['water_goal'] = 4000;
        }

        // Convertir checkbox a boolean
        $validated['is_medically_supervised'] = isset($validated['is_medically_supervised']) && $validated['is_medically_supervised'] === 'on';

        // Crear o actualizar el perfil
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return redirect()->route('nutritional-profile.edit')
            ->with('status', 'profile-updated');
    }

    /**
     * Calcular BMR (Metabolismo Basal)
     */
    private function calculateBmr(array $data): int
    {
        // Fórmula Mifflin-St Jeor
        if ($data['gender'] === 'male') {
            return (int) (10 * $data['weight'] + 6.25 * $data['height'] - 5 * $data['age'] + 5);
        } else {
            return (int) (10 * $data['weight'] + 6.25 * $data['height'] - 5 * $data['age'] - 161);
        }
    }

    /**
     * Calcular TDEE (Gasto Energético Total)
     */
    private function calculateTdee(int $bmr, string $activityLevel): int
    {
        $activityMultipliers = [
            'sedentary' => 1.2,
            'light' => 1.375,
            'moderate' => 1.55,
            'active' => 1.725,
            'very_active' => 1.9,
        ];

        $multiplier = $activityMultipliers[$activityLevel] ?? 1.55;

        return (int) ($bmr * $multiplier);
    }
}
