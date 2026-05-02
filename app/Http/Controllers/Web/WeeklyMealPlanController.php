<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\WeeklyMealPlan;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class WeeklyMealPlanController extends Controller
{
    /**
     * Mostrar todos los planes semanales del usuario
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $plans = WeeklyMealPlan::where('user_id', $user->id)
            ->withCount('recipes')
            ->latest()
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'description' => $plan->description,
                    'start_date' => $plan->start_date->toISOString(),
                    'end_date' => $plan->end_date->toISOString(),
                    'goal' => $plan->goal,
                    'is_active' => $plan->is_active,
                    'is_public' => $plan->is_public,
                    'times_completed' => $plan->times_completed,
                    'recipes_count' => $plan->recipes_count,
                    'target_calories' => $plan->target_calories,
                    'duration_days' => $plan->duration_days,
                    'is_currently_active' => $plan->isCurrentlyActive(),
                    'created_at' => $plan->created_at->toISOString(),
                ];
            });

        // Planes públicos destacados
        $publicPlans = WeeklyMealPlan::where('is_public', true)
            ->where('user_id', '!=', $user->id)
            ->withCount('recipes')
            ->latest()
            ->limit(6)
            ->get();

        // Stats in a single query
        $statsRow = WeeklyMealPlan::where('user_id', $user->id)
            ->selectRaw('COUNT(*) as total_plans, SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_plans, COALESCE(SUM(times_completed), 0) as completed_plans')
            ->first();
        $stats = [
            'total_plans' => (int) ($statsRow->total_plans ?? 0),
            'active_plans' => (int) ($statsRow->active_plans ?? 0),
            'completed_plans' => (int) ($statsRow->completed_plans ?? 0),
        ];

        $userRecipes = Recipe::where('user_id', $user->id)
            ->get(['id', 'name', 'category', 'calories_per_serving', 'description']);

        return Inertia::render('weekly-meal-plans', [
            'plans' => $plans,
            'publicPlans' => $publicPlans,
            'stats' => $stats,
            'userRecipes' => $userRecipes,
        ]);
    }

    /**
     * Crear un nuevo plan semanal
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'daily_schedule' => 'nullable|array',
            'target_calories' => 'nullable|integer|min:0',
            'target_protein_g' => 'nullable|numeric|min:0',
            'target_carbs_g' => 'nullable|numeric|min:0',
            'target_fat_g' => 'nullable|numeric|min:0',
            'goal' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
            'recipes' => 'nullable|array',
            'recipes.*.recipe_id' => 'required|exists:recipes,id',
            'recipes.*.day_of_week' => 'required|string',
            'recipes.*.meal_type' => 'required|string',
            'recipes.*.servings' => 'required|integer|min:1',
        ]);

        $plan = WeeklyMealPlan::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'daily_schedule' => $validated['daily_schedule'] ?? null,
            'target_calories' => $validated['target_calories'] ?? null,
            'target_protein_g' => $validated['target_protein_g'] ?? null,
            'target_carbs_g' => $validated['target_carbs_g'] ?? null,
            'target_fat_g' => $validated['target_fat_g'] ?? null,
            'goal' => $validated['goal'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'is_public' => $validated['is_public'] ?? false,
        ]);

        // Asociar recetas al plan
        if (isset($validated['recipes'])) {
            foreach ($validated['recipes'] as $recipeData) {
                $plan->recipes()->attach($recipeData['recipe_id'], [
                    'day_of_week' => $recipeData['day_of_week'],
                    'meal_type' => $recipeData['meal_type'],
                    'servings' => $recipeData['servings'],
                ]);
            }
        }

        return redirect()->back()->with('success', 'Plan semanal creado exitosamente');
    }

    /**
     * Ver detalles de un plan semanal
     */
    public function show(Request $request, int $id): Response
    {
        $user = $request->user();

        $plan = WeeklyMealPlan::with(['recipes.ingredients'])
            ->where('id', $id)
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhere('is_public', true);
            })
            ->firstOrFail();

        // Organizar recetas por día y tipo de comida
        $schedule = [];
        foreach ($plan->recipes as $recipe) {
            $day = $recipe->pivot->day_of_week;
            $mealType = $recipe->pivot->meal_type;

            if (!isset($schedule[$day])) {
                $schedule[$day] = [];
            }

            $schedule[$day][$mealType] = [
                'recipe' => $recipe,
                'servings' => $recipe->pivot->servings,
            ];
        }

        return Inertia::render('weekly-meal-plan-detail', [
            'plan' => $plan,
            'schedule' => $schedule,
        ]);
    }

    /**
     * Actualizar un plan semanal
     */
    public function update(Request $request, int $id)
    {
        $plan = WeeklyMealPlan::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'daily_schedule' => 'nullable|array',
            'target_calories' => 'nullable|integer|min:0',
            'target_protein_g' => 'nullable|numeric|min:0',
            'target_carbs_g' => 'nullable|numeric|min:0',
            'target_fat_g' => 'nullable|numeric|min:0',
            'goal' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
        ]);

        $plan->update($validated);

        return redirect()->back()->with('success', 'Plan actualizado exitosamente');
    }

    /**
     * Eliminar un plan semanal
     */
    public function destroy(Request $request, int $id)
    {
        $plan = WeeklyMealPlan::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $plan->delete();

        return redirect()->route('weekly-meal-plans')->with('success', 'Plan eliminado exitosamente');
    }

    /**
     * Agregar receta a un plan
     */
    public function addRecipe(Request $request, int $id)
    {
        $plan = WeeklyMealPlan::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'recipe_id' => 'required|exists:recipes,id',
            'day_of_week' => 'required|string',
            'meal_type' => 'required|string',
            'servings' => 'required|integer|min:1',
        ]);

        $plan->recipes()->attach($validated['recipe_id'], [
            'day_of_week' => $validated['day_of_week'],
            'meal_type' => $validated['meal_type'],
            'servings' => $validated['servings'],
        ]);

        return redirect()->back()->with('success', 'Receta agregada al plan');
    }

    /**
     * Remover receta de un plan
     */
    public function removeRecipe(Request $request, int $planId, int $recipeId)
    {
        $plan = WeeklyMealPlan::where('id', $planId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $plan->recipes()->detach($recipeId);

        return redirect()->back()->with('success', 'Receta removida del plan');
    }

    /**
     * Generar plan semanal con IA
     */
    public function aiGenerate(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        if (!$profile || !$profile->weight || !$profile->height || !$profile->age || !$profile->gender) {
            return response()->json(['error' => 'Completa tu perfil antes de generar un plan.'], 422);
        }

        // Days from today to Sunday
        $today = Carbon::today();
        $sunday = Carbon::today()->endOfWeek(Carbon::SUNDAY);
        $days = [];
        $current = $today->copy();
        $dayLabels = [
            'Monday' => 'Lunes', 'Tuesday' => 'Martes', 'Wednesday' => 'Miércoles',
            'Thursday' => 'Jueves', 'Friday' => 'Viernes', 'Saturday' => 'Sábado', 'Sunday' => 'Domingo',
        ];
        $monthLabels = [
            1 => 'enero', 2 => 'febrero', 3 => 'marzo', 4 => 'abril', 5 => 'mayo', 6 => 'junio',
            7 => 'julio', 8 => 'agosto', 9 => 'septiembre', 10 => 'octubre', 11 => 'noviembre', 12 => 'diciembre',
        ];
        while ($current->lte($sunday)) {
            $days[] = [
                'date' => $current->toDateString(),
                'day_label' => $dayLabels[$current->format('l')] . ' ' . $current->day . ' ' . $monthLabels[(int)$current->month],
                'meals' => ['breakfast', 'lunch', 'dinner'],
            ];
            $current->addDay();
        }

        // User recipes grouped
        $recipes = Recipe::where('user_id', $user->id)
            ->get(['id', 'name', 'category', 'calories_per_serving'])
            ->toArray();

        $categoryMap = [
            'breakfast' => 'breakfast', 'desayuno' => 'breakfast',
            'lunch' => 'lunch', 'almuerzo' => 'lunch',
            'dinner' => 'dinner', 'cena' => 'dinner',
        ];
        $mappedRecipes = array_map(function ($r) use ($categoryMap) {
            $r['category'] = $categoryMap[strtolower($r['category'] ?? '')] ?? 'lunch';
            return $r;
        }, $recipes);

        $prompt = "Eres un nutricionista experto. Crea un plan de comidas semanal.\n\n"
            . "PERFIL:\n"
            . "- Peso: {$profile->weight}kg, Altura: {$profile->height}cm, Edad: {$profile->age}, Género: {$profile->gender}\n"
            . "- Metas: " . ($profile->daily_calorie_goal ?? 'N/A') . " kcal/día, "
            . ($profile->protein_goal ?? 'N/A') . "g proteína, "
            . ($profile->carbs_goal ?? 'N/A') . "g carbs\n"
            . "- Condiciones médicas: " . ($profile->medical_conditions ?? 'Ninguna') . "\n"
            . "- Restricciones dietéticas: " . ($profile->dietary_restrictions ?? 'Ninguna') . "\n\n"
            . "RECETAS DISPONIBLES DEL USUARIO:\n"
            . json_encode($mappedRecipes, JSON_UNESCAPED_UNICODE) . "\n\n"
            . "DÍAS A PLANIFICAR:\n"
            . json_encode($days, JSON_UNESCAPED_UNICODE) . "\n\n"
            . "Para cada slot, usa una receta existente (por su id) si es apropiada, o crea una nueva.\n"
            . "Responde SOLO con este JSON (sin markdown, sin texto extra):\n"
            . '[{"date":"2026-05-02","day_label":"Viernes 2 mayo","meals":{"breakfast":{"recipe_id":5},"lunch":{"recipe_id":null,"new_recipe":{"name":"...","description":"...","category":"lunch","calories_per_serving":450,"protein_g":35,"carbs_g":40,"fat_g":12,"ingredients":[{"name":"...","quantity":"150","unit":"g"}],"instructions":["Paso 1..."]}},"dinner":{"recipe_id":3}}}]';

        try {
            $response = Http::timeout(60)->withHeaders([
                'Authorization' => 'Bearer ' . config('services.deepseek.api_key'),
                'Content-Type' => 'application/json',
            ])->post('https://api.deepseek.com/v1/chat/completions', [
                'model' => 'deepseek-chat',
                'max_tokens' => 3000,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

            if (!$response->successful()) {
                return response()->json(['error' => 'No se pudo generar el plan. Intenta nuevamente.'], 500);
            }

            $content = $response->json()['choices'][0]['message']['content'] ?? '';
            // Strip markdown code fences if present
            $content = preg_replace('/^```(?:json)?\n?/i', '', trim($content));
            $content = preg_replace('/\n?```$/', '', $content);

            $aiDays = json_decode($content, true);
            if (!is_array($aiDays)) {
                return response()->json(['error' => 'Error al procesar la respuesta de IA.'], 500);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'No se pudo generar el plan. Intenta nuevamente.'], 500);
        }

        $mealLabels = ['breakfast' => 'Desayuno', 'lunch' => 'Almuerzo', 'dinner' => 'Cena'];
        $resolvedDays = [];

        foreach ($aiDays as $day) {
            $resolvedMeals = [];
            foreach ($day['meals'] as $mealType => $slot) {
                $recipe = null;

                if (!empty($slot['recipe_id'])) {
                    $existing = Recipe::where('id', $slot['recipe_id'])
                        ->where('user_id', $user->id)
                        ->first();
                    if ($existing) {
                        $recipe = [
                            'id' => $existing->id,
                            'name' => $existing->name,
                            'calories_per_serving' => $existing->calories_per_serving,
                            'description' => $existing->description,
                        ];
                    }
                }

                if (!$recipe && !empty($slot['new_recipe'])) {
                    $nr = $slot['new_recipe'];
                    $newRecipe = Recipe::create([
                        'user_id' => $user->id,
                        'name' => $nr['name'],
                        'description' => $nr['description'] ?? null,
                        'category' => $nr['category'] ?? $mealType,
                        'calories_per_serving' => $nr['calories_per_serving'] ?? null,
                        'protein_g' => $nr['protein_g'] ?? null,
                        'carbs_g' => $nr['carbs_g'] ?? null,
                        'fat_g' => $nr['fat_g'] ?? null,
                        'instructions' => $nr['instructions'] ?? [],
                        'prep_time_minutes' => null,
                        'cook_time_minutes' => null,
                        'servings' => 1,
                    ]);

                    if (!empty($nr['ingredients']) && is_array($nr['ingredients'])) {
                        foreach ($nr['ingredients'] as $ing) {
                            RecipeIngredient::create([
                                'recipe_id' => $newRecipe->id,
                                'name' => $ing['name'],
                                'quantity' => is_numeric($ing['quantity']) ? (float)$ing['quantity'] : 0,
                                'unit' => $ing['unit'] ?? '',
                            ]);
                        }
                    }

                    $recipe = [
                        'id' => $newRecipe->id,
                        'name' => $newRecipe->name,
                        'calories_per_serving' => $newRecipe->calories_per_serving,
                        'description' => $newRecipe->description,
                    ];
                }

                if (!$recipe) {
                    $recipe = ['id' => 0, 'name' => 'Sin receta', 'calories_per_serving' => null, 'description' => null];
                }

                $resolvedMeals[$mealType] = [
                    'meal_label' => $mealLabels[$mealType] ?? ucfirst($mealType),
                    'recipe' => $recipe,
                ];
            }

            $resolvedDays[] = [
                'date' => $day['date'],
                'day_label' => $day['day_label'],
                'meals' => $resolvedMeals,
            ];
        }

        $startDate = $resolvedDays[0]['date'] ?? $today->toDateString();
        $endDate = $resolvedDays[count($resolvedDays) - 1]['date'] ?? $sunday->toDateString();
        $planName = 'Plan semana ' . $today->day . ' ' . $monthLabels[(int)$today->month]
            . ' - ' . $sunday->day . ' ' . $monthLabels[(int)$sunday->month];

        return response()->json([
            'name' => $planName,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'days' => $resolvedDays,
        ]);
    }

    /**
     * Obtener plan activo para hoy
     */
    public function getTodayPlan(Request $request)
    {
        $user = $request->user();
        $today = now();
        $dayOfWeek = strtolower($today->format('l'));

        $activePlan = WeeklyMealPlan::where('user_id', $user->id)
            ->where('is_active', true)
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->with(['recipes' => function ($query) use ($dayOfWeek) {
                $query->wherePivot('day_of_week', $dayOfWeek);
            }])
            ->first();

        return response()->json([
            'plan' => $activePlan,
            'day_of_week' => $dayOfWeek,
        ]);
    }
}
