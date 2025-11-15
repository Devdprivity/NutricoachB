<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\FavoriteMeal;
use App\Models\MealRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FavoriteMealController extends Controller
{
    /**
     * Obtener todas las comidas favoritas del usuario
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $search = $request->query('search');
        $mealType = $request->query('meal_type');

        $query = FavoriteMeal::where('user_id', $user->id);

        if ($search) {
            $query->search($search);
        }

        if ($mealType) {
            $query->byMealType($mealType);
        }

        $favorites = $query->mostUsed()->get()->map(function ($meal) {
            return [
                'id' => $meal->id,
                'name' => $meal->name,
                'description' => $meal->description,
                'calories' => (float) $meal->calories,
                'protein' => (float) $meal->protein,
                'carbs' => (float) $meal->carbs,
                'fat' => (float) $meal->fat,
                'fiber' => $meal->fiber ? (float) $meal->fiber : null,
                'portion_size' => $meal->portion_size,
                'ingredients' => $meal->ingredients,
                'meal_type' => $meal->meal_type,
                'image_url' => $meal->image_url,
                'tags' => $meal->tags,
                'times_used' => $meal->times_used,
                'last_used_at' => $meal->last_used_at?->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json($favorites);
    }

    /**
     * Crear una nueva comida favorita
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'calories' => 'required|numeric|min:0',
            'protein' => 'nullable|numeric|min:0',
            'carbs' => 'nullable|numeric|min:0',
            'fat' => 'nullable|numeric|min:0',
            'fiber' => 'nullable|numeric|min:0',
            'portion_size' => 'nullable|string|max:255',
            'ingredients' => 'nullable|array',
            'meal_type' => 'nullable|string|in:breakfast,morning_snack,lunch,afternoon_snack,dinner,evening_snack,other',
            'image' => 'nullable|image|max:10240',
            'tags' => 'nullable|array',
        ]);

        $user = $request->user();
        $imagePath = null;

        // Subir imagen si existe
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('favorite_meals', 'public');
        }

        $favorite = FavoriteMeal::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'calories' => $validated['calories'],
            'protein' => $validated['protein'] ?? 0,
            'carbs' => $validated['carbs'] ?? 0,
            'fat' => $validated['fat'] ?? 0,
            'fiber' => $validated['fiber'] ?? null,
            'portion_size' => $validated['portion_size'] ?? null,
            'ingredients' => $validated['ingredients'] ?? null,
            'meal_type' => $validated['meal_type'] ?? null,
            'image_path' => $imagePath,
            'tags' => $validated['tags'] ?? null,
        ]);

        return response()->json([
            'message' => 'Comida favorita creada exitosamente',
            'favorite' => $favorite,
        ], 201);
    }

    /**
     * Guardar una comida existente como favorita
     */
    public function createFromMeal(Request $request, $mealId)
    {
        $user = $request->user();
        $meal = MealRecord::where('user_id', $user->id)->findOrFail($mealId);

        // Verificar si ya existe un favorito con el mismo nombre
        $existingName = $meal->food_items ?? $meal->ai_description ?? 'Mi comida favorita';
        $counter = 1;
        $name = $existingName;

        while (FavoriteMeal::where('user_id', $user->id)->where('name', $name)->exists()) {
            $name = $existingName . ' (' . $counter . ')';
            $counter++;
        }

        $favorite = FavoriteMeal::create([
            'user_id' => $user->id,
            'name' => $name,
            'description' => $meal->notes ?? null,
            'calories' => $meal->calories,
            'protein' => $meal->protein,
            'carbs' => $meal->carbs,
            'fat' => $meal->fat,
            'fiber' => $meal->fiber,
            'meal_type' => $meal->meal_type,
            'image_path' => $meal->image_path,
            'ingredients' => is_string($meal->food_items) ? [$meal->food_items] : null,
        ]);

        return response()->json([
            'message' => 'Comida guardada como favorita',
            'favorite' => $favorite,
        ], 201);
    }

    /**
     * Usar una comida favorita (crear registro de comida)
     */
    public function use(Request $request, $id)
    {
        $user = $request->user();
        $favorite = FavoriteMeal::where('user_id', $user->id)->findOrFail($id);

        $validated = $request->validate([
            'meal_type' => 'nullable|string|in:breakfast,morning_snack,lunch,afternoon_snack,dinner,evening_snack,other',
            'date' => 'nullable|date',
            'time' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        // Crear registro de comida
        MealRecord::create([
            'user_id' => $user->id,
            'date' => $validated['date'] ?? now()->toDateString(),
            'meal_type' => $validated['meal_type'] ?? $favorite->meal_type ?? 'other',
            'time' => $validated['time'] ?? now()->format('H:i'),
            'calories' => $favorite->calories,
            'protein' => $favorite->protein,
            'carbs' => $favorite->carbs,
            'fat' => $favorite->fat,
            'fiber' => $favorite->fiber,
            'food_items' => $favorite->name,
            'notes' => $validated['notes'] ?? $favorite->description,
            'image_path' => $favorite->image_path,
            'ai_analyzed' => false,
        ]);

        // Incrementar contador de uso
        $favorite->incrementUsage();

        return response()->json([
            'message' => 'Comida favorita registrada exitosamente',
        ]);
    }

    /**
     * Actualizar una comida favorita
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'calories' => 'sometimes|required|numeric|min:0',
            'protein' => 'nullable|numeric|min:0',
            'carbs' => 'nullable|numeric|min:0',
            'fat' => 'nullable|numeric|min:0',
            'fiber' => 'nullable|numeric|min:0',
            'portion_size' => 'nullable|string|max:255',
            'ingredients' => 'nullable|array',
            'meal_type' => 'nullable|string|in:breakfast,morning_snack,lunch,afternoon_snack,dinner,evening_snack,other',
            'tags' => 'nullable|array',
        ]);

        $user = $request->user();
        $favorite = FavoriteMeal::where('user_id', $user->id)->findOrFail($id);

        $favorite->update($validated);

        return response()->json([
            'message' => 'Comida favorita actualizada',
            'favorite' => $favorite,
        ]);
    }

    /**
     * Eliminar una comida favorita
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $favorite = FavoriteMeal::where('user_id', $user->id)->findOrFail($id);

        // Eliminar imagen si existe
        if ($favorite->image_path) {
            Storage::disk('public')->delete($favorite->image_path);
        }

        $favorite->delete();

        return response()->json([
            'message' => 'Comida favorita eliminada',
        ]);
    }
}
