<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecipeController extends Controller
{
    /**
     * Mostrar todas las recetas del usuario
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Recetas del usuario
        $myRecipes = Recipe::where('user_id', $user->id)
            ->withCount('ingredients')
            ->with(['ingredients' => function ($query) {
                $query->orderBy('order')->limit(5);
            }])
            ->latest()
            ->get();

        // Recetas públicas destacadas
        $publicRecipes = Recipe::where('is_public', true)
            ->where('user_id', '!=', $user->id)
            ->withCount('ingredients')
            ->orderBy('rating', 'desc')
            ->limit(12)
            ->get();

        // Estadísticas
        $stats = [
            'total_recipes' => Recipe::where('user_id', $user->id)->count(),
            'public_recipes' => Recipe::where('user_id', $user->id)->where('is_public', true)->count(),
            'total_times_cooked' => Recipe::where('user_id', $user->id)->sum('times_cooked'),
            'avg_rating' => Recipe::where('user_id', $user->id)->whereNotNull('rating')->avg('rating'),
        ];

        return Inertia::render('recipes', [
            'myRecipes' => $myRecipes,
            'publicRecipes' => $publicRecipes,
            'stats' => $stats,
        ]);
    }

    /**
     * Crear una nueva receta
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'prep_time_minutes' => 'nullable|integer|min:0',
            'cook_time_minutes' => 'nullable|integer|min:0',
            'servings' => 'required|integer|min:1',
            'difficulty' => 'required|in:easy,medium,hard',
            'instructions' => 'nullable|array',
            'image_url' => 'nullable|url',
            'is_public' => 'boolean',
            'calories_per_serving' => 'nullable|integer|min:0',
            'protein_g' => 'nullable|numeric|min:0',
            'carbs_g' => 'nullable|numeric|min:0',
            'fat_g' => 'nullable|numeric|min:0',
            'fiber_g' => 'nullable|numeric|min:0',
            'ingredients' => 'required|array|min:1',
            'ingredients.*.name' => 'required|string|max:255',
            'ingredients.*.quantity' => 'required|numeric|min:0',
            'ingredients.*.unit' => 'required|string|max:50',
            'ingredients.*.notes' => 'nullable|string',
            'ingredients.*.order' => 'nullable|integer|min:0',
        ]);

        $recipe = Recipe::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? null,
            'prep_time_minutes' => $validated['prep_time_minutes'] ?? null,
            'cook_time_minutes' => $validated['cook_time_minutes'] ?? null,
            'servings' => $validated['servings'],
            'difficulty' => $validated['difficulty'],
            'instructions' => $validated['instructions'] ?? null,
            'image_url' => $validated['image_url'] ?? null,
            'is_public' => $validated['is_public'] ?? false,
            'calories_per_serving' => $validated['calories_per_serving'] ?? null,
            'protein_g' => $validated['protein_g'] ?? null,
            'carbs_g' => $validated['carbs_g'] ?? null,
            'fat_g' => $validated['fat_g'] ?? null,
            'fiber_g' => $validated['fiber_g'] ?? null,
        ]);

        // Crear ingredientes
        foreach ($validated['ingredients'] as $index => $ingredientData) {
            RecipeIngredient::create([
                'recipe_id' => $recipe->id,
                'name' => $ingredientData['name'],
                'quantity' => $ingredientData['quantity'],
                'unit' => $ingredientData['unit'],
                'notes' => $ingredientData['notes'] ?? null,
                'order' => $ingredientData['order'] ?? $index,
            ]);
        }

        return redirect()->back()->with('success', 'Receta creada exitosamente');
    }

    /**
     * Ver detalles de una receta
     */
    public function show(Request $request, int $id): Response
    {
        $user = $request->user();

        $recipe = Recipe::with(['ingredients' => function ($query) {
            $query->orderBy('order');
        }, 'user'])
            ->where('id', $id)
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhere('is_public', true);
            })
            ->firstOrFail();

        return Inertia::render('recipe-detail', [
            'recipe' => $recipe,
        ]);
    }

    /**
     * Actualizar una receta
     */
    public function update(Request $request, int $id)
    {
        $recipe = Recipe::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'prep_time_minutes' => 'nullable|integer|min:0',
            'cook_time_minutes' => 'nullable|integer|min:0',
            'servings' => 'sometimes|integer|min:1',
            'difficulty' => 'sometimes|in:easy,medium,hard',
            'instructions' => 'nullable|array',
            'image_url' => 'nullable|url',
            'is_public' => 'boolean',
            'calories_per_serving' => 'nullable|integer|min:0',
            'protein_g' => 'nullable|numeric|min:0',
            'carbs_g' => 'nullable|numeric|min:0',
            'fat_g' => 'nullable|numeric|min:0',
            'fiber_g' => 'nullable|numeric|min:0',
            'rating' => 'nullable|numeric|min:0|max:5',
        ]);

        $recipe->update($validated);

        return redirect()->back()->with('success', 'Receta actualizada exitosamente');
    }

    /**
     * Eliminar una receta
     */
    public function destroy(Request $request, int $id)
    {
        $recipe = Recipe::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $recipe->delete();

        return redirect()->route('recipes')->with('success', 'Receta eliminada exitosamente');
    }

    /**
     * Marcar receta como cocinada
     */
    public function markAsCooked(Request $request, int $id)
    {
        $recipe = Recipe::where('id', $id)
            ->where(function ($query) use ($request) {
                $query->where('user_id', $request->user()->id)
                    ->orWhere('is_public', true);
            })
            ->firstOrFail();

        $recipe->incrementTimesCooked();

        return redirect()->back()->with('success', 'Receta marcada como cocinada');
    }

    /**
     * Buscar recetas
     */
    public function search(Request $request)
    {
        $query = $request->input('query');
        $category = $request->input('category');
        $difficulty = $request->input('difficulty');

        $recipes = Recipe::where(function ($q) use ($request) {
            $q->where('user_id', $request->user()->id)
                ->orWhere('is_public', true);
        })
            ->when($query, function ($q) use ($query) {
                $q->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%");
                });
            })
            ->when($category, function ($q) use ($category) {
                $q->where('category', $category);
            })
            ->when($difficulty, function ($q) use ($difficulty) {
                $q->where('difficulty', $difficulty);
            })
            ->withCount('ingredients')
            ->latest()
            ->limit(20)
            ->get();

        return response()->json($recipes);
    }
}
