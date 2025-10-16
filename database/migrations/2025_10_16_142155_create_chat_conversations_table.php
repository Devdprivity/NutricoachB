<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chat_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('session_id')->index(); // Para agrupar conversaciones por sesión
            $table->text('user_message'); // Mensaje del usuario
            $table->text('ai_response'); // Respuesta de Gemini
            $table->string('sentiment')->default('neutral'); // positive, negative, neutral, stressed
            $table->decimal('sentiment_confidence', 3, 2)->default(0.50); // Confianza del análisis de sentimiento
            $table->json('context_data')->nullable(); // Datos de contexto utilizados
            $table->json('follow_up_suggestions')->nullable(); // Sugerencias de seguimiento
            $table->string('message_type')->default('general'); // general, nutrition, exercise, emotional, etc.
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            // Índices para optimizar consultas
            $table->index(['user_id', 'created_at']);
            $table->index(['session_id', 'created_at']);
            $table->index(['sentiment', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_conversations');
    }
};
