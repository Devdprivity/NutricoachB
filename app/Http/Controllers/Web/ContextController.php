<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\NutritionalData;
use App\Models\ExerciseLog;
use App\Models\UserContext;
use App\Models\HydrationRecord;
use App\Models\CoachingMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ContextController extends Controller
{
    /**
     * Mostrar la vista de contexto completo
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $profile = $user->profile;
        $today = Carbon::today();
        $last7Days = Carbon::today()->subDays(7);

        // Datos del perfil nutricional
        $profileData = null;
        if ($profile) {
            $profileData = [
                'weight' => $profile->weight,
                'target_weight' => $profile->target_weight,
                'height' => $profile->height,
                'age' => $profile->age,
                'gender' => $profile->gender,
                'bmi' => $profile->bmi,
                'bmi_category' => $profile->bmi_category,
                'daily_calorie_goal' => $profile->daily_calorie_goal,
                'protein_goal' => $profile->protein_goal,
                'carbs_goal' => $profile->carbs_goal,
                'fat_goal' => $profile->fat_goal,
                'water_goal' => $profile->water_goal,
                'activity_level' => $profile->activity_level,
            ];
        }

        // Resumen de hidratación (últimos 7 días)
        $hydrationRecords = HydrationRecord::where('user_id', $user->id)
            ->where('date', '>=', $last7Days)
            ->orderBy('date', 'desc')
            ->get();

        $hydrationSummary = [
            'today' => [
                'total_ml' => $hydrationRecords->where('date', $today)->sum('amount_ml'),
                'goal_ml' => $profile?->water_goal ?? 4000,
                'records_count' => $hydrationRecords->where('date', $today)->count(),
            ],
            'last_7_days' => [
                'total_ml' => $hydrationRecords->sum('amount_ml'),
                'average_daily' => round($hydrationRecords->groupBy('date')->map(function ($day) {
                    return $day->sum('amount_ml');
                })->average() ?? 0),
                'days_tracked' => $hydrationRecords->groupBy('date')->count(),
            ],
            'recent_records' => $hydrationRecords->take(10)->map(function ($record) {
                return [
                    'id' => $record->id,
                    'date' => $record->date->format('Y-m-d'),
                    'amount_ml' => $record->amount_ml,
                    'type' => $record->type,
                    'time' => $record->time,
                ];
            }),
        ];

        // Resumen de nutrición (últimos 7 días)
        $nutritionRecords = NutritionalData::where('user_id', $user->id)
            ->where('consumption_date', '>=', $last7Days)
            ->with('foodItem')
            ->orderBy('consumption_date', 'desc')
            ->get();

        $nutritionSummary = [
            'today' => [
                'calories' => $nutritionRecords->where('consumption_date', $today)->sum('calories'),
                'protein' => round($nutritionRecords->where('consumption_date', $today)->sum('protein'), 2),
                'carbs' => round($nutritionRecords->where('consumption_date', $today)->sum('carbs'), 2),
                'fat' => round($nutritionRecords->where('consumption_date', $today)->sum('fat'), 2),
                'meals_count' => $nutritionRecords->where('consumption_date', $today)->count(),
            ],
            'last_7_days' => [
                'total_calories' => $nutritionRecords->sum('calories'),
                'average_daily_calories' => round($nutritionRecords->groupBy('consumption_date')->map(function ($day) {
                    return $day->sum('calories');
                })->average() ?? 0),
                'total_protein' => round($nutritionRecords->sum('protein'), 2),
                'total_carbs' => round($nutritionRecords->sum('carbs'), 2),
                'total_fat' => round($nutritionRecords->sum('fat'), 2),
                'days_tracked' => $nutritionRecords->groupBy('consumption_date')->count(),
            ],
            'recent_records' => $nutritionRecords->take(10)->map(function ($record) {
                return [
                    'id' => $record->id,
                    'date' => $record->consumption_date->format('Y-m-d'),
                    'calories' => $record->calories,
                    'meal_type' => $record->meal_type,
                    'food_name' => $record->foodItem?->name ?? 'Alimento',
                ];
            }),
        ];

        // Resumen de ejercicios (últimos 7 días)
        $exerciseRecords = ExerciseLog::where('user_id', $user->id)
            ->where('date', '>=', $last7Days)
            ->orderBy('date', 'desc')
            ->with('exercise')
            ->get();

        $exerciseSummary = [
            'today' => [
                'calories_burned' => (int) $exerciseRecords->where('date', $today)->sum('calories_burned'),
                'duration_minutes' => $exerciseRecords->where('date', $today)->sum('duration_minutes'),
                'exercises_count' => $exerciseRecords->where('date', $today)->count(),
            ],
            'last_7_days' => [
                'total_calories_burned' => (int) $exerciseRecords->sum('calories_burned'),
                'total_duration_minutes' => $exerciseRecords->sum('duration_minutes'),
                'average_daily_calories' => round($exerciseRecords->groupBy('date')->map(function ($day) {
                    return $day->sum('calories_burned');
                })->average() ?? 0),
                'days_exercised' => $exerciseRecords->groupBy('date')->count(),
            ],
            'recent_records' => $exerciseRecords->take(10)->map(function ($record) {
                return [
                    'id' => $record->id,
                    'date' => $record->date->format('Y-m-d'),
                    'exercise_name' => $record->exercise?->name ?? 'Ejercicio',
                    'duration_minutes' => $record->duration_minutes,
                    'calories_burned' => (int) $record->calories_burned,
                ];
            }),
        ];

        // Mensajes de coaching recientes
        $coachingMessages = CoachingMessage::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'message' => $message->message,
                    'type' => $message->type,
                    'created_at' => $message->created_at->format('Y-m-d H:i'),
                    'is_read' => $message->is_read,
                ];
            });

        // Contextos registrados (últimos 7 días)
        $userContexts = UserContext::where('user_id', $user->id)
            ->where('date', '>=', $last7Days)
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($context) {
                return [
                    'id' => $context->id,
                    'date' => $context->date->format('Y-m-d'),
                    'context_type' => $context->context_type,
                    'description' => $context->description,
                    'stress_level' => $context->stress_level,
                    'energy_level' => $context->energy_level,
                    'mood_level' => $context->mood_level,
                    'affects_nutrition' => $context->affects_nutrition,
                ];
            });

        // Calcular cumplimiento de objetivos
        $goalCompliance = [
            'hydration' => $this->calculateHydrationCompliance($hydrationSummary['today'], $profile),
            'nutrition' => $this->calculateNutritionCompliance($nutritionSummary['today'], $profile),
            'exercise' => $exerciseSummary['today']['exercises_count'] > 0,
        ];

        return Inertia::render('context', [
            'contextData' => [
                'profile' => $profileData,
                'hydration' => $hydrationSummary,
                'nutrition' => $nutritionSummary,
                'exercise' => $exerciseSummary,
                'coaching' => [
                    'recent_messages' => $coachingMessages,
                    'total_messages' => CoachingMessage::where('user_id', $user->id)->count(),
                ],
                'user_contexts' => $userContexts,
                'goal_compliance' => $goalCompliance,
            ],
        ]);
    }

    /**
     * Calcular cumplimiento de hidratación
     */
    private function calculateHydrationCompliance(array $todayData, $profile): array
    {
        $goal = $profile?->water_goal ?? 4000;
        $current = $todayData['total_ml'];
        $percentage = $goal > 0 ? min(100, round(($current / $goal) * 100, 1)) : 0;

        return [
            'current' => $current,
            'goal' => $goal,
            'percentage' => $percentage,
            'status' => $percentage >= 90 ? 'good' : ($percentage >= 70 ? 'fair' : 'poor'),
        ];
    }

    /**
     * Calcular cumplimiento de nutrición
     */
    private function calculateNutritionCompliance(array $todayData, $profile): array
    {
        $calorieGoal = $profile?->daily_calorie_goal ?? 2000;
        $proteinGoal = $profile?->protein_goal ?? 150;
        $carbsGoal = $profile?->carbs_goal ?? 200;
        $fatGoal = $profile?->fat_goal ?? 65;

        $caloriePercentage = $calorieGoal > 0 ? min(100, round(($todayData['calories'] / $calorieGoal) * 100, 1)) : 0;
        $proteinPercentage = $proteinGoal > 0 ? min(100, round(($todayData['protein'] / $proteinGoal) * 100, 1)) : 0;
        $carbsPercentage = $carbsGoal > 0 ? min(100, round(($todayData['carbs'] / $carbsGoal) * 100, 1)) : 0;
        $fatPercentage = $fatGoal > 0 ? min(100, round(($todayData['fat'] / $fatGoal) * 100, 1)) : 0;

        $overallPercentage = ($caloriePercentage + $proteinPercentage + $carbsPercentage + $fatPercentage) / 4;

        return [
            'calories' => [
                'current' => $todayData['calories'],
                'goal' => $calorieGoal,
                'percentage' => $caloriePercentage,
            ],
            'protein' => [
                'current' => $todayData['protein'],
                'goal' => $proteinGoal,
                'percentage' => $proteinPercentage,
            ],
            'carbs' => [
                'current' => $todayData['carbs'],
                'goal' => $carbsGoal,
                'percentage' => $carbsPercentage,
            ],
            'fat' => [
                'current' => $todayData['fat'],
                'goal' => $fatGoal,
                'percentage' => $fatPercentage,
            ],
            'overall_percentage' => round($overallPercentage, 1),
            'status' => $overallPercentage >= 80 ? 'good' : ($overallPercentage >= 60 ? 'fair' : 'poor'),
        ];
    }
}

