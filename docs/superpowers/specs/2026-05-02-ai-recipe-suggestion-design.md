# AI Recipe Suggestion — Design Spec
Date: 2026-05-02

## Overview

Add an "Sugerir receta con IA" button inside the create recipe modal. When clicked, the AI analyzes the user's full profile, today's meals, hydration, and health goals to automatically generate and save a complete recipe for the next meal. No user review step — the recipe saves directly and appears in the recipe list.

---

## Constraints

- 1 AI suggestion per meal type per day (e.g., only 1 lunch suggestion per day)
- Meal type is determined automatically by current time and what's already been recorded today
- Recipe saves directly without user editing
- Uses DeepSeek API (same key as coaching)

---

## Database

Migration adds two nullable columns to the `recipes` table:

```
suggested_for_meal  string nullable  — meal type this was suggested for (breakfast, lunch, dinner, etc.)
suggested_date      date   nullable  — date the suggestion was generated
```

Index on `(user_id, suggested_for_meal, suggested_date)` to efficiently check duplicates.

---

## Backend

### Route
```
POST /recipes/ai-suggest
```
Protected by `auth` + `verified` middleware (same group as other recipe routes).

### Controller method — `RecipeController::aiSuggest`

Flow:
1. **Determine next meal type** — reuse the meal time logic already in `NutritionController::getNextMealSuggestion`. Extract this to a shared helper or duplicate it temporarily.
2. **Check duplicate** — query `recipes` where `user_id = auth`, `suggested_for_meal = nextMealType`, `suggested_date = today`. If exists, return redirect back with error message.
3. **Build context** — gather from DB:
   - `UserProfile`: weight, height, age, gender, daily_calorie_goal, protein_goal, carbs_goal, fat_goal, water_goal, target_weight, medical_conditions
   - `MealRecord` today: each record's meal_type, calories, protein, carbs, fat, ai_description
   - `HydrationRecord` today: sum of ml consumed vs water_goal
   - Remaining macros: goals minus today's totals
4. **Call DeepSeek** — POST to `https://api.deepseek.com/v1/chat/completions` with `deepseek-chat` model, 30s timeout.
5. **Parse JSON response** — extract between first `{` and last `}`.
6. **Save recipe** — create `Recipe` + `RecipeIngredient` records. Set `suggested_for_meal` and `suggested_date`.
7. **Redirect** to `recipes` route with success flash message.

### Error handling
- DeepSeek unavailable or JSON parse failure → redirect back with error "No se pudo generar la receta, intenta nuevamente"
- Duplicate suggestion → redirect back with error "Ya generaste una receta de [meal_type] para hoy"
- Missing user profile → redirect back with error "Completa tu perfil antes de usar sugerencias de IA"

---

## Prompt

```
Eres un nutricionista experto. Genera una receta saludable basada en este contexto:

PERFIL:
- Objetivo: {goal}
- Peso: {weight}kg, Altura: {height}cm, Edad: {age}, Género: {gender}
- Metas diarias: {calorie_goal} kcal, {protein_goal}g proteína, {carbs_goal}g carbs, {fat_goal}g grasa
- Condiciones médicas: {medical_conditions}

COMIDAS DE HOY:
{meals_list}

HIDRATACIÓN HOY: {hydration_ml}ml de {water_goal}ml

CALORÍAS RESTANTES: {remaining_calories} kcal
PROTEÍNA RESTANTE: {remaining_protein}g
CARBS RESTANTES: {remaining_carbs}g

PRÓXIMA COMIDA: {next_meal_type}

Genera una receta equilibrada, práctica y saludable para {next_meal_type}.
Responde SOLO con este JSON sin texto adicional:
{
  "name": "...",
  "description": "...",
  "category": "{next_meal_type}",
  "prep_time_minutes": 20,
  "servings": 1,
  "calories_per_serving": 450,
  "protein_g": 35,
  "carbs_g": 40,
  "fat_g": 12,
  "ingredients": [{"name": "...", "quantity": "150", "unit": "g"}],
  "instructions": ["Paso 1...", "Paso 2..."]
}
```

---

## Frontend

### Modal change (`resources/js/pages/recipes.tsx` or recipe modal component)

Add at the top of the modal, above the manual form:

```
┌─────────────────────────────────────────┐
│  ✨ Sugerir receta con IA               │
│  Para: Almuerzo  (basado en tus comidas)│
│  [  Generar automáticamente  ]          │
├─────────────────────────────────────────┤
│  — o crea manualmente —                 │
│  (formulario existente)                 │
└─────────────────────────────────────────┘
```

States:
- **Default**: button enabled, shows next meal type
- **Loading**: button disabled, spinner + "Analizando tu perfil y comidas de hoy..."
- **Already suggested**: button disabled, message "Ya generaste una receta de almuerzo para hoy"
- **No next meal**: button hidden (all meals of the day already logged)

The page prop `nextMealSuggestion` (already passed by some controllers) is used to display the meal type and disable the button when appropriate. Add a new prop `aiSuggestedMealsToday: string[]` listing meal types already suggested today.

---

## Meal Type Order

```
breakfast       → 07:00
morning_snack   → 10:00
lunch           → 13:00
afternoon_snack → 16:00
dinner          → 19:00
evening_snack   → 21:00
```

Next meal = first meal type in this list that: (a) current hour <= its hour AND (b) not yet recorded today.

---

## Spec Self-Review

- No TBDs or placeholders
- Architecture consistent throughout
- Scope is a single focused feature
- All error states handled explicitly
- Meal type logic reused from existing code
