<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NutritionalData;
use App\Models\FoodItem;
use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class NutritionalDataController extends Controller
{
    /**
     * Obtener datos nutricionales del usuario
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $query = $user->nutritionalData()->with('foodItem');

        // Filtros
        if ($request->has('date')) {
            $query->forDate($request->date);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->forDateRange($request->start_date, $request->end_date);
        }

        if ($request->has('meal_type')) {
            $query->forMealType($request->meal_type);
        }

        $perPage = $request->get('per_page', 20);
        $nutritionalData = $query->orderBy('consumption_date', 'desc')
                                ->orderBy('created_at', 'desc')
                                ->paginate($perPage);

        return response()->json([
            'message' => 'Datos nutricionales obtenidos exitosamente',
            'data' => $nutritionalData
        ]);
    }

    /**
     * Obtener un registro específico
     */
    public function show(NutritionalData $nutritionalData): JsonResponse
    {
        // Verificar que el registro pertenece al usuario autenticado
        if ($nutritionalData->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        $nutritionalData->load('foodItem');

        return response()->json([
            'message' => 'Registro obtenido exitosamente',
            'data' => $nutritionalData
        ]);
    }

    /**
     * Crear un nuevo registro nutricional
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'food_item_id' => 'required|exists:food_items,id',
            'consumption_date' => 'required|date',
            'meal_type' => ['required', Rule::in(['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'])],
            'quantity' => 'required|numeric|min:0.1|max:10000',
            'unit' => 'nullable|string|max:10',
            'notes' => 'nullable|string|max:1000',
            'mood' => ['nullable', Rule::in(['excellent', 'good', 'neutral', 'poor', 'terrible'])],
            'energy_level' => 'nullable|integer|min:1|max:10',
            'hunger_level' => 'nullable|integer|min:1|max:10',
            'was_planned' => 'boolean',
            'context' => 'nullable|array',
        ]);

        $foodItem = FoodItem::findOrFail($validated['food_item_id']);
        
        // Calcular valores nutricionales
        $nutrition = $foodItem->calculateNutritionForQuantity($validated['quantity']);

        $nutritionalData = auth()->user()->nutritionalData()->create([
            'food_item_id' => $validated['food_item_id'],
            'consumption_date' => $validated['consumption_date'],
            'meal_type' => $validated['meal_type'],
            'quantity' => $validated['quantity'],
            'unit' => $validated['unit'] ?? 'g',
            'calories' => $nutrition['calories'],
            'protein' => $nutrition['protein'],
            'carbs' => $nutrition['carbs'],
            'fat' => $nutrition['fat'],
            'fiber' => $nutrition['fiber'],
            'sugar' => $nutrition['sugar'],
            'sodium' => $nutrition['sodium'],
            'notes' => $validated['notes'] ?? null,
            'mood' => $validated['mood'] ?? null,
            'energy_level' => $validated['energy_level'] ?? null,
            'hunger_level' => $validated['hunger_level'] ?? null,
            'was_planned' => $validated['was_planned'] ?? false,
            'context' => $validated['context'] ?? null,
        ]);

        $nutritionalData->load('foodItem');

        return response()->json([
            'message' => 'Registro nutricional creado exitosamente',
            'data' => $nutritionalData
        ], 201);
    }

    /**
     * Actualizar un registro nutricional
     */
    public function update(Request $request, NutritionalData $nutritionalData): JsonResponse
    {
        // Verificar que el registro pertenece al usuario autenticado
        if ($nutritionalData->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        $validated = $request->validate([
            'food_item_id' => 'sometimes|exists:food_items,id',
            'consumption_date' => 'sometimes|date',
            'meal_type' => ['sometimes', Rule::in(['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'])],
            'quantity' => 'sometimes|numeric|min:0.1|max:10000',
            'unit' => 'nullable|string|max:10',
            'notes' => 'nullable|string|max:1000',
            'mood' => ['nullable', Rule::in(['excellent', 'good', 'neutral', 'poor', 'terrible'])],
            'energy_level' => 'nullable|integer|min:1|max:10',
            'hunger_level' => 'nullable|integer|min:1|max:10',
            'was_planned' => 'boolean',
            'context' => 'nullable|array',
        ]);

        // Si se cambió el alimento o la cantidad, recalcular valores nutricionales
        if (isset($validated['food_item_id']) || isset($validated['quantity'])) {
            $foodItem = FoodItem::findOrFail($validated['food_item_id'] ?? $nutritionalData->food_item_id);
            $quantity = $validated['quantity'] ?? $nutritionalData->quantity;
            
            $nutrition = $foodItem->calculateNutritionForQuantity($quantity);
            
            $validated = array_merge($validated, [
                'calories' => $nutrition['calories'],
                'protein' => $nutrition['protein'],
                'carbs' => $nutrition['carbs'],
                'fat' => $nutrition['fat'],
                'fiber' => $nutrition['fiber'],
                'sugar' => $nutrition['sugar'],
                'sodium' => $nutrition['sodium'],
            ]);
        }

        $nutritionalData->update($validated);
        $nutritionalData->load('foodItem');

        return response()->json([
            'message' => 'Registro nutricional actualizado exitosamente',
            'data' => $nutritionalData
        ]);
    }

    /**
     * Eliminar un registro nutricional
     */
    public function destroy(NutritionalData $nutritionalData): JsonResponse
    {
        // Verificar que el registro pertenece al usuario autenticado
        if ($nutritionalData->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        $nutritionalData->delete();

        return response()->json([
            'message' => 'Registro nutricional eliminado exitosamente'
        ]);
    }

    /**
     * Obtener resumen diario
     */
    public function dailySummary(Request $request): JsonResponse
    {
        $date = $request->get('date', Carbon::today()->toDateString());
        $user = auth()->user();

        $summary = NutritionalData::getDailySummary($user->id, $date);
        $mealTypeSummary = NutritionalData::getMealTypeSummary($user->id, $date);
        $userProfile = $user->profile;

        // Evaluar adherencia si hay perfil
        $adherence = null;
        if ($userProfile && $summary) {
            $adherence = $this->evaluateAdherence($summary, $userProfile);
        }

        return response()->json([
            'message' => 'Resumen diario obtenido exitosamente',
            'data' => [
                'date' => $date,
                'summary' => $summary,
                'meal_type_summary' => $mealTypeSummary,
                'goals' => $userProfile ? [
                    'calories' => $userProfile->daily_calorie_goal,
                    'protein' => $userProfile->protein_goal,
                    'carbs' => $userProfile->carbs_goal,
                    'fat' => $userProfile->fat_goal,
                ] : null,
                'adherence' => $adherence
            ]
        ]);
    }

    /**
     * Obtener resumen semanal
     */
    public function weeklySummary(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfWeek()->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->endOfWeek()->toDateString());
        $user = auth()->user();

        $weeklyData = [];
        $currentDate = Carbon::parse($startDate);

        while ($currentDate->lte(Carbon::parse($endDate))) {
            $dateStr = $currentDate->toDateString();
            $summary = NutritionalData::getDailySummary($user->id, $dateStr);
            
            $weeklyData[] = [
                'date' => $dateStr,
                'summary' => $summary
            ];

            $currentDate->addDay();
        }

        return response()->json([
            'message' => 'Resumen semanal obtenido exitosamente',
            'data' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'weekly_data' => $weeklyData
            ]
        ]);
    }

    /**
     * Evaluar adherencia a objetivos
     */
    private function evaluateAdherence($summary, UserProfile $userProfile): array
    {
        $calorieDiff = abs($summary->total_calories - $userProfile->daily_calorie_goal);
        $proteinDiff = abs($summary->total_protein - $userProfile->protein_goal);
        $carbsDiff = abs($summary->total_carbs - $userProfile->carbs_goal);
        $fatDiff = abs($summary->total_fat - $userProfile->fat_goal);

        // Criterios de evaluación
        $calorieTolerance = 100;
        $macroTolerance = 15;

        if ($calorieDiff <= $calorieTolerance && 
            $proteinDiff <= $macroTolerance && 
            $carbsDiff <= $macroTolerance && 
            $fatDiff <= $macroTolerance) {
            return [
                'status' => 'green',
                'message' => 'Dentro del rango objetivo',
                'details' => [
                    'calories' => $calorieDiff <= $calorieTolerance ? 'green' : 'red',
                    'protein' => $proteinDiff <= $macroTolerance ? 'green' : 'red',
                    'carbs' => $carbsDiff <= $macroTolerance ? 'green' : 'red',
                    'fat' => $fatDiff <= $macroTolerance ? 'green' : 'red',
                ]
            ];
        } elseif ($calorieDiff <= 200 && 
                  $proteinDiff <= 25 && 
                  $carbsDiff <= 25 && 
                  $fatDiff <= 25) {
            return [
                'status' => 'yellow',
                'message' => 'Ligeramente fuera del rango',
                'details' => [
                    'calories' => $calorieDiff <= 200 ? 'yellow' : 'red',
                    'protein' => $proteinDiff <= 25 ? 'yellow' : 'red',
                    'carbs' => $carbsDiff <= 25 ? 'yellow' : 'red',
                    'fat' => $fatDiff <= 25 ? 'yellow' : 'red',
                ]
            ];
        } else {
            return [
                'status' => 'red',
                'message' => 'Significativamente fuera del rango',
                'details' => [
                    'calories' => 'red',
                    'protein' => 'red',
                    'carbs' => 'red',
                    'fat' => 'red',
                ]
            ];
        }
    }
}