# AI Weekly Meal Plan — Design Spec
Date: 2026-05-02

## Overview

Replace the empty `weekly-meal-plans` page with a fully functional AI-powered weekly meal planner. The AI generates a plan from today to Sunday covering breakfast/lunch/dinner per day, using the user's existing recipes where possible and generating new ones to fill gaps. The user reviews and edits each slot before saving.

---

## Constraints

- Days: from today to the Sunday of the current week (inclusive)
- Meals per day: breakfast, lunch, dinner only
- AI strategy: use existing user recipes first, generate new Recipe records for missing slots
- Edit mode: per-slot "Cambiar" button opens recipe selector dialog
- Persistence: plan only saves when user clicks "Guardar plan"
- Existing plans tab ("Mis Planes") is preserved and still works

---

## Backend

### New route
```
POST /weekly-meal-plans/ai-generate
```
Returns JSON (not a redirect). Protected by `auth + verified` middleware.

### Controller method — `WeeklyMealPlanController::aiGenerate`

Flow:
1. **Calculate days** — from `today()` to the coming Sunday (Carbon `endOfWeek()`). If today is Sunday, plan covers only today (1 day).
2. **Load user recipes** — query `Recipe` where `user_id = auth()->id()`, grouped by category. Categories mapped: `breakfast/desayuno → breakfast`, `almuerzo/lunch → lunch`, `cena/dinner → dinner`. All other categories count as lunch or dinner fallback.
3. **Build DeepSeek prompt** — include:
   - User profile (weight, height, age, gender, goals, medical conditions, dietary restrictions)
   - Available recipes as a JSON list: `[{id, name, category, calories_per_serving}]`
   - Days and slots to fill: `[{date, day_label, meals: [breakfast, lunch, dinner]}]`
4. **Call DeepSeek** — `deepseek-chat`, timeout 60s, max_tokens 2000.
5. **Parse response** — extract JSON array of days with recipe assignments. Each slot is either `{recipe_id: <existing>}` or `{new_recipe: {name, description, category, calories, protein, carbs, fat, ingredients, instructions}}`.
6. **Save new recipes** — for each `new_recipe` slot, create `Recipe` + `RecipeIngredient` records with `user_id = auth()->id()`.
7. **Return JSON** — full plan structure with resolved recipe objects (id, name, calories, description).

### Error responses (JSON)
- Missing profile → `{error: "Completa tu perfil antes de generar un plan."}`
- DeepSeek failure → `{error: "No se pudo generar el plan. Intenta nuevamente."}`
- JSON parse failure → `{error: "Error al procesar la respuesta de IA."}`

### Update `WeeklyMealPlanController::index`
Pass additional prop:
```php
'userRecipes' => Recipe::where('user_id', $user->id)->get(['id','name','category','calories_per_serving','description'])
```

---

## Prompt

```
Eres un nutricionista experto. Crea un plan de comidas semanal.

PERFIL:
- Peso: {weight}kg, Altura: {height}cm, Edad: {age}, Género: {gender}
- Metas: {calorie_goal} kcal/día, {protein_goal}g proteína, {carbs_goal}g carbs
- Condiciones médicas: {medical_conditions}
- Restricciones dietéticas: {dietary_restrictions}

RECETAS DISPONIBLES DEL USUARIO:
{json_list_of_recipes}

DÍAS A PLANIFICAR:
{json_list_of_days_with_slots}

Para cada slot, usa una receta existente (por su id) si es apropiada, o crea una nueva.
Responde SOLO con este JSON:
[
  {
    "date": "2026-05-02",
    "day_label": "Viernes 2 mayo",
    "meals": {
      "breakfast": {"recipe_id": 5},
      "lunch": {"recipe_id": null, "new_recipe": {"name":"...","description":"...","category":"lunch","calories_per_serving":450,"protein_g":35,"carbs_g":40,"fat_g":12,"ingredients":[{"name":"...","quantity":"150","unit":"g"}],"instructions":["Paso 1..."]}},
      "dinner": {"recipe_id": 3}
    }
  }
]
```

---

## JSON Response Structure (from backend to frontend)

```typescript
interface GeneratedPlan {
  name: string;           // "Plan semana 2 mayo - 4 mayo"
  start_date: string;     // "2026-05-02"
  end_date: string;       // "2026-05-04" (Sunday)
  days: GeneratedDay[];
}

interface GeneratedDay {
  date: string;           // "2026-05-02"
  day_label: string;      // "Viernes 2 mayo"
  meals: {
    breakfast: GeneratedMeal;
    lunch: GeneratedMeal;
    dinner: GeneratedMeal;
  };
}

interface GeneratedMeal {
  meal_label: string;     // "Desayuno"
  recipe: {
    id: number;
    name: string;
    calories_per_serving: number | null;
    description: string | null;
  };
}
```

---

## Frontend — `weekly-meal-plans.tsx`

### New state
```typescript
const [draftPlan, setDraftPlan] = useState<GeneratedPlan | null>(null);
const [isGenerating, setIsGenerating] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [changeSlot, setChangeSlot] = useState<{dayIdx: number; mealType: string} | null>(null);
const [aiError, setAiError] = useState<string | null>(null);
```

### New prop
```typescript
interface WeeklyMealPlansProps {
  plans: WeeklyMealPlan[];
  publicPlans: WeeklyMealPlan[];
  stats: Stats;
  userRecipes: UserRecipe[];  // for the change-slot selector
}
```

### `handleGenerate`
```typescript
const handleGenerate = async () => {
  setIsGenerating(true);
  setAiError(null);
  try {
    const res = await axios.post('/weekly-meal-plans/ai-generate');
    setDraftPlan(res.data);
  } catch (e: any) {
    setAiError(e.response?.data?.error ?? 'Error al generar el plan.');
  } finally {
    setIsGenerating(false);
  }
};
```

### `handleSavePlan`
```typescript
const handleSavePlan = () => {
  if (!draftPlan) return;
  setIsSaving(true);
  router.post('/weekly-meal-plans', {
    name: draftPlan.name,
    start_date: draftPlan.start_date,
    end_date: draftPlan.end_date,
    is_active: true,
    recipes: draftPlan.days.flatMap(day =>
      Object.entries(day.meals).map(([mealType, meal]) => ({
        recipe_id: meal.recipe.id,
        day_of_week: new Date(day.date).toLocaleDateString('en-US', {weekday:'long'}).toLowerCase(),
        meal_type: mealType,
        servings: 1,
      }))
    ),
  }, { onFinish: () => setIsSaving(false) });
};
```

### `handleChangeRecipe`
```typescript
const handleChangeRecipe = (recipe: UserRecipe) => {
  if (!changeSlot || !draftPlan) return;
  const updated = { ...draftPlan };
  updated.days[changeSlot.dayIdx].meals[changeSlot.mealType].recipe = {
    id: recipe.id,
    name: recipe.name,
    calories_per_serving: recipe.calories_per_serving,
    description: recipe.description,
  };
  setDraftPlan(updated);
  setChangeSlot(null);
};
```

### Layout

```
┌─ Planes de Comidas ────────────────────────────────┐
│ [Generar plan con IA para esta semana]              │
│ (spinner / error message)                           │
│                                                     │
│ ┌─ Viernes 2 mayo ──────────────────────────────┐  │
│ │ Desayuno  Avena con frutas  (350 kcal)  [Cambiar]│
│ │ Almuerzo  Pollo con arroz   (520 kcal)  [Cambiar]│
│ │ Cena      Sopa de verduras  (280 kcal)  [Cambiar]│
│ └───────────────────────────────────────────────┘  │
│ ┌─ Sábado 3 mayo ───────────────────────────────┐  │
│ │ ...                                            │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│ [Guardar plan]  [Regenerar]                         │
├─────────────────────────────────────────────────────┤
│ Tabs: Mis Planes | Planes Públicos                  │
│ (equal to current implementation)                   │
└─────────────────────────────────────────────────────┘
```

### Change-slot Dialog
Opens when user clicks [Cambiar]. Shows list of `userRecipes` as selectable cards. On select → `handleChangeRecipe`. On close without selecting → no change.

---

## Spec Self-Review

- No TBDs or placeholders ✅
- Architecture consistent: axios for AI generate (JSON), router.post for save (Inertia redirect) ✅
- Scope: single focused feature, existing tabs preserved ✅
- Error states handled: missing profile, DeepSeek failure, JSON parse failure ✅
- Sunday edge case handled: if today IS Sunday, plan = 1 day ✅
- Existing recipe types mapped to breakfast/lunch/dinner ✅
