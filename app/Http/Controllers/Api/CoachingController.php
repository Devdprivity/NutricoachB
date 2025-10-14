<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CoachingMessage;
use App\Models\NutritionalData;
use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class CoachingController extends Controller
{
    /**
     * Comando "Resumen del día" - Análisis completo con insights
     */
    public function dailySummary(Request $request): JsonResponse
    {
        $date = $request->get('date', Carbon::today()->toDateString());
        $user = auth()->user();
        
        $summary = NutritionalData::getDailySummary($user->id, $date);
        $mealTypeSummary = NutritionalData::getMealTypeSummary($user->id, $date);
        $userProfile = $user->profile;
        
        if (!$summary) {
            return response()->json([
                'message' => 'No hay datos para esta fecha',
                'data' => null
            ], 404);
        }

        // Generar insights
        $insights = $this->generateDailyInsights($summary, $mealTypeSummary, $userProfile);
        
        // Crear mensaje de coaching
        $coachingMessage = $this->createCoachingMessage($user->id, 'daily_summary', $insights);

        return response()->json([
            'message' => 'Resumen del día generado exitosamente',
            'data' => [
                'date' => $date,
                'summary' => $summary,
                'meal_type_summary' => $mealTypeSummary,
                'insights' => $insights,
                'coaching_message' => $coachingMessage
            ]
        ]);
    }

    /**
     * Comando "¿Cómo voy?" - Estado vs objetivos con tendencias
     */
    public function progressCheck(Request $request): JsonResponse
    {
        $user = auth()->user();
        $userProfile = $user->profile;
        
        if (!$userProfile) {
            return response()->json([
                'message' => 'Perfil de usuario no encontrado'
            ], 404);
        }

        // Obtener datos de los últimos 7 días
        $endDate = Carbon::today();
        $startDate = $endDate->copy()->subDays(6);
        
        $weeklyData = [];
        $currentDate = $startDate->copy();
        
        while ($currentDate->lte($endDate)) {
            $dateStr = $currentDate->toDateString();
            $summary = NutritionalData::getDailySummary($user->id, $dateStr);
            $adherence = $summary ? $this->evaluateAdherence($summary, $userProfile) : null;
            
            $weeklyData[] = [
                'date' => $dateStr,
                'summary' => $summary,
                'adherence' => $adherence
            ];
            
            $currentDate->addDay();
        }

        // Calcular tendencias
        $trends = $this->calculateTrends($weeklyData, $userProfile);
        
        // Generar mensaje de progreso
        $progressMessage = $this->generateProgressMessage($trends, $userProfile);
        
        $coachingMessage = $this->createCoachingMessage($user->id, 'progress_check', [
            'trends' => $trends,
            'message' => $progressMessage
        ]);

        return response()->json([
            'message' => 'Análisis de progreso generado exitosamente',
            'data' => [
                'weekly_data' => $weeklyData,
                'trends' => $trends,
                'progress_message' => $progressMessage,
                'coaching_message' => $coachingMessage
            ]
        ]);
    }

    /**
     * Comando "Día difícil" - Modo comprensivo con estrategias
     */
    public function difficultDay(Request $request): JsonResponse
    {
        $user = auth()->user();
        $userProfile = $user->profile;
        
        $strategies = [
            'flexibilidad_inteligente' => [
                'title' => 'Flexibilidad Inteligente',
                'message' => 'Recuerda que el 80% de adherencia es más sostenible que el 100%. Un día difícil no define tu progreso.',
                'actions' => [
                    'Ajusta tus expectativas para hoy',
                    'Enfócate en las comidas que sí puedes controlar',
                    'Planifica mejor para mañana'
                ]
            ],
            'autocompasion' => [
                'title' => 'Autocompasión',
                'message' => 'Es normal tener días difíciles. La autocompasión es clave para la adherencia a largo plazo.',
                'actions' => [
                    'No te castigues por las decisiones de hoy',
                    'Reconoce tus esfuerzos, aunque sean pequeños',
                    'Piensa en lo que aprendiste de esta experiencia'
                ]
            ],
            'estrategias_practicas' => [
                'title' => 'Estrategias Prácticas',
                'message' => 'Aquí tienes algunas estrategias para manejar mejor los días difíciles.',
                'actions' => [
                    'Bebe más agua para llenar el estómago',
                    'Haz una caminata de 10 minutos',
                    'Practica respiración profunda',
                    'Llama a un amigo o familiar'
                ]
            ]
        ];

        $coachingMessage = $this->createCoachingMessage($user->id, 'difficult_day', [
            'strategies' => $strategies,
            'message' => 'Recuerda: la transformación sostenible se construye con autocompasión inteligente, no con perfección rígida.'
        ]);

        return response()->json([
            'message' => 'Estrategias para día difícil generadas exitosamente',
            'data' => [
                'strategies' => $strategies,
                'coaching_message' => $coachingMessage
            ]
        ]);
    }

    /**
     * Comando "SOS antojo" - Estrategias inmediatas para antojos
     */
    public function cravingSos(Request $request): JsonResponse
    {
        $user = auth()->user();
        $cravingType = $request->get('type', 'general'); // sweet, salty, general
        
        $strategies = $this->getCravingStrategies($cravingType);
        
        $coachingMessage = $this->createCoachingMessage($user->id, 'craving_sos', [
            'craving_type' => $cravingType,
            'strategies' => $strategies
        ]);

        return response()->json([
            'message' => 'Estrategias anti-antojos generadas exitosamente',
            'data' => [
                'craving_type' => $cravingType,
                'strategies' => $strategies,
                'coaching_message' => $coachingMessage
            ]
        ]);
    }

    /**
     * Comando "Situación social" - Tips para eventos y restaurantes
     */
    public function socialSituation(Request $request): JsonResponse
    {
        $user = auth()->user();
        $situationType = $request->get('type', 'restaurant'); // restaurant, party, family, work
        
        $tips = $this->getSocialSituationTips($situationType);
        
        $coachingMessage = $this->createCoachingMessage($user->id, 'social_situation', [
            'situation_type' => $situationType,
            'tips' => $tips
        ]);

        return response()->json([
            'message' => 'Tips para situación social generados exitosamente',
            'data' => [
                'situation_type' => $situationType,
                'tips' => $tips,
                'coaching_message' => $coachingMessage
            ]
        ]);
    }

    /**
     * Obtener mensajes de coaching del usuario
     */
    public function getMessages(Request $request): JsonResponse
    {
        $user = auth()->user();
        $query = $user->coachingMessages()->orderBy('created_at', 'desc');
        
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->has('unread_only') && $request->unread_only) {
            $query->where('is_read', false);
        }
        
        $perPage = $request->get('per_page', 20);
        $messages = $query->paginate($perPage);

        return response()->json([
            'message' => 'Mensajes de coaching obtenidos exitosamente',
            'data' => $messages
        ]);
    }

    /**
     * Marcar mensaje como leído
     */
    public function markAsRead(CoachingMessage $coachingMessage): JsonResponse
    {
        if ($coachingMessage->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        $coachingMessage->update([
            'is_read' => true,
            'read_at' => now()
        ]);

        return response()->json([
            'message' => 'Mensaje marcado como leído exitosamente'
        ]);
    }

    // Métodos privados para generar insights y estrategias
    
    private function generateDailyInsights($summary, $mealTypeSummary, $userProfile): array
    {
        $insights = [];
        
        if ($userProfile) {
            $adherence = $this->evaluateAdherence($summary, $userProfile);
            $insights['adherence'] = $adherence;
            
            // Insight de calorías
            $calorieDiff = $summary->total_calories - $userProfile->daily_calorie_goal;
            if ($calorieDiff > 0) {
                $insights['calories'] = "Consumiste {$calorieDiff} calorías más de tu objetivo. Considera ajustar las porciones en las próximas comidas.";
            } elseif ($calorieDiff < -200) {
                $insights['calories'] = "Consumiste " . abs($calorieDiff) . " calorías menos de tu objetivo. Asegúrate de mantener tu metabolismo activo.";
            } else {
                $insights['calories'] = "¡Excelente! Estás dentro de tu rango objetivo de calorías.";
            }
        }
        
        return $insights;
    }

    private function calculateTrends($weeklyData, $userProfile): array
    {
        // Implementar lógica de tendencias
        return [
            'calories_trend' => 'stable',
            'adherence_trend' => 'improving',
            'consistency_score' => 75
        ];
    }

    private function generateProgressMessage($trends, $userProfile): string
    {
        return "Tu progreso muestra una tendencia estable. Mantén el enfoque en la consistencia sobre la perfección.";
    }

    private function getCravingStrategies(string $type): array
    {
        $strategies = [
            'sweet' => [
                'Bebe un vaso de agua con limón',
                'Come una fruta fresca',
                'Mastica chicle sin azúcar',
                'Haz 10 respiraciones profundas'
            ],
            'salty' => [
                'Bebe agua con una pizca de sal',
                'Come pepinos o apio',
                'Toma un té de hierbas',
                'Haz una actividad que te distraiga'
            ],
            'general' => [
                'Identifica la emoción detrás del antojo',
                'Bebe un vaso grande de agua',
                'Haz una caminata de 5 minutos',
                'Practica la técnica de los 10 minutos'
            ]
        ];

        return $strategies[$type] ?? $strategies['general'];
    }

    private function getSocialSituationTips(string $type): array
    {
        $tips = [
            'restaurant' => [
                'Revisa el menú antes de llegar',
                'Pide aderezos y salsas aparte',
                'Comparte el plato principal',
                'Pide agua como bebida principal'
            ],
            'party' => [
                'Come algo saludable antes de ir',
                'Alterna bebidas alcohólicas con agua',
                'Enfócate en la conversación, no en la comida',
                'Establece un límite de tiempo'
            ],
            'family' => [
                'Comunica tus objetivos de manera clara',
                'Ofrécete a ayudar con la preparación',
                'Trae un plato saludable para compartir',
                'Practica la gratitud por la comida'
            ],
            'work' => [
                'Lleva tu propia comida',
                'Evita las máquinas expendedoras',
                'Programa recordatorios de hidratación',
                'Ten snacks saludables en tu escritorio'
            ]
        ];

        return $tips[$type] ?? $tips['restaurant'];
    }

    private function createCoachingMessage(int $userId, string $type, array $data): CoachingMessage
    {
        return CoachingMessage::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $this->getMessageTitle($type),
            'message' => $this->getMessageContent($type, $data),
            'data' => $data,
            'priority' => $this->getMessagePriority($type)
        ]);
    }

    private function getMessageTitle(string $type): string
    {
        $titles = [
            'daily_summary' => 'Resumen del Día',
            'progress_check' => 'Estado de Progreso',
            'difficult_day' => 'Estrategias para Día Difícil',
            'craving_sos' => 'SOS Antojos',
            'social_situation' => 'Tips para Situación Social'
        ];

        return $titles[$type] ?? 'Mensaje de Coaching';
    }

    private function getMessageContent(string $type, array $data): string
    {
        // Generar contenido personalizado basado en el tipo y datos
        return "Mensaje de coaching personalizado para {$type}";
    }

    private function getMessagePriority(string $type): string
    {
        $priorities = [
            'daily_summary' => 'medium',
            'progress_check' => 'medium',
            'difficult_day' => 'high',
            'craving_sos' => 'high',
            'social_situation' => 'medium'
        ];

        return $priorities[$type] ?? 'medium';
    }

    private function evaluateAdherence($summary, $userProfile): array
    {
        $calorieDiff = abs($summary->total_calories - $userProfile->daily_calorie_goal);
        $proteinDiff = abs($summary->total_protein - $userProfile->protein_goal);
        $carbsDiff = abs($summary->total_carbs - $userProfile->carbs_goal);
        $fatDiff = abs($summary->total_fat - $userProfile->fat_goal);

        $calorieTolerance = 100;
        $macroTolerance = 15;

        if ($calorieDiff <= $calorieTolerance && 
            $proteinDiff <= $macroTolerance && 
            $carbsDiff <= $macroTolerance && 
            $fatDiff <= $macroTolerance) {
            return ['status' => 'green', 'message' => 'Dentro del rango objetivo'];
        } elseif ($calorieDiff <= 200 && 
                  $proteinDiff <= 25 && 
                  $carbsDiff <= 25 && 
                  $fatDiff <= 25) {
            return ['status' => 'yellow', 'message' => 'Ligeramente fuera del rango'];
        } else {
            return ['status' => 'red', 'message' => 'Significativamente fuera del rango'];
        }
    }
}