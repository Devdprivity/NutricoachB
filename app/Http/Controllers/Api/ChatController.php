<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatConversation;
use App\Services\GeminiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    private GeminiService $geminiService;

    public function __construct(GeminiService $geminiService)
    {
        $this->geminiService = $geminiService;
    }

    /**
     * Enviar mensaje al chat y obtener respuesta de Gemini
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'session_id' => 'nullable|string',
            'message_type' => 'nullable|string|in:general,nutrition,exercise,emotional,social,progress'
        ]);

        $user = auth()->user();
        $userMessage = $request->input('message');
        $sessionId = $request->input('session_id', $this->generateSessionId());
        $messageType = $request->input('message_type', 'general');

        try {
            // Obtener mensajes recientes para contexto
            $recentMessages = ChatConversation::getRecentMessagesForContext($user->id, 5);
            
            // Preparar contexto adicional
            $additionalContext = [
                'recent_messages' => $recentMessages,
                'session_id' => $sessionId,
                'message_type' => $messageType
            ];

            // Enviar mensaje a Gemini
            $geminiResponse = $this->geminiService->sendMessage($userMessage, $user, $additionalContext);

            if (!$geminiResponse['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al procesar el mensaje',
                    'error' => $geminiResponse['error'] ?? 'Unknown error'
                ], 500);
            }

            // Analizar sentimiento del mensaje del usuario
            $sentimentAnalysis = $this->geminiService->analyzeSentiment($userMessage);

            // Generar sugerencias de seguimiento
            $followUpSuggestions = $this->geminiService->generateFollowUpSuggestions(
                $userMessage, 
                $geminiResponse['context_used']
            );

            // Guardar conversación en la base de datos
            $conversation = ChatConversation::createConversation([
                'user_id' => $user->id,
                'session_id' => $sessionId,
                'user_message' => $userMessage,
                'ai_response' => $geminiResponse['response'],
                'sentiment' => $sentimentAnalysis['sentiment'],
                'sentiment_confidence' => $sentimentAnalysis['confidence'],
                'context_data' => $geminiResponse['context_used'],
                'follow_up_suggestions' => $followUpSuggestions,
                'message_type' => $messageType
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Mensaje procesado exitosamente',
                'data' => [
                    'conversation_id' => $conversation->id,
                    'session_id' => $sessionId,
                    'ai_response' => $geminiResponse['response'],
                    'sentiment' => $sentimentAnalysis['sentiment'],
                    'sentiment_confidence' => $sentimentAnalysis['confidence'],
                    'follow_up_suggestions' => $followUpSuggestions,
                    'context_used' => $geminiResponse['context_used']
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Chat Controller Error: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'message' => $userMessage,
                'session_id' => $sessionId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => 'INTERNAL_ERROR'
            ], 500);
        }
    }

    /**
     * Obtener historial de conversaciones
     */
    public function getConversations(Request $request): JsonResponse
    {
        $user = auth()->user();
        
        $query = ChatConversation::forUser($user->id)->orderBy('created_at', 'desc');

        // Filtros opcionales
        if ($request->has('session_id')) {
            $query->forSession($request->session_id);
        }

        if ($request->has('message_type')) {
            $query->ofType($request->message_type);
        }

        if ($request->has('sentiment')) {
            $query->bySentiment($request->sentiment);
        }

        if ($request->has('unread_only') && $request->unread_only) {
            $query->unread();
        }

        $perPage = $request->get('per_page', 20);
        $conversations = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Conversaciones obtenidas exitosamente',
            'data' => $conversations
        ]);
    }

    /**
     * Obtener conversación de una sesión específica
     */
    public function getSessionConversation(Request $request, string $sessionId): JsonResponse
    {
        $user = auth()->user();
        
        $conversations = ChatConversation::getSessionConversation($sessionId, $user->id);

        if ($conversations->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Sesión no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Conversación de sesión obtenida exitosamente',
            'data' => [
                'session_id' => $sessionId,
                'conversations' => $conversations,
                'total_messages' => $conversations->count()
            ]
        ]);
    }

    /**
     * Marcar conversación como leída
     */
    public function markAsRead(ChatConversation $conversation): JsonResponse
    {
        if ($conversation->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado'
            ], 403);
        }

        $conversation->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Conversación marcada como leída exitosamente'
        ]);
    }

    /**
     * Obtener estadísticas de conversación
     */
    public function getConversationStats(Request $request): JsonResponse
    {
        $user = auth()->user();
        $days = $request->get('days', 30);

        $stats = ChatConversation::getConversationStats($user->id, $days);
        $patterns = ChatConversation::getConversationPatterns($user->id, $days);
        $popularSuggestions = ChatConversation::getPopularFollowUpSuggestions($user->id, 10);

        return response()->json([
            'success' => true,
            'message' => 'Estadísticas obtenidas exitosamente',
            'data' => [
                'stats' => $stats,
                'patterns' => $patterns,
                'popular_suggestions' => $popularSuggestions,
                'period_days' => $days
            ]
        ]);
    }

    /**
     * Obtener sugerencias de seguimiento populares
     */
    public function getFollowUpSuggestions(Request $request): JsonResponse
    {
        $user = auth()->user();
        $limit = $request->get('limit', 10);

        $suggestions = ChatConversation::getPopularFollowUpSuggestions($user->id, $limit);

        return response()->json([
            'success' => true,
            'message' => 'Sugerencias obtenidas exitosamente',
            'data' => [
                'suggestions' => $suggestions,
                'limit' => $limit
            ]
        ]);
    }

    /**
     * Crear nueva sesión de chat
     */
    public function createSession(Request $request): JsonResponse
    {
        $user = auth()->user();
        $sessionId = $this->generateSessionId();
        
        // Opcional: crear un mensaje de bienvenida
        $welcomeMessage = "¡Hola {$user->name}! Soy NutriCoach Luis, tu asistente nutricional personal. ¿En qué puedo ayudarte hoy?";
        
        $conversation = ChatConversation::createConversation([
            'user_id' => $user->id,
            'session_id' => $sessionId,
            'user_message' => 'Inicio de sesión',
            'ai_response' => $welcomeMessage,
            'sentiment' => 'positive',
            'sentiment_confidence' => 1.0,
            'context_data' => ['session_start' => true],
            'follow_up_suggestions' => [
                '¿Cómo te sientes hoy?',
                '¿Quieres revisar tu progreso nutricional?',
                '¿Necesitas ayuda con algún antojo?'
            ],
            'message_type' => 'session_start'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Nueva sesión creada exitosamente',
            'data' => [
                'session_id' => $sessionId,
                'welcome_message' => $welcomeMessage,
                'follow_up_suggestions' => $conversation->follow_up_suggestions
            ]
        ]);
    }

    /**
     * Obtener contexto del usuario para el chat
     */
    public function getUserContext(Request $request): JsonResponse
    {
        $user = auth()->user();
        
        // Preparar contexto usando el servicio de Gemini
        $context = $this->geminiService->prepareUserContext($user);
        
        return response()->json([
            'success' => true,
            'message' => 'Contexto obtenido exitosamente',
            'data' => $context
        ]);
    }

    /**
     * Generar ID único para sesión
     */
    private function generateSessionId(): string
    {
        return 'chat_' . time() . '_' . Str::random(8);
    }

    /**
     * Obtener conversaciones recientes para contexto
     */
    public function getRecentContext(Request $request): JsonResponse
    {
        $user = auth()->user();
        $limit = $request->get('limit', 5);

        $recentMessages = ChatConversation::getRecentMessagesForContext($user->id, $limit);

        return response()->json([
            'success' => true,
            'message' => 'Contexto reciente obtenido exitosamente',
            'data' => [
                'recent_messages' => $recentMessages,
                'limit' => $limit
            ]
        ]);
    }
}
