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
        Schema::create('inactivity_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Tipo de inactividad detectada
            $table->enum('type', [
                'hydration_inactivity',
                'meal_inactivity',
                'exercise_inactivity',
                'general_inactivity',
                'streak_broken'
            ]);

            // Severidad de la alerta
            $table->enum('severity', ['info', 'warning', 'critical'])->default('info');

            // Días de inactividad
            $table->integer('days_inactive')->default(0);

            // Última actividad detectada
            $table->date('last_activity_date')->nullable();

            // Mensaje motivacional personalizado
            $table->text('message');

            // Acción sugerida
            $table->string('action_suggested')->nullable();

            // Estado de resolución
            $table->boolean('is_resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();

            // Metadatos adicionales (JSON)
            $table->json('metadata')->nullable();

            $table->timestamps();

            // Índices para optimizar búsquedas
            $table->index(['user_id', 'type', 'is_resolved']);
            $table->index(['user_id', 'severity']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inactivity_alerts');
    }
};
