<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\HydrationRecord;
use App\Models\MealRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Mostrar el dashboard
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $profile = $user->profile;
        $today = Carbon::today();

        // Datos del perfil
        $profileData = null;
        if ($profile) {
            $profileData = [
                'profile' => $profile,
                'bmi' => $profile->bmi,
                'bmi_category' => $profile->bmi_category,
                'bmr' => $profile->calculateBmr(),
                'tdee' => $profile->calculateTdee(),
            ];
        }

        // Hidratación de hoy
        $todayHydrationRecords = HydrationRecord::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->orderBy('time', 'desc')
            ->get();

        $todayHydration = null;
        if ($todayHydrationRecords->count() > 0 || $profile) {
            $totalMl = $todayHydrationRecords->sum('amount_ml');
            $goalMl = $profile?->water_goal ?? 4000;
            $percentage = $goalMl > 0 ? min(100, round(($totalMl / $goalMl) * 100, 1)) : 0;

            $todayHydration = [
                'total_ml' => $totalMl,
                'goal_ml' => $goalMl,
                'percentage' => $percentage,
                'records' => $todayHydrationRecords->map(function ($record) {
                    return [
                        'id' => $record->id,
                        'amount_ml' => $record->amount_ml,
                        'type' => $record->type,
                        'time' => $record->time,
                    ];
                }),
            ];
        }

        // Nutrición de hoy
        $todayNutritionRecords = MealRecord::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->orderBy('time', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $todayNutrition = null;
        if ($todayNutritionRecords->count() > 0 || $profile) {
            $totalCalories = $todayNutritionRecords->sum('calories');
            $totalProtein = round($todayNutritionRecords->sum('protein'), 2);
            $totalCarbs = round($todayNutritionRecords->sum('carbs'), 2);
            $totalFat = round($todayNutritionRecords->sum('fat'), 2);

            $goalCalories = $profile?->daily_calorie_goal ?? 2000;
            $goalProtein = $profile?->protein_goal ?? 150;
            $goalCarbs = $profile?->carbs_goal ?? 200;
            $goalFat = $profile?->fat_goal ?? 65;

            $todayNutrition = [
                'total_calories' => $totalCalories,
                'goal_calories' => $goalCalories,
                'total_protein' => $totalProtein,
                'goal_protein' => $goalProtein,
                'total_carbs' => $totalCarbs,
                'goal_carbs' => $goalCarbs,
                'total_fat' => $totalFat,
                'goal_fat' => $goalFat,
                'records' => $todayNutritionRecords->map(function ($record) {
                    // Obtener nombre de la comida desde food_items (JSON) o AI description
                    $foodName = 'Comida';
                    if ($record->food_items) {
                        $foodItems = is_string($record->food_items) ? json_decode($record->food_items, true) : $record->food_items;
                        if (is_array($foodItems) && count($foodItems) > 0) {
                            $foodName = is_array($foodItems[0]) ? ($foodItems[0]['name'] ?? 'Comida') : $foodItems[0];
                        }
                    } elseif ($record->ai_description) {
                        $foodName = $record->ai_description;
                    }

                    return [
                        'id' => $record->id,
                        'calories' => (float) $record->calories,
                        'protein' => round((float) $record->protein, 2),
                        'carbs' => round((float) $record->carbs, 2),
                        'fat' => round((float) $record->fat, 2),
                        'meal_type' => $record->meal_type,
                        'food_name' => $foodName,
                        'time' => $record->time ? (is_string($record->time) ? $record->time : $record->time->format('H:i')) : $record->created_at->format('H:i'),
                    ];
                }),
            ];
        }

        // Gráfico de hidratación por horas (últimas 24 horas)
        $hydrationChart = [];
        if ($todayHydrationRecords->count() > 0) {
            $hourlyData = $todayHydrationRecords->groupBy(function ($record) {
                // time está en formato H:i, extraer solo la hora
                $parts = explode(':', $record->time);
                return (int) $parts[0];
            })->map(function ($records, $hour) {
                return [
                    'hour' => (int) $hour,
                    'total_ml' => $records->sum('amount_ml'),
                    'count' => $records->count(),
                ];
            })->sortBy('hour')->values();

            $hydrationChart = $hourlyData->toArray();
        }

        // Gráfico de nutrición por tipo de comida
        $nutritionChart = [];
        if ($todayNutritionRecords->count() > 0) {
            $mealTypeData = $todayNutritionRecords->groupBy('meal_type')->map(function ($records, $type) {
                return [
                    'type' => $type,
                    'calories' => (float) $records->sum('calories'),
                    'protein' => round((float) $records->sum('protein'), 2),
                    'carbs' => round((float) $records->sum('carbs'), 2),
                    'fat' => round((float) $records->sum('fat'), 2),
                    'count' => $records->count(),
                ];
            })->values();

            $nutritionChart = $mealTypeData->toArray();
        }

        return Inertia::render('dashboard', [
            'dashboardData' => [
                'profileData' => $profileData,
                'todayHydration' => $todayHydration,
                'todayNutrition' => $todayNutrition,
                'hydrationChart' => $hydrationChart,
                'nutritionChart' => $nutritionChart,
                'hasProfile' => $profile !== null,
            ],
        ]);
    }
}

