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
        Schema::create('exercise_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('exercise_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->integer('duration_minutes'); // duración real del ejercicio
            $table->decimal('calories_burned', 8, 2); // calorías quemadas calculadas
            $table->integer('intensity')->default(5); // 1-10, intensidad percibida
            $table->text('notes')->nullable(); // notas del usuario
            $table->enum('status', ['planned', 'in_progress', 'completed', 'skipped'])->default('planned');
            $table->timestamps();

            $table->index(['user_id', 'date']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exercise_logs');
    }
};
