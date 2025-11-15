<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\NutritionalData;
use App\Models\ExerciseLog;
use App\Models\UserContext;
use App\Models\HydrationRecord;
use App\Models\ProgressPhoto;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ProgressController extends Controller
{
    /**
     * Mostrar la vista de progreso
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $profile = $user->profile;

        if (!$profile) {
            return Inertia::render('progress', [
                'error' => 'Por favor completa tu perfil nutricional primero',
            ]);
        }

        // Datos del perfil
        $profileData = [
            'weight' => $profile->weight,
            'target_weight' => $profile->target_weight,
            'target_date' => $profile->target_date?->format('Y-m-d'),
            'age' => $profile->age,
            'height' => $profile->height,
            'gender' => $profile->gender,
            'bmi' => $profile->bmi,
            'bmi_category' => $profile->bmi_category,
            'medical_conditions' => $profile->medical_conditions,
            'dietary_restrictions' => $profile->dietary_restrictions,
            'is_medically_supervised' => $profile->is_medically_supervised,
            'body_frame' => $profile->body_frame,
            'body_type' => $profile->body_type,
            'body_fat_percentage' => $profile->body_fat_percentage,
            'muscle_mass_percentage' => $profile->muscle_mass_percentage,
        ];

        // Calcular progreso hacia el objetivo
        $weightProgress = null;
        if ($profile->weight && $profile->target_weight) {
            $weightDifference = $profile->weight - $profile->target_weight;
            $initialWeight = $profile->weight; // Asumimos que el peso actual es el inicial
            $totalToLose = abs($weightDifference);
            
            // Porcentaje de progreso (asumiendo que empezamos desde el peso actual)
            // En un caso real, deberías tener un historial de pesos
            $weightProgress = [
                'current' => $profile->weight,
                'target' => $profile->target_weight,
                'difference' => round($weightDifference, 2),
                'percentage' => $totalToLose > 0 ? min(100, max(0, (1 - abs($weightDifference) / max($initialWeight, $profile->target_weight)) * 100)) : 100,
                'is_achieved' => abs($weightDifference) < 0.5, // Consideramos logrado si está a menos de 0.5kg
                'days_remaining' => $profile->target_date ? max(0, Carbon::parse($profile->target_date)->diffInDays(now())) : null,
            ];
        }

        // Obtener historial de ejercicios (últimos 30 días)
        $exerciseHistory = ExerciseLog::where('user_id', $user->id)
            ->where('date', '>=', Carbon::now()->subDays(30))
            ->orderBy('date', 'desc')
            ->with('exercise')
            ->get()
            ->map(function ($exercise) {
                return [
                    'id' => $exercise->id,
                    'date' => $exercise->date->format('Y-m-d'),
                    'exercise_name' => $exercise->exercise?->name ?? 'Ejercicio',
                    'duration_minutes' => $exercise->duration_minutes,
                    'calories_burned' => (int) $exercise->calories_burned,
                    'notes' => $exercise->notes,
                ];
            });

        // Resumen de ejercicios
        $exerciseSummary = [
            'total_days' => $exerciseHistory->groupBy('date')->count(),
            'total_calories_burned' => $exerciseHistory->sum('calories_burned'),
            'total_duration_minutes' => $exerciseHistory->sum('duration_minutes'),
            'average_per_week' => round($exerciseHistory->groupBy('date')->count() / 4.3, 1), // Aproximadamente 4.3 semanas en 30 días
        ];

        // Obtener datos nutricionales (últimos 30 días)
        $nutritionHistory = NutritionalData::where('user_id', $user->id)
            ->where('consumption_date', '>=', Carbon::now()->subDays(30))
            ->orderBy('consumption_date', 'desc')
            ->get();

        // Resumen nutricional
        $nutritionSummary = [
            'total_calories' => $nutritionHistory->sum('calories'),
            'total_protein' => round($nutritionHistory->sum('protein'), 2),
            'total_carbs' => round($nutritionHistory->sum('carbs'), 2),
            'total_fat' => round($nutritionHistory->sum('fat'), 2),
            'average_daily_calories' => round($nutritionHistory->groupBy('consumption_date')->map(function ($day) {
                return $day->sum('calories');
            })->average() ?? 0),
            'days_tracked' => $nutritionHistory->groupBy('consumption_date')->count(),
            'goal_compliance' => $this->calculateGoalCompliance($nutritionHistory, $profile),
        ];

        // Obtener contexto del usuario (últimos 30 días)
        $contextHistory = UserContext::where('user_id', $user->id)
            ->where('date', '>=', Carbon::now()->subDays(30))
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($context) {
                return [
                    'id' => $context->id,
                    'date' => $context->date->format('Y-m-d'),
                    'special_day_type' => $context->special_day_type,
                    'stress_level' => $context->stress_level,
                    'emotional_state' => $context->emotional_state,
                    'sleep_hours' => $context->sleep_hours,
                    'notes' => $context->notes,
                ];
            });

        // Resumen de contexto
        $contextSummary = [
            'total_days' => $contextHistory->count(),
            'average_stress' => round($contextHistory->whereNotNull('stress_level')->avg('stress_level') ?? 0, 1),
            'average_sleep' => round($contextHistory->whereNotNull('sleep_hours')->avg('sleep_hours') ?? 0, 1),
            'special_days_count' => $contextHistory->whereNotNull('special_day_type')->count(),
        ];

        // Obtener historial de hidratación (últimos 30 días)
        $hydrationHistory = HydrationRecord::where('user_id', $user->id)
            ->where('date', '>=', Carbon::now()->subDays(30))
            ->orderBy('date', 'desc')
            ->get();

        $hydrationSummary = [
            'total_ml' => $hydrationHistory->sum('amount_ml'),
            'average_daily_ml' => round($hydrationHistory->groupBy('date')->map(function ($day) {
                return $day->sum('amount_ml');
            })->average() ?? 0),
            'goal_compliance' => $this->calculateHydrationCompliance($hydrationHistory, $profile),
        ];

        // Obtener fotos de progreso
        $progressPhotos = ProgressPhoto::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($photo) {
                return [
                    'id' => $photo->id,
                    'date' => $photo->date->format('Y-m-d'),
                    'image_url' => asset('storage/' . $photo->image_path),
                    'weight' => $photo->weight,
                    'body_fat_percentage' => $photo->body_fat_percentage,
                    'measurements' => $photo->measurements,
                    'notes' => $photo->notes,
                    'is_baseline' => $photo->is_baseline,
                    'visibility' => $photo->visibility,
                    'days_since_baseline' => $photo->days_since_baseline,
                    'weight_change' => $photo->weight_change,
                ];
            });

        // Obtener foto baseline para comparación
        $baselinePhoto = ProgressPhoto::where('user_id', $user->id)
            ->where('is_baseline', true)
            ->first();

        $progressPhotosSummary = [
            'total_photos' => $progressPhotos->count(),
            'baseline_photo' => $baselinePhoto ? [
                'id' => $baselinePhoto->id,
                'date' => $baselinePhoto->date->format('Y-m-d'),
                'image_url' => asset('storage/' . $baselinePhoto->image_path),
                'weight' => $baselinePhoto->weight,
            ] : null,
            'latest_photo' => $progressPhotos->first(),
            'total_weight_change' => $baselinePhoto && $progressPhotos->first() && $baselinePhoto->weight && $progressPhotos->first()['weight']
                ? round($progressPhotos->first()['weight'] - $baselinePhoto->weight, 2)
                : null,
        ];

        return Inertia::render('progress', [
            'progressData' => [
                'profileData' => $profileData,
                'weightProgress' => $weightProgress,
                'exerciseHistory' => $exerciseHistory,
                'exerciseSummary' => $exerciseSummary,
                'nutritionHistory' => $nutritionHistory->groupBy('consumption_date')->map(function ($day) {
                    return [
                        'date' => $day->first()->consumption_date->format('Y-m-d'),
                        'total_calories' => $day->sum('calories'),
                        'total_protein' => round($day->sum('protein'), 2),
                        'total_carbs' => round($day->sum('carbs'), 2),
                        'total_fat' => round($day->sum('fat'), 2),
                        'meals_count' => $day->count(),
                    ];
                })->values(),
                'nutritionSummary' => $nutritionSummary,
                'contextHistory' => $contextHistory,
                'contextSummary' => $contextSummary,
                'hydrationSummary' => $hydrationSummary,
                'progressPhotos' => $progressPhotos,
                'progressPhotosSummary' => $progressPhotosSummary,
            ],
        ]);
    }

    /**
     * Calcular cumplimiento de objetivos nutricionales
     */
    private function calculateGoalCompliance($nutritionHistory, $profile): array
    {
        $days = $nutritionHistory->groupBy('consumption_date');
        $compliantDays = 0;
        $totalDays = $days->count();

        foreach ($days as $dayData) {
            $dayCalories = $dayData->sum('calories');
            $dayProtein = $dayData->sum('protein');
            $dayCarbs = $dayData->sum('carbs');
            $dayFat = $dayData->sum('fat');

            $calorieGoal = $profile->daily_calorie_goal ?? 2000;
            $proteinGoal = $profile->protein_goal ?? 150;
            $carbsGoal = $profile->carbs_goal ?? 200;
            $fatGoal = $profile->fat_goal ?? 65;

            // Consideramos cumplido si está dentro del 90-110% del objetivo
            $caloriesOk = $dayCalories >= ($calorieGoal * 0.9) && $dayCalories <= ($calorieGoal * 1.1);
            $proteinOk = $dayProtein >= ($proteinGoal * 0.9);
            $carbsOk = $dayCarbs >= ($carbsGoal * 0.9) && $dayCarbs <= ($carbsGoal * 1.1);
            $fatOk = $dayFat >= ($fatGoal * 0.9) && $dayFat <= ($fatGoal * 1.1);

            if ($caloriesOk && $proteinOk && $carbsOk && $fatOk) {
                $compliantDays++;
            }
        }

        return [
            'compliant_days' => $compliantDays,
            'total_days' => $totalDays,
            'percentage' => $totalDays > 0 ? round(($compliantDays / $totalDays) * 100, 1) : 0,
        ];
    }

    /**
     * Calcular cumplimiento de objetivos de hidratación
     */
    private function calculateHydrationCompliance($hydrationHistory, $profile): array
    {
        $days = $hydrationHistory->groupBy('date');
        $goal = $profile->water_goal ?? 4000;
        $compliantDays = 0;
        $totalDays = $days->count();

        foreach ($days as $dayData) {
            $dayTotal = $dayData->sum('amount_ml');
            if ($dayTotal >= ($goal * 0.9)) { // 90% del objetivo
                $compliantDays++;
            }
        }

        return [
            'compliant_days' => $compliantDays,
            'total_days' => $totalDays,
            'percentage' => $totalDays > 0 ? round(($compliantDays / $totalDays) * 100, 1) : 0,
        ];
    }
}

