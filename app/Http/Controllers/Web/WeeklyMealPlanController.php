<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\WeeklyMealPlan;
use App\Models\Recipe;
use Illuminate\Http\Request;
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

        // Estadísticas
        $stats = [
            'total_plans' => WeeklyMealPlan::where('user_id', $user->id)->count(),
            'active_plans' => WeeklyMealPlan::where('user_id', $user->id)->where('is_active', true)->count(),
            'completed_plans' => WeeklyMealPlan::where('user_id', $user->id)->sum('times_completed'),
        ];

        return Inertia::render('weekly-meal-plans', [
            'plans' => $plans,
            'publicPlans' => $publicPlans,
            'stats' => $stats,
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
