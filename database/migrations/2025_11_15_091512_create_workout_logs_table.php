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
        Schema::create('workout_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('workout_plan_id')->constrained()->onDelete('cascade');
            $table->foreignId('workout_exercise_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->integer('sets_completed')->default(0);
            $table->integer('reps_completed')->nullable();
            $table->decimal('weight_used_kg', 8, 2)->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->text('notes')->nullable();
            $table->enum('difficulty_felt', ['easy', 'medium', 'hard'])->nullable();
            $table->boolean('completed')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'date']);
            $table->index(['workout_plan_id', 'date']);
            $table->index('workout_exercise_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workout_logs');
    }
};
