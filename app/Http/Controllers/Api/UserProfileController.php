<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class UserProfileController extends Controller
{
    /**
     * Obtener el perfil del usuario autenticado
     */
    public function show(): JsonResponse
    {
        $profile = auth()->user()->profile;
        
        if (!$profile) {
            return response()->json([
                'message' => 'Perfil no encontrado',
                'data' => null
            ], 404);
        }

        return response()->json([
            'message' => 'Perfil obtenido exitosamente',
            'data' => [
                'profile' => $profile,
                'bmi' => $profile->bmi,
                'bmi_category' => $profile->bmi_category,
                'bmr' => $profile->calculateBmr(),
                'tdee' => $profile->calculateTdee(),
            ]
        ]);
    }

    /**
     * Crear o actualizar el perfil del usuario
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'height' => 'required|numeric|min:100|max:250',
            'weight' => 'required|numeric|min:30|max:300',
            'age' => 'required|integer|min:16|max:100',
            'gender' => ['required', Rule::in(['male', 'female', 'other'])],
            'activity_level' => ['required', Rule::in(['sedentary', 'light', 'moderate', 'active', 'very_active'])],
            'target_weight' => 'nullable|numeric|min:30|max:300',
            'target_date' => 'nullable|date|after:today',
            'medical_conditions' => 'nullable|string|max:1000',
            'dietary_restrictions' => 'nullable|string|max:1000',
            'is_medically_supervised' => 'boolean',
        ]);

        $user = auth()->user();
        
        // Calcular objetivos nutricionales basados en el perfil
        $bmr = $this->calculateBmr($validated);
        $tdee = $this->calculateTdee($bmr, $validated['activity_level']);
        
        // Ajustar calorías para pérdida de peso si hay objetivo
        $calorieGoal = $tdee;
        if (isset($validated['target_weight']) && $validated['target_weight'] < $validated['weight']) {
            $weightDiff = $validated['weight'] - $validated['target_weight'];
            $weeksToTarget = isset($validated['target_date']) ? 
                ceil((strtotime($validated['target_date']) - time()) / (7 * 24 * 60 * 60)) : 52;
            
            if ($weeksToTarget > 0) {
                $weeklyDeficit = ($weightDiff * 7700) / $weeksToTarget; // 7700 kcal = 1kg
                $dailyDeficit = $weeklyDeficit / 7;
                $calorieGoal = max($tdee - $dailyDeficit, $bmr * 1.1); // No menos del 110% del BMR
            }
        }

        // Calcular macronutrientes (40% carbs, 30% protein, 30% fat)
        $proteinGoal = (int) ($calorieGoal * 0.3 / 4); // 4 kcal por gramo de proteína
        $carbsGoal = (int) ($calorieGoal * 0.4 / 4); // 4 kcal por gramo de carbohidratos
        $fatGoal = (int) ($calorieGoal * 0.3 / 9); // 9 kcal por gramo de grasa

        $profileData = array_merge($validated, [
            'daily_calorie_goal' => (int) $calorieGoal,
            'protein_goal' => $proteinGoal,
            'carbs_goal' => $carbsGoal,
            'fat_goal' => $fatGoal,
            'water_goal' => 4000, // 4L por defecto
        ]);

        $profile = $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            $profileData
        );

        return response()->json([
            'message' => 'Perfil guardado exitosamente',
            'data' => [
                'profile' => $profile,
                'bmi' => $profile->bmi,
                'bmi_category' => $profile->bmi_category,
                'bmr' => $profile->calculateBmr(),
                'tdee' => $profile->calculateTdee(),
                'calculated_goals' => [
                    'calories' => $calorieGoal,
                    'protein' => $proteinGoal,
                    'carbs' => $carbsGoal,
                    'fat' => $fatGoal,
                ]
            ]
        ], 201);
    }

    /**
     * Actualizar el perfil del usuario
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'height' => 'sometimes|numeric|min:100|max:250',
            'weight' => 'sometimes|numeric|min:30|max:300',
            'age' => 'sometimes|integer|min:16|max:100',
            'gender' => ['sometimes', Rule::in(['male', 'female', 'other'])],
            'activity_level' => ['sometimes', Rule::in(['sedentary', 'light', 'moderate', 'active', 'very_active'])],
            'daily_calorie_goal' => 'sometimes|integer|min:800|max:5000',
            'protein_goal' => 'sometimes|integer|min:20|max:500',
            'carbs_goal' => 'sometimes|integer|min:50|max:800',
            'fat_goal' => 'sometimes|integer|min:20|max:300',
            'water_goal' => 'sometimes|integer|min:1000|max:10000',
            'target_weight' => 'nullable|numeric|min:30|max:300',
            'target_date' => 'nullable|date|after:today',
            'medical_conditions' => 'nullable|string|max:1000',
            'dietary_restrictions' => 'nullable|string|max:1000',
            'is_medically_supervised' => 'boolean',
        ]);

        $profile = auth()->user()->profile;
        
        if (!$profile) {
            return response()->json([
                'message' => 'Perfil no encontrado'
            ], 404);
        }

        $profile->update($validated);

        return response()->json([
            'message' => 'Perfil actualizado exitosamente',
            'data' => [
                'profile' => $profile,
                'bmi' => $profile->bmi,
                'bmi_category' => $profile->bmi_category,
                'bmr' => $profile->calculateBmr(),
                'tdee' => $profile->calculateTdee(),
            ]
        ]);
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