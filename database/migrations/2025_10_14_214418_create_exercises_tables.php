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
        // Tabla para cachear ejercicios de la API
        Schema::dropIfExists('exercises');

        Schema::create('exercises', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('type'); // cardio, strength, etc.
            $table->string('muscle'); // biceps, chest, etc.
            $table->string('equipment')->nullable();
            $table->string('difficulty'); // beginner, intermediate, expert
            $table->text('instructions');
            $table->string('image_url')->nullable(); // Para guardar URLs de imágenes
            $table->integer('calories_per_minute')->default(5); // Estimación de calorías quemadas por minuto
            $table->timestamps();
        });

        // Tabla para historial de ejercicios del usuario
        Schema::dropIfExists('user_exercises');

        Schema::create('user_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('exercise_id')->constrained()->onDelete('cascade');
            $table->date('exercise_date');
            $table->integer('duration_minutes'); // Duración del ejercicio
            $table->integer('calories_burned'); // Calorías quemadas
            $table->text('notes')->nullable();
            $table->timestamps();

            // Índices para consultas rápidas
            $table->index(['user_id', 'exercise_date']);
            $table->index(['user_id', 'exercise_id']);
        });

        // Tabla para tracking de grupos musculares trabajados
        Schema::dropIfExists('user_muscle_fatigue');

        Schema::create('user_muscle_fatigue', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('muscle_group');
            $table->date('last_worked_date');
            $table->integer('intensity_level')->default(1); // 1-5
            $table->timestamps();

            // Único por usuario y grupo muscular
            $table->unique(['user_id', 'muscle_group']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_muscle_fatigue');
        Schema::dropIfExists('user_exercises');
        Schema::dropIfExists('exercises');
    }
};
