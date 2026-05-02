# AI Recipe Suggestion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Sugerir receta con IA" button in the create recipe modal that automatically generates and saves a complete recipe based on the user's profile, today's meals, and hydration.

**Architecture:** New `POST /recipes/ai-suggest` route handled by `RecipeController::aiSuggest`. The method gathers user context, calls DeepSeek, parses the JSON response, and saves `Recipe` + `RecipeIngredient` records directly. The recipes page receives two new props to control button state.

**Tech Stack:** Laravel 12, Inertia.js, React/TypeScript, DeepSeek API (HTTP facade), Tailwind CSS

---

## Task 1: Migration — add AI suggestion columns to recipes table

**Files:**
- Create: `database/migrations/2026_05_02_000001_add_ai_suggestion_fields_to_recipes_table.php`

- [ ] **Step 1: Create migration file**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            $table->string('suggested_for_meal')->nullable()->after('rating');
            $table->date('suggested_date')->nullable()->after('suggested_for_meal');
            $table->index(['user_id', 'suggested_for_meal', 'suggested_date'], 'recipes_ai_suggestion_index');
        });
    }

    public function down(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            $table->dropIndex('recipes_ai_suggestion_index');
            $table->dropColumn(['suggested_for_meal', 'suggested_date']);
        });
    }
};
```

- [ ] **Step 2: Commit migration**

```bash
git add database/migrations/2026_05_02_000001_add_ai_suggestion_fields_to_recipes_table.php
git commit -m "feat: migration add suggested_for_meal and suggested_date to recipes"
```

---

## Task 2: Update Recipe model

**Files:**
- Modify: `app/Models/Recipe.php`

- [ ] **Step 1: Add fields to `$fillable` and `$casts`**

In `app/Models/Recipe.php`, add to `$fillable` array (after `'rating'`):
```php
'suggested_for_meal',
'suggested_date',
```

Add to `$casts` array (after `'rating' => 'float'`):
```php
'suggested_date' => 'date',
```

- [ ] **Step 2: Commit**

```bash
git add app/Models/Recipe.php
git commit -m "feat: add suggested_for_meal and suggested_date to Recipe model"
```

---

## Task 3: Add route

**Files:**
- Modify: `routes/web.php`

- [ ] **Step 1: Add route after `recipes.search`**

In `routes/web.php`, after line:
```php
Route::get('recipes/search/query', [RecipeController::class, 'search'])->name('recipes.search');
```

Add:
```php
Route::post('recipes/ai-suggest', [RecipeController::class, 'aiSuggest'])->name('recipes.ai-suggest');
```

- [ ] **Step 2: Commit**

```bash
git add routes/web.php
git commit -m "feat: add POST /recipes/ai-suggest route"
```

---

## Task 4: Implement `RecipeController::aiSuggest`

**Files:**
- Modify: `app/Http/Controllers/Web/RecipeController.php`

- [ ] **Step 1: Add imports at top of RecipeController**

After existing `use` statements, add:
```php
use App\Models\HydrationRecord;
use App\Models\MealRecord;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
```

- [ ] **Step 2: Add `aiSuggest` method to RecipeController**

Add after the `search` method:

```php
public function aiSuggest(Request $request)
{
    $user = $request->user();
    $profile = $user->profile;

    if (!$profile) {
        return redirect()->route('recipes')
            ->withErrors(['ai' => 'Completa tu perfil antes de usar sugerencias de IA.']);
    }

    // Determine next meal type
    $mealTimes = [
        ['type' => 'breakfast',        'label' => 'Desayuno',             'hour' => 7],
        ['type' => 'morning_snack',    'label' => 'Colación Matutina',    'hour' => 10],
        ['type' => 'lunch',            'label' => 'Almuerzo',             'hour' => 13],
        ['type' => 'afternoon_snack',  'label' => 'Colación Vespertina',  'hour' => 16],
        ['type' => 'dinner',           'label' => 'Cena',                 'hour' => 19],
        ['type' => 'evening_snack',    'label' => 'Colación Nocturna',    'hour' => 21],
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

    // Check duplicate suggestion for this meal type today
    $existingSuggestion = Recipe::where('user_id', $user->id)
        ->where('suggested_for_meal', $nextMeal['type'])
        ->whereDate('suggested_date', today())
        ->first();

    if ($existingSuggestion) {
        return redirect()->route('recipes')
            ->withErrors(['ai' => 'Ya generaste una receta de ' . $nextMeal['label'] . ' para hoy.']);
    }

    // Build context
    $totalCalories   = $todayMeals->sum('calories');
    $totalProtein    = $todayMeals->sum('protein');
    $totalCarbs      = $todayMeals->sum('carbs');
    $totalFat        = $todayMeals->sum('fat');

    $remainingCalories = max(0, ($profile->daily_calorie_goal ?? 2000) - $totalCalories);
    $remainingProtein  = max(0, ($profile->protein_goal ?? 50) - $totalProtein);
    $remainingCarbs    = max(0, ($profile->carbs_goal ?? 250) - $totalCarbs);

    $hydrationToday = HydrationRecord::where('user_id', $user->id)
        ->whereDate('created_at', today())
        ->sum('amount_ml');

    $mealsText = $todayMeals->isEmpty()
        ? 'Ninguna comida registrada aún hoy.'
        : $todayMeals->map(fn($m) => "- {$m->meal_type}: {$m->calories} kcal, {$m->protein}g prot, {$m->carbs}g carbs, {$m->fat}g grasa" . ($m->ai_description ? " ({$m->ai_description})" : ''))->implode("\n");

    $prompt = "Eres un nutricionista experto. Genera una receta saludable basada en este contexto:\n\n"
        . "PERFIL:\n"
        . "- Objetivo: {$profile->activity_level}\n"
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
        . "Genera una receta equilibrada, práctica y saludable para {$nextMeal['label']} considerando lo anterior.\n"
        . "Responde SOLO con este JSON sin texto adicional:\n"
        . "{\n"
        . '  "name": "...",' . "\n"
        . '  "description": "...",' . "\n"
        . '  "category": "' . $nextMeal['type'] . '",' . "\n"
        . '  "prep_time_minutes": 20,' . "\n"
        . '  "servings": 1,' . "\n"
        . '  "calories_per_serving": 450,' . "\n"
        . '  "protein_g": 35,' . "\n"
        . '  "carbs_g": 40,' . "\n"
        . '  "fat_g": 12,' . "\n"
        . '  "ingredients": [{"name": "...", "quantity": "150", "unit": "g"}],' . "\n"
        . '  "instructions": ["Paso 1...", "Paso 2..."]' . "\n"
        . '}';

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

        // Save recipe
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

        // Save ingredients
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
```

- [ ] **Step 3: Commit**

```bash
git add app/Http/Controllers/Web/RecipeController.php
git commit -m "feat: implement RecipeController::aiSuggest with DeepSeek"
```

---

## Task 5: Update `RecipeController::index` to pass AI props

**Files:**
- Modify: `app/Http/Controllers/Web/RecipeController.php`

- [ ] **Step 1: Update `index` method to pass `nextMealSuggestion` and `aiSuggestedMealsToday`**

Replace the `return Inertia::render('recipes', [...])` block inside `index()`:

```php
// Determine next meal suggestion
$mealTimes = [
    ['type' => 'breakfast',        'label' => 'Desayuno',             'hour' => 7],
    ['type' => 'morning_snack',    'label' => 'Colación Matutina',    'hour' => 10],
    ['type' => 'lunch',            'label' => 'Almuerzo',             'hour' => 13],
    ['type' => 'afternoon_snack',  'label' => 'Colación Vespertina',  'hour' => 16],
    ['type' => 'dinner',           'label' => 'Cena',                 'hour' => 19],
    ['type' => 'evening_snack',    'label' => 'Colación Nocturna',    'hour' => 21],
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
    'myRecipes'            => $myRecipes,
    'publicRecipes'        => $publicRecipes,
    'stats'                => $stats,
    'nextMealSuggestion'   => $nextMealSuggestion,
    'aiSuggestedMealsToday' => $aiSuggestedMealsToday,
]);
```

- [ ] **Step 2: Commit**

```bash
git add app/Http/Controllers/Web/RecipeController.php
git commit -m "feat: pass nextMealSuggestion and aiSuggestedMealsToday props to recipes page"
```

---

## Task 6: Frontend — add AI button to create recipe modal

**Files:**
- Modify: `resources/js/pages/recipes.tsx`

- [ ] **Step 1: Update imports**

Replace the lucide import line:
```tsx
import { Plus, Trash2, Clock, Users, ChefHat, Star, Flame } from 'lucide-react';
```
With:
```tsx
import { Plus, Trash2, Clock, Users, ChefHat, Star, Flame, Sparkles } from 'lucide-react';
```

Add `router` to the Inertia import (it's already there — verify it's present):
```tsx
import { Head, router } from '@inertiajs/react';
```

- [ ] **Step 2: Update `RecipesProps` interface**

Replace:
```tsx
interface RecipesProps {
    myRecipes: Recipe[];
    publicRecipes: Recipe[];
    stats: Stats;
}
```
With:
```tsx
interface NextMeal {
    type: string;
    label: string;
    hour: number;
}

interface RecipesProps {
    myRecipes: Recipe[];
    publicRecipes: Recipe[];
    stats: Stats;
    nextMealSuggestion: NextMeal | null;
    aiSuggestedMealsToday: string[];
}
```

- [ ] **Step 3: Update component signature and add state**

Replace:
```tsx
export default function Recipes({ myRecipes, publicRecipes, stats }: RecipesProps) {
```
With:
```tsx
export default function Recipes({ myRecipes, publicRecipes, stats, nextMealSuggestion, aiSuggestedMealsToday }: RecipesProps) {
```

After `const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);` add:
```tsx
const [isAiGenerating, setIsAiGenerating] = useState(false);
```

- [ ] **Step 4: Add `handleAiSuggest` function**

After the `resetForm` function, add:
```tsx
const handleAiSuggest = () => {
    setIsAiGenerating(true);
    router.post('/recipes/ai-suggest', {}, {
        onFinish: () => {
            setIsAiGenerating(false);
            setIsCreateDialogOpen(false);
        },
    });
};
```

- [ ] **Step 5: Add AI button at top of modal form**

Inside `<DialogContent>`, right before `<form onSubmit={handleSubmit}`:

```tsx
{/* AI Suggestion Button */}
{nextMealSuggestion && (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            Sugerir receta con IA
        </div>
        <p className="text-xs text-muted-foreground">
            Próxima comida: <span className="font-semibold">{nextMealSuggestion.label}</span> · La IA analizará tu perfil y comidas de hoy
        </p>
        {aiSuggestedMealsToday.includes(nextMealSuggestion.type) ? (
            <p className="text-xs text-muted-foreground italic">
                Ya generaste una receta de {nextMealSuggestion.label} para hoy.
            </p>
        ) : (
            <Button
                type="button"
                className="w-full"
                onClick={handleAiSuggest}
                disabled={isAiGenerating}
            >
                {isAiGenerating ? (
                    <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Analizando tu perfil y comidas de hoy...
                    </>
                ) : (
                    <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generar automáticamente para {nextMealSuggestion.label}
                    </>
                )}
            </Button>
        )}
    </div>
)}

<div className="relative">
    <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
    </div>
    <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">o crea manualmente</span>
    </div>
</div>
```

- [ ] **Step 6: Commit**

```bash
git add resources/js/pages/recipes.tsx
git commit -m "feat: add AI recipe suggestion button to create recipe modal"
```

---

## Task 7: Run migration and push

- [ ] **Step 1: Run migration on production**

In Dokploy console:
```bash
php artisan migrate --force
```

Expected output includes:
```
Running migrations...
...add_ai_suggestion_fields_to_recipes_table ......... DONE
```

- [ ] **Step 2: Push all commits**

```bash
git push origin main
```

- [ ] **Step 3: Redeploy in Dokploy**

Trigger redeploy from Dokploy dashboard. The `entrypoint.sh` will run `php artisan migrate --force` automatically if `RUN_MIGRATIONS=true` is set.

---

## Self-Review

**Spec coverage:**
- ✅ Button in create modal
- ✅ AI analyzes profile, meals, hydration
- ✅ Determines next meal by time + recorded meals
- ✅ 1 suggestion per meal type per day (duplicate check)
- ✅ Saves directly, no review step
- ✅ Loading state with spinner
- ✅ Disabled state when already suggested
- ✅ Error handling for missing profile, API failure, JSON parse failure

**Placeholder scan:** None found.

**Type consistency:**
- `nextMealSuggestion` typed as `NextMeal | null` in frontend, passed as array|null from backend ✅
- `aiSuggestedMealsToday` typed as `string[]` in frontend, passed as `pluck()->toArray()` from backend ✅
- `suggested_for_meal` / `suggested_date` consistent across migration, model, and controller ✅
