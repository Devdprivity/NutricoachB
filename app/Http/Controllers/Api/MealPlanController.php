<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MealPlan;
use App\Models\FoodItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class MealPlanController extends Controller
{
    /**
     * Obtener planes de comida del usuario
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $query = $user->mealPlans()->with('foodItem');

        if ($request->has('date')) {
            $query->forDate($request->input('date'));
        }

        if ($request->has('meal_type')) {
            $query->forMealType($request->input('meal_type'));
        }

        if ($request->has('completed')) {
            $isCompleted = $request->boolean('completed');
            $query->where('is_completed', $isCompleted);
        }

        $perPage = $request->get('per_page', 20);
        $mealPlans = $query->orderBy('date', 'desc')
                          ->orderBy('meal_type', 'asc')
                          ->orderBy('created_at', 'desc')
                          ->paginate($perPage);

        return response()->json([
            'message' => 'Planes de comida obtenidos exitosamente',
            'data' => $mealPlans
        ]);
    }

    /**
     * Crear un nuevo plan de comida
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'meal_type' => 'required|in:breakfast,lunch,dinner,snack,pre_workout,post_workout',
            'food_item_id' => 'required|exists:food_items,id',
            'planned_quantity' => 'required|numeric|min:1',
            'planned_unit' => 'string|in:g,ml,piece,cup,tbsp',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $foodItem = FoodItem::find($request->input('food_item_id'));
        $quantity = $request->input('planned_quantity');
        
        // Calcular valores nutricionales planificados
        $nutrition = $foodItem->calculateNutrition($quantity);

        $mealPlan = auth()->user()->mealPlans()->create([
            'date' => $request->input('date'),
            'meal_type' => $request->input('meal_type'),
            'food_item_id' => $request->input('food_item_id'),
            'planned_quantity' => $quantity,
            'planned_unit' => $request->input('planned_unit', 'g'),
            'planned_calories' => $nutrition['calories'],
            'planned_protein' => $nutrition['protein'],
            'planned_carbs' => $nutrition['carbs'],
            'planned_fat' => $nutrition['fats'],
            'notes' => $request->input('notes'),
        ]);

        return response()->json([
            'message' => 'Plan de comida creado exitosamente',
            'data' => $mealPlan->load('foodItem')
        ], 201);
    }

    /**
     * Actualizar un plan de comida
     */
    public function update(Request $request, MealPlan $mealPlan): JsonResponse
    {
        if ($mealPlan->user_id !== auth()->id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validator = Validator::make($request->all(), [
            'date' => 'date',
            'meal_type' => 'in:breakfast,lunch,dinner,snack,pre_workout,post_workout',
            'food_item_id' => 'exists:food_items,id',
            'planned_quantity' => 'numeric|min:1',
            'planned_unit' => 'string|in:g,ml,piece,cup,tbsp',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();

        // Recalcular valores nutricionales si cambió el alimento o cantidad
        if ($request->has('food_item_id') || $request->has('planned_quantity')) {
            $foodItem = FoodItem::find($request->input('food_item_id', $mealPlan->food_item_id));
            $quantity = $request->input('planned_quantity', $mealPlan->planned_quantity);
            
            $nutrition = $foodItem->calculateNutrition($quantity);
            
            $data['planned_calories'] = $nutrition['calories'];
            $data['planned_protein'] = $nutrition['protein'];
            $data['planned_carbs'] = $nutrition['carbs'];
            $data['planned_fat'] = $nutrition['fats'];
        }

        $mealPlan->update($data);

        return response()->json([
            'message' => 'Plan de comida actualizado exitosamente',
            'data' => $mealPlan->load('foodItem')
        ]);
    }

    /**
     * Eliminar un plan de comida
     */
    public function destroy(MealPlan $mealPlan): JsonResponse
    {
        if ($mealPlan->user_id !== auth()->id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $mealPlan->delete();

        return response()->json([
            'message' => 'Plan de comida eliminado exitosamente'
        ]);
    }

    /**
     * Marcar plan como completado
     */
    public function markAsCompleted(MealPlan $mealPlan): JsonResponse
    {
        if ($mealPlan->user_id !== auth()->id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $mealPlan->markAsCompleted();

        return response()->json([
            'message' => 'Plan marcado como completado exitosamente',
            'data' => $mealPlan->load('foodItem')
        ]);
    }

    /**
     * Obtener resumen del plan diario
     */
    public function getDailyPlanSummary(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = auth()->user();
        $date = $request->input('date');

        $summary = MealPlan::getDailyPlanSummary($user->id, $date);
        
        // Obtener planes detallados por tipo de comida
        $mealPlans = $user->mealPlans()
                         ->forDate($date)
                         ->with('foodItem')
                         ->orderBy('meal_type')
                         ->get()
                         ->groupBy('meal_type');

        return response()->json([
            'message' => 'Resumen del plan diario obtenido exitosamente',
            'data' => [
                'date' => $date,
                'summary' => $summary,
                'meal_plans' => $mealPlans,
                'completion_percentage' => $summary->total_planned_meals > 0 
                    ? round(($summary->completed_meals / $summary->total_planned_meals) * 100, 1) 
                    : 0
            ]
        ]);
    }

    /**
     * Obtener progreso semanal del plan
     */
    public function getWeeklyPlanProgress(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = auth()->user();
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $weeklyProgress = $user->mealPlans()
                              ->whereBetween('date', [$startDate, $endDate])
                              ->selectRaw('
                                  DATE(date) as date,
                                  COUNT(*) as total_planned_meals,
                                  SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_meals,
                                  SUM(planned_calories) as total_planned_calories,
                                  SUM(planned_protein) as total_planned_protein,
                                  SUM(planned_carbs) as total_planned_carbs,
                                  SUM(planned_fat) as total_planned_fat
                              ')
                              ->groupBy('date')
                              ->orderBy('date')
                              ->get();

        // Calcular estadísticas generales
        $totalPlanned = $weeklyProgress->sum('total_planned_meals');
        $totalCompleted = $weeklyProgress->sum('completed_meals');
        $averageCompletion = $totalPlanned > 0 ? round(($totalCompleted / $totalPlanned) * 100, 1) : 0;

        return response()->json([
            'message' => 'Progreso semanal del plan obtenido exitosamente',
            'data' => [
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ],
                'daily_progress' => $weeklyProgress,
                'summary' => [
                    'total_planned_meals' => $totalPlanned,
                    'total_completed_meals' => $totalCompleted,
                    'average_completion_percentage' => $averageCompletion,
                    'total_planned_calories' => $weeklyProgress->sum('total_planned_calories'),
                    'total_planned_protein' => $weeklyProgress->sum('total_planned_protein'),
                    'total_planned_carbs' => $weeklyProgress->sum('total_planned_carbs'),
                    'total_planned_fat' => $weeklyProgress->sum('total_planned_fat')
                ]
            ]
        ]);
    }

    /**
     * Generar plan automático basado en objetivos
     */
    public function generateAutomaticPlan(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'meal_types' => 'required|array',
            'meal_types.*' => 'in:breakfast,lunch,dinner,snack,pre_workout,post_workout',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = auth()->user();
        $userProfile = $user->profile;

        if (!$userProfile) {
            return response()->json([
                'message' => 'Perfil de usuario no encontrado'
            ], 404);
        }

        $date = $request->input('date');
        $mealTypes = $request->input('meal_types');

        // Distribuir calorías entre tipos de comida
        $calorieDistribution = $this->getCalorieDistribution($mealTypes, $userProfile->target_calories);
        
        $generatedPlans = [];

        foreach ($mealTypes as $mealType) {
            $targetCalories = $calorieDistribution[$mealType];
            $foodItems = $this->getRecommendedFoods($mealType, $targetCalories);
            
            foreach ($foodItems as $foodItem) {
                $mealPlan = $user->mealPlans()->create([
                    'date' => $date,
                    'meal_type' => $mealType,
                    'food_item_id' => $foodItem['id'],
                    'planned_quantity' => $foodItem['quantity'],
                    'planned_unit' => 'g',
                    'planned_calories' => $foodItem['calories'],
                    'planned_protein' => $foodItem['protein'],
                    'planned_carbs' => $foodItem['carbs'],
                    'planned_fat' => $foodItem['fats'],
                    'notes' => 'Generado automáticamente'
                ]);

                $generatedPlans[] = $mealPlan->load('foodItem');
            }
        }

        return response()->json([
            'message' => 'Plan automático generado exitosamente',
            'data' => [
                'date' => $date,
                'generated_plans' => $generatedPlans,
                'total_planned_calories' => array_sum($calorieDistribution)
            ]
        ], 201);
    }

    // Métodos privados

    private function getCalorieDistribution(array $mealTypes, int $totalCalories): array
    {
        $distribution = [
            'breakfast' => 0.25,
            'lunch' => 0.35,
            'dinner' => 0.30,
            'snack' => 0.10,
            'pre_workout' => 0.05,
            'post_workout' => 0.05,
        ];

        $result = [];
        foreach ($mealTypes as $mealType) {
            $result[$mealType] = round($totalCalories * $distribution[$mealType]);
        }

        return $result;
    }

    private function getRecommendedFoods(string $mealType, int $targetCalories): array
    {
        // Lógica simplificada para obtener alimentos recomendados
        // En una implementación real, esto sería más sofisticado
        
        $recommendations = [];

        switch ($mealType) {
            case 'breakfast':
                $recommendations = [
                    ['id' => 1, 'quantity' => 100, 'calories' => 165, 'protein' => 31, 'carbs' => 0, 'fats' => 3.6], // Pollo
                    ['id' => 11, 'quantity' => 50, 'calories' => 185, 'protein' => 40, 'carbs' => 2.5, 'fats' => 2], // Whey
                ];
                break;
            case 'lunch':
                $recommendations = [
                    ['id' => 4, 'quantity' => 200, 'calories' => 174, 'protein' => 3.8, 'carbs' => 40, 'fats' => 0.2], // Papa
                    ['id' => 1, 'quantity' => 150, 'calories' => 248, 'protein' => 47, 'carbs' => 0, 'fats' => 5.4], // Pollo
                ];
                break;
            case 'dinner':
                $recommendations = [
                    ['id' => 3, 'quantity' => 150, 'calories' => 312, 'protein' => 30, 'carbs' => 0, 'fats' => 20], // Salmón
                    ['id' => 9, 'quantity' => 100, 'calories' => 23, 'protein' => 2.9, 'carbs' => 3.6, 'fats' => 0.4], // Espinacas
                ];
                break;
            default:
                $recommendations = [
                    ['id' => 2, 'quantity' => 100, 'calories' => 155, 'protein' => 13, 'carbs' => 1.1, 'fats' => 11], // Huevo
                ];
        }

        return $recommendations;
    }
}