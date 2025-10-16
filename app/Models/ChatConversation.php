<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatConversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'user_message',
        'ai_response',
        'sentiment',
        'sentiment_confidence',
        'context_data',
        'follow_up_suggestions',
        'message_type',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'context_data' => 'array',
        'follow_up_suggestions' => 'array',
        'sentiment_confidence' => 'decimal:2',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    /**
     * Relación con el usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope para conversaciones de un usuario específico
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope para conversaciones de una sesión específica
     */
    public function scopeForSession($query, $sessionId)
    {
        return $query->where('session_id', $sessionId);
    }

    /**
     * Scope para mensajes no leídos
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope para mensajes leídos
     */
    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    /**
     * Scope para un tipo específico de mensaje
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('message_type', $type);
    }

    /**
     * Scope para mensajes recientes
     */
    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope para mensajes por sentimiento
     */
    public function scopeBySentiment($query, $sentiment)
    {
        return $query->where('sentiment', $sentiment);
    }

    /**
     * Marcar como leído
     */
    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now()
        ]);
    }

    /**
     * Obtener conversación completa de una sesión
     */
    public static function getSessionConversation($sessionId, $userId)
    {
        return self::forSession($sessionId)
            ->forUser($userId)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Obtener últimas conversaciones del usuario
     */
    public static function getRecentConversations($userId, $limit = 20)
    {
        return self::forUser($userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Obtener estadísticas de conversación
     */
    public static function getConversationStats($userId, $days = 30)
    {
        $startDate = now()->subDays($days);
        
        return self::forUser($userId)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('
                COUNT(*) as total_messages,
                COUNT(DISTINCT session_id) as total_sessions,
                AVG(sentiment_confidence) as avg_confidence,
                SUM(CASE WHEN sentiment = "positive" THEN 1 ELSE 0 END) as positive_messages,
                SUM(CASE WHEN sentiment = "negative" THEN 1 ELSE 0 END) as negative_messages,
                SUM(CASE WHEN sentiment = "stressed" THEN 1 ELSE 0 END) as stressed_messages,
                SUM(CASE WHEN sentiment = "neutral" THEN 1 ELSE 0 END) as neutral_messages
            ')
            ->first();
    }

    /**
     * Obtener mensajes recientes para contexto
     */
    public static function getRecentMessagesForContext($userId, $limit = 5)
    {
        return self::forUser($userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->pluck('user_message')
            ->toArray();
    }

    /**
     * Crear nueva conversación
     */
    public static function createConversation(array $data): self
    {
        return self::create([
            'user_id' => $data['user_id'],
            'session_id' => $data['session_id'] ?? uniqid('chat_'),
            'user_message' => $data['user_message'],
            'ai_response' => $data['ai_response'],
            'sentiment' => $data['sentiment'] ?? 'neutral',
            'sentiment_confidence' => $data['sentiment_confidence'] ?? 0.5,
            'context_data' => $data['context_data'] ?? [],
            'follow_up_suggestions' => $data['follow_up_suggestions'] ?? [],
            'message_type' => $data['message_type'] ?? 'general',
            'is_read' => false,
        ]);
    }

    /**
     * Obtener sugerencias de seguimiento más populares
     */
    public static function getPopularFollowUpSuggestions($userId, $limit = 10)
    {
        $suggestions = self::forUser($userId)
            ->whereNotNull('follow_up_suggestions')
            ->get()
            ->pluck('follow_up_suggestions')
            ->flatten()
            ->countBy()
            ->sortDesc()
            ->take($limit);

        return $suggestions->keys()->toArray();
    }

    /**
     * Obtener patrones de conversación
     */
    public static function getConversationPatterns($userId, $days = 30)
    {
        $startDate = now()->subDays($days);
        
        return self::forUser($userId)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('
                DATE(created_at) as date,
                COUNT(*) as messages_count,
                AVG(sentiment_confidence) as avg_confidence,
                COUNT(CASE WHEN sentiment = "positive" THEN 1 END) as positive_count,
                COUNT(CASE WHEN sentiment = "negative" THEN 1 END) as negative_count,
                COUNT(CASE WHEN sentiment = "stressed" THEN 1 END) as stressed_count
            ')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->get();
    }
}
