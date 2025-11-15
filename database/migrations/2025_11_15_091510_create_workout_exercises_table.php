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
        Schema::create('workout_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workout_plan_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('muscle_group')->nullable(); // pecho, espalda, piernas, hombros, brazos, core, cardio
            $table->integer('sets')->default(3);
            $table->integer('reps')->nullable(); // Repeticiones por set
            $table->integer('duration_seconds')->nullable(); // Para ejercicios de tiempo (plancha, etc)
            $table->decimal('weight_kg', 8, 2)->nullable(); // Peso sugerido
            $table->integer('rest_seconds')->default(60); // Descanso entre sets
            $table->integer('order')->default(0); // Orden en el plan
            $table->string('video_url')->nullable();
            $table->string('image_url')->nullable();
            $table->json('instructions')->nullable(); // Pasos detallados
            $table->timestamps();

            $table->index(['workout_plan_id', 'order']);
            $table->index('muscle_group');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workout_exercises');
    }
};
