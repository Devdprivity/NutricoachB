<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\NutritionalData;
use App\Models\UserProfile;
use App\Models\UserContext;
use Carbon\Carbon;

class GeminiService
{
    private string $apiKey;
    private string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key', '');
    }

    /**
     * Enviar mensaje al modelo Gemini y obtener respuesta
     */
    public function sendMessage(string $message, User $user, array $context = []): array
    {
        try {
            // Preparar contexto del usuario
            $userContext = $this->prepareUserContext($user, $context);
            
            // Crear prompt personalizado
            $prompt = $this->createPrompt($message, $userContext);
            
            // Llamar a la API de Gemini
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/models/gemini-pro:generateContent?key={$this->apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'topK' => 40,
                    'topP' => 0.95,
                    'maxOutputTokens' => 1024,
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $aiResponse = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Lo siento, no pude procesar tu mensaje.';
                
                return [
                    'success' => true,
                    'response' => $aiResponse,
                    'context_used' => $userContext
                ];
            }

            Log::error('Gemini API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'response' => 'Lo siento, hay un problema técnico. Inténtalo más tarde.',
                'error' => 'API_ERROR'
            ];

        } catch (\Exception $e) {
            Log::error('Gemini Service Error: ' . $e->getMessage());
            
            return [
                'success' => false,
                'response' => 'Lo siento, ocurrió un error. Inténtalo más tarde.',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Preparar contexto del usuario para Gemini
     */
    private function prepareUserContext(User $user, array $additionalContext = []): array
    {
        $context = [
            'user_name' => $user->name,
            'user_profile' => null,
            'today_nutrition' => null,
            'weekly_trends' => null,
            'current_context' => null,
            'recent_messages' => $additionalContext['recent_messages'] ?? []
        ];

        // Obtener perfil del usuario
        if ($user->profile) {
            $context['user_profile'] = [
                'height' => $user->profile->height,
                'weight' => $user->profile->weight,
                'age' => $user->profile->age,
                'gender' => $user->profile->gender,
                'daily_calorie_goal' => $user->profile->daily_calorie_goal,
                'protein_goal' => $user->profile->protein_goal,
                'carbs_goal' => $user->profile->carbs_goal,
                'fat_goal' => $user->profile->fat_goal,
                'activity_level' => $user->profile->activity_level,
                'goal_type' => $user->profile->goal_type
            ];
        }

        // Obtener datos nutricionales de hoy
        $todaySummary = NutritionalData::getDailySummary($user->id, Carbon::today());
        if ($todaySummary) {
            $context['today_nutrition'] = [
                'total_calories' => $todaySummary->total_calories,
                'total_protein' => $todaySummary->total_protein,
                'total_carbs' => $todaySummary->total_carbs,
                'total_fat' => $todaySummary->total_fat,
                'total_entries' => $todaySummary->total_entries
            ];
        }

        // Obtener contexto emocional actual
        $userContext = UserContext::where('user_id', $user->id)
            ->whereDate('created_at', Carbon::today())
            ->latest()
            ->first();

        if ($userContext) {
            $context['current_context'] = [
                'stress_level' => $userContext->stress_level,
                'energy_level' => $userContext->energy_level,
                'mood' => $userContext->mood,
                'sleep_quality' => $userContext->sleep_quality,
                'context_notes' => $userContext->context_notes
            ];
        }

        return $context;
    }

    /**
     * Crear prompt personalizado para Gemini
     */
    private function createPrompt(string $userMessage, array $context): string
    {
        $systemPrompt = $this->getSystemPrompt();
        $contextPrompt = $this->formatContextForPrompt($context);
        
        return "{$systemPrompt}\n\n{$contextPrompt}\n\nUsuario: {$userMessage}\n\nNutriCoach:";
    }

    /**
     * Obtener prompt del sistema para NutriCoach
     */
    private function getSystemPrompt(): string
    {
        return "Eres NutriCoach Luis, un coach nutricional especializado en transformación corporal con inteligencia emocional. 

Tu personalidad:
- Empático y comprensivo, nunca juzgas
- Promueves autocompasión sobre perfección
- Enfocado en sostenibilidad (80% adherencia vs 100%)
- Usas lenguaje motivacional pero realista
- Siempre consideras el contexto emocional del usuario

Tu expertise:
- Análisis nutricional y seguimiento de macronutrientes
- Estrategias para manejo de antojos
- Apoyo en días difíciles
- Tips para situaciones sociales
- Motivación personalizada
- Prevención de comportamientos obsesivos

Reglas importantes:
- SIEMPRE menciona consultar profesionales médicos cuando sea apropiado
- NUNCA recomiendes dietas extremas o restrictivas
- SIEMPRE considera el contexto emocional del usuario
- Usa datos específicos del usuario cuando estén disponibles
- Mantén respuestas concisas pero útiles (máximo 3-4 párrafos)
- Termina con una pregunta motivacional cuando sea apropiado";
    }

    /**
     * Formatear contexto para el prompt
     */
    private function formatContextForPrompt(array $context): string
    {
        $contextText = "CONTEXTO DEL USUARIO:\n";
        
        if ($context['user_profile']) {
            $profile = $context['user_profile'];
            $contextText .= "Perfil: {$profile['gender']}, {$profile['age']} años, {$profile['height']}cm, {$profile['weight']}kg\n";
            $contextText .= "Objetivos diarios: {$profile['daily_calorie_goal']} kcal, {$profile['protein_goal']}g proteína, {$profile['carbs_goal']}g carbohidratos, {$profile['fat_goal']}g grasas\n";
            $contextText .= "Meta: {$profile['goal_type']}, Nivel de actividad: {$profile['activity_level']}\n";
        }

        if ($context['today_nutrition']) {
            $nutrition = $context['today_nutrition'];
            $contextText .= "Hoy ha consumido: {$nutrition['total_calories']} kcal, {$nutrition['total_protein']}g proteína, {$nutrition['total_carbs']}g carbohidratos, {$nutrition['total_fat']}g grasas\n";
        }

        if ($context['current_context']) {
            $ctx = $context['current_context'];
            $contextText .= "Estado actual: Estrés {$ctx['stress_level']}/10, Energía {$ctx['energy_level']}/10, Ánimo {$ctx['mood']}/10\n";
            if ($ctx['context_notes']) {
                $contextText .= "Notas: {$ctx['context_notes']}\n";
            }
        }

        if (!empty($context['recent_messages'])) {
            $contextText .= "Conversación reciente: " . implode(' | ', array_slice($context['recent_messages'], -3)) . "\n";
        }

        return $contextText;
    }

    /**
     * Analizar sentimiento del mensaje del usuario
     */
    public function analyzeSentiment(string $message): array
    {
        // Palabras clave para análisis básico de sentimiento
        $positiveWords = ['bien', 'genial', 'excelente', 'feliz', 'motivado', 'orgulloso', 'satisfecho'];
        $negativeWords = ['mal', 'triste', 'frustrado', 'difícil', 'imposible', 'fracaso', 'culpa'];
        $stressWords = ['estrés', 'presión', 'ansiedad', 'nervioso', 'preocupado', 'agobiado'];
        
        $message = strtolower($message);
        
        $sentiment = 'neutral';
        $confidence = 0.5;
        
        $positiveCount = 0;
        $negativeCount = 0;
        $stressCount = 0;
        
        foreach ($positiveWords as $word) {
            if (strpos($message, $word) !== false) $positiveCount++;
        }
        
        foreach ($negativeWords as $word) {
            if (strpos($message, $word) !== false) $negativeCount++;
        }
        
        foreach ($stressWords as $word) {
            if (strpos($message, $word) !== false) $stressCount++;
        }
        
        if ($stressCount > 0) {
            $sentiment = 'stressed';
            $confidence = min(0.9, 0.5 + ($stressCount * 0.2));
        } elseif ($positiveCount > $negativeCount) {
            $sentiment = 'positive';
            $confidence = min(0.9, 0.5 + ($positiveCount * 0.15));
        } elseif ($negativeCount > $positiveCount) {
            $sentiment = 'negative';
            $confidence = min(0.9, 0.5 + ($negativeCount * 0.15));
        }
        
        return [
            'sentiment' => $sentiment,
            'confidence' => $confidence,
            'indicators' => [
                'positive' => $positiveCount,
                'negative' => $negativeCount,
                'stress' => $stressCount
            ]
        ];
    }

    /**
     * Generar sugerencias de seguimiento basadas en la conversación
     */
    public function generateFollowUpSuggestions(string $userMessage, array $context): array
    {
        $suggestions = [];
        
        // Analizar palabras clave en el mensaje
        $message = strtolower($userMessage);
        
        if (strpos($message, 'hambre') !== false || strpos($message, 'antoj') !== false) {
            $suggestions[] = "¿Te gustaría que te ayude con estrategias para manejar este antojo?";
        }
        
        if (strpos($message, 'ejercicio') !== false || strpos($message, 'gimnasio') !== false) {
            $suggestions[] = "¿Quieres que te recomiende ejercicios basados en tu estado actual?";
        }
        
        if (strpos($message, 'peso') !== false || strpos($message, 'progreso') !== false) {
            $suggestions[] = "¿Te gustaría ver un análisis detallado de tu progreso semanal?";
        }
        
        if (strpos($message, 'social') !== false || strpos($message, 'restaurante') !== false) {
            $suggestions[] = "¿Necesitas tips para manejar esta situación social?";
        }
        
        if (strpos($message, 'difícil') !== false || strpos($message, 'estrés') !== false) {
            $suggestions[] = "¿Te gustaría que activemos el modo 'día difícil' con estrategias especiales?";
        }
        
        // Sugerencias por defecto si no hay coincidencias específicas
        if (empty($suggestions)) {
            $suggestions = [
                "¿Cómo te sientes con tu progreso hoy?",
                "¿Hay algo específico en lo que te gustaría trabajar?",
                "¿Quieres que revisemos tus objetivos nutricionales?"
            ];
        }
        
        return array_slice($suggestions, 0, 3); // Máximo 3 sugerencias
    }
}
