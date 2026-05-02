# AI Weekly Meal Plan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add AI-generated weekly meal plan (today → Sunday, breakfast/lunch/dinner) to the weekly-meal-plans page, with per-slot recipe editing before saving.

**Architecture:** New `POST /weekly-meal-plans/ai-generate` returns JSON (not Inertia redirect). Frontend stores draft in React state, user edits slots via a recipe selector dialog, then saves with the existing `POST /weekly-meal-plans` Inertia route. `index` gains a `userRecipes` prop for the selector.

**Tech Stack:** Laravel 12, Inertia.js, React/TypeScript, DeepSeek API (Http facade), axios, Tailwind CSS, shadcn/ui Dialog

---

## Files

| File | Action |
|------|--------|
| `routes/web.php` | Add `POST /weekly-meal-plans/ai-generate` |
| `app/Http/Controllers/Web/WeeklyMealPlanController.php` | Add `aiGenerate()`, update `index()` |
| `resources/js/pages/weekly-meal-plans.tsx` | Full rewrite with draft plan UI |

---

## Task 1: Add route

**Files:**
- Modify: `routes/web.php`

- [ ] **Step 1: Add route after the existing weekly-meal-plans routes**

In `routes/web.php`, after:
```php
Route::get('weekly-meal-plans/today/plan', [WeeklyMealPlanController::class, 'getTodayPlan'])->name('weekly-meal-plans.today');
```

Add:
```php
Route::post('weekly-meal-plans/ai-generate', [WeeklyMealPlanController::class, 'aiGenerate'])->name('weekly-meal-plans.ai-generate');
```

- [ ] **Step 2: Commit**

```bash
git add routes/web.php
git commit -m "feat: add POST /weekly-meal-plans/ai-generate route"
```

---

## Task 2: Update `WeeklyMealPlanController::index` to pass `userRecipes`

**Files:**
- Modify: `app/Http/Controllers/Web/WeeklyMealPlanController.php`

- [ ] **Step 1: Add Recipe import at top of controller**

After existing `use` statements, add:
```php
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
```

- [ ] **Step 2: Update the `return Inertia::render(...)` inside `index()`**

Replace:
```php
return Inertia::render('weekly-meal-plans', [
    'plans' => $plans,
    'publicPlans' => $publicPlans,
    'stats' => $stats,
]);
```

With:
```php
$userRecipes = Recipe::where('user_id', $user->id)
    ->get(['id', 'name', 'category', 'calories_per_serving', 'description']);

return Inertia::render('weekly-meal-plans', [
    'plans'        => $plans,
    'publicPlans'  => $publicPlans,
    'stats'        => $stats,
    'userRecipes'  => $userRecipes,
]);
```

- [ ] **Step 3: Commit**

```bash
git add app/Http/Controllers/Web/WeeklyMealPlanController.php
git commit -m "feat: pass userRecipes prop to weekly-meal-plans page"
```

---

## Task 3: Implement `WeeklyMealPlanController::aiGenerate`

**Files:**
- Modify: `app/Http/Controllers/Web/WeeklyMealPlanController.php`

- [ ] **Step 1: Add `aiGenerate` method before the closing `}` of the class**

```php
public function aiGenerate(Request $request)
{
    $user = $request->user();
    $profile = $user->profile;

    if (!$profile) {
        return response()->json(['error' => 'Completa tu perfil antes de generar un plan.'], 422);
    }

    // Calculate days from today to Sunday
    $today = now()->startOfDay();
    $sunday = now()->endOfWeek(0); // 0 = Sunday
    if ($today->gt($sunday)) {
        $sunday = $today->copy()->addWeek()->endOfWeek(0);
    }

    $days = [];
    $current = $today->copy();
    $dayLabels = [
        'monday' => 'Lunes', 'tuesday' => 'Martes', 'wednesday' => 'Miércoles',
        'thursday' => 'Jueves', 'friday' => 'Viernes', 'saturday' => 'Sábado', 'sunday' => 'Domingo',
    ];
    $monthLabels = [
        1 => 'enero', 2 => 'febrero', 3 => 'marzo', 4 => 'abril',
        5 => 'mayo', 6 => 'junio', 7 => 'julio', 8 => 'agosto',
        9 => 'septiembre', 10 => 'octubre', 11 => 'noviembre', 12 => 'diciembre',
    ];

    while ($current->lte($sunday)) {
        $dayName = strtolower($current->format('l'));
        $days[] = [
            'date'      => $current->toDateString(),
            'day_label' => ($dayLabels[$dayName] ?? ucfirst($dayName)) . ' ' . $current->day . ' ' . $monthLabels[$current->month],
            'day_of_week' => $dayName,
        ];
        $current->addDay();
    }

    // Load user recipes
    $userRecipes = Recipe::where('user_id', $user->id)
        ->get(['id', 'name', 'category', 'calories_per_serving', 'description'])
        ->toArray();

    // Build prompt
    $slotsJson = json_encode(array_map(fn($d) => [
        'date'      => $d['date'],
        'day_label' => $d['day_label'],
        'slots'     => ['breakfast', 'lunch', 'dinner'],
    ], $days), JSON_UNESCAPED_UNICODE);

    $recipesJson = json_encode($userRecipes, JSON_UNESCAPED_UNICODE);

    $prompt = "Eres un nutricionista experto. Crea un plan de comidas semanal.\n\n"
        . "PERFIL:\n"
        . "- Peso: {$profile->weight}kg, Altura: {$profile->height}cm, Edad: {$profile->age}, Género: {$profile->gender}\n"
        . "- Metas: {$profile->daily_calorie_goal} kcal/día, {$profile->protein_goal}g proteína, {$profile->carbs_goal}g carbs\n"
        . "- Condiciones médicas: " . ($profile->medical_conditions ?? 'ninguna') . "\n"
        . "- Restricciones dietéticas: " . ($profile->dietary_restrictions ?? 'ninguna') . "\n\n"
        . "RECETAS DISPONIBLES DEL USUARIO:\n{$recipesJson}\n\n"
        . "DÍAS A PLANIFICAR:\n{$slotsJson}\n\n"
        . "Para cada slot, usa una receta existente por su 'id' si aplica, o crea una nueva.\n"
        . "Categorías: breakfast=desayuno, lunch=almuerzo, dinner=cena.\n"
        . "Responde SOLO con este JSON array:\n"
        . "[\n"
        . "  {\n"
        . "    \"date\": \"2026-05-02\",\n"
        . "    \"day_label\": \"Viernes 2 mayo\",\n"
        . "    \"meals\": {\n"
        . "      \"breakfast\": {\"recipe_id\": 5, \"new_recipe\": null},\n"
        . "      \"lunch\": {\"recipe_id\": null, \"new_recipe\": {\"name\":\"...\",\"description\":\"...\",\"category\":\"lunch\",\"calories_per_serving\":450,\"protein_g\":35,\"carbs_g\":40,\"fat_g\":12,\"ingredients\":[{\"name\":\"...\",\"quantity\":\"150\",\"unit\":\"g\"}],\"instructions\":[\"Paso 1...\"]}},\n"
        . "      \"dinner\": {\"recipe_id\": 3, \"new_recipe\": null}\n"
        . "    }\n"
        . "  }\n"
        . "]\n"
        . "Si usas recipe_id, pon new_recipe como null. Si creas nueva receta, pon recipe_id como null.";

    try {
        $apiKey = config('services.deepseek.api_key');

        if (!$apiKey) {
            return response()->json(['error' => 'El servicio de IA no está configurado.'], 422);
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type'  => 'application/json',
        ])->timeout(60)->post(config('services.deepseek.base_url') . '/chat/completions', [
            'model'       => config('services.deepseek.model'),
            'messages'    => [['role' => 'user', 'content' => $prompt]],
            'temperature' => 0.7,
            'max_tokens'  => 2000,
        ]);

        if (!$response->successful()) {
            Log::error('DeepSeek aiGenerate error', ['body' => $response->body()]);
            return response()->json(['error' => 'No se pudo generar el plan. Intenta nuevamente.'], 422);
        }

        $content = $response->json()['choices'][0]['message']['content'] ?? '';
        $jsonStart = strpos($content, '[');
        $jsonEnd   = strrpos($content, ']');

        if ($jsonStart === false || $jsonEnd === false) {
            throw new \Exception('JSON array not found');
        }

        $aiDays = json_decode(substr($content, $jsonStart, $jsonEnd - $jsonStart + 1), true);

        if (!$aiDays || !is_array($aiDays)) {
            throw new \Exception('Invalid JSON structure');
        }

        $mealLabels = ['breakfast' => 'Desayuno', 'lunch' => 'Almuerzo', 'dinner' => 'Cena'];
        $resolvedDays = [];

        foreach ($aiDays as $aiDay) {
            $resolvedMeals = [];

            foreach (['breakfast', 'lunch', 'dinner'] as $mealType) {
                $slot = $aiDay['meals'][$mealType] ?? null;
                $recipe = null;

                if ($slot && !empty($slot['recipe_id'])) {
                    // Use existing recipe
                    $recipe = Recipe::where('user_id', $user->id)
                        ->where('id', $slot['recipe_id'])
                        ->first(['id', 'name', 'calories_per_serving', 'description']);
                }

                if (!$recipe && $slot && !empty($slot['new_recipe'])) {
                    // Create new recipe
                    $nr = $slot['new_recipe'];
                    $recipe = Recipe::create([
                        'user_id'              => $user->id,
                        'name'                 => $nr['name'] ?? 'Receta sin nombre',
                        'description'          => $nr['description'] ?? null,
                        'category'             => $nr['category'] ?? $mealType,
                        'calories_per_serving' => $nr['calories_per_serving'] ?? null,
                        'protein_g'            => $nr['protein_g'] ?? null,
                        'carbs_g'              => $nr['carbs_g'] ?? null,
                        'fat_g'                => $nr['fat_g'] ?? null,
                        'instructions'         => $nr['instructions'] ?? [],
                        'servings'             => 1,
                        'difficulty'           => 'easy',
                        'is_public'            => false,
                    ]);

                    foreach (($nr['ingredients'] ?? []) as $idx => $ing) {
                        RecipeIngredient::create([
                            'recipe_id' => $recipe->id,
                            'name'      => $ing['name'] ?? 'Ingrediente',
                            'quantity'  => is_numeric($ing['quantity']) ? (float) $ing['quantity'] : 0,
                            'unit'      => $ing['unit'] ?? 'g',
                            'order'     => $idx,
                        ]);
                    }
                }

                if (!$recipe) {
                    // Fallback: create a minimal placeholder recipe
                    $recipe = Recipe::create([
                        'user_id'     => $user->id,
                        'name'        => $mealLabels[$mealType] . ' saludable',
                        'category'    => $mealType,
                        'servings'    => 1,
                        'difficulty'  => 'easy',
                        'is_public'   => false,
                        'instructions' => [],
                    ]);
                }

                $resolvedMeals[$mealType] = [
                    'meal_label' => $mealLabels[$mealType],
                    'recipe'     => [
                        'id'                   => $recipe->id,
                        'name'                 => $recipe->name,
                        'calories_per_serving' => $recipe->calories_per_serving,
                        'description'          => $recipe->description,
                    ],
                ];
            }

            $resolvedDays[] = [
                'date'      => $aiDay['date'],
                'day_label' => $aiDay['day_label'],
                'meals'     => $resolvedMeals,
            ];
        }

        $startDate = $days[0]['date'];
        $endDate   = end($days)['date'];

        return response()->json([
            'name'       => 'Plan semana ' . now()->format('d M'),
            'start_date' => $startDate,
            'end_date'   => $endDate,
            'days'       => $resolvedDays,
        ]);

    } catch (\Exception $e) {
        Log::error('aiGenerate exception', ['error' => $e->getMessage()]);
        return response()->json(['error' => 'Error al generar el plan. Intenta nuevamente.'], 422);
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/Http/Controllers/Web/WeeklyMealPlanController.php
git commit -m "feat: implement WeeklyMealPlanController::aiGenerate with DeepSeek"
```

---

## Task 4: Rewrite `weekly-meal-plans.tsx` frontend

**Files:**
- Modify: `resources/js/pages/weekly-meal-plans.tsx`

- [ ] **Step 1: Replace entire file content**

```tsx
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Target, ChefHat, CheckCircle2, TrendingUp, Sparkles, RefreshCw, Save } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

interface WeeklyMealPlan {
    id: number;
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    goal?: string;
    is_active: boolean;
    is_public: boolean;
    times_completed: number;
    recipes_count: number;
    target_calories?: number;
    duration_days: number;
    is_currently_active: boolean;
    created_at: string;
}

interface Stats {
    total_plans: number;
    active_plans: number;
    completed_plans: number;
}

interface UserRecipe {
    id: number;
    name: string;
    category: string | null;
    calories_per_serving: number | null;
    description: string | null;
}

interface GeneratedMeal {
    meal_label: string;
    recipe: {
        id: number;
        name: string;
        calories_per_serving: number | null;
        description: string | null;
    };
}

interface GeneratedDay {
    date: string;
    day_label: string;
    meals: {
        breakfast: GeneratedMeal;
        lunch: GeneratedMeal;
        dinner: GeneratedMeal;
    };
}

interface GeneratedPlan {
    name: string;
    start_date: string;
    end_date: string;
    days: GeneratedDay[];
}

interface WeeklyMealPlansProps {
    plans: WeeklyMealPlan[];
    publicPlans: WeeklyMealPlan[];
    stats: Stats;
    userRecipes: UserRecipe[];
}

export default function WeeklyMealPlans({ plans, publicPlans, stats, userRecipes }: WeeklyMealPlansProps) {
    const [draftPlan, setDraftPlan] = useState<GeneratedPlan | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [changeSlot, setChangeSlot] = useState<{ dayIdx: number; mealType: string } | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setAiError(null);
        setDraftPlan(null);
        try {
            const res = await axios.post('/weekly-meal-plans/ai-generate');
            setDraftPlan(res.data);
        } catch (e: any) {
            setAiError(e.response?.data?.error ?? 'Error al generar el plan.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSavePlan = () => {
        if (!draftPlan) return;
        setIsSaving(true);
        const recipes = draftPlan.days.flatMap((day) =>
            (['breakfast', 'lunch', 'dinner'] as const).map((mealType) => ({
                recipe_id: day.meals[mealType].recipe.id,
                day_of_week: new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
                meal_type: mealType,
                servings: 1,
            }))
        );

        router.post(
            '/weekly-meal-plans',
            {
                name: draftPlan.name,
                start_date: draftPlan.start_date,
                end_date: draftPlan.end_date,
                is_active: true,
                is_public: false,
                recipes,
            },
            { onFinish: () => setIsSaving(false) }
        );
    };

    const handleChangeRecipe = (recipe: UserRecipe) => {
        if (!changeSlot || !draftPlan) return;
        const updated = JSON.parse(JSON.stringify(draftPlan)) as GeneratedPlan;
        const mealType = changeSlot.mealType as 'breakfast' | 'lunch' | 'dinner';
        updated.days[changeSlot.dayIdx].meals[mealType].recipe = {
            id: recipe.id,
            name: recipe.name,
            calories_per_serving: recipe.calories_per_serving,
            description: recipe.description,
        };
        setDraftPlan(updated);
        setChangeSlot(null);
    };

    return (
        <AppLayout>
            <Head title="Planes de Comidas Semanales" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Planes de Comidas Semanales</h1>
                        <p className="text-muted-foreground">Organiza tus comidas de la semana</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Planes</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_plans}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Planes Activos</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_plans}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Planes Completados</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completed_plans}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* AI Generator */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Generar plan con IA
                        </CardTitle>
                        <CardDescription>
                            La IA crea un plan desde hoy hasta el domingo usando tu perfil y recetas existentes
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full md:w-auto">
                            {isGenerating ? (
                                <>
                                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent inline-block" />
                                    Analizando tu perfil y recetas...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generar plan para esta semana
                                </>
                            )}
                        </Button>

                        {aiError && (
                            <p className="text-sm text-destructive">{aiError}</p>
                        )}

                        {/* Draft plan */}
                        {draftPlan && (
                            <div className="space-y-4 mt-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">{draftPlan.name}</h3>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                                            <RefreshCw className="mr-1 h-3 w-3" />
                                            Regenerar
                                        </Button>
                                        <Button size="sm" onClick={handleSavePlan} disabled={isSaving}>
                                            <Save className="mr-1 h-3 w-3" />
                                            {isSaving ? 'Guardando...' : 'Guardar plan'}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {draftPlan.days.map((day, dayIdx) => (
                                        <Card key={day.date}>
                                            <CardHeader className="pb-2 pt-4 px-4">
                                                <CardTitle className="text-base">{day.day_label}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="px-4 pb-4 space-y-2">
                                                {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => {
                                                    const meal = day.meals[mealType];
                                                    return (
                                                        <div key={mealType} className="flex items-center justify-between py-1 border-b last:border-0">
                                                            <div className="flex-1">
                                                                <span className="text-xs text-muted-foreground w-20 inline-block">{meal.meal_label}</span>
                                                                <span className="text-sm font-medium">{meal.recipe.name}</span>
                                                                {meal.recipe.calories_per_serving && (
                                                                    <span className="ml-2 text-xs text-muted-foreground">
                                                                        {meal.recipe.calories_per_serving} kcal
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setChangeSlot({ dayIdx, mealType })}
                                                                className="text-xs"
                                                            >
                                                                Cambiar
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="my-plans" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="my-plans">Mis Planes</TabsTrigger>
                        <TabsTrigger value="public">Planes Públicos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="my-plans" className="space-y-4">
                        {plans.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No tienes planes semanales aún</p>
                                    <p className="text-sm text-muted-foreground">Genera uno con IA usando el botón de arriba</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {plans.map((plan) => (
                                    <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                {plan.name}
                                                {plan.is_currently_active && (
                                                    <Badge variant="default">Activo</Badge>
                                                )}
                                            </CardTitle>
                                            <CardDescription>{plan.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {plan.goal && (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Target className="h-3 w-3" />
                                                    <span>{plan.goal}</span>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <ChefHat className="h-3 w-3" />
                                                    <span>{plan.recipes_count} recetas</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{plan.duration_days} días</span>
                                                </div>
                                            </div>
                                            {plan.target_calories && (
                                                <div className="text-sm">
                                                    <span className="font-medium">{plan.target_calories}</span> kcal/día objetivo
                                                </div>
                                            )}
                                            <div className="text-xs text-muted-foreground">
                                                Completado {plan.times_completed} veces
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="public" className="space-y-4">
                        {publicPlans.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No hay planes públicos disponibles</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {publicPlans.map((plan) => (
                                    <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <CardTitle>{plan.name}</CardTitle>
                                            <CardDescription>{plan.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            {plan.goal && <Badge variant="outline">{plan.goal}</Badge>}
                                            <div className="text-sm text-muted-foreground">
                                                <ChefHat className="inline h-3 w-3 mr-1" />
                                                {plan.recipes_count} recetas
                                            </div>
                                            {plan.target_calories && (
                                                <div className="text-sm">{plan.target_calories} kcal/día</div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Change recipe dialog */}
            <Dialog open={changeSlot !== null} onOpenChange={(open) => !open && setChangeSlot(null)}>
                <DialogContent className="max-w-lg max-h-[70vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Cambiar receta</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 mt-2">
                        {userRecipes.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No tienes recetas guardadas aún.
                            </p>
                        ) : (
                            userRecipes.map((recipe) => (
                                <button
                                    key={recipe.id}
                                    onClick={() => handleChangeRecipe(recipe)}
                                    className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                                >
                                    <div className="font-medium text-sm">{recipe.name}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        {recipe.category && <span className="mr-2">{recipe.category}</span>}
                                        {recipe.calories_per_serving && <span>{recipe.calories_per_serving} kcal</span>}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/pages/weekly-meal-plans.tsx
git commit -m "feat: rewrite weekly-meal-plans page with AI generation and draft editing"
```

---

## Task 5: Push

- [ ] **Step 1: Push all commits**

```bash
git push origin main
```

Expected output:
```
To https://github.com/Devdprivity/NutricoachB.git
   <prev>...<new>  main -> main
```

---

## Self-Review

**Spec coverage:**
- ✅ Days today → Sunday
- ✅ Breakfast / lunch / dinner only
- ✅ Existing recipes used first, new ones generated + saved
- ✅ Per-slot [Cambiar] button with recipe selector dialog
- ✅ [Guardar plan] posts to existing /weekly-meal-plans route
- ✅ [Regenerar] button
- ✅ Existing tabs (Mis Planes / Planes Públicos) preserved
- ✅ Error handling for missing profile, DeepSeek failure, JSON parse failure
- ✅ Sunday edge case (if today is Sunday → 1 day)

**Placeholder scan:** None found.

**Type consistency:**
- `GeneratedMeal.recipe.id` is `number` — used in `handleSavePlan` as `recipe_id` ✅
- `changeSlot.mealType` cast to `'breakfast' | 'lunch' | 'dinner'` before indexing `day.meals` ✅
- `userRecipes` prop type matches what `index()` returns (`id, name, category, calories_per_serving, description`) ✅
