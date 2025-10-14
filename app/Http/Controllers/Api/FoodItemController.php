<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FoodItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class FoodItemController extends Controller
{
    /**
     * Obtener lista de alimentos con filtros
     */
    public function index(Request $request): JsonResponse
    {
        $query = FoodItem::active();

        // Filtros
        if ($request->has('search')) {
            $query->search($request->search);
        }

        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        if ($request->has('tags')) {
            $tags = is_array($request->tags) ? $request->tags : explode(',', $request->tags);
            $query->byTags($tags);
        }

        if ($request->has('high_protein')) {
            $query->highProtein();
        }

        if ($request->has('low_carb')) {
            $query->lowCarb();
        }

        if ($request->has('healthy')) {
            $query->healthy();
        }

        $perPage = $request->get('per_page', 20);
        $foodItems = $query->paginate($perPage);

        return response()->json([
            'message' => 'Alimentos obtenidos exitosamente',
            'data' => $foodItems
        ]);
    }

    /**
     * Obtener un alimento específico
     */
    public function show(FoodItem $foodItem): JsonResponse
    {
        if (!$foodItem->is_active) {
            return response()->json([
                'message' => 'Alimento no encontrado'
            ], 404);
        }

        return response()->json([
            'message' => 'Alimento obtenido exitosamente',
            'data' => $foodItem
        ]);
    }

    /**
     * Crear un nuevo alimento (solo para administradores)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => ['required', Rule::in(['protein', 'carbohydrate', 'fat', 'vegetable', 'fruit', 'dairy', 'supplement', 'other'])],
            'calories_per_100g' => 'required|integer|min:0|max:1000',
            'protein_per_100g' => 'required|numeric|min:0|max:100',
            'carbs_per_100g' => 'required|numeric|min:0|max:100',
            'fat_per_100g' => 'required|numeric|min:0|max:100',
            'fiber_per_100g' => 'nullable|numeric|min:0|max:100',
            'sugar_per_100g' => 'nullable|numeric|min:0|max:100',
            'sodium_per_100g' => 'nullable|numeric|min:0|max:10000',
            'unit' => 'nullable|string|max:10',
            'is_cooked' => 'boolean',
            'cooking_method' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $foodItem = FoodItem::create($validated);

        return response()->json([
            'message' => 'Alimento creado exitosamente',
            'data' => $foodItem
        ], 201);
    }

    /**
     * Actualizar un alimento (solo para administradores)
     */
    public function update(Request $request, FoodItem $foodItem): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => ['sometimes', Rule::in(['protein', 'carbohydrate', 'fat', 'vegetable', 'fruit', 'dairy', 'supplement', 'other'])],
            'calories_per_100g' => 'sometimes|integer|min:0|max:1000',
            'protein_per_100g' => 'sometimes|numeric|min:0|max:100',
            'carbs_per_100g' => 'sometimes|numeric|min:0|max:100',
            'fat_per_100g' => 'sometimes|numeric|min:0|max:100',
            'fiber_per_100g' => 'nullable|numeric|min:0|max:100',
            'sugar_per_100g' => 'nullable|numeric|min:0|max:100',
            'sodium_per_100g' => 'nullable|numeric|min:0|max:10000',
            'unit' => 'nullable|string|max:10',
            'is_cooked' => 'boolean',
            'cooking_method' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'is_active' => 'boolean',
        ]);

        $foodItem->update($validated);

        return response()->json([
            'message' => 'Alimento actualizado exitosamente',
            'data' => $foodItem
        ]);
    }

    /**
     * Eliminar un alimento (solo para administradores)
     */
    public function destroy(FoodItem $foodItem): JsonResponse
    {
        $foodItem->delete();

        return response()->json([
            'message' => 'Alimento eliminado exitosamente'
        ]);
    }

    /**
     * Calcular valores nutricionales para una cantidad específica
     */
    public function calculateNutrition(Request $request, FoodItem $foodItem): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.1|max:10000',
            'unit' => 'nullable|string|max:10'
        ]);

        $nutrition = $foodItem->calculateNutritionForQuantity($validated['quantity']);

        return response()->json([
            'message' => 'Valores nutricionales calculados exitosamente',
            'data' => [
                'food_item' => $foodItem,
                'quantity' => $validated['quantity'],
                'unit' => $validated['unit'] ?? 'g',
                'nutrition' => $nutrition
            ]
        ]);
    }

    /**
     * Obtener categorías disponibles
     */
    public function categories(): JsonResponse
    {
        $categories = [
            'protein' => 'Proteínas',
            'carbohydrate' => 'Carbohidratos',
            'fat' => 'Grasas',
            'vegetable' => 'Verduras',
            'fruit' => 'Frutas',
            'dairy' => 'Lácteos',
            'supplement' => 'Suplementos',
            'other' => 'Otros'
        ];

        return response()->json([
            'message' => 'Categorías obtenidas exitosamente',
            'data' => $categories
        ]);
    }

    /**
     * Obtener etiquetas populares
     */
    public function popularTags(): JsonResponse
    {
        $tags = [
            'healthy', 'high-protein', 'low-carb', 'low-fat', 'high-fiber',
            'gluten-free', 'dairy-free', 'vegan', 'vegetarian', 'organic',
            'processed', 'whole-food', 'fast-food', 'homemade'
        ];

        return response()->json([
            'message' => 'Etiquetas populares obtenidas exitosamente',
            'data' => $tags
        ]);
    }
}