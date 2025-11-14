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
        Schema::create('user_coaching_contexts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->json('nutrition_summary')->nullable(); // Resumen de nutrición reciente
            $table->json('exercise_summary')->nullable(); // Resumen de ejercicios recientes
            $table->json('hydration_summary')->nullable(); // Resumen de hidratación reciente
            $table->json('goals')->nullable(); // Objetivos del usuario
            $table->json('preferences')->nullable(); // Preferencias de coaching
            $table->text('last_coaching_summary')->nullable(); // Último resumen de coaching
            $table->timestamp('last_updated_at')->nullable();
            $table->timestamps();
        });

        // Tabla para conversaciones de coaching
        Schema::create('coaching_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('message');
            $table->enum('role', ['user', 'assistant']); // quien envió el mensaje
            $table->json('context_snapshot')->nullable(); // snapshot del contexto en ese momento
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coaching_conversations');
        Schema::dropIfExists('user_coaching_contexts');
    }
};
