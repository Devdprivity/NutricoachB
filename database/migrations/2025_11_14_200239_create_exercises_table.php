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
        if (!Schema::hasTable('exercises')) {
            Schema::create('exercises', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description');
                $table->enum('category', ['cardio', 'strength', 'flexibility', 'balance', 'sports'])->default('cardio');
                $table->enum('difficulty', ['beginner', 'intermediate', 'advanced'])->default('beginner');
                $table->decimal('calories_per_minute', 5, 2); // calorías quemadas por minuto
                $table->string('image_url')->nullable(); // URL de imagen de demostración
                $table->string('video_url')->nullable(); // URL de video de YouTube/Vimeo
                $table->text('muscles_worked')->nullable(); // JSON con músculos trabajados
                $table->text('instructions')->nullable(); // Instrucciones paso a paso
                $table->text('equipment')->nullable(); // Equipamiento necesario
                $table->integer('duration_minutes')->default(30); // Duración sugerida
                $table->timestamps();

                $table->index('category');
                $table->index('difficulty');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exercises');
    }
};
