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
        Schema::dropIfExists('user_contexts');

        Schema::create('user_contexts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->enum('context_type', ['stressful_day', 'weekend', 'illness', 'travel', 'social_event', 'work_pressure', 'emotional_state']);
            $table->string('description')->nullable();
            $table->integer('stress_level')->nullable(); // 1-10 escala
            $table->integer('energy_level')->nullable(); // 1-10 escala
            $table->integer('mood_level')->nullable(); // 1-10 escala
            $table->json('additional_data')->nullable(); // datos adicionales específicos del contexto
            $table->boolean('affects_nutrition')->default(true); // si afecta las recomendaciones nutricionales
            $table->timestamps();
            
            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'context_type', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_contexts');
    }
};