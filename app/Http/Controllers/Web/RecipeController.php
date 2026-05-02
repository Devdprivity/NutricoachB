<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\HydrationRecord;
use App\Models\MealRecord;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
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

        $mealTimes = [
            ['type' => 'breakfast',       'label' => 'Desayuno',            'hour' => 7],
            ['type' => 'morning_snack',   'label' => 'Colación Matutina',   'hour' => 10],
            ['type' => 'lunch',           'label' => 'Almuerzo',            'hour' => 13],
            ['type' => 'afternoon_snack', 'label' => 'Colación Vespertina', 'hour' => 16],
            ['type' => 'dinner',          'label' => 'Cena',                'hour' => 19],
            ['type' => 'evening_snack',   'label' => 'Colación Nocturna',   'hour' => 21],
        ];

        $todayMeals = MealRecord::where('user_id', $user->id)
            ->whereDate('date', today())
            ->get();

        $recordedTypes = $todayMeals->pluck('meal_type')->toArray();
        $currentHour = now()->hour;
        $nextMealSuggestion = null;

        foreach ($mealTimes as $meal) {
            if ($currentHour <= $meal['hour'] && !in_array($meal['type'], $recordedTypes)) {
                $nextMealSuggestion = $meal;
                break;
            }
        }

        $aiSuggestedMealsToday = Recipe::where('user_id', $user->id)
            ->whereDate('suggested_date', today())
            ->whereNotNull('suggested_for_meal')
            ->pluck('suggested_for_meal')
            ->toArray();

        return Inertia::render('recipes', [
            'myRecipes'             => $myRecipes,
            'publicRecipes'         => $publicRecipes,
            'stats'                 => $stats,
            'nextMealSuggestion'    => $nextMealSuggestion,
            'aiSuggestedMealsToday' => $aiSuggestedMealsToday,
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

    public function aiSuggest(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        if (!$profile) {
            return redirect()->route('recipes')
                ->withErrors(['ai' => 'Completa tu perfil antes de usar sugerencias de IA.']);
        }

        $mealTimes = [
            ['type' => 'breakfast',       'label' => 'Desayuno',            'hour' => 7],
            ['type' => 'morning_snack',   'label' => 'Colación Matutina',   'hour' => 10],
            ['type' => 'lunch',           'label' => 'Almuerzo',            'hour' => 13],
            ['type' => 'afternoon_snack', 'label' => 'Colación Vespertina', 'hour' => 16],
            ['type' => 'dinner',          'label' => 'Cena',                'hour' => 19],
            ['type' => 'evening_snack',   'label' => 'Colación Nocturna',   'hour' => 21],
        ];

        $todayMeals = MealRecord::where('user_id', $user->id)
            ->whereDate('date', today())
            ->get();

        $recordedTypes = $todayMeals->pluck('meal_type')->toArray();
        $currentHour = now()->hour;
        $nextMeal = null;

        foreach ($mealTimes as $meal) {
            if ($currentHour <= $meal['hour'] && !in_array($meal['type'], $recordedTypes)) {
                $nextMeal = $meal;
                break;
            }
        }

        if (!$nextMeal) {
            return redirect()->route('recipes')
                ->withErrors(['ai' => 'No hay más comidas pendientes para hoy.']);
        }

        $existing = Recipe::where('user_id', $user->id)
            ->where('suggested_for_meal', $nextMeal['type'])
            ->whereDate('suggested_date', today())
            ->first();

        if ($existing) {
            return redirect()->route('recipes')
                ->withErrors(['ai' => 'Ya generaste una receta de ' . $nextMeal['label'] . ' para hoy.']);
        }

        $totalCalories = $todayMeals->sum('calories');
        $totalProtein  = $todayMeals->sum('protein');
        $totalCarbs    = $todayMeals->sum('carbs');

        $remainingCalories = max(0, ($profile->daily_calorie_goal ?? 2000) - $totalCalories);
        $remainingProtein  = max(0, ($profile->protein_goal ?? 50) - $totalProtein);
        $remainingCarbs    = max(0, ($profile->carbs_goal ?? 250) - $totalCarbs);

        $hydrationToday = HydrationRecord::where('user_id', $user->id)
            ->whereDate('created_at', today())
            ->sum('amount_ml');

        $mealsText = $todayMeals->isEmpty()
            ? 'Ninguna comida registrada aún hoy.'
            : $todayMeals->map(fn($m) =>
                "- {$m->meal_type}: {$m->calories} kcal, {$m->protein}g prot, {$m->carbs}g carbs, {$m->fat}g grasa"
                . ($m->ai_description ? " ({$m->ai_description})" : '')
              )->implode("\n");

        $prompt = "Eres un nutricionista experto. Genera una receta saludable basada en este contexto:\n\n"
            . "PERFIL:\n"
            . "- Peso: {$profile->weight}kg, Altura: {$profile->height}cm, Edad: {$profile->age}, Género: {$profile->gender}\n"
            . "- Metas diarias: {$profile->daily_calorie_goal} kcal, {$profile->protein_goal}g proteína, {$profile->carbs_goal}g carbs, {$profile->fat_goal}g grasa\n"
            . "- Condiciones médicas: " . ($profile->medical_conditions ?? 'ninguna') . "\n"
            . "- Restricciones dietéticas: " . ($profile->dietary_restrictions ?? 'ninguna') . "\n\n"
            . "COMIDAS DE HOY:\n{$mealsText}\n\n"
            . "HIDRATACIÓN HOY: {$hydrationToday}ml de " . ($profile->water_goal ?? 2000) . "ml\n\n"
            . "CALORÍAS RESTANTES: {$remainingCalories} kcal\n"
            . "PROTEÍNA RESTANTE: {$remainingProtein}g\n"
            . "CARBS RESTANTES: {$remainingCarbs}g\n\n"
            . "PRÓXIMA COMIDA: {$nextMeal['label']}\n\n"
            . "Genera una receta equilibrada, práctica y saludable para {$nextMeal['label']}.\n"
            . "Responde SOLO con este JSON sin texto adicional:\n"
            . "{\n"
            . "  \"name\": \"...\",\n"
            . "  \"description\": \"...\",\n"
            . "  \"category\": \"{$nextMeal['type']}\",\n"
            . "  \"prep_time_minutes\": 20,\n"
            . "  \"servings\": 1,\n"
            . "  \"calories_per_serving\": 450,\n"
            . "  \"protein_g\": 35,\n"
            . "  \"carbs_g\": 40,\n"
            . "  \"fat_g\": 12,\n"
            . "  \"ingredients\": [{\"name\": \"...\", \"quantity\": \"150\", \"unit\": \"g\"}],\n"
            . "  \"instructions\": [\"Paso 1...\", \"Paso 2...\"]\n"
            . "}";

        try {
            $apiKey = config('services.deepseek.api_key');

            if (!$apiKey) {
                return redirect()->route('recipes')
                    ->withErrors(['ai' => 'El servicio de IA no está configurado.']);
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type'  => 'application/json',
            ])->timeout(45)->post(config('services.deepseek.base_url') . '/chat/completions', [
                'model'       => config('services.deepseek.model'),
                'messages'    => [['role' => 'user', 'content' => $prompt]],
                'temperature' => 0.7,
                'max_tokens'  => 1000,
            ]);

            if (!$response->successful()) {
                Log::error('DeepSeek aiSuggest error', ['body' => $response->body()]);
                return redirect()->route('recipes')
                    ->withErrors(['ai' => 'No se pudo generar la receta. Intenta nuevamente.']);
            }

            $content = $response->json()['choices'][0]['message']['content'] ?? '';
            $jsonStart = strpos($content, '{');
            $jsonEnd   = strrpos($content, '}');

            if ($jsonStart === false || $jsonEnd === false) {
                throw new \Exception('JSON not found in response');
            }

            $data = json_decode(substr($content, $jsonStart, $jsonEnd - $jsonStart + 1), true);

            if (!$data || empty($data['name'])) {
                throw new \Exception('Invalid JSON structure');
            }

            $recipe = Recipe::create([
                'user_id'              => $user->id,
                'name'                 => $data['name'],
                'description'          => $data['description'] ?? null,
                'category'             => $data['category'] ?? $nextMeal['type'],
                'prep_time_minutes'    => $data['prep_time_minutes'] ?? null,
                'servings'             => $data['servings'] ?? 1,
                'calories_per_serving' => $data['calories_per_serving'] ?? null,
                'protein_g'            => $data['protein_g'] ?? null,
                'carbs_g'              => $data['carbs_g'] ?? null,
                'fat_g'                => $data['fat_g'] ?? null,
                'instructions'         => $data['instructions'] ?? [],
                'difficulty'           => 'easy',
                'is_public'            => false,
                'suggested_for_meal'   => $nextMeal['type'],
                'suggested_date'       => today(),
            ]);

            foreach (($data['ingredients'] ?? []) as $index => $ing) {
                RecipeIngredient::create([
                    'recipe_id' => $recipe->id,
                    'name'      => $ing['name'] ?? 'Ingrediente',
                    'quantity'  => is_numeric($ing['quantity']) ? (float) $ing['quantity'] : 0,
                    'unit'      => $ing['unit'] ?? 'g',
                    'order'     => $index,
                ]);
            }

            return redirect()->route('recipes')
                ->with('success', "Receta para {$nextMeal['label']} generada con IA.");

        } catch (\Exception $e) {
            Log::error('aiSuggest exception', ['error' => $e->getMessage()]);
            return redirect()->route('recipes')
                ->withErrors(['ai' => 'Error al generar la receta. Intenta nuevamente.']);
        }
    }
}
