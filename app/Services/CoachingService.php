<?php

namespace App\Services;

use App\Models\CoachingConversation;
use App\Models\ExerciseLog;
use App\Models\HydrationRecord;
use App\Models\MealRecord;
use App\Models\User;
use App\Models\UserCoachingContext;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CoachingService
{
    /**
     * Obtener o crear el contexto de coaching del usuario
     */
    public function getOrCreateUserContext(User $user): UserCoachingContext
    {
        $context = UserCoachingContext::firstOrCreate(
            ['user_id' => $user->id],
            [
                'nutrition_summary' => [],
                'exercise_summary' => [],
                'hydration_summary' => [],
                'goals' => [],
                'preferences' => [],
            ]
        );

        // Actualizar contexto si han pasado más de 5 minutos o no existe
        if (!$context->last_updated_at || $context->last_updated_at->diffInMinutes(now()) >= 5) {
            $this->updateUserContext($context, $user);
        }

        return $context;
    }

    /**
     * Actualizar el contexto del usuario con datos recientes
     */
    public function updateUserContext(UserCoachingContext $context, User $user): void
    {
        // Obtener datos de los últimos 7 días
        $startDate = Carbon::now()->subDays(7);

        // Resumen de nutrición
        $nutritionData = MealRecord::where('user_id', $user->id)
            ->where('date', '>=', $startDate)
            ->get();

        $nutritionSummary = [
            'total_meals' => $nutritionData->count(),
            'avg_calories_per_day' => $nutritionData->groupBy('date')
                ->map(fn($meals) => $meals->sum('calories'))
                ->avg() ?? 0,
            'total_calories_week' => $nutritionData->sum('calories'),
            'total_protein' => round($nutritionData->sum('protein'), 2),
            'total_carbs' => round($nutritionData->sum('carbs'), 2),
            'total_fats' => round($nutritionData->sum('fat'), 2),
            'meal_types_distribution' => $nutritionData->groupBy('meal_type')
                ->map(fn($meals) => $meals->count())
                ->toArray(),
            'recent_meals' => $nutritionData->take(5)->map(function($meal) {
                // Obtener nombre de la comida desde food_items (JSON) o AI description
                $foodName = 'Comida';
                if ($meal->food_items) {
                    $foodItems = is_string($meal->food_items) ? json_decode($meal->food_items, true) : $meal->food_items;
                    if (is_array($foodItems) && count($foodItems) > 0) {
                        $foodName = is_array($foodItems[0]) ? ($foodItems[0]['name'] ?? 'Comida') : $foodItems[0];
                    }
                } elseif ($meal->ai_description) {
                    $foodName = $meal->ai_description;
                }
                
                return [
                    'name' => $foodName,
                    'calories' => (float) $meal->calories,
                    'date' => $meal->date->format('Y-m-d'),
                    'meal_type' => $meal->meal_type,
                ];
            })->toArray(),
        ];

        // Resumen de ejercicios
        $exerciseData = ExerciseLog::where('user_id', $user->id)
            ->where('date', '>=', $startDate)
            ->with('exercise')
            ->get();

        $exerciseSummary = [
            'total_sessions' => $exerciseData->count(),
            'total_minutes' => $exerciseData->sum('duration_minutes'),
            'total_calories_burned' => $exerciseData->sum('calories_burned'),
            'avg_intensity' => $exerciseData->avg('intensity'),
            'exercise_types' => $exerciseData->groupBy('exercise.category')
                ->map(fn($logs) => $logs->count())
                ->toArray(),
            'recent_exercises' => $exerciseData->take(5)->map(fn($log) => [
                'name' => $log->exercise->name,
                'duration_minutes' => $log->duration_minutes,
                'calories_burned' => $log->calories_burned,
                'intensity' => $log->intensity,
                'date' => $log->date->format('Y-m-d'),
            ])->toArray(),
        ];

        // Resumen de hidratación
        $hydrationData = HydrationRecord::where('user_id', $user->id)
            ->where('date', '>=', $startDate)
            ->get();

        $waterGoal = $user->profile?->water_goal ?? 4000;
        $hydrationSummary = [
            'total_records' => $hydrationData->count(),
            'total_ml' => $hydrationData->sum('amount_ml'),
            'avg_ml_per_day' => $hydrationData->groupBy('date')
                ->map(fn($records) => $records->sum('amount_ml'))
                ->avg() ?? 0,
            'daily_goal' => $waterGoal,
            'days_met_goal' => $hydrationData->groupBy('date')
                ->filter(fn($records) => $records->sum('amount_ml') >= $waterGoal)
                ->count(),
        ];

        // Actualizar contexto
        $context->update([
            'nutrition_summary' => $nutritionSummary,
            'exercise_summary' => $exerciseSummary,
            'hydration_summary' => $hydrationSummary,
            'last_updated_at' => now(),
        ]);
    }

    /**
     * Obtener el historial de conversación
     */
    public function getConversationHistory(User $user, int $limit = 10): array
    {
        return CoachingConversation::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->reverse()
            ->map(fn($msg) => [
                'role' => $msg->role,
                'content' => $msg->message,
            ])
            ->toArray();
    }

    /**
     * Generar coaching personalizado usando IA
     */
    public function generateCoachingResponse(User $user, string $userMessage): array
    {
        // Obtener contexto actualizado
        $context = $this->getOrCreateUserContext($user);

        // Obtener historial de conversación
        $history = $this->getConversationHistory($user, 6);

        // Construir el prompt del sistema con el contexto del usuario
        $systemPrompt = $this->buildSystemPrompt($user, $context);

        // Preparar mensajes para OpenAI
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ...$history,
            ['role' => 'user', 'content' => $userMessage],
        ];

        try {
            $apiKey = config('services.openai.api_key');
            
            // Verificar si la API key está configurada
            if (!$apiKey) {
                Log::warning('OpenAI API key not configured');
                return [
                    'success' => false,
                    'message' => 'El servicio de coaching no está configurado. Por favor, contacta al administrador.',
                ];
            }
            
            // Llamar a OpenAI API
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => $messages,
                'temperature' => 0.7,
                'max_tokens' => 800,
            ]);

            if ($response->successful()) {
                $assistantMessage = $response->json()['choices'][0]['message']['content'];

                // Guardar mensajes en el historial
                $contextSnapshot = [
                    'nutrition' => $context->nutrition_summary,
                    'exercise' => $context->exercise_summary,
                    'hydration' => $context->hydration_summary,
                ];

                CoachingConversation::create([
                    'user_id' => $user->id,
                    'message' => $userMessage,
                    'role' => 'user',
                    'context_snapshot' => $contextSnapshot,
                ]);

                CoachingConversation::create([
                    'user_id' => $user->id,
                    'message' => $assistantMessage,
                    'role' => 'assistant',
                    'context_snapshot' => $contextSnapshot,
                ]);

                return [
                    'success' => true,
                    'message' => $assistantMessage,
                ];
            } else {
                Log::error('OpenAI API Error', ['response' => $response->body()]);
                return [
                    'success' => false,
                    'message' => 'Lo siento, hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.',
                ];
            }
        } catch (\Exception $e) {
            Log::error('Coaching Service Error', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Error de conexión. Por favor, verifica tu conexión a Internet e inténtalo de nuevo.',
            ];
        }
    }

    /**
     * Construir el prompt del sistema con el contexto del usuario
     */
    private function buildSystemPrompt(User $user, UserCoachingContext $context): string
    {
        $userName = $user->name ?? 'Usuario';
        $profile = $user->profile;

        $prompt = "Eres NutriCoach AI, un entrenador personal de salud y bienestar altamente capacitado y empático. ";
        $prompt .= "Tu objetivo es ayudar a {$userName} a alcanzar sus metas de salud mediante coaching personalizado.\n\n";

        // Información del usuario
        $prompt .= "PERFIL DEL USUARIO:\n";
        $prompt .= "- Nombre: {$userName}\n";

        if ($profile) {
            $prompt .= "- Edad: " . ($profile->age ?? 'No especificada') . " años\n";
            $prompt .= "- Género: " . ($profile->gender ?? 'No especificado') . "\n";
            $prompt .= "- Altura: " . ($profile->height ?? 'No especificada') . " cm\n";
            $prompt .= "- Peso actual: " . ($profile->weight ?? 'No especificado') . " kg\n";
            $prompt .= "- Nivel de actividad: " . ($profile->activity_level ?? 'sedentary') . "\n";
            $prompt .= "- Meta calórica diaria: " . ($profile->daily_calorie_goal ?? 2000) . " kcal\n";
            $prompt .= "- Meta de hidratación: " . ($profile->water_goal ?? 4000) . " ml\n";
        }

        // Resumen de nutrición
        $nutrition = $context->nutrition_summary ?? [];
        $prompt .= "\nRESUMEN DE NUTRICIÓN (últimos 7 días):\n";
        $prompt .= "- Total de comidas registradas: " . ($nutrition['total_meals'] ?? 0) . "\n";
        $prompt .= "- Promedio de calorías diarias: " . round($nutrition['avg_calories_per_day'] ?? 0) . " kcal\n";
        $prompt .= "- Total de calorías en la semana: " . round($nutrition['total_calories_week'] ?? 0) . " kcal\n";
        $prompt .= "- Proteínas totales: " . round($nutrition['total_protein'] ?? 0) . "g\n";
        $prompt .= "- Carbohidratos totales: " . round($nutrition['total_carbs'] ?? 0) . "g\n";
        $prompt .= "- Grasas totales: " . round($nutrition['total_fats'] ?? 0) . "g\n";

        // Resumen de ejercicio
        $exercise = $context->exercise_summary ?? [];
        $prompt .= "\nRESUMEN DE EJERCICIO (últimos 7 días):\n";
        $prompt .= "- Sesiones de entrenamiento: " . ($exercise['total_sessions'] ?? 0) . "\n";
        $prompt .= "- Minutos totales de ejercicio: " . ($exercise['total_minutes'] ?? 0) . " min\n";
        $prompt .= "- Calorías quemadas: " . round($exercise['total_calories_burned'] ?? 0) . " kcal\n";
        $prompt .= "- Intensidad promedio: " . round($exercise['avg_intensity'] ?? 0, 1) . "/10\n";

        // Resumen de hidratación
        $hydration = $context->hydration_summary ?? [];
        $prompt .= "\nRESUMEN DE HIDRATACIÓN (últimos 7 días):\n";
        $prompt .= "- Total de agua consumida: " . ($hydration['total_ml'] ?? 0) . " ml\n";
        $prompt .= "- Promedio diario: " . round($hydration['avg_ml_per_day'] ?? 0) . " ml\n";
        $prompt .= "- Días que cumplió la meta: " . ($hydration['days_met_goal'] ?? 0) . " de 7\n";

        $prompt .= "\nINSTRUCCIONES:\n";
        $prompt .= "- Proporciona consejos personalizados basados en los datos del usuario\n";
        $prompt .= "- Sé empático, motivador y positivo\n";
        $prompt .= "- Da recomendaciones específicas y accionables\n";
        $prompt .= "- Celebra los logros y progreso del usuario\n";
        $prompt .= "- Si detectas áreas de mejora, sugiérelas de manera constructiva\n";
        $prompt .= "- Usa un tono amigable y profesional\n";
        $prompt .= "- Mantén las respuestas concisas (máximo 3-4 párrafos)\n";
        $prompt .= "- Responde en español\n";

        return $prompt;
    }

    /**
     * Obtener resumen del contexto para mostrar en la UI
     */
    public function getContextSummary(User $user): array
    {
        $context = $this->getOrCreateUserContext($user);

        return [
            'nutrition' => $context->nutrition_summary ?? [],
            'exercise' => $context->exercise_summary ?? [],
            'hydration' => $context->hydration_summary ?? [],
            'last_updated' => $context->last_updated_at?->diffForHumans(),
        ];
    }
}
